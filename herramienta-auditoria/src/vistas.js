/* ===== VISTAS ===== */
/* ---------- Avisos, confirmaciones y hojas ---------- */
function toast(msg,acc){
  $$('.toast').forEach(t=>t.remove());
  const t=document.createElement('div');t.className='toast';t.setAttribute('role','status');
  t.innerHTML=`<span>${esc(msg)}</span>`+(acc?`<button type="button">${esc(acc.t)}</button>`:'');
  document.body.appendChild(t);let hecho=false;
  const cerrar=(porClic)=>{if(hecho)return;hecho=true;t.remove();if(!porClic&&acc&&acc.fin)acc.fin();};
  if(acc)t.querySelector('button').addEventListener('click',()=>{if(hecho)return;hecho=true;t.remove();acc.f();});
  setTimeout(()=>cerrar(false),acc?7000:3200);
}
function hoja(html,cls){
  cerrarModal();const m=document.createElement('div');m.className='modal';m.setAttribute('data-a','cerrar');
  m.innerHTML=`<div role="dialog" aria-modal="true" class="${cls||''}">${html}</div>`;document.body.appendChild(m);
  const f=m.querySelector('[autofocus]')||m.querySelector('button,input,select,textarea');if(f)setTimeout(()=>f.focus({preventScroll:true}),30);return m;
}
function cerrarModal(){$$('.modal').forEach(m=>m.remove());}
function confirmar(o){
  return new Promise(res=>{
    const m=hoja(`<h2>${esc(o.titulo)}</h2><p class="mut">${esc(o.texto||'')}</p><div class="fila" style="justify-content:flex-end;margin-top:14px"><button type="button" class="fantasma" data-c="0">Cancelar</button><button type="button" class="${o.peligro?'peligro':'primario'}" data-c="1" autofocus>${esc(o.ok||'Aceptar')}</button></div>`);
    m.addEventListener('click',e=>{const b=e.target.closest('[data-c]');if(b){e.stopPropagation();m.remove();res(b.dataset.c==='1');}else if(e.target===m){m.remove();res(false);}},true);
  });
}

