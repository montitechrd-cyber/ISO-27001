/* ===== VISTAS (2): documentos, hallazgos, formatos, lista, cobertura y más ===== */
let tabDoc='conclusiones',busquedaDoc='';
const nomLargo=n=>esc(n).replace(/_/g,'_&#8203;').replace(/\./g,'.&#8203;');
const NIVEL_TXT={ok:'Sin brechas evidentes',warn:'Puntos a verificar',bad:'Brechas a verificar',neutro:'Sin análisis'};
const NIVEL_ICO={ok:'check',warn:'alerta',bad:'nc',neutro:'info'};
const sello=n=>`<span class="badge ${n==='ok'?'t-ok':n==='bad'?'t-ncM':n==='warn'?'t-ncm':'t-na'}">${NIVEL_TXT[n]||''}</span>`;

/* ---------- DOCUMENTOS ---------- */
function vDocumentos(){
  const ds=docsLista();
  const f={todos:()=>true,atencion:d=>d.estado==='listo'&&d.analisis&&d.analisis.nivel!=='ok',ok:d=>d.estado==='listo'&&d.analisis&&d.analisis.nivel==='ok',sin:d=>d.estado==='sinTexto'||d.estado==='error'}[filtroD];
  const lista=ds.filter(f||(()=>true));
  let h=`<div class="wrap"><div class="pagina-t"><h1>Documentos</h1><p class="sub">Adjunte lo que le entreguen los auditados. Se leen y analizan en este dispositivo: nada se envía a internet.</p></div>`;
  h+=`<div class="soltar" data-a="subir" data-drop="1" tabindex="0" role="button" aria-label="Adjuntar documentos">${I('subir')}<b>Arrastre archivos aquí o toque para elegir</b><span>PDF, Word (.docx), Excel (.xlsx), CSV, TXT o imágenes · hasta 40 MB</span></div>`;
  if(!ds.length){
    h+=`<div class="card" style="margin-top:14px"><h2>Qué hace el análisis</h2><div class="pasoayuda"><span class="num">1</span><div><b>Lee el documento</b><p class="small mut" style="margin:0">Extrae su texto, tablas y datos de control (código, versión, fechas, aprobación).</p></div></div><div class="pasoayuda"><span class="num">2</span><div><b>Lo compara con lo que la norma espera</b><p class="small mut" style="margin:0">Según el tipo (política, procedimiento, matriz de riesgos, acta…) busca los elementos que ISO 27001 exige y cita el fragmento donde los encontró.</p></div></div><div class="pasoayuda"><span class="num">3</span><div><b>Le propone conclusiones y preguntas</b><p class="small mut" style="margin:0">Y, si usted quiere, borradores de hallazgo con la redacción de la empresa. Nunca crea nada sin que usted lo pida.</p></div></div><p class="small mut" style="margin:10px 0 0">El análisis busca términos, no interpreta el sentido. Una ausencia detectada es un punto a verificar con el auditado, no una no conformidad.</p></div>`;
    return h+'</div>';
  }
  const n={atencion:ds.filter(x=>x.estado==='listo'&&x.analisis&&x.analisis.nivel!=='ok').length,ok:ds.filter(x=>x.estado==='listo'&&x.analisis&&x.analisis.nivel==='ok').length,sin:ds.filter(x=>x.estado==='sinTexto'||x.estado==='error').length};
  h+=`<div class="filtros" style="margin-top:16px">${[['todos','Todos ('+ds.length+')'],['atencion','Con puntos a verificar ('+n.atencion+')'],['ok','Sin brechas evidentes ('+n.ok+')'],['sin','Sin texto o con error ('+n.sin+')']].map(x=>`<button class="${filtroD===x[0]?'on':''}" data-a="fd" data-f="${x[0]}">${x[1]}</button>`).join('')}</div>`;
  if(!lista.length)h+=vacio('docbusca','Ningún documento en este filtro','Pruebe con «Todos».');
  lista.forEach(d=>{
    const T=d.analisis&&TIPOS_DOC[d.analisis.tipo];
    h+=`<a class="item" href="#/documento/${d.id}"><span class="ico">${I(iconoDoc(d.ext))}</span><div style="min-width:0"><h3 style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(d.nombre)}</h3><div class="meta">${T&&d.estado==='listo'?esc(T.n)+' · ':''}${esc(tamTxt(d.tam))}${d.ses&&SES[d.ses]?' · '+esc(SES[d.ses].nombre.replace(/\s*\(.*$/,'').slice(0,28)):''}</div>${d.estado==='procesando'?`<div class="barra" style="margin-top:8px"><i data-prog="${d.id}" style="width:${d.progreso||5}%"></i></div>`:`<div style="margin-top:4px">${d.estado==='listo'?sello(d.analisis.nivel):d.estado==='error'?'<span class="badge t-ncM">Error</span>':'<span class="badge t-na">Sin texto legible</span>'}</div>`}</div>${I('der','fin')}</a>`;
  });
  return h+'</div>';
}

