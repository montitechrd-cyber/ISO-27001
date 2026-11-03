/* ===== APLICACIÓN ===== */
'use strict';
const KEY='ga27001-sgjm-v1';
const VERSION='4.0',BUILD='/*BUILD*/';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* Cualquier error inesperado se avisa en pantalla en lugar de fallar en silencio */
window.addEventListener('error',e=>{try{toast('Ocurrió un error: '+(e.message||'desconocido')+'. Descargue un respaldo (Más → Datos) y recargue la página.');}catch(x){}});

/* ---------- Estado persistente ---------- */
let storageOK=true;
function defaults(){return {v:4,docs:{},dcnt:0,resp:{},hall:[],prep:{},gprep:{},est:{},ses:{},lv:{},cnt:0,aj:{todos:false},informe:{conclusion:''},ultimoRespaldo:null,cambios:0};}
function migrar(o){
  const d=defaults();o=Object.assign(d,o);
  if(!o.ses)o.ses={};if(!o.lv)o.lv={};if(!o.docs||Array.isArray(o.docs)||typeof o.docs!=='object')o.docs={};if(!o.dcnt)o.dcnt=Object.keys(o.docs).length;
  (o.hall||[]).forEach(h=>{
    if(h.v3)return;
    h.sit=h.sit||h.cond||'';h.criterio=h.criterio||h.req||'';h.riesgo=h.riesgo||h.efecto||'';
    ['extra','concl','mejora','benef','practica','doc'].forEach(k=>{if(h[k]==null)h[k]='';});
    h.grav=h.grav||[];h.v3=true;
  });
  return o;
}
function load(){
  let raw=null;
  try{raw=localStorage.getItem(KEY);if(raw)return migrar(JSON.parse(raw));}
  catch(e){
    storageOK=false;console.error('No se pudo leer el estado guardado:',e&&e.message);
    /* si hay datos pero no se pueden leer, se conserva una copia antes de que algo los sobrescriba */
    if(raw){try{localStorage.setItem(KEY+'-ilegible-'+Date.now(),raw);}catch(x){}}
  }
  return defaults();
}
let S=load();
let saveT=null;
/* El trabajo se guarda en dos lugares independientes del navegador (localStorage e IndexedDB); al abrir se usa la copia más reciente.
   Así, si el navegador pierde una de las dos (cierre inmediato, limpieza parcial), la otra lo conserva. */
function guardarYa(){
  clearTimeout(saveT);saveT=null;S.guardado=Date.now();
  let str='';try{str=JSON.stringify(S);}catch(e){}
  try{localStorage.setItem(KEY,str);storageOK=true;}catch(e){storageOK=false;}
  if(typeof DOCDB!=='undefined'&&str)DOCDB.put({id:'__estado__',json:str,t:S.guardado});
  avisoStorage();if(typeof marcarGuardado==='function')marcarGuardado(storageOK);
}
function save(){S.cambios=(S.cambios||0)+1;clearTimeout(saveT);saveT=setTimeout(guardarYa,120);}
window.addEventListener('pagehide',()=>{if(saveT)guardarYa();});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&saveT)guardarYa();});
function avisoStorage(){const el=$('#aviso-storage');if(el)el.classList.toggle('hide',storageOK);}

/* ---------- Índices de la norma ---------- */
const REFS={};
CLAUSULAS.forEach(c=>REFS[c[0]]={id:c[0],t:c[1],s:c[2],e:c[3],k:'cl'});
CONTROLES.forEach(c=>REFS[c[0]]={id:c[0],t:c[1],s:c[2],e:c[3],k:'ct'});
const LV_REF={};LISTA.forEach((x,i)=>{(LV_REF[x[1]]=LV_REF[x[1]]||[]).push(i);});
function expand(tokens){
  const out=new Set();
  tokens.forEach(t=>{
    if(t==='A.*'){CONTROLES.forEach(c=>out.add(c[0]));return;}
    if(t.endsWith('.*')){const p=t.slice(0,-1);CLAUSULAS.forEach(c=>{if(c[0].startsWith(p))out.add(c[0]);});return;}
    if(t.startsWith('A.')&&t.includes('-')){
      const [a,b]=t.split('-');const ia=CONTROLES.findIndex(c=>c[0]===a),ib=CONTROLES.findIndex(c=>c[0]===b);
      for(let i=ia;i<=ib;i++)out.add(CONTROLES[i][0]);return;
    }
    out.add(t);
  });
  return out;
}
const SES={};
SESIONES.forEach(s=>{SES[s.id]=s;s.cubreSet=expand(s.cubre);s.soa=s.cubre.includes('A.*');});
const TRANS_GUIAS=['planificacion','sig','ventas','marcas','tecnologia','desarrollo','servicios_ti','legal','revision'];
const CHECK_GUIAS=['apertura','equipo','cierre'];
const esCheck=s=>CHECK_GUIAS.includes(s.guia);
const esMia=s=>s.ads.includes(YO);
const esFormato=s=>esMia(s)&&!!GUIAS[s.guia]&&!esCheck(s)&&!['pendientes','informe'].includes(s.guia);

