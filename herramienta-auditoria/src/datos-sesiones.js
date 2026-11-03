/* ===== CRONOGRAMA (extraído de la matriz Excel) ===== */
const MJ='Melinton Jiménez', AM='Alan Montilla', MV='Madeline Javier';
const EQUIPO=[MJ,AM,MV];
const YO=AM;

/* ISO por día (año 2026 inferido: los días de la semana de la matriz coinciden con nov-2026) */
const DIAS={4:'2026-11-04',5:'2026-11-05',6:'2026-11-06',10:'2026-11-10',11:'2026-11-11',12:'2026-11-12',13:'2026-11-13',16:'2026-11-16',17:'2026-11-17',18:'2026-11-18'};
const DIA_NOMBRE={4:'Miércoles 4',5:'Jueves 5',6:'Viernes 6',10:'Martes 10',11:'Miércoles 11',12:'Jueves 12',13:'Viernes 13',16:'Lunes 16',17:'Martes 17',18:'Miércoles 18'};

/* cubre: tokens. '4.*' = todas las cláusulas 4.x · 'A.5.31-A.5.34' = rango · 'A.*' = todo el Anexo A (solo vía SoA) */
const SESIONES=[
{id:'apertura',nombre:'Reunión de Apertura',grupo:'Gestión de la auditoría',aud:['Todos los auditados'],ads:EQUIPO,dia:4,hora:'10:00-11:00',std:'N/A',cubre:[],guia:'apertura'},
{id:'planificacion',nombre:'Gestión de la Planificación y Proyectos',grupo:'Procesos estratégicos',aud:['VP Adm y Financiera','Gte Calidad y Cumplimiento'],ads:EQUIPO,dia:4,hora:'11:00-13:00',std:'4, 6',cubre:['4.*','6.*'],guia:'planificacion'},
{id:'sig',nombre:'Sistema Integrado de Gestión',grupo:'Procesos estratégicos',aud:['VP Adm y Financiera','Gte Calidad y Cumplimiento','Oficial Cumplimiento'],ads:EQUIPO,dia:4,hora:'14:30-17:00',std:'5, 7.5 / A.5.35, A.5.36',cubre:['5.*','7.5','A.5.35','A.5.36'],guia:'sig'},
{id:'equipo4',nombre:'Reunión Equipo Auditor (Hallazgos)',grupo:'Gestión de la auditoría',aud:['N/A'],ads:EQUIPO,dia:4,hora:'17:00-18:00',std:'N/A',cubre:[],guia:'equipo'},

{id:'comunicacion',nombre:'Gestión de Comunicación',grupo:'Procesos estratégicos',aud:['Gte Administrativo y RRHH'],ads:[MJ],dia:5,hora:'9:30-11:00',std:'7.4 / A.5.14',cubre:['7.4','A.5.14'],guia:null},
{id:'tecnologia',nombre:'Gestión Tecnología',grupo:'Procesos de apoyo',aud:['Gte Servicios TI','Soporte TI y Seguridad Informática'],ads:[AM,MV],dia:5,hora:'9:30-17:00',std:'7.1 / A.8.7, A.8.8, A.8.13, A.8.20, A.8.24',cubre:['7.1','A.8.7','A.8.8','A.8.13','A.8.20','A.8.24'],guia:'tecnologia'},
{id:'rrhh',nombre:'Gestión de Recursos (RRHH y Administrativo)',grupo:'Procesos de apoyo',aud:['Gte Administrativo y RRHH'],ads:[MJ],dia:5,hora:'14:00-17:00',std:'7.1, 7.2 / A.6.1 - A.6.7, A.5.19 - A.5.22',cubre:['7.1','7.2','A.6.1-A.6.7','A.5.19-A.5.22'],guia:null},
{id:'equipo5',nombre:'Reunión Equipo Auditor (Hallazgos)',grupo:'Gestión de la auditoría',aud:['N/A'],ads:EQUIPO,dia:5,hora:'17:00-18:00',std:'N/A',cubre:[],guia:'equipo'},

{id:'evaluacion',nombre:'Sistema Integrado de Gestión (Evaluación del Desempeño/Mejora)',grupo:'Procesos estratégicos',aud:['Gte Calidad y Cumplimiento','Oficial Cumplimiento'],ads:[MJ],dia:6,hora:'9:30-12:00',std:'9, 10',cubre:['9.*','10.*'],guia:null},
{id:'legal',nombre:'Gestión Legal',grupo:'Procesos de apoyo',aud:['Asesor Legal'],ads:[MJ,AM],dia:6,hora:'14:00-16:00',std:'4.2 / A.5.31, A.5.32, A.5.33, A.5.34',cubre:['4.2','A.5.31-A.5.34'],guia:'legal'},
{id:'equipo6',nombre:'Reunión Equipo Auditor (Hallazgos)',grupo:'Gestión de la auditoría',aud:['N/A'],ads:EQUIPO,dia:6,hora:'16:00-17:00',std:'N/A',cubre:[],guia:'equipo'},

{id:'desarrollo',nombre:'Gestión de Operaciones TI (Desarrollo de Software)',grupo:'Procesos clave',aud:['VP Operaciones y Servicios','Desarrollador TI'],ads:[AM,MV],dia:10,hora:'9:30-17:00',std:'8 / A.8.25, A.8.26, A.8.28, A.8.29, A.8.31',cubre:['8.*','A.8.25','A.8.26','A.8.28','A.8.29','A.8.31'],guia:'desarrollo'},
{id:'cce',nombre:'Gestión Comercial (Centro de Contacto y Experiencia)',grupo:'Procesos clave',aud:['Gte Comercial','Gestores CCE'],ads:[MJ],dia:10,hora:'9:30-11:30',std:'A.5.14',cubre:['A.5.14'],guia:null},
{id:'logistica',nombre:'Gestión de Recursos (Logística)',grupo:'Procesos de apoyo',aud:['Coordinadora de Logística'],ads:[MJ],dia:10,hora:'11:30-12:30',std:'7.1 / A.5.21',cubre:['7.1','A.5.21'],guia:null},
{id:'financiera',nombre:'Gestión de Recursos (Financiera)',grupo:'Procesos de apoyo',aud:['Gte de Contabilidad'],ads:[MJ],dia:10,hora:'14:00-15:30',std:'7.1',cubre:['7.1'],guia:null},
{id:'equipo10',nombre:'Reunión Equipo Auditor (Hallazgos)',grupo:'Gestión de la auditoría',aud:['N/A'],ads:EQUIPO,dia:10,hora:'17:00-18:00',std:'N/A',cubre:[],guia:'equipo'},

{id:'servicios_ti',nombre:'Gestión de Operaciones TI (Servicios y Productos TI)',grupo:'Procesos clave',aud:['Gte de Servicios TI','Ingeniero TI'],ads:[AM,MV],dia:11,hora:'9:30-17:00',std:'8 / A.5.29, A.5.30, A.8.16',cubre:['8.*','A.5.29','A.5.30','A.8.16'],guia:'servicios_ti'},
{id:'equipo11',nombre:'Reunión Equipo Auditor (Hallazgos)',grupo:'Gestión de la auditoría',aud:['N/A'],ads:EQUIPO,dia:11,hora:'17:00-18:00',std:'N/A',cubre:[],guia:'equipo'},

{id:'ventas',nombre:'Gestión Comercial (Ventas / Cliente)',grupo:'Procesos clave',aud:['Presidente','Gte Comercial','Gte Marca y Preventa','Vendedores','Coord. Desarrollo de Negocios','Soporte de Ventas','Asesor Comercial'],ads:EQUIPO,dia:12,hora:'9:30-12:00',std:'A.5.14, A.5.34',cubre:['A.5.14','A.5.34'],guia:'ventas'},
{id:'marcas',nombre:'Gestión Comercial (Marcas / Cliente)',grupo:'Procesos clave',aud:['Gte Marca y Preventa','Coordinador de Mercadeo'],ads:EQUIPO,dia:12,hora:'14:00-17:00',std:'A.5.14, A.5.34',cubre:['A.5.14','A.5.34'],guia:'marcas',nota:'En el Excel la celda del auditor está combinada con la de Ventas (D14:D15): se asume el mismo equipo. Confírmelo.'},
{id:'equipo12',nombre:'Reunión Equipo Auditor (Hallazgos)',grupo:'Gestión de la auditoría',aud:['N/A'],ads:EQUIPO,dia:12,hora:'17:00-18:00',std:'N/A',cubre:[],guia:'equipo'},

{id:'soa',nombre:'Controles Anexo / Matriz SoA',grupo:'Gestión de la auditoría',aud:['Todos los auditados'],ads:EQUIPO,dia:13,hora:'9:30-17:00',std:'6.1.3, Anexo A completo (A.5, A.6, A.7, A.8)',cubre:['6.1.3','A.*'],guia:'soa'},
{id:'equipo13',nombre:'Reunión Equipo Auditor (Hallazgos)',grupo:'Gestión de la auditoría',aud:['N/A'],ads:EQUIPO,dia:13,hora:'17:00-18:00',std:'N/A',cubre:[],guia:'equipo'},

{id:'pend16',nombre:'Cierre de Procesos Pendientes',grupo:'Gestión de la auditoría',aud:['Responsables de Procesos'],ads:EQUIPO,dia:16,hora:'9:30-12:00',std:'N/A',cubre:[],guia:'pendientes'},
{id:'informe16',nombre:'Preparación Informe Auditoría',grupo:'Gestión de la auditoría',aud:['N/A'],ads:EQUIPO,dia:16,hora:'14:00-18:00',std:'N/A',cubre:[],guia:'informe'},
{id:'pend17',nombre:'Cierre de Procesos Pendientes',grupo:'Gestión de la auditoría',aud:['Responsables de Procesos'],ads:EQUIPO,dia:17,hora:'9:30-12:00',std:'N/A',cubre:[],guia:'pendientes'},
{id:'informe17',nombre:'Preparación Informe Auditoría',grupo:'Gestión de la auditoría',aud:['N/A'],ads:EQUIPO,dia:17,hora:'14:00-18:00',std:'N/A',cubre:[],guia:'informe'},

{id:'equipo18',nombre:'Reunión Equipo Auditor (Hallazgos)',grupo:'Gestión de la auditoría',aud:['N/A'],ads:EQUIPO,dia:18,hora:'10:00-12:00',std:'N/A',cubre:[],guia:'equipo'},
{id:'revision',nombre:'Revisión por la Dirección (Entrevista)',grupo:'Procesos estratégicos',aud:['Presidente','VP Adm y Financiera'],ads:EQUIPO,dia:18,hora:'14:00-15:00',std:'5',cubre:['5.*'],guia:'revision'},
{id:'cierre',nombre:'Reunión de Cierre',grupo:'Gestión de la auditoría',aud:['Todos los auditados'],ads:EQUIPO,dia:18,hora:'16:00-18:00',std:'N/A',cubre:[],guia:'cierre'}
];

