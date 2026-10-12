"""Compile Natural Earth populated-place centers for illustrative shop pins."""
import json, re, sys, unicodedata
from pathlib import Path
places=json.loads(Path(sys.argv[1]).read_text())['features']
catalog=Path('src/data/shops.ts').read_text().split('const cities:')[1].split('const palettes')[0]
def norm(s):return ''.join(c for c in unicodedata.normalize('NFD',s.lower()) if c.isalnum())
aliases={'Cluj':'Cluj-Napoca','Esch':'Esch-sur-Alzette','Košice':'Kosice','Liepāja':'Liepaja','Chișinău':'Chisinau','Bălți':'Balti','Kraków':'Krakow'}
result={}; missing=[]
for iso, names in re.findall(r'(\w+):\s*\[([^]]+)\]',catalog):
 for city in re.findall(r"'([^']+)'",names):
  wanted=norm(aliases.get(city,city))
  candidates=[f for f in places if f['properties']['iso_a2']==iso or iso in ['KOS','XK'] and f['properties']['adm0name']=='Kosovo']
  found=next((f for f in candidates if wanted in [norm(f['properties'].get(k) or '') for k in ['name','nameascii','namealt']]),None)
  if found:
   lon,lat=found['geometry']['coordinates'];result[f'{iso}-{city}']=[round((lon+25)*11.8,1),round((73-lat)*17,1)]
  else:missing.append(f'{iso}-{city}')
Path('src/data/city-points.json').write_text(json.dumps(result,ensure_ascii=False,separators=(',',':'))+'\n')
print(len(result),'city points compiled; use approximate district pins for:',', '.join(missing))
