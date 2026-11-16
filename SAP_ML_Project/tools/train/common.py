import json, numpy as np
def load(featfile='features28.json'):
    meta=json.load(open('manifest.json')); F=json.load(open(featfile)); H=np.load('dhash.npy')
    X=np.array([f['v'] for f in F],dtype=np.float64); n=len(meta)
    # --- duplicate groups (exact md5 OR near-identical dHash, hamming<=6), across ALL classes ---
    parent=list(range(n))
    def find(a):
        while parent[a]!=a: parent[a]=parent[parent[a]]; a=parent[a]
        return a
    md5={}
    for i,m in enumerate(meta):
        if m['md5'] in md5: parent[find(i)]=find(md5[m['md5']])
        else: md5[m['md5']]=i
    Hb=H.astype(np.int8)
    for i in range(n):
        d=(Hb[i+1:]!=Hb[i]).sum(1)
        for j in np.where(d<=6)[0]: parent[find(i)]=find(i+1+j)
    groups=np.array([find(i) for i in range(n)])
    species=np.array([m['species'] for m in meta])
    return meta,F,X,species,groups
