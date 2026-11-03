/* ===== DOCUMENTOS: almacenamiento y lectura (todo en el dispositivo, sin internet) ===== */
const DOCDB={
  db:null,ok:true,mem:new Map(),
  open(){return new Promise(res=>{
    if(DOCDB.db||!DOCDB.ok)return res(DOCDB.ok);
    try{const r=indexedDB.open('ga27001-docs',1);r.onupgradeneeded=()=>r.result.createObjectStore('f',{keyPath:'id'});r.onsuccess=()=>{DOCDB.db=r.result;res(true);};r.onerror=()=>{DOCDB.ok=false;res(false);};r.onblocked=()=>{DOCDB.ok=false;res(false);};}
    catch(e){DOCDB.ok=false;res(false);}
  });},
  async put(rec){if(await DOCDB.open()){return new Promise(res=>{try{const t=DOCDB.db.transaction('f','readwrite');t.objectStore('f').put(rec);t.oncomplete=()=>res(true);t.onerror=()=>{DOCDB.mem.set(rec.id,rec);res(false);};}catch(e){DOCDB.mem.set(rec.id,rec);res(false);}});}DOCDB.mem.set(rec.id,rec);return false;},
  async get(id){if(DOCDB.mem.has(id))return DOCDB.mem.get(id);if(!(await DOCDB.open()))return null;return new Promise(res=>{try{const r=DOCDB.db.transaction('f').objectStore('f').get(id);r.onsuccess=()=>res(r.result||null);r.onerror=()=>res(null);}catch(e){res(null);}});},
  async del(id){DOCDB.mem.delete(id);if(!(await DOCDB.open()))return;return new Promise(res=>{try{const t=DOCDB.db.transaction('f','readwrite');t.objectStore('f').delete(id);t.oncomplete=()=>res();t.onerror=()=>res();}catch(e){res();}});},
  /* borra los archivos y textos, pero conserva la copia de seguridad interna del trabajo */
  async clear(){Array.from(DOCDB.mem.keys()).forEach(k=>{if(k!=='__estado__')DOCDB.mem.delete(k);});if(!(await DOCDB.open()))return;return new Promise(res=>{try{const t=DOCDB.db.transaction('f','readwrite'),st=t.objectStore('f'),rq=st.openCursor();rq.onsuccess=()=>{const c=rq.result;if(c){if(c.key!=='__estado__')c.delete();c.continue();}};t.oncomplete=()=>res();t.onerror=()=>res();}catch(e){res();}});}
};

async function sha256(buf){
  try{if(!(window.crypto&&crypto.subtle))return '';const h=await crypto.subtle.digest('SHA-256',buf);return Array.from(new Uint8Array(h)).map(b=>b.toString(16).padStart(2,'0')).join('');}catch(e){return '';}
}

/* ---------- ZIP (para .docx y .xlsx) ---------- */
async function inflateRaw(u8){
  if(typeof DecompressionStream!=='function')throw new Error('Este navegador no puede abrir archivos Word/Excel. Actualice Chrome, Edge o Safari.');
  const ds=new DecompressionStream('deflate-raw');
  return new Uint8Array(await new Response(new Blob([u8]).stream().pipeThrough(ds)).arrayBuffer());
}
function zipIndice(u8){
  const dv=new DataView(u8.buffer,u8.byteOffset,u8.byteLength);
  let e=-1;for(let i=u8.length-22;i>=Math.max(0,u8.length-65558);i--){if(dv.getUint32(i,true)===0x06054b50){e=i;break;}}
  if(e<0)throw new Error('No es un archivo ZIP válido (¿está dañado?).');
  const n=dv.getUint16(e+10,true);let p=dv.getUint32(e+16,true);const m=new Map();
  for(let k=0;k<n;k++){
    if(dv.getUint32(p,true)!==0x02014b50)break;
    const met=dv.getUint16(p+10,true),cs=dv.getUint32(p+20,true),nl=dv.getUint16(p+28,true),el=dv.getUint16(p+30,true),cl=dv.getUint16(p+32,true),off=dv.getUint32(p+42,true);
    const nom=new TextDecoder().decode(u8.subarray(p+46,p+46+nl));m.set(nom,{met,cs,off});p+=46+nl+el+cl;
  }
  return m;
}
async function zipLeer(u8,idx,nombre){
  const f=idx.get(nombre);if(!f)return null;
  const dv=new DataView(u8.buffer,u8.byteOffset,u8.byteLength);
  const nl=dv.getUint16(f.off+26,true),el=dv.getUint16(f.off+28,true),ini=f.off+30+nl+el;
  const datos=u8.subarray(ini,ini+f.cs);
  return f.met===0?datos:f.met===8?await inflateRaw(datos):null;
}
const _td=new TextDecoder('utf-8');
const _xml=u8=>new DOMParser().parseFromString(_td.decode(u8),'application/xml');
const _hijos=(n,ln)=>Array.from(n.childNodes).filter(c=>c.nodeType===1&&c.localName===ln);
const _desc=(n,ln)=>Array.from(n.getElementsByTagName('*')).filter(c=>c.localName===ln);