/* ---------- Preguntas por sesión ---------- */
const QS={};
function buildQs(){
  SESIONES.forEach(ses=>{
    const g=GUIAS[ses.guia];if(!g){QS[ses.id]=[];return;}
    const out=[];
    (g.preguntas||[]).forEach((p,i)=>out.push({id:ses.id+'.'+(i+1),ses:ses.id,ref:p.ref||[],q:p.q,ev:p.ev||'',al:p.al||'',sug:!!p.sug,k:'g'}));
    if(ses.guia==='soa')CONTROLES.filter(c=>SOA_APLICA.includes(c[0])).forEach(c=>out.push({id:ses.id+'.'+c[0],ses:ses.id,ref:[c[0]],q:c[0]+' · '+c[1]+' — Verifique cómo está implementado y qué evidencia lo demuestra.',ev:c[3],al:'',sug:false,k:'c',ctrl:c}));
    if(TRANS_GUIAS.includes(ses.guia))TRANSVERSALES.forEach((p,i)=>out.push({id:ses.id+'.T'+(i+1),ses:ses.id,ref:p.ref,q:p.q,ev:p.ev,al:p.al,sug:false,k:'t'}));
    QS[ses.id]=out;
  });
}
buildQs();
const QBYID={};Object.values(QS).forEach(a=>a.forEach(q=>QBYID[q.id]=q));
const R=id=>S.resp[id]||{s:'pendiente',n:'',e:'',m:[]};
function setR(id,patch){S.resp[id]=Object.assign({s:'pendiente',n:'',e:'',m:[]},S.resp[id],patch);save();}
function prog(ses){
  const qs=QS[ses.id].filter(q=>q.k!=='t');
  const hechas=qs.filter(q=>R(q.id).s!=='pendiente').length;
  return {total:qs.length,hechas,pct:qs.length?Math.round(100*hechas/qs.length):0};
}
function contar(ses){const c={};Object.keys(TIPOS).forEach(k=>c[k]=0);QS[ses.id].forEach(q=>c[R(q.id).s]++);return c;}

/* ---------- Cobertura ---------- */
const PESO={ncmayor:7,ncmenor:6,obs:5,om:4,seguimiento:3,conforme:2,na:1,pendiente:0};
function cobertura(){
  const m={};
  Object.keys(REFS).forEach(id=>m[id]={id,asig:[],soloSoA:false,qs:[],peor:'pendiente',verif:0});
  SESIONES.forEach(s=>{s.cubreSet.forEach(id=>{if(!m[id])return;if(s.soa)m[id].soloSoA=true;else if(!m[id].asig.includes(s.id))m[id].asig.push(s.id);});});
  SESIONES.forEach(ses=>{
    if(esCheck(ses))return;
    QS[ses.id].forEach(q=>q.ref.forEach(id=>{
      if(!m[id])return;
      m[id].qs.push(q);
      const st=R(q.id).s;
      if(st!=='pendiente'){
        if(['conforme','obs','om','ncmenor','ncmayor'].includes(st))m[id].verif++;
        if(PESO[st]>PESO[m[id].peor])m[id].peor=st;
      }
    }));
  });
  return m;
}

