/* ===== APLICACIÓN ===== */
'use strict';
const KEY='ga27001-sgjm-v1';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nl=s=>esc(s).replace(/\n/g,'<br>');

/* ---------- Estado persistente ---------- */
let storageOK=true;
function defaults(){return {resp:{},hall:[],prep:{},gprep:{},docs:{},est:{},cnt:0,aj:{todos:false},informe:{conclusion:''},ultimoRespaldo:null,cambios:0};}
function load(){
  try{const r=localStorage.getItem(KEY);if(r){const o=JSON.parse(r);return Object.assign(defaults(),o);}}
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
function save(){
  S.cambios=(S.cambios||0)+1;
  clearTimeout(saveT);
  saveT=setTimeout(guardarYa,120);
}
/* Si la página se cierra o se oculta, se guarda de inmediato (evita perder lo último escrito) */
window.addEventListener('pagehide',()=>{if(saveT)guardarYa();});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&saveT)guardarYa();});
function avisoStorage(){const el=$('#aviso-storage');if(el)el.classList.toggle('hide',storageOK);}

/* ---------- Índices de la norma ---------- */
const REFS={};
CLAUSULAS.forEach(c=>REFS[c[0]]={id:c[0],t:c[1],s:c[2],e:c[3],k:'cl'});
CONTROLES.forEach(c=>REFS[c[0]]={id:c[0],t:c[1],s:c[2],e:c[3],k:'ct',tema:c[0].split('.')[1]});
/* ---------- SoA declarada por la empresa ---------- */
const EST={
  imp:{n:'Implementado',c:'t-ok',h:'Declarado IMPLEMENTADO: pida evidencia de operación (registros recientes), no solo el procedimiento. Si no se sostiene, la declaración es inexacta.'},
  par:{n:'Parcialmente implementado',c:'t-obs',h:'Declarado PARCIAL: identifique QUÉ parte falta, si hay plan con responsable y fecha, y si el riesgo residual fue aceptado.'},
  no:{n:'No implementado',c:'t-ncM',h:'Declarado NO implementado: confirme que es cierto, que existe un plan con responsable y fecha, y que el riesgo está tratado o aceptado.'}
};
const soaDe=id=>SOA[id]?{ap:SOA[id][0],just:SOA[id][1],est:SOA[id][2],ev:SOA[id][3]}:null;
function soaBox(id,full){
  const s=soaDe(id);if(!s)return '';
  const e=EST[s.est];
  let h='<div class="soa"><b>'+esc(id)+'</b> <span class="badge '+e.c+'">'+esc(e.n)+'</span>';
  h+='<div class="small">Evidencia que cita su SoA: '+(s.ev?esc(s.ev):'<b>ninguna</b>')+'</div>';
  if(full){h+='<div class="small mut">Justificación de su SoA: '+esc(s.just)+'</div><div class="small">'+esc(e.h)+'</div>';}
  return h+'</div>';
}
function soaRefs(q){
  const ids=q.ref.filter(x=>SOA[x]);if(!ids.length)return '';
  if(q.k==='c')return soaBox(ids[0],true);
  const shown=ids.slice(0,4).map(x=>soaBox(x,false)).join('');
  const one=ids.length===1?'<div class="small soa-h">'+esc(EST[SOA[ids[0]][2]].h)+'</div>':'';
  return '<details class="soa-d" open><summary>Lo que declara su SoA ('+ids.length+')</summary>'+shown+one+(ids.length>4?'<p class="small mut">+ '+(ids.length-4)+' más en la sesión de SoA.</p>':'')+'</details>';
}
function docsDeSesion(s){
  const ids=new Set();
  s.cubreSet.forEach(x=>{if(SOA[x])ids.add(x);});
  QS[s.id].forEach(q=>q.ref.forEach(x=>{if(SOA[x])ids.add(x);}));
  const m=new Map();
  ids.forEach(id=>SOA[id][3].split(' / ').map(x=>x.trim()).filter(Boolean).forEach(d=>{if(!m.has(d))m.set(d,[]);m.get(d).push(id);}));
  return m;
}
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

/* ---------- Preguntas por sesión ---------- */
const QS={};
function buildQs(){
  SESIONES.forEach(ses=>{
    const g=GUIAS[ses.guia];if(!g){QS[ses.id]=[];return;}
    const out=[];
    (g.preguntas||[]).forEach((p,i)=>out.push({id:ses.id+'.'+(i+1),ses:ses.id,ref:p.ref||[],q:p.q,ev:p.ev||'',al:p.al||'',pre:p.pre||'',sug:!!p.sug,k:'g'}));
    if(ses.guia==='soa')CONTROLES.forEach(c=>out.push({id:ses.id+'.'+c[0],ses:ses.id,ref:[c[0]],q:c[0]+' · '+c[1]+' — ¿Aplica según la SoA? Si aplica: ¿cómo está implementado y qué evidencia lo demuestra? Si se excluyó: ¿cuál es la justificación y sigue siendo válida?',ev:c[3],al:'',sug:false,k:'c',ctrl:c}));
    if(TRANS_GUIAS.includes(ses.guia))TRANSVERSALES.forEach((p,i)=>out.push({id:ses.id+'.T'+(i+1),ses:ses.id,ref:p.ref,q:p.q,ev:p.ev,al:p.al,sug:false,k:'t'}));
    QS[ses.id]=out;
  });
}
buildQs();
const QBYID={};Object.values(QS).forEach(a=>a.forEach(q=>QBYID[q.id]=q));
const R=id=>S.resp[id]||{s:'pendiente',n:'',e:''};
function setR(id,patch){S.resp[id]=Object.assign({s:'pendiente',n:'',e:''},S.resp[id],patch);save();}

function prog(ses){
  const qs=QS[ses.id].filter(q=>q.k!=='t');
  const hechas=qs.filter(q=>R(q.id).s!=='pendiente').length;
  return {total:qs.length,hechas,pct:qs.length?Math.round(100*hechas/qs.length):0};
}
function contar(ses){
  const c={};Object.keys(TIPOS).forEach(k=>c[k]=0);
  QS[ses.id].forEach(q=>c[R(q.id).s]++);return c;
}

