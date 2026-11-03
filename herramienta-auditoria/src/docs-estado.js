/* ===== ESTADO DE LOS DOCUMENTOS ADJUNTOS ===== */
const docsLista=()=>Object.values(S.docs).sort((a,b)=>b.fecha.localeCompare(a.fecha));
const fd=x=>{if(!x)return '';const d=new Date(x);return isNaN(d)?'':fmtF(d);};
const nuevoDocId=()=>{S.dcnt=(S.dcnt||0)+1;return 'D-'+String(S.dcnt).padStart(3,'0');};
const tamTxt=b=>b>=1048576?(b/1048576).toFixed(1)+' MB':Math.max(1,Math.round(b/1024))+' KB';
const iconoDoc=ext=>({pdf:'doc',docx:'doc',xlsx:'columnas',csv:'columnas',tsv:'columnas',png:'camara',jpg:'camara',jpeg:'camara',gif:'camara',webp:'camara'}[ext]||'doc');
const docIdent=d=>{const c=d.analisis&&d.analisis.control;return c?[c.codigo,c.version?'v'+c.version:''].filter(Boolean).join(' '):'';};
const docTitulo=d=>(d.analisis&&d.analisis.control&&d.meta&&d.meta.titulo)||d.nombre;

function ctxAnalisis(){return {hoy:new Date(),controles:CONTROLES.map(c=>c[0])};}
function analizarRec(rec,x){
  const A=analizarDocumento({nombre:rec.nombre,texto:x.texto||'',hojas:x.hojas,meta:Object.assign({},rec.meta),esPDF:rec.ext==='pdf',esImagen:EXT_IMG.includes(rec.ext),paginas:rec.paginas,hojasN:rec.hojasN,tipoForzado:rec.tipo||'',sha:rec.sha,fechaAdj:rec.fecha},ctxAnalisis());
  if(A.control)A.control.fechas=A.control.fechas.slice(0,6).map(f=>({f:f.f,ctx:f.ctx}));
  return JSON.parse(JSON.stringify(A));
}

let _procesando=0;
async function subirArchivos(lista,opts){
  opts=opts||{};const files=Array.from(lista||[]);if(!files.length)return;
  let ultimo=null,ok=0,mal=0;
  for(const f of files){
    const id=nuevoDocId(),ext=extDe(f.name);
    const rec={id,nombre:f.name,tam:f.size,ext,fecha:new Date().toISOString(),sha:'',ses:opts.ses||'',vinc:opts.qid?[opts.qid]:[],notas:'',tipo:'',estado:'procesando',error:'',analisis:null,paginas:0,hojasN:0,meta:{},progreso:0};
    S.docs[id]=rec;ultimo=id;_procesando++;save();if(!opts.silencioso)render();
    try{
      if(f.size>40*1048576)throw new Error('El archivo pesa '+tamTxt(f.size)+'. El máximo es 40 MB.');
      rec.sha=await sha256(await f.arrayBuffer());
      const x=await extraer(f,(i,n)=>{rec.progreso=Math.round(100*i/n);if(i===n||i%8===0)pintarProgresoDoc(id);});
      rec.paginas=x.paginas||0;rec.hojasN=x.hojasN||0;rec.meta=x.meta||{};
      await DOCDB.put({id,blob:f,texto:x.texto,hojas:x.hojas?x.hojas.map(h=>({nombre:h.nombre,filas:h.filas.slice(0,3000)})):null});
      rec.analisis=analizarRec(rec,x);rec.estado=rec.analisis.sinTexto?'sinTexto':'listo';ok++;
      if(opts.qid)vincularDoc(id,opts.qid,true);
    }catch(e){rec.estado='error';rec.error=(e&&e.message)||String(e);mal++;}
    delete rec.progreso;_procesando--;save();
  }
  if(!opts.silencioso)render();
  if(files.length===1&&ultimo){const r=S.docs[ultimo];
    if(r.estado==='error')toast('No se pudo leer «'+r.nombre+'»: '+r.error);
    else if(opts.abrir)location.hash='#/documento/'+ultimo;
    else toast('«'+r.nombre+'» '+(r.estado==='sinTexto'?'adjuntado (sin texto legible)':'analizado'),{t:'Ver análisis',f:()=>{location.hash='#/documento/'+ultimo;}});
  }else toast(ok+' documento'+(ok===1?'':'s')+' analizado'+(ok===1?'':'s')+(mal?' · '+mal+' con error':''));
  return ultimo;
}
function pintarProgresoDoc(id){const el=document.querySelector('[data-prog="'+id+'"]');if(el&&S.docs[id])el.style.width=(S.docs[id].progreso||0)+'%';}