/* ---------- Utilidades ---------- */
function chipRef(id){const r=REFS[id];return '<button class="ref" data-a="ref" data-id="'+esc(id)+'" title="'+esc(r?r.t:'')+'">'+esc(id)+'</button>';}
const refsHTML=ids=>ids.length?ids.map(chipRef).join(''):'';
function badge(st){const t=TIPOS[st];return '<span class="badge '+t.c+'">'+t.n+'</span>';}
function ymd(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function diasHasta(iso){const [y,m,d]=iso.split('-').map(Number);const a=new Date(y,m-1,d);const h=new Date();h.setHours(0,0,0,0);return Math.round((a-h)/86400000);}
const hoyISO=()=>ymd(new Date());
const fmtFecha=iso=>{const p=(iso||'').split('-');return p.length===3?p[2]+'/'+p[1]+'/'+p[0]:(iso||'');};
function descargarBlob(nombre,blob){
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=nombre;document.body.appendChild(a);a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},800);
}
const descargar=(nombre,contenido,tipo)=>descargarBlob(nombre,new Blob([contenido],{type:tipo}));
const MIME={xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',zip:'application/zip'};
const csvCell=v=>{let s=String(v==null?'':v).replace(/\r?\n/g,' ');if(/^[=+@]|^-[\d(]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};
const slug=s=>String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^A-Za-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40);

/* ---------- Datos por sesión (para los formatos) ---------- */
const hIso=h=>{const [a,b]=h.split(':');return a.padStart(2,'0')+':'+b;};
function sdef(ses){const [a,b]=ses.hora.split('-');return {fecha:DIAS[ses.dia],hIni:hIso(a),hFin:hIso(b),area:ses.nombre,auditado:ses.aud.join(', '),firmante:'',personal:ses.aud.join('\n'),docs:[],com:'',aspectos:''};}
const SD=ses=>Object.assign(sdef(ses),S.ses[ses.id]||{});
function setSD(id,patch){S.ses[id]=Object.assign({},S.ses[id],patch);save();}

/* ---------- Redacción de hallazgos (reglas de la empresa) ---------- */
const HTIPOS={ncmayor:'No conformidad MAYOR',ncmenor:'No conformidad MENOR',obs:'Observación',om:'Oportunidad de mejora',fortaleza:'Punto fuerte'};
const HCLASE={ncmayor:'t-ncM',ncmenor:'t-ncm',obs:'t-obs',om:'t-om',fortaleza:'t-ok'};
const esNC=t=>t==='ncmayor'||t==='ncmenor';
const badgeH=t=>'<span class="badge '+(HCLASE[t]||'t-na')+'">'+esc(HTIPOS[t]||t)+'</span>';
const refsDe=h=>(h.ref||'').split(/[,;\s]+/).filter(Boolean);
function acapite(h){
  if(h.doc)return h.doc;
  const ids=refsDe(h);return ids.length?'ISO/IEC 27001:2022 – '+ids.join(', '):'';
}
function docLargo(h){
  if(h.doc)return h.doc;
  const ids=refsDe(h).map(id=>{const r=REFS[id];return r?(r.k==='ct'?'control ':'cláusula ')+id+' ('+r.t+')':id;});
  return ids.length?'ISO/IEC 27001:2022, '+ids.join(' y '):'';
}
const lim=s=>(s||'').trim().replace(/[\s.]+$/,'');
const cap=s=>s?s[0].toUpperCase()+s.slice(1):s;
const lf=s=>/^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]/.test(s)?s[0].toLowerCase()+s.slice(1):s;
const ph=(s,p)=>lim(s)||('['+p+']');
const pl=(s,p)=>{const v=lim(s);return v?lf(v):'['+p+']';};
function hallTexto(h){
  const t=h.tipo;
  if(esNC(t)){
    let x='En '+ph(docLargo(h),'documento / procedimiento / requisito')+', se establece que '+pl(h.criterio,'criterio')+'. No obstante, durante la auditoría se evidenció que '+pl(h.sit,'situación encontrada')+'.';
    if(lim(h.extra))x+=' Además de lo anterior, '+lim(h.extra)+'.';
    return x+' Con base en la evidencia/muestra revisada, no se logra asegurar que '+pl(h.concl,'conclusión sobre el incumplimiento')+'.';
  }
  if(t==='obs')return 'Durante la auditoría se evidenció que '+pl(h.sit,'situación encontrada')+'. Esta situación podría '+pl(h.riesgo,'riesgo o consecuencia potencial')+'. Por lo anterior, se considera pertinente dar seguimiento a este aspecto.';
  if(t==='om')return 'Durante la auditoría se evidenció que '+pl(h.sit,'situación actual que cumple con el requisito')+'. No obstante, se identifica una oportunidad para '+pl(h.mejora,'posibilidad de mejora')+', con el propósito de '+pl(h.benef,'beneficio esperado')+'.';
  return 'Se evidenció como punto fuerte que '+pl(h.practica,'práctica destacada')+', mediante '+pl(h.evid,'evidencia')+'. Esta práctica contribuye a '+pl(h.benef,'beneficio o resultado positivo')+'.';
}
function calidadH(h){
  const f=[],t=h.tipo,txt=[h.sit,h.riesgo,h.mejora,h.criterio,h.concl].join(' ');
  if(!h.ses)f.push('Asigne la sesión / proceso: sin ella el hallazgo no saldrá en ningún formulario');
  if(!acapite(h))f.push('Indique el requisito (cláusula o control) o el documento interno (columna «Acápite / Documento»)');
  if(esNC(t)){
    if(lim(h.criterio).length<10)f.push('Falta el CRITERIO: qué establece el requisito o el procedimiento («se establece que…»)');
    if(lim(h.sit).length<20)f.push('Describa la SITUACIÓN encontrada con hechos («se evidenció que…»)');
    if(lim(h.evid).length<10)f.push('Indique la evidencia y la muestra revisada (ej.: «de 10 proveedores, 3 sin evaluación»)');
    if(lim(h.concl).length<10)f.push('Falta la CONCLUSIÓN («no se logra asegurar que…»)');
    if(!(h.grav||[]).some(Boolean)&&t==='ncmayor')f.push('Marcó NC MAYOR: indique cuál criterio de gravedad se cumple');
    if((h.grav||[]).some(Boolean)&&t==='ncmenor')f.push('Marcó criterios de gravedad pero la clasificó MENOR: revise la clasificación');
  }else if(t==='obs'){
    if(lim(h.sit).length<20)f.push('Describa la situación encontrada');
    if(lim(h.riesgo).length<10)f.push('Indique el riesgo o consecuencia potencial («podría…»)');
    if(/\b(incumpl|no cumple|no se cumple|no conformidad)/i.test(txt))f.push('Una observación NO debe afirmar un incumplimiento: si está demostrado, es no conformidad');
  }else if(t==='om'){
    if(lim(h.sit).length<20)f.push('Describa la situación actual (que cumple el requisito)');
    if(lim(h.mejora).length<10)f.push('Indique la posibilidad de mejora');
    if(lim(h.benef).length<10)f.push('Indique el beneficio esperado');
    if(/\b(incumpl|no cumple|no se cumple)/i.test(txt))f.push('Una oportunidad de mejora implica que el requisito SÍ se cumple');
  }else{
    if(lim(h.practica).length<15)f.push('Describa la práctica destacada');
    if(lim(h.evid).length<10)f.push('Indique la evidencia («mediante…»)');
    if(lim(h.benef).length<10)f.push('Indique el beneficio');
  }
  if(/\b(mal|malo|deficiente|pésimo|terrible|siempre|nunca|nadie)\b/i.test(txt))f.push('Evite adjetivos y absolutos («mal», «nadie», «nunca»): use cifras y hechos');
  if(!(h.aud||'').trim())f.push('Indique el auditado / responsable del proceso');
  if(!h.validado)f.push('Valide los hechos con el auditado (retroalimentación diaria)');
  return f;
}
function resumenH(h){return lim(esNC(h.tipo)||h.tipo==='obs'||h.tipo==='om'?h.sit:h.practica)||hallTexto(h);}
function sesionSugerida(ref){
  const c=SESIONES.filter(esFormato);
  return (c.find(s=>!s.soa&&s.cubreSet.has(ref))||c.find(s=>!s.soa&&QS[s.id].some(q=>q.ref.includes(ref)))||c.find(s=>s.soa&&s.cubreSet.has(ref))||{}).id||'';
}
function nuevoH(opts){
  opts=opts||{};S.cnt++;const id='H-'+String(S.cnt).padStart(3,'0');
  const q=opts.qid?QBYID[opts.qid]:null;const r=q?R(q.id):null;
  const mapa={ncmayor:'ncmayor',ncmenor:'ncmenor',obs:'obs',om:'om',conforme:'fortaleza',seguimiento:'obs'};
  const ses=q?SES[q.ses]:(opts.ses?SES[opts.ses]:null);
  const x={v3:true,id,ses:ses?ses.id:'',qid:q?q.id:'',tipo:(r&&mapa[r.s])||'obs',ref:q?q.ref.filter(z=>REFS[z]).join(', '):'',doc:'',criterio:'',sit:'',extra:'',concl:'',riesgo:'',mejora:'',benef:'',practica:'',evid:r?r.e:'',grav:[],causa:'',aud:ses?ses.aud.join(' / '):'',validado:false,creado:new Date().toISOString()};
  if(r){if(x.tipo==='fortaleza')x.practica=r.n;else x.sit=r.n;}
  S.hall.push(x);save();return x;
}

/* ---------- Informe ---------- */
function resumenHall(){const c={ncmayor:0,ncmenor:0,obs:0,om:0,fortaleza:0};S.hall.forEach(x=>{if(c[x.tipo]!=null)c[x.tipo]++;});return c;}
function informeTexto(){
  const c=resumenHall();const cob=cobertura();
  const verif=CONTROLES.filter(x=>cob[x[0]].verif>0).length;
  let t='INFORME DE AUDITORÍA INTERNA – ISO/IEC 27001:2022\nSoluciones Globales JM\n\n';
  t+='1. OBJETIVO Y ALCANCE\nEvaluar la conformidad del Sistema de Gestión de Seguridad de la Información con ISO/IEC 27001:2022, los documentos del SGSI y los requisitos legales y contractuales aplicables, en los procesos y fechas del plan de auditoría. [Completar con el alcance acordado en la reunión de apertura]\n\n';
  t+='2. EQUIPO AUDITOR\n'+EQUIPO.join(', ')+'\n\n3. PERÍODO\n4 al 18 de noviembre de 2026.\n\n';
  t+='4. RESUMEN DE RESULTADOS\nNo conformidades mayores: '+c.ncmayor+'\nNo conformidades menores: '+c.ncmenor+'\nObservaciones: '+c.obs+'\nOportunidades de mejora: '+c.om+'\nPuntos fuertes: '+c.fortaleza+'\n\n';
  t+='5. CONCLUSIÓN\n'+(S.informe.conclusion||'[Redactar: grado de cumplimiento de los criterios y eficacia del SGSI]')+'\n\n6. HALLAZGOS\n';
  if(!S.hall.length)t+='(Sin hallazgos registrados)\n';
  S.hall.forEach(x=>{t+='\n'+x.id+' – '+(HTIPOS[x.tipo]||x.tipo)+' – '+(SES[x.ses]?SES[x.ses].nombre:'')+'\nAcápite / documento: '+(acapite(x)||'[falta]')+'\n'+hallTexto(x)+'\n';});
  t+='\n7. LIMITACIONES\nLa auditoría se realizó por muestreo. La ausencia de hallazgos en un área no garantiza la ausencia de no conformidades. Controles del Anexo A con al menos una verificación documentada: '+verif+' de '+CONTROLES.length+'.\n';
  return t;
}
/* ---------- Datos y generación de los formatos ---------- */
function aspectosRetro(ses){
  const sd=SD(ses);const out=[];
  S.hall.filter(h=>h.ses===ses.id).forEach(h=>out.push({txt:cap(resumenH(h)),ev:[acapite(h),esNC(h.tipo)||h.tipo==='fortaleza'?lim(h.evid):''].filter(Boolean).join(' · ')}));
  QS[ses.id].filter(q=>q.k==='g'&&R(q.id).s==='seguimiento').forEach(q=>{out.push({txt:'Pendiente de verificar: '+q.q.slice(0,150)+(q.q.length>150?'…':''),ev:'Evidencia por entregar'+(R(q.id).n?' · '+R(q.id).n.slice(0,80):'')});});
  (sd.aspectos||'').split('\n').map(x=>x.trim()).filter(Boolean).forEach(l=>{const p=l.split('|');out.push({txt:p[0].trim(),ev:(p[1]||'').trim()});});
  return out;
}
function datosRetro(ses){
  const sd=SD(ses);
  return {fecha:fmtFecha(sd.fecha),proceso:ses.nombre,auditores:ses.ads.join(', '),auditado:sd.auditado,aspectos:aspectosRetro(ses),comentarios:(sd.com||'').trim(),nombreAuditado:(sd.firmante||'').trim(),nombreAuditor:YO,fechaFirma:fmtFecha(sd.fecha)};
}
function datosForm(ses){
  const sd=SD(ses);const hs=S.hall.filter(h=>h.ses===ses.id);
  const caps=new Set(),metodos={doc:false,ent:false,obs:false,mue:false};
  const addRef=id=>{if(id.startsWith('A.'))caps.add('A');else{const m=id.match(/^(\d+)\./);if(m)caps.add(+m[1]);}};
  QS[ses.id].forEach(q=>{const r=R(q.id);if(r.s==='pendiente')return;q.ref.forEach(addRef);(r.m||[]).forEach(k=>{metodos[k]=true;});});
  hs.forEach(h=>refsDe(h).forEach(addRef));
  return {empresa:'Soluciones Globales JM',fechaIni:fmtFecha(sd.fecha),fechaFin:fmtFecha(sd.fecha),horaIni:sd.hIni,horaFin:sd.hFin,area:sd.area,
    procesos:[ses.nombre],personal:(sd.personal||'').split('\n').map(x=>x.trim()).filter(Boolean),normas:{27001:true},caps:Array.from(caps),
    docs:docsParaForm(ses,sd),metodos,
    pf:hs.filter(h=>h.tipo==='fortaleza').map(hallTexto),om:hs.filter(h=>h.tipo==='om').map(hallTexto),
    obs:hs.filter(h=>h.tipo==='obs').map(h=>({txt:hallTexto(h),ac:acapite(h)})),
    nc:hs.filter(h=>esNC(h.tipo)).map(h=>({evid:lim(h.evid),txt:hallTexto(h),tipo:h.tipo==='ncmayor'?'MAYOR':'MENOR',ac:acapite(h)})),
    auditor:YO,fechaFirma:fmtFecha(sd.fecha)};
}
const nombreX=ses=>'Formulario-Hallazgos_FOR-SGC-004_'+slug(ses.nombre)+'_'+DIAS[ses.dia]+'.xlsx';
const nombreW=ses=>'Retroalimentacion-Diaria_'+slug(ses.nombre)+'_'+DIAS[ses.dia]+'.docx';
function generar(ses,cual){
  const out=[];
  if(cual!=='w')out.push({name:nombreX(ses),data:FM.xlsx(datosForm(ses))});
  if(cual!=='x')out.push({name:nombreW(ses),data:FM.docx(datosRetro(ses))});
  return out;
}
function bajar(files,nombreZip){
  if(files.length===1){const f=files[0];descargarBlob(f.name,new Blob([f.data],{type:MIME[f.name.split('.').pop()]}));}
  else descargarBlob(nombreZip,new Blob([FM.zip(files)],{type:MIME.zip}));
  toast(files.length===1?'Archivo generado':files.length+' archivos generados');
}
function avisosFormato(ses){
  const w=[],hs=S.hall.filter(h=>h.ses===ses.id),d=datosForm(ses);
  if(!hs.length)w.push('No hay hallazgos registrados en esta sesión: el formulario saldrá sin hallazgos.');
  if(hs.some(h=>!h.validado))w.push(hs.filter(h=>!h.validado).length+' hallazgo(s) sin validar con el auditado.');
  const inc=hs.filter(h=>calidadH(h).filter(x=>!/Valide los hechos/.test(x)).length);
  if(inc.length)w.push(inc.length+' hallazgo(s) con redacción incompleta ('+inc.map(h=>h.id).join(', ')+').');
  if(!Object.values(d.metodos).some(Boolean))w.push('No marcó el método de auditoría en las preguntas (documental, entrevista, observación, muestreo).');
  if(!d.docs.length)w.push('No registró documentación interna revisada.');
  return w;
}


/* Documentos que se listan en «Documentación interna revisada»: los escritos a mano + los adjuntados a la sesión */
function docsParaForm(ses,sd){
  const manual=(sd.docs||[]).filter(x=>(x.n||x.t||'').trim());
  const auto=(typeof docsDeSes==='function'?docsDeSes(ses.id):[]).map(d=>({n:(d.analisis&&d.analisis.control&&d.analisis.control.codigo)||'',t:(d.meta&&d.meta.titulo&&d.meta.titulo.length>3?d.meta.titulo:d.nombre.replace(/\.[A-Za-z0-9]+$/,''))}));
  const vistos=new Set(manual.map(x=>(x.t||'').toLowerCase()));
  return manual.concat(auto.filter(x=>!vistos.has(x.t.toLowerCase())));
}
function filesDia(dia){const out=[];SESIONES.filter(s=>esFormato(s)&&s.dia===dia).forEach(s=>out.push(...generar(s)));return out;}