/* ---------- Cobertura ---------- */
const PESO={ncmayor:7,ncmenor:6,obs:5,om:4,seguimiento:3,conforme:2,na:1,pendiente:0};
function cobertura(){
  const m={};
  Object.keys(REFS).forEach(id=>m[id]={id,asig:[],soloSoA:false,qs:[],peor:'pendiente',verif:0});
  SESIONES.forEach(s=>{
    s.cubreSet.forEach(id=>{if(!m[id])return;if(s.soa)m[id].soloSoA=true;else if(!m[id].asig.includes(s.id))m[id].asig.push(s.id);});
  });
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

/* ---------- Utilidades de presentación ---------- */
function chipRef(id){const r=REFS[id];return '<button class="ref" data-a="ref" data-id="'+esc(id)+'" title="'+esc(r?r.t:'')+'">'+esc(id)+'</button>';}
function refsHTML(ids){return ids.length?ids.map(chipRef).join(''):'';}
function badge(st){const t=TIPOS[st];return '<span class="badge '+t.c+'">'+t.n+'</span>';}
function ymd(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function diasHasta(iso){const [y,m,d]=iso.split('-').map(Number);const a=new Date(y,m-1,d);const h=new Date();h.setHours(0,0,0,0);return Math.round((a-h)/86400000);}
function hoyISO(){return ymd(new Date());}
function toast(msg){const t=document.createElement('div');t.className='toast';t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),2400);}
function descargar(nombre,contenido,tipo){
  const blob=new Blob([contenido],{type:tipo});const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download=nombre;document.body.appendChild(a);a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);
}
const csvCell=v=>'"'+String(v==null?'':v).replace(/"/g,'""').replace(/\r?\n/g,' ')+'"';

/* ---------- Router ---------- */
let tabSes='preparar',filtroQ='todas',filtroSoA='pend',filtroH='todos',filtroCob='todos',tabBib='clausulas',busqueda='';
function ruta(){const h=location.hash.replace(/^#\/?/,'')||'plan';const p=h.split('/');return {v:p[0],a:decodeURIComponent(p[1]||'')};}
function render(){
  const r=ruta();let html='';
  const mapa={documentos:vDocumentos,plan:vPlan,sesion:()=>vSesion(r.a),hallazgos:vHallazgos,hallazgo:()=>vHallazgo(r.a),cobertura:vCobertura,cronograma:vCronograma,biblioteca:vBiblioteca,datos:vDatos};
  html=(mapa[r.v]||vPlan)();
  $('#app').innerHTML=html;
  $$('nav.main a').forEach(a=>a.classList.toggle('on',a.dataset.v===(r.v==='sesion'?'plan':r.v==='hallazgo'?'hallazgos':r.v)));
  avisoStorage();
}
window.addEventListener('hashchange',()=>{$$('.modal').forEach(m=>m.remove());tabSes='preparar';filtroQ='todas';window.scrollTo(0,0);render();});

/* ---------- Vista: Plan ---------- */
function vPlan(){
  const mis=SESIONES.filter(s=>S.aj.todos||esMia(s));
  const inicio=DIAS[4],hoy=hoyISO();
  const d0=diasHasta(inicio);
  let hero;
  if(d0>0)hero='<h1>Faltan '+d0+' día'+(d0===1?'':'s')+' para el inicio</h1><p>La auditoría empieza el <b>miércoles 4 de noviembre, 10:00</b> con la Reunión de Apertura. Hoy es el día de preparar: abajo está su lista.</p>';
  else if(Object.values(DIAS).includes(hoy))hero='<h1>Hoy es día de auditoría</h1><p>Abra su siguiente sesión y siga la pestaña «Preguntar».</p>';
  else hero='<h1>Guía de auditoría ISO 27001:2022</h1><p>Seguimiento del plan de auditoría.</p>';
  const sigId=(mis.find(s=>!S.est[s.id]&&DIAS[s.dia]>=hoy)||mis.find(s=>!S.est[s.id])||{}).id;
  const todosCheck=PREP_GENERAL.map((t,i)=>'<label class="chk"><input type="checkbox" data-a="gprep" data-i="'+i+'" '+(S.gprep[i]?'checked':'')+'><span>'+esc(t)+'</span></label>').join('');
  const hechasPrep=PREP_GENERAL.filter((t,i)=>S.gprep[i]).length;
  let h='<div class="wrap">';
  h+='<div class="card hero">'+hero+'<p class="small" style="margin:0;opacity:.9">Auditor: '+esc(YO)+' · Soluciones Globales JM · Auditoría interna ISO 27001:2022</p></div>';
  h+='<div class="card"><h2>Preparación general ('+hechasPrep+'/'+PREP_GENERAL.length+')</h2>'+todosCheck+'</div>';
  const revAlta=REVISION.filter(r=>r.sev==='alta').length;
  h+='<a class="card warn ses" href="#/cronograma"><b>Revisé su cronograma, su SoA y la matriz de entregables: '+revAlta+' puntos de prioridad alta</b><br><span class="small">Toque para leerlos. Conviene tratarlos con el líder del equipo antes del miércoles.</span></a>';
  const nd=Object.keys(S.docs).filter(k=>S.docs[k]).length;
  h+='<a class="card soft ses" href="#/documentos"><b>Solicitud documental según su SoA</b><br><span class="small">Lista maestra de los documentos que la empresa declara tener como evidencia. Pídalos hoy. ('+nd+' marcados como recibidos)</span></a>';
  h+='<div class="row noprint" style="margin:6px 0 4px"><h2 style="margin:0">Mis sesiones</h2><span class="sp"></span><button class="sm" data-a="todos">'+(S.aj.todos?'Ver solo las mías':'Ver todo el cronograma')+'</button></div>';
  let dia=null;
  mis.forEach(s=>{
    if(s.dia!==dia){dia=s.dia;const esHoy=DIAS[dia]===hoy;h+='<div class="day"><b>'+DIA_NOMBRE[dia]+' de noviembre</b>'+(esHoy?'<span class="badge b-hoy">HOY</span>':'')+'</div>';}
    const p=prog(s);const tec=['tecnologia','desarrollo','servicios_ti'].includes(s.id);
    const guiaTxt=GUIAS[s.guia]?'':'<span class="badge t-na">Sin guía (otro auditor)</span>';
    const mia=esMia(s);
    h+='<a class="card ses '+(S.est[s.id]?'done ':'')+(s.id===sigId?'next':'')+'" href="#/sesion/'+s.id+'">';
    h+='<div class="meta"><b>'+esc(s.hora)+'</b> · '+(s.id===sigId?'<span class="badge t-om">SIGUIENTE</span>':'')+(tec?'<span class="badge b-tec">Técnica</span>':'')+(S.est[s.id]?'<span class="badge t-ok">Completada</span>':'')+guiaTxt+(!mia?'<span class="badge t-na">No es suya</span>':'')+'</div>';
    h+='<h3>'+esc(s.nombre)+'</h3>';
    h+='<div class="meta">'+esc(s.aud.join(' · '))+'</div>';
    h+='<div class="meta">Auditores: '+esc(s.ads.join(', '))+(s.std&&s.std!=='N/A'?' · ISO 27001: '+esc(s.std):'')+'</div>';
    if(GUIAS[s.guia]&&p.total)h+='<div class="row" style="margin-top:8px"><div class="bar sp"><i style="width:'+p.pct+'%"></i></div><span class="small mut">'+p.hechas+'/'+p.total+'</span></div>';
    h+='</a>';
  });
  h+='<p class="small mut" style="margin-top:18px">'+(storageOK?'Sus notas se guardan solo en este dispositivo. ':'<b>Atención: este navegador no permite guardar.</b> ')+'Haga una copia desde «Datos» al terminar cada día.'+(S.ultimoRespaldo?' Último respaldo: '+esc(new Date(S.ultimoRespaldo).toLocaleString())+'.':' Aún no ha hecho ningún respaldo.')+'</p>';
  return h+'</div>';
}

/* ---------- Tarjeta de pregunta ---------- */
const BTN_ORDEN=['conforme','obs','om','ncmenor','ncmayor','seguimiento','na'];
const BTN_TXT={conforme:'Conforme',obs:'Observación',om:'Mejora',ncmenor:'NC menor',ncmayor:'NC mayor',seguimiento:'Seguimiento',na:'N/A'};
function hallDeQ(qid){return S.hall.find(h=>h.qid===qid);}
function cardQ(q,opt){
  opt=opt||{};const r=R(q.id);const ses=SES[q.ses];const chk=esCheck(ses);
  let h='<article class="q s-'+r.s+'" id="q-'+esc(q.id)+'" data-id="'+esc(q.id)+'">';
  h+='<div>'+refsHTML(q.ref)+(q.sug?'<span class="badge b-sug" title="No figura en el cronograma; lo agregué yo por riesgo">sugerido</span>':'')+(q.k==='t'?'<span class="badge t-na">transversal</span>':'')+(opt.mostrarSes?'<a class="badge t-om" href="#/sesion/'+esc(ses.id)+'">'+esc(ses.nombre)+'</a>':'')+'</div>';
  h+='<p class="q-text">'+esc(q.q)+'</p>';
  if(q.ev)h+='<p class="q-ev"><b>'+(q.k==='c'?'Evidencia típica':'Pida ver')+':</b> '+esc(q.ev)+'</p>';
  if(q.pre)h+='<p class="pre"><b>Lo que ya vi en sus archivos:</b> '+esc(q.pre)+'</p>';
  if(q.k==='c'){
    const prev=evidenciaPrevia(q);
    if(prev.length)h+='<p class="small"><span class="badge t-ok">Ya revisado esta semana</span> '+prev.map(p=>esc(p.ses.nombre)+' ('+TIPOS[R(p.q.id).s].n+')').join('; ')+'</p>';
    h+='<p class="small mut">'+esc(q.ctrl[2])+'</p>';
  }
  h+=soaRefs(q);
  if(q.al)h+='<details class="q-al"><summary>Señales de alerta</summary><p>'+esc(q.al)+'</p></details>';
  if(chk){
    h+='<div class="stbtns"><button class="t-ok" aria-pressed="'+(r.s==='conforme')+'" data-a="st" data-id="'+esc(q.id)+'" data-s="conforme">'+(r.s==='conforme'?'✓ Hecho':'Marcar como hecho')+'</button></div>';
  }else{
    h+='<div class="stbtns" role="group" aria-label="Resultado">'+BTN_ORDEN.map(s=>'<button class="'+TIPOS[s].c+'" aria-pressed="'+(r.s===s)+'" data-a="st" data-id="'+esc(q.id)+'" data-s="'+s+'">'+BTN_TXT[s]+'</button>').join('')+'</div>';
  }
  const abierto=(r.n||r.e||(r.s!=='pendiente'&&!chk));
  h+='<details class="notas" '+(abierto?'open':'')+'><summary>Notas y evidencia</summary>';
  h+='<textarea data-f="n" data-id="'+esc(q.id)+'" placeholder="Qué respondió / qué observé (hechos, sin adjetivos)">'+esc(r.n)+'</textarea>';
  if(!chk){
    h+='<input type="text" data-f="e" data-id="'+esc(q.id)+'" placeholder="Evidencia vista: documento, fecha, muestra, quién la mostró" value="'+esc(r.e)+'">';
    const hh=hallDeQ(q.id);
    if(hh)h+='<a class="btn sm" href="#/hallazgo/'+hh.id+'">Ver hallazgo '+hh.id+'</a>';
    else if(['obs','om','ncmenor','ncmayor','seguimiento'].includes(r.s))h+='<button class="sm primary" data-a="mkhall" data-id="'+esc(q.id)+'">Convertir en hallazgo</button>';
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
  nuevo.querySelector('details.notas').open=el.querySelector('details.notas').open||nuevo.querySelector('details.notas').open;
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
  const tabs=[['preparar','1 · Preparar'],['preguntar',s.guia==='equipo'||s.guia==='pendientes'||s.guia==='informe'?'2 · Trabajo':'2 · '+(g.etiqueta||'Preguntar')],['cerrar','3 · Cerrar']];
  h+='<div class="tabs" role="tablist">'+tabs.map(t=>'<button role="tab" class="'+(tabSes===t[0]?'on':'')+'" data-a="tab" data-t="'+t[0]+'">'+t[1]+'</button>').join('')+'</div>';
  if(tabSes==='preparar')h+=sPreparar(s,g);
  else if(tabSes==='preguntar')h+=sPreguntar(s,g);
  else h+=sCerrar(s,g);
  return h+'</div>';
}
function avisosSesion(s){
  return REVISION.filter(r=>r.s.includes(s.id)).map(r=>'<div class="card '+(r.sev==='alta'?'bad':'warn')+'"><b>Atención de cronograma · '+esc(r.t)+'</b><p class="small" style="margin:4px 0 0">'+esc(r.a)+'</p></div>').join('');
}
function sPreparar(s,g){
  let h='<div class="card"><h2>Qué debe demostrar</h2><p>'+esc(g.objetivo)+'</p><h3>En simple</h3><p>'+esc(g.simple)+'</p></div>';
  h+=avisosSesion(s);
  if(g.prep&&g.prep.length){
    h+='<div class="card"><h2>Solicite antes de entrar</h2>'+g.prep.map((t,i)=>'<label class="chk"><input type="checkbox" data-a="prep" data-k="'+esc(s.id+':'+i)+'" '+(S.prep[s.id+':'+i]?'checked':'')+'><span>'+esc(t)+'</span></label>').join('')+'</div>';
  }
  if(s.guia!=='soa'){
    const dm=docsDeSesion(s);
    if(dm.size){
      h+='<div class="card"><h2>Documentos que su SoA cita para estos controles ('+dm.size+')</h2><p class="small mut">Pídalos y léalos <b>antes</b> de la entrevista. Son lo que la empresa declara tener.</p>';
      dm.forEach((ids,d)=>{h+='<label class="chk"><input type="checkbox" data-a="doc" data-k="'+esc(d)+'" '+(S.docs[d]?'checked':'')+'><span>'+esc(d)+' <span class="mut tiny">('+ids.join(', ')+')</span></span></label>';});
      h+='</div>';
    }
    const sinEv=Array.from(new Set([...s.cubreSet,...QS[s.id].flatMap(q=>q.ref)])).filter(x=>SOA[x]&&!SOA[x][3]);
    if(sinEv.length)h+='<div class="card warn small"><b>Sin evidencia citada en el SoA:</b> '+sinEv.map(x=>chipRef(x)).join('')+' — declarados «'+esc(EST.no.n)+'». Pregunte qué existe realmente.</div>';
  }
  const refs=Array.from(s.cubreSet).filter(x=>x!=='A.*');
  const sug=new Set();QS[s.id].forEach(q=>{if(q.sug)q.ref.forEach(r=>sug.add(r));});
  if(refs.length||sug.size){
    h+='<div class="card"><h2>Requisitos que cubre</h2>';
    if(refs.length)h+='<p class="small mut" style="margin-bottom:4px">Según el cronograma (toque uno para ver qué significa):</p><p>'+refsHTML(refs)+'</p>';
    if(sug.size)h+='<p class="small mut" style="margin-bottom:4px">Sugeridos por mí (no están en el cronograma):</p><p>'+refsHTML(Array.from(sug).filter(x=>!s.cubreSet.has(x)))+'</p>';
    h+='</div>';
  }
  if(TRANS_GUIAS.includes(s.guia)){
    h+='<details class="card"><summary>Cómo entrevistar sin ser técnico (5 reglas)</summary><ol class="qa">'+TECNICAS.slice(0,5).map(t=>'<li><b>'+esc(t[0])+'.</b> '+esc(t[1])+'</li>').join('')+'</ol><p class="small"><a href="#/biblioteca">Ver las 12 técnicas y el glosario</a></p></details>';
  }
  h+='<div class="row noprint"><button class="primary" data-a="tab" data-t="preguntar">Ir a las preguntas →</button></div>';
  return h;
}
function sPreguntar(s,g){
  if(s.guia==='pendientes')return sPendientes();
  if(s.guia==='informe')return sInforme();
  const qs=QS[s.id];
  let h='';
  if(s.guia==='equipo')h+=sHallazgosDia(s);
  if(s.guia==='soa')return sSoA(s,g);
  const base=qs.filter(q=>q.k==='g');const tr=qs.filter(q=>q.k==='t');
  if(!esCheck(s)){
    h+='<div class="filters">'+[['todas','Todas'],['pend','Pendientes'],['hecha','Respondidas']].map(x=>'<button class="'+(filtroQ===x[0]?'on':'')+'" data-a="fq" data-f="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>';
  }
  const filt=esCheck(s)?(()=>true):(filtroQ==='todas'?(()=>true):filtroQ==='pend'?(q=>R(q.id).s==='pendiente'):(q=>R(q.id).s!=='pendiente'));
  h+=base.filter(filt).map(q=>cardQ(q)).join('')||'<p class="mut">No hay preguntas en este filtro.</p>';
  if(tr.length){
    h+='<details class="card" '+(tr.some(q=>R(q.id).s!=='pendiente')?'open':'')+'><summary>Preguntas transversales (para cualquier entrevistado, '+tr.length+')</summary><p class="small mut">Úselas con 1 o 2 personas de este proceso. Cubren política, objetivos, capacitación, reporte de incidentes.</p>'+tr.map(q=>cardQ(q)).join('')+'</details>';
  }
  return h;
}
function sSoA(s,g){
  const qs=QS[s.id];const ver=qs.filter(q=>q.k==='g'),ctr=qs.filter(q=>q.k==='c');
  let h='<div class="card soft"><b>Paso 1.</b> Valide el documento SoA (8 verificaciones). <b>Paso 2.</b> Recorra los controles, empezando por los pendientes. La herramienta ya marca los que usted revisó durante la semana.</div>';
  h+='<h2>Verificaciones del documento</h2>'+ver.map(q=>cardQ(q)).join('');
  const c={pend:0,hecha:0};ctr.forEach(q=>R(q.id).s==='pendiente'?c.pend++:c.hecha++);
  h+='<h2 style="margin-top:20px">Controles del Anexo A ('+ctr.length+')</h2><p class="small">Pendientes: <b>'+c.pend+'</b> · Respondidos: <b>'+c.hecha+'</b></p>';
  const cnt={imp:0,par:0,no:0};Object.values(SOA).forEach(x=>cnt[x[2]]++);
  h+='<div class="grid c3"><div class="card kpi"><b>'+cnt.imp+'</b><span>declarados Implementado</span></div><div class="card kpi"><b>'+cnt.par+'</b><span>declarados Parcialmente</span></div><div class="card kpi"><b>'+cnt.no+'</b><span>declarados No implementado</span></div></div>';
  h+='<div class="card soft small"><b>Cómo usar esto:</b> los 3 «Implementado» son los que más debe comprobar (si no se sostienen, la declaración es inexacta). Los 6 «No implementado» exigen ver el plan con fecha. Los 84 «Parcialmente» se muestrean por riesgo: lo importante es qué falta y si hay plan.</div>';
  const opts=[['pend','Pendientes'],['imp','Declarados Implementado (3)'],['no','No implementado (6)'],['sinev','Sin evidencia citada (4)'],['5','A.5 Organizacionales'],['6','A.6 Personas'],['7','A.7 Físicos'],['8','A.8 Tecnológicos'],['sin','Sin revisión esta semana'],['todos','Todos']];
  h+='<div class="filters">'+opts.map(x=>'<button class="'+(filtroSoA===x[0]?'on':'')+'" data-a="fs" data-f="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>';
  const filt=q=>{const f=filtroSoA;if(f==='todos')return true;if(f==='imp'||f==='no')return SOA[q.ctrl[0]][2]===f;if(f==='sinev')return !SOA[q.ctrl[0]][3];if(f==='pend')return R(q.id).s==='pendiente';if(f==='sin')return R(q.id).s==='pendiente'&&evidenciaPrevia(q).length===0;return q.ctrl[0].split('.')[1]===f;};
  const lista=ctr.filter(filt);
  h+=(lista.map(q=>cardQ(q)).join('')||'<p class="mut">Nada en este filtro.</p>');
  return h;
}
function sHallazgosDia(s){
  const hs=S.hall.filter(x=>SES[x.ses]&&SES[x.ses].dia===s.dia);
  let h='<div class="card"><h2>Hallazgos del día ('+hs.length+')</h2>';
  if(!hs.length)h+='<p class="mut small">Aún no hay hallazgos registrados hoy.</p>';
  hs.forEach(x=>{h+='<p><a href="#/hallazgo/'+x.id+'">'+x.id+'</a> '+badgeH(x.tipo)+' <span class="small">'+esc(x.ref||'')+' — '+esc((x.cond||'(sin redactar)').slice(0,120))+'</span> '+(x.validado?'<span class="badge t-ok">validado</span>':'<span class="badge t-seg">sin validar</span>')+'</p>';});
  h+='<button class="sm" data-a="nuevoh">+ Nuevo hallazgo</button></div>';
  return h;
}
function sPendientes(){
  let h='<div class="card soft">Aquí se juntan automáticamente las preguntas que quedaron <b>pendientes</b> o en <b>seguimiento</b> en todas sus sesiones. Complete cada una con evidencia y márquela.</div>';
  let n=0;
  SESIONES.filter(esMia).forEach(ses=>{
    if(esCheck(ses)||!GUIAS[ses.guia])return;
    const qs=QS[ses.id].filter(q=>q.k==='g'&&['pendiente','seguimiento'].includes(R(q.id).s)&&['planificacion','sig','ventas','marcas','tecnologia','desarrollo','servicios_ti','legal','revision','soa'].includes(ses.guia));
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
  const ctrl=CONTROLES.map(x=>cob[x[0]]);const verif=ctrl.filter(x=>x.verif>0).length;
  let t='INFORME DE AUDITORÍA INTERNA – ISO/IEC 27001:2022\nSoluciones Globales JM\n\n';
  t+='1. OBJETIVO Y ALCANCE\nEvaluar la conformidad del Sistema de Gestión de Seguridad de la Información con ISO/IEC 27001:2022, los documentos del SGSI y los requisitos legales y contractuales aplicables, en los procesos y fechas del plan de auditoría. [Completar con el alcance acordado en la reunión de apertura]\n\n';
  t+='2. EQUIPO AUDITOR\n'+EQUIPO.join(', ')+'\n\n';
  t+='3. PERÍODO\n4 al 18 de noviembre de 2026.\n\n';
  t+='4. RESUMEN DE RESULTADOS\nNo conformidades mayores: '+c.ncmayor+'\nNo conformidades menores: '+c.ncmenor+'\nObservaciones: '+c.obs+'\nOportunidades de mejora: '+c.om+'\nFortalezas / buenas prácticas: '+c.fortaleza+'\n\n';
  t+='5. CONCLUSIÓN\n'+(S.informe.conclusion||'[Redactar: grado de cumplimiento de los criterios y eficacia del SGSI]')+'\n\n';
  t+='6. HALLAZGOS\n';
  if(!S.hall.length)t+='(Sin hallazgos registrados)\n';
  S.hall.forEach(x=>{
    t+='\n'+x.id+' – '+(HTIPOS[x.tipo]||x.tipo)+' – '+(SES[x.ses]?SES[x.ses].nombre:'')+'\n'+hallTexto(x)+'\n';
  });
  t+='\n7. LIMITACIONES\nLa auditoría se realizó por muestreo. La ausencia de hallazgos en un área no garantiza la ausencia de no conformidades. Controles del Anexo A con al menos una verificación documentada: '+verif+' de '+CONTROLES.length+'.\n';
  return t;
}
function sInforme(){
  const c=resumenHall();
  let h='<div class="card soft">Borrador automático con sus hallazgos registrados. Ajuste el texto y cópielo a Word.</div>';
  h+='<div class="grid c4"><div class="card kpi"><b>'+c.ncmayor+'</b><span>NC mayores</span></div><div class="card kpi"><b>'+c.ncmenor+'</b><span>NC menores</span></div><div class="card kpi"><b>'+c.obs+'</b><span>Observaciones</span></div><div class="card kpi"><b>'+c.om+'</b><span>Oport. de mejora</span></div></div>';
  h+='<div class="card"><label for="concl">Conclusión del equipo (usted la redacta)</label><textarea id="concl" data-f="concl" placeholder="Grado de cumplimiento de los criterios y eficacia del SGSI, con base en la evidencia">'+esc(S.informe.conclusion)+'</textarea></div>';
  h+='<div class="row noprint" style="margin-bottom:12px"><button class="primary" data-a="copiarinf">Copiar al portapapeles</button><button data-a="docinf">Descargar para Word (.doc)</button></div>';
  h+='<div class="preview" id="inf-prev">'+esc(informeTexto())+'</div>';
  h+='<div class="card" style="margin-top:12px"><h3>Contenido mínimo de un informe (ISO 19011, 6.6)</h3><ul class="qa small"><li>Objetivos, alcance y criterios de auditoría</li><li>Cliente, equipo auditor, fechas y lugares</li><li>Hallazgos con su evidencia objetiva</li><li>Conclusiones y grado de cumplimiento de los criterios</li><li>Opiniones divergentes no resueltas</li><li>Limitaciones del muestreo y distribución del informe</li></ul></div>';
  return h;
}

/* ---------- Cerrar sesión ---------- */
function sCerrar(s,g){
  const c=contar(s);const pend=QS[s.id].filter(q=>q.k!=='t'&&R(q.id).s==='pendiente');
  const hs=S.hall.filter(x=>x.ses===s.id);
  let h='<div class="card"><h2>Resumen de la sesión</h2><div class="row">'+Object.keys(TIPOS).filter(k=>k!=='pendiente'&&c[k]).map(k=>'<span class="badge '+TIPOS[k].c+'">'+TIPOS[k].n+': '+c[k]+'</span>').join('')+(pend.length?'<span class="badge t-pend">Pendientes: '+pend.length+'</span>':'')+'</div></div>';
  h+='<div class="card"><h2>Hallazgos de esta sesión ('+hs.length+')</h2>';
  hs.forEach(x=>{h+='<p><a href="#/hallazgo/'+x.id+'">'+x.id+'</a> '+badgeH(x.tipo)+' <span class="small">'+esc((x.cond||'(sin redactar)').slice(0,140))+'</span> '+(x.validado?'<span class="badge t-ok">validado</span>':'<span class="badge t-seg">sin validar</span>')+'</p>';});
  if(!hs.length)h+='<p class="mut small">Sin hallazgos registrados.</p>';
  h+='<button class="sm" data-a="nuevoh" data-ses="'+esc(s.id)+'">+ Nuevo hallazgo</button></div>';
  h+='<div class="card soft"><h3>Antes de salir de la sala</h3><ul class="qa small"><li>Lea en voz alta los hechos que registró y pregunte «¿Está de acuerdo con los hechos?»</li><li>Anote qué evidencias quedaron por entregar, quién y para cuándo</li><li>Agradezca y confirme la siguiente sesión</li></ul></div>';
  if(pend.length)h+='<div class="card warn"><b>'+pend.length+' preguntas sin responder.</b> Si no hubo tiempo, márquelas «Seguimiento» para que aparezcan en «Cierre de procesos pendientes».</div>';
  h+='<div class="row noprint"><button class="'+(S.est[s.id]?'':'primary')+'" data-a="hecha" data-id="'+esc(s.id)+'">'+(S.est[s.id]?'Reabrir sesión':'Marcar sesión como completada')+'</button></div>';
  return h;
}

/* ---------- Hallazgos ---------- */
const HTIPOS={ncmayor:'No conformidad mayor',ncmenor:'No conformidad menor',obs:'Observación',om:'Oportunidad de mejora',fortaleza:'Fortaleza / buena práctica'};
const HCLASE={ncmayor:'t-ncM',ncmenor:'t-ncm',obs:'t-obs',om:'t-om',fortaleza:'t-ok'};
const badgeH=t=>'<span class="badge '+(HCLASE[t]||'t-na')+'">'+esc(HTIPOS[t]||t)+'</span>';
function reqTexto(refs){
  return refs.split(/[,;\s]+/).filter(Boolean).map(id=>{const r=REFS[id];return r?('ISO/IEC 27001:2022, '+(r.k==='ct'?'control ':'cláusula ')+id+' – '+r.t):id;}).join('\n');
}
function hallTexto(x){
  let t='Requisito: '+(x.req||reqTexto(x.ref||'')||'[falta]')+'\nEvidencia objetiva: '+(x.evid||'[falta]')+'\nHallazgo: '+(x.cond||'[falta]');
  if(x.efecto)t+='\nConsecuencia / riesgo: '+x.efecto;
  if(x.causa)t+='\nCausa (si se determinó): '+x.causa;
  return t;
}
function calidadH(x){
  const f=[];
  if(!(x.ref||x.req))f.push('Cite el requisito (cláusula o control)');
  if(!x.evid||x.evid.length<15)f.push('Describa la evidencia objetiva: documento, fecha, muestra, quién la mostró');
  if(!x.cond||x.cond.length<20)f.push('Redacte el hallazgo con hechos');
  if(x.cond&&/\b(mal|malo|deficiente|pésimo|terrible|siempre|nunca|nadie)\b/i.test(x.cond))f.push('Evite adjetivos o absolutos («mal», «nadie», «nunca»): use cifras y hechos');
  if(!x.aud)f.push('Indique el auditado / responsable del proceso');
  if(!x.validado)f.push('Valide los hechos con el auditado');
  return f;
}
function nuevoH(opts){
  opts=opts||{};S.cnt++;const id='H-'+String(S.cnt).padStart(3,'0');
  const q=opts.qid?QBYID[opts.qid]:null;const r=q?R(q.id):null;
  const tipoMap={ncmayor:'ncmayor',ncmenor:'ncmenor',obs:'obs',om:'om',seguimiento:'obs'};
  const ses=q?SES[q.ses]:null;
  const x={id,ses:ses?ses.id:(opts.ses||''),qid:q?q.id:'',tipo:r&&tipoMap[r.s]?tipoMap[r.s]:'obs',ref:q?q.ref.filter(z=>REFS[z]).join(', '):'',req:'',evid:r?r.e:'',cond:r?r.n:'',efecto:'',causa:'',aud:ses?ses.aud.join(' / '):'',validado:false,creado:new Date().toISOString()};
  S.hall.push(x);save();return x;
}
function vHallazgos(){
  const c=resumenHall();
  let h='<div class="wrap"><div class="row"><h1 style="margin:0">Hallazgos</h1><span class="sp"></span><button class="primary noprint" data-a="nuevoh">+ Nuevo</button></div>';
  h+='<div class="grid c4" style="margin-top:12px"><div class="card kpi"><b>'+c.ncmayor+'</b><span>NC mayores</span></div><div class="card kpi"><b>'+c.ncmenor+'</b><span>NC menores</span></div><div class="card kpi"><b>'+c.obs+'</b><span>Observaciones</span></div><div class="card kpi"><b>'+c.om+'</b><span>Mejoras</span></div></div>';
  const fl=[['todos','Todos'],['ncmayor','NC mayor'],['ncmenor','NC menor'],['obs','Observación'],['om','Mejora'],['fortaleza','Fortaleza'],['sinval','Sin validar']];
  h+='<div class="filters">'+fl.map(x=>'<button class="'+(filtroH===x[0]?'on':'')+'" data-a="fh" data-f="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>';
  const lista=S.hall.filter(x=>filtroH==='todos'||(filtroH==='sinval'?!x.validado:x.tipo===filtroH));
  if(!lista.length)h+='<div class="card"><p class="mut">Aún no hay hallazgos'+(S.hall.length?' en este filtro':'')+'. Se crean desde una pregunta con el botón «Convertir en hallazgo», o con «+ Nuevo».</p></div>';
  lista.forEach(x=>{
    const q=calidadH(x);
    h+='<a class="card ses" href="#/hallazgo/'+x.id+'"><div class="row"><b>'+x.id+'</b>'+badgeH(x.tipo)+(x.validado?'<span class="badge t-ok">validado</span>':'<span class="badge t-seg">sin validar</span>')+(q.length?'<span class="badge b-sug">'+q.length+' por completar</span>':'<span class="badge t-ok">completo</span>')+'</div><div class="small mut">'+esc(x.ses&&SES[x.ses]?SES[x.ses].nombre:'')+(x.ref?' · '+esc(x.ref):'')+'</div><p style="margin:6px 0 0">'+esc(x.cond||'(sin redactar)')+'</p></a>';
  });
  h+='<div class="row noprint"><button data-a="csvh">Exportar hallazgos (Excel/CSV)</button><button data-a="print">Imprimir</button></div></div>';
  return h;
}
function vHallazgo(id){
  const x=S.hall.find(z=>z.id===id);
  if(!x)return '<div class="wrap"><p>Hallazgo no encontrado. <a href="#/hallazgos">Volver</a></p></div>';
  const ops=o=>Object.keys(o).map(k=>'<option value="'+k+'" '+(x.tipo===k?'selected':'')+'>'+esc(o[k])+'</option>').join('');
  const sopts=SESIONES.filter(s=>GUIAS[s.guia]&&!esCheck(s)).map(s=>'<option value="'+s.id+'" '+(x.ses===s.id?'selected':'')+'>'+esc(DIA_NOMBRE[s.dia]+' – '+s.nombre)+'</option>').join('');
  const F=(k,lab,ph,rows)=>'<label for="hf-'+k+'">'+lab+'</label><textarea id="hf-'+k+'" data-hf="'+k+'" placeholder="'+esc(ph)+'" style="min-height:'+(rows||80)+'px">'+esc(x[k]||'')+'</textarea>';
  let h='<div class="wrap"><p class="small"><a href="#/hallazgos">← Hallazgos</a></p><div class="card"><div class="row"><h1 style="margin:0">'+x.id+'</h1><span id="h-badge">'+badgeH(x.tipo)+'</span></div>';
  h+='<label for="hf-tipo">Clasificación</label><select id="hf-tipo" data-hf="tipo">'+ops(HTIPOS)+'</select>';
  h+='<label for="hf-ses">Sesión / proceso</label><select id="hf-ses" data-hf="ses"><option value="">—</option>'+sopts+'</select>';
  h+='<label for="hf-aud">Auditado / responsable</label><input type="text" id="hf-aud" data-hf="aud" value="'+esc(x.aud)+'">';
  h+='<label for="hf-ref">Requisito (ids separados por coma, ej. A.8.13, 6.1.2)</label><input type="text" id="hf-ref" data-hf="ref" value="'+esc(x.ref)+'" list="idlist"><datalist id="idlist">'+Object.keys(REFS).map(k=>'<option value="'+k+'">'+esc(REFS[k].t)+'</option>').join('')+'</datalist>';
  h+=F('req','Texto del requisito (opcional; si lo deja vacío se completa con la norma)','ISO/IEC 27001:2022 A.8.13 – …',60);
  h+=F('evid','Evidencia objetiva (qué vio: documento, fecha, muestra, quién se lo mostró)','Ej.: En la consola de antivirus (mostrada por el Soporte TI el 5/11) hay 142 equipos registrados de 168 en el inventario…',90);
  h+=F('cond','Hallazgo (hechos, sin adjetivos)','Ej.: 26 equipos (15 %) no tienen el agente de protección instalado, entre ellos 4 servidores.',90);
  h+=F('efecto','Consecuencia / riesgo (opcional)','Ej.: Posible propagación de malware sin detección…',60);
  h+=F('causa','Causa (si se determinó con el auditado)','',50);
  h+='<label class="chk"><input type="checkbox" data-hf="validado" '+(x.validado?'checked':'')+'><span>Los hechos fueron <b>validados con el auditado</b></span></label>';
  h+='</div><div class="card"><h3>Calidad del hallazgo</h3><div id="h-cal"></div></div>';
  h+='<div class="card"><h3>Texto final</h3><div class="preview" id="h-prev"></div></div>';
  h+='<div class="row noprint"><button class="danger" data-a="delh" data-id="'+x.id+'">Eliminar</button><span class="sp"></span><a class="btn" href="#/hallazgos">Listo</a></div></div>';
  setTimeout(()=>refreshH(x.id),0);
  return h;
}
function refreshH(id){
  const x=S.hall.find(z=>z.id===id);if(!x)return;
  const cal=calidadH(x);
  const c=$('#h-cal');if(c)c.innerHTML=cal.length?'<ul class="qa small">'+cal.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul>':'<p class="small"><span class="badge t-ok">Completo</span> Cumple los criterios de calidad.</p>';
  const p=$('#h-prev');if(p)p.textContent=hallTexto(x);
  const b=$('#h-badge');if(b)b.innerHTML=badgeH(x.tipo);
}

/* ---------- Cobertura ---------- */
function vCobertura(){
  const cob=cobertura();
  const cl=CLAUSULAS.map(c=>cob[c[0]]),ct=CONTROLES.map(c=>cob[c[0]]);
  const clAsig=cl.filter(x=>x.asig.length).length;
  const ctAsig=ct.filter(x=>x.asig.length).length;
  const ctVer=ct.filter(x=>x.verif>0).length;
  const ctNC=ct.filter(x=>['ncmayor','ncmenor'].includes(x.peor)).length;
  let h='<div class="wrap"><h1>Cobertura de la auditoría</h1><p class="mut small">Muestra qué requisitos están asignados a un proceso en el cronograma y cuáles ha verificado usted realmente. Solo cuentan las preguntas respondidas con resultado (no las pendientes).</p>';
  h+='<div class="grid c4"><div class="card kpi"><b>'+clAsig+'/'+cl.length+'</b><span>Cláusulas con proceso asignado</span></div><div class="card kpi"><b>'+ctAsig+'/93</b><span>Controles con proceso asignado</span></div><div class="card kpi"><b>'+ctVer+'/93</b><span>Controles verificados</span></div><div class="card kpi"><b>'+ctNC+'</b><span>Controles con NC</span></div></div>';
  h+='<div class="card warn small"><b>Lectura crítica:</b> '+(93-ctAsig)+' controles solo se auditan en la sesión SoA del viernes 13. Eso es legítimo si el programa de auditoría lo justifica por riesgo, pero debe quedar documentado.</div>';
  const incons=ct.filter(x=>SOA[x.id]&&SOA[x.id][2]==='imp'&&['ncmayor','ncmenor','obs'].includes(x.peor));
  if(incons.length)h+='<div class="card bad small"><b>Declarado «Implementado» pero con hallazgo:</b> '+incons.map(x=>chipRef(x.id)).join('')+' — la declaración del SoA no se sostiene.</div>';
  const declImp=CONTROLES.filter(c=>SOA[c[0]][2]==='imp').map(c=>c[0]);
  const impVer=declImp.filter(i=>cob[i].verif>0).length;
  h+='<div class="card soft small"><b>Declaración vs. realidad:</b> su SoA declara '+declImp.length+' controles «Implementado» ('+declImp.join(', ')+'). Verificados hasta ahora: '+impVer+'/'+declImp.length+'.</div>';
  const fl=[['todos','Todos'],['sinproc','Sin proceso asignado'],['sinver','Sin verificar'],['nc','Con NC / observación']];
  h+='<div class="filters">'+fl.map(x=>'<button class="'+(filtroCob===x[0]?'on':'')+'" data-a="fc" data-f="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>';
  const ok=x=>filtroCob==='todos'||(filtroCob==='sinproc'&&!x.asig.length)||(filtroCob==='sinver'&&x.verif===0)||(filtroCob==='nc'&&['ncmayor','ncmenor','obs'].includes(x.peor));
  const fila=(x)=>{
    const r=REFS[x.id];
    const asig=x.asig.length?x.asig.map(i=>'<a href="#/sesion/'+i+'" class="chip">'+esc(SES[i].nombre.replace(/^Gestión (de la |de los |de )?/,'').replace(/\s*\(.*$/,'').slice(0,34))+'</a>').join(''):(x.soloSoA?'<span class="badge b-sug">solo SoA</span>':'<span class="badge t-ncM">sin asignar</span>');
    const sd=soaDe(x.id);
    const decl=sd?'<span class="badge '+EST[sd.est].c+'" title="'+esc(EST[sd.est].n)+'">'+(sd.est==='imp'?'Impl.':sd.est==='par'?'Parcial':'No impl.')+'</span>':'<span class="mut">—</span>';
    return '<tr><td><button class="ref" data-a="ref" data-id="'+x.id+'">'+x.id+'</button></td><td>'+esc(r.t)+'</td><td>'+asig+'</td><td>'+decl+'</td><td>'+x.qs.length+'</td><td>'+(x.peor==='pendiente'?'<span class="badge t-pend">Sin verificar</span>':badge(x.peor))+'</td></tr>';
  };
  const tabla=(titulo,arr)=>{const f=arr.filter(ok);return f.length?'<h2 style="margin-top:18px">'+esc(titulo)+'</h2><div class="card tbl"><table><thead><tr><th>Id</th><th>Requisito</th><th>Proceso</th><th>SoA declara</th><th>Preg.</th><th>Resultado</th></tr></thead><tbody>'+f.map(fila).join('')+'</tbody></table></div>':'';};
  h+=tabla('Cláusulas 4 a 10',cl);
  [5,6,7,8].forEach(t=>{h+=tabla(TEMAS[t],ct.filter(x=>x.id.split('.')[1]==String(t)));});
  return h+'</div>';
}

/* ---------- Documentos citados por el SoA ---------- */
function vDocumentos(){
  const m=new Map();
  CONTROLES.forEach(c=>SOA[c[0]][3].split(' / ').map(x=>x.trim()).filter(Boolean).forEach(d=>{if(!m.has(d))m.set(d,[]);m.get(d).push(c[0]);}));
  const lista=Array.from(m.entries()).sort((a,b)=>b[1].length-a[1].length);
  const rec=lista.filter(x=>S.docs[x[0]]).length;
  let h='<div class="wrap"><p class="small"><a href="#/plan">← Plan</a></p><h1>Solicitud documental</h1><p class="mut small">Documentos que el SoA de la empresa cita como evidencia ('+lista.length+' nombres distintos). Marque cada uno cuando lo reciba. Recibidos: <b>'+rec+'/'+lista.length+'</b>.</p>';
  h+='<div class="card warn small"><b>Ojo con los nombres:</b> en su SoA un mismo documento parece aparecer con nombres distintos («PROCEDIMIENTO DE PROVEEDORES» y «…GESTIÓN DE PROVEEDORES Y SERVICIOS EXTERNOS»; «…INVENTARIO Y CLASIFICACIÓN DE ACTIVOS» y «…DE ACTIVOS DE INFORMACIÓN»; «…SEGURIDAD FÍSICA» y «…FÍSICA Y AMBIENTAL»). Pida el listado maestro de documentos y confirme cuál es el vigente. Solo los PC-INNO tienen código.</div>';
  h+='<div class="card">';
  lista.forEach(x=>{h+='<label class="chk"><input type="checkbox" data-a="doc" data-k="'+esc(x[0])+'" '+(S.docs[x[0]]?'checked':'')+'><span>'+esc(x[0])+'<br><span class="mut tiny">'+x[1].length+' control'+(x[1].length>1?'es':'')+': '+x[1].join(', ')+'</span></span></label>';});
  h+='</div><p class="small mut">Pida además lo que el SoA <b>no</b> cita: matriz de riesgos y metodología, plan de tratamiento, alcance del SGSI, actas de revisión por la dirección, programa de auditoría, informes de la revisión del SoA (julio–agosto 2026) y el procedimiento de auditoría interna.</p></div>';
  return h;
}

/* ---------- Cronograma / revisión crítica ---------- */
function vCronograma(){
  let h='<div class="wrap"><h1>Revisión crítica</h1><p class="mut small">Estas observaciones son mías, basadas solo en lo que dicen sus archivos (cronograma, SoA y matriz de entregables). Verifíquelas con el líder del equipo antes de darlas por válidas: pueden existir acuerdos que no están por escrito.</p>';
  const lab={alta:'Prioridad alta',media:'Prioridad media',baja:'Prioridad baja'};
  const tit={archivos:'Lo que revelan su SoA y la matriz de entregables',cron:'Sobre el cronograma'};
  ['archivos','cron'].forEach(gr=>{
   h+='<h2 style="margin-top:18px">'+tit[gr]+'</h2>';
   ['alta','media','baja'].forEach(sev=>{
    REVISION.filter(r=>r.sev===sev&&(r.g||'cron')===gr).forEach(r=>{
      h+='<div class="card '+(sev==='alta'?'bad':sev==='media'?'warn':'')+'"><span class="badge '+(sev==='alta'?'t-ncM':sev==='media'?'t-obs':'t-na')+'">'+lab[sev]+'</span><h3 style="margin-top:6px">'+esc(r.t)+'</h3><p class="small">'+esc(r.d)+'</p><p class="small"><b>Qué hacer:</b> '+esc(r.a)+'</p>'+(r.s.length?'<p class="small mut">Afecta a: '+r.s.map(i=>'<a href="#/sesion/'+i+'">'+esc(SES[i].nombre)+'</a>').join(' · ')+'</p>':'')+'</div>';
    });
  });
  });
  h+='<h2 style="margin-top:20px">Cronograma completo</h2><div class="card tbl"><table><thead><tr><th>Día</th><th>Hora</th><th>Proceso</th><th>Auditados</th><th>Auditores</th><th>ISO 27001</th></tr></thead><tbody>';
  SESIONES.forEach(s=>{h+='<tr class="'+(esMia(s)?'mine':'')+'"><td>'+esc(DIA_NOMBRE[s.dia])+'</td><td>'+esc(s.hora)+'</td><td><a href="#/sesion/'+s.id+'">'+esc(s.nombre)+'</a></td><td>'+esc(s.aud.join(', '))+'</td><td>'+esc(s.ads.join(', '))+'</td><td>'+esc(s.std)+'</td></tr>';});
  h+='</tbody></table></div><p class="small mut">La franja azul marca las sesiones en las que usted participa.</p></div>';
  return h;
}

/* ---------- Biblioteca ---------- */
function vBiblioteca(){
  const tabs=[['clausulas','Cláusulas 4-10'],['anexo','Anexo A (93)'],['glosario','Glosario'],['tecnicas','Técnicas'],['clasif','Clasificación']];
  let h='<div class="wrap"><h1>Biblioteca</h1><div class="tabs">'+tabs.map(t=>'<button class="'+(tabBib===t[0]?'on':'')+'" data-a="tb" data-t="'+t[0]+'">'+t[1]+'</button>').join('')+'</div>';
  const q=busqueda.toLowerCase();
  const filt=a=>a.filter(r=>!q||r.join(' ').toLowerCase().includes(q));
  const buscador='<input type="search" id="busca" placeholder="Buscar…" value="'+esc(busqueda)+'" aria-label="Buscar">';
  if(tabBib==='clausulas'){
    h+=buscador+filt(CLAUSULAS).map(c=>'<div class="card"><b>'+c[0]+' · '+esc(c[1])+'</b><p class="small" style="margin:4px 0">'+esc(c[2])+'</p><p class="small mut" style="margin:0"><b>Evidencia típica:</b> '+esc(c[3])+'</p></div>').join('');
  }else if(tabBib==='anexo'){
    h+=buscador;
    [5,6,7,8].forEach(t=>{const l=filt(CONTROLES.filter(c=>c[0].split('.')[1]==String(t)));if(l.length)h+='<h2 style="margin-top:14px">'+TEMAS[t]+'</h2>'+l.map(c=>'<div class="card"><b>'+c[0]+' · '+esc(c[1])+'</b><p class="small" style="margin:4px 0">'+esc(c[2])+'</p><p class="small mut" style="margin:0"><b>Evidencia típica:</b> '+esc(c[3])+'</p></div>').join('');});
  }else if(tabBib==='glosario'){
    h+=buscador+filt(GLOSARIO).map(g=>'<div class="card"><b>'+esc(g[0])+'</b><p class="small" style="margin:4px 0">'+esc(g[1])+'</p>'+(g[2]?'<p class="small mut" style="margin:0"><b>Al auditar:</b> '+esc(g[2])+'</p>':'')+'</div>').join('');
  }else if(tabBib==='tecnicas'){
    h+='<p class="mut small">Pensadas para quien audita procesos técnicos sin ser técnico: se audita la evidencia, no la tecnología.</p>'+TECNICAS.map((t,i)=>'<div class="card"><b>'+(i+1)+'. '+esc(t[0])+'</b><p class="small" style="margin:4px 0 0">'+esc(t[1])+'</p></div>').join('');
  }else{
    h+='<p class="mut small">Definiciones por defecto. <b>Use las del procedimiento de auditoría interna de la empresa si existen</b>: prevalecen sobre estas.</p>'+DEF_TIPOS.map(d=>'<div class="card"><b>'+esc(d[0])+'</b><p class="small" style="margin:4px 0 0">'+esc(d[1])+'</p></div>').join('');
  }
  return h+'</div>';
}

/* ---------- Datos / respaldo ---------- */
function vDatos(){
  const n=Object.values(S.resp).filter(r=>r.s!=='pendiente'||r.n||r.e).length;
  let h='<div class="wrap"><h1>Datos y respaldo</h1>';
  h+='<div class="card"><p>Todo lo que escribe se guarda <b>únicamente en este navegador y dispositivo</b>. No se envía a ningún servidor. Esto protege la confidencialidad de la auditoría, pero tiene un riesgo: si se borran los datos del navegador, se pierden.</p><p class="small mut">Registros guardados: '+n+' respuestas · '+S.hall.length+' hallazgos.</p>'+(storageOK?'':'<p><b>Este navegador no permite guardar datos.</b> Use «Descargar respaldo» con frecuencia.</p>')+'</div>';
  h+='<div class="card"><h2>Respaldo</h2><div class="row"><button class="primary" data-a="backup">Descargar respaldo (.json)</button><label class="btn" style="margin:0;font-weight:400">Restaurar respaldo<input type="file" accept=".json" data-a="restore" class="hide"></label></div><p class="small mut">Último respaldo: '+(S.ultimoRespaldo?esc(new Date(S.ultimoRespaldo).toLocaleString()):'nunca')+'. Recomendación: al final de cada día, y envíelo a un lugar seguro autorizado por la empresa.</p></div>';
  h+='<div class="card"><h2>Exportar a Excel</h2><div class="row"><button data-a="csvr">Todas las respuestas (CSV)</button><button data-a="csvh">Hallazgos (CSV)</button></div></div>';
  h+='<div class="card"><h2>Apariencia</h2><div class="row"><button data-a="tema" data-t="auto">Automático</button><button data-a="tema" data-t="light">Claro</button><button data-a="tema" data-t="dark">Oscuro</button></div></div>';
  h+='<div class="card"><h2>Empezar de cero</h2><p class="small">Borra todas las respuestas y hallazgos de este dispositivo. Haga antes un respaldo.</p><button class="danger" data-a="reset">Borrar todo</button></div></div>';
  return h;
}

/* ---------- Modal de referencia ---------- */
function modalRef(id){
  const r=REFS[id];if(!r)return;
  const cob=cobertura()[id];
  let h='<div class="modal" data-a="cerrar"><div role="dialog" aria-modal="true" aria-label="'+esc(id)+'"><div class="row"><h2 style="margin:0">'+esc(id)+' · '+esc(r.t)+'</h2><span class="sp"></span><button class="sm" data-a="cerrar">Cerrar</button></div>';
  h+='<p style="margin-top:10px">'+esc(r.s)+'</p><p class="small"><b>Evidencia típica:</b> '+esc(r.e)+'</p>';
  h+='<p class="small"><b>En el cronograma:</b> '+(cob.asig.length?cob.asig.map(i=>'<a href="#/sesion/'+i+'">'+esc(SES[i].nombre)+'</a>').join(', '):(cob.soloSoA?'solo en la sesión SoA (13 nov)':'no asignado'))+'</p>';
  if(cob.qs.length)h+='<p class="small"><b>Preguntas relacionadas:</b> '+cob.qs.length+' · Estado: '+(cob.peor==='pendiente'?'sin verificar':TIPOS[cob.peor].n)+'</p>';
  return h+'</div></div>';
}

/* ---------- Eventos ---------- */
document.addEventListener('click',e=>{
  const el=e.target.closest('[data-a]');if(!el)return;
  const a=el.dataset.a;
  if(el.tagName==='INPUT'&&el.type==='file')return;
  if(a==='cerrar'){if(e.target.closest('div[role=dialog]')&&el.classList.contains('modal')&&e.target!==el)return;$('.modal')?.remove();return;}
  if(a==='ref'){e.preventDefault();const m=document.createElement('div');m.innerHTML=modalRef(el.dataset.id);document.body.appendChild(m.firstElementChild);return;}
  if(a==='st'){const id=el.dataset.id;const act=R(id).s;setR(id,{s:act===el.dataset.s?'pendiente':el.dataset.s});refreshQ(id);return;}
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
  if(a==='print'){window.print();return;}
  if(a==='copiarinf'){const t=informeTexto();(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>toast('Informe copiado')).catch(()=>{const p=$('#inf-prev');const r=document.createRange();r.selectNodeContents(p);const s=getSelection();s.removeAllRanges();s.addRange(r);toast('Seleccionado: use Copiar');});return;}
  if(a==='docinf'){descargar('Informe-Auditoria-ISO27001.doc','<html><head><meta charset="utf-8"></head><body><pre style="font-family:Calibri,Arial;font-size:11pt;white-space:pre-wrap">'+esc(informeTexto())+'</pre></body></html>','application/msword');return;}
  if(a==='backup'){S.ultimoRespaldo=new Date().toISOString();save();descargar('respaldo-auditoria-'+hoyISO()+'.json',JSON.stringify(S,null,1),'application/json');toast('Respaldo descargado');render();return;}
  if(a==='csvr'){
    const rows=[['Sesión','Id','Requisito(s)','Pregunta','Resultado','Notas','Evidencia vista']];
    SESIONES.forEach(s=>QS[s.id].forEach(q=>{const r=R(q.id);if(r.s!=='pendiente'||r.n||r.e)rows.push([s.nombre,q.id,q.ref.join(' '),q.q,TIPOS[r.s].n,r.n,r.e]);}));
    descargar('respuestas-auditoria.csv','﻿'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n'),'text/csv;charset=utf-8');return;}
  if(a==='csvh'){
    const rows=[['Id','Clasificación','Sesión','Auditado','Requisito','Evidencia objetiva','Hallazgo','Consecuencia','Causa','Validado']];
    S.hall.forEach(x=>rows.push([x.id,HTIPOS[x.tipo],SES[x.ses]?SES[x.ses].nombre:'',x.aud,x.req||reqTexto(x.ref||''),x.evid,x.cond,x.efecto,x.causa,x.validado?'Sí':'No']));
    descargar('hallazgos-auditoria.csv','﻿'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n'),'text/csv;charset=utf-8');return;}
  if(a==='tema'){const t=el.dataset.t;if(t==='auto')document.documentElement.removeAttribute('data-theme');else document.documentElement.setAttribute('data-theme',t);try{localStorage.setItem(KEY+'-tema',t);}catch(x){}return;}
  if(a==='reset'){if(confirm('Se borrarán TODAS las respuestas y hallazgos de este dispositivo. ¿Continuar?')){S=defaults();save();render();toast('Datos borrados');}return;}
});
document.addEventListener('change',e=>{
  const t=e.target;
  if(t.dataset.a==='gprep'){S.gprep[t.dataset.i]=t.checked;save();render();return;}
  if(t.dataset.a==='prep'){S.prep[t.dataset.k]=t.checked;save();return;}
  if(t.dataset.a==='doc'){S.docs[t.dataset.k]=t.checked;save();return;}
  if(t.dataset.a==='restore'){
    const f=t.files[0];if(!f)return;const rd=new FileReader();
    rd.onload=()=>{try{const o=JSON.parse(rd.result);if(!o||typeof o!=='object'||!o.resp)throw 0;S=Object.assign(defaults(),o);save();render();toast('Respaldo restaurado');}catch(x){alert('El archivo no es un respaldo válido.');}};
    rd.readAsText(f);return;}
  if(t.dataset.hf){const x=S.hall.find(z=>z.id===ruta().a);if(!x)return;const k=t.dataset.hf;x[k]=t.type==='checkbox'?t.checked:t.value;save();refreshH(x.id);}
});
document.addEventListener('input',e=>{
  const t=e.target;
  if(t.dataset.f==='n'||t.dataset.f==='e'){setR(t.dataset.id,{[t.dataset.f]:t.value});return;}
  if(t.dataset.f==='concl'){S.informe.conclusion=t.value;save();const p=$('#inf-prev');if(p)p.textContent=informeTexto();return;}
  if(t.dataset.hf&&t.type!=='checkbox'){const x=S.hall.find(z=>z.id===ruta().a);if(!x)return;x[t.dataset.hf]=t.value;save();refreshH(x.id);return;}
  if(t.id==='busca'){busqueda=t.value;const pos=t.selectionStart;render();const n=$('#busca');if(n){n.focus();n.setSelectionRange(pos,pos);}}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')$('.modal')?.remove();});

/* ---------- Arranque ---------- */
(function(){
  try{const t=localStorage.getItem(KEY+'-tema');if(t&&t!=='auto')document.documentElement.setAttribute('data-theme',t);}catch(e){}
  if(!location.hash)location.hash='#/plan';
  render();
})();
