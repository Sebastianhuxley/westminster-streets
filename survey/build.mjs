// Westminster survey build: EPSG:27700 input only. No runtime map requests.
// Inputs are separately licensed, independently validated GIS exports, not web tiles.
const ORIGIN = Object.freeze({e:530000,n:180000});
const SIZE=100;
const AREAS=Object.freeze({
 'st-jamess-pall-mall':[529100,179700,530200,180500],
 'piccadilly-jermyn':[528800,180100,530000,180900],
 'whitehall':[529900,179400,530500,180600],
 'park-mall':[528900,179300,530200,180500],
 'victoria-street':[528800,178800,530300,179800]
});
const TOL={position:1,alignment:1,height:1,width:.5,facade:.5};
const TYPES={building:['Polygon','MultiPolygon'],road:['LineString','MultiLineString'],carriageway:['Polygon','MultiPolygon'],pavement:['Polygon','MultiPolygon'],park:['Polygon','MultiPolygon'],water:['Polygon','MultiPolygon'],furniture:['Point','MultiPoint']};
function requireThat(ok,msg){if(!ok)throw new Error(msg);}
const finite=Number.isFinite, same=(a,b)=>a[0]===b[0]&&a[1]===b[1];
function coordinate(p){
 requireThat(Array.isArray(p)&&p.length===2&&p.every(finite),'Expected finite 2D British National Grid coordinate');
 requireThat(p[0]>520000&&p[0]<540000&&p[1]>170000&&p[1]<190000,'Coordinate outside expected central London extent; check CRS and axis order');
 return [p[0]-ORIGIN.e,ORIGIN.n-p[1]];
}
function signed(r){let a=0;for(let i=1;i<r.length;i++)a+=r[i-1][0]*r[i][1]-r[i][0]*r[i-1][1];return a/2;}
function line(c){requireThat(Array.isArray(c)&&c.length>=2,'Short line');const r=c.map(coordinate);requireThat(r.every((p,i)=>!i||!same(p,r[i-1])),'Duplicate consecutive vertices');return r;}
function ring(c){const r=line(c);requireThat(r.length>=4&&same(r[0],r.at(-1))&&Math.abs(signed(r))>.001,'Open or degenerate ring');return r;}
function polygon(c){requireThat(Array.isArray(c)&&c.length>0,'Missing exterior ring');return c.map(ring);}
function geometry(g){requireThat(g&&typeof g.type==='string','Missing geometry');let c=g.coordinates;
 switch(g.type){case 'Point':c=coordinate(c);break;case 'MultiPoint':c=c.map(coordinate);break;case 'LineString':c=line(c);break;case 'MultiLineString':c=c.map(line);break;case 'Polygon':c=polygon(c);break;case 'MultiPolygon':c=c.map(polygon);break;default:throw Error('Unsupported geometry '+g.type);}
 return {type:g.type,coordinates:c};
}
function bbox(g){const b=[Infinity,Infinity,-Infinity,-Infinity];function visit(p){if(typeof p[0]==='number'){b[0]=Math.min(b[0],p[0]);b[1]=Math.min(b[1],p[1]);b[2]=Math.max(b[2],p[0]);b[3]=Math.max(b[3],p[1]);}else p.forEach(visit);}visit(g.coordinates);requireThat(b.every(finite),'Empty geometry');return b;}
function idsFor(b){const out=[];for(let x=Math.floor(b[0]/SIZE);x<=Math.floor(b[2]/SIZE);x++)for(let z=Math.floor(b[1]/SIZE);z<=Math.floor(b[3]/SIZE);z++)out.push(x+'_'+z);return out;}
function metrics(kind){return kind==='building'?['position','height','facade']:kind==='road'?['alignment']:kind==='carriageway'||kind==='pavement'?['alignment','width']:['position'];}
function compile(input,area){
 requireThat(AREAS[area],'Unknown pilot area');
 requireThat(input.crs==='EPSG:27700'&&input.verticalDatum==='ODN','Require BNG metres and ODN height declaration');
 requireThat(Array.isArray(input.sources)&&input.sources.length,'Missing provenance');
 const sources=new Map();
 for(const s of input.sources){requireThat(s.id&&s.title&&s.url&&s.license&&s.date&&typeof s.redistributable==='boolean','Incomplete source provenance');requireThat(!sources.has(s.id),'Duplicate source id');sources.set(s.id,s);}
 const refs=input.referenceChecks||[],checksById=new Map();
 for(const c of refs){requireThat(c.featureId&&TOL[c.metric]!==undefined&&finite(c.errorM)&&c.errorM>=0&&sources.has(c.referenceSourceId)&&c.method&&Number.isInteger(c.samples)&&c.samples>0,'Invalid independent reference check');const k=c.featureId+':'+c.metric;requireThat(!checksById.has(k),'Duplicate check');checksById.set(k,c);}
 const ids=new Set(),features=[],tiles={},report={area,tolerancesM:TOL,features:0,verified:0,unverified:0,failed:0,excluded:0,byKind:{},issues:[]};
 const a=AREAS[area],range=[a[0]-ORIGIN.e,ORIGIN.n-a[3],a[2]-ORIGIN.e,ORIGIN.n-a[1]];
 for(const f of input.features||[]){
  requireThat(f.type==='Feature'&&f.properties&&f.id!=null,'Expected stable Feature id and properties');
  const p=f.properties, id=String(f.id);requireThat(!ids.has(id),'Duplicate feature '+id);ids.add(id);
  requireThat(TYPES[p.kind]?.includes(f.geometry?.type),'Wrong geometry for '+id);const source=sources.get(p.sourceId);requireThat(source,'Missing source for '+id);requireThat(['survey','mapped','estimated'].includes(p.method),'Missing method for '+id);
  const g=geometry(f.geometry),b=bbox(g);if(b[2]<range[0]||b[0]>range[2]||b[3]<range[1]||b[1]>range[3]){report.excluded++;continue;}
  requireThat(source.redistributable,'Source is not cleared for redistribution: '+source.id);
  const sourceFields={};for(const name of ['name','address','heightM','groundODN','roofODN','eavesODN','widthM','levels','material','facadeReference'])if(p[name]!=null)sourceFields[name]=p[name];
  for(const name of ['heightM','groundODN','roofODN','eavesODN','widthM','levels'])if(name in sourceFields)requireThat(finite(sourceFields[name])&&(name.endsWith('ODN')||sourceFields[name]>0),'Invalid '+name+' for '+id);
  if(p.kind==='building'&&p.heightM==null&&finite(p.roofODN)&&finite(p.groundODN)){requireThat(p.roofODN>p.groundODN,'Roof below ground '+id);sourceFields.heightM=p.roofODN-p.groundODN;}
  if(p.kind==='building'&&finite(p.roofODN)&&finite(p.groundODN)&&finite(p.heightM))requireThat(Math.abs(p.roofODN-p.groundODN-p.heightM)<=.1,'Inconsistent height '+id);
  const results={};let failed=false,missing=false;
  for(const metric of metrics(p.kind)){const c=checksById.get(id+':'+metric),hasValue=metric==='height'?finite(sourceFields.heightM):metric==='width'?finite(sourceFields.widthM):metric==='facade'?!!sourceFields.facadeReference:true;
   const valid=c&&c.referenceSourceId!==p.sourceId&&sources.get(c.referenceSourceId).redistributable&&p.method==='survey'&&hasValue;
   const state=!valid?'unverified':c.errorM<=TOL[metric]?'pass':'fail';
   results[metric]=valid?{state,errorM:c.errorM,samples:c.samples,method:c.method,referenceSourceId:c.referenceSourceId}:{state};
   if(state==='fail')failed=true;if(state==='unverified')missing=true;
  }
  const status=failed?'failed':missing?'unverified':'verified';report[status]++;report.features++;
  const k=report.byKind[p.kind]||(report.byKind[p.kind]={verified:0,unverified:0,failed:0});k[status]++;
  if(status!=='verified')report.issues.push({id,status,checks:results});
  const touched=idsFor(b),owner=touched[0];for(const t of touched){const tile=tiles[t]||(tiles[t]={owned:[],references:[]});(t===owner?tile.owned:tile.references).push(id);}
  features.push({id,kind:p.kind,sourceId:p.sourceId,method:p.method,status,checks:results,attributes:sourceFields,geometry:g,ownerTile:owner});
 }
 report.readyForReview=report.features>0&&report.failed===0&&report.unverified===0;
 // A passing supplied comparison is not a certified survey, and coverage still requires manual approval.
 return {schemaVersion:1,area,crs:'EPSG:27700',verticalDatum:'ODN',origin:ORIGIN,axes:{x:'east metres',z:'south metres'},tileSizeM:SIZE,sources:[...sources.values()].filter(s=>s.redistributable),features,tiles,report};
}
function selftest(){
 const sources=[{id:'a',title:'Synthetic survey',url:'fixture',date:'2026-01-01',license:'test',redistributable:true},{id:'b',title:'Synthetic independent reference',url:'fixture',date:'2026-01-01',license:'test',redistributable:true}];
 const b={type:'Feature',id:'b1',properties:{kind:'building',sourceId:'a',method:'survey',groundODN:10,roofODN:24,facadeReference:'fixture'},geometry:{type:'Polygon',coordinates:[[[529990,180010],[530010,180010],[530010,179990],[529990,179990],[529990,180010]],[[529995,180005],[530005,180005],[530005,179995],[529995,179995],[529995,180005]]]}};
 const r={type:'Feature',id:'r1',properties:{kind:'road',sourceId:'a',method:'mapped'},geometry:{type:'LineString',coordinates:[[529900,180030],[530000,180020],[530100,180030]]}};
 const checks=['position','height','facade'].map(metric=>({featureId:'b1',metric,errorM:.2,referenceSourceId:'b',method:'synthetic',samples:5}));
 const input={crs:'EPSG:27700',verticalDatum:'ODN',sources,features:[b,r],referenceChecks:checks};
 const o=compile(input,'st-jamess-pall-mall');requireThat(o.report.verified===1&&o.report.unverified===1&&!o.report.readyForReview,'Quality gate failed');
 requireThat(o.features[0].attributes.heightM===14&&o.features[0].geometry.coordinates.length===2,'Height or courtyard lost');
 requireThat(Object.values(o.tiles).filter(t=>t.owned.includes('b1')).length===1,'Duplicated ownership');
 requireThat(Object.values(o.tiles).filter(t=>t.references.includes('b1')).length===3,'Cross-tile references lost');
 requireThat(o.features[1].geometry.coordinates[1][1]===-20,'Axis transform wrong');
 const fail=compile({...input,referenceChecks:checks.map(c=>c.metric==='height'?{...c,errorM:2}:c)},'st-jamess-pall-mall');requireThat(fail.report.failed===1,'Tolerance failure missed');
 let bad=false;try{compile({...input,crs:'EPSG:4326'},'st-jamess-pall-mall')}catch(e){bad=true;}requireThat(bad,'Wrong CRS accepted');
 return 'PASS: metric coordinates, courtyards, height derivation, cross-tile ownership, unverified/failed gates and wrong-CRS rejection';
}

import fs from 'node:fs';
const [area,src,dest]=process.argv.slice(2);
if(area==='--self-test'){console.log(selftest());}
else{
 if(!area||!src||!dest){console.error('Usage: node survey/build.mjs AREA input.json output.json');process.exitCode=2;}
 else{const result=compile(JSON.parse(fs.readFileSync(src,'utf8')),area);fs.writeFileSync(dest,JSON.stringify(result));console.log(JSON.stringify(result.report,null,2));if(!result.report.readyForReview)process.exitCode=3;}
}
