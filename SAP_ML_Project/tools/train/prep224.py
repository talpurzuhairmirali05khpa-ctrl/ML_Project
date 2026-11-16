import json, numpy as np
from PIL import Image, ImageFile
ImageFile.LOAD_TRUNCATED_IMAGES=True
ROOT='/tmp/isd_x/Indian-Snakes-Dataset-master'
meta=json.load(open('manifest.json'))
arr=np.lib.format.open_memmap('img224.npy',mode='w+',dtype=np.uint8,shape=(len(meta),224,224,3))
for i,m in enumerate(meta):
    im=Image.open(f"{ROOT}/{m['path']}")
    if im.format=='JPEG': im.draft('RGB',(900,900))
    im=im.convert('RGB'); w,h=im.size; s=min(w,h); l=(w-s)//2; t=(h-s)//2
    arr[i]=np.asarray(im.crop((l,t,l+s,t+s)).resize((224,224),Image.BILINEAR))
    if i%300==0: print(i,flush=True)
arr.flush(); print('DONE')