async function reanalizarDoc(id,tipo){
  const rec=S.docs[id];if(!rec)return;
  const r=await DOCDB.get(id);
  if(!r||(r.texto==null&&!EXT_IMG.includes(rec.ext))){toast('El archivo original no está en este dispositivo. Adjúntelo de nuevo para volver a analizarlo.');return;}
  rec.tipo=tipo||'';rec.analisis=analizarRec(rec,{texto:r.texto||'',hojas:r.hojas});rec.estado=rec.analisis.sinTexto?'sinTexto':'listo';save();render();
}
async function textoDoc(id){const r=await DOCDB.get(id);return r?r.texto||'':null;}
async function abrirOriginal(id){
  const r=await DOCDB.get(id),rec=S.docs[id];
  if(!r||!r.blob){toast('El archivo original no está en este dispositivo.');return;}
  descargarBlob(rec.nombre,r.blob);
}
function borrarDoc(id){
  const copia=S.docs[id];if(!copia)return;delete S.docs[id];save();
  if(ruta().v==='documento')location.hash='#/documentos';else render();
  toast('«'+copia.nombre+'» eliminado',{t:'Deshacer',f:()=>{S.docs[id]=copia;save();render();},fin:()=>{if(!S.docs[id])DOCDB.del(id);}});
}

/* ---- vínculos con preguntas y sesiones ---- */
const docsDeQ=qid=>docsLista().filter(d=>(d.vinc||[]).includes(qid));
function docsDeSes(sid){return docsLista().filter(d=>d.ses===sid||(d.vinc||[]).some(q=>QBYID[q]&&QBYID[q].ses===sid));}
function vincularDoc(did,qid,silencio){
  const d=S.docs[did],q=QBYID[qid];if(!d||!q)return;
  d.vinc=d.vinc||[];if(!d.vinc.includes(qid))d.vinc.push(qid);if(!d.ses)d.ses=q.ses;
  const r=R(qid),linea='Documento: «'+d.nombre+'»'+(docIdent(d)?' ('+docIdent(d)+')':'')+(d.sha?' · SHA-256 '+d.sha.slice(0,10)+'…':'');
  if(!(r.e||'').includes(d.nombre))setR(qid,{e:(r.e?r.e+' | ':'')+linea,m:Array.from(new Set([...(r.m||[]),'doc']))});
  save();if(!silencio){toast('Documento vinculado a la pregunta');}
}
function desvincularDoc(did,qid){const d=S.docs[did];if(!d)return;d.vinc=(d.vinc||[]).filter(x=>x!==qid);save();}

/* ---- borrador de hallazgo desde el análisis ---- */
function hallazgoDeBorrador(did,bid){
  const d=S.docs[did];if(!d||!d.analisis)return null;
  const b=d.analisis.borradores.find(x=>x.id===bid);if(!b)return null;
  const origen=did+':'+bid,ya=S.hall.find(h=>h.origen===origen);if(ya)return ya;
  const m=(b.ref||'').match(/^(A\.\d+\.\d+|\d+(?:\.\d+){0,2})/);let ref=m?m[1]:'';while(ref&&!REFS[ref])ref=/^\d+(\.\d+)+$/.test(ref)?ref.replace(/\.\d+$/,''):'';
  const sid=d.ses||sesionSugerida(ref)||'';
  const x=nuevoH({ses:sid});
  Object.assign(x,{tipo:b.tipo,ref,sit:b.sit||'',riesgo:b.riesgo||'',mejora:b.mejora||'',benef:b.benef||'',practica:b.practica||'',evid:b.evid||'',docId:did,origen,doc:'«'+d.nombre+'»'+(docIdent(d)?' ('+docIdent(d)+')':'')});
  save();return x;
}
