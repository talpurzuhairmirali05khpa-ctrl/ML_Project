import numpy as np, collections, warnings; warnings.filterwarnings('ignore')
from common import load
from sklearn.model_selection import StratifiedGroupKFold
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier, HistGradientBoostingClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import accuracy_score, f1_score
meta,F,X,y,g=load()
print('images',len(y),'| duplicate groups',len(set(g)),'| images removed-by-grouping (dupes):',len(y)-len(set(g)))
print('flagged non-snake by extractor OOD:',sum(1 for f in F if not f['isSnake']),'/',len(F))
print(collections.Counter(y))
# hold-out TEST split (grouped so duplicates never straddle train/test): 1 fold of 5 = 20%
skf=StratifiedGroupKFold(n_splits=5,shuffle=True,random_state=42)
tr,te=next(skf.split(X,y,g)); np.save('test_idx.npy',te); np.save('train_idx.npy',tr)
Xtr,ytr,gtr=X[tr],y[tr],g[tr]; print('train',len(tr),'test',len(te))
models={
 'LogReg':make_pipeline(StandardScaler(),LogisticRegression(C=1,max_iter=2000)),
 'kNN(k=7)':make_pipeline(StandardScaler(),KNeighborsClassifier(7,weights='distance')),
 'SVM-RBF':make_pipeline(StandardScaler(),SVC(C=10,gamma='scale')),
 'RandForest':RandomForestClassifier(300,random_state=0,n_jobs=1,class_weight='balanced'),
 'ExtraTrees':ExtraTreesClassifier(400,random_state=0,n_jobs=1,class_weight='balanced'),
 'HistGB':HistGradientBoostingClassifier(max_iter=150,learning_rate=0.08,random_state=0),
 'MLP':make_pipeline(StandardScaler(),MLPClassifier((128,64),max_iter=600,random_state=0,early_stopping=True)),
}
cv=StratifiedGroupKFold(n_splits=4,shuffle=True,random_state=1)
print('\n5-model 4-fold grouped CV on TRAIN only (28-D app features):')
for name,m in models.items():
    accs=[];f1s=[]
    for a,b in cv.split(Xtr,ytr,gtr):
        m.fit(Xtr[a],ytr[a]); p=m.predict(Xtr[b]); accs.append(accuracy_score(ytr[b],p)); f1s.append(f1_score(ytr[b],p,average='macro'))
    print(f'  {name:11s} acc={np.mean(accs):.3f} ±{np.std(accs):.3f}  macroF1={np.mean(f1s):.3f}')
print('majority-class baseline:',max(collections.Counter(ytr).values())/len(ytr))
