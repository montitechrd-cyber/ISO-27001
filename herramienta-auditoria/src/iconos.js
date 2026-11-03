/* ===== ÍCONOS (SVG propios, trazo uniforme) ===== */
const ICONOS={
hoy:'<rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4M9 15l2 2 4-4"/>',
doc:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
docbusca:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4M14 3l5 5v3"/><circle cx="16" cy="16" r="3"/><path d="M21 21l-2.2-2.2"/>',
bandera:'<path d="M5 21V4M5 4h11l-1.5 4L16 12H5"/>',
formatos:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M12 11v6M9.5 14.5L12 17l2.5-2.5"/>',
menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
clip:'<path d="M20 11.5l-8.2 8.2a5 5 0 0 1-7-7l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7l-8.6 8.6a1.7 1.7 0 0 1-2.4-2.4l7.9-7.9"/>',
subir:'<path d="M12 16V4M7 9l5-5 5 5M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
x:'<path d="M6 6l12 12M18 6L6 18"/>',
der:'<path d="M9 5l7 7-7 7"/>',izq:'<path d="M15 5l-7 7 7 7"/>',abajo:'<path d="M5 9l7 7 7-7"/>',
mas:'<path d="M12 5v14M5 12h14"/>',
sol:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>',
luna:'<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
play:'<path d="M7 4.5v15l12-7.5z"/>',
bajar:'<path d="M12 4v12M7 11l5 5 5-5M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>',
chispa:'<path d="M12 3l1.8 4.7 4.7 1.8-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
alerta:'<path d="M12 3.5l9.5 16.5h-19z"/><path d="M12 10v4.5M12 17.2v.1"/>',
info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.7v.1"/>',
buscar:'<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
papelera:'<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13M10 11v6M14 11v6"/>',
enlace:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
lista:'<path d="M4 6.5l1.5 1.5L8 5.5M4 12.5L5.5 14 8 11.5M4 18.5L5.5 20 8 17.5M11 7h9M11 13h9M11 19h9"/>',
ojo:'<path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.8"/>',
deshacer:'<path d="M9 7L4 12l5 5M4 12h9a5.5 5.5 0 0 1 0 11"/>',
ayuda:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.3a2.6 2.6 0 0 1 5 .9c0 1.7-2.5 2.2-2.5 3.8M12 17.2v.1"/>',
camara:'<path d="M4 8.5h3l1.5-2.5h7L17 8.5h3a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>',
reloj:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
persona:'<circle cx="12" cy="8" r="4"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
escudo:'<path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6z"/><path d="M8.7 12l2.3 2.3 4.3-4.6"/>',
libro:'<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v16H6.5A1.5 1.5 0 0 0 5 20.5z"/><path d="M5 20.5A1.5 1.5 0 0 0 6.5 22H19v-3"/>',
barras:'<path d="M5 20V10M12 20V4M19 20v-7"/>',
lapiz:'<path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z"/>',
copiar:'<rect x="8.5" y="8.5" width="11" height="12" rx="2"/><path d="M15.5 8.5V6a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v9.5a2 2 0 0 0 2 2h2"/>',
cal:'<rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>',
na:'<circle cx="12" cy="12" r="8.5"/><path d="M6.2 6.2l11.6 11.6"/>',
mejora:'<path d="M4 17l6-6 4 4 6-7M15 8h5v5"/>',
nc:'<path d="M8 3h8l5 5v8l-5 5H8l-5-5V8z"/><path d="M12 8v5M12 16.2v.1"/>',
estrella:'<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9L3.5 9.7l5.9-.8z"/>',
carpeta:'<path d="M3.5 6.5a1.5 1.5 0 0 1 1.5-1.5h4l2 2.5h8a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5z"/>',
foco:'<circle cx="12" cy="12" r="3"/><path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15"/>',
columnas:'<rect x="3.5" y="4" width="17" height="16" rx="2"/><path d="M9.5 4v16M3.5 10h17"/>'
};
const I=(n,c)=>'<svg class="i'+(c?' '+c:'')+'" aria-hidden="true" focusable="false"><use href="#i-'+n+'"/></svg>';
function montarIconos(){
  if(document.getElementById('sprite'))return;
  const d=document.createElement('div');d.id='sprite';d.hidden=true;
  d.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute">'+Object.entries(ICONOS).map(([k,v])=>'<symbol id="i-'+k+'" viewBox="0 0 24 24">'+v+'</symbol>').join('')+'</svg>';
  document.body.prepend(d);
}