function vDocumento(id){
  const d=S.docs[id];
  if(!d)return `<div class="wrap">${vacio('alerta','Documento no encontrado','Pudo haberse eliminado.',`<a class="btn primario" href="#/documentos">Ver documentos</a>`)}</div>`;
  const A=d.analisis,T=A&&TIPOS_DOC[A.tipo];
  let h=`<div class="wrap"><p class="small" style="margin:0 0 10px"><a href="#/documentos" style="display:inline-flex;align-items:center;gap:4px;text-decoration:none">${I('izq')}Documentos</a></p>`;
  h+=`<div class="card"><div style="display:grid;grid-template-columns:auto 1fr;gap:14px;align-items:start"><span class="ico" style="display:grid;place-items:center;width:46px;height:46px;border-radius:12px;background:var(--accent-soft);color:var(--accent)">${I(iconoDoc(d.ext),'')}</span><div style="min-width:0"><h1 style="font-size:1.25rem;margin:0 0 6px;overflow-wrap:anywhere">${nomLargo(d.nombre)}</h1><div class="small mut">${esc(tamTxt(d.tam))}${d.paginas?' · '+(d.paginas===1?'1 página':d.paginas+' páginas'):''}${d.hojasN?' · '+(d.hojasN===1?'1 hoja':d.hojasN+' hojas'):''} · adjuntado el ${esc(fd(d.fecha))}</div>${d.sha?`<div class="small" style="margin-top:4px"><span class="mut">Huella SHA-256:</span> <span class="mono" title="${esc(d.sha)}">${esc(d.sha.slice(0,16))}…</span> <button class="ib" style="width:26px;height:26px" data-a="copiarsha" data-d="${d.id}" aria-label="Copiar huella completa">${I('copiar')}</button></div>`:''}</div></div>
  <div class="fila noprint" style="margin-top:12px"><button class="s" data-a="original" data-d="${d.id}">${I('bajar')}Descargar original</button>${A&&A.tipo?`<button class="s" data-a="reanalizar" data-d="${d.id}">${I('chispa')}Volver a analizar</button>`:''}<span class="sp"></span><button class="s peligro" data-a="deldocu" data-d="${d.id}">${I('papelera')}Eliminar</button></div></div>`;
  if(d.estado==='procesando')return h+`<div class="card"><b>Analizando…</b><div class="barra" style="margin-top:10px"><i data-prog="${d.id}" style="width:${d.progreso||5}%"></i></div></div></div>`;
  if(d.estado==='error')return h+`<div class="card mal"><h3>No se pudo leer este archivo</h3><p style="margin:0">${esc(d.error)}</p></div></div>`;
  if(d.estado==='sinTexto'||!A||A.sinTexto){
    h+=`<div class="card aviso"><h3>${I('info')} Sin texto para analizar</h3><p style="margin:0">${esc((A&&A.aviso)||'No se encontró texto legible.')}</p></div>`;
  }else{
    const n=A.nivel;
    h+=`<div class="card"><div class="veredicto ${n}"><span class="sello">${I(NIVEL_ICO[n])}</span><div><h4>Conclusión preliminar</h4><h2 style="margin:2px 0 4px;font-size:1.15rem">${esc(NIVEL_TXT[n])}</h2><p class="mut" style="margin:0 0 10px">${esc(A.resumen)}</p><label for="tipodoc" style="margin:0 0 4px">Tipo de documento${A.conf==='baja'?' (confianza baja: confírmelo)':A.conf==='media'?' (confianza media)':''}</label><select id="tipodoc" data-a="tipodoc" data-d="${d.id}" style="max-width:420px">${Object.entries(TIPOS_DOC).map(([k,t])=>`<option value="${k}" ${A.tipo===k?'selected':''}>${esc(t.n)}${k===A.tipoAuto&&k!==A.tipo?' (detectado)':''}</option>`).join('')}</select></div></div></div>`;
  }
  const tabs=[['conclusiones','Conclusiones'],...(A&&!A.sinTexto?[['elementos','Elementos'],['borradores','Borradores ('+(A.borradores||[]).length+')']]:[]),['texto','Texto'],['vinculos','Vínculos y notas']];
  if(!tabs.some(t=>t[0]===tabDoc))tabDoc='conclusiones';
  h+=`<div class="pestanas" role="tablist">${tabs.map(t=>`<button role="tab" aria-selected="${tabDoc===t[0]}" class="${tabDoc===t[0]?'on':''}" data-a="tabdoc" data-t="${t[0]}">${t[1]}</button>`).join('')}</div>`;
  if(tabDoc==='conclusiones')h+=docConclusiones(d,A);
  else if(tabDoc==='elementos')h+=docElementos(d,A);
  else if(tabDoc==='borradores')h+=docBorradores(d,A);
  else if(tabDoc==='texto'){h+=`<div class="card"><input type="search" id="busca-doc" placeholder="Buscar en el texto del documento…" value="${esc(busquedaDoc)}" aria-label="Buscar en el documento"><div class="visor" id="visor" aria-live="polite">Cargando…</div></div>`;setTimeout(()=>cargarVisor(d.id),0);}
  else h+=docVinculos(d);
  return h+'</div>';
}
function docConclusiones(d,A){
  if(!A||A.sinTexto)return `<div class="card suave"><p class="mut" style="margin:0">Puede vincular este archivo como evidencia y anotar lo que verifique en la pestaña «Vínculos y notas».</p></div>`;
  let h=`<div class="card"><h2>Qué encontró el análisis</h2>${A.conclusiones.map(c=>`<div class="concl ${c.n}">${I(NIVEL_ICO[c.n]||'info')}<div>${esc(c.t)}</div></div>`).join('')}</div>`;
  if(A.preguntas&&A.preguntas.length)h+=`<div class="card"><div class="fila"><h2 style="margin:0">Qué preguntar al auditado</h2><span class="sp"></span><button class="s" data-a="copiarpreg" data-d="${d.id}">${I('copiar')}Copiar</button></div><ol style="padding-left:20px;margin:10px 0 0">${A.preguntas.map(q=>`<li style="margin:6px 0">${esc(q)}</li>`).join('')}</ol></div>`;
  h+=`<div class="card"><div class="fila"><h2 style="margin:0">Para el informe</h2><span class="sp"></span><button class="s" data-a="copiarinfdoc" data-d="${d.id}">${I('copiar')}Copiar</button></div><p style="margin:10px 0 0;font-family:var(--f-tit)">${esc(A.paraInforme)}</p></div>`;
  h+=`<details class="card suave"><summary style="cursor:pointer;font-weight:600">Cómo se hizo este análisis y sus límites</summary><ul class="small" style="padding-left:18px"><li>Se buscaron términos en el texto del documento (con y sin tildes), según el tipo identificado.</li><li>No se interpreta el sentido: si el documento usa otras palabras, o el contenido está en imágenes, puede aparecer como «no encontrado» aunque exista.</li><li>Una ausencia es un punto a verificar con el auditado. Solo usted decide si constituye una observación o no conformidad.</li><li>Nada de este documento sale de su dispositivo.</li></ul></details>`;
  return h;
}
function docElementos(d,A){
  const ok=A.elementos.filter(e=>e.ok),no=A.elementos.filter(e=>!e.ok);
  if(!A.elementos.length)return `<div class="card suave"><p class="mut" style="margin:0">Para este tipo de documento no hay una lista de elementos esperados. Cambie el tipo arriba si corresponde.</p></div>`;
  const fila=e=>`<div class="elem ${e.ok?'si':'no'}"><span class="marca-v">${e.ok?'✓':'✗'}</span><div><b>${esc(e.t)}</b> <span class="ref" style="cursor:default">${esc(e.ref)}</span>${e.niv==='r'?'<span class="badge t-info">Exigido por la norma</span>':'<span class="badge t-na">Buena práctica</span>'}${e.ok&&e.snip?`<blockquote>${esc(e.snip)}</blockquote>`:''}${!e.ok&&e.ask?`<p class="small mut" style="margin:4px 0 0">Preguntar: ${esc(e.ask)}</p>`:''}</div></div>`;
  return `<div class="card"><h2>No encontrados (${no.length})</h2>${no.length?no.map(fila).join(''):'<p class="mut small" style="margin:0">Se identificó mención de todos los elementos esperados.</p>'}</div><div class="card"><h2>Encontrados (${ok.length})</h2>${ok.map(fila).join('')||'<p class="mut small" style="margin:0">Ninguno.</p>'}</div>`;
}
function docBorradores(d,A){
  const bs=A.borradores||[];
  let h=`<div class="card info small">Borradores <b>opcionales</b> redactados con el formato de la empresa. Ninguno se crea sin que usted lo pida, y puede editarlos o cambiar su clasificación después.</div>`;
  if(!bs.length)return h+vacio('check','No hay borradores que proponer','El análisis no detectó puntos que justifiquen un hallazgo.');
  bs.forEach(b=>{
    const x=S.hall.find(z=>z.origen===d.id+':'+b.id);
    const prev=hallTexto({tipo:b.tipo,ref:'',doc:'«'+d.nombre+'»',criterio:'',sit:b.sit||'',extra:'',concl:'',riesgo:b.riesgo||'',mejora:b.mejora||'',benef:b.benef||'',practica:b.practica||'',evid:b.evid||''});
    h+=`<div class="borrador"><div class="fila">${badgeH(b.tipo)}${b.ref?`<span class="ref" style="cursor:default">${esc(b.ref)}</span>`:''}</div><div class="preview">${esc(prev)}</div><div class="fila">${x?`<a class="btn s" href="#/hallazgo/${x.id}">${I('bandera')}Ver hallazgo ${x.id}</a>`:`<button class="s primario" data-a="mkborr" data-d="${d.id}" data-b="${b.id}">${I('bandera')}Crear hallazgo</button>`}${b.pregunta?`<span class="small mut">Pregunta sugerida: ${esc(b.pregunta)}</span>`:''}</div></div>`;
  });
  return h;
}
async function cargarVisor(id){
  const el=$('#visor');if(!el)return;const t=await textoDoc(id);
  if(t==null){el.textContent='El texto no está disponible en este dispositivo (¿restauró un respaldo?). Vuelva a adjuntar el archivo.';return;}
  const q=busquedaDoc.trim();
  if(!q){el.textContent=t.length>60000?t.slice(0,60000)+'\n\n[… texto recortado: use la búsqueda para ubicar un término]':t;return;}
  const rx=new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi');let n=0;
  const html=esc(t).replace(new RegExp(esc(q).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi'),m=>{n++;return '<mark>'+m+'</mark>';});
  el.innerHTML=(n?`<b>${n} coincidencia${n===1?'':'s'}</b>\n\n`:'<b>Sin coincidencias.</b>\n\n')+html.slice(0,120000);
  const mk=el.querySelector('mark');if(mk)mk.scrollIntoView({block:'center'});
}
function docVinculos(d){
  const sesOps=SESIONES.filter(esFormato).map(s=>`<option value="${s.id}" ${d.ses===s.id?'selected':''}>${esc(DIA_NOMBRE[s.dia]+' · '+s.nombre)}</option>`).join('');
  const qs=(d.vinc||[]).map(q=>QBYID[q]).filter(Boolean);
  return `<div class="card"><h2>Sesión</h2><label for="ses-doc" style="margin-top:0">Documento revisado en la sesión</label><select id="ses-doc" data-a="sesdoc" data-d="${d.id}"><option value="">— Sin asignar —</option>${sesOps}</select><p class="small mut">Los documentos de una sesión se agregan solos a «Documentación interna revisada» del formulario de hallazgos.</p></div>
  <div class="card"><h2>Preguntas donde sirve como evidencia</h2>${qs.length?qs.map(q=>`<div class="fila" style="padding:8px 0;border-top:1px solid var(--line);flex-wrap:nowrap"><div style="flex:1;min-width:0"><span class="chip">${esc(SES[q.ses].nombre.slice(0,36))}</span><div class="small">${esc(q.q.slice(0,150))}${q.q.length>150?'…':''}</div></div><a class="btn s" href="#/sesion/${q.ses}" data-a="ir" data-id="${q.ses}" data-tab="preguntar">Ir</a><button class="ib" data-a="desvinc" data-d="${d.id}" data-id="${esc(q.id)}" aria-label="Quitar vínculo">${I('x')}</button></div>`).join(''):'<p class="small mut">Aún no está vinculado a ninguna pregunta.</p>'}<button class="s suave" style="margin-top:10px" data-a="vincularq" data-d="${d.id}">${I('enlace')}Vincular a una pregunta</button></div>
  <div class="card"><label for="notas-doc" style="margin-top:0">Notas sobre este documento</label><textarea id="notas-doc" data-doc="${d.id}" placeholder="Qué verificó, qué dijo el auditado, qué falta…">${esc(d.notas)}</textarea></div>`;
}
function selectorPregunta(did){
  const sesOps=SESIONES.filter(esFormato).map(s=>`<option value="${s.id}">${esc(DIA_NOMBRE[s.dia]+' · '+s.nombre)}</option>`).join('');
  return hoja(`<h2>Vincular a una pregunta</h2><label for="vs">Sesión</label><select id="vs" data-a="vsel">${sesOps}</select><label for="vq">Pregunta</label><select id="vq"></select><div class="fila" style="justify-content:flex-end;margin-top:16px"><button class="fantasma" data-a="cerrar">Cancelar</button><button class="primario" data-a="vconf" data-d="${did}">Vincular</button></div>`);
}
function llenarPreguntas(){const s=$('#vs').value,q=$('#vq');q.innerHTML=QS[s].filter(x=>x.k!=='t').map(x=>`<option value="${esc(x.id)}">${esc((x.ref[0]?x.ref[0]+' · ':'')+x.q.slice(0,90))}</option>`).join('');}

/* ---------- HALLAZGOS ---------- */
function vHallazgos(){
  const c=resumenHall();
  let h=`<div class="wrap"><div class="pagina-t"><h1>Hallazgos</h1><span class="sp"></span><button class="primario" data-a="nuevoh">${I('mas')}Nuevo hallazgo</button></div>`;
  h+=`<div class="kpis" style="margin-bottom:14px"><div class="kpi"><b>${c.ncmayor}</b><span>NC mayores</span></div><div class="kpi"><b>${c.ncmenor}</b><span>NC menores</span></div><div class="kpi"><b>${c.obs}</b><span>Observaciones</span></div><div class="kpi"><b>${c.om}</b><span>Mejoras</span></div><div class="kpi"><b>${c.fortaleza}</b><span>Puntos fuertes</span></div></div>`;
  const fl=[['todos','Todos'],['ncmayor','NC mayor'],['ncmenor','NC menor'],['obs','Observación'],['om','Mejora'],['fortaleza','Punto fuerte'],['sinval','Sin validar']];
  h+=`<div class="filtros">${fl.map(x=>`<button class="${filtroH===x[0]?'on':''}" data-a="fh" data-f="${x[0]}">${x[1]}</button>`).join('')}</div>`;
  const lista=S.hall.filter(x=>filtroH==='todos'||(filtroH==='sinval'?!x.validado:x.tipo===filtroH));
  if(!lista.length)h+=vacio('bandera',S.hall.length?'Ningún hallazgo en este filtro':'Aún no hay hallazgos','Se crean desde una pregunta («Convertir en hallazgo»), desde el análisis de un documento o con el botón «Nuevo hallazgo».',`<button class="primario" data-a="nuevoh">${I('mas')}Nuevo hallazgo</button>`);
  lista.forEach(x=>{
    const q=calidadH(x).filter(t=>!/Valide los hechos/.test(t));
    h+=`<a class="item" href="#/hallazgo/${x.id}"><span class="ico" style="background:var(--${x.tipo==='ncmayor'?'bad':esNC(x.tipo)||x.tipo==='obs'?'warn':x.tipo==='fortaleza'?'ok':'info'}-soft);color:var(--${x.tipo==='ncmayor'?'bad':esNC(x.tipo)||x.tipo==='obs'?'warn':x.tipo==='fortaleza'?'ok':'info'})">${I(x.tipo==='fortaleza'?'estrella':esNC(x.tipo)?'nc':x.tipo==='om'?'mejora':'ojo')}</span><div style="min-width:0"><div class="meta"><b style="color:var(--ink)">${x.id}</b> · ${esc(x.ses&&SES[x.ses]?SES[x.ses].nombre:'Sin sesión')}${acapite(x)?' · '+esc(acapite(x)):''}</div><h3 style="font-weight:500;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">${esc(cap(resumenH(x)))}</h3><div>${badgeH(x.tipo)}${x.validado?'<span class="badge t-ok">validado</span>':'<span class="badge t-seg">sin validar</span>'}${q.length?`<span class="badge b-sug">${q.length} por completar</span>`:'<span class="badge t-ok">completo</span>'}${x.docId?'<span class="badge t-info">desde documento</span>':''}</div></div>${I('der','fin')}</a>`;
  });
  if(S.hall.length)h+=`<div class="fila noprint" style="margin-top:12px"><button data-a="csvh">${I('bajar')}Exportar (CSV)</button><a class="btn" href="#/formatos">Generar formatos oficiales</a></div>`;
  return h+'</div>';
}
function campoH(x,k,lab,phd,rows){return `<label for="hf-${k}">${lab}</label><textarea id="hf-${k}" data-hf="${k}" placeholder="${esc(phd||'')}" style="min-height:${rows||70}px">${esc(x[k]||'')}</textarea>`;}
function vHallazgo(id){
  const x=S.hall.find(z=>z.id===id);
  if(!x)return `<div class="wrap">${vacio('alerta','Hallazgo no encontrado','Pudo haberse eliminado.',`<a class="btn primario" href="#/hallazgos">Ver hallazgos</a>`)}</div>`;
  const ops=Object.keys(HTIPOS).map(k=>`<option value="${k}" ${x.tipo===k?'selected':''}>${esc(HTIPOS[k])}</option>`).join('');
  const sopts=SESIONES.filter(esFormato).map(s=>`<option value="${s.id}" ${x.ses===s.id?'selected':''}>${esc(DIA_NOMBRE[s.dia]+' – '+s.nombre)}</option>`).join('');
  const t=x.tipo,rd=REDACCION[esNC(t)?'ncmayor':t],dc=x.docId&&S.docs[x.docId];
  let h=`<div class="wrap"><p class="small" style="margin:0 0 10px"><a href="#/hallazgos" style="display:inline-flex;align-items:center;gap:4px;text-decoration:none">${I('izq')}Hallazgos</a></p><div class="pagina-t"><h1>${x.id}</h1><span id="h-badge">${badgeH(x.tipo)}</span></div><div class="dos"><div>`;
  h+=`<div class="card"><label for="hf-tipo" style="margin-top:0">Clasificación</label><select id="hf-tipo" data-hf="tipo">${ops}</select><div class="card info small" style="margin:8px 0;padding:10px 12px"><b>${esc(rd.n)}:</b> ${esc(rd.est)}<br><i>${esc(rd.resumen)}</i></div>`;
  if(dc)h+=`<p class="small">${I('clip')} Desde el documento <a href="#/documento/${dc.id}">${esc(dc.nombre)}</a></p>`;
  h+=`<label for="hf-ses">Sesión / proceso</label><select id="hf-ses" data-hf="ses"><option value="">— Elija la sesión —</option>${sopts}</select><label for="hf-aud">Auditado / responsable</label><input type="text" id="hf-aud" data-hf="aud" value="${esc(x.aud)}"><label for="hf-ref">Requisito (códigos separados por coma, ej. A.8.13, 6.1.2)</label><input type="text" id="hf-ref" data-hf="ref" value="${esc(x.ref)}" list="idlist"><datalist id="idlist">${Object.keys(REFS).map(k=>`<option value="${k}">${esc(REFS[k].t)}</option>`).join('')}</datalist><label for="hf-doc">Acápite / documento interno (si lo deja vacío se usa el requisito de la norma)</label><input type="text" id="hf-doc" data-hf="doc" value="${esc(x.doc)}" placeholder="Ej.: Procedimiento de Gestión de Proveedores, acápite 5.2"></div>`;
  h+='<div class="card">';
  if(esNC(t)){
    h+=campoH(x,'criterio','1 · Criterio: qué establece el requisito o el procedimiento («se establece que…»)','Ej.: los proveedores deben ser evaluados anualmente');
    h+=campoH(x,'sit','2 · Situación encontrada («se evidenció que…»)','Ej.: de una muestra de 10 proveedores, 3 no contaban con evidencia de evaluación',90);
    h+=campoH(x,'extra','3 · Evidencia adicional (opcional: «Además de lo anterior…»)','');
    h+=campoH(x,'concl','4 · Conclusión («no se logra asegurar que…»)','Ej.: en todos los casos se cumple con la evaluación de proveedores');
    h+=campoH(x,'evid','Evidencia / muestra revisada (columna «Evidencia» del formulario)','Documentos, registros, tamaño de la muestra, quién los mostró',70);
    h+=`<div class="card suave" style="margin-top:12px;box-shadow:none"><b>Gravedad según los criterios de la empresa</b><p class="small mut">Marque los que se cumplan. Basta uno para que sea MAYOR.</p>${DEF_NC.mayor.cuando.map((c,i)=>`<label class="casilla"><input type="checkbox" data-hg="${i}" ${(x.grav||[])[i]?'checked':''}><span>${esc(c)}</span></label>`).join('')}<div id="h-grav" class="small" style="margin-top:8px"></div></div>`;
    h+=campoH(x,'causa','Causa (si se determinó con el auditado; opcional)','',50);
  }else if(t==='obs'){h+=campoH(x,'sit','1 · Situación encontrada («se evidenció que…»)','',90)+campoH(x,'riesgo','2 · Riesgo o consecuencia potencial («podría…»)','Ej.: pérdida de trazabilidad ante la ausencia del responsable');}
  else if(t==='om'){h+=campoH(x,'sit','1 · Situación actual que cumple el requisito','',90)+campoH(x,'mejora','2 · Posibilidad de mejora («una oportunidad para…»)','')+campoH(x,'benef','3 · Beneficio esperado («con el propósito de…»)','');}
  else{h+=campoH(x,'practica','1 · Práctica destacada («como punto fuerte que…»)','',80)+campoH(x,'evid','2 · Evidencia («mediante…»)','')+campoH(x,'benef','3 · Beneficio («contribuye a…»)','');}
  h+=`<label class="casilla" style="margin-top:10px"><input type="checkbox" data-hf="validado" ${x.validado?'checked':''}><span>Los hechos fueron <b>validados con el auditado</b></span></label></div></div>`;
  h+=`<aside class="lateral"><div class="card"><h3>Calidad del hallazgo</h3><div id="h-cal"></div></div><div class="card"><h3>Texto final (así saldrá en el formulario)</h3><div class="preview" id="h-prev"></div></div><details class="card"><summary style="cursor:pointer;font-weight:600">Ejemplo de la empresa</summary><p class="small" style="margin-top:8px;font-family:var(--f-tit)">${esc(rd.ejemplo)}</p></details><div class="fila noprint"><button class="peligro" data-a="delh" data-id="${x.id}">${I('papelera')}Eliminar</button><span class="sp"></span>${x.ses?`<a class="btn" href="#/formatos">Generar formatos</a>`:''}<a class="btn primario" href="#/hallazgos">Listo</a></div></aside></div></div>`;
  setTimeout(()=>refreshH(x.id),0);return h;
}
function refreshH(id){
  const x=S.hall.find(z=>z.id===id);if(!x)return;const cal=calidadH(x);
  const c=$('#h-cal');if(c)c.innerHTML=cal.length?`<ul class="small" style="padding-left:18px;margin:6px 0 0">${cal.map(t=>`<li style="margin:4px 0">${esc(t)}</li>`).join('')}</ul>`:`<p class="small" style="margin:0"><span class="badge t-ok">Completo</span> Cumple los criterios de calidad.</p>`;
  const p=$('#h-prev');if(p)p.textContent=hallTexto(x);const b=$('#h-badge');if(b)b.innerHTML=badgeH(x.tipo);
  const g=$('#h-grav');if(g){const m=(x.grav||[]).some(Boolean);g.innerHTML=m?'<span class="badge t-ncM">Sugerencia: NC MAYOR</span> se cumple al menos un criterio de gravedad.':'<span class="badge t-ncm">Sugerencia: NC MENOR</span> ningún criterio de gravedad marcado.';}
}

/* ---------- FORMATOS ---------- */
function resumenHallS(hs){const c={ncmayor:0,ncmenor:0,obs:0,om:0,fortaleza:0};hs.forEach(x=>{if(c[x.tipo]!=null)c[x.tipo]++;});return c;}
function vFormatos(){
  const ses=SESIONES.filter(esFormato),dias=Array.from(new Set(ses.map(s=>s.dia)));
  const huer=S.hall.filter(x=>!x.ses||!SES[x.ses]||!esFormato(SES[x.ses]));
  let h=`<div class="wrap"><div class="pagina-t"><h1>Formatos oficiales</h1><p class="sub">Llena las plantillas reales de la empresa con lo que usted registra: Formulario de hallazgos (FOR-SGC-004) y Retroalimentación diaria. Se generan en su dispositivo.</p></div>`;
  h+=`<div class="card info small"><b>Flujo recomendado:</b> 1) responda las preguntas, 2) convierta lo relevante en hallazgos y valídelos con el auditado, 3) al cerrar la sesión genere la retroalimentación y pida la firma, 4) al final genere el formulario.</div>`;
  if(huer.length)h+=`<div class="card mal small"><b>${huer.length} hallazgo(s) sin sesión asignada</b> no saldrán en ningún formulario: ${huer.map(x=>`<a href="#/hallazgo/${x.id}">${x.id}</a>`).join(', ')}. Ábralos y elija la sesión.</div>`;
  h+=`<div class="fila noprint" style="margin-bottom:6px"><button class="primario g" data-a="genall">${I('bajar')}Generar TODO el período (.zip)</button></div>`;
  dias.forEach(dia=>{
    h+=`<div class="dia">${esc(DIA_NOMBRE[dia])} de noviembre<button class="s fantasma" style="margin-left:auto" data-a="genday" data-d="${dia}">${I('bajar')}El día (.zip)</button></div>`;
    ses.filter(s=>s.dia===dia).forEach(s=>{
      const hs=S.hall.filter(x=>x.ses===s.id),c=resumenHallS(hs),w=avisosFormato(s);
      h+=`<div class="card"><div class="small mut">${esc(s.hora)}</div><h3 style="margin:2px 0 6px;font-size:1rem">${esc(s.nombre)}</h3><div>${hs.length?['ncmayor','ncmenor','obs','om','fortaleza'].filter(k=>c[k]).map(k=>`<span class="badge ${HCLASE[k]}">${esc(HTIPOS[k])}: ${c[k]}</span>`).join(''):'<span class="badge t-pend">Sin hallazgos</span>'}</div>`;
      if(w.length)h+=`<details class="small" style="margin-top:6px"><summary style="cursor:pointer;color:var(--warn)">${w.length} aviso(s) antes de generar</summary><ul style="padding-left:18px;margin:6px 0 0">${w.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></details>`;
      h+=`<div class="fila noprint" style="margin-top:10px"><button class="primario s" data-a="genx" data-id="${esc(s.id)}">${I('bajar')}Formulario (.xlsx)</button><button class="primario s" data-a="genw" data-id="${esc(s.id)}">${I('bajar')}Retroalimentación (.docx)</button><a class="btn s" href="#/sesion/${esc(s.id)}" data-a="irc" data-id="${esc(s.id)}">Editar datos</a></div></div>`;
    });
  });
  return h+'</div>';
}

/* ---------- LISTA DE VERIFICACIÓN ---------- */
const LV_CAPS=[['4','4 Contexto'],['5','5 Liderazgo'],['6','6 Planificación'],['7','7 Apoyo'],['8','8 Operación'],['9','9 Evaluación'],['10','10 Mejora'],['A.5','A.5 Organizacionales'],['A.6','A.6 Personas'],['A.7','A.7 Físicos'],['A.8','A.8 Tecnológicos']];
const lvCap=r=>r.startsWith('A.')?r.split('.').slice(0,2).join('.'):r.split('.')[0];
function vLista(){
  const tot=LISTA.length,v={si:0,no:0,na:0};LISTA.forEach((x,i)=>{const s=(S.lv[i]||{}).s;if(s)v[s]++;});
  let h=`<div class="wrap"><p class="small" style="margin:0 0 10px"><a href="#/mas" style="display:inline-flex;align-items:center;gap:4px;text-decoration:none">${I('izq')}Más</a></p><div class="pagina-t"><h1>Lista de verificación FOR-SGI-10</h1><p class="sub">Lista oficial de la empresa para ISO 27001 (versión 01). Las mismas cuestiones aparecen dentro de cada pregunta: lo que marque aquí o allá es lo mismo.</p></div>`;
  h+=`<div class="kpis" style="margin-bottom:14px"><div class="kpi"><b>${v.si+v.no+v.na}/${tot}</b><span>Marcadas</span></div><div class="kpi"><b>${v.si}</b><span>Sí</span></div><div class="kpi"><b>${v.no}</b><span>No</span></div><div class="kpi"><b>${v.na}</b><span>N/A</span></div></div>`;
  h+=`<div class="filtros">${LV_CAPS.map(c=>`<button class="${filtroLV===c[0]?'on':''}" data-a="flv" data-f="${c[0]}">${c[1]}</button>`).join('')}</div>`;
  LISTA.map((x,i)=>({x,i})).filter(o=>lvCap(o.x[0])===filtroLV).forEach(o=>{const st=S.lv[o.i]||{};h+=`<div class="card"><div class="fila" style="flex-wrap:nowrap;align-items:flex-start"><span class="ref" style="cursor:default">${esc(o.x[0])}</span><b>${esc(o.x[2])}</b></div><p class="small mut" style="margin:6px 0 10px">${esc(o.x[3])}</p>${lvBtns(o.i)}<textarea data-lvc="${o.i}" placeholder="Comentarios" style="min-height:52px;margin-top:8px" aria-label="Comentarios">${esc(st.c||'')}</textarea>${st.s==='no'?`<button class="s primario" style="margin-top:6px" data-a="lvh" data-i="${o.i}">${I('bandera')}Crear hallazgo</button>`:''}</div>`;});
  const hs=S.hall.filter(x=>refsDe(x).some(r=>lvCap(r)===filtroLV));
  h+=`<div class="card suave"><h3>Hallazgos del capítulo (${hs.length})</h3>${hs.length?hs.map(x=>`<p class="small" style="margin:6px 0"><a href="#/hallazgo/${x.id}">${x.id}</a> ${badgeH(x.tipo)} ${esc(cap(resumenH(x)).slice(0,160))}</p>`).join(''):'<p class="small mut" style="margin:0">Sin hallazgos registrados para este capítulo.</p>'}</div><div class="fila noprint"><button data-a="csvlv">${I('bajar')}Exportar lista (CSV)</button></div></div>`;
  return h;
}

/* ---------- COBERTURA ---------- */
function vCobertura(){
  const cob=cobertura(),cl=CLAUSULAS.map(c=>cob[c[0]]),ct=CONTROLES.map(c=>cob[c[0]]);
  const clA=cl.filter(x=>x.asig.length).length,ctA=ct.filter(x=>x.asig.length).length,ctV=ct.filter(x=>x.verif>0).length,ctNC=ct.filter(x=>['ncmayor','ncmenor'].includes(x.peor)).length;
  let h=`<div class="wrap"><p class="small" style="margin:0 0 10px"><a href="#/mas" style="display:inline-flex;align-items:center;gap:4px;text-decoration:none">${I('izq')}Más</a></p><div class="pagina-t"><h1>Cobertura de la auditoría</h1><p class="sub">Qué requisitos están asignados a un proceso en el cronograma y cuáles ha verificado usted realmente (solo cuentan preguntas respondidas).</p></div>`;
  h+=`<div class="kpis" style="margin-bottom:12px"><div class="kpi"><b>${clA}/${cl.length}</b><span>Cláusulas con proceso</span></div><div class="kpi"><b>${ctA}/${SOA_APLICA.length}</b><span>Controles con proceso</span></div><div class="kpi"><b>${ctV}/${SOA_APLICA.length}</b><span>Controles verificados</span></div><div class="kpi"><b>${ctNC}</b><span>Controles con NC</span></div></div>`;
  h+=`<div class="card aviso small"><b>Lectura crítica:</b> el SoA marca «Aplica» en ${SOA_APLICA.length} controles, así que todos deben auditarse. ${SOA_APLICA.length-ctA} controles solo están en la sesión SoA del viernes 13. Es legítimo si el programa de auditoría lo justifica por riesgo, pero debe quedar documentado.</div>`;
  h+=`<div class="filtros">${[['todos','Todos'],['sinproc','Sin proceso asignado'],['sinver','Sin verificar'],['nc','Con NC / observación']].map(x=>`<button class="${filtroCob===x[0]?'on':''}" data-a="fc" data-f="${x[0]}">${x[1]}</button>`).join('')}</div>`;
  const ok=x=>filtroCob==='todos'||(filtroCob==='sinproc'&&!x.asig.length)||(filtroCob==='sinver'&&x.verif===0)||(filtroCob==='nc'&&['ncmayor','ncmenor','obs'].includes(x.peor));
  const fila=x=>{const r=REFS[x.id];const asig=x.asig.length?x.asig.map(i=>`<a href="#/sesion/${i}" class="chip">${esc(SES[i].nombre.replace(/^Gestión (de la |de los |de )?/,'').replace(/\s*\(.*$/,'').slice(0,34))}</a>`).join(''):(x.soloSoA?'<span class="badge b-sug">solo SoA</span>':'<span class="badge t-ncM">sin asignar</span>');return `<tr><td><button class="ref" data-a="ref" data-id="${x.id}">${x.id}</button></td><td>${esc(r.t)}</td><td>${asig}</td><td>${x.qs.length}</td><td>${x.peor==='pendiente'?'<span class="badge t-pend">Sin verificar</span>':badge(x.peor)}</td></tr>`;};
  const tabla=(t,a)=>{const f=a.filter(ok);return f.length?`<div class="seccion-t"><h2>${esc(t)}</h2></div><div class="card tbl"><table><thead><tr><th>Código</th><th>Requisito</th><th>Proceso</th><th>Preg.</th><th>Resultado</th></tr></thead><tbody>${f.map(fila).join('')}</tbody></table></div>`:'';};
  h+=tabla('Cláusulas 4 a 10',cl);[5,6,7,8].forEach(t=>{h+=tabla(TEMAS[t],ct.filter(x=>x.id.split('.')[1]==String(t)));});
  return h+'</div>';
}

/* ---------- CRONOGRAMA ---------- */
function vCronograma(){
  let h=`<div class="wrap"><p class="small" style="margin:0 0 10px"><a href="#/mas" style="display:inline-flex;align-items:center;gap:4px;text-decoration:none">${I('izq')}Más</a></p><div class="pagina-t"><h1>Revisión crítica del cronograma</h1><p class="sub">Observaciones basadas solo en lo que dice el Excel. Verifíquelas con el líder del equipo: pueden existir acuerdos que no están por escrito.</p></div>`;
  const lab={alta:'Prioridad alta',media:'Prioridad media',baja:'Prioridad baja'};
  ['alta','media','baja'].forEach(sev=>REVISION.filter(r=>r.sev===sev).forEach(r=>{h+=`<div class="card ${sev==='alta'?'mal':sev==='media'?'aviso':''}"><span class="badge ${sev==='alta'?'t-ncM':sev==='media'?'t-ncm':'t-na'}">${lab[sev]}</span><h3 style="margin-top:6px">${esc(r.t)}</h3><p class="small">${esc(r.d)}</p><p class="small"><b>Qué hacer:</b> ${esc(r.a)}</p>${r.s.length?`<p class="small mut" style="margin:0">Afecta a: ${r.s.map(i=>`<a href="#/sesion/${i}">${esc(SES[i].nombre)}</a>`).join(' · ')}</p>`:''}</div>`;}));
  h+=`<div class="seccion-t"><h2>Cronograma completo</h2></div><div class="card tbl"><table><thead><tr><th>Día</th><th>Hora</th><th>Proceso</th><th>Auditados</th><th>Auditores</th><th>ISO 27001</th></tr></thead><tbody>${SESIONES.map(s=>`<tr class="${esMia(s)?'mine':''}"><td>${esc(DIA_NOMBRE[s.dia])}</td><td>${esc(s.hora)}</td><td><a href="#/sesion/${s.id}">${esc(s.nombre)}</a></td><td>${esc(s.aud.join(', '))}</td><td>${esc(s.ads.join(', '))}</td><td>${esc(s.std)}</td></tr>`).join('')}</tbody></table></div><p class="small mut">La franja azul marca las sesiones en las que usted participa.</p></div>`;
  return h;
}

/* ---------- BIBLIOTECA ---------- */
function vBiblioteca(){
  const tabs=[['clausulas','Cláusulas'],['anexo','Anexo A'],['glosario','Glosario'],['metodo','Método'],['tecnicas','Técnicas'],['clasif','Clasificación'],['redac','Redacción']];
  let h=`<div class="wrap"><p class="small" style="margin:0 0 10px"><a href="#/mas" style="display:inline-flex;align-items:center;gap:4px;text-decoration:none">${I('izq')}Más</a></p><div class="pagina-t"><h1>Biblioteca</h1></div><div class="pestanas">${tabs.map(t=>`<button class="${tabBib===t[0]?'on':''}" data-a="tb" data-t="${t[0]}">${t[1]}</button>`).join('')}</div>`;
  const q=busqueda.toLowerCase(),filt=a=>a.filter(r=>!q||r.join(' ').toLowerCase().includes(q)),buscador=`<input type="search" id="busca" placeholder="Buscar…" value="${esc(busqueda)}" aria-label="Buscar">`;
  const ficha=c=>`<div class="card"><b><span class="ref" style="cursor:default">${c[0]}</span> ${esc(c[1])}</b><p class="small" style="margin:6px 0">${esc(c[2])}</p><p class="small mut" style="margin:0"><b>Evidencia típica:</b> ${esc(c[3])}</p></div>`;
  if(tabBib==='clausulas')h+=buscador+filt(CLAUSULAS).map(ficha).join('');
  else if(tabBib==='anexo'){h+=buscador;[5,6,7,8].forEach(t=>{const l=filt(CONTROLES.filter(c=>c[0].split('.')[1]==String(t)));if(l.length)h+=`<div class="seccion-t"><h2>${TEMAS[t]}</h2></div>`+l.map(ficha).join('');});}
  else if(tabBib==='glosario')h+=buscador+filt(GLOSARIO).map(g=>`<div class="card"><b>${esc(g[0])}</b><p class="small" style="margin:4px 0">${esc(g[1])}</p>${g[2]?`<p class="small mut" style="margin:0"><b>Al auditar:</b> ${esc(g[2])}</p>`:''}</div>`).join('');
  else if(tabBib==='metodo')h+=metodoHTML();
  else if(tabBib==='tecnicas')h+=`<p class="mut small">Pensadas para quien audita procesos técnicos sin ser técnico: se audita la evidencia, no la tecnología.</p>`+TECNICAS.map((t,i)=>`<div class="card"><b>${i+1}. ${esc(t[0])}</b><p class="small" style="margin:4px 0 0">${esc(t[1])}</p></div>`).join('');
  else if(tabBib==='clasif')h+=clasifHTML();else h+=redacHTML();
  return h+'</div>';
}
function metodoHTML(){
  const li=a=>`<ul class="small" style="padding-left:18px;margin:6px 0 0">${a.map(x=>`<li style="margin:5px 0">${x}</li>`).join('')}</ul>`;
  return `<p class="mut small">Resume el método de la empresa (FOR-SGC-004 y FOR-SGI-10) y cómo lo aplica esta herramienta.</p><div class="card"><h3>Los 4 métodos de auditoría del formulario</h3>${li(['<b>Revisión documental:</b> políticas, procedimientos, registros. Adjunte los documentos y use el análisis para preparar preguntas.','<b>Entrevistas:</b> use las preguntas de la guía y las transversales con varias personas del proceso.','<b>Observación:</b> recorridos, pantallas, puestos de trabajo, consolas en vivo.','<b>Muestreo:</b> elija usted la muestra y anote su tamaño (ej.: «3 de 10 proveedores»).'])}<p class="small">En cada pregunta marque los métodos usados: el formulario se llena solo con esas marcas.</p></div><div class="card"><h3>Secuencia de cada sesión</h3>${li(['<b>1 · Preparar:</b> pida los documentos antes, adjúntelos y lea su análisis.','<b>2 · Preguntar:</b> guía + lista de verificación + notas con evidencia y método.','<b>Retroalimentación:</b> al terminar la jornada lea los aspectos al auditado, anote sus aclaraciones y pida firma.','<b>3 · Cerrar:</b> convierta lo relevante en hallazgos, valídelos y genere los formatos.','<b>Reunión de equipo (17:00):</b> calibre la clasificación con el equipo.'])}</div><div class="card"><h3>Regla general de clasificación</h3>${li(['<b>No conformidad:</b> existe incumplimiento demostrado.','<b>Observación:</b> situación que podría generar un problema, pero no se ha demostrado incumplimiento.','<b>Oportunidad de mejora:</b> cumple, pero puede hacerse mejor.','<b>Punto fuerte:</b> práctica que destaca positivamente y aporta valor.'])}</div><div class="card"><h3>Evidencia suficiente</h3>${li(['Documento o registro con fecha, versión o número identificable.','Tamaño de la muestra y criterio con que se eligió.','Quién la mostró y cuándo.','Si no se pudo verificar, no es hallazgo: márquelo «Seguimiento» y pida la evidencia.'])}</div>`;
}
function clasifHTML(){
  const li=a=>`<ul class="small" style="padding-left:18px;margin:6px 0 0">${a.map(x=>`<li style="margin:4px 0">${esc(x)}</li>`).join('')}</ul>`;
  const nc=(t,d)=>`<div class="card"><h3>No conformidad ${t}</h3><p class="small">${esc(d.def)}</p><h4 style="margin-top:10px">Se considera ${t.toLowerCase()} cuando</h4>${li(d.cuando)}<h4 style="margin-top:10px">Ejemplos</h4>${li(d.ejemplos)}<h4 style="margin-top:10px">Impacto</h4>${li(d.impacto)}</div>`;
  return `<p class="mut small">Definiciones oficiales de la empresa (FOR-SGC-004, hoja «Tipo de No Conformidad»).</p>${DEF_CLASE.map(d=>`<div class="card"><b>${esc(d[0])}</b><p class="small" style="margin:4px 0 0">${esc(d[1])}</p></div>`).join('')}${nc('MAYOR',DEF_NC.mayor)}${nc('MENOR',DEF_NC.menor)}`;
}
function redacHTML(){return `<p class="mut small">Reglas de redacción de la empresa (FOR-SGC-004, hoja «Redacción»). El módulo de hallazgos arma el texto con estas plantillas.</p>`+['ncmayor','obs','om','fortaleza'].map(k=>{const r=REDACCION[k];return `<div class="card"><h3>${esc(r.n)}</h3><p class="small"><b>Estructura:</b> ${esc(r.est)}</p><p class="small"><b>Modelo:</b> ${esc(r.plantilla)}</p><details><summary class="small mut" style="cursor:pointer">Ver ejemplo</summary><p class="small" style="font-family:var(--f-tit)">${esc(r.ejemplo)}</p></details><p class="small mut" style="margin:0"><i>${esc(r.resumen)}</i></p></div>`;}).join('');}

/* ---------- MÁS, DATOS, AYUDA ---------- */
function vMas(){
  const it=(href,ic,t,d)=>`<a class="item" href="${href}"><span class="ico">${I(ic)}</span><div><h3>${t}</h3><div class="meta">${d}</div></div>${I('der','fin')}</a>`;
  return `<div class="wrap"><div class="pagina-t"><h1>Más</h1></div>${it('#/lista','lista','Lista de verificación FOR-SGI-10','Las 128 cuestiones oficiales (Sí / No / N/A)')}${it('#/cobertura','barras','Cobertura','Qué requisitos ha verificado y cuáles faltan')}${it('#/cronograma','cal','Revisión del cronograma','Puntos que conviene aclarar con el líder del equipo')}${it('#/biblioteca','libro','Biblioteca','Cláusulas, Anexo A, glosario, método y redacción')}${it('#/datos','escudo','Datos y respaldo','Respaldar, restaurar y exportar')}${it('#/ayuda','ayuda','Ayuda','Cómo trabajar paso a paso, atajos y límites')}<p class="small mut" style="margin-top:18px">Versión ${VERSION} · generada el ${esc(BUILD)}</p></div>`;
}
function vDatos(){
  const n=Object.values(S.resp).filter(r=>r.s!=='pendiente'||r.n||r.e).length,nd=Object.keys(S.docs).length;
  return `<div class="wrap"><p class="small" style="margin:0 0 10px"><a href="#/mas" style="display:inline-flex;align-items:center;gap:4px;text-decoration:none">${I('izq')}Más</a></p><div class="pagina-t"><h1>Datos y respaldo</h1></div>
  <div class="card"><p>Todo lo que usted escribe y adjunta se guarda <b>únicamente en este navegador y dispositivo</b>. No se envía a ningún servidor. Esto protege la confidencialidad de la auditoría, pero si se borran los datos del navegador, se pierden.</p><p class="small mut" style="margin:0">Registros: ${n} respuestas · ${S.hall.length} hallazgos · ${nd} documentos adjuntos.${storageOK?'':' <b>Este navegador no permite guardar datos.</b>'}</p></div>
  <div class="card"><h2>Respaldo</h2><div class="fila"><button class="primario" data-a="backup">${I('bajar')}Descargar respaldo (.json)</button><label class="btn" style="margin:0;font-weight:500">${I('subir')}Restaurar respaldo<input type="file" accept=".json" data-a="restore" class="hide"></label></div><p class="small mut" style="margin:10px 0 0">Último respaldo: ${S.ultimoRespaldo?esc(new Date(S.ultimoRespaldo).toLocaleString('es-DO')):'nunca'}. Hágalo al final de cada día. <b>El respaldo incluye el análisis de los documentos, pero no los archivos originales</b> (por su tamaño): conserve esos aparte.</p></div>
  <div class="card"><h2>Exportar</h2><div class="fila"><button data-a="csvr">Respuestas (CSV)</button><button data-a="csvh">Hallazgos (CSV)</button><button data-a="csvlv">Lista de verificación (CSV)</button></div></div>
  <div class="card"><h2>Apariencia</h2><div class="fila"><button data-a="tema" data-t="auto">Automático</button><button data-a="tema" data-t="light">${I('sol')}Claro</button><button data-a="tema" data-t="dark">${I('luna')}Oscuro</button></div></div>
  <div class="card"><h2>Empezar de cero</h2><p class="small">Borra todas las respuestas, hallazgos y documentos de este dispositivo. Haga antes un respaldo.</p><button class="peligro" data-a="reset">${I('papelera')}Borrar todo</button></div></div>`;
}
function vAyuda(){
  const p=(n,t,d)=>`<div class="pasoayuda"><span class="num">${n}</span><div><b>${t}</b><p class="small mut" style="margin:2px 0 0">${d}</p></div></div>`;
  return `<div class="wrap"><p class="small" style="margin:0 0 10px"><a href="#/mas" style="display:inline-flex;align-items:center;gap:4px;text-decoration:none">${I('izq')}Más</a></p><div class="pagina-t"><h1>Ayuda</h1><p class="sub">Cómo trabajar una sesión de principio a fin.</p></div>
  <div class="card"><h2>Una sesión, paso a paso</h2>${p(1,'Prepare','En «Hoy» abra la sesión. Lea qué debe demostrar y pida los documentos que indica.')}${p(2,'Adjunte y analice los documentos','Arrastre los archivos a «Documentos» o use «Adjuntar» dentro de la sesión. Lea las conclusiones y las preguntas sugeridas.')}${p(3,'Pregunte y registre','Para cada pregunta marque el resultado y anote hechos y evidencia. Use «Enfoque» para ver una pregunta a la vez.')}${p(4,'Retroalimente','Al terminar, lea al auditado los aspectos identificados y anote sus aclaraciones.')}${p(5,'Cierre y genere los formatos','Convierta lo relevante en hallazgos, valídelos y genere la retroalimentación diaria y el formulario de hallazgos.')}</div>
  <div class="card"><h2>Qué hace el análisis de documentos y qué no</h2><ul class="small" style="padding-left:18px"><li><b>Hace:</b> lee Word, Excel, PDF con texto y CSV; extrae código, versión, fechas y aprobación; busca los elementos que la norma espera según el tipo de documento; revisa tablas (responsables, fechas, estados) y propone preguntas y borradores de hallazgo.</li><li><b>No hace:</b> no entiende el sentido del texto, no lee imágenes ni PDF escaneados y no decide si hay una no conformidad. Lo que marca como «no encontrado» es un punto a verificar con el auditado.</li><li><b>Confidencialidad:</b> el análisis ocurre en su dispositivo; ningún documento se envía a internet.</li></ul></div>
  <div class="card"><h2>Atajos de teclado</h2><p class="small" style="margin:0"><span class="kbd">←</span> <span class="kbd">→</span> pregunta anterior / siguiente (modo Enfoque) · <span class="kbd">1</span> a <span class="kbd">7</span> marcar resultado (Conforme, Observación, Mejora, NC menor, NC mayor, Seguimiento, No aplica) · <span class="kbd">Esc</span> cerrar ventanas</p></div>
  <div class="card"><h2>Si algo falla</h2><ul class="small" style="padding-left:18px"><li>Descargue un respaldo en «Más → Datos» y recargue la página.</li><li>Si un documento no se lee, guárdelo como .docx, .xlsx o PDF con texto.</li><li>Si el navegador no permite guardar, use otro (Chrome o Edge) y no use la ventana privada.</li></ul></div>
  <button class="primario" data-a="tour">${I('play')}Ver la presentación inicial</button></div>`;
}

/* ---------- Modal de requisito, acciones rápidas y bienvenida ---------- */
function modalRef(id){
  const r=REFS[id];if(!r)return;const cob=cobertura()[id];
  hoja(`<div class="fila"><h2 style="margin:0;flex:1"><span class="ref" style="cursor:default;font-size:.85rem">${esc(id)}</span> ${esc(r.t)}</h2><button class="ib" data-a="cerrar" aria-label="Cerrar">${I('x')}</button></div><p style="margin-top:12px">${esc(r.s)}</p><p class="small"><b>Evidencia típica:</b> ${esc(r.e)}</p><p class="small"><b>En el cronograma:</b> ${cob.asig.length?cob.asig.map(i=>`<a href="#/sesion/${i}">${esc(SES[i].nombre)}</a>`).join(', '):(cob.soloSoA?'solo en la sesión SoA (13 nov)':'no asignado')}</p>${cob.qs.length?`<p class="small"><b>Preguntas relacionadas:</b> ${cob.qs.length} · Resultado: ${cob.peor==='pendiente'?'sin verificar':TIPOS[cob.peor].n}</p>`:''}`);
}
function accionesRapidas(){
  const b=(a,ic,t,d)=>`<button class="g" data-a="${a}" style="width:100%;justify-content:flex-start;height:auto;padding:12px 14px;margin-bottom:8px"><span class="ico" style="display:grid;place-items:center;width:38px;height:38px;border-radius:10px;background:var(--accent-soft);color:var(--accent)">${I(ic)}</span><span style="text-align:left"><b>${t}</b><br><span class="small mut" style="font-weight:400">${d}</span></span></button>`;
  hoja(`<div class="fila"><h2 style="margin:0;flex:1">Acciones rápidas</h2><button class="ib" data-a="cerrar" aria-label="Cerrar">${I('x')}</button></div><div style="margin-top:14px">${b('subir','subir','Adjuntar documento','Se lee y analiza en este dispositivo')}${b('nuevoh','bandera','Nuevo hallazgo','Redacte un hallazgo con el formato de la empresa')}${b('irlista','lista','Lista de verificación','Marque Sí / No / N/A')}${b('irformatos','formatos','Generar formatos','Formulario de hallazgos y retroalimentación')}</div>`);
}
const TOUR=[
 ['hoy','Su día, en una pantalla','«Hoy» muestra la siguiente sesión, su avance y la agenda completa. Toque «Comenzar» y la herramienta le guía: preparar, preguntar y cerrar.'],
 ['docbusca','Adjunte documentos y obtenga conclusiones','Arrastre un PDF, Word o Excel. Se lee en su dispositivo y le dice qué elementos de la norma encontró, qué falta y qué preguntar. Los borradores de hallazgo son opcionales.'],
 ['bandera','Hallazgos con la redacción de la empresa','Cada hallazgo se redacta con las plantillas y criterios MAYOR/MENOR de su procedimiento y se valida con el auditado.'],
 ['formatos','Los formatos se llenan solos','Con un toque genera el Formulario de hallazgos (FOR-SGC-004) y la Retroalimentación diaria, listos para firmar.']
];
function mostrarTour(i){
  i=i||0;const t=TOUR[i],ult=i===TOUR.length-1;
  hoja(`<div style="text-align:center;padding:6px 0 0"><span class="ico" style="display:inline-grid;place-items:center;width:64px;height:64px;border-radius:18px;background:var(--accent-soft);color:var(--accent)">${I(t[0],'')}</span><h2 style="margin:16px 0 8px;font-size:1.3rem">${esc(t[1])}</h2><p class="mut" style="max-width:40ch;margin:0 auto 18px">${esc(t[2])}</p><div style="display:flex;justify-content:center;gap:6px;margin-bottom:16px">${TOUR.map((_,k)=>`<span style="width:${k===i?22:8}px;height:8px;border-radius:99px;background:${k===i?'var(--accent)':'var(--line-2)'}"></span>`).join('')}</div><div class="fila" style="justify-content:center"><button class="fantasma" data-a="tourfin">${ult?'Cerrar':'Saltar'}</button><button class="primario" data-a="${ult?'tourfin':'toursig'}" data-i="${i+1}" autofocus>${ult?'Empezar':'Siguiente'}</button></div></div>`);
}