/* ===== REVISIÓN CRÍTICA DEL CRONOGRAMA (mis observaciones; verificarlas con el líder del equipo) ===== */
const REVISION=[
{sev:'alta',t:'Usted tiene asignados los tres procesos más técnicos',d:'Gestión Tecnología (jue 5), Desarrollo de Software (mar 10) y Servicios y Productos TI (mié 11) son tres jornadas completas de 9:30 a 17:00, y usted declara no tener formación en tecnología. Esto es un riesgo de competencia del auditor (ISO 19011, cl. 7; ISO 27001, 9.2: auditores objetivos y competentes).',a:'Confirme con el líder del equipo el rol de Madeline Javier. Acuerden quién verifica lo técnico (consolas, configuraciones) y quién evalúa el sistema (documentación, trazabilidad, riesgos, registros). Si Madeline tiene el perfil técnico, déjelo por escrito en el plan. Esta herramienta le ayuda a auditar con evidencia, pero no sustituye al criterio técnico donde se necesita.',s:['tecnologia','desarrollo','servicios_ti']},
{sev:'alta',t:'La evaluación de riesgos (6.1.2) y la SoA (6.1.3) quedan comprimidas',d:'Planificación tiene 2 horas (11:00-13:00) para cláusulas 4 y 6 de TRES normas a la vez. La evaluación de riesgos es el corazón de ISO 27001: de ella dependen la SoA y todos los controles. La SoA completa se audita recién el día 13.',a:'Dedique el máximo de esa sesión a 6.1.2 y 6.1.3 y regrese a los riesgos después de los días técnicos (viernes 13) para validar que lo visto en campo coincide con la matriz de riesgos.',s:['planificacion','soa']},
{sev:'alta',t:'62 de los 93 controles del Anexo A no tienen un proceso asignado',d:'Solo 31 controles se nombran en algún proceso. Los otros 62 dependen únicamente de la sesión SoA del día 13 (7,5 h, aprox. 5 minutos por control si se hiciera en serie). Sin asignar: gestión de incidentes (A.5.24-A.5.28), control de acceso (A.5.15-A.5.18), nube (A.5.23), notificación de eventos (A.6.8), todo el Anexo A.7 (seguridad física), y A.8.1-A.8.6, A.8.9-A.8.12, A.8.14-A.8.15, A.8.17-A.8.19, A.8.21-A.8.23, A.8.27, A.8.30, A.8.32-A.8.34.',a:'Esta herramienta añade preguntas sugeridas (marcadas «sugerido») dentro de los días técnicos para cubrir incidentes, accesos, cambios, logs y físico. Lleve el tema al líder del equipo: ¿el programa de auditoría cubre todo en este ciclo o se muestrea según riesgo? Debe estar documentado.',s:['soa','tecnologia','servicios_ti']},
{sev:'alta',t:'La Revisión por la Dirección está el último día, después de preparar el informe',d:'Se entrevista a Presidente y VP el miércoles 18 a las 14:00, pero el informe se prepara el 16 y 17 y la reunión de cierre es ese mismo día a las 16:00. Cualquier hallazgo de 9.3 aparece cuando ya no hay tiempo para validarlo. Además la matriz le asigna la cláusula «5» y no la 9.3, que es la que exige la revisión.',a:'Pida las actas de revisión por la dirección ANTES (documentalmente, durante la semana 1) y use la entrevista del 18 para confirmar. Proponga adelantarla.',s:['revision','informe16','informe17']},
{sev:'media',t:'La sesión de SoA convoca a «todos los auditados» durante 7,5 horas',d:'No es realista que todos estén disponibles todo el día y no hay pausa de almuerzo. El riesgo es que se convierta en una revisión superficial.',a:'Divida el Anexo A por responsables (físico → Administrativo, personas → RRHH, tecnológicos → TI) y pida confirmar horarios por bloque. La herramienta ordena los controles pendientes para priorizar.',s:['soa']},
{sev:'media',t:'Jornadas de 9:30 a 17:00 sin pausa y reunión de equipo hasta las 18:00',d:'Los días 5, 10, 11 y 13 son entrevistas de 7,5 h sin almuerzo; la calidad de la escucha cae y también la calidad del registro.',a:'Acuerde pausas de 45-60 min con los auditados. Registre en cuanto termine cada bloque; no espere a la noche.',s:['tecnologia','desarrollo','servicios_ti','soa']},
{sev:'media',t:'La cláusula 9.3 no está mapeada y 7.3 (concienciación) tampoco',d:'La revisión por la dirección figura como «5». La concienciación (7.3) no aparece en ningún proceso, solo A.6.3 vía RRHH.',a:'Use las «preguntas transversales» en cada entrevista (política, objetivos, incidentes, capacitación). Cubren 5.2, 7.3, A.6.3, A.6.8.',s:['revision','sig']},
{sev:'media',t:'Controles de proveedores asignados a RRHH/Administrativo',d:'A.5.19-A.5.22 están en Gestión de Recursos (RRHH), pero los proveedores críticos de seguridad son de TI (nube, hosting, desarrollo externo). Esa sesión la lleva Melinton sola, sin contexto técnico.',a:'Incluya preguntas de proveedores de TI en sus días técnicos (ya están en la guía) y comparta hallazgos en la reunión diaria.',s:['rrhh','servicios_ti']},
{sev:'media',t:'La sesión de RRHH cita A.6.1-A.6.7 y omite A.6.8',d:'A.6.8 es la notificación de eventos de seguridad, el control que sostiene toda la gestión de incidentes.',a:'Cúbralo con las preguntas transversales y avise a Melinton.',s:['rrhh']},
{sev:'baja',t:'Gestión Financiera solo cubre 7.1 y ningún control del Anexo A',d:'Finanzas maneja información crítica (A.5.33 protección de registros, A.5.3 segregación de funciones, accesos a banca en línea).',a:'Coordínese con Melinton para que valide segregación de funciones y accesos a sistemas financieros.',s:['financiera']},
{sev:'baja',t:'Comercial (Ventas): 7 roles en 2,5 horas',d:'Unos 20 minutos por perfil si se quiere ver a todos.',a:'Defina antes una muestra: Presidente, Gte Comercial, 2 vendedores al azar y Soporte de Ventas.',s:['ventas']}
];
