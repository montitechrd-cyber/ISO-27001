/* ===== TEMA Y ARRANQUE ===== */
const mqDark=window.matchMedia?matchMedia('(prefers-color-scheme: dark)'):null;
const temaEfectivo=()=>document.documentElement.getAttribute('data-theme')||(mqDark&&mqDark.matches?'dark':'light');
function pintarTema(){
  const b=$('#tema-btn');if(!b)return;const osc=temaEfectivo()==='dark';
  b.innerHTML=I(osc?'sol':'luna')+'<span class="t">'+(osc?'Modo claro':'Modo oscuro')+'</span>';
  b.setAttribute('aria-label',osc?'Cambiar a modo claro':'Cambiar a modo oscuro');b.title=osc?'Cambiar a modo claro':'Cambiar a modo oscuro';
}
function setTema(t){
  if(t==='auto')document.documentElement.removeAttribute('data-theme');else document.documentElement.setAttribute('data-theme',t);
  try{localStorage.setItem(KEY+'-tema',t);}catch(e){}
  S.tema=t;guardarYa();
  pintarTema();
}
if(mqDark&&mqDark.addEventListener)mqDark.addEventListener('change',pintarTema);
/* Si la copia interna (IndexedDB) es más reciente que la de localStorage, se recupera: protege contra pérdidas por cierres inmediatos del navegador */
async function recuperarEstadoInterno(){
  try{
    const r=await DOCDB.get('__estado__');if(!r||!r.json)return;
    if(!(r.t>(S.guardado||0)))return;
    const o=JSON.parse(r.json);
    if(o.tema&&o.tema!==S.tema){S.tema=o.tema;if(o.tema==='auto')document.documentElement.removeAttribute('data-theme');else document.documentElement.setAttribute('data-theme',o.tema);pintarTema();}
    if(!(Object.keys(o.resp||{}).length||(o.hall||[]).length||Object.keys(o.docs||{}).length))return;
    S=migrar(o);try{localStorage.setItem(KEY,r.json);}catch(e){}
    render();toast('Se recuperó su trabajo guardado ('+(S.hall.length)+' hallazgos, '+Object.keys(S.resp).length+' respuestas).');
  }catch(e){}
}
(function(){
  try{const t=localStorage.getItem(KEY+'-tema');if(t&&t!=='auto')document.documentElement.setAttribute('data-theme',t);else if(!t&&S.tema&&S.tema!=='auto')document.documentElement.setAttribute('data-theme',S.tema);}catch(e){}
  montarIconos();
  const bAy=$('#btn-ayuda'),bPl=$('#btn-plus');if(bAy)bAy.innerHTML=I('ayuda');if(bPl)bPl.innerHTML=I('mas');
  pintarTema();DOCDB.open();
  if(!location.hash)location.hash='#/hoy';
  render();
  recuperarEstadoInterno();
  let visto=false;try{visto=!!localStorage.getItem(KEY+'-tour');}catch(e){}
  if(!visto&&!Object.keys(S.resp).length&&!S.hall.length&&!Object.keys(S.docs).length)setTimeout(()=>mostrarTour(0),400);
})();
