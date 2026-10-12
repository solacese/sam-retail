"""Compile the public-domain Natural Earth 110m countries into small SVG paths.
Input: ne_110m_admin_0_countries.geojson from nvkelso/natural-earth-vector.
"""
import json, math, sys
from pathlib import Path
source=json.loads(Path(sys.argv[1]).read_text())
def project(p): return [(p[0]+25)*11.8, (73-p[1])*17]
def clip(poly, axis, value, greater):
 out=[]
 if not poly:return out
 prev=poly[-1]; prev_in=(prev[axis]>=value if greater else prev[axis]<=value)
 for cur in poly:
  cur_in=(cur[axis]>=value if greater else cur[axis]<=value)
  if cur_in!=prev_in:
   t=(value-prev[axis])/(cur[axis]-prev[axis]); pt=[prev[i]+t*(cur[i]-prev[i]) for i in range(2)]; out.append(pt)
  if cur_in:out.append(cur)
  prev,prev_in=cur,cur_in
 return out
result=[]
for f in source['features']:
 p=f['properties']; continent=p['CONTINENT']; name=p['NAME_EN']; active=continent=='Europe' or name in ['Turkey','Cyprus']
 if not active and name not in ['Morocco','Algeria','Tunisia']: continue
 polys=f['geometry']['coordinates'] if f['geometry']['type']=='MultiPolygon' else [f['geometry']['coordinates']]
 rings=[]
 for poly in polys:
  for ring in poly:
   pts=[list(pt[:2]) for pt in ring]
   if max(v[0] for v in pts)-min(v[0] for v in pts)>180:continue
   for axis, val, greater in [(0,-25,True),(0,45,False),(1,33,True),(1,73,False)]:pts=clip(pts,axis,val,greater)
   if len(pts)>=3:rings.append([project(pt) for pt in pts])
 if not rings:continue
 path=' '.join('M'+'L'.join(','.join(str(round(v,1)) for v in point) for point in ring)+'Z' for ring in rings)
 points=[pt for ring in rings for pt in ring]; xs=[p[0] for p in points];ys=[p[1] for p in points]
 center=project([p['LABEL_X'],p['LABEL_Y']]); center=[max(min(center[0],max(xs)),min(xs)),max(min(center[1],max(ys)),min(ys))]
 result.append({'id':p['ISO_A2_EH'] if p['ISO_A2_EH']!='-99' else p['ADM0_A3'],'name':name,'active':active,'path':path,'center':[round(v,1) for v in center],'bounds':[round(min(xs),1),round(min(ys),1),round(max(xs)-min(xs),1),round(max(ys)-min(ys),1)]})
Path('src/data/europe.json').write_text(json.dumps(sorted(result,key=lambda x:x['name']),ensure_ascii=False,separators=(',',':'))+'\n')
print(len(result),'country paths compiled')
