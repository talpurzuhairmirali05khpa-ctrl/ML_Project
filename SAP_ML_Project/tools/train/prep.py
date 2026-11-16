"""Step 1: decode every dataset image, de-duplicate, center-crop to square, resize to 200x200 RGBA (same geometry as the app's canvas step)."""
import os, json, hashlib, sys, numpy as np
from PIL import Image, ImageFile
ImageFile.LOAD_TRUNCATED_IMAGES = True
ROOT = '/tmp/isd_x/Indian-Snakes-Dataset-master'
SPECIES = {  # folder -> (id, scientific name, venomous)
 'Venomous/Common Krait':('bungarus-caeruleus','Bungarus caeruleus',True),
 'Venomous/King Cobra':('ophiophagus-hannah','Ophiophagus hannah',True),
 'Venomous/Monocled Cobra':('naja-kaouthia','Naja kaouthia',True),
 "Venomous/Russell's Viper":('daboia-russelii','Daboia russelii',True),
 'Venomous/Saw-scaled Viper':('echis-carinatus','Echis carinatus',True),
 'Venomous/Spectacled Cobra':('naja-naja','Naja naja',True),
 'Non-Venomous/Banded Racer':('argyrogena-fasciolata','Argyrogena fasciolata',False),
 'Non-Venomous/Checkered Keelback':('fowlea-piscator','Fowlea piscator',False),
 'Non-Venomous/Common Rat Snake':('ptyas-mucosa','Ptyas mucosa',False),
 'Non-Venomous/Common Sand Boa':('gongylophis-conicus','Gongylophis conicus',False),
 'Non-Venomous/Common Trinket':('coelognathus-helena','Coelognathus helena',False),
 'Non-Venomous/Green Tree Vine':('ahaetulla-nasuta','Ahaetulla nasuta',False),
 'Non-Venomous/Indian Rock Python':('python-molurus','Python molurus',False),
}
items=[]; 
for folder,(sid,sci,ven) in SPECIES.items():
    for f in sorted(os.listdir(f'{ROOT}/{folder}')):
        p=f'{ROOT}/{folder}/{f}'
        if os.path.isfile(p): items.append((sid,p))
print('total files',len(items),flush=True)
out=open('images.bin','wb'); meta=[]; bad=0; seen_md5={}; hashes=[]
def dhash(im):
    g=np.asarray(im.convert('L').resize((9,8),Image.BILINEAR),dtype=np.int16)
    return (g[:,1:]>g[:,:-1]).flatten()
for i,(sid,p) in enumerate(items):
    try:
        raw=open(p,'rb').read(); md5=hashlib.md5(raw).hexdigest()
        im=Image.open(p)
        if im.format=='JPEG': im.draft('RGB',(800,800))
        im=im.convert('RGB')
        w,h=im.size
        if min(w,h)<64: bad+=1; continue
        dh=dhash(im)
        side=min(w,h); l=(w-side)//2; t=(h-side)//2
        sq=im.crop((l,t,l+side,t+side)).resize((200,200),Image.BILINEAR).convert('RGBA')
        out.write(sq.tobytes()); meta.append({'idx':len(meta),'species':sid,'path':p.replace(ROOT+'/',''),'md5':md5,'w':w,'h':h}); hashes.append(dh)
    except Exception as e:
        bad+=1
    if i%200==0: print(i,len(meta),bad,flush=True)
out.close()
H=np.array(hashes,dtype=np.uint8)
np.save('dhash.npy',H)
json.dump(meta,open('manifest.json','w'))
print('DONE',len(meta),'unreadable/tiny',bad,flush=True)
