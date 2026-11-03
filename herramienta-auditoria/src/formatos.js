/* ===== GENERADOR DE FORMATOS OFICIALES (sin internet) =====
   Llena las plantillas reales de la empresa:
   - Formulario de hallazgos de auditoría interna FOR-SGC-004 (.xlsx)
   - Retroalimentación diaria al auditado (.docx)
   Un .xlsx/.docx es un ZIP de archivos XML: se editan los XML de la plantilla y se vuelve a empaquetar. */
const FM={};
const _enc=new TextEncoder();
const _CRC=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;})();
function crc32(u8){let c=0xFFFFFFFF;for(let i=0;i<u8.length;i++)c=_CRC[(c^u8[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0;}
function b64u8(b){const bin=atob(b);const u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u;}
function concatU8(arr){const n=arr.reduce((a,x)=>a+x.length,0);const o=new Uint8Array(n);let p=0;arr.forEach(x=>{o.set(x,p);p+=x.length;});return o;}

/* ZIP sin compresión (método «store»), válido para Office y para cualquier descompresor */
function zipU8(files){
  const now=new Date();
  const dt=((now.getHours()<<11)|(now.getMinutes()<<5)|(now.getSeconds()>>1))&0xFFFF;
  const dd=(((now.getFullYear()-1980)<<9)|((now.getMonth()+1)<<5)|now.getDate())&0xFFFF;
  const out=[],central=[];let off=0;
  files.forEach(f=>{
    const data=typeof f.data==='string'?_enc.encode(f.data):f.data;
    const name=_enc.encode(f.name),crc=crc32(data),size=data.length;
    const lh=new DataView(new ArrayBuffer(30));
    lh.setUint32(0,0x04034b50,true);lh.setUint16(4,20,true);lh.setUint16(6,0x0800,true);lh.setUint16(8,0,true);
    lh.setUint16(10,dt,true);lh.setUint16(12,dd,true);lh.setUint32(14,crc,true);lh.setUint32(18,size,true);lh.setUint32(22,size,true);
    lh.setUint16(26,name.length,true);lh.setUint16(28,0,true);
    out.push(new Uint8Array(lh.buffer),name,data);
    const ch=new DataView(new ArrayBuffer(46));
    ch.setUint32(0,0x02014b50,true);ch.setUint16(4,20,true);ch.setUint16(6,20,true);ch.setUint16(8,0x0800,true);ch.setUint16(10,0,true);
    ch.setUint16(12,dt,true);ch.setUint16(14,dd,true);ch.setUint32(16,crc,true);ch.setUint32(20,size,true);ch.setUint32(24,size,true);
    ch.setUint16(28,name.length,true);ch.setUint32(42,off,true);
    central.push(new Uint8Array(ch.buffer),name);
    off+=30+name.length+size;
  });
  const cd=concatU8(central);
  const end=new DataView(new ArrayBuffer(22));
  end.setUint32(0,0x06054b50,true);end.setUint16(8,files.length,true);end.setUint16(10,files.length,true);end.setUint32(12,cd.length,true);end.setUint32(16,off,true);
  return concatU8([...out,cd,new Uint8Array(end.buffer)]);
}
function plantMap(k){return new Map(PLANTILLAS[k].map(([n,t,x])=>[n,t==='t'?x:b64u8(x)]));}
const _XMLH='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
const _XNS='http://www.w3.org/XML/1998/namespace';
/* Quita los caracteres que XML 1.0 no admite (suelen venir al pegar desde Word o PDF) y rompen el archivo */
const _limpio=s=>String(s==null?'':s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g,'').replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g,'');
const _ser=doc=>_XMLH+new XMLSerializer().serializeToString(doc).replace(/^<\?xml[^>]*\?>\s*/,'');

/* ---------- Formulario de hallazgos (xlsx) ----------
   d: {empresa, fechaIni, fechaFin, horaIni, horaFin, area, procesos[], personal[], normas{}, caps[], docs[{n,t}],
       metodos{doc,ent,obs,mue}, pf[], om[], obs[{txt,ac}], nc[{evid,txt,tipo,ac}], auditor, fechaFirma} */
FM.xlsx=function(d){
  const P=plantMap('xlsx');
  const NS='http://schemas.openxmlformats.org/spreadsheetml/2006/main';
  const dp=new DOMParser(),xs=new XMLSerializer();
  const sheet=dp.parseFromString(P.get('xl/worksheets/sheet1.xml'),'application/xml');
  const styles=dp.parseFromString(P.get('xl/styles.xml'),'application/xml');
  const sd=sheet.getElementsByTagNameNS(NS,'sheetData')[0];
  const mcEl=sheet.getElementsByTagNameNS(NS,'mergeCells')[0];
  const el=n=>sheet.createElementNS(NS,n);
  const cx=styles.getElementsByTagNameNS(NS,'cellXfs')[0];
  const wrapCache={};
  function wrap(idx){
    if(wrapCache[idx]!=null)return wrapCache[idx];
    const nx=cx.children[idx].cloneNode(true);
    let al=[...nx.children].find(c=>c.localName==='alignment');
    if(!al){al=styles.createElementNS(NS,'alignment');nx.insertBefore(al,nx.firstChild);}
    al.setAttribute('wrapText','1');al.setAttribute('vertical','top');nx.setAttribute('applyAlignment','1');
    cx.appendChild(nx);cx.setAttribute('count',cx.children.length);
    return wrapCache[idx]=cx.children.length-1;
  }
  const colOf=r=>r.match(/^[A-Z]+/)[0];
  const rowEl=n=>[...sd.children].find(r=>+r.getAttribute('r')===n);
  function cell(ref){
    const n=+ref.match(/\d+/)[0];const row=rowEl(n);
    let c=[...row.children].find(x=>x.getAttribute('r')===ref);
    if(!c){c=el('c');c.setAttribute('r',ref);row.appendChild(c);}
    return c;
  }
  const filled=[];  /* [ref,text,wrap] para calcular alturas */
  function put(ref,text,w){
    const c=cell(ref);[...c.children].forEach(x=>x.remove());c.removeAttribute('t');
    if(text===''||text==null)return;
    c.setAttribute('t','inlineStr');
    const is=el('is'),t=el('t');t.setAttributeNS(_XNS,'xml:space','preserve');t.textContent=_limpio(text);
    is.appendChild(t);c.appendChild(is);
    if(w!==false){c.setAttribute('s',wrap(+c.getAttribute('s')||0));filled.push([ref,_limpio(text)]);}
  }
  const parseRef=r=>{const m=r.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);return m?{c1:m[1],r1:+m[2],c2:m[3],r2:+m[4]}:null;};
  const merges=()=>[...mcEl.children];
  function insertRows(after,k){
    if(k<=0)return;
    const tpl=rowEl(after);
    const tplM=merges().map(m=>parseRef(m.getAttribute('ref'))).filter(p=>p&&p.r1===after&&p.r2===after);
    [...sd.children].forEach(r=>{const n=+r.getAttribute('r');if(n>after){r.setAttribute('r',n+k);[...r.children].forEach(c=>c.setAttribute('r',colOf(c.getAttribute('r'))+(n+k)));}});
    merges().forEach(m=>{const p=parseRef(m.getAttribute('ref'));if(p&&p.r1>after)m.setAttribute('ref',p.c1+(p.r1+k)+':'+p.c2+(p.r2+k));});
    let prev=tpl;
    for(let i=1;i<=k;i++){
      const n=after+i,cl=tpl.cloneNode(true);cl.setAttribute('r',n);
      [...cl.children].forEach(c=>{c.setAttribute('r',colOf(c.getAttribute('r'))+n);[...c.children].forEach(x=>x.remove());c.removeAttribute('t');});
      prev.after(cl);prev=cl;
      tplM.forEach(p=>{const m=el('mergeCell');m.setAttribute('ref',p.c1+n+':'+p.c2+n);mcEl.appendChild(m);});
    }
    mcEl.setAttribute('count',mcEl.children.length);
  }
  /* 1) hacer espacio (de abajo hacia arriba) */
  const np=Math.max(d.procesos.length,d.personal.length);
  const kProc=Math.max(0,np-4),kDoc=Math.max(0,Math.ceil(d.docs.length/2)-2);
  const kPF=Math.max(0,d.pf.length-3),kOM=Math.max(0,d.om.length-3),kObs=Math.max(0,d.obs.length-3),kNC=Math.max(0,d.nc.length-2);
  insertRows(51,kNC);insertRows(47,kObs);insertRows(43,kOM);insertRows(39,kPF);insertRows(28,kDoc);insertRows(19,kProc);
  const R=o=>o+(o>19?kProc:0)+(o>28?kDoc:0)+(o>39?kPF:0)+(o>43?kOM:0)+(o>47?kObs:0)+(o>51?kNC:0);
  const total=kProc+kDoc+kPF+kOM+kObs+kNC;
  /* 2) datos */
  put('B6','Empresa Auditada: '+d.empresa);
  put('B11',d.fechaIni,false);put('D11',d.fechaFin,false);put('F11',d.horaIni,false);put('H11',d.horaFin,false);
  put('C14',d.area);
  for(let i=0;i<np;i++){put('B'+(16+i),d.procesos[i]||'');put('F'+(16+i),d.personal[i]||'');}
  const g=v=>v?'☒':'☐';
  const nm=[['9001','Norma ISO 9001'],['14001','Norma ISO 14001'],['27001','Norma ISO 27001'],['20000','Norma ISO 20000-1'],['45001','Norma ISO 45001']];
  put('B'+R(22),nm.map(x=>g(d.normas[x[0]])+' '+x[1]).join('        '),false);
  const cp=[[4,'4. Contexto de la organización'],[5,'5. Liderazgo'],[6,'6. Planificación'],[7,'7. Apoyo'],[8,'8. Operación'],[9,'9. Evaluación del desempeño'],[10,'10. Mejora'],['A','Anexos']];
  put('B'+R(23),cp.map(x=>g(d.caps.includes(x[0]))+' '+x[1]).join('    '),false);
  d.docs.forEach((x,i)=>{const r=R(27)+Math.floor(i/2),izq=i%2===0;put((izq?'B':'F')+r,x.n);put((izq?'C':'G')+r,x.t);});
  const rm=R(31);
  put('B'+rm,g(d.metodos.doc),false);put('B'+(rm+1),g(d.metodos.ent),false);put('B'+(rm+2),g(d.metodos.mue),false);put('E'+rm,g(d.metodos.obs),false);
  d.pf.forEach((t,i)=>put('B'+(R(37)+i),t));
  d.om.forEach((t,i)=>put('B'+(R(41)+i),t));
  d.obs.forEach((o,i)=>{const r=R(45)+i;put('B'+r,o.txt);put('H'+r,o.ac);});
  d.nc.forEach((o,i)=>{const r=R(50)+i;put('B'+r,o.evid);put('E'+r,o.txt);put('H'+r,o.tipo);put('I'+r,o.ac);});
  put('D'+R(55),d.auditor);put('H'+R(55),d.fechaFirma);
  /* 3) alturas de fila según el texto (Excel no ajusta solo las celdas combinadas) */
  const COLW={B:22,C:18.57,D:18.57,E:18.57,F:18.57,G:18.57,H:18.57,I:20.29};
  const colIdx=c=>c.charCodeAt(0)-64;
  const width=ref=>{
    const col=colOf(ref),n=+ref.match(/\d+/)[0];
    const m=merges().map(x=>parseRef(x.getAttribute('ref'))).find(p=>p&&p.r1<=n&&p.r2>=n&&colIdx(p.c1)<=colIdx(col)&&colIdx(p.c2)>=colIdx(col));
    let w=0;const a=m?colIdx(m.c1):colIdx(col),b=m?colIdx(m.c2):colIdx(col);
    for(let i=a;i<=b;i++)w+=COLW[String.fromCharCode(64+i)]||11.4;
    return w;
  };
  const lineas=(t,w)=>t.split('\n').reduce((a,p)=>a+Math.max(1,Math.ceil(p.length/(w*0.82))),0);
  const need={};
  filled.forEach(([ref,t])=>{const n=+ref.match(/\d+/)[0];need[n]=Math.max(need[n]||1,lineas(t,width(ref)));});
  Object.keys(need).forEach(n=>{
    const row=rowEl(+n);const ht=Math.max(20.45,need[n]*15+5);
    if(need[n]>1||!row.getAttribute('ht')){row.setAttribute('ht',ht.toFixed(2));row.setAttribute('customHeight','1');}
  });
  /* 4) hoja, área de impresión, vista */
  const dim=sheet.getElementsByTagNameNS(NS,'dimension')[0];if(dim)dim.setAttribute('ref','B2:I'+(58+total));
  const sv=sheet.getElementsByTagNameNS(NS,'sheetView')[0];if(sv){sv.setAttribute('topLeftCell','A1');}
  let wb=P.get('xl/workbook.xml');wb=wb.replace('$A$1:$J$59','$A$1:$J$'+(59+total));
  P.set('xl/workbook.xml',wb);
  P.set('xl/worksheets/sheet1.xml',_ser(sheet));
  P.set('xl/styles.xml',_ser(styles));
  return zipU8([...P].map(([name,data])=>({name,data})));
};

/* ---------- Retroalimentación diaria (docx) ----------
   d: {fecha, proceso, auditores, auditado, aspectos:[{txt,ev}], comentarios, nombreAuditado, nombreAuditor, fechaFirma} */
FM.docx=function(d){
  const P=plantMap('docx');
  const W='http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  const dp=new DOMParser(),xs=new XMLSerializer();
  const doc=dp.parseFromString(P.get('word/document.xml'),'application/xml');
  const all=(n,r)=>[...(r||doc).getElementsByTagNameNS(W,n)];
  const txt=n=>all('t',n).map(t=>t.textContent).join('');
  const setT=(t,v)=>{t.textContent=_limpio(v);t.setAttributeNS(_XNS,'xml:space','preserve');};
  const paras=all('p');
  const underscores=p=>all('t',p).filter(t=>/^\s*_{4,}\s*$/.test(t.textContent));
  /* encabezado: Fecha, Proceso/Área, Auditor(es), Auditado/Responsable */
  const cab=paras.find(p=>txt(p).includes('Auditado / Responsable'));
  const vals=[d.fecha,d.proceso,d.auditores,d.auditado];
  underscores(cab).forEach((t,i)=>{if(vals[i]!=null&&vals[i]!=='')setT(t,' '+vals[i]);});
  /* tabla de aspectos */
  const tbl=all('tbl')[0];
  const rows=all('tr',tbl);
  const fill=(tr,i,a)=>{
    const tcs=all('tc',tr);
    const cellNum=all('t',tcs[0])[0];if(cellNum)cellNum.textContent=String(i+1);
    [[tcs[1],a.txt],[tcs[2],a.ev]].forEach(([tc,v])=>{
      if(!tc||!v)return;
      const p=all('p',tc)[0];
      [...p.children].filter(x=>x.localName==='r').forEach(x=>x.remove());
      const r=doc.createElementNS(W,'w:r'),rp=doc.createElementNS(W,'w:rPr'),sz=doc.createElementNS(W,'w:sz'),szc=doc.createElementNS(W,'w:szCs'),t=doc.createElementNS(W,'w:t');
      sz.setAttributeNS(W,'w:val','20');szc.setAttributeNS(W,'w:val','20');rp.appendChild(sz);rp.appendChild(szc);r.appendChild(rp);
      setT(t,v);r.appendChild(t);p.appendChild(r);
    });
  };
  const body=rows.slice(1);
  const extra=Math.max(0,d.aspectos.length-body.length);
  let last=body[body.length-1];
  for(let i=0;i<extra;i++){const cl=last.cloneNode(true);last.after(cl);last=cl;body.push(cl);}
  body.forEach((tr,i)=>{if(i<d.aspectos.length)fill(tr,i,d.aspectos[i]);else{const n=all('t',all('tc',tr)[0])[0];if(n)n.textContent=String(i+1);}});
  /* comentarios del auditado */
  if(d.comentarios){
    const idx=paras.findIndex(p=>txt(p).startsWith('COMENTARIOS'));
    const pl=paras.slice(idx+1).find(p=>/^_{20,}$/.test(txt(p)));
    if(pl){const t=all('t',pl)[0];setT(t,d.comentarios);}
  }
  /* confirmación */
  const campo=(pref,val)=>{const p=paras.find(q=>txt(q).startsWith(pref));if(!p||!val)return;const us=all('t',p).filter(t=>/_/.test(t.textContent)&&/^[\s_]+$/.test(t.textContent));us.forEach((t,i)=>setT(t,i===0?' '+val:''));};
  campo('Nombre del auditado',d.nombreAuditado);
  campo('Nombre del auditor',d.nombreAuditor);
  campo('Fecha:',d.fechaFirma);
  P.set('word/document.xml',_ser(doc));
  return zipU8([...P].map(([name,data])=>({name,data})));
};
FM.zip=zipU8;