/* ---------- Word (.docx) ---------- */
function _textoP(p){let t='';const walk=n=>{for(const c of n.childNodes){if(c.nodeType!==1)continue;const l=c.localName;if(l==='t')t+=c.textContent;else if(l==='tab')t+='\t';else if(l==='br'||l==='cr')t+='\n';else if(l==='noBreakHyphen')t+='-';else if(l==='del'||l==='delText'||l==='instrText')continue;else walk(c);}};walk(p);return t;}
function _volcar(nodo,out){
  for(const c of nodo.childNodes){
    if(c.nodeType!==1)continue;const l=c.localName;
    if(l==='p')out.push(_textoP(c));
    else if(l==='tbl'){for(const tr of c.childNodes){if(tr.nodeType!==1||tr.localName!=='tr')continue;const cel=[];for(const tc of tr.childNodes){if(tc.nodeType!==1||tc.localName!=='tc')continue;const sub=[];_volcar(tc,sub);cel.push(sub.join(' ').trim());}out.push(cel.join(' | '));}}
    else if(['sdt','sdtContent','ins','smartTag','customXml','body'].includes(l))_volcar(c,out);
  }
}
async function leerDocx(u8){
  const idx=zipIndice(u8);const d=await zipLeer(u8,idx,'word/document.xml');
  if(!d)throw new Error('El archivo no parece un documento Word (.docx).');
  const doc=_xml(d),out=[];_volcar(doc.documentElement,out);
  const extra=[];
  for(const n of idx.keys()){if(/^word\/(header|footer)\d*\.xml$/.test(n)){const x=_xml(await zipLeer(u8,idx,n)),o=[];_volcar(x.documentElement,o);const t=o.map(s=>s.trim()).filter(Boolean).join(' · ');if(t)extra.push((n.includes('header')?'[Encabezado] ':'[Pie] ')+t);}}
  const meta={cambiosPend:_desc(doc,'ins').length+_desc(doc,'del').length};
  const cm=idx.has('word/comments.xml')?_desc(_xml(await zipLeer(u8,idx,'word/comments.xml')),'comment').length:0;meta.comentarios=cm;
  const core=idx.has('docProps/core.xml')?_xml(await zipLeer(u8,idx,'docProps/core.xml')):null;
  if(core){const g=l=>{const e=_desc(core,l)[0];return e?e.textContent:'';};meta.titulo=g('title');meta.autor=g('creator');meta.ultimoEn=g('lastModifiedBy');meta.creado=g('created');meta.modificado=g('modified');}
  let paginas=0;if(idx.has('docProps/app.xml')){const a=_xml(await zipLeer(u8,idx,'docProps/app.xml'));const e=_desc(a,'Pages')[0];if(e)paginas=+e.textContent||0;}
  const texto=(extra.join('\n')+'\n'+out.join('\n')).replace(/\n{3,}/g,'\n\n').trim();
  return {texto,meta,paginas};
}

