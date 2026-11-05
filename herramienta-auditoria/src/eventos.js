/* ===== EVENTOS ===== */
let _destino={},_tourEvitar=false;
function abrirSelectorArchivos(dest){_destino=dest||{};const i=$('#subir');if(i){i.value='';i.click();}}
const irA=(id,tab)=>{const dest='#/sesion/'+id;if(location.hash===dest){tabSes=tab||'preparar';render();}else{tabNext=tab||'preparar';location.hash=dest;}};

document.addEventListener('click',e=>{
  const el=e.target.closest('[data-a]');if(!el)return;
  const a=el.dataset.a;
  if(el.tagName==='INPUT'&&el.type==='file')return;
  if(a==='cerrar'){if(el.classList.contains('modal')&&e.target!==el)return;cerrarModal();return;}
  if(a==='ref'){e.preventDefault();modalRef(el.dataset.id);return;}
  if(a==='st'){const id=el.dataset.id,act=R(id).s;setR(id,{s:act===el.dataset.s?'pendiente':el.dataset.s});refreshQ(id);return;}
  if(a==='copiarevid'){const s=SES[el.dataset.id];let t='SOLICITUD DE EVIDENCIAS · '+s.nombre+' · '+DIA_NOMBRE[s.dia]+'\n';QS[s.id].filter(q=>q.evid&&q.evid.length).forEach((q,n)=>{t+='\n'+(n+1)+'. '+q.q+'\n'+q.evid.map(e=>'   ☐ '+e).join('\n')+'\n';});(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>toast('Solicitud copiada')).catch(()=>toast('No se pudo copiar'));return;}
  if(a==='mt'){const id=el.dataset.id,m=(R(id).m||[]).slice(),i=m.indexOf(el.dataset.m);if(i>=0)m.splice(i,1);else m.push(el.dataset.m);setR(id,{m});refreshQ(id);return;}
  if(a==='lv'){const i=el.dataset.i,act=(S.lv[i]||{}).s;S.lv[i]=Object.assign({},S.lv[i],{s:act===el.dataset.s?'':el.dataset.s});save();const c=el.closest('article.q');if(c)refreshQ(c.dataset.id);else render();return;}
  if(a==='lvh'){const i=+el.dataset.i,sid=sesionSugerida(LISTA[i][1]),x=nuevoH({ses:sid});x.ref=LISTA[i][1];x.tipo='obs';x.sit='';save();location.hash='#/hallazgo/'+x.id;return;}
  if(a==='flv'){filtroLV=el.dataset.f;render();return;}
  if(a==='tab'){tabSes=el.dataset.t;render();window.scrollTo(0,0);return;}
  if(a==='ir'){e.preventDefault();irA(el.dataset.id,el.dataset.tab);return;}
  if(a==='irc'){e.preventDefault();irA(el.dataset.id,'cerrar');return;}
  if(a==='fq'){filtroQ=el.dataset.f;render();return;}
  if(a==='fs'){filtroSoA=el.dataset.f;render();return;}
  if(a==='fh'){filtroH=el.dataset.f;render();return;}
  if(a==='fc'){filtroCob=el.dataset.f;render();return;}
  if(a==='fd'){filtroD=el.dataset.f;render();return;}
  if(a==='tb'){tabBib=el.dataset.t;busqueda='';render();return;}
  if(a==='tabdoc'){tabDoc=el.dataset.t;render();return;}
  if(a==='modo'){S.aj.modo=el.dataset.m;save();render();return;}
  if(a==='focoprev'||a==='focosig'){const s=SES[ruta().a],l=qsFoco(s);S.aj.foco=S.aj.foco||{};let i=S.aj.foco[s.id]||0;i=a==='focosig'?Math.min(l.length-1,i+1):Math.max(0,i-1);S.aj.foco[s.id]=i;save();render();window.scrollTo(0,0);return;}
  if(a==='todos'){S.aj.todos=!S.aj.todos;save();render();return;}
  if(a==='hecha'){const id=el.dataset.id;S.est[id]=!S.est[id];save();render();if(S.est[id])toast('Sesión marcada como completada');return;}
  if(a==='mkhall'){const x=nuevoH({qid:el.dataset.id});location.hash='#/hallazgo/'+x.id;return;}
  if(a==='nuevoh'){cerrarModal();const x=nuevoH({ses:el.dataset.ses||''});location.hash='#/hallazgo/'+x.id;return;}
  if(a==='delh'){const id=el.dataset.id,i=S.hall.findIndex(z=>z.id===id);if(i<0)return;const copia=S.hall[i];S.hall.splice(i,1);save();location.hash='#/hallazgos';toast('Hallazgo '+id+' eliminado',{t:'Deshacer',f:()=>{S.hall.splice(Math.min(i,S.hall.length),0,copia);save();render();}});return;}
  if(a==='adddoc'){const d=SD(SES[el.dataset.id]).docs.slice();d.push({n:'',t:''});setSD(el.dataset.id,{docs:d});render();return;}
  if(a==='deldoc'){const d=SD(SES[el.dataset.id]).docs.slice();d.splice(+el.dataset.i,1);setSD(el.dataset.id,{docs:d});render();return;}
  if(a==='genx'||a==='genw'||a==='genz'){try{const ses=SES[el.dataset.id];bajar(generar(ses,a==='genx'?'x':a==='genw'?'w':undefined),'Formatos_'+slug(ses.nombre)+'_'+DIAS[ses.dia]+'.zip');}catch(err){toast('No se pudo generar el archivo: '+err.message);}return;}
  if(a==='genday'){try{const d=+el.dataset.d;bajar(filesDia(d),'Formatos_'+DIAS[d]+'.zip');}catch(err){toast('No se pudo generar: '+err.message);}return;}
  if(a==='genall'){try{const out=[];Array.from(new Set(SESIONES.filter(esFormato).map(s=>s.dia))).forEach(d=>out.push(...filesDia(d)));bajar(out,'Formatos_Auditoria_ISO27001.zip');}catch(err){toast('No se pudo generar: '+err.message);}return;}
  if(a==='print'){window.print();return;}
  if(a==='copiarinf'){const t=informeTexto();(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>toast('Informe copiado')).catch(()=>{const p=$('#inf-prev');const r=document.createRange();r.selectNodeContents(p);const s=getSelection();s.removeAllRanges();s.addRange(r);toast('Texto seleccionado: use Copiar');});return;}
  if(a==='docinf'){descargar('Informe-Auditoria-ISO27001.doc','<html><head><meta charset="utf-8"></head><body><pre style="font-family:Calibri,Arial;font-size:11pt;white-space:pre-wrap">'+esc(informeTexto())+'</pre></body></html>','application/msword');return;}
  if(a==='backup'){S.ultimoRespaldo=new Date().toISOString();save();descargar('respaldo-auditoria-'+hoyISO()+'.json',JSON.stringify(Object.assign({app:VERSION},S),null,1),'application/json');toast('Respaldo descargado');render();return;}
  if(a==='csvr'){const rows=[['Sesión','Id','Requisito(s)','Pregunta','Resultado','Método','Notas','Evidencia vista']];SESIONES.forEach(s=>QS[s.id].forEach(q=>{const r=R(q.id);if(r.s!=='pendiente'||r.n||r.e)rows.push([s.nombre,q.id,q.ref.join(' '),q.q,TIPOS[r.s].n,(r.m||[]).map(k=>METODOS.find(m=>m[0]===k)[1]).join('; '),r.n,r.e]);}));descargar('respuestas-auditoria.csv','﻿'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n'),'text/csv;charset=utf-8');return;}
  if(a==='csvh'){const rows=[['Id','Clasificación','Sesión','Auditado','Acápite / documento','Evidencia','Texto del hallazgo','Causa','Validado']];S.hall.forEach(x=>rows.push([x.id,HTIPOS[x.tipo],SES[x.ses]?SES[x.ses].nombre:'',x.aud,acapite(x),x.evid,hallTexto(x),x.causa,x.validado?'Sí':'No']));descargar('hallazgos-auditoria.csv','﻿'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n'),'text/csv;charset=utf-8');return;}
  if(a==='csvlv'){const rows=[['Cláusula','Apartado','Cuestión a revisar','Cumplimiento','Comentarios']];LISTA.forEach((x,i)=>{const st=S.lv[i]||{};rows.push([x[0],x[2],x[3],st.s==='si'?'Sí':st.s==='no'?'No':st.s==='na'?'N/A':'',st.c||'']);});descargar('lista-verificacion-FOR-SGI-10.csv','﻿'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n'),'text/csv;charset=utf-8');return;}
  if(a==='tema'){setTema(el.dataset.t);return;}
  if(a==='tema-toggle'){setTema(temaEfectivo()==='dark'?'light':'dark');return;}
  if(a==='reset'){confirmar({titulo:'¿Borrar todo?',texto:'Se eliminarán todas las respuestas, hallazgos y documentos adjuntos de este dispositivo. Podrá deshacerlo durante unos segundos.',ok:'Borrar todo',peligro:true}).then(si=>{if(si){const copia=JSON.stringify(S);S=defaults();save();guardarYa();render();toast('Datos borrados',{t:'Deshacer',f:()=>{S=migrar(JSON.parse(copia));save();render();},fin:()=>{if(!Object.keys(S.docs).length)DOCDB.clear();}});}});return;}
  /* documentos */
  if(a==='subir'){cerrarModal();abrirSelectorArchivos({abrir:ruta().v==='documentos'});return;}
  if(a==='subirq'){abrirSelectorArchivos({qid:el.dataset.id});return;}
  if(a==='subirs'){abrirSelectorArchivos({ses:el.dataset.id});return;}
  if(a==='elegirdoc'){const qid=el.dataset.id;hoja(`<div class="fila"><h2 style="margin:0;flex:1">Documentos adjuntados</h2><button class="ib" data-a="cerrar" aria-label="Cerrar">${I('x')}</button></div><div style="margin-top:12px">${docsLista().map(d=>`<button class="g" data-a="vincdoc" data-d="${d.id}" data-q="${esc(qid)}" style="width:100%;justify-content:flex-start;margin-bottom:6px;height:auto;padding:10px 12px;text-align:left"><span class="punto ${nivelPunto(d)}"></span><span style="min-width:0"><b>${esc(d.nombre)}</b><br><span class="small mut" style="font-weight:400">${esc(resumenCorto(d))}</span></span></button>`).join('')}</div>`);return;}
  if(a==='vincdoc'){vincularDoc(el.dataset.d,el.dataset.q);cerrarModal();refreshQ(el.dataset.q);return;}
  if(a==='desvinc'){const q=el.dataset.id;desvincularDoc(el.dataset.d,q);if(ruta().v==='documento')render();else refreshQ(q);return;}
  if(a==='vincularq'){selectorPregunta(el.dataset.d);llenarPreguntas();return;}
  if(a==='vconf'){const q=$('#vq').value;if(q){vincularDoc(el.dataset.d,q);cerrarModal();render();}return;}
  if(a==='reanalizar'){reanalizarDoc(el.dataset.d,S.docs[el.dataset.d].tipo);return;}
  if(a==='original'){abrirOriginal(el.dataset.d);return;}
  if(a==='deldocu'){confirmar({titulo:'¿Eliminar este documento?',texto:'Se quita el archivo y su análisis de este dispositivo. Podrá deshacerlo unos segundos.',ok:'Eliminar',peligro:true}).then(si=>{if(si)borrarDoc(el.dataset.d);});return;}
  if(a==='copiarsha'){const d=S.docs[el.dataset.d];if(d&&navigator.clipboard)navigator.clipboard.writeText(d.sha).then(()=>toast('Huella SHA-256 copiada')).catch(()=>toast(d.sha));else if(d)toast(d.sha);return;}
  if(a==='copiarpreg'||a==='copiarinfdoc'){const d=S.docs[el.dataset.d],t=a==='copiarpreg'?d.analisis.preguntas.map((q,i)=>(i+1)+'. '+q).join('\n'):d.analisis.paraInforme;(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>toast('Copiado')).catch(()=>toast('Seleccione y copie el texto manualmente'));return;}
  if(a==='mkborr'){const x=hallazgoDeBorrador(el.dataset.d,el.dataset.b);if(x)location.hash='#/hallazgo/'+x.id;return;}
  /* shell */
  if(a==='rapido'){accionesRapidas();return;}
  if(a==='ayuda'){location.hash='#/ayuda';return;}
  if(a==='irlista'){cerrarModal();location.hash='#/lista';return;}
  if(a==='irformatos'){cerrarModal();location.hash='#/formatos';return;}
  if(a==='tour'){mostrarTour(0);return;}
  if(a==='toursig'){mostrarTour(+el.dataset.i);return;}
  if(a==='tourfin'){cerrarModal();try{localStorage.setItem(KEY+'-tour','1');}catch(x){}return;}
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){cerrarModal();return;}
  if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('[data-drop]')){e.preventDefault();abrirSelectorArchivos({abrir:true});return;}
  const r=ruta(),en=e.target.matches&&e.target.matches('input,textarea,select,button');
  if(r.v==='sesion'&&S.aj.modo==='foco'&&tabSes==='preguntar'&&!en&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!$('.modal')){
    const s=SES[r.a];if(!s||!GUIAS[s.guia]||esCheck(s))return;
    if(e.key==='ArrowRight'){const b=$('[data-a="focosig"]');if(b&&!b.disabled)b.click();}
    else if(e.key==='ArrowLeft'){const b=$('[data-a="focoprev"]');if(b&&!b.disabled)b.click();}
    else if(/^[1-7]$/.test(e.key)){const l=qsFoco(s),i=S.aj.foco&&S.aj.foco[s.id]||0,q=l[i];if(q){const st=BTN_ORDEN[+e.key-1],act=R(q.id).s;setR(q.id,{s:act===st?'pendiente':st});refreshQ(q.id);}}
  }
});
document.addEventListener('change',e=>{
  const t=e.target;
  if(t.id==='subir'){const d=_destino;_destino={};if(t.files&&t.files.length)subirArchivos(t.files,d);return;}
  if(t.dataset.a==='vsel'){llenarPreguntas();return;}
  if(t.dataset.a==='gprep'){S.gprep[t.dataset.i]=t.checked;save();render();return;}
  if(t.dataset.a==='evx'){const el=t,id=t.dataset.id,i=+t.dataset.i,x=(R(id).x||[]).slice(),k=x.indexOf(i);if(el.checked&&k<0)x.push(i);else if(!el.checked&&k>=0)x.splice(k,1);setR(id,{x});const sm=el.closest('details').querySelector('summary .n');if(sm)sm.textContent=x.length+'/'+QBYID[id].evid.length+' recibidas';return;}
  if(t.dataset.a==='prep'){S.prep[t.dataset.k]=t.checked;save();return;}
  if(t.dataset.a==='tipodoc'){reanalizarDoc(t.dataset.d,t.value===S.docs[t.dataset.d].analisis.tipoAuto?'':t.value);return;}
  if(t.dataset.a==='sesdoc'){S.docs[t.dataset.d].ses=t.value;save();toast('Sesión actualizada');return;}
  if(t.dataset.a==='restore'){const f=t.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{try{const o=JSON.parse(rd.result);if(!o||typeof o!=='object'||!o.resp)throw 0;const previo=JSON.stringify(S);S=migrar(o);save();guardarYa();render();toast('Respaldo restaurado'+(Object.keys(S.docs).length?' (los archivos originales no van en el respaldo)':''),{t:'Deshacer',f:()=>{S=migrar(JSON.parse(previo));save();render();}});}catch(x){toast('El archivo no es un respaldo válido.');}};rd.readAsText(f);return;}
  if(t.dataset.hg!=null){const x=S.hall.find(z=>z.id===ruta().a);if(!x)return;x.grav=x.grav||[];x.grav[+t.dataset.hg]=t.checked;save();refreshH(x.id);return;}
  if(t.dataset.hf){const x=S.hall.find(z=>z.id===ruta().a);if(!x)return;const k=t.dataset.hf;x[k]=t.type==='checkbox'?t.checked:t.value;save();if(k==='tipo')render();else refreshH(x.id);}
});
document.addEventListener('input',e=>{
  const t=e.target;
  if(t.dataset.f==='n'||t.dataset.f==='e'){setR(t.dataset.id,{[t.dataset.f]:t.value});return;}
  if(t.dataset.f==='concl'){S.informe.conclusion=t.value;save();const p=$('#inf-prev');if(p)p.textContent=informeTexto();return;}
  if(t.dataset.lvc!=null){const i=t.dataset.lvc;S.lv[i]=Object.assign({},S.lv[i],{c:t.value});save();return;}
  if(t.dataset.sd){const c=t.closest('[id^=fmt-]');setSD(c.id.slice(4),{[t.dataset.sd]:t.value});return;}
  if(t.dataset.sdd!=null){const c=t.closest('[id^=fmt-]'),id=c.id.slice(4),d=SD(SES[id]).docs.map(x=>Object.assign({},x));d[+t.dataset.sdd][t.dataset.k]=t.value;setSD(id,{docs:d});return;}
  if(t.dataset.doc){if(S.docs[t.dataset.doc]){S.docs[t.dataset.doc].notas=t.value;save();}return;}
  if(t.dataset.hf&&t.type!=='checkbox'&&t.tagName!=='SELECT'){const x=S.hall.find(z=>z.id===ruta().a);if(!x)return;x[t.dataset.hf]=t.value;save();refreshH(x.id);return;}
  if(t.id==='busca-doc'){busquedaDoc=t.value;clearTimeout(window._bd);window._bd=setTimeout(()=>cargarVisor(ruta().a),250);return;}
  if(t.id==='busca'){busqueda=t.value;const pos=t.selectionStart;render();const n=$('#busca');if(n){n.focus();n.setSelectionRange(pos,pos);}}
});
/* arrastrar y soltar archivos en cualquier pantalla */
['dragover','dragenter'].forEach(ev=>window.addEventListener(ev,e=>{if(e.dataTransfer&&Array.from(e.dataTransfer.types||[]).includes('Files')){e.preventDefault();const z=$('[data-drop]');if(z)z.classList.add('sobre');}}));
window.addEventListener('dragleave',e=>{if(!e.relatedTarget){const z=$('[data-drop]');if(z)z.classList.remove('sobre');}});
window.addEventListener('drop',e=>{if(e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files.length){e.preventDefault();const z=$('[data-drop]');if(z)z.classList.remove('sobre');subirArchivos(e.dataTransfer.files,{abrir:ruta().v==='documentos'});}});