/* ---------- Router y estructura ---------- */
let tabNext=null,tabSes='preparar',filtroQ='todas',filtroSoA='pend',filtroH='todos',filtroCob='todos',tabBib='clausulas',busqueda='',filtroLV='4',filtroD='todos';
function ruta(){const h=location.hash.replace(/^#\/?/,'')||'hoy';const p=h.split('/');return {v:p[0],a:decodeURIComponent(p[1]||'')};}
let _ultimaRuta=null;
function render(){
  const r=ruta(),mismo=_ultimaRuta===location.hash,y=window.scrollY;
  const mapa={hoy:vHoy,plan:vHoy,sesion:()=>vSesion(r.a),documentos:vDocumentos,documento:()=>vDocumento(r.a),hallazgos:vHallazgos,hallazgo:()=>vHallazgo(r.a),formatos:vFormatos,lista:vLista,cobertura:vCobertura,cronograma:vCronograma,biblioteca:vBiblioteca,datos:vDatos,mas:vMas,ayuda:vAyuda};
  $('#app').innerHTML=(mapa[r.v]||vHoy)();
  _ultimaRuta=location.hash;if(mismo)window.scrollTo(0,y);
  pintarNav(r);avisoStorage();
}
window.addEventListener('hashchange',()=>{cerrarModal();tabSes=tabNext||'preparar';tabNext=null;filtroQ='todas';window.scrollTo(0,0);render();});
function pintarNav(r){
  const nd=Object.keys(S.docs).length,nh=S.hall.length;
  const grupo={sesion:'hoy',plan:'hoy',documento:'documentos',hallazgo:'hallazgos',lista:'mas',cobertura:'mas',cronograma:'mas',biblioteca:'mas',datos:'mas',ayuda:'mas'}[r.v]||r.v;
  const it=[['hoy','Hoy','hoy',0],['documentos','Documentos','docbusca',nd],['hallazgos','Hallazgos','bandera',nh],['formatos','Formatos','formatos',0],['mas','Más','menu',0]];
  $('nav.main').innerHTML=it.map(x=>`<a href="#/${x[0]}" class="${grupo===x[0]?'on':''}" ${grupo===x[0]?'aria-current="page"':''}>${I(x[2])}<span>${x[1]}</span>${x[3]?`<span class="n">${x[3]}</span>`:''}</a>`).join('');
}
let _gt=null;
function marcarGuardado(ok){const g=$('#guardado');if(!g)return;g.innerHTML=ok?`${I('check')}<span class="gt">Guardado</span>`:`${I('alerta')}<span class="gt">Sin guardar</span>`;g.classList.add('on');clearTimeout(_gt);_gt=setTimeout(()=>g.classList.remove('on'),2200);}

/* ---------- Componentes ---------- */
const stampQ=st=>`<span class="badge ${TIPOS[st].c}">${TIPOS[st].abbr==='—'?TIPOS[st].n:TIPOS[st].n}</span>`;
const fechaLarga=()=>{const t=new Date().toLocaleDateString('es-DO',{weekday:'long',day:'numeric',month:'long'});return t.charAt(0).toUpperCase()+t.slice(1);};
function anillo(p){return `<span class="anillo" style="--p:${p}" role="img" aria-label="${p}% completado"><b>${p}%</b></span>`;}
function vacio(ic,tit,txt,acc){return `<div class="card plano vacio">${I(ic)}<h3>${esc(tit)}</h3><p>${esc(txt)}</p>${acc||''}</div>`;}
const iconoSes=s=>({apertura:'play',equipo:'persona',informe:'doc',cierre:'check',pendientes:'lista',tecnologia:'escudo',desarrollo:'escudo',servicios_ti:'escudo',legal:'libro',revision:'barras',soa:'lista'}[s.guia]||'carpeta');

/* ---------- HOY ---------- */
function vHoy(){
  const mis=SESIONES.filter(s=>S.aj.todos||esMia(s));const hoy=hoyISO(),d0=diasHasta(DIAS[4]);
  const sig=mis.find(s=>!S.est[s.id]&&DIAS[s.dia]>=hoy)||mis.find(s=>!S.est[s.id]);
  const nSes=SESIONES.filter(esMia),hechas=nSes.filter(s=>S.est[s.id]).length;
  let preg=0,tot=0;SESIONES.filter(esFormato).forEach(s=>{const p=prog(s);preg+=p.hechas;tot+=p.total;});
  const c=resumenHall(),nh=S.hall.length,nd=Object.keys(S.docs).length;
  let sub;if(d0>0)sub=`Faltan ${d0} día${d0===1?'':'s'} para el inicio de la auditoría (miércoles 4, 10:00).`;else if(Object.values(DIAS).includes(hoy))sub='Hoy hay sesiones de auditoría.';else sub='Seguimiento del plan de auditoría.';
  let h=`<div class="wrap"><div class="pagina-t"><h1>Hoy</h1><p class="sub">${esc(fechaLarga())} · ${esc(sub)}</p></div>`;
  if(sig){
    const p=prog(sig),ini=p.hechas>0;
    h+=`<section class="card" aria-label="Siguiente sesión"><div class="fila" style="align-items:flex-start;gap:14px"><div style="flex:1;min-width:200px"><h4>${S.est[sig.id]?'Sesión':'Siguiente sesión'} · ${esc(DIA_NOMBRE[sig.dia])}, ${esc(sig.hora)}</h4><h2 style="font-size:1.3rem;margin:4px 0 6px">${esc(sig.nombre)}</h2><p class="small mut" style="margin:0 0 12px">${esc(sig.aud.join(' · '))}</p><div class="fila"><a class="btn primario g" href="#/sesion/${sig.id}" data-a="ir" data-id="${sig.id}" data-tab="${ini?'preguntar':'preparar'}">${I('play')}${ini?'Continuar':'Comenzar'}</a>${GUIAS[sig.guia]&&p.total?`<span class="small mut">${p.hechas} de ${p.total} preguntas</span>`:''}</div></div>${GUIAS[sig.guia]&&p.total?anillo(p.pct):''}</div></section>`;
  }
  h+=`<div class="acciones">
    <button class="g" data-a="subir" style="flex-direction:column;height:auto;padding:16px 8px;gap:6px">${I('subir')}<span>Adjuntar documento</span></button>
    <button class="g" data-a="nuevoh" style="flex-direction:column;height:auto;padding:16px 8px;gap:6px">${I('bandera')}<span>Nuevo hallazgo</span></button>
    <a class="btn g" href="#/lista" style="flex-direction:column;height:auto;padding:16px 8px;gap:6px">${I('lista')}<span>Lista de verificación</span></a>
    <a class="btn g" href="#/formatos" style="flex-direction:column;height:auto;padding:16px 8px;gap:6px">${I('formatos')}<span>Generar formatos</span></a></div>`;
  h+=`<div class="kpis" style="margin-bottom:6px"><div class="kpi"><b>${hechas}/${nSes.length}</b><span>Sesiones completas</span></div><div class="kpi"><b>${preg}</b><span>Preguntas respondidas${tot?` de ${tot}`:''}</span></div><div class="kpi"><b>${nh}</b><span>Hallazgos${nh?` · ${c.ncmayor+c.ncmenor} NC`:''}</span></div><div class="kpi"><b>${nd}</b><span>Documentos adjuntos</span></div></div>`;
  const hp=PREP_GENERAL.filter((t,i)=>S.gprep[i]).length;
  h+=`<details class="card" style="margin-top:12px" ${hp<PREP_GENERAL.length&&d0>=0?'open':''}><summary style="cursor:pointer;font-weight:600;list-style:none;display:flex;align-items:center;gap:10px">${I('lista')}Antes de empezar <span class="chip" style="margin:0 0 0 auto">${hp}/${PREP_GENERAL.length}</span></summary><div style="margin-top:8px">${PREP_GENERAL.map((t,i)=>`<label class="casilla"><input type="checkbox" data-a="gprep" data-i="${i}" ${S.gprep[i]?'checked':''}><span>${esc(t)}</span></label>`).join('')}</div></details>`;
  const alta=REVISION.filter(r=>r.sev==='alta').length;
  h+=`<a class="item" href="#/cronograma" style="margin-top:0"><span class="ico" style="background:var(--warn-soft);color:var(--warn)">${I('alerta')}</span><div><h3>Revisión crítica del cronograma</h3><div class="meta">${alta} puntos de prioridad alta para aclarar con el líder del equipo</div></div>${I('der','fin')}</a>`;
  h+=`<div class="seccion-t"><h2>Agenda</h2><span class="sp"></span><button class="s fantasma" data-a="todos">${S.aj.todos?'Solo mis sesiones':'Ver todo el cronograma'}</button></div>`;
  const dias=Array.from(new Set(mis.map(s=>s.dia)));
  dias.forEach(d=>{
    const ss=mis.filter(s=>s.dia===d),esHoy=DIAS[d]===hoy,abre=esHoy||(sig&&sig.dia===d);
    h+=`<details class="agenda" ${abre?'open':''} style="margin-bottom:6px"><summary class="dia" style="cursor:pointer;list-style:none">${esHoy?'<span class="badge b-hoy">Hoy</span>':''}${esc(DIA_NOMBRE[d])} de noviembre <span style="font-weight:400;letter-spacing:0;text-transform:none">· ${ss.length===1?'1 sesión':ss.length+' sesiones'}</span></summary>`;
    ss.forEach(s=>{
      const p=prog(s),tec=['tecnologia','desarrollo','servicios_ti'].includes(s.id);
      h+=`<a class="item ${S.est[s.id]?'hecha':''} ${sig&&s.id===sig.id?'siguiente':''}" href="#/sesion/${s.id}"><span class="ico">${I(iconoSes(s))}</span><div style="min-width:0"><div class="meta"><b style="color:var(--ink)">${esc(s.hora)}</b>${S.est[s.id]?' · Completada':''}${!esMia(s)?' · Otro auditor':''}</div><h3>${esc(s.nombre)}</h3><div>${tec?'<span class="badge b-tec">Técnica</span>':''}${GUIAS[s.guia]&&p.total?`<span class="small mut">${p.hechas}/${p.total} preguntas</span>`:''}</div></div>${GUIAS[s.guia]&&p.total?anillo(p.pct):I('der','fin')}</a>`;
    });
    h+='</details>';
  });
  h+=`<p class="small mut" style="margin-top:18px">${storageOK?'Sus datos se guardan solo en este dispositivo. ':'<b>Este navegador no permite guardar.</b> '}${S.ultimoRespaldo?'Último respaldo: '+esc(new Date(S.ultimoRespaldo).toLocaleString('es-DO'))+'.':'Aún no ha hecho un respaldo (Más → Datos).'}</p>`;
  return h+'</div>';
}

/* ---------- Pregunta ---------- */
const BTN_ORDEN=['conforme','obs','om','ncmenor','ncmayor','seguimiento','na'];
const BTN_TXT={conforme:'Conforme',obs:'Observación',om:'Mejora',ncmenor:'NC menor',ncmayor:'NC mayor',seguimiento:'Seguimiento',na:'No aplica'};
const BTN_ICO={conforme:'check',obs:'ojo',om:'mejora',ncmenor:'alerta',ncmayor:'nc',seguimiento:'reloj',na:'na'};
const BTN_CLS={conforme:'c-ok',obs:'c-obs',om:'c-om',ncmenor:'c-ncm',ncmayor:'c-ncM',seguimiento:'c-seg',na:'c-na'};
const METODOS=[['doc','Revisión documental'],['ent','Entrevista'],['obs','Observación'],['mue','Muestreo']];
const hallDeQ=qid=>S.hall.find(h=>h.qid===qid);
const LVB=[['si','Sí','c-ok','check'],['no','No','c-ncM','x'],['na','N/A','c-na','na']];
function lvBtns(i){const v=(S.lv[i]||{}).s;return `<div class="estado">${LVB.map(b=>`<button type="button" class="${b[2]}" aria-pressed="${v===b[0]}" data-a="lv" data-i="${i}" data-s="${b[0]}">${I(b[3])}${b[1]}</button>`).join('')}</div>`;}
function lvDeQ(q){const s=new Set();q.ref.forEach(r=>(LV_REF[r]||[]).forEach(i=>s.add(i)));return Array.from(s);}
function evidenciaPrevia(q){const out=[];SESIONES.forEach(s=>{if(s.id===q.ses||esCheck(s))return;QS[s.id].forEach(x=>{if(x.k!=='c'&&x.ref.includes(q.ref[0])&&R(x.id).s!=='pendiente')out.push({ses:s,q:x});});});return out;}
const nivelPunto=d=>d.estado==='error'?'bad':d.estado==='procesando'?'neutro':d.estado==='sinTexto'?'neutro':(d.analisis&&d.analisis.nivel)||'neutro';
function chipDoc(d){return `<a class="chip" href="#/documento/${d.id}" title="${esc(d.nombre)}"><span class="punto ${nivelPunto(d)}"></span>${esc(d.nombre.length>30?d.nombre.slice(0,28)+'…':d.nombre)}</a>`;}

function cardQ(q,opt){
  opt=opt||{};const r=R(q.id),ses=SES[q.ses],chk=esCheck(ses);
  const dq=docsDeQ(q.id),lv=lvDeQ(q),hh=hallDeQ(q.id);
  const abN=!!(r.n||r.e||(r.m&&r.m.length)||(r.s!=='pendiente'&&!chk));
  let h=`<article class="q s-${r.s}" id="q-${esc(q.id)}" data-id="${esc(q.id)}">`;
  h+=`<div class="q-t">${refsHTML(refsOrdenados(q.ref))}${q.sug?'<span class="badge b-sug" title="No figura en el cronograma; lo agregué por riesgo">sugerido</span>':''}${q.k==='t'?'<span class="badge t-na">transversal</span>':''}${opt.mostrarSes?`<a class="chip" href="#/sesion/${esc(ses.id)}">${esc(ses.nombre)}</a>`:''}${r.s!=='pendiente'&&!chk?`<span style="margin-left:auto">${stampQ(r.s)}</span>`:''}</div>`;
  h+=`<p class="q-txt">${esc(q.q)}</p>`;
  if(q.ev)h+=`<div class="q-pide">${I('ojo')}<div><b>${q.k==='c'?'Evidencia típica':'Pida ver'}:</b> ${esc(q.ev)}</div></div>`;
  if(q.evid&&q.evid.length){const xs=r.x||[],n=xs.filter(i=>i<q.evid.length).length;h+=`<details class="evid"><summary>${I('ojo')}Evidencias a solicitar <span class="n">${n}/${q.evid.length} recibidas</span></summary><div class="cuerpo">${q.evid.map((t,i)=>`<label class="casilla"><input type="checkbox" data-a="evx" data-id="${esc(q.id)}" data-i="${i}" ${xs.includes(i)?'checked':''}><span>${esc(t)}</span></label>`).join('')}</div></details>`;}
  if(q.k==='c'){const pv=evidenciaPrevia(q);if(pv.length)h+=`<p class="small" style="margin:0 0 8px"><span class="badge t-ok">Ya revisado esta semana</span> ${pv.map(p=>esc(p.ses.nombre)+' ('+TIPOS[R(p.q.id).s].n+')').join('; ')}</p><p class="small mut">${esc(q.ctrl[2])}</p>`;else h+=`<p class="small mut">${esc(q.ctrl[2])}</p>`;}
  if(chk)h+=`<div class="estado"><button type="button" class="c-ok" aria-pressed="${r.s==='conforme'}" data-a="st" data-id="${esc(q.id)}" data-s="conforme">${I('check')}${r.s==='conforme'?'Hecho':'Marcar como hecho'}</button></div>`;
  else h+=`<div class="estado" role="group" aria-label="Resultado">${BTN_ORDEN.map(s=>`<button type="button" class="${BTN_CLS[s]}" aria-pressed="${r.s===s}" data-a="st" data-id="${esc(q.id)}" data-s="${s}">${I(BTN_ICO[s])}${BTN_TXT[s]}</button>`).join('')}</div>`;
  h+='<div class="mas">';
  h+=`<details class="notas" ${abN?'open':''}><summary>${I('lapiz')}Notas, método y evidencia ${r.n||r.e?'<span class="n">con datos</span>':''}</summary><div class="cuerpo"><textarea data-f="n" data-id="${esc(q.id)}" placeholder="Qué respondió o qué observé (hechos, sin adjetivos)" aria-label="Notas">${esc(r.n)}</textarea>`;
  if(!chk){
    h+=`<input type="text" data-f="e" data-id="${esc(q.id)}" placeholder="Evidencia vista: documento, fecha, muestra, quién la mostró" value="${esc(r.e)}" aria-label="Evidencia vista">`;
    h+=`<div class="filtros" role="group" aria-label="Método de auditoría" style="margin:8px 0">${METODOS.map(m=>`<button type="button" class="${(r.m||[]).includes(m[0])?'on':''}" aria-pressed="${(r.m||[]).includes(m[0])}" data-a="mt" data-id="${esc(q.id)}" data-m="${m[0]}">${m[1]}</button>`).join('')}</div>`;
    if(hh)h+=`<a class="btn s" href="#/hallazgo/${hh.id}">${I('bandera')}Ver hallazgo ${hh.id}</a>`;
    else if(['obs','om','ncmenor','ncmayor','seguimiento'].includes(r.s))h+=`<button type="button" class="s primario" data-a="mkhall" data-id="${esc(q.id)}">${I('bandera')}Convertir en hallazgo</button>`;
    else if(r.s==='conforme')h+=`<button type="button" class="s" data-a="mkhall" data-id="${esc(q.id)}">${I('estrella')}Registrar como punto fuerte</button>`;
  }
  h+='</div></details>';
  if(!chk)h+=`<details ${dq.length?'open':''}><summary>${I('clip')}Documentos ${dq.length?`<span class="n">${dq.length}</span>`:''}</summary><div class="cuerpo">${dq.length?`<div style="margin-bottom:8px">${dq.map(d=>`<span style="display:inline-flex;align-items:center">${chipDoc(d)}<button type="button" class="ib" style="width:26px;height:26px;margin:0 6px 4px -2px" data-a="desvinc" data-d="${d.id}" data-id="${esc(q.id)}" aria-label="Quitar vínculo">${I('x')}</button></span>`).join('')}</div>`:'<p class="small mut">Sin documentos vinculados a esta pregunta.</p>'}<div class="fila"><button type="button" class="s suave" data-a="subirq" data-id="${esc(q.id)}">${I('subir')}Adjuntar archivo</button>${docsLista().length?`<button type="button" class="s" data-a="elegirdoc" data-id="${esc(q.id)}">${I('enlace')}Usar uno ya adjuntado</button>`:''}</div></div></details>`;
  if(q.al)h+=`<details><summary>${I('alerta')}Señales de alerta</summary><div class="cuerpo"><div class="alerta">${esc(q.al)}</div></div></details>`;
  if(!chk&&lv.length){const ab=lv.some(i=>S.lv[i]&&S.lv[i].s);h+=`<details class="lvq" ${ab?'open':''}><summary>${I('lista')}Lista de verificación FOR-SGI-10 <span class="n">${lv.length}</span></summary><div class="cuerpo">${lv.map(i=>`<div class="lvi"><span class="ref" style="cursor:default">${esc(LISTA[i][0])}</span> <b>${esc(LISTA[i][2])}</b><p class="small mut" style="margin:4px 0 8px">${esc(LISTA[i][3])}</p>${lvBtns(i)}</div>`).join('')}</div></details>`;}
  return h+'</div></article>';
}
function refreshQ(id){
  const q=QBYID[id],el=document.getElementById('q-'+id);if(!q||!el)return;
  const tmp=document.createElement('div');tmp.innerHTML=cardQ(q,{mostrarSes:!!el.querySelector('a.chip[href^="#/sesion"]')});const nuevo=tmp.firstElementChild;
  const abiertos=$$('details',el).map(d=>d.open);$$('details',nuevo).forEach((d,i)=>{if(abiertos[i])d.open=true;});
  el.replaceWith(nuevo);const hd=$('#prog-ses');if(hd)hd.innerHTML=progHTML(SES[q.ses]);
  const fb=$('#foco-prog');if(fb)fb.innerHTML=focoProg(SES[q.ses]);
}
function progHTML(ses){
  const p=prog(ses),c=contar(ses);const st=['ncmayor','ncmenor','obs','om'].filter(k=>c[k]).map(k=>`<span class="badge ${TIPOS[k].c}">${TIPOS[k].abbr} ${c[k]}</span>`).join('');
  return `<div class="fila" style="gap:12px"><div class="barra" style="flex:1"><i style="width:${p.pct}%"></i></div><span class="small mut" style="white-space:nowrap">${p.hechas}/${p.total} · ${p.pct}%</span></div>${st?`<div style="margin-top:8px">${st}</div>`:''}`;
}

/* ---------- SESIÓN ---------- */
function vSesion(id){
  const s=SES[id];if(!s)return `<div class="wrap">${vacio('alerta','Sesión no encontrada','Es posible que el enlace sea antiguo.',`<a class="btn primario" href="#/hoy">Volver a Hoy</a>`)}</div>`;
  const g=GUIAS[s.guia];
  let h=`<div class="wrap"><p class="small" style="margin:0 0 10px"><a href="#/hoy" style="display:inline-flex;align-items:center;gap:4px;text-decoration:none">${I('izq')}Hoy</a></p>`;
  h+=`<div class="card"><div class="small mut">${esc(DIA_NOMBRE[s.dia])} · ${esc(s.hora)} · ${esc(s.grupo)}</div><h1 style="margin:4px 0 10px">${esc(s.nombre)}</h1><div class="small" style="line-height:1.7"><b>Auditados:</b> ${esc(s.aud.join(' · '))}<br><b>Auditores:</b> ${esc(s.ads.join(', '))}<br><b>Norma:</b> ${esc(s.std)}</div>${s.nota?`<p class="small" style="margin-top:8px"><span class="badge b-sug">Verificar</span> ${esc(s.nota)}</p>`:''}${g&&!['pendientes','informe'].includes(s.guia)?`<div id="prog-ses" style="margin-top:12px">${progHTML(s)}</div>`:''}</div>`;
  if(!g)return h+`<div class="card suave"><p><b>Esta sesión la conduce ${esc(s.ads.join(', '))}; usted no está asignado.</b> No hay guía de preguntas. Pida el resumen de hallazgos en la reunión diaria del equipo.</p>${s.cubreSet.size?`<p class="small">Cubre: ${refsHTML(Array.from(s.cubreSet).filter(x=>x!=='A.*'))}</p>`:''}</div></div>`;
  const tr=s.guia==='equipo'||s.guia==='pendientes'||s.guia==='informe';
  h+=`<div class="pasos" role="tablist">${[['preparar','1 · Preparar'],['preguntar',tr?'2 · Trabajo':'2 · '+(g.etiqueta==='Preguntar'||!g.etiqueta?'Preguntar':g.etiqueta)],['cerrar','3 · Cerrar']].map(t=>`<button role="tab" aria-selected="${tabSes===t[0]}" class="${tabSes===t[0]?'on':''}" data-a="tab" data-t="${t[0]}">${t[1]}</button>`).join('')}</div>`;
  h+=tabSes==='preparar'?sPreparar(s,g):tabSes==='preguntar'?sPreguntar(s,g):sCerrar(s,g);
  return h+'</div>';
}
function cardDocsSesion(s,titulo){
  const ds=docsDeSes(s.id);
  return `<div class="card"><div class="fila"><h2 style="margin:0">${I('clip')} ${titulo||'Documentos de esta sesión'}</h2><span class="sp"></span><button class="s suave" data-a="subirs" data-id="${esc(s.id)}">${I('subir')}Adjuntar</button></div>${ds.length?`<div style="margin-top:10px">${ds.map(d=>`<a class="item" style="box-shadow:none;margin:0 0 6px;padding:10px 12px" href="#/documento/${d.id}"><span class="ico" style="width:34px;height:34px">${I(iconoDoc(d.ext))}</span><div style="min-width:0"><h3 style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(d.nombre)}</h3><div class="meta"><span class="punto ${nivelPunto(d)}"></span>${esc(resumenCorto(d))}</div></div>${I('der','fin')}</a>`).join('')}</div>`:`<p class="small mut" style="margin:8px 0 0">Adjunte los documentos que le entreguen (políticas, procedimientos, registros). Se analizan en su dispositivo y le sugieren preguntas y borradores de hallazgo.</p>`}</div>`;
}
const resumenCorto=d=>d.estado==='procesando'?'Analizando…':d.estado==='error'?'No se pudo leer':d.estado==='sinTexto'?'Sin texto legible':(d.analisis?d.analisis.resumen.replace(/^«[^»]*»\s*\(([^)]*)\):\s*/,'$1: '):'');
const DOCS_ESPERADOS={
 planificacion:['politica','metodologia_riesgos','plan_tratamiento','soa','objetivos'],sig:['politica','procedimiento','objetivos'],
 tecnologia:['backup','control_acceso','incidentes','inventario'],desarrollo:['desarrollo_seguro','procedimiento'],
 servicios_ti:['plan_continuidad','incidentes','proveedores','inventario','registro_incidentes'],ventas:['datos_personales','acuerdo'],
 marcas:['datos_personales','acuerdo','proveedores'],legal:['legal','datos_personales','acuerdo'],revision:['revision_direccion','informe_auditoria','objetivos'],
 soa:['soa','plan_tratamiento','metodologia_riesgos']};
function cardDocsEsperados(s){
  const tipos=DOCS_ESPERADOS[s.guia];if(!tipos)return '';
  const ds=docsLista().filter(d=>d.estado==='listo'&&d.analisis);
  const filas=tipos.map(t=>{const d=ds.find(x=>x.analisis.tipo===t&&(x.ses===s.id||!x.ses))||ds.find(x=>x.analisis.tipo===t);return {t,d};});
  const n=filas.filter(f=>f.d).length;
  return `<div class="card"><div class="fila"><h2 style="margin:0">Documentos que conviene revisar</h2><span class="sp"></span><span class="chip" style="margin:0">${n}/${tipos.length} adjuntados</span></div><p class="small mut" style="margin:6px 0 4px">Según los requisitos de esta sesión. Pídalos antes de entrar y adjúntelos para obtener su análisis.</p>${filas.map(f=>`<div class="fila" style="padding:9px 0;border-top:1px solid var(--line);flex-wrap:nowrap"><span class="punto ${f.d?nivelPunto(f.d):'neutro'}" style="flex:none"></span><div style="flex:1;min-width:0"><b class="small">${esc(TIPOS_DOC[f.t].n)}</b><div class="tiny mut">${f.d?`<a href="#/documento/${f.d.id}">${esc(f.d.nombre)}</a> · ${esc(NIVEL_TXT[f.d.analisis.nivel]||'')}`:'Aún no adjuntado'}</div></div>${f.d?I('check'):`<button class="s" data-a="subirs" data-id="${esc(s.id)}">${I('subir')}Adjuntar</button>`}</div>`).join('')}</div>`;
}
function sPreparar(s,g){
  let h=`<div class="card"><h2>Qué debe demostrar</h2><p>${esc(g.objetivo)}</p><h4 style="margin-top:12px">En simple</h4><p class="mut" style="margin:0">${esc(g.simple)}</p></div>`;
  h+=REVISION.filter(r=>r.s.includes(s.id)).map(r=>`<div class="card ${r.sev==='alta'?'mal':'aviso'}"><b>Atención de cronograma · ${esc(r.t)}</b><p class="small" style="margin:6px 0 0">${esc(r.a)}</p></div>`).join('');
  if(g.prep&&g.prep.length)h+=`<div class="card"><h2>Solicite antes de entrar</h2>${g.prep.map((t,i)=>`<label class="casilla"><input type="checkbox" data-a="prep" data-k="${esc(s.id+':'+i)}" ${S.prep[s.id+':'+i]?'checked':''}><span>${esc(t)}</span></label>`).join('')}</div>`;
  if(esFormato(s)){h+=cardDocsEsperados(s);h+=cardDocsSesion(s);}
  if(QS[s.id].some(q=>q.evid&&q.evid.length))h+=`<div class="card"><h2>Solicitud de evidencias</h2><p class="small mut" style="margin:4px 0 10px">Cada pregunta trae su lista de evidencias a pedir. Copie la solicitud completa para enviarla al auditado antes de la entrevista.</p><button class="s" data-a="copiarevid" data-id="${esc(s.id)}">${I('copiar')}Copiar solicitud de evidencias</button></div>`;
  const refs=Array.from(s.cubreSet).filter(x=>x!=='A.*'),sug=new Set();QS[s.id].forEach(q=>{if(q.sug)q.ref.forEach(r=>sug.add(r));});
  if(refs.length||sug.size){h+=`<div class="card"><h2>Requisitos que cubre</h2>`;if(refs.length)h+=`<p class="small mut" style="margin-bottom:6px">Según el cronograma (toque uno para ver qué significa):</p><p>${refsHTML(refs)}</p>`;const extra=Array.from(sug).filter(x=>!s.cubreSet.has(x));if(extra.length)h+=`<p class="small mut" style="margin-bottom:6px">Sugeridos (no están en el cronograma):</p><p>${refsHTML(extra)}</p>`;h+='</div>';}
  if(TRANS_GUIAS.includes(s.guia))h+=`<details class="card"><summary style="cursor:pointer;font-weight:600">Cómo entrevistar sin ser técnico (5 reglas)</summary><ol style="padding-left:20px">${TECNICAS.slice(0,5).map(t=>`<li style="margin:6px 0"><b>${esc(t[0])}.</b> ${esc(t[1])}</li>`).join('')}</ol><a class="small" href="#/biblioteca">Ver método completo y glosario</a></details>`;
  return h+`<div class="fila noprint"><button class="primario g" data-a="tab" data-t="preguntar">Ir a las preguntas ${I('der')}</button></div>`;
}
function qsFoco(s){const f=filtroQ==='pend'?(q=>R(q.id).s==='pendiente'):(()=>true);return QS[s.id].filter(q=>q.k!=='t'&&f(q));}
function focoProg(s){const l=qsFoco(s),i=Math.min(S.aj.foco&&S.aj.foco[s.id]||0,Math.max(0,l.length-1));return `<div class="foco-barra"><span class="small mut" style="white-space:nowrap">Pregunta ${l.length?i+1:0} de ${l.length}</span><div class="barra"><i style="width:${l.length?Math.round(100*(i+1)/l.length):0}%"></i></div></div>`;}
function sPreguntar(s,g){
  if(s.guia==='pendientes')return sPendientes();
  if(s.guia==='informe')return sInforme();
  if(s.guia==='soa')return sSoA(s,g);
  const qs=QS[s.id];let h='';if(s.guia==='equipo')h+=sHallazgosDia(s);
  const base=qs.filter(q=>q.k==='g'),tr=qs.filter(q=>q.k==='t');
  const modo=(S.aj.modo==='foco'&&!esCheck(s))?'foco':'lista';
  if(!esCheck(s))h+=`<div class="fila" style="margin-bottom:12px"><div class="filtros" style="margin:0">${[['todas','Todas'],['pend','Pendientes'],['hecha','Respondidas']].map(x=>`<button class="${filtroQ===x[0]?'on':''}" data-a="fq" data-f="${x[0]}">${x[1]}</button>`).join('')}</div><span class="sp"></span><div class="filtros" style="margin:0" role="group" aria-label="Vista"><button class="${modo==='lista'?'on':''}" data-a="modo" data-m="lista">${I('lista')}Lista</button><button class="${modo==='foco'?'on':''}" data-a="modo" data-m="foco">${I('foco')}Enfoque</button></div></div>`;
  if(modo==='foco'){
    const l=qsFoco(s);if(!l.length)return h+vacio('check','No hay preguntas en este filtro','Cambie el filtro para ver otras preguntas.');
    S.aj.foco=S.aj.foco||{};let i=Math.min(S.aj.foco[s.id]||0,l.length-1);S.aj.foco[s.id]=i;
    h+=`<div id="foco-prog">${focoProg(s)}</div>${cardQ(l[i])}<div class="foco-nav"><button data-a="focoprev" ${i===0?'disabled':''}>${I('izq')}Anterior</button><button class="primario" data-a="focosig" ${i===l.length-1?'disabled':''}>Siguiente${I('der')}</button></div><p class="small mut" style="text-align:center;margin-top:14px">Atajos: <span class="kbd">←</span> <span class="kbd">→</span> navegar · <span class="kbd">1</span>–<span class="kbd">7</span> resultado</p>`;
    return h;
  }
  const filt=esCheck(s)||filtroQ==='todas'?(()=>true):filtroQ==='pend'?(q=>R(q.id).s==='pendiente'):(q=>R(q.id).s!=='pendiente');
  const bf=base.filter(filt);let gAnt='';
  h+=bf.map(q=>{let d='';if(q.grp&&q.grp!==gAnt){gAnt=q.grp;d=`<div class="seccion-t"><h2 style="font-size:1rem">${esc(q.grp)}</h2></div>`;}return d+cardQ(q);}).join('')||vacio('check','Nada en este filtro','Pruebe con «Todas».');
  const trf=tr.filter(filt);
  if(trf.length)h+=`<details class="card" ${tr.some(q=>R(q.id).s!=='pendiente')?'open':''}><summary style="cursor:pointer;font-weight:600">Preguntas transversales (${trf.length})</summary><p class="small mut" style="margin-top:6px">Para cualquier entrevistado. Cubren política, objetivos, capacitación y reporte de incidentes.</p>${trf.map(q=>cardQ(q)).join('')}</details>`;
  return h;
}
function sSoA(s,g){
  const qs=QS[s.id],ver=qs.filter(q=>q.k==='g'),ctr=qs.filter(q=>q.k==='c');
  let h=`<div class="card info"><b>Alcance de esta sesión:</b> la Declaración de Aplicabilidad marca «Aplica» en los <b>${ctr.length}</b> controles, por lo tanto los ${ctr.length} deben auditarse. <b>Paso 1:</b> valide el SoA como documento. <b>Paso 2:</b> recorra los controles, empezando por los pendientes.</div>`;
  h+=`<div class="seccion-t"><h2>Verificaciones del documento</h2></div>`+ver.map(q=>cardQ(q)).join('');
  const pe=ctr.filter(q=>R(q.id).s==='pendiente').length;
  h+=`<div class="seccion-t"><h2>Controles del Anexo A (${ctr.length})</h2><span class="sp"></span><span class="small mut">${pe} pendientes</span></div>`;
  const op=[['pend','Pendientes'],['5','A.5 Organizacionales'],['6','A.6 Personas'],['7','A.7 Físicos'],['8','A.8 Tecnológicos'],['sin','Sin revisión esta semana'],['todos','Todos']];
  h+=`<div class="filtros">${op.map(x=>`<button class="${filtroSoA===x[0]?'on':''}" data-a="fs" data-f="${x[0]}">${x[1]}</button>`).join('')}</div>`;
  const filt=q=>{const f=filtroSoA;if(f==='todos')return true;if(f==='pend')return R(q.id).s==='pendiente';if(f==='sin')return R(q.id).s==='pendiente'&&evidenciaPrevia(q).length===0;return q.ctrl[0].split('.')[1]===f;};
  return h+(ctr.filter(filt).map(q=>cardQ(q)).join('')||vacio('check','Nada en este filtro','Pruebe con «Todos».'));
}
function sHallazgosDia(s){
  const hs=S.hall.filter(x=>SES[x.ses]&&SES[x.ses].dia===s.dia);
  return `<div class="card"><h2>Hallazgos del día (${hs.length})</h2>${hs.length?hs.map(x=>`<p style="margin:6px 0"><a href="#/hallazgo/${x.id}">${x.id}</a> ${badgeH(x.tipo)} <span class="small">${esc(cap(resumenH(x)).slice(0,120))}</span> ${x.validado?'<span class="badge t-ok">validado</span>':'<span class="badge t-seg">sin validar</span>'}</p>`).join(''):'<p class="small mut">Aún no hay hallazgos registrados hoy.</p>'}<div class="fila"><button class="s" data-a="nuevoh">${I('mas')}Nuevo hallazgo</button><a class="btn s" href="#/formatos">Generar formatos del día</a></div></div>`;
}
function sPendientes(){
  let h=`<div class="card info">Aquí se juntan las preguntas que quedaron <b>pendientes</b> o en <b>seguimiento</b> en todas sus sesiones. Complete cada una con evidencia.</div>`,n=0;
  SESIONES.filter(esFormato).forEach(ses=>{if(ses.guia==='soa')return;const qs=QS[ses.id].filter(q=>q.k==='g'&&['pendiente','seguimiento'].includes(R(q.id).s));if(!qs.length)return;h+=`<div class="seccion-t"><h3>${esc(ses.nombre)}</h3><span class="chip">${qs.length}</span></div>`+qs.map(q=>{n++;return cardQ(q,{mostrarSes:true});}).join('');});
  const sp=QS.soa.filter(q=>q.k==='c'&&R(q.id).s==='pendiente').length;
  if(!n)h+=vacio('check','Sin preguntas pendientes','Todas sus sesiones están al día.');
  if(sp)h+=`<div class="card aviso">Además hay <b>${sp} controles del Anexo A</b> sin revisar. <a href="#/sesion/soa">Ir a la sesión de SoA</a></div>`;
  return h;
}
function sInforme(){
  const c=resumenHall();
  return `<div class="card info">Borrador automático con sus hallazgos. Ajuste el texto y cópielo a Word.</div><div class="kpis" style="margin-bottom:12px"><div class="kpi"><b>${c.ncmayor}</b><span>NC mayores</span></div><div class="kpi"><b>${c.ncmenor}</b><span>NC menores</span></div><div class="kpi"><b>${c.obs}</b><span>Observaciones</span></div><div class="kpi"><b>${c.om}</b><span>Mejoras</span></div></div>
  <div class="card"><label for="concl" style="margin-top:0">Conclusión del equipo (la redacta usted)</label><textarea id="concl" data-f="concl" placeholder="Grado de cumplimiento de los criterios y eficacia del SGSI, con base en la evidencia">${esc(S.informe.conclusion)}</textarea></div>
  <div class="fila noprint" style="margin-bottom:12px"><button class="primario" data-a="copiarinf">${I('copiar')}Copiar al portapapeles</button><button data-a="docinf">${I('bajar')}Descargar para Word</button><a class="btn" href="#/formatos">Formatos oficiales</a></div><div class="preview" id="inf-prev">${esc(informeTexto())}</div>`;
}
function sCerrar(s,g){
  const c=contar(s),pend=QS[s.id].filter(q=>q.k!=='t'&&R(q.id).s==='pendiente'),hs=S.hall.filter(x=>x.ses===s.id);
  let h=`<div class="card"><h2>Resumen de la sesión</h2><div class="fila">${Object.keys(TIPOS).filter(k=>k!=='pendiente'&&c[k]).map(k=>`<span class="badge ${TIPOS[k].c}">${TIPOS[k].n}: ${c[k]}</span>`).join('')}${pend.length?`<span class="badge t-pend">Pendientes: ${pend.length}</span>`:''}</div></div>`;
  h+=`<div class="card"><div class="fila"><h2 style="margin:0">Hallazgos (${hs.length})</h2><span class="sp"></span><button class="s" data-a="nuevoh" data-ses="${esc(s.id)}">${I('mas')}Nuevo</button></div>${hs.length?hs.map(x=>`<p style="margin:8px 0 0"><a href="#/hallazgo/${x.id}">${x.id}</a> ${badgeH(x.tipo)} <span class="small">${esc(cap(resumenH(x)).slice(0,140))}</span> ${x.validado?'<span class="badge t-ok">validado</span>':'<span class="badge t-seg">sin validar</span>'}</p>`).join(''):'<p class="small mut" style="margin:8px 0 0">Sin hallazgos registrados.</p>'}</div>`;
  if(esFormato(s)){h+=cardDocsSesion(s,'Documentos revisados');h+=cardFormatos(s);}
  h+=`<div class="card suave"><h3>Antes de salir de la sala</h3><ul class="small" style="padding-left:18px;margin:6px 0 0"><li>Lea en voz alta los hechos que registró y pregunte «¿Está de acuerdo con los hechos?» (retroalimentación diaria).</li><li>Anote qué evidencias quedaron por entregar, quién y para cuándo.</li><li>Pida la firma del auditado en la retroalimentación.</li></ul></div>`;
  if(pend.length)h+=`<div class="card aviso"><b>${pend.length} preguntas sin responder.</b> Si no hubo tiempo, márquelas «Seguimiento» para que aparezcan en «Cierre de procesos pendientes».</div>`;
  return h+`<div class="fila noprint"><button class="${S.est[s.id]?'':'primario g'}" data-a="hecha" data-id="${esc(s.id)}">${I('check')}${S.est[s.id]?'Reabrir sesión':'Marcar sesión como completada'}</button></div>`;
}
function cardFormatos(s){
  const d=SD(s),F=(k,lab,tipo)=>`<label for="sd-${k}">${lab}</label><input type="${tipo||'text'}" id="sd-${k}" data-sd="${k}" value="${esc(d[k])}">`;
  return `<div class="card" id="fmt-${esc(s.id)}"><h2>Datos para los formatos oficiales</h2><p class="small mut">Se completan solos con lo que registró. Ajuste solo lo que haga falta.</p>
  <div class="grid c2"><div>${F('fecha','Fecha de la sesión','date')}</div><div>${F('area','Área auditada')}</div><div>${F('hIni','Hora de inicio','time')}</div><div>${F('hFin','Hora de conclusión','time')}</div></div>
  ${F('auditado','Auditado / responsable (aparece en la retroalimentación)')}${F('firmante','Nombre del auditado que firma (opcional)')}
  <label for="sd-personal">Personal auditado (una persona o cargo por línea)</label><textarea id="sd-personal" data-sd="personal" style="min-height:70px">${esc(d.personal)}</textarea>
  <label>Documentación interna revisada (Nº y nombre)</label><p class="small mut" style="margin:0 0 6px">Los documentos adjuntados a esta sesión se agregan solos al formulario.</p>
  ${d.docs.map((x,i)=>`<div class="fila" style="margin-bottom:6px;flex-wrap:nowrap"><input type="text" style="flex:1;margin:0" placeholder="Nº" data-sdd="${i}" data-k="n" value="${esc(x.n)}" aria-label="Número de documento"><input type="text" style="flex:3;margin:0" placeholder="Nombre del documento" data-sdd="${i}" data-k="t" value="${esc(x.t)}" aria-label="Nombre del documento"><button class="ib" data-a="deldoc" data-id="${esc(s.id)}" data-i="${i}" aria-label="Quitar documento">${I('x')}</button></div>`).join('')}
  <button class="s" data-a="adddoc" data-id="${esc(s.id)}">${I('mas')}Agregar documento a mano</button>
  <label for="sd-com">Comentarios / aclaraciones del auditado</label><textarea id="sd-com" data-sd="com" placeholder="Lo que el auditado aclaró o aportó al recibir la retroalimentación">${esc(d.com)}</textarea>
  <label for="sd-aspectos">Aspectos adicionales para la retroalimentación (uno por línea: «aspecto | evidencia»)</label><textarea id="sd-aspectos" data-sd="aspectos" style="min-height:60px">${esc(d.aspectos)}</textarea>
  <div class="fila noprint" style="margin-top:14px"><button class="primario" data-a="genx" data-id="${esc(s.id)}">${I('bajar')}Formulario de hallazgos (.xlsx)</button><button class="primario" data-a="genw" data-id="${esc(s.id)}">${I('bajar')}Retroalimentación diaria (.docx)</button><button data-a="genz" data-id="${esc(s.id)}">Ambos (.zip)</button></div></div>`;
}
