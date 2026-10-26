"""Check actual opaque artwork pixels against the independent colour audit."""
import json,math
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1]
audit=json.loads((root/'tests/fixtures/crest-palette-audit.json').read_text())
for key,entry in audit.items():
 im=Image.open(root/'public/assets/clubs'/f'{key}.webp').convert('RGBA')
 assert im.size==(256,294) and im.getpixel((0,0))[3]==0,key
 pixels=[p[:3] for p in im.getdata() if p[3]>230]
 assert pixels,key
 fractions=[]
 for color in entry['colors']:
  rgb=tuple(int(color[i:i+2],16) for i in (1,3,5))
  fraction=sum(math.dist(p,rgb)<70 for p in pixels)/len(pixels)
  assert fraction>0.04,(key,color,round(fraction,3))
  fractions.append(round(fraction,2))
 print(key,entry['name'],fractions)
print('20 corrected crests contain their independently audited colours')