/* ---------- Excel (.xlsx) ---------- */
const _colN=ref=>{const m=ref.match(/^([A-Z]+)/)[1];let n=0;for(const ch of m)n=n*26+ch.charCodeAt(0)-64;return n-1;};
const _FMT_FECHA=new Set([14,15,16,17,18,19,20,21,22,27,28,29,30,31,32,33,34,35,36,45,46,47,50,51,52,53,54,55,56,57,58]);
function _serialAFecha(v){const f=new Date(Date.UTC(1899,11,30)+Math.round(v*86400000));return String(f.getUTCDate()).padStart(2,'0')+'/'+String(f.getUTCMonth()+1).padStart(2,'0')+'/'+f.getUTCFullYear();}
async function leerXlsx(u8){
  const idx=zipIndice(u8);const wbx=await zipLeer(u8,idx,'xl/workbook.xml');
  if(!wbx)throw new Error('El archivo no parece una hoja de Excel (.xlsx).');
  const wb=_xml(wbx);const rels=_xml(await zipLeer(u8,idx,'xl/_rels/workbook.xml.rels'));
  const destino={};_desc(rels,'Relationship').forEach(r=>{destino[r.getAttribute('Id')]=r.getAttribute('Target');});
  const comp=[];
  if(idx.has('xl/sharedStrings.xml')){_desc(_xml(await zipLeer(u8,idx,'xl/sharedStrings.xml')),'si').forEach(si=>comp.push(_desc(si,'t').map(t=>t.textContent).join('')));}
  const esFecha=new Set();
  if(idx.has('xl/styles.xml')){
    const st=_xml(await zipLeer(u8,idx,'xl/styles.xml'));const custom={};_desc(st,'numFmt').forEach(n=>{custom[n.getAttribute('numFmtId')]=n.getAttribute('formatCode')||'';});
    const cx=_desc(st,'cellXfs')[0];if(cx)_hijos(cx,'xf').forEach((x,i)=>{const id=+x.getAttribute('numFmtId');const code=custom[id];if(_FMT_FECHA.has(id)||(code&&/[dmy]/i.test(code.replace(/"[^"]*"/g,'').replace(/\[[^\]]*\]/g,''))&&!/^General$|@/i.test(code)))esFecha.add(i);});
  }
  const hojas=[],ocultas=[];let errores=0;
  for(const sh of _desc(wb,'sheet')){
    const nombre=sh.getAttribute('name');const rid=sh.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id')||sh.getAttribute('r:id');
    if(sh.getAttribute('state')&&sh.getAttribute('state')!=='visible')ocultas.push(nombre);
    let t=destino[rid]||'';t=t.startsWith('/')?t.slice(1):'xl/'+t;
    const raw=await zipLeer(u8,idx,t);if(!raw)continue;
    const x=_xml(raw);const filas=[];
    for(const row of _desc(x,'row')){
      const r=(+row.getAttribute('r')||filas.length+1)-1;if(r>4000)break;const arr=[];
      for(const c of _hijos(row,'c')){
        const ref=c.getAttribute('r')||'';const ci=ref?_colN(ref):arr.length;if(ci>60)continue;
        const tp=c.getAttribute('t'),vEl=_hijos(c,'v')[0],v=vEl?vEl.textContent:'';let val='';
        if(tp==='s')val=comp[+v]||'';else if(tp==='inlineStr')val=_desc(c,'t').map(q=>q.textContent).join('');else if(tp==='str')val=v;else if(tp==='b')val=v==='1'?'Sí':'No';else if(tp==='e'){val=v;errores++;}
        else if(v!==''){const num=parseFloat(v);val=esFecha.has(+c.getAttribute('s'))&&num>0&&num<80000?_serialAFecha(num):(Number.isFinite(num)?String(Math.round(num*1e6)/1e6):v);}
        arr[ci]=val;
      }
      for(let i=0;i<arr.length;i++)if(arr[i]==null)arr[i]='';
      filas[r]=arr;
    }
    for(let i=0;i<filas.length;i++)if(!filas[i])filas[i]=[];
    hojas.push({nombre,filas});
  }
  const texto=hojas.map(h=>'## Hoja: '+h.nombre+'\n'+h.filas.map(f=>f.join(' | ').replace(/^( \| )+$/,'')).filter(l=>l.replace(/[ |]/g,'')).join('\n')).join('\n\n');
  const core=idx.has('docProps/core.xml')?_xml(await zipLeer(u8,idx,'docProps/core.xml')):null;const meta={errores,hojasOcultas:ocultas};
  if(core){const g=l=>{const e=_desc(core,l)[0];return e?e.textContent:'';};meta.titulo=g('title');meta.autor=g('creator');meta.ultimoEn=g('lastModifiedBy');meta.creado=g('created');meta.modificado=g('modified');}
  return {texto,hojas,meta,hojasN:hojas.length};
}

/* ---------- PDF (pdf.js incorporado, se carga solo al usarlo) ---------- */
let _pdfP=null;
function cargarPdfJs(){
  if(window.pdfjsLib)return Promise.resolve(window.pdfjsLib);if(_pdfP)return _pdfP;
  _pdfP=new Promise((res,rej)=>{try{
    const lib=document.getElementById('vendor-pdfjs'),w=document.getElementById('vendor-pdfworker');
    if(!lib||!w)throw new Error('El lector de PDF no está incluido en esta versión.');
    const s=document.createElement('script');s.textContent=lib.textContent;document.head.appendChild(s);
    if(!window.pdfjsLib)throw new Error('No se pudo iniciar el lector de PDF.');
    window.pdfjsLib.GlobalWorkerOptions.workerSrc=URL.createObjectURL(new Blob([b64u8(w.textContent.trim())],{type:'text/javascript'}));
    res(window.pdfjsLib);}catch(e){_pdfP=null;rej(e);}});
  return _pdfP;
}
const _fPdf=s=>{const m=String(s||'').match(/D:(\d{4})(\d{2})(\d{2})/);return m?m[1]+'-'+m[2]+'-'+m[3]:'';};
async function leerPdf(u8,prog){
  const lib=await cargarPdfJs();
  const pdf=await lib.getDocument({data:u8.slice(),isEvalSupported:false,useSystemFonts:false}).promise;
  const n=pdf.numPages,lim=Math.min(n,400),paginas=[];
  for(let i=1;i<=lim;i++){
    const pg=await pdf.getPage(i),tc=await pg.getTextContent();
    const lines=[];let line='',lastY=null,lastEnd=null;
    for(const it of tc.items){
      if(it.str===undefined)continue;const x=it.transform[4],y=it.transform[5];
      if(lastY!==null&&Math.abs(y-lastY)>3){lines.push(line);line='';lastEnd=null;}
      if(line&&lastEnd!==null&&x-lastEnd>1.5&&!line.endsWith(' ')&&!it.str.startsWith(' '))line+=' ';
      line+=it.str;lastY=y;lastEnd=x+(it.width||0);
      if(it.hasEOL){if(line)lines.push(line);line='';lastY=null;lastEnd=null;}
    }
    if(line)lines.push(line);paginas.push(lines.join('\n'));
    if(prog)prog(i,lim);
  }
  let meta={};try{const md=await pdf.getMetadata();const f=md.info||{};meta={titulo:f.Title||'',autor:f.Author||'',creado:_fPdf(f.CreationDate),modificado:_fPdf(f.ModDate),productor:f.Producer||''};}catch(e){}
  const texto=paginas.join('\n\n').trim();
  return {texto,meta,paginas:n,aviso:n>lim?'Se leyeron las primeras '+lim+' de '+n+' páginas.':''};
}

/* ---------- Dispatcher ---------- */
const EXT_IMG=['png','jpg','jpeg','gif','webp','bmp'];
const EXT_OK=['pdf','docx','xlsx','csv','txt','md','json','tsv','log',...EXT_IMG];
const extDe=n=>(String(n).toLowerCase().match(/\.([a-z0-9]+)$/)||[])[1]||'';
async function extraer(file,prog){
  const ext=extDe(file.name),u8=new Uint8Array(await file.arrayBuffer());
  const res={ext,texto:'',hojas:null,meta:{},paginas:0,hojasN:0,esPDF:ext==='pdf',esImagen:EXT_IMG.includes(ext),aviso:''};
  if(res.esImagen)return res;
  if(ext==='docx'){Object.assign(res,await leerDocx(u8));}
  else if(ext==='xlsx'){Object.assign(res,await leerXlsx(u8));}
  else if(ext==='pdf'){Object.assign(res,await leerPdf(u8,prog));}
  else if(['csv','tsv','txt','md','json','log'].includes(ext)){
    let t=new TextDecoder('utf-8').decode(u8);if(t.indexOf(String.fromCharCode(65533))>=0)t=new TextDecoder('windows-1252').decode(u8);
    res.texto=t.replace(/^﻿/,'');
    if(ext==='csv'||ext==='tsv'){const sep=ext==='tsv'?'\t':(res.texto.split(';').length>res.texto.split(',').length?';':',');
      const filas=res.texto.split(/\r?\n/).filter(l=>l.trim()).slice(0,4000).map(l=>l.split(sep).map(c=>c.replace(/^"|"$/g,'').trim()));res.hojas=[{nombre:file.name,filas}];res.hojasN=1;}
  }
  else if(ext==='doc'||ext==='xls'||ext==='ppt'||ext==='pptx')throw new Error('Los formatos antiguos de Office (.'+ext+') y las presentaciones no se pueden leer. Guárdelo como .docx, .xlsx o PDF y vuelva a adjuntarlo.');
  else throw new Error('Formato no admitido (.'+ext+'). Use PDF, Word (.docx), Excel (.xlsx), CSV, TXT o una imagen.');
  if(res.texto.length>1500000)res.texto=res.texto.slice(0,1500000);
  return res;
}
