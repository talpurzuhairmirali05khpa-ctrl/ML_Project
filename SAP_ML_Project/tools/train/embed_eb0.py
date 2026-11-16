import numpy as np, torch, timm, json, time
torch.set_num_threads(1)
m=timm.create_model('efficientnet_b0',pretrained=True,pretrained_cfg_overlay=dict(file='weights/effb0.pth'))
m.eval()
mean=torch.tensor([0.485,0.456,0.406]).view(1,3,1,1); std=torch.tensor([0.229,0.224,0.225]).view(1,3,1,1)
X=np.load('img224.npy',mmap_mode='r'); n=len(X)
def prep(b): return ((torch.from_numpy(np.ascontiguousarray(b)).permute(0,3,1,2).float()/255.)-mean)/std
# sanity: ImageNet top-1 on 3 sample images (snake classes are ImageNet idx 52..68)
meta=json.load(open('manifest.json'))
with torch.no_grad():
    for i in [0,300,900,1400]:
        lg=m(prep(X[i:i+1])); print(meta[i]['species'],'-> imagenet top1 idx',int(lg.argmax()), flush=True)
    feats=[];feats_f=[]; t0=time.time()
    for s in range(0,n,32):
        b=prep(X[s:s+32])
        feats.append(m.forward_head(m.forward_features(b),pre_logits=True).numpy())
        feats_f.append(m.forward_head(m.forward_features(torch.flip(b,[3])),pre_logits=True).numpy())
        if s%320==0: print(s,n,round(time.time()-t0),'s',flush=True)
np.save('emb_orig_eb0.npy',np.concatenate(feats)); np.save('emb_flip_eb0.npy',np.concatenate(feats_f)); print('DONE',np.concatenate(feats).shape)
