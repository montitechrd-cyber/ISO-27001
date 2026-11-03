/* ===== APLICACIÓN ===== */
'use strict';
const KEY='ga27001-sgjm-v1';
const VERSION='3.1',BUILD='/*BUILD*/';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* Cualquier error inesperado se avisa en pantalla en lugar de fallar en silencio */
window.addEventListener('error',e=>{try{toast('Ocurrió un error: '+(e.message||'desconocido')+'. Descargue un respaldo (Más → Datos) y recargue la página.');}catch(x){}});

/* ---------- Estado persistente ---------- */
let storageOK=true;
function defaults(){return {v:3,resp:{},hall:[],prep:{},gprep:{},est:{},ses:{},lv:{},cnt:0,aj:{todos:false},informe:{conclusion:''},ultimoRespaldo:null,cambios:0};}
function migrar(o){
  const d=defaults();o=Object.assign(d,o);delete o.docs;
  if(!o.ses)o.ses={};if(!o.lv)o.lv={};
  (o.hall||[]).forEach(h=>{
    if(h.v3)return;
    h.sit=h.sit||h.cond||'';h.criterio=h.criterio||h.req||'';h.riesgo=h.riesgo||h.efecto||'';
    ['extra','concl','mejora','benef','practica','doc'].forEach(k=>{if(h[k]==null)h[k]='';});
    h.grav=h.grav||[];h.v3=true;
  });
  return o;
}
function load(){
  try{const r=localStorage.getItem(KEY);if(r)return migrar(JSON.parse(r));}
  catch(e){storageOK=false;}
  return defaults();
}
let S=load();
let saveT=null;
function guardarYa(){
  clearTimeout(saveT);saveT=null;
  try{localStorage.setItem(KEY,JSON.stringify(S));storageOK=true;}catch(e){storageOK=false;}
  avisoStorage();
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
function toast(msg){const t=document.createElement('div');t.className='toast';t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),2600);}
function descargarBlob(nombre,blob){
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=nombre;document.body.appendChild(a);a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},800);
}
const descargar=(nombre,contenido,tipo)=>descargarBlob(nombre,new Blob([contenido],{type:tipo}));
const MIME={xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',zip:'application/zip'};
const csvCell=v=>{let s=String(v==null?'':v).replace(/\r?\n/g,' ');if(/^[=+@]|^-[\d(]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};
const slug=s=>String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^A-Za-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40);

/* ---------- Router ---------- */
let tabNext=null,tabSes='preparar',filtroQ='todas',filtroSoA='pend',filtroH='todos',filtroCob='todos',tabBib='clausulas',busqueda='',filtroLV='4';
function ruta(){const h=location.hash.replace(/^#\/?/,'')||'plan';const p=h.split('/');return {v:p[0],a:decodeURIComponent(p[1]||'')};}
function render(){
  const r=ruta();
  const mapa={plan:vPlan,sesion:()=>vSesion(r.a),hallazgos:vHallazgos,hallazgo:()=>vHallazgo(r.a),formatos:vFormatos,lista:vLista,cobertura:vCobertura,cronograma:vCronograma,biblioteca:vBiblioteca,datos:vDatos,mas:vMas};
  $('#app').innerHTML=(mapa[r.v]||vPlan)();
  const grupo={sesion:'plan',hallazgo:'hallazgos',cronograma:'mas',biblioteca:'mas',datos:'mas'}[r.v]||r.v;
  $$('nav.main a').forEach(a=>a.classList.toggle('on',a.dataset.v===grupo));
  avisoStorage();
}
window.addEventListener('hashchange',()=>{$$('.modal').forEach(m=>m.remove());tabSes=tabNext||'preparar';tabNext=null;filtroQ='todas';window.scrollTo(0,0);render();});

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

/* ---------- Vista: Plan ---------- */
function vPlan(){
  const mis=SESIONES.filter(s=>S.aj.todos||esMia(s));
  const inicio=DIAS[4],hoy=hoyISO(),d0=diasHasta(inicio);
  let hero;
  if(d0>0)hero='<h1>Faltan '+d0+' día'+(d0===1?'':'s')+' para el inicio</h1><p>La auditoría empieza el <b>miércoles 4 de noviembre, 10:00</b> con la Reunión de Apertura. Hoy es el día de preparar: abajo está su lista.</p>';
  else if(Object.values(DIAS).includes(hoy))hero='<h1>Hoy es día de auditoría</h1><p>Abra su siguiente sesión y siga la pestaña «Preguntar». Al cerrar la sesión genere sus formatos.</p>';
  else hero='<h1>Guía de auditoría ISO 27001:2022</h1><p>Seguimiento del plan de auditoría.</p>';
  const sigId=(mis.find(s=>!S.est[s.id]&&DIAS[s.dia]>=hoy)||mis.find(s=>!S.est[s.id])||{}).id;
  const hechasPrep=PREP_GENERAL.filter((t,i)=>S.gprep[i]).length;
  let h='<div class="wrap">';
  h+='<div class="card hero">'+hero+'<p class="small" style="margin:0;opacity:.9">Auditor: '+esc(YO)+' · Soluciones Globales JM · Auditoría interna ISO 27001:2022</p></div>';
  h+='<div class="card"><h2>Preparación general ('+hechasPrep+'/'+PREP_GENERAL.length+')</h2>'+PREP_GENERAL.map((t,i)=>'<label class="chk"><input type="checkbox" data-a="gprep" data-i="'+i+'" '+(S.gprep[i]?'checked':'')+'><span>'+esc(t)+'</span></label>').join('')+'</div>';
  const revAlta=REVISION.filter(r=>r.sev==='alta').length;
  h+='<a class="card warn ses" href="#/cronograma"><b>Revisé su cronograma: '+revAlta+' puntos de prioridad alta</b><br><span class="small">Toque para leerlos. Conviene tratarlos con el líder del equipo antes del miércoles.</span></a>';
  const nh=S.hall.length;
  h+='<a class="card soft ses" href="#/formatos"><b>Formatos oficiales</b><br><span class="small">Genera el Formulario de hallazgos (FOR-SGC-004) y la Retroalimentación diaria con lo que usted registra. Hallazgos registrados: '+nh+'.</span></a>';
  h+='<div class="row noprint" style="margin:6px 0 4px"><h2 style="margin:0">Mis sesiones</h2><span class="sp"></span><button class="sm" data-a="todos">'+(S.aj.todos?'Ver solo las mías':'Ver todo el cronograma')+'</button></div>';
  let dia=null;
  mis.forEach(s=>{
    if(s.dia!==dia){dia=s.dia;h+='<div class="day"><b>'+DIA_NOMBRE[dia]+' de noviembre</b>'+(DIAS[dia]===hoy?'<span class="badge b-hoy">HOY</span>':'')+'</div>';}
    const p=prog(s);const tec=['tecnologia','desarrollo','servicios_ti'].includes(s.id);
    h+='<a class="card ses '+(S.est[s.id]?'done ':'')+(s.id===sigId?'next':'')+'" href="#/sesion/'+s.id+'">';
    h+='<div class="meta"><b>'+esc(s.hora)+'</b> · '+(s.id===sigId?'<span class="badge t-om">SIGUIENTE</span>':'')+(tec?'<span class="badge b-tec">Técnica</span>':'')+(S.est[s.id]?'<span class="badge t-ok">Completada</span>':'')+(GUIAS[s.guia]?'':'<span class="badge t-na">Sin guía (otro auditor)</span>')+(!esMia(s)?'<span class="badge t-na">No es suya</span>':'')+'</div>';
    h+='<h3>'+esc(s.nombre)+'</h3><div class="meta">'+esc(s.aud.join(' · '))+'</div>';
    h+='<div class="meta">Auditores: '+esc(s.ads.join(', '))+(s.std&&s.std!=='N/A'?' · ISO 27001: '+esc(s.std):'')+'</div>';
    if(GUIAS[s.guia]&&p.total)h+='<div class="row" style="margin-top:8px"><div class="bar sp"><i style="width:'+p.pct+'%"></i></div><span class="small mut">'+p.hechas+'/'+p.total+'</span></div>';
    h+='</a>';
  });
  h+='<p class="small mut" style="margin-top:18px">'+(storageOK?'Sus notas se guardan solo en este dispositivo. ':'<b>Atención: este navegador no permite guardar.</b> ')+'Haga una copia desde «Más → Datos» al terminar cada día.'+(S.ultimoRespaldo?' Último respaldo: '+esc(new Date(S.ultimoRespaldo).toLocaleString())+'.':' Aún no ha hecho ningún respaldo.')+'</p>';
  return h+'</div>';
}

/* ---------- Lista de verificación en la tarjeta de pregunta ---------- */
const LVB=[['si','Sí'],['no','No'],['na','N/A']];
function lvBtns(i){const v=(S.lv[i]||{}).s;return '<div class="stbtns">'+LVB.map(b=>'<button class="'+(b[0]==='si'?'t-ok':b[0]==='no'?'t-ncM':'t-na')+'" aria-pressed="'+(v===b[0])+'" data-a="lv" data-i="'+i+'" data-s="'+b[0]+'">'+b[1]+'</button>').join('')+'</div>';}
function lvDeQ(q){const s=new Set();q.ref.forEach(r=>(LV_REF[r]||[]).forEach(i=>s.add(i)));return Array.from(s);}
function lvHTML(q){
  const ids=lvDeQ(q);if(!ids.length)return '';
  const abierto=ids.some(i=>S.lv[i]&&S.lv[i].s);
  return '<details class="lvq" '+(abierto?'open':'')+'><summary>Lista de verificación FOR-SGI-10 ('+ids.length+')</summary>'+ids.map(i=>'<div class="lvi"><span class="chip">'+esc(LISTA[i][0])+'</span> <b>'+esc(LISTA[i][2])+'</b><p class="small" style="margin:2px 0">'+esc(LISTA[i][3])+'</p>'+lvBtns(i)+'</div>').join('')+'</details>';
}

/* ---------- Tarjeta de pregunta ---------- */
const BTN_ORDEN=['conforme','obs','om','ncmenor','ncmayor','seguimiento','na'];
const BTN_TXT={conforme:'Conforme',obs:'Observación',om:'Mejora',ncmenor:'NC menor',ncmayor:'NC mayor',seguimiento:'Seguimiento',na:'N/A'};
const METODOS=[['doc','Revisión documental'],['ent','Entrevista'],['obs','Observación'],['mue','Muestreo']];
const hallDeQ=qid=>S.hall.find(h=>h.qid===qid);
function cardQ(q,opt){
  opt=opt||{};const r=R(q.id);const ses=SES[q.ses];const chk=esCheck(ses);
  let h='<article class="q s-'+r.s+'" id="q-'+esc(q.id)+'" data-id="'+esc(q.id)+'">';
  h+='<div>'+refsHTML(q.ref)+(q.sug?'<span class="badge b-sug" title="No figura en el cronograma; lo agregué por riesgo">sugerido</span>':'')+(q.k==='t'?'<span class="badge t-na">transversal</span>':'')+(opt.mostrarSes?'<a class="badge t-om" href="#/sesion/'+esc(ses.id)+'">'+esc(ses.nombre)+'</a>':'')+'</div>';
  h+='<p class="q-text">'+esc(q.q)+'</p>';
  if(q.ev)h+='<p class="q-ev"><b>'+(q.k==='c'?'Evidencia típica':'Pida ver')+':</b> '+esc(q.ev)+'</p>';
  if(q.k==='c'){
    const prev=evidenciaPrevia(q);
    if(prev.length)h+='<p class="small"><span class="badge t-ok">Ya revisado esta semana</span> '+prev.map(p=>esc(p.ses.nombre)+' ('+TIPOS[R(p.q.id).s].n+')').join('; ')+'</p>';
    h+='<p class="small mut">'+esc(q.ctrl[2])+'</p>';
  }
  if(q.al)h+='<details class="q-al"><summary>Señales de alerta</summary><p>'+esc(q.al)+'</p></details>';
  if(!chk)h+=lvHTML(q);
  if(chk){
    h+='<div class="stbtns"><button class="t-ok" aria-pressed="'+(r.s==='conforme')+'" data-a="st" data-id="'+esc(q.id)+'" data-s="conforme">'+(r.s==='conforme'?'✓ Hecho':'Marcar como hecho')+'</button></div>';
  }else{
    h+='<div class="stbtns" role="group" aria-label="Resultado">'+BTN_ORDEN.map(s=>'<button class="'+TIPOS[s].c+'" aria-pressed="'+(r.s===s)+'" data-a="st" data-id="'+esc(q.id)+'" data-s="'+s+'">'+BTN_TXT[s]+'</button>').join('')+'</div>';
  }
  const abierto=(r.n||r.e||(r.m&&r.m.length)||(r.s!=='pendiente'&&!chk));
  h+='<details class="notas" '+(abierto?'open':'')+'><summary>Notas, método y evidencia</summary>';
  h+='<textarea data-f="n" data-id="'+esc(q.id)+'" placeholder="Qué respondió / qué observé (hechos, sin adjetivos)">'+esc(r.n)+'</textarea>';
  if(!chk){
    h+='<input type="text" data-f="e" data-id="'+esc(q.id)+'" placeholder="Evidencia vista: documento, fecha, muestra, quién la mostró" value="'+esc(r.e)+'">';
    h+='<div class="filters" role="group" aria-label="Método de auditoría">'+METODOS.map(m=>'<button class="'+((r.m||[]).includes(m[0])?'on':'')+'" aria-pressed="'+((r.m||[]).includes(m[0]))+'" data-a="mt" data-id="'+esc(q.id)+'" data-m="'+m[0]+'">'+m[1]+'</button>').join('')+'</div>';
    const hh=hallDeQ(q.id);
    if(hh)h+='<a class="btn sm" href="#/hallazgo/'+hh.id+'">Ver hallazgo '+hh.id+'</a>';
    else if(['obs','om','ncmenor','ncmayor','seguimiento'].includes(r.s))h+='<button class="sm primary" data-a="mkhall" data-id="'+esc(q.id)+'">Convertir en hallazgo</button>';
    else if(r.s==='conforme')h+='<button class="sm" data-a="mkhall" data-id="'+esc(q.id)+'">Registrar como punto fuerte</button>';
  }
  h+='</details></article>';
  return h;
}
function evidenciaPrevia(q){
  const out=[];
  SESIONES.forEach(s=>{
    if(s.id===q.ses||esCheck(s))return;
    QS[s.id].forEach(x=>{if(x.k!=='c'&&x.ref.includes(q.ref[0])&&R(x.id).s!=='pendiente')out.push({ses:s,q:x});});
  });
  return out;
}
function refreshQ(id){
  const q=QBYID[id];const el=document.getElementById('q-'+id);if(!q||!el)return;
  const mostrar=!!el.querySelector('a.badge');
  const tmp=document.createElement('div');tmp.innerHTML=cardQ(q,{mostrarSes:mostrar});
  const nuevo=tmp.firstElementChild;
  const dn=nuevo.querySelector('details.notas'),dv=el.querySelector('details.notas');
  if(dn&&dv&&dv.open)dn.open=true;
  const lq=nuevo.querySelector('details.lvq'),lo=el.querySelector('details.lvq');
  if(lq&&lo&&lo.open)lq.open=true;
  el.replaceWith(nuevo);
  const hd=$('#prog-ses');if(hd)hd.innerHTML=progHTML(SES[q.ses]);
}
function progHTML(ses){
  const p=prog(ses);const c=contar(ses);
  const hall=['ncmayor','ncmenor','obs','om'].filter(k=>c[k]).map(k=>'<span class="badge '+TIPOS[k].c+'">'+TIPOS[k].abbr+' '+c[k]+'</span>').join('');
  return '<div class="row"><div class="bar sp"><i style="width:'+p.pct+'%"></i></div><span class="small mut">'+p.hechas+'/'+p.total+' ('+p.pct+'%)</span></div><div style="margin-top:6px">'+hall+'</div>';
}

/* ---------- Vista: Sesión ---------- */
function vSesion(id){
  const s=SES[id];if(!s)return '<div class="wrap"><p>Sesión no encontrada. <a href="#/plan">Volver</a></p></div>';
  const g=GUIAS[s.guia];
  let h='<div class="wrap"><p class="small"><a href="#/plan">← Volver al plan</a></p>';
  h+='<div class="card"><div class="meta small mut">'+esc(DIA_NOMBRE[s.dia])+' · '+esc(s.hora)+' · '+esc(s.grupo)+'</div><h1>'+esc(s.nombre)+'</h1>';
  h+='<p class="small"><b>Auditados:</b> '+esc(s.aud.join(' · '))+'<br><b>Auditores:</b> '+esc(s.ads.join(', '))+'<br><b>Cláusulas / controles ISO 27001 en el cronograma:</b> '+esc(s.std)+'</p>';
  if(s.nota)h+='<p class="small"><span class="badge b-sug">Verificar</span> '+esc(s.nota)+'</p>';
  if(g&&!['pendientes','informe'].includes(s.guia))h+='<div id="prog-ses">'+progHTML(s)+'</div>';
  h+='</div>';
  if(!g){
    h+='<div class="card soft"><p><b>Esta sesión la conduce '+esc(s.ads.join(', '))+'; usted no está asignado.</b> No hay guía de preguntas. Pida el resumen de hallazgos en la reunión de equipo diaria.</p>'+(s.cubreSet.size?'<p class="small">Cubre: '+refsHTML(Array.from(s.cubreSet).filter(x=>x!=='A.*'))+'</p>':'')+'</div>';
    return h+'</div>';
  }
  const tabs=[['preparar','1 · Preparar'],['preguntar',['equipo','pendientes','informe'].includes(s.guia)?'2 · Trabajo':'2 · '+(g.etiqueta||'Preguntar')],['cerrar','3 · Cerrar']];
  h+='<div class="tabs" role="tablist">'+tabs.map(t=>'<button role="tab" class="'+(tabSes===t[0]?'on':'')+'" data-a="tab" data-t="'+t[0]+'">'+t[1]+'</button>').join('')+'</div>';
  h+=tabSes==='preparar'?sPreparar(s,g):tabSes==='preguntar'?sPreguntar(s,g):sCerrar(s,g);
  return h+'</div>';
}
function avisosSesion(s){return REVISION.filter(r=>r.s.includes(s.id)).map(r=>'<div class="card '+(r.sev==='alta'?'bad':'warn')+'"><b>Atención de cronograma · '+esc(r.t)+'</b><p class="small" style="margin:4px 0 0">'+esc(r.a)+'</p></div>').join('');}
function sPreparar(s,g){
  let h='<div class="card"><h2>Qué debe demostrar</h2><p>'+esc(g.objetivo)+'</p><h3>En simple</h3><p>'+esc(g.simple)+'</p></div>';
  h+=avisosSesion(s);
  if(g.prep&&g.prep.length)h+='<div class="card"><h2>Solicite antes de entrar</h2>'+g.prep.map((t,i)=>'<label class="chk"><input type="checkbox" data-a="prep" data-k="'+esc(s.id+':'+i)+'" '+(S.prep[s.id+':'+i]?'checked':'')+'><span>'+esc(t)+'</span></label>').join('')+'</div>';
  const refs=Array.from(s.cubreSet).filter(x=>x!=='A.*');
  const sug=new Set();QS[s.id].forEach(q=>{if(q.sug)q.ref.forEach(r=>sug.add(r));});
  if(refs.length||sug.size){
    h+='<div class="card"><h2>Requisitos que cubre</h2>';
    if(refs.length)h+='<p class="small mut" style="margin-bottom:4px">Según el cronograma (toque uno para ver qué significa):</p><p>'+refsHTML(refs)+'</p>';
    if(sug.size)h+='<p class="small mut" style="margin-bottom:4px">Sugeridos por mí (no están en el cronograma):</p><p>'+refsHTML(Array.from(sug).filter(x=>!s.cubreSet.has(x)))+'</p>';
    h+='</div>';
  }
  if(TRANS_GUIAS.includes(s.guia))h+='<details class="card"><summary>Cómo entrevistar sin ser técnico (5 reglas)</summary><ol class="qa">'+TECNICAS.slice(0,5).map(t=>'<li><b>'+esc(t[0])+'.</b> '+esc(t[1])+'</li>').join('')+'</ol><p class="small"><a href="#/biblioteca">Ver método completo, técnicas y glosario</a></p></details>';
  h+='<div class="row noprint"><button class="primary" data-a="tab" data-t="preguntar">Ir a las preguntas →</button></div>';
  return h;
}
function sPreguntar(s,g){
  if(s.guia==='pendientes')return sPendientes();
  if(s.guia==='informe')return sInforme();
  if(s.guia==='soa')return sSoA(s,g);
  const qs=QS[s.id];let h='';
  if(s.guia==='equipo')h+=sHallazgosDia(s);
  const base=qs.filter(q=>q.k==='g'),tr=qs.filter(q=>q.k==='t');
  if(!esCheck(s))h+='<div class="filters">'+[['todas','Todas'],['pend','Pendientes'],['hecha','Respondidas']].map(x=>'<button class="'+(filtroQ===x[0]?'on':'')+'" data-a="fq" data-f="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>';
  const filt=esCheck(s)||filtroQ==='todas'?(()=>true):filtroQ==='pend'?(q=>R(q.id).s==='pendiente'):(q=>R(q.id).s!=='pendiente');
  h+=base.filter(filt).map(q=>cardQ(q)).join('')||'<p class="mut">No hay preguntas en este filtro.</p>';
  const trf=tr.filter(filt);
  if(trf.length)h+='<details class="card" '+(tr.some(q=>R(q.id).s!=='pendiente')?'open':'')+'><summary>Preguntas transversales (para cualquier entrevistado, '+trf.length+')</summary><p class="small mut">Úselas con 1 o 2 personas de este proceso. Cubren política, objetivos, capacitación, reporte de incidentes.</p>'+trf.map(q=>cardQ(q)).join('')+'</details>';
  return h;
}
function sSoA(s,g){
  const qs=QS[s.id];const ver=qs.filter(q=>q.k==='g'),ctr=qs.filter(q=>q.k==='c');
  let h='<div class="card soft"><b>Alcance de esta sesión:</b> la Declaración de Aplicabilidad de la empresa marca «Aplica» en los <b>'+ctr.length+'</b> controles, por lo tanto los '+ctr.length+' deben auditarse. <b>Paso 1.</b> Valide el SoA como documento. <b>Paso 2.</b> Recorra los controles, empezando por los pendientes.</div>';
  h+='<h2>Verificaciones del documento</h2>'+ver.map(q=>cardQ(q)).join('');
  const c={pend:0,hecha:0};ctr.forEach(q=>R(q.id).s==='pendiente'?c.pend++:c.hecha++);
  h+='<h2 style="margin-top:20px">Controles del Anexo A a auditar ('+ctr.length+')</h2><p class="small">Pendientes: <b>'+c.pend+'</b> · Respondidos: <b>'+c.hecha+'</b></p>';
  const opts=[['pend','Pendientes'],['5','A.5 Organizacionales'],['6','A.6 Personas'],['7','A.7 Físicos'],['8','A.8 Tecnológicos'],['sin','Sin revisión esta semana'],['todos','Todos']];
  h+='<div class="filters">'+opts.map(x=>'<button class="'+(filtroSoA===x[0]?'on':'')+'" data-a="fs" data-f="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>';
  const filt=q=>{const f=filtroSoA;if(f==='todos')return true;if(f==='pend')return R(q.id).s==='pendiente';if(f==='sin')return R(q.id).s==='pendiente'&&evidenciaPrevia(q).length===0;return q.ctrl[0].split('.')[1]===f;};
  h+=(ctr.filter(filt).map(q=>cardQ(q)).join('')||'<p class="mut">Nada en este filtro.</p>');
  return h;
}
function sHallazgosDia(s){
  const hs=S.hall.filter(x=>SES[x.ses]&&SES[x.ses].dia===s.dia);
  let h='<div class="card"><h2>Hallazgos del día ('+hs.length+')</h2>';
  if(!hs.length)h+='<p class="mut small">Aún no hay hallazgos registrados hoy.</p>';
  hs.forEach(x=>{h+='<p><a href="#/hallazgo/'+x.id+'">'+x.id+'</a> '+badgeH(x.tipo)+' <span class="small">'+esc(acapite(x))+' — '+esc(resumenH(x).slice(0,120))+'</span> '+(x.validado?'<span class="badge t-ok">validado</span>':'<span class="badge t-seg">sin validar</span>')+'</p>';});
  h+='<div class="row"><button class="sm" data-a="nuevoh">+ Nuevo hallazgo</button><a class="btn sm" href="#/formatos">Generar formatos del día</a></div></div>';
  return h;
}
function sPendientes(){
  let h='<div class="card soft">Aquí se juntan automáticamente las preguntas que quedaron <b>pendientes</b> o en <b>seguimiento</b> en todas sus sesiones. Complete cada una con evidencia y márquela.</div>';
  let n=0;
  SESIONES.filter(esFormato).forEach(ses=>{
    if(ses.guia==='soa')return;
    const qs=QS[ses.id].filter(q=>q.k==='g'&&['pendiente','seguimiento'].includes(R(q.id).s));
    if(!qs.length)return;
    h+='<h3 style="margin-top:16px">'+esc(ses.nombre)+' <span class="mut small">('+qs.length+')</span></h3>'+qs.map(q=>{n++;return cardQ(q,{mostrarSes:true});}).join('');
  });
  const soaPend=QS.soa.filter(q=>q.k==='c'&&R(q.id).s==='pendiente').length;
  if(!n)h+='<div class="card"><p>No hay preguntas pendientes en sus sesiones. ✔</p></div>';
  if(soaPend)h+='<div class="card warn">Además hay <b>'+soaPend+' controles del Anexo A</b> sin revisar. <a href="#/sesion/soa">Ir a la sesión de SoA</a></div>';
  return h;
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
function sInforme(){
  const c=resumenHall();
  let h='<div class="card soft">Borrador automático con sus hallazgos registrados. Ajuste el texto y cópielo a Word.</div>';
  h+='<div class="grid c4"><div class="card kpi"><b>'+c.ncmayor+'</b><span>NC mayores</span></div><div class="card kpi"><b>'+c.ncmenor+'</b><span>NC menores</span></div><div class="card kpi"><b>'+c.obs+'</b><span>Observaciones</span></div><div class="card kpi"><b>'+c.om+'</b><span>Oport. de mejora</span></div></div>';
  h+='<div class="card"><label for="concl">Conclusión del equipo (usted la redacta)</label><textarea id="concl" data-f="concl" placeholder="Grado de cumplimiento de los criterios y eficacia del SGSI, con base en la evidencia">'+esc(S.informe.conclusion)+'</textarea></div>';
  h+='<div class="row noprint" style="margin-bottom:12px"><button class="primary" data-a="copiarinf">Copiar al portapapeles</button><button data-a="docinf">Descargar para Word (.doc)</button><a class="btn" href="#/formatos">Formatos oficiales por sesión</a></div>';
  h+='<div class="preview" id="inf-prev">'+esc(informeTexto())+'</div>';
  h+='<div class="card" style="margin-top:12px"><h3>Contenido mínimo de un informe (ISO 19011, 6.6)</h3><ul class="qa small"><li>Objetivos, alcance y criterios de auditoría</li><li>Cliente, equipo auditor, fechas y lugares</li><li>Hallazgos con su evidencia objetiva</li><li>Conclusiones y grado de cumplimiento de los criterios</li><li>Opiniones divergentes no resueltas</li><li>Limitaciones del muestreo y distribución del informe</li></ul></div>';
  return h;
}

/* ---------- Cerrar sesión + datos para los formatos ---------- */
function sCerrar(s,g){
  const c=contar(s);const pend=QS[s.id].filter(q=>q.k!=='t'&&R(q.id).s==='pendiente');
  const hs=S.hall.filter(x=>x.ses===s.id);
  let h='<div class="card"><h2>Resumen de la sesión</h2><div class="row">'+Object.keys(TIPOS).filter(k=>k!=='pendiente'&&c[k]).map(k=>'<span class="badge '+TIPOS[k].c+'">'+TIPOS[k].n+': '+c[k]+'</span>').join('')+(pend.length?'<span class="badge t-pend">Pendientes: '+pend.length+'</span>':'')+'</div></div>';
  h+='<div class="card"><h2>Hallazgos de esta sesión ('+hs.length+')</h2>';
  hs.forEach(x=>{h+='<p><a href="#/hallazgo/'+x.id+'">'+x.id+'</a> '+badgeH(x.tipo)+' <span class="small">'+esc(resumenH(x).slice(0,140))+'</span> '+(x.validado?'<span class="badge t-ok">validado</span>':'<span class="badge t-seg">sin validar</span>')+'</p>';});
  if(!hs.length)h+='<p class="mut small">Sin hallazgos registrados.</p>';
  h+='<button class="sm" data-a="nuevoh" data-ses="'+esc(s.id)+'">+ Nuevo hallazgo</button></div>';
  if(esFormato(s))h+=cardFormatos(s);
  h+='<div class="card soft"><h3>Antes de salir de la sala</h3><ul class="qa small"><li>Lea en voz alta los hechos que registró y pregunte «¿Está de acuerdo con los hechos?» (es la retroalimentación diaria)</li><li>Anote qué evidencias quedaron por entregar, quién y para cuándo</li><li>Pida la firma del auditado en la retroalimentación diaria</li></ul></div>';
  if(pend.length)h+='<div class="card warn"><b>'+pend.length+' preguntas sin responder.</b> Si no hubo tiempo, márquelas «Seguimiento» para que aparezcan en «Cierre de procesos pendientes».</div>';
  h+='<div class="row noprint"><button class="'+(S.est[s.id]?'':'primary')+'" data-a="hecha" data-id="'+esc(s.id)+'">'+(S.est[s.id]?'Reabrir sesión':'Marcar sesión como completada')+'</button></div>';
  return h;
}
function cardFormatos(s){
  const d=SD(s);
  const F=(k,lab,tipo)=>'<label for="sd-'+k+'">'+lab+'</label><input type="'+(tipo||'text')+'" id="sd-'+k+'" data-sd="'+k+'" value="'+esc(d[k])+'">';
  let h='<div class="card" id="fmt-'+esc(s.id)+'"><h2>Datos para los formatos oficiales</h2><p class="small mut">Se completan solos con lo que registró. Solo ajuste lo que haga falta.</p>';
  h+='<div class="grid c2"><div>'+F('fecha','Fecha de la sesión','date')+'</div><div>'+F('area','Área auditada')+'</div><div>'+F('hIni','Hora de inicio','time')+'</div><div>'+F('hFin','Hora de conclusión','time')+'</div></div>';
  h+=F('auditado','Auditado / responsable (aparece en la retroalimentación)');
  h+=F('firmante','Nombre del auditado que firma (opcional)');
  h+='<label for="sd-personal">Personal auditado (una persona o cargo por línea)</label><textarea id="sd-personal" data-sd="personal" style="min-height:70px">'+esc(d.personal)+'</textarea>';
  h+='<label>Documentación interna revisada (Nº y nombre)</label>';
  d.docs.forEach((x,i)=>{h+='<div class="row" style="margin-bottom:6px"><input type="text" style="flex:1;margin:0" placeholder="Nº" data-sdd="'+i+'" data-k="n" value="'+esc(x.n)+'"><input type="text" style="flex:3;margin:0" placeholder="Nombre del documento" data-sdd="'+i+'" data-k="t" value="'+esc(x.t)+'"><button class="sm danger" data-a="deldoc" data-id="'+esc(s.id)+'" data-i="'+i+'" aria-label="Quitar documento">✕</button></div>';});
  h+='<button class="sm" data-a="adddoc" data-id="'+esc(s.id)+'">+ Agregar documento</button>';
  h+='<label for="sd-com" style="margin-top:12px">Comentarios / aclaraciones del auditado</label><textarea id="sd-com" data-sd="com" placeholder="Lo que el auditado aclaró o aportó al recibir la retroalimentación">'+esc(d.com)+'</textarea>';
  h+='<label for="sd-aspectos">Aspectos adicionales para la retroalimentación (opcional; uno por línea: «aspecto | evidencia o referencia»)</label><textarea id="sd-aspectos" data-sd="aspectos" style="min-height:60px">'+esc(d.aspectos)+'</textarea>';
  h+='<div class="row noprint" style="margin-top:10px"><button class="primary" data-a="genx" data-id="'+esc(s.id)+'">Formulario de hallazgos (.xlsx)</button><button class="primary" data-a="genw" data-id="'+esc(s.id)+'">Retroalimentación diaria (.docx)</button><button data-a="genz" data-id="'+esc(s.id)+'">Ambos (.zip)</button></div></div>';
  return h;
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
    docs:sd.docs.filter(x=>(x.n||x.t||'').trim()),metodos,
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

/* ---------- Vista: Formatos ---------- */
function vFormatos(){
  const ses=SESIONES.filter(esFormato);
  const dias=Array.from(new Set(ses.map(s=>s.dia)));
  const huer=S.hall.filter(x=>!x.ses||!SES[x.ses]||!esFormato(SES[x.ses]));
  let h='<div class="wrap"><h1>Formatos oficiales</h1><p class="mut small">Se llenan las plantillas reales de la empresa con lo que usted registra: <b>Formulario de hallazgos de auditoría interna (FOR-SGC-004)</b> y <b>Retroalimentación diaria al auditado</b>. Se generan en su dispositivo; nada se envía a internet.</p>';
  h+='<div class="card soft small"><b>Flujo recomendado:</b> 1) responda las preguntas, 2) convierta lo relevante en hallazgos y valídelos con el auditado, 3) al cerrar la sesión genere la retroalimentación y pida la firma, 4) al finalizar genere el formulario.</div>';
  if(huer.length)h+='<div class="card bad small"><b>'+huer.length+' hallazgo(s) sin sesión asignada</b> no saldrán en ningún formulario: '+huer.map(x=>'<a href="#/hallazgo/'+x.id+'">'+x.id+'</a>').join(', ')+'. Ábralos y elija la sesión.</div>';
  h+='<div class="row noprint" style="margin-bottom:12px"><button class="primary" data-a="genall">Generar TODO el período (.zip)</button></div>';
  dias.forEach(dia=>{
    h+='<div class="day"><b>'+DIA_NOMBRE[dia]+' de noviembre</b><span class="sp"></span><button class="sm" data-a="genday" data-d="'+dia+'">Descargar el día (.zip)</button></div>';
    ses.filter(s=>s.dia===dia).forEach(s=>{
      const hs=S.hall.filter(x=>x.ses===s.id);const c=resumenHallS(hs);const w=avisosFormato(s);
      h+='<div class="card"><div class="meta small mut">'+esc(s.hora)+'</div><h3 style="margin:2px 0 6px">'+esc(s.nombre)+'</h3>';
      h+='<div class="row" style="margin-bottom:6px">'+(hs.length?['ncmayor','ncmenor','obs','om','fortaleza'].filter(k=>c[k]).map(k=>'<span class="badge '+HCLASE[k]+'">'+esc(HTIPOS[k])+': '+c[k]+'</span>').join(''):'<span class="badge t-pend">Sin hallazgos</span>')+'</div>';
      if(w.length)h+='<details class="small"><summary>'+w.length+' aviso(s) antes de generar</summary><ul class="qa">'+w.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></details>';
      h+='<div class="row noprint" style="margin-top:8px"><button class="primary sm" data-a="genx" data-id="'+esc(s.id)+'">Formulario (.xlsx)</button><button class="primary sm" data-a="genw" data-id="'+esc(s.id)+'">Retroalimentación (.docx)</button><a class="btn sm" href="#/sesion/'+esc(s.id)+'" data-a="irc" data-id="'+esc(s.id)+'">Editar datos</a></div></div>';
    });
  });
  return h+'</div>';
}
function resumenHallS(hs){const c={ncmayor:0,ncmenor:0,obs:0,om:0,fortaleza:0};hs.forEach(x=>{if(c[x.tipo]!=null)c[x.tipo]++;});return c;}

/* ---------- Vista: Hallazgos ---------- */
function vHallazgos(){
  const c=resumenHall();
  let h='<div class="wrap"><div class="row"><h1 style="margin:0">Hallazgos</h1><span class="sp"></span><button class="primary noprint" data-a="nuevoh">+ Nuevo</button></div>';
  h+='<div class="grid c4" style="margin-top:12px"><div class="card kpi"><b>'+c.ncmayor+'</b><span>NC mayores</span></div><div class="card kpi"><b>'+c.ncmenor+'</b><span>NC menores</span></div><div class="card kpi"><b>'+c.obs+'</b><span>Observaciones</span></div><div class="card kpi"><b>'+c.om+'</b><span>Mejoras</span></div></div>';
  const fl=[['todos','Todos'],['ncmayor','NC mayor'],['ncmenor','NC menor'],['obs','Observación'],['om','Mejora'],['fortaleza','Punto fuerte'],['sinval','Sin validar']];
  h+='<div class="filters">'+fl.map(x=>'<button class="'+(filtroH===x[0]?'on':'')+'" data-a="fh" data-f="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>';
  const lista=S.hall.filter(x=>filtroH==='todos'||(filtroH==='sinval'?!x.validado:x.tipo===filtroH));
  if(!lista.length)h+='<div class="card"><p class="mut">Aún no hay hallazgos'+(S.hall.length?' en este filtro':'')+'. Se crean desde una pregunta con el botón «Convertir en hallazgo», o con «+ Nuevo».</p></div>';
  lista.forEach(x=>{
    const q=calidadH(x);
    h+='<a class="card ses" href="#/hallazgo/'+x.id+'"><div class="row"><b>'+x.id+'</b>'+badgeH(x.tipo)+(x.validado?'<span class="badge t-ok">validado</span>':'<span class="badge t-seg">sin validar</span>')+(q.filter(t=>!/Valide los hechos/.test(t)).length?'<span class="badge b-sug">'+q.filter(t=>!/Valide los hechos/.test(t)).length+' por completar</span>':'<span class="badge t-ok">completo</span>')+'</div><div class="small mut">'+esc(x.ses&&SES[x.ses]?SES[x.ses].nombre:'')+(acapite(x)?' · '+esc(acapite(x)):'')+'</div><p style="margin:6px 0 0">'+esc(resumenH(x))+'</p></a>';
  });
  h+='<div class="row noprint"><button data-a="csvh">Exportar hallazgos (Excel/CSV)</button><a class="btn" href="#/formatos">Generar formatos oficiales</a><button data-a="print">Imprimir</button></div></div>';
  return h;
}
function campoH(x,k,lab,phd,rows){return '<label for="hf-'+k+'">'+lab+'</label><textarea id="hf-'+k+'" data-hf="'+k+'" placeholder="'+esc(phd||'')+'" style="min-height:'+(rows||70)+'px">'+esc(x[k]||'')+'</textarea>';}
function vHallazgo(id){
  const x=S.hall.find(z=>z.id===id);
  if(!x)return '<div class="wrap"><p>Hallazgo no encontrado. <a href="#/hallazgos">Volver</a></p></div>';
  const ops=Object.keys(HTIPOS).map(k=>'<option value="'+k+'" '+(x.tipo===k?'selected':'')+'>'+esc(HTIPOS[k])+'</option>').join('');
  const sopts=SESIONES.filter(esFormato).map(s=>'<option value="'+s.id+'" '+(x.ses===s.id?'selected':'')+'>'+esc(DIA_NOMBRE[s.dia]+' – '+s.nombre)+'</option>').join('');
  const t=x.tipo,rd=REDACCION[esNC(t)?'ncmayor':t];
  let h='<div class="wrap"><p class="small"><a href="#/hallazgos">← Hallazgos</a></p><div class="card"><div class="row"><h1 style="margin:0">'+x.id+'</h1><span id="h-badge">'+badgeH(x.tipo)+'</span></div>';
  h+='<label for="hf-tipo">Clasificación</label><select id="hf-tipo" data-hf="tipo">'+ops+'</select>';
  h+='<div class="card soft small" style="margin:6px 0"><b>'+esc(rd.n)+':</b> '+esc(rd.est)+'<br><i>Modelo: '+esc(rd.resumen)+'</i></div>';
  h+='<label for="hf-ses">Sesión / proceso</label><select id="hf-ses" data-hf="ses"><option value="">—</option>'+sopts+'</select>';
  h+='<label for="hf-aud">Auditado / responsable</label><input type="text" id="hf-aud" data-hf="aud" value="'+esc(x.aud)+'">';
  h+='<label for="hf-ref">Requisito (ids separados por coma, ej. A.8.13, 6.1.2)</label><input type="text" id="hf-ref" data-hf="ref" value="'+esc(x.ref)+'" list="idlist"><datalist id="idlist">'+Object.keys(REFS).map(k=>'<option value="'+k+'">'+esc(REFS[k].t)+'</option>').join('')+'</datalist>';
  h+='<label for="hf-doc">Acápite / documento interno (si lo deja vacío se usa el requisito de la norma)</label><input type="text" id="hf-doc" data-hf="doc" value="'+esc(x.doc)+'" placeholder="Ej.: Procedimiento de Gestión de Proveedores, acápite 5.2">';
  if(esNC(t)){
    h+=campoH(x,'criterio','1 · Criterio: qué establece el requisito o el procedimiento («se establece que…»)','Ej.: los proveedores deben ser evaluados anualmente');
    h+=campoH(x,'sit','2 · Situación encontrada («se evidenció que…»)','Ej.: de una muestra de 10 proveedores, 3 no contaban con evidencia de evaluación del período auditado',90);
    h+=campoH(x,'extra','3 · Evidencia adicional (opcional: «Además de lo anterior…»)','');
    h+=campoH(x,'concl','4 · Conclusión («no se logra asegurar que…»)','Ej.: en todos los casos se cumple con la evaluación y seguimiento de proveedores');
    h+=campoH(x,'evid','Evidencia / muestra revisada (columna «Evidencia» del formulario)','Documentos, registros, tamaño de la muestra, quién los mostró',70);
    h+='<div class="card soft"><b>Gravedad según los criterios de la empresa (FOR-SGC-004)</b><p class="small">Marque los que se cumplan. Basta uno para que sea MAYOR.</p>'+DEF_NC.mayor.cuando.map((c,i)=>'<label class="chk"><input type="checkbox" data-hg="'+i+'" '+((x.grav||[])[i]?'checked':'')+'><span>'+esc(c)+'</span></label>').join('')+'<div id="h-grav" class="small" style="margin-top:6px"></div></div>';
    h+=campoH(x,'causa','Causa (si se determinó con el auditado; opcional)','',50);
  }else if(t==='obs'){
    h+=campoH(x,'sit','1 · Situación encontrada («se evidenció que…»)','',90);
    h+=campoH(x,'riesgo','2 · Riesgo o consecuencia potencial («podría…»)','Ej.: pérdida de trazabilidad ante la ausencia del responsable');
  }else if(t==='om'){
    h+=campoH(x,'sit','1 · Situación actual que cumple el requisito','',90);
    h+=campoH(x,'mejora','2 · Posibilidad de mejora («una oportunidad para…»)','');
    h+=campoH(x,'benef','3 · Beneficio esperado («con el propósito de…»)','');
  }else{
    h+=campoH(x,'practica','1 · Práctica destacada («como punto fuerte que…»)','',80);
    h+=campoH(x,'evid','2 · Evidencia («mediante…»)','');
    h+=campoH(x,'benef','3 · Beneficio («contribuye a…»)','');
  }
  h+='<label class="chk"><input type="checkbox" data-hf="validado" '+(x.validado?'checked':'')+'><span>Los hechos fueron <b>validados con el auditado</b></span></label></div>';
  h+='<div class="card"><h3>Calidad del hallazgo</h3><div id="h-cal"></div></div><div class="card"><h3>Texto final (así saldrá en el formulario)</h3><div class="preview" id="h-prev"></div></div>';
  h+='<details class="card"><summary>Ver ejemplo de la empresa</summary><p class="small" style="margin-top:8px">'+esc(rd.ejemplo)+'</p></details>';
  h+='<div class="row noprint"><button class="danger" data-a="delh" data-id="'+x.id+'">Eliminar</button><span class="sp"></span>'+(x.ses?'<a class="btn" href="#/formatos">Generar formatos</a>':'')+'<a class="btn" href="#/hallazgos">Listo</a></div></div>';
  setTimeout(()=>refreshH(x.id),0);
  return h;
}
function refreshH(id){
  const x=S.hall.find(z=>z.id===id);if(!x)return;
  const cal=calidadH(x);
  const c=$('#h-cal');if(c)c.innerHTML=cal.length?'<ul class="qa small">'+cal.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul>':'<p class="small"><span class="badge t-ok">Completo</span> Cumple los criterios de calidad.</p>';
  const p=$('#h-prev');if(p)p.textContent=hallTexto(x);
  const b=$('#h-badge');if(b)b.innerHTML=badgeH(x.tipo);
  const g=$('#h-grav');if(g){const m=(x.grav||[]).some(Boolean);g.innerHTML=m?'<span class="badge t-ncM">Sugerencia: NC MAYOR</span> se cumple al menos un criterio de gravedad.':'<span class="badge t-ncm">Sugerencia: NC MENOR</span> ningún criterio de gravedad marcado.';}
}

/* ---------- Vista: Lista de verificación FOR-SGI-10 ---------- */
const LV_CAPS=[['4','4 Contexto'],['5','5 Liderazgo'],['6','6 Planificación'],['7','7 Apoyo'],['8','8 Operación'],['9','9 Evaluación'],['10','10 Mejora'],['A.5','A.5 Organizacionales'],['A.6','A.6 Personas'],['A.7','A.7 Físicos'],['A.8','A.8 Tecnológicos']];
const lvCap=r=>r.startsWith('A.')?r.split('.').slice(0,2).join('.'):r.split('.')[0];
function vLista(){
  const tot=LISTA.length;const v={si:0,no:0,na:0};LISTA.forEach((x,i)=>{const s=(S.lv[i]||{}).s;if(s)v[s]++;});
  let h='<div class="wrap"><h1>Lista de verificación FOR-SGI-10</h1><p class="mut small">Lista oficial de la empresa para ISO 27001 (versión 01). Las mismas cuestiones aparecen dentro de cada pregunta de las guías: lo que marque aquí o allá es lo mismo.</p>';
  h+='<div class="grid c4"><div class="card kpi"><b>'+(v.si+v.no+v.na)+'/'+tot+'</b><span>Cuestiones marcadas</span></div><div class="card kpi"><b>'+v.si+'</b><span>Sí</span></div><div class="card kpi"><b>'+v.no+'</b><span>No</span></div><div class="card kpi"><b>'+v.na+'</b><span>N/A</span></div></div>';
  h+='<div class="filters">'+LV_CAPS.map(c=>'<button class="'+(filtroLV===c[0]?'on':'')+'" data-a="flv" data-f="'+c[0]+'">'+c[1]+'</button>').join('')+'</div>';
  const items=LISTA.map((x,i)=>({x,i})).filter(o=>lvCap(o.x[0])===filtroLV);
  items.forEach(o=>{
    const st=S.lv[o.i]||{};
    h+='<div class="card"><div class="row"><span class="chip">'+esc(o.x[0])+'</span><b>'+esc(o.x[2])+'</b></div><p class="small" style="margin:6px 0">'+esc(o.x[3])+'</p>'+lvBtns(o.i)+'<textarea data-lvc="'+o.i+'" placeholder="Comentarios" style="min-height:50px">'+esc(st.c||'')+'</textarea>'+(st.s==='no'?'<button class="sm primary" data-a="lvh" data-i="'+o.i+'">Crear hallazgo</button>':'')+'</div>';
  });
  const hs=S.hall.filter(x=>refsDe(x).some(r=>lvCap(r)===filtroLV));
  h+='<div class="card soft"><h3>Hallazgos del capítulo ('+hs.length+')</h3>'+(hs.length?hs.map(x=>'<p class="small"><a href="#/hallazgo/'+x.id+'">'+x.id+'</a> '+badgeH(x.tipo)+' '+esc(resumenH(x).slice(0,160))+'</p>').join(''):'<p class="small mut">Sin hallazgos registrados para este capítulo.</p>')+'</div>';
  h+='<div class="row noprint"><button data-a="csvlv">Exportar lista (Excel/CSV)</button><button data-a="print">Imprimir</button></div></div>';
  return h;
}

/* ---------- Cobertura ---------- */
function vCobertura(){
  const cob=cobertura();
  const cl=CLAUSULAS.map(c=>cob[c[0]]),ct=CONTROLES.map(c=>cob[c[0]]);
  const clAsig=cl.filter(x=>x.asig.length).length,ctAsig=ct.filter(x=>x.asig.length).length;
  const ctVer=ct.filter(x=>x.verif>0).length,ctNC=ct.filter(x=>['ncmayor','ncmenor'].includes(x.peor)).length;
  let h='<div class="wrap"><h1>Cobertura de la auditoría</h1><p class="mut small">Muestra qué requisitos están asignados a un proceso en el cronograma y cuáles ha verificado usted realmente. Solo cuentan las preguntas respondidas con resultado (no las pendientes).</p>';
  h+='<div class="grid c4"><div class="card kpi"><b>'+clAsig+'/'+cl.length+'</b><span>Cláusulas con proceso asignado</span></div><div class="card kpi"><b>'+ctAsig+'/'+SOA_APLICA.length+'</b><span>Controles con proceso asignado</span></div><div class="card kpi"><b>'+ctVer+'/'+SOA_APLICA.length+'</b><span>Controles verificados</span></div><div class="card kpi"><b>'+ctNC+'</b><span>Controles con NC</span></div></div>';
  h+='<div class="card warn small"><b>Lectura crítica:</b> el SoA marca «Aplica» en '+SOA_APLICA.length+' controles, así que todos deben auditarse. '+(SOA_APLICA.length-ctAsig)+' controles solo están en la sesión SoA del viernes 13. Es legítimo si el programa de auditoría lo justifica por riesgo, pero debe quedar documentado.</div>';
  const fl=[['todos','Todos'],['sinproc','Sin proceso asignado'],['sinver','Sin verificar'],['nc','Con NC / observación']];
  h+='<div class="filters">'+fl.map(x=>'<button class="'+(filtroCob===x[0]?'on':'')+'" data-a="fc" data-f="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>';
  const ok=x=>filtroCob==='todos'||(filtroCob==='sinproc'&&!x.asig.length)||(filtroCob==='sinver'&&x.verif===0)||(filtroCob==='nc'&&['ncmayor','ncmenor','obs'].includes(x.peor));
  const fila=x=>{
    const r=REFS[x.id];
    const asig=x.asig.length?x.asig.map(i=>'<a href="#/sesion/'+i+'" class="chip">'+esc(SES[i].nombre.replace(/^Gestión (de la |de los |de )?/,'').replace(/\s*\(.*$/,'').slice(0,34))+'</a>').join(''):(x.soloSoA?'<span class="badge b-sug">solo SoA</span>':'<span class="badge t-ncM">sin asignar</span>');
    return '<tr><td><button class="ref" data-a="ref" data-id="'+x.id+'">'+x.id+'</button></td><td>'+esc(r.t)+'</td><td>'+asig+'</td><td>'+x.qs.length+'</td><td>'+(x.peor==='pendiente'?'<span class="badge t-pend">Sin verificar</span>':badge(x.peor))+'</td></tr>';
  };
  const tabla=(titulo,arr)=>{const f=arr.filter(ok);return f.length?'<h2 style="margin-top:18px">'+esc(titulo)+'</h2><div class="card tbl"><table><thead><tr><th>Id</th><th>Requisito</th><th>Proceso</th><th>Preg.</th><th>Resultado</th></tr></thead><tbody>'+f.map(fila).join('')+'</tbody></table></div>':'';};
  h+=tabla('Cláusulas 4 a 10',cl);
  [5,6,7,8].forEach(t=>{h+=tabla(TEMAS[t],ct.filter(x=>x.id.split('.')[1]==String(t)));});
  return h+'</div>';
}

/* ---------- Cronograma / revisión crítica ---------- */
function vCronograma(){
  let h='<div class="wrap"><p class="small"><a href="#/mas">← Más</a></p><h1>Revisión crítica del cronograma</h1><p class="mut small">Estas observaciones son mías, basadas solo en lo que dice el Excel. Verifíquelas con el líder del equipo antes de darlas por válidas: pueden existir acuerdos que no están en la matriz.</p>';
  const lab={alta:'Prioridad alta',media:'Prioridad media',baja:'Prioridad baja'};
  ['alta','media','baja'].forEach(sev=>{
    REVISION.filter(r=>r.sev===sev).forEach(r=>{
      h+='<div class="card '+(sev==='alta'?'bad':sev==='media'?'warn':'')+'"><span class="badge '+(sev==='alta'?'t-ncM':sev==='media'?'t-obs':'t-na')+'">'+lab[sev]+'</span><h3 style="margin-top:6px">'+esc(r.t)+'</h3><p class="small">'+esc(r.d)+'</p><p class="small"><b>Qué hacer:</b> '+esc(r.a)+'</p>'+(r.s.length?'<p class="small mut">Afecta a: '+r.s.map(i=>'<a href="#/sesion/'+i+'">'+esc(SES[i].nombre)+'</a>').join(' · ')+'</p>':'')+'</div>';
    });
  });
  h+='<h2 style="margin-top:20px">Cronograma completo</h2><div class="card tbl"><table><thead><tr><th>Día</th><th>Hora</th><th>Proceso</th><th>Auditados</th><th>Auditores</th><th>ISO 27001</th></tr></thead><tbody>';
  SESIONES.forEach(s=>{h+='<tr class="'+(esMia(s)?'mine':'')+'"><td>'+esc(DIA_NOMBRE[s.dia])+'</td><td>'+esc(s.hora)+'</td><td><a href="#/sesion/'+s.id+'">'+esc(s.nombre)+'</a></td><td>'+esc(s.aud.join(', '))+'</td><td>'+esc(s.ads.join(', '))+'</td><td>'+esc(s.std)+'</td></tr>';});
  return h+'</tbody></table></div><p class="small mut">La franja azul marca las sesiones en las que usted participa.</p></div>';
}

/* ---------- Biblioteca ---------- */
function vBiblioteca(){
  const tabs=[['clausulas','Cláusulas'],['anexo','Anexo A'],['glosario','Glosario'],['metodo','Método'],['tecnicas','Técnicas'],['clasif','Clasificación'],['redac','Redacción']];
  let h='<div class="wrap"><p class="small"><a href="#/mas">← Más</a></p><h1>Biblioteca</h1><div class="tabs">'+tabs.map(t=>'<button class="'+(tabBib===t[0]?'on':'')+'" data-a="tb" data-t="'+t[0]+'">'+t[1]+'</button>').join('')+'</div>';
  const q=busqueda.toLowerCase();const filt=a=>a.filter(r=>!q||r.join(' ').toLowerCase().includes(q));
  const buscador='<input type="search" id="busca" placeholder="Buscar…" value="'+esc(busqueda)+'" aria-label="Buscar">';
  const fichaN=c=>'<div class="card"><b>'+c[0]+' · '+esc(c[1])+'</b><p class="small" style="margin:4px 0">'+esc(c[2])+'</p><p class="small mut" style="margin:0"><b>Evidencia típica:</b> '+esc(c[3])+'</p></div>';
  if(tabBib==='clausulas')h+=buscador+filt(CLAUSULAS).map(fichaN).join('');
  else if(tabBib==='anexo'){h+=buscador;[5,6,7,8].forEach(t=>{const l=filt(CONTROLES.filter(c=>c[0].split('.')[1]==String(t)));if(l.length)h+='<h2 style="margin-top:14px">'+TEMAS[t]+'</h2>'+l.map(fichaN).join('');});}
  else if(tabBib==='glosario')h+=buscador+filt(GLOSARIO).map(g=>'<div class="card"><b>'+esc(g[0])+'</b><p class="small" style="margin:4px 0">'+esc(g[1])+'</p>'+(g[2]?'<p class="small mut" style="margin:0"><b>Al auditar:</b> '+esc(g[2])+'</p>':'')+'</div>').join('');
  else if(tabBib==='metodo')h+=metodoHTML();
  else if(tabBib==='tecnicas')h+='<p class="mut small">Pensadas para quien audita procesos técnicos sin ser técnico: se audita la evidencia, no la tecnología.</p>'+TECNICAS.map((t,i)=>'<div class="card"><b>'+(i+1)+'. '+esc(t[0])+'</b><p class="small" style="margin:4px 0 0">'+esc(t[1])+'</p></div>').join('');
  else if(tabBib==='clasif')h+=clasifHTML();
  else h+=redacHTML();
  return h+'</div>';
}
function metodoHTML(){
  const li=a=>'<ul class="qa small">'+a.map(x=>'<li>'+x+'</li>').join('')+'</ul>';
  return '<p class="mut small">Resume el método de la empresa (Formulario FOR-SGC-004 y Lista de verificación FOR-SGI-10) y cómo lo aplica esta herramienta.</p>'+
  '<div class="card"><h3>Los 4 métodos de auditoría del formulario</h3>'+li(['<b>Revisión documental:</b> políticas, procedimientos, registros. Anote Nº y nombre en «Documentación interna revisada».','<b>Entrevistas:</b> use las preguntas de la guía y las transversales con varias personas del proceso.','<b>Observación:</b> recorridos, pantallas, puestos de trabajo, consolas en vivo.','<b>Muestreo:</b> elija usted la muestra y anote su tamaño (ej.: «3 de 10 proveedores»).'])+'<p class="small">En cada pregunta marque los métodos usados: el formulario se llena solo con esas marcas.</p></div>'+
  '<div class="card"><h3>Secuencia de cada sesión</h3>'+li(['<b>1 · Preparar:</b> pida los documentos antes y lea el objetivo.','<b>2 · Preguntar:</b> guía + lista de verificación FOR-SGI-10 (Sí / No) + notas con evidencia y método.','<b>Retroalimentación:</b> al terminar la jornada lea los aspectos identificados al auditado, anote sus aclaraciones y pida firma.','<b>3 · Cerrar:</b> convierta lo relevante en hallazgos y valídelos; genere los formatos.','<b>Reunión de equipo (17:00):</b> calibre la clasificación con el equipo.'])+'</div>'+
  '<div class="card"><h3>Regla general de clasificación</h3>'+li(['<b>No conformidad:</b> existe incumplimiento demostrado.','<b>Observación:</b> situación que podría generar un problema, pero no se ha demostrado incumplimiento.','<b>Oportunidad de mejora:</b> cumple, pero puede hacerse mejor.','<b>Punto fuerte:</b> práctica que destaca positivamente y aporta valor.'])+'</div>'+
  '<div class="card"><h3>Evidencia suficiente</h3>'+li(['Documento o registro con fecha, versión o número identificable.','Tamaño de la muestra y criterio con que se eligió.','Quién la mostró y cuándo.','Si no se pudo verificar, no es hallazgo: márquelo «Seguimiento» y pida la evidencia.'])+'</div>';
}
function clasifHTML(){
  const li=a=>'<ul class="qa small">'+a.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>';
  const nc=(t,d)=>'<div class="card"><h3>No conformidad '+t+'</h3><p class="small">'+esc(d.def)+'</p><h4 class="small" style="margin:8px 0 2px">Se considera '+t.toLowerCase()+' cuando</h4>'+li(d.cuando)+'<h4 class="small" style="margin:8px 0 2px">Ejemplos</h4>'+li(d.ejemplos)+'<h4 class="small" style="margin:8px 0 2px">Impacto</h4>'+li(d.impacto)+'</div>';
  return '<p class="mut small">Definiciones oficiales de la empresa (Formulario FOR-SGC-004, hoja «Tipo de No Conformidad»).</p>'+DEF_CLASE.map(d=>'<div class="card"><b>'+esc(d[0])+'</b><p class="small" style="margin:4px 0 0">'+esc(d[1])+'</p></div>').join('')+nc('MAYOR',DEF_NC.mayor)+nc('MENOR',DEF_NC.menor);
}
function redacHTML(){
  return '<p class="mut small">Reglas de redacción de la empresa (Formulario FOR-SGC-004, hoja «Redacción»). El módulo de hallazgos arma el texto con estas plantillas.</p>'+['ncmayor','obs','om','fortaleza'].map(k=>{const r=REDACCION[k];return '<div class="card"><h3>'+esc(r.n)+'</h3><p class="small"><b>Estructura:</b> '+esc(r.est)+'</p><p class="small"><b>Modelo:</b> '+esc(r.plantilla)+'</p><details><summary class="small mut">Ver ejemplo</summary><p class="small">'+esc(r.ejemplo)+'</p></details><p class="small mut"><i>'+esc(r.resumen)+'</i></p></div>';}).join('');
}

/* ---------- Más / Datos ---------- */
function vMas(){
  return '<div class="wrap"><h1>Más</h1><a class="card ses" href="#/cronograma"><b>Revisión crítica del cronograma</b><br><span class="small mut">Puntos que conviene aclarar con el líder del equipo.</span></a><a class="card ses" href="#/biblioteca"><b>Biblioteca</b><br><span class="small mut">Cláusulas, Anexo A, glosario, método, técnicas, clasificación y redacción.</span></a><a class="card ses" href="#/datos"><b>Datos y respaldo</b><br><span class="small mut">Respaldar, restaurar y exportar a Excel.</span></a><p class="small mut" style="margin-top:18px">Versión '+VERSION+' · generada el '+esc(BUILD)+'</p></div>';
}
function vDatos(){
  const n=Object.values(S.resp).filter(r=>r.s!=='pendiente'||r.n||r.e).length;
  let h='<div class="wrap"><p class="small"><a href="#/mas">← Más</a></p><h1>Datos y respaldo</h1>';
  h+='<div class="card"><p>Todo lo que escribe se guarda <b>únicamente en este navegador y dispositivo</b>. No se envía a ningún servidor. Esto protege la confidencialidad de la auditoría, pero si se borran los datos del navegador, se pierden.</p><p class="small mut">Registros guardados: '+n+' respuestas · '+S.hall.length+' hallazgos.</p>'+(storageOK?'':'<p><b>Este navegador no permite guardar datos.</b> Use «Descargar respaldo» con frecuencia.</p>')+'</div>';
  h+='<div class="card"><h2>Respaldo</h2><div class="row"><button class="primary" data-a="backup">Descargar respaldo (.json)</button><label class="btn" style="margin:0;font-weight:400">Restaurar respaldo<input type="file" accept=".json" data-a="restore" class="hide"></label></div><p class="small mut">Último respaldo: '+(S.ultimoRespaldo?esc(new Date(S.ultimoRespaldo).toLocaleString()):'nunca')+'. Hágalo al final de cada día y envíelo a un lugar autorizado por la empresa.</p></div>';
  h+='<div class="card"><h2>Exportar a Excel</h2><div class="row"><button data-a="csvr">Todas las respuestas (CSV)</button><button data-a="csvh">Hallazgos (CSV)</button><button data-a="csvlv">Lista de verificación (CSV)</button></div></div>';
  h+='<div class="card"><h2>Apariencia</h2><div class="row"><button data-a="tema" data-t="auto">Automático</button><button data-a="tema" data-t="light">Claro</button><button data-a="tema" data-t="dark">Oscuro</button></div></div>';
  h+='<div class="card"><h2>Empezar de cero</h2><p class="small">Borra todas las respuestas y hallazgos de este dispositivo. Haga antes un respaldo.</p><button class="danger" data-a="reset">Borrar todo</button></div></div>';
  return h;
}

/* ---------- Modal de referencia ---------- */
function modalRef(id){
  const r=REFS[id];if(!r)return '';
  const cob=cobertura()[id];
  let h='<div class="modal" data-a="cerrar"><div role="dialog" aria-modal="true" aria-label="'+esc(id)+'"><div class="row"><h2 style="margin:0">'+esc(id)+' · '+esc(r.t)+'</h2><span class="sp"></span><button class="sm" data-a="cerrar">Cerrar</button></div>';
  h+='<p style="margin-top:10px">'+esc(r.s)+'</p><p class="small"><b>Evidencia típica:</b> '+esc(r.e)+'</p>';
  h+='<p class="small"><b>En el cronograma:</b> '+(cob.asig.length?cob.asig.map(i=>'<a href="#/sesion/'+i+'">'+esc(SES[i].nombre)+'</a>').join(', '):(cob.soloSoA?'solo en la sesión SoA (13 nov)':'no asignado'))+'</p>';
  if(cob.qs.length)h+='<p class="small"><b>Preguntas relacionadas:</b> '+cob.qs.length+' · Resultado: '+(cob.peor==='pendiente'?'sin verificar':TIPOS[cob.peor].n)+'</p>';
  return h+'</div></div>';
}

/* ---------- Eventos ---------- */
function filesDia(dia){const out=[];SESIONES.filter(s=>esFormato(s)&&s.dia===dia).forEach(s=>out.push(...generar(s)));return out;}
document.addEventListener('click',e=>{
  const el=e.target.closest('[data-a]');if(!el)return;
  const a=el.dataset.a;
  if(el.tagName==='INPUT'&&el.type==='file')return;
  if(a==='cerrar'){if(e.target.closest('div[role=dialog]')&&el.classList.contains('modal')&&e.target!==el)return;$('.modal')?.remove();return;}
  if(a==='ref'){e.preventDefault();const m=document.createElement('div');m.innerHTML=modalRef(el.dataset.id);document.body.appendChild(m.firstElementChild);return;}
  if(a==='st'){const id=el.dataset.id;const act=R(id).s;setR(id,{s:act===el.dataset.s?'pendiente':el.dataset.s});refreshQ(id);return;}
  if(a==='mt'){const id=el.dataset.id;const m=(R(id).m||[]).slice();const i=m.indexOf(el.dataset.m);if(i>=0)m.splice(i,1);else m.push(el.dataset.m);setR(id,{m});refreshQ(id);return;}
  if(a==='lv'){const i=el.dataset.i;const act=(S.lv[i]||{}).s;S.lv[i]=Object.assign({},S.lv[i],{s:act===el.dataset.s?'':el.dataset.s});save();
    const card=el.closest('article.q');if(card)refreshQ(card.dataset.id);else render();return;}
  if(a==='lvh'){const i=+el.dataset.i;const sid=sesionSugerida(LISTA[i][1]);const x=nuevoH({ses:sid});x.ref=LISTA[i][1];x.tipo='obs';x.sit='';save();location.hash='#/hallazgo/'+x.id;return;}
  if(a==='flv'){filtroLV=el.dataset.f;render();return;}
  if(a==='tab'){tabSes=el.dataset.t;render();window.scrollTo(0,0);return;}
  if(a==='fq'){filtroQ=el.dataset.f;render();return;}
  if(a==='fs'){filtroSoA=el.dataset.f;render();return;}
  if(a==='fh'){filtroH=el.dataset.f;render();return;}
  if(a==='fc'){filtroCob=el.dataset.f;render();return;}
  if(a==='tb'){tabBib=el.dataset.t;busqueda='';render();return;}
  if(a==='todos'){S.aj.todos=!S.aj.todos;save();render();return;}
  if(a==='hecha'){const id=el.dataset.id;S.est[id]=!S.est[id];save();render();return;}
  if(a==='mkhall'){const x=nuevoH({qid:el.dataset.id});location.hash='#/hallazgo/'+x.id;return;}
  if(a==='nuevoh'){const x=nuevoH({ses:el.dataset.ses||''});location.hash='#/hallazgo/'+x.id;return;}
  if(a==='delh'){if(confirm('¿Eliminar este hallazgo?')){S.hall=S.hall.filter(z=>z.id!==el.dataset.id);save();location.hash='#/hallazgos';}return;}
  if(a==='adddoc'){const d=SD(SES[el.dataset.id]).docs.slice();d.push({n:'',t:''});setSD(el.dataset.id,{docs:d});render();return;}
  if(a==='deldoc'){const d=SD(SES[el.dataset.id]).docs.slice();d.splice(+el.dataset.i,1);setSD(el.dataset.id,{docs:d});render();return;}
  if(a==='irc'){e.preventDefault();const dest='#/sesion/'+el.dataset.id;if(location.hash===dest){tabSes='cerrar';render();}else{tabNext='cerrar';location.hash=dest;}return;}
  if(a==='genx'||a==='genw'||a==='genz'){
    try{const ses=SES[el.dataset.id];const files=generar(ses,a==='genx'?'x':a==='genw'?'w':undefined);bajar(files,'Formatos_'+slug(ses.nombre)+'_'+DIAS[ses.dia]+'.zip');}
    catch(err){alert('No se pudo generar el archivo: '+err.message);}
    return;}
  if(a==='genday'){try{const d=+el.dataset.d;bajar(filesDia(d),'Formatos_'+DIAS[d]+'.zip');}catch(err){alert('No se pudo generar: '+err.message);}return;}
  if(a==='genall'){try{const out=[];Array.from(new Set(SESIONES.filter(esFormato).map(s=>s.dia))).forEach(d=>out.push(...filesDia(d)));bajar(out,'Formatos_Auditoria_ISO27001.zip');}catch(err){alert('No se pudo generar: '+err.message);}return;}
  if(a==='print'){window.print();return;}
  if(a==='copiarinf'){const t=informeTexto();(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>toast('Informe copiado')).catch(()=>{const p=$('#inf-prev');const r=document.createRange();r.selectNodeContents(p);const s=getSelection();s.removeAllRanges();s.addRange(r);toast('Seleccionado: use Copiar');});return;}
  if(a==='docinf'){descargar('Informe-Auditoria-ISO27001.doc','<html><head><meta charset="utf-8"></head><body><pre style="font-family:Calibri,Arial;font-size:11pt;white-space:pre-wrap">'+esc(informeTexto())+'</pre></body></html>','application/msword');return;}
  if(a==='backup'){S.ultimoRespaldo=new Date().toISOString();save();descargar('respaldo-auditoria-'+hoyISO()+'.json',JSON.stringify(Object.assign({app:VERSION},S),null,1),'application/json');toast('Respaldo descargado');render();return;}
  if(a==='csvr'){
    const rows=[['Sesión','Id','Requisito(s)','Pregunta','Resultado','Método','Notas','Evidencia vista']];
    SESIONES.forEach(s=>QS[s.id].forEach(q=>{const r=R(q.id);if(r.s!=='pendiente'||r.n||r.e)rows.push([s.nombre,q.id,q.ref.join(' '),q.q,TIPOS[r.s].n,(r.m||[]).map(k=>METODOS.find(m=>m[0]===k)[1]).join('; '),r.n,r.e]);}));
    descargar('respuestas-auditoria.csv','﻿'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n'),'text/csv;charset=utf-8');return;}
  if(a==='csvh'){
    const rows=[['Id','Clasificación','Sesión','Auditado','Acápite / documento','Evidencia','Texto del hallazgo','Causa','Validado']];
    S.hall.forEach(x=>rows.push([x.id,HTIPOS[x.tipo],SES[x.ses]?SES[x.ses].nombre:'',x.aud,acapite(x),x.evid,hallTexto(x),x.causa,x.validado?'Sí':'No']));
    descargar('hallazgos-auditoria.csv','﻿'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n'),'text/csv;charset=utf-8');return;}
  if(a==='csvlv'){
    const rows=[['Cláusula','Apartado','Cuestión a revisar','Cumplimiento','Comentarios']];
    LISTA.forEach((x,i)=>{const st=S.lv[i]||{};rows.push([x[0],x[2],x[3],st.s==='si'?'Sí':st.s==='no'?'No':st.s==='na'?'N/A':'',st.c||'']);});
    descargar('lista-verificacion-FOR-SGI-10.csv','﻿'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n'),'text/csv;charset=utf-8');return;}
  if(a==='tema'){setTema(el.dataset.t);return;}
  if(a==='tema-toggle'){setTema(temaEfectivo()==='dark'?'light':'dark');return;}
  if(a==='reset'){if(confirm('Se borrarán TODAS las respuestas y hallazgos de este dispositivo. ¿Continuar?')){S=defaults();save();render();toast('Datos borrados');}return;}
});
document.addEventListener('change',e=>{
  const t=e.target;
  if(t.dataset.a==='gprep'){S.gprep[t.dataset.i]=t.checked;save();render();return;}
  if(t.dataset.a==='prep'){S.prep[t.dataset.k]=t.checked;save();return;}
  if(t.dataset.a==='restore'){
    const f=t.files[0];if(!f)return;const rd=new FileReader();
    rd.onload=()=>{try{const o=JSON.parse(rd.result);if(!o||typeof o!=='object'||!o.resp)throw 0;S=migrar(o);save();render();toast('Respaldo restaurado');}catch(x){alert('El archivo no es un respaldo válido.');}};
    rd.readAsText(f);return;}
  if(t.dataset.hg!=null){const x=S.hall.find(z=>z.id===ruta().a);if(!x)return;x.grav=x.grav||[];x.grav[+t.dataset.hg]=t.checked;save();refreshH(x.id);return;}
  if(t.dataset.hf){const x=S.hall.find(z=>z.id===ruta().a);if(!x)return;const k=t.dataset.hf;x[k]=t.type==='checkbox'?t.checked:t.value;save();if(k==='tipo')render();else refreshH(x.id);}
});
document.addEventListener('input',e=>{
  const t=e.target;
  if(t.dataset.f==='n'||t.dataset.f==='e'){setR(t.dataset.id,{[t.dataset.f]:t.value});return;}
  if(t.dataset.f==='concl'){S.informe.conclusion=t.value;save();const p=$('#inf-prev');if(p)p.textContent=informeTexto();return;}
  if(t.dataset.lvc!=null){const i=t.dataset.lvc;S.lv[i]=Object.assign({},S.lv[i],{c:t.value});save();return;}
  if(t.dataset.sd){const card=t.closest('[id^=fmt-]');setSD(card.id.slice(4),{[t.dataset.sd]:t.value});return;}
  if(t.dataset.sdd!=null){const card=t.closest('[id^=fmt-]');const id=card.id.slice(4);const d=SD(SES[id]).docs.map(x=>Object.assign({},x));d[+t.dataset.sdd][t.dataset.k]=t.value;setSD(id,{docs:d});return;}
  if(t.dataset.hf&&t.type!=='checkbox'&&t.tagName!=='SELECT'){const x=S.hall.find(z=>z.id===ruta().a);if(!x)return;x[t.dataset.hf]=t.value;save();refreshH(x.id);return;}
  if(t.id==='busca'){busqueda=t.value;const pos=t.selectionStart;render();const n=$('#busca');if(n){n.focus();n.setSelectionRange(pos,pos);}}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')$('.modal')?.remove();});

/* ---------- Tema claro / oscuro ---------- */
const mqDark=window.matchMedia?matchMedia('(prefers-color-scheme: dark)'):null;
const temaEfectivo=()=>document.documentElement.getAttribute('data-theme')||(mqDark&&mqDark.matches?'dark':'light');
function pintarTema(){
  const b=$('#tema-btn');if(!b)return;const osc=temaEfectivo()==='dark';
  $('.i',b).textContent=osc?'☀️':'🌙';$('.t',b).textContent=osc?'Modo claro':'Modo oscuro';
  b.setAttribute('aria-label',osc?'Cambiar a modo claro':'Cambiar a modo oscuro');b.title=osc?'Cambiar a modo claro':'Cambiar a modo oscuro';
}
function setTema(t){
  if(t==='auto')document.documentElement.removeAttribute('data-theme');else document.documentElement.setAttribute('data-theme',t);
  try{localStorage.setItem(KEY+'-tema',t);}catch(e){}
  pintarTema();
}
if(mqDark&&mqDark.addEventListener)mqDark.addEventListener('change',pintarTema);

/* ---------- Arranque ---------- */
(function(){
  try{const t=localStorage.getItem(KEY+'-tema');if(t&&t!=='auto')document.documentElement.setAttribute('data-theme',t);}catch(e){}
  pintarTema();
  if(!location.hash)location.hash='#/plan';
  render();
})();
