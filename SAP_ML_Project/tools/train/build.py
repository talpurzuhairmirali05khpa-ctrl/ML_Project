import numpy as np, json, torch, timm, torch.nn as nn, warnings; warnings.filterwarnings('ignore')
from common import load
from scipy.optimize import minimize_scalar
from scipy.special import softmax, log_softmax
from sklearn.model_selection import StratifiedGroupKFold
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score,f1_score,precision_recall_fscore_support
torch.set_num_threads(1)
meta,_,_,y,g=load(); classes=json.load(open('classes.json')); K=len(classes); cid={c:i for i,c in enumerate(classes)}; Y=np.array([cid[c] for c in y])
VEN={'bungarus-caeruleus','ophiophagus-hannah','naja-kaouthia','daboia-russelii','echis-carinatus','naja-naja'}
FAM={'daboia-russelii':0,'echis-carinatus':0,'bungarus-caeruleus':1,'ophiophagus-hannah':1,'naja-kaouthia':1,'naja-naja':1}
isven=np.array([c in VEN for c in classes]); tri=np.array([FAM.get(c,2) for c in classes])
tr=np.load('train_idx.npy'); te=np.load('test_idx.npy')
Eo=np.load('emb_orig_eb0.npy'); Ef=np.load('emb_flip_eb0.npy'); C=0.02
def fit(idx):
    sc=StandardScaler().fit(np.vstack([Eo[idx],Ef[idx]])); lr=LogisticRegression(C=C,max_iter=4000).fit(sc.transform(np.vstack([Eo[idx],Ef[idx]])),np.concatenate([Y[idx],Y[idx]]))
    return sc,lr
def logit(sc,lr,idx): return (lr.decision_function(sc.transform(Eo[idx]))+lr.decision_function(sc.transform(Ef[idx])))/2   # flip-TTA
# ---- out-of-fold logits on TRAIN (for temperature + abstention tuning; test untouched)
oof=np.zeros((len(tr),K))
for a,b in StratifiedGroupKFold(4,shuffle=True,random_state=5).split(tr,Y[tr],g[tr]):
    sc,lr=fit(tr[a]); oof[b]=logit(sc,lr,tr[b])
T=minimize_scalar(lambda t:-log_softmax(oof/t,axis=1)[np.arange(len(tr)),Y[tr]].mean(),bounds=(0.3,5),method='bounded').x
print('OOF acc %.3f  temperature T=%.3f'%(accuracy_score(Y[tr],oof.argmax(1)),T))
def decide(P,tau,vm):
    top=P.argmax(1); mx=P.max(1); venmass=(P*isven).sum(1)
    return ~((mx<tau)|((~isven[top])&(venmass>vm)))      # accepted mask
# tune on OOF: smallest tau/vm giving venomous->harmless rate <=1% of venomous accepted, maximizing coverage
Po=softmax(oof/T,axis=1); best=None
for tau in np.arange(0.2,0.8,0.05):
  for vm in [0.02,0.05,0.1,0.15,0.2,0.25,0.3]:
    acc=decide(Po,tau,vm); top=Po.argmax(1); yy=Y[tr]
    vacc=acc&isven[yy]; bad=(vacc&~isven[top]).sum(); rate=bad/max(vacc.sum(),1)
    cov=acc.mean(); a_acc=(top[acc]==yy[acc]).mean() if acc.any() else 0
    if rate<=0.003 and (best is None or cov>best[0]): best=(cov,tau,vm,rate,a_acc)
print('chosen on OOF: coverage=%.2f tau=%.2f venomous-mass=%.2f ven->harmless=%.3f acc_on_accepted=%.3f'%best)
TAU,VM=float(best[1]),float(best[2])
# ---- non-snake detector: ImageNet-head snake-class probability mass (classes 52..68); threshold = 2nd percentile on TRAIN snakes
_b=timm.create_model('efficientnet_b0',pretrained=True,pretrained_cfg_overlay=dict(file='weights/effb0.pth')); _b.eval()
Wi=_b.classifier.weight.detach().numpy(); bi=_b.classifier.bias.detach().numpy()
def smass(E):
    lg=E@Wi.T+bi; p=np.exp(lg-lg.max(1,keepdims=True)); p/=p.sum(1,keepdims=True); return p[:,52:69].sum(1)
