import numpy as np, torch, timm, json, warnings; warnings.filterwarnings('ignore')
from common import load
from skimage import data as skd
from PIL import Image
torch.set_num_threads(1)
base=timm.create_model('efficientnet_b0',pretrained=True,pretrained_cfg_overlay=dict(file='weights/effb0.pth')); base.eval()
W=base.classifier.weight.detach().numpy(); b=base.classifier.bias.detach().numpy()
SNAKE=list(range(52,69))
def mass_from_emb(E):
    lg=E@W.T+b; p=np.exp(lg-lg.max(1,keepdims=True)); p/=p.sum(1,keepdims=True); return p[:,SNAKE].sum(1)
meta,_,_,y,g=load(); tr=np.load('train_idx.npy'); te=np.load('test_idx.npy')
Eo=np.load('emb_orig_eb0.npy'); Ef=np.load('emb_flip_eb0.npy')
m=(mass_from_emb(Eo)+mass_from_emb(Ef))/2
print('snake_mass percentiles on TRAIN snakes (1,2,5,10,50):',np.percentile(m[tr],[1,2,5,10,50]).round(3))
# negatives: skimage bundled/pooch images + sklearn samples
names=['astronaut','brick','camera','cat','chelsea','coffee','coins','grass','gravel','horse','hubble_deep_field','motorcycle_left','page','rocket','text','retina','moon','clock','colorwheel','logo']
negs={}
for n in names:
    try:
        a=getattr(skd,n)()
        if a.ndim==2: a=np.stack([a]*3,-1)
        negs[n]=Image.fromarray(a[...,:3].astype(np.uint8))
    except Exception as e: pass
import glob,os,sklearn
for f in glob.glob(os.path.join(os.path.dirname(sklearn.__file__),'datasets','images','*.jpg')): negs[os.path.basename(f)]=Image.open(f).convert('RGB')
mean=torch.tensor([0.485,0.456,0.406]).view(1,3,1,1); std=torch.tensor([0.229,0.224,0.225]).view(1,3,1,1)
res={}
with torch.no_grad():
    for n,im in negs.items():
        w,h=im.size; s=min(w,h); im=im.crop(((w-s)//2,(h-s)//2,(w-s)//2+s,(h-s)//2+s)).resize((224,224),Image.BILINEAR)
        x=(torch.from_numpy(np.asarray(im).copy()).permute(2,0,1)[None].float()/255.-mean)/std
        e=torch.cat([base.forward_head(base.forward_features(x),pre_logits=True),base.forward_head(base.forward_features(torch.flip(x,[3])),pre_logits=True)]).numpy()
        res[n]=float(mass_from_emb(e).mean())
print(len(res),'negatives'); print({k:round(v,3) for k,v in sorted(res.items(),key=lambda kv:-kv[1])})
for q in [1,2,5]:
    th=np.percentile(m[tr],q); print(f'thr@{q}th pct={th:.3f}: TEST snakes rejected={(m[te]<th).mean():.3f}   negatives accepted={np.mean([v>=th for v in res.values()]):.3f}')