SM=(smass(Eo)+smass(Ef))/2; SNAKE_TH=float(np.percentile(SM[tr],2)); print('snake-mass threshold (2nd pct of train)=%.4f ; test snakes rejected=%.3f'%(SNAKE_TH,(SM[te]<SNAKE_TH).mean()))
# ---- final model on all TRAIN, evaluated ONCE on TEST
sc,lr=fit(tr); Lt=logit(sc,lr,te); Pt=softmax(Lt/T,axis=1); top=Pt.argmax(1); yt=Y[te]
acc=accuracy_score(yt,top); f1=f1_score(yt,top,average='macro')
cm=np.zeros((K,K),int); 
for a,b in zip(yt,top): cm[a,b]+=1
tcm=np.zeros((3,3),int)
for a,b in zip(yt,top): tcm[tri[a],tri[b]]+=1
acc_mask=decide(Pt,TAU,VM); vt=isven[yt]
print('TEST n=%d  top1 acc=%.4f macroF1=%.4f  triage(3-class) acc=%.4f'%(len(te),acc,f1,np.trace(tcm)/tcm.sum()))
print('TEST venomous-vs-harmless: sensitivity(forced)=%.3f  specificity=%.3f'%((isven[top]&vt).sum()/vt.sum(),((~isven[top])&~vt).sum()/(~vt).sum()))
print('TEST with abstention: coverage=%.3f acc_on_accepted=%.3f  venomous accepted-as-harmless=%d of %d venomous  abstained venomous=%d'%(acc_mask.mean(),(top[acc_mask]==yt[acc_mask]).mean(),((vt&acc_mask)&~isven[top]).sum(),vt.sum(),(vt&~acc_mask).sum()))
p,r,f,s=precision_recall_fscore_support(yt,top,labels=range(K),zero_division=0)
for i,c in enumerate(classes): print(f'  {c:24s} n={s[i]:3d} precision={p[i]:.2f} recall={r[i]:.2f} f1={f[i]:.2f}')
curve=[]
for th in [0.3,0.4,0.5,0.6,0.7,0.8]:
    m=Pt.max(1)>=th; curve.append(dict(threshold=th,coveragePct=round(100*m.mean(),1),accuracyPct=round(100*(top[m]==yt[m]).mean(),1) if m.any() else 0,acceptedSamples=int(m.sum()),rejectedSamples=int((~m).sum())))
json.dump(dict(classes=classes,isVenomous=isven.tolist(),triage=tri.tolist(),temperature=float(T),tau=TAU,venomMassMax=VM,
  test=dict(n=int(len(te)),acc=float(acc),macroF1=float(f1),confusion=cm.tolist(),triageConfusion=tcm.tolist(),
            precision=p.round(4).tolist(),recall=r.round(4).tolist(),support=s.tolist(),rejectionCurve=curve,
            coverage=float(acc_mask.mean()),accOnAccepted=float((top[acc_mask]==yt[acc_mask]).mean()),
            venomousAsHarmless=int(((vt&acc_mask)&~isven[top]).sum()),venomousTotal=int(vt.sum()),snakeMassRejected=float((SM[te]<SNAKE_TH).mean())),snakeMassThreshold=SNAKE_TH,
  oofAcc=float(accuracy_score(Y[tr],oof.argmax(1))),trainN=int(len(tr))),open('eval.json','w'),indent=1)
# ---- ONNX: [0..1] RGB NCHW 224 -> logits/T (normalisation + scaler + head + flip-TTA all inside graph)
base=timm.create_model('efficientnet_b0',pretrained=True,pretrained_cfg_overlay=dict(file='weights/effb0.pth')); base.eval()
class Net(nn.Module):
    def __init__(s):
        super().__init__(); s.base=base
        s.register_buffer('mean',torch.tensor([0.485,0.456,0.406]).view(1,3,1,1)); s.register_buffer('std',torch.tensor([0.229,0.224,0.225]).view(1,3,1,1))
        W=lr.coef_/sc.scale_[None,:]; b=lr.intercept_-(lr.coef_*(sc.mean_/sc.scale_)[None,:]).sum(1)
        s.fc=nn.Linear(1280,K); s.fc.weight.data=torch.tensor(W,dtype=torch.float32); s.fc.bias.data=torch.tensor(b,dtype=torch.float32); s.T=float(T)
    def emb(s,x): return s.base.forward_head(s.base.forward_features((x-s.mean)/s.std),pre_logits=True)
    def sm(s,e): return torch.softmax(s.base.classifier(e),1)[:,52:69].sum(1,keepdim=True)
    def forward(s,x):
        e1=s.emb(x); e2=s.emb(torch.flip(x,[3]))
        return (s.fc(e1)+s.fc(e2))/2/s.T, (s.sm(e1)+s.sm(e2))/2
net=Net().eval()
x=torch.rand(2,3,224,224)
with torch.no_grad(): ref=net(x)[0].numpy()
torch.onnx.export(net,x[:1],'snake_effb0.onnx',input_names=['image'],output_names=['logits','snake_mass'],dynamic_axes={'image':{0:'batch'},'logits':{0:'batch'},'snake_mass':{0:'batch'}},opset_version=17,dynamo=False)
import onnxruntime as ort
o=ort.InferenceSession('snake_effb0.onnx').run(None,{'image':x.numpy()})[0]; print('ONNX vs torch max abs diff:',float(np.abs(o-ref).max()))
# parity vs sklearn pipeline on real test images
X=np.load('img224.npy',mmap_mode='r'); xb=np.stack([X[i] for i in te[:16]]).transpose(0,3,1,2).astype(np.float32)/255.
oo=ort.InferenceSession('snake_effb0.onnx').run(None,{'image':xb})[0]; print('ONNX vs sklearn-head argmax agreement on 16 test imgs:',(oo.argmax(1)==top[:16]).mean(),' max prob diff:',float(np.abs(softmax(oo,axis=1)-Pt[:16]).max()))
