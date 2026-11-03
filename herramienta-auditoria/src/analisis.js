/* ===== MOTOR DE ANÁLISIS DE DOCUMENTOS (local, sin internet) =====
   Busca en el texto los elementos que la norma y las buenas prácticas esperan para cada tipo de documento,
   extrae el control documental (código, versión, fechas, aprobación), analiza tablas (responsables, fechas, estados)
   y redacta conclusiones, preguntas para el auditado y borradores de hallazgo.
   LÍMITE: es búsqueda de términos, no comprensión. Una ausencia detectada es un punto a verificar, nunca una no conformidad por sí sola. */

/* Texto sin tildes y en minúsculas, con la MISMA longitud que el original (para citar fragmentos exactos) */
const _MAPA={'á':'a','à':'a','ä':'a','â':'a','é':'e','è':'e','ë':'e','ê':'e','í':'i','ì':'i','ï':'i','î':'i','ó':'o','ò':'o','ö':'o','ô':'o','ú':'u','ù':'u','ü':'u','û':'u','ñ':'n'};
function plano(t){return String(t).normalize('NFC').toLowerCase().replace(/[áàäâéèëêíìïîóòöôúùüûñ]/g,c=>_MAPA[c]);}

/* ---------- Catálogo de tipos de documento ----------
   det: [expresión (sin tildes), peso]  ·  el: [id, elemento esperado, requisito, nivel(r=norma, b=buena práctica), expresión, pregunta al auditado] */
const TIPOS_DOC={
politica:{n:'Política de seguridad de la información',ref:'5.2 · A.5.1',formal:true,
 det:[['politica de seguridad de la informacion',9],['politica de seguridad',6],['politica',3],['compromiso de la direccion',2],['lineamientos',1]],
 el:[
 ['obj','Objetivos de seguridad o marco para establecerlos','5.2 b)','r','objetivos? de (la )?seguridad|marco (para|de) (establecer|fijar)|establecer (los )?objetivos','¿Dónde están los objetivos de seguridad que esta política enmarca?'],
 ['req','Compromiso de cumplir los requisitos aplicables','5.2 c)','r','(compromet|compromiso|asegur|garantiz).{0,90}(cumpl|satisf).{0,60}requisit|cumplimiento de (los )?requisitos|requisitos (legales|aplicables|contractuales)','¿Cómo se comprometen a cumplir los requisitos legales y contractuales aplicables?'],
 ['mej','Compromiso de mejora continua del SGSI','5.2 d)','r','mejora continua|mejorar continuamente|mejora permanente','¿Dónde se establece el compromiso de mejora continua?'],
 ['apr','Aprobación por la alta dirección','5.2 · A.5.1','r','aprobad[oa] por|aprobacion|alta direccion|direccion general|presidente|gerencia general|comite de seguridad','¿Quién aprobó la política y dónde consta?'],
 ['com','Comunicación / difusión al personal y partes interesadas','5.2 e) f)','r','comunic|difund|divulg|socializ|disponible (para|en)|conocimiento (del|de todo)','¿Cómo y cuándo se comunicó la política al personal y a las partes interesadas?'],
 ['rev','Revisión periódica o ante cambios significativos','A.5.1','r','revis.{0,70}(anual|periodic|intervalos|cambios significativos|planificad)|(anual|periodic|intervalos).{0,50}revis|vigencia|proxima revision','¿Con qué frecuencia se revisa y cuándo fue la última revisión?'],
 ['alc','Alcance y a quién aplica','5.2 · 4.3','b','alcance|aplica a|aplicable a|todo el personal|todos los colaboradores|empleados, contratistas','¿A quién y a qué procesos aplica?'],
 ['rol','Roles y responsabilidades','5.3 · A.5.2','b','responsabilidades?|oficial de seguridad|responsable de seguridad|comite de seguridad|\\bciso\\b|gerente de seguridad','¿Quién es responsable del SGSI?'],
 ['cia','Confidencialidad, integridad y disponibilidad','6.1.2','b','confidencialidad.{0,80}integridad.{0,80}disponibilidad|\\bcid\\b','¿Cómo se definen confidencialidad, integridad y disponibilidad en su contexto?'],
 ['dis','Consecuencias por incumplimiento','A.6.4','b','sancion|disciplin|medidas (disciplinarias|correctivas)|consecuencias','¿Qué consecuencias prevé la empresa por incumplir la política?']]},

procedimiento:{n:'Procedimiento documentado',ref:'7.5 · A.5.37',formal:true,
 det:[['procedimiento',4],['instructivo',2],['proceso de',1],['paso a paso',1]],
 el:[
 ['obj','Objetivo','7.5','b','objetivo|proposito|finalidad',''],
 ['alc','Alcance','7.5','b','alcance|aplica a|aplicable',''],
 ['res','Responsables y roles','A.5.37','r','responsable|responsabilidades|roles?|encargad|ejecuta','¿Quién ejecuta y quién supervisa este procedimiento?'],
 ['act','Descripción de las actividades (pasos o flujo)','A.5.37','r','actividades?|etapas?|pasos?|flujo|descripcion del proceso|desarrollo','¿Dónde se describe el paso a paso?'],
 ['reg','Registros o formatos que evidencian su ejecución','7.5.3','r','registros?|formatos?|evidencias?|bitacora|formulario|reporte','¿Qué registro demuestra que este procedimiento se ejecuta?'],
 ['cam','Control de cambios o historial de revisiones','7.5.2','b','control de cambios|historial|historico de (cambios|versiones)|registro de cambios|revision \\d',''],
 ['ref','Documentos de referencia','7.5','b','referencias?|documentos (relacionados|de referencia)|norma iso|iso/iec',''],
 ['ind','Indicadores o forma de medir su eficacia','9.1','b','indicadores?|kpi|metricas?|medicion|meta ','']]},

metodologia_riesgos:{tab:true,n:'Metodología / matriz de riesgos',ref:'6.1.2',formal:false,
 det:[['matriz de riesgos',5],['metodologia de riesgos',5],['gestion de riesgos',4],['evaluacion de riesgos',4],['apreciacion de riesgos',4],['riesgo',2],['amenaza',1],['vulnerabilidad',1]],
 el:[
 ['acep','Criterios de aceptación del riesgo','6.1.2 a)','r','criterios? de aceptacion|apetito de riesgo|nivel (de riesgo )?aceptable|umbral de aceptacion|tolerancia','¿Cuáles son los criterios de aceptación de riesgos y quién los aprobó?'],
 ['prob','Escala de probabilidad','6.1.2 a)','r','probabilidad|frecuencia de ocurrencia|likelihood','¿Cómo se valora la probabilidad?'],
 ['imp','Escala de impacto o consecuencia','6.1.2 d)','r','impacto|consecuencias?|severidad','¿Cómo se valora el impacto?'],
 ['act','Identificación de activos','6.1.2 c)','r','activos?|activo de informacion','¿Cómo se identifican los activos dentro del alcance?'],
 ['ame','Amenazas','6.1.2 c)','r','amenazas?','¿Qué amenazas se consideran?'],
 ['vul','Vulnerabilidades','6.1.2 c)','r','vulnerabilidad','¿Cómo se identifican las vulnerabilidades?'],
 ['due','Propietario o dueño del riesgo','6.1.2 c) 2)','r','propietario|due.o del riesgo|responsable del riesgo|owner','¿Quién es el dueño de cada riesgo?'],
 ['niv','Nivel o valoración del riesgo y priorización','6.1.2 e)','r','nivel de riesgo|valoracion|criticidad|priorizacion|riesgo (alto|medio|bajo)|extremo','¿Cómo se prioriza?'],
 ['cia','Pérdida de confidencialidad, integridad y disponibilidad','6.1.2 c) 1)','r','confidencialidad|integridad|disponibilidad','¿Se evalúa el efecto sobre confidencialidad, integridad y disponibilidad?'],
 ['tra','Opción de tratamiento (mitigar, aceptar, transferir, evitar)','6.1.3 a)','b','mitigar|reducir|transferir|evitar|aceptar|tratamiento','¿Qué decisión se tomó para cada riesgo?'],
 ['res','Riesgo residual','6.1.3 f)','b','riesgo residual|residual','¿Se calcula el riesgo residual y quién lo acepta?'],
 ['rev','Fecha o frecuencia de revisión de los riesgos','8.2','b','revision|actualizacion|periodic|anual','¿Cuándo se reevaluaron los riesgos por última vez?']]},

plan_tratamiento:{tab:true,n:'Plan de tratamiento de riesgos',ref:'6.1.3 · 8.3',formal:true,
 det:[['plan de tratamiento',6],['tratamiento de riesgos',5],['plan de accion',3],['riesgo residual',2]],
 el:[
 ['ctl','Controles a implementar (Anexo A u otros)','6.1.3 b)','r','control(es)?|anexo a|a\\.\\d\\.\\d','¿Qué controles se eligieron para cada riesgo?'],
 ['res','Responsable de cada acción','6.1.3 e) · 8.3','r','responsable|encargad|propietario|owner','¿Quién ejecuta cada acción?'],
 ['fec','Plazos o fechas de implementación','6.1.3 e)','r','fecha|plazo|vencimiento|cronograma|trimestre|semestre|mes de','¿Cuándo se implementa cada acción?'],
 ['est','Estado o avance','8.3','r','estado|avance|%|pendiente|en proceso|completad|implementad','¿Cómo se da seguimiento al avance?'],
 ['rec','Recursos necesarios','6.2 · 7.1','b','recursos?|presupuesto|inversion|costo','¿Se asignaron recursos?'],
 ['rre','Riesgo residual y su aceptación','6.1.3 f)','r','riesgo residual|aceptacion del riesgo|acepta(do|cion) (por|de)','¿Quién aceptó formalmente los riesgos residuales?'],
 ['apr','Aprobación del plan por los dueños del riesgo','6.1.3 f)','r','aprobad[oa]|aprobacion|firma|autoriz','¿Quién aprobó el plan?']]},

soa:{tab:true,n:'Declaración de Aplicabilidad (SoA)',ref:'6.1.3 d)',formal:true,
 det:[['declaracion de aplicabilidad',7],['soa',4],['statement of applicability',5],['aplicabilidad',3]],
 el:[
 ['apl','Indica si cada control aplica','6.1.3 d)','r','aplica|aplicable|no aplica|aplicabilidad','¿Dónde se indica si cada control aplica?'],
 ['jus','Justificación de inclusión o exclusión','6.1.3 d)','r','justificacion|motivo|razon|requerido para','¿Dónde se justifica cada decisión?'],
 ['imp','Estado de implementación (campo presente)','6.1.3 d)','r','implementad|estado de implementacion|implementacion','¿Dónde se registra si el control está implementado?'],
 ['evi','Referencia a la evidencia o documento','7.5','b','evidencia|documento de referencia|procedimiento','¿Con qué documento se respalda cada control?'],
 ['apr','Versión, fecha y aprobación','6.1.3 · 7.5.2','b','version|aprobad[oa]|fecha','¿Quién aprobó esta versión?']]},

revision_direccion:{n:'Revisión por la dirección (acta / informe)',ref:'9.3',formal:true,
 det:[['revision por la direccion',7],['acta de revision',5],['revision gerencial',4],['alta direccion',2]],
 el:[
 ['asi','Asistentes o participantes','9.3.1','b','asistentes|participantes|presentes|convocad','¿Quiénes participaron?'],
 ['fec','Fecha de la revisión','9.3.1','b','fecha',''],
 ['acc','Estado de las acciones de revisiones previas','9.3.2 a)','r','acciones? (de|previas|anteriores)|revisiones? (previas|anteriores)|seguimiento (de|a) (los )?acuerdos','¿Dónde se revisa el estado de las acciones anteriores?'],
 ['ctx','Cambios en cuestiones externas e internas','9.3.2 b)','r','cuestiones (externas|internas)|cambios (en el|del) contexto|contexto de la organizacion|factores (externos|internos)','¿Se revisaron los cambios del contexto?'],
 ['par','Necesidades y expectativas de las partes interesadas','9.3.2 c)','r','partes interesadas|necesidades y expectativas|expectativas','¿Se revisaron los cambios en las necesidades de las partes interesadas?'],
 ['des','Desempeño: no conformidades, seguimiento y medición','9.3.2 d)','r','no conformidades?|acciones correctivas|seguimiento y medicion|indicadores|resultados de (las )?auditorias?|cumplimiento de (los )?objetivos','¿Qué resultados de desempeño se presentaron?'],
 ['aud','Resultados de auditorías','9.3.2 d) 3)','r','auditorias?','¿Se presentaron los resultados de auditorías?'],
 ['obj','Cumplimiento de los objetivos de seguridad','9.3.2 d) 4)','r','objetivos de (la )?seguridad|cumplimiento de (los )?objetivos','¿Se revisó el cumplimiento de los objetivos?'],
 ['ret','Retroalimentación de partes interesadas','9.3.2 e)','r','retroalimentacion|quejas|satisfaccion|feedback','¿Se consideró la retroalimentación de las partes interesadas?'],
 ['rie','Resultados de la apreciación de riesgos y estado del plan de tratamiento','9.3.2 f)','r','apreciacion de riesgos|evaluacion de riesgos|plan de tratamiento|riesgos','¿Se presentó el estado de riesgos y del plan de tratamiento?'],
 ['mej','Oportunidades de mejora continua','9.3.2 g)','r','oportunidades? de mejora|mejora continua','¿Qué oportunidades de mejora se identificaron?'],
 ['dec','Decisiones o acuerdos (salidas)','9.3.3','r','decision|decisiones|acuerdos?|se acuerda|se aprueba|resoluciones?','¿Qué decisiones se tomaron?'],
 ['cam','Necesidad de cambios al SGSI o de recursos','9.3.3','r','cambios al sgsi|necesidad de cambios|recursos|presupuesto|asignacion','¿Se decidió algún cambio al SGSI o asignación de recursos?'],
 ['res','Responsables y fechas de las acciones acordadas','9.3.3','b','responsable|fecha limite|plazo|para el','¿Quién ejecuta cada acuerdo y para cuándo?']]},

informe_auditoria:{n:'Informe de auditoría interna',ref:'9.2',formal:true,
 det:[['informe de auditoria',7],['auditoria interna',5],['programa de auditoria',4],['hallazgos',2],['no conformidad',1]],
 el:[
 ['alc','Alcance y objetivos de la auditoría','9.2.2 b)','r','alcance|objetivos? de la auditoria','¿Cuál fue el alcance auditado?'],
 ['cri','Criterios de auditoría','9.2.2 b)','r','criterios?|iso/iec 27001|iso 27001|norma','¿Contra qué criterios se auditó?'],
 ['equ','Equipo auditor','9.2.2 c)','r','auditor(es)?|equipo auditor|auditor lider','¿Quién auditó y cómo se garantizó su imparcialidad?'],
 ['fec','Fechas de la auditoría','9.2.2','b','fecha|periodo|del \\d','¿Cuándo se realizó?'],
 ['hal','Hallazgos con su evidencia','9.2.2 d)','r','hallazgos?|no conformidad|observacion|oportunidad de mejora','¿Dónde constan los hallazgos?'],
 ['con','Conclusiones','9.2.2','r','conclusion|conclusiones','¿Cuál es la conclusión de la auditoría?'],
 ['inf','Informe a la dirección pertinente','9.2.2 d)','b','direccion|gerencia|distribucion','¿A quién se informó?'],
 ['acc','Plan de acciones correctivas','10.2','b','accion(es)? correctiva|plan de accion','¿Qué acciones se derivaron?']]},

plan_continuidad:{n:'Plan de continuidad / recuperación',ref:'A.5.29 · A.5.30',formal:true,
 det:[['plan de continuidad',6],['continuidad del negocio',5],['recuperacion ante desastres',5],['bcp',4],['drp',4],['bia',3],['rto',2],['rpo',2]],
 el:[
 ['bia','Análisis de impacto al negocio (BIA)','A.5.30','r','\\bbia\\b|analisis de impacto|impacto al negocio','¿Dónde está el análisis de impacto al negocio?'],
 ['rto','Tiempo objetivo de recuperación (RTO)','A.5.30','r','\\brto\\b|tiempo (objetivo|maximo) de recuperacion','¿Cuáles son los RTO de los sistemas críticos?'],
 ['rpo','Punto objetivo de recuperación (RPO)','A.5.30','r','\\brpo\\b|punto (objetivo|maximo) de recuperacion|perdida (maxima )?de datos','¿Cuáles son los RPO?'],
 ['seg','Seguridad de la información durante la interrupción','A.5.29','r','seguridad de la informacion durante|controles de seguridad (durante|en)|mantener (la )?seguridad','¿Qué controles de seguridad se mantienen durante una contingencia?'],
 ['rol','Roles y equipo de respuesta','A.5.29','r','equipo de (crisis|respuesta|continuidad)|roles|responsables?|comite de crisis','¿Quién activa y dirige el plan?'],
 ['pru','Pruebas o simulacros','A.5.30','r','pruebas?|simulacros?|ejercicios?','¿Cuándo fue la última prueba y qué resultado tuvo?'],
 ['rec','Procedimientos de recuperación','A.5.30','r','recuperacion|restauracion|procedimiento de (recuperacion|restauracion)','¿Dónde están los pasos de recuperación?'],
 ['com','Plan de comunicación en crisis','A.5.29','b','comunicacion|contactos|directorio','¿Quién comunica y a quién?'],
 ['rev','Revisión y actualización periódica','A.5.30','b','revision|actualizacion|periodic|anual','¿Cada cuánto se actualiza?']]},

incidentes:{n:'Gestión de incidentes de seguridad',ref:'A.5.24 – A.5.28 · A.6.8',formal:true,
 det:[['incidentes? de seguridad',6],['gestion de incidentes',6],['respuesta a incidentes',5],['incidente',3]],
 el:[
 ['rol','Roles y responsabilidades','A.5.24','r','roles|responsabilidades|equipo de respuesta|csirt|responsable','¿Quién gestiona los incidentes?'],
 ['rep','Canal para reportar eventos','A.6.8','r','reporte|reportar|notificacion|canal|mesa de ayuda|correo','¿Cómo reporta el personal un evento?'],
 ['cla','Criterios de clasificación o severidad','A.5.25','r','clasificacion|severidad|criticidad|prioridad|nivel (alto|medio|bajo)','¿Cómo se decide si un evento es incidente y su severidad?'],
 ['tie','Tiempos de respuesta','A.5.26','b','tiempos? de respuesta|plazo|horas|sla|minutos','¿Qué tiempos de respuesta se comprometen?'],
 ['res','Pasos de contención, erradicación y recuperación','A.5.26','r','contencion|erradicacion|recuperacion|respuesta','¿Cuáles son los pasos de respuesta?'],
 ['evi','Recolección y preservación de evidencia','A.5.28','r','evidencias?|cadena de custodia|forense|preserv','¿Cómo se preserva la evidencia?'],
 ['les','Lecciones aprendidas / análisis de causa','A.5.27','r','lecciones aprendidas|causa raiz|analisis de causa|post.?mortem','¿Cómo se aprende de los incidentes?'],
 ['aut','Contacto con autoridades','A.5.5','b','autoridades|reguladores|policia|csirt|notificar a','¿A qué autoridades se notifica y quién decide?'],
 ['reg','Registro de incidentes','A.5.26','r','registro de incidentes|bitacora|base de incidentes|log de incidentes','¿Dónde está el registro de incidentes?']]},

backup:{n:'Copias de seguridad (respaldo)',ref:'A.8.13',formal:true,
 det:[['copias? de seguridad',6],['respaldo',5],['backup',5],['restauracion',3]],
 el:[
 ['alc','Qué información y sistemas se respaldan','A.8.13','r','alcance|se respalda|informacion a respaldar|sistemas|bases de datos|servidores','¿Qué se respalda exactamente?'],
 ['fre','Frecuencia de los respaldos','A.8.13','r','frecuencia|diario|diaria|semanal|mensual|cada \\d+ (horas|dias)|incremental|completo','¿Con qué frecuencia?'],
 ['ret','Período de retención','A.8.13','r','retencion|conservacion|se conserva|dias de retencion|meses','¿Cuánto tiempo se conservan?'],
 ['off','Ubicación fuera del sitio o copia aislada','A.8.13','r','fuera del sitio|offsite|off-site|nube|sitio alterno|copia (aislada|offline|inmutable)|externa','¿Dónde se guarda una copia aislada?'],
 ['cif','Cifrado de las copias','A.8.24','b','cifr|encript|criptograf','¿Se cifran las copias?'],
 ['res','Pruebas de restauración','A.8.13','r','prueba(s)? de restauracion|restauracion (de prueba|periodica)|verificacion de (los )?respaldos|probar la restauracion','¿Cuándo fue la última prueba de restauración y cuál fue el resultado?'],
 ['mon','Monitoreo de fallos y reintentos','A.8.16','b','monitoreo|alertas?|fallos?|reintentos?|reporte de ejecucion','¿Quién revisa los fallos de respaldo?'],
 ['rpo','Relación con RPO / RTO','A.5.30','b','\\brpo\\b|\\brto\\b','¿La frecuencia cumple el RPO?'],
 ['rsp','Responsables','A.8.13','b','responsable|administrador|encargad','¿Quién ejecuta y revisa los respaldos?']]},

control_acceso:{n:'Control de acceso y gestión de identidades',ref:'A.5.15 – A.5.18 · A.8.2 · A.8.5',formal:true,
 det:[['control de acceso',6],['gestion de accesos',6],['gestion de identidades',5],['accesos',3],['privilegios',2]],
 el:[
 ['alt','Proceso de alta (solicitud y aprobación de accesos)','A.5.16 · A.5.18','r','alta de|solicitud de acceso|aprobacion|autorizacion de acceso|creacion de (usuarios|cuentas)','¿Quién aprueba un acceso nuevo?'],
 ['baj','Baja o retiro de accesos (salidas y cambios de puesto)','A.5.16 · A.6.5','r','baja de|retiro de acceso|desvinculacion|terminacion|cambio de puesto|salida','¿Cómo y en cuánto tiempo se retiran los accesos?'],
 ['rev','Revisión periódica de derechos de acceso','A.5.18','r','revision (periodica )?de (derechos|accesos|permisos|usuarios)|recertificacion|periodic','¿Cuándo fue la última revisión de accesos?'],
 ['pri','Gestión de cuentas privilegiadas / administradores','A.8.2','r','privilegiad|administrador|cuentas? de (admin|servicio)|acceso privilegiado','¿Cómo se controlan los administradores?'],
 ['mfa','Autenticación multifactor','A.8.5','r','mfa|multifactor|doble factor|segundo factor|2fa','¿Dónde se exige doble factor?'],
 ['con','Reglas de contraseñas','A.5.17','r','contrasena|password|clave|complejidad|longitud minima','¿Qué reglas de contraseñas se aplican?'],
 ['min','Mínimo privilegio / necesidad de saber','A.5.15 · A.8.3','b','minimo privilegio|necesidad de saber|need.to.know|segun (su )?rol|perfiles? de acceso|rbac','¿Se aplican perfiles por rol?'],
 ['gen','Prohibición de cuentas genéricas o compartidas','A.5.16','b','genericas?|compartidas?|cuenta unica|identificacion unica','¿Existen cuentas compartidas?'],
 ['seg','Segregación de funciones','A.5.3','b','segregacion|separacion de funciones|conflicto de intereses','¿Qué funciones se segregan?']]},

proveedores:{n:'Gestión de proveedores',ref:'A.5.19 – A.5.23',formal:true,
 det:[['proveedores',5],['gestion de proveedores',6],['terceros',3],['subcontrat',3]],
 el:[
 ['cri','Criterios de selección y evaluación de proveedores','A.5.19','r','evaluacion de proveedores|criterios de (seleccion|evaluacion)|seleccion de proveedores|homologacion','¿Cómo se evalúa y selecciona a los proveedores?'],
 ['rie','Evaluación de riesgos de seguridad del proveedor','A.5.19','r','riesgos? (del|de los) proveedor|evaluacion de riesgos|criticidad del proveedor','¿Se evalúan los riesgos de seguridad por proveedor?'],
 ['acu','Requisitos de seguridad en los acuerdos/contratos','A.5.20','r','acuerdos?|contratos?|clausulas?|requisitos de seguridad','¿Qué cláusulas de seguridad llevan los contratos?'],
 ['nda','Confidencialidad / NDA','A.5.20 · A.6.6','r','confidencialidad|no divulgacion|nda','¿Hay NDA con cada proveedor?'],
 ['sla','Niveles de servicio (SLA)','A.5.22','b','sla|niveles? de servicio|acuerdo de nivel','¿Qué SLA se acuerdan?'],
 ['seg','Seguimiento y revisión periódica del servicio','A.5.22','r','seguimiento|revision periodica|monitoreo del proveedor|desempeno del proveedor|reevaluacion','¿Cuándo se revisó por última vez cada proveedor crítico?'],
 ['nub','Servicios en la nube','A.5.23','b','nube|cloud|saas|iaas|paas|hosting','¿Cómo se gestiona el uso de la nube?'],
 ['sal','Terminación del servicio / salida','A.5.23','b','terminacion|salida|devolucion|eliminacion de datos|fin del contrato','¿Qué ocurre con los datos al terminar?'],
 ['sub','Subcontratación en cadena (cadena de suministro TIC)','A.5.21','b','subcontrat|cadena de suministro|subproveedores?','¿Se controla a los subcontratistas del proveedor?']]},

desarrollo_seguro:{n:'Desarrollo seguro de software',ref:'A.8.25 – A.8.31',formal:true,
 det:[['desarrollo seguro',6],['desarrollo de software',5],['ciclo de vida de desarrollo',6],['sdlc',5],['codificacion segura',4],['pruebas de software',3],['desarrollo de solucion',4]],
 el:[
 ['req','Requisitos de seguridad en el análisis','A.8.26','r','requisitos de seguridad|requerimientos de seguridad|analisis de requisitos','¿Dónde se definen los requisitos de seguridad de cada proyecto?'],
 ['arq','Principios de arquitectura / ingeniería segura','A.8.27','b','arquitectura segura|ingenieria segura|minimo privilegio|defensa en profundidad','¿Qué principios de arquitectura se aplican?'],
 ['cod','Estándares de codificación segura','A.8.28','r','codificacion segura|estandares? de codificacion|buenas practicas de (codigo|programacion)|owasp','¿Qué estándares de codificación segura se aplican?'],
 ['rev','Revisión de código entre pares','A.8.28','r','revision de codigo|code review|pull request|revision (entre pares|por pares)','¿Quién revisa el código antes de integrarlo?'],
 ['pru','Pruebas de seguridad y de aceptación','A.8.29','r','pruebas? de seguridad|pruebas? de aceptacion|uat|pruebas funcionales|pentest|sast|dast','¿Qué pruebas se hacen antes de liberar?'],
 ['ent','Separación de entornos (desarrollo, pruebas, producción)','A.8.31','r','entornos?|ambientes?|desarrollo,? (pruebas|test)|produccion','¿Están separados los entornos y sus accesos?'],
 ['cam','Gestión de cambios y despliegue','A.8.32','r','gestion de cambios|control de cambios|despliegue|rollback|paso a produccion|liberacion','¿Cómo se controlan los cambios y despliegues?'],
 ['dat','Protección de datos de prueba','A.8.33','b','datos de prueba|datos sinteticos|enmascar|anonimiz','¿Se usan datos reales en pruebas?'],
 ['rep','Control de acceso al código fuente','A.8.4','b','repositorio|codigo fuente|git|control de versiones','¿Quién accede al repositorio?'],
 ['vul','Gestión de vulnerabilidades y dependencias','A.8.8','b','vulnerabilidad|dependencias|librerias|componentes de terceros|parche','¿Cómo se gestionan las vulnerabilidades de librerías?'],
 ['sub','Desarrollo subcontratado','A.8.30','b','subcontrat|externaliz|terceros? (de|para) desarrollo|outsourc','¿Se subcontrata desarrollo y cómo se supervisa?']]},

capacitacion:{n:'Capacitación y concienciación',ref:'A.6.3 · 7.2 · 7.3',formal:false,
 det:[['plan (anual )?de capacitacion',6],['capacitacion',4],['concienciacion',5],['formacion',3],['induccion',3],['phishing',3]],
 el:[
 ['pla','Plan o programa con fechas','A.6.3','r','plan (anual )?de capacitacion|programa de capacitacion|cronograma|calendario','¿Dónde está el plan anual de capacitación?'],
 ['con','Contenido sobre seguridad de la información','A.6.3 · 7.3','r','seguridad de la informacion|politica de seguridad|phishing|contrasena|ingenieria social','¿Qué temas de seguridad cubre?'],
 ['asi','Registro de asistencia','7.2 d)','r','asistencia|asistentes|participantes|firma|lista de','¿Dónde consta quién se capacitó?'],
 ['eva','Evaluación de la eficacia','7.2 c)','b','evaluacion|examen|prueba de conocimiento|resultado|eficacia','¿Cómo se mide si la capacitación fue eficaz?'],
 ['sim','Simulacros de phishing u otras campañas','A.6.3','b','phishing|simulacro|campana','¿Se hacen simulacros y con qué resultados?'],
 ['per','Periodicidad (anual o ante cambios)','A.6.3','b','anual|periodic|semestral|trimestral|ingreso|induccion','¿Con qué frecuencia?'],
 ['obl','Alcance a nuevo personal y terceros','A.6.3','b','nuevo personal|ingreso|induccion|contratistas|terceros','¿Se capacita al personal nuevo y a terceros?']]},

acuerdo:{n:'Contrato / acuerdo de confidencialidad (NDA)',ref:'A.5.20 · A.6.6',formal:false,
 det:[['acuerdo de confidencialidad',7],['no divulgacion',6],['nda',4],['contrato de',3],['clausula',2]],
 el:[
 ['par','Identificación de las partes','A.6.6','b','entre|por una parte|parte reveladora|parte receptora|cliente|proveedor',''],
 ['def','Definición de la información confidencial','A.6.6','r','informacion confidencial|se entiende por|definicion','¿Qué se considera información confidencial?'],
 ['obl','Obligaciones de protección','A.6.6','r','obligaci|se compromete|deber de|proteger','¿Qué obligaciones asumen las partes?'],
 ['vig','Vigencia o duración','A.6.6','r','vigencia|duracion|plazo|a partir de|anos','¿Cuánto dura la obligación?'],
 ['dev','Devolución o destrucción de la información','A.6.6','b','devolucion|destruccion|eliminacion','¿Qué pasa con la información al terminar?'],
 ['inc','Notificación de incidentes o brechas','A.5.20','b','incidentes?|brecha|notificar|notificacion','¿Debe notificar incidentes?'],
 ['aud','Derecho de auditoría','A.5.20','b','auditar|auditoria|derecho de (revision|inspeccion)','¿Existe derecho a auditar?'],
 ['dat','Protección de datos personales (Ley 172-13)','A.5.34','b','datos personales|172-13|habeas data','¿Se contemplan los datos personales?'],
 ['san','Consecuencias por incumplimiento','A.6.6','b','sancion|penalidad|danos y perjuicios|responsabilidad','¿Qué consecuencias hay por incumplir?']]},

datos_personales:{n:'Protección de datos personales',ref:'A.5.34',formal:true,
 det:[['datos personales',7],['proteccion de datos',6],['172-13',6],['privacidad',4],['habeas data',4]],
 el:[
 ['fin','Finalidad del tratamiento','A.5.34','r','finalidad|con el fin de|proposito del tratamiento','¿Para qué se tratan los datos?'],
 ['bas','Consentimiento o base legal','A.5.34 · A.5.31','r','consentimiento|base legal|autorizacion del titular|habilitacion','¿Cómo se obtiene el consentimiento?'],
 ['der','Derechos de los titulares (acceso, rectificación, actualización, supresión)','A.5.34','r','acceso|rectificacion|actualizacion|supresion|cancelacion|oposicion|derechos? (de los )?titulares','¿Cómo se atienden las solicitudes de los titulares?'],
 ['res','Responsable del tratamiento','A.5.34','r','responsable del (tratamiento|banco de datos|archivo)|oficial de (privacidad|proteccion)','¿Quién es el responsable?'],
 ['ret','Plazos de conservación','A.5.33','b','conservacion|retencion|plazo de|eliminacion','¿Cuánto tiempo se conservan los datos?'],
 ['tra','Transferencias a terceros','A.5.14','b','transferencia|terceros|cesion|encargado','¿Se comparten con terceros?'],
 ['bre','Gestión de brechas / incidentes con datos personales','A.5.26','b','brecha|violacion de seguridad|incidente|notificacion','¿Cómo se gestiona una brecha?'],
 ['ley','Referencia a la Ley 172-13','A.5.31','b','172-13|ley (no\\.? )?172','¿Se identifica la ley aplicable?']]},

objetivos:{tab:true,n:'Objetivos e indicadores de seguridad',ref:'6.2 · 9.1',formal:false,
 det:[['objetivos de seguridad',6],['indicadores',4],['objetivos',3],['kpi',3],['metas',2]],
 el:[
 ['obj','Objetivos definidos','6.2','r','objetivos?','¿Cuáles son los objetivos de seguridad?'],
 ['ind','Indicador o forma de medición','6.2 d) · 9.1','r','indicador|formula|medicion|kpi|metrica','¿Cómo se mide cada objetivo?'],
 ['met','Meta numérica','6.2','r','meta|objetivo cuantitativo|\\d+ ?%|<=|>=','¿Cuál es la meta de cada uno?'],
 ['res','Responsable','6.2 e)','r','responsable|dueno|propietario','¿Quién responde por cada objetivo?'],
 ['pla','Plazo o periodicidad','6.2 f)','r','plazo|fecha|periodicidad|mensual|trimestral|anual','¿Cuándo se mide y cuándo vence?'],
 ['rec','Recursos','6.2 d)','b','recursos?|presupuesto','¿Qué recursos se asignan?'],
 ['res2','Resultados recientes','9.1','b','resultado|real|logrado|cumplimiento|avance','¿Cuáles son los resultados actuales?']]},

inventario:{tab:true,n:'Inventario de activos',ref:'A.5.9 · A.5.12',formal:false,
 det:[['inventario de activos',7],['activos de informacion',6],['inventario',4],['cmdb',4],['activos',2]],
 el:[
 ['pro','Propietario del activo','A.5.9','r','propietario|due.o|responsable|custodio','¿Quién es el propietario de cada activo?'],
 ['cla','Clasificación de la información','A.5.12','r','clasificacion|confidencial|uso interno|publico|restringido','¿Cómo se clasifican los activos?'],
 ['ubi','Ubicación','A.5.9','b','ubicacion|localizacion|sede|sitio|ambiente','¿Dónde están los activos?'],
 ['tip','Tipo de activo','A.5.9','b','tipo|categoria|equipo|software|servidor|base de datos','¿Qué tipos de activos se registran?'],
 ['cri','Criticidad o valor','A.5.9 · 6.1.2','b','criticidad|valor|impacto|importancia','¿Cómo se determina la criticidad?'],
 ['act','Fecha de actualización','A.5.9','b','actualizacion|fecha|ultima revision','¿Cuándo se actualizó por última vez?']]},

legal:{tab:true,n:'Matriz de requisitos legales y contractuales',ref:'A.5.31',formal:false,
 det:[['requisitos legales',7],['matriz legal',7],['cumplimiento legal',5],['marco legal',4],['ley ',2]],
 el:[
 ['ley','Leyes y normas aplicables identificadas','A.5.31','r','ley|decreto|norma|reglamento|resolucion','¿Qué leyes aplican y quién las identificó?'],
 ['req','Requisito específico asociado','A.5.31','r','requisito|articulo|art\\.|obligacion','¿Qué exige cada norma?'],
 ['res','Responsable del cumplimiento','A.5.31','r','responsable|area','¿Quién responde del cumplimiento?'],
 ['evi','Evaluación o evidencia de cumplimiento','A.5.31','r','evidencia|cumplimiento|cumple|evaluacion','¿Cómo se verifica el cumplimiento?'],
 ['con','Requisitos contractuales de clientes','4.2 · A.5.31','b','contractual|clientes?|contrato','¿Se incluyen los requisitos de los clientes?'],
 ['rev','Fecha de revisión','A.5.31','b','revision|actualizacion|fecha','¿Cuándo se revisó?'],
 ['172','Ley 172-13 de protección de datos personales','A.5.34','b','172-13|ley (no\\.? )?172','¿Está incluida la Ley 172-13?']]},

registro_incidentes:{tab:true,n:'Registro de incidentes',ref:'A.5.26 · A.5.27',formal:false,
 det:[['registro de incidentes',9],['bitacora de incidentes',8],['incidentes',3]],
 el:[
 ['fec','Fecha del incidente','A.5.26','r','fecha','¿Cuándo ocurrió cada incidente?'],
 ['des','Descripción','A.5.26','r','descripcion|detalle|incidente','¿Qué ocurrió?'],
 ['sev','Clasificación o severidad','A.5.25','r','severidad|clasificacion|criticidad|prioridad|impacto','¿Cómo se clasificó?'],
 ['res','Responsable de la gestión','A.5.24','r','responsable|asignado|atendido por','¿Quién gestionó cada incidente?'],
 ['est','Estado','A.5.26','r','estado|status|cerrad|abiert','¿Cuál es el estado actual?'],
 ['cau','Causa o análisis','A.5.27','r','causa|analisis|origen|raiz','¿Se analizó la causa raíz?'],
 ['acc','Acciones tomadas o lecciones aprendidas','A.5.27','b','accion|solucion|lecciones|resolucion|contencion','¿Qué se hizo y qué se aprendió?']]},

otro:{n:'Documento (tipo no identificado)',ref:'',formal:false,det:[],el:[]}
};

/* Control documental que se busca en todo documento formal (7.5.2) */
const RX_COD=/(?:c[oó]digo|cod\.|doc(?:umento)?\.?\s*(?:no|n[ºo°])\.?)\s*[:\-]?\s*([a-z0-9][a-z0-9\-_/.]{2,24})/i;
const RX_COD2=/\b([a-z]{2,5}(?:-[a-z0-9]{2,8}){1,3})\b/;
const RX_VER=/(?:versi[oó]n|revisi[oó]n|rev\.?|vers\.?)\s*[:\-]?\s*(v?\s?\d+(?:\.\d+){0,2})/i;
const RX_VER2=/\bv\s?(\d+\.\d+(?:\.\d+)?)\b/i;

/* Palabras de contenido por requisito: qué trata el documento (no si cumple) */
const KW_REQ=[
['4.1','Contexto de la organización','contexto de la organizacion|cuestiones (externas|internas)|foda|pestel'],
['4.2','Partes interesadas','partes interesadas|necesidades y expectativas'],
['4.3','Alcance del SGSI','alcance del (sgsi|sistema de gestion)'],
['5.2','Política de seguridad','politica de seguridad'],
['6.1.2','Evaluación de riesgos','evaluacion de riesgos|apreciacion de riesgos|criterios de aceptacion|matriz de riesgos'],
['6.1.3','Tratamiento de riesgos / SoA','tratamiento de riesgos|declaracion de aplicabilidad|riesgo residual'],
['6.2','Objetivos de seguridad','objetivos de (la )?seguridad'],
['7.2','Competencia','competencia del personal|perfil de puesto'],
['7.3','Concienciación','concienciacion|toma de conciencia'],
['7.5','Información documentada','control de documentos|informacion documentada|listado maestro'],
['9.1','Seguimiento y medición','indicadores|seguimiento y medicion|kpi'],
['9.2','Auditoría interna','auditoria interna|programa de auditoria'],
['9.3','Revisión por la dirección','revision por la direccion'],
['10.2','No conformidades y acciones correctivas','no conformidad|accion correctiva|causa raiz'],
['A.5.9','Inventario de activos','inventario de activos|activos de informacion'],
['A.5.12','Clasificación de la información','clasificacion de la informacion|etiquetado'],
['A.5.14','Transferencia de información','transferencia de informacion|envio de informacion'],
['A.5.15','Control de acceso','control de acceso|privilegio|minimo privilegio'],
['A.5.19','Proveedores','proveedores?|terceros'],
['A.5.23','Servicios en la nube','nube|cloud|saas'],
['A.5.24','Gestión de incidentes','incidentes? de seguridad|gestion de incidentes'],
['A.5.29','Continuidad','continuidad|\\brto\\b|\\brpo\\b|recuperacion ante desastres'],
['A.5.31','Requisitos legales','requisitos legales|marco legal|ley \\d'],
['A.5.34','Datos personales','datos personales|172-13|habeas data|privacidad'],
['A.6.1','Selección de personal','verificacion de antecedentes|seleccion de personal|referencias laborales'],
['A.6.3','Capacitación y concienciación','capacitacion|concienciacion|phishing'],
['A.6.6','Confidencialidad / NDA','acuerdo de confidencialidad|no divulgacion|nda'],
['A.6.7','Trabajo remoto','trabajo remoto|teletrabajo|vpn'],
['A.7.1','Seguridad física','acceso fisico|perimetro|camaras|centro de datos|data center|control de visitas'],
['A.8.1','Dispositivos de usuario','dispositivos moviles|laptops?|byod|equipos de usuario'],
['A.8.5','Autenticación segura','autenticacion|multifactor|doble factor|mfa'],
['A.8.7','Protección contra malware','malware|antivirus|\\bedr\\b|codigo malicioso'],
['A.8.8','Vulnerabilidades técnicas','vulnerabilidades?|parches?|escaneo de vulnerabilidades|pentest'],
['A.8.13','Copias de seguridad','copias? de seguridad|respaldo|backup|restauracion'],
['A.8.15','Registro de eventos (logs)','registro de eventos|\\blogs?\\b|bitacora de eventos'],
['A.8.16','Monitoreo','monitoreo|monitorizacion|siem'],
['A.8.20','Seguridad de redes','firewall|cortafuegos|segmentacion de red|seguridad de redes'],
['A.8.24','Criptografía','cifrad|criptograf|gestion de claves|certificados'],
['A.8.25','Desarrollo seguro','desarrollo seguro|ciclo de vida de desarrollo|codificacion segura|revision de codigo'],
['A.8.32','Gestión de cambios','gestion de cambios|control de cambios|rollback']
];

/* ---------- Fechas ---------- */
const _MES={enero:1,febrero:2,marzo:3,abril:4,mayo:5,junio:6,julio:7,agosto:8,septiembre:9,setiembre:9,octubre:10,noviembre:11,diciembre:12,ene:1,feb:2,mar:3,abr:4,may:5,jun:6,jul:7,ago:8,sep:9,sept:9,set:9,oct:10,nov:11,dic:12};
function _fechaOk(d,m,y){if(y<100)y+=2000;if(y<1995||y>2100||m<1||m>12||d<1||d>31)return null;const f=new Date(y,m-1,d);return f.getMonth()===m-1?f:null;}
function fechasEn(texto){
  const p=plano(String(texto).replace(/\s+/g,' ')),out=[];
  const ctx=i=>{const c=p.slice(Math.max(0,i-45),i);return /aprob/.test(c)?'aprobacion':/emisi|vigencia|entrada en vigor|publicaci/.test(c)?'emision':/revis|actualiz/.test(c)?'revision':/elabor|creaci/.test(c)?'elaboracion':'';};
  let m;
  const r1=/\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4}|\d{2})\b/g;
  while((m=r1.exec(p))){const f=_fechaOk(+m[1],+m[2],+m[3]);if(f)out.push({f,i:m.index,len:m[0].length,ctx:ctx(m.index)});}
  const r2=/\b(\d{4})-(\d{2})-(\d{2})\b/g;
  while((m=r2.exec(p))){const f=_fechaOk(+m[3],+m[2],+m[1]);if(f)out.push({f,i:m.index,len:m[0].length,ctx:ctx(m.index)});}
  const r3=/\b(\d{1,2})\s+de\s+([a-z]+)\s+(?:de|del)\s+(\d{4})\b/g;
  while((m=r3.exec(p))){const mm=_MES[m[2]];if(mm){const f=_fechaOk(+m[1],mm,+m[3]);if(f)out.push({f,i:m.index,len:m[0].length,ctx:ctx(m.index)});}}
  const r4=/\b([a-z]{3,10})\s+(?:de\s+|del\s+)?(20\d{2})\b/g;
  while((m=r4.exec(p))){const mm=_MES[m[1]];if(mm&&m[1].length>3){const f=_fechaOk(1,mm,+m[2]);if(f&&!out.some(o=>Math.abs(o.i-m.index)<10))out.push({f,i:m.index,len:m[0].length,ctx:ctx(m.index),mes:true});}}
  return out.sort((a,b)=>a.i-b.i);
}
const fmtF=f=>f?String(f.getDate()).padStart(2,'0')+'/'+String(f.getMonth()+1).padStart(2,'0')+'/'+f.getFullYear():'';
const mesesEntre=(a,b)=>Math.round((b-a)/(30.44*86400000));
function snip(orig,i,len,pad){const a=Math.max(0,i-(pad||70)),b=Math.min(orig.length,i+len+(pad||70));return (a>0?'…':'')+orig.slice(a,b).replace(/\s+/g,' ').trim()+(b<orig.length?'…':'');}

/* ---------- Tipo de documento ---------- */
function detectarTipo(nombre,texto,esTabla){
  const pn=plano(nombre).replace(/\.[a-z0-9]+$/,'').replace(/[_\-.]+/g,' ');
  const pt=plano(String(texto).replace(/^\[(encabezado|pie)\][^\n]*\n?/gm,'')).replace(/\s+/g,' ');
  const cab=pt.slice(0,1500),titulo=pt.slice(0,220);
  const pts=[];
  Object.entries(TIPOS_DOC).forEach(([k,t])=>{
    if(k==='otro')return;let s=0;
    t.det.forEach(([rx,w])=>{
      const r=new RegExp(rx,'g');
      if(r.test(pn))s+=w*2.5;
      if(new RegExp(rx).test(titulo))s+=w*3;
      const c=(cab.match(new RegExp(rx,'g'))||[]).length;if(c)s+=w*1;
      const n=(pt.match(new RegExp(rx,'g'))||[]).length;s+=Math.min(n,8)*w*0.15;
    });
    if(esTabla)s*=t.tab?1.35:0.6;else if(t.tab)s*=0.85;
    pts.push([k,s]);
  });
  pts.sort((a,b)=>b[1]-a[1]);
  const [k,s]=pts[0]||['otro',0];const s2=(pts[1]||[0,0])[1];
  if(s<4)return {tipo:'otro',conf:'baja',alt:pts.slice(0,3).filter(x=>x[1]>1).map(x=>x[0])};
  return {tipo:k,conf:s>=16&&s>s2*1.4?'alta':s>=8&&s>s2*1.15?'media':'baja',alt:pts.slice(1,4).filter(x=>x[1]>3).map(x=>x[0])};
}

/* ---------- Control documental ---------- */
function controlDoc(nombre,texto,meta,hoy){
  const orig=String(texto).normalize('NFC'),p=plano(orig),head=orig.slice(0,3000);
  const cab=plano(head);
  const o={codigo:'',version:'',fechas:[],fechaRef:null,fechaRefTipo:'',elaboro:'',reviso:'',aprobo:'',borrador:false,placeholders:[],cambiosPend:0,comentarios:0,futura:false,antiguedadMeses:null,historial:false};
  let m=head.match(RX_COD);if(m)o.codigo=m[1].replace(/[.,;]+$/,'');
  if(!o.codigo){m=RX_COD2.exec(plano(nombre).replace(/\.[a-z0-9]+$/,'').toUpperCase().replace(/[_ ]/g,'-'));const f=String(nombre).match(/\b([A-Z]{2,5}(?:-[A-Z0-9]{2,8}){1,3})\b/);if(f)o.codigo=f[1];else{const t=head.match(/\b([A-Z]{2,5}(?:-[A-Z0-9]{2,8}){1,3})\b/);if(t)o.codigo=t[1];}}
  m=head.match(RX_VER)||plano(head).match(RX_VER2);if(m)o.version=m[1].replace(/\s/g,'');
  o.fechas=fechasEn(orig);
  const pr=['aprobacion','revision','emision','elaboracion'];
  for(const k of pr){const c=o.fechas.filter(x=>x.ctx===k);if(c.length){c.sort((a,b)=>b.f-a.f);o.fechaRef=c[0].f;o.fechaRefTipo=k;break;}}
  if(!o.fechaRef){const c=o.fechas.filter(x=>x.f<=new Date(hoy.getTime()+31*86400000));if(c.length){c.sort((a,b)=>b.f-a.f);o.fechaRef=c[0].f;o.fechaRefTipo='mas reciente';}}
  if(!o.fechaRef&&meta&&meta.modificado){o.fechaRef=new Date(meta.modificado);o.fechaRefTipo='metadatos del archivo';}
  if(o.fechaRef)o.antiguedadMeses=mesesEntre(o.fechaRef,hoy);
  o.futura=o.fechas.some(x=>x.f>new Date(hoy.getTime()+31*86400000));
  const re=(l)=>{const r=head.match(new RegExp('(?:'+l+')\\s*(?:por)?\\s*[:\\-]\\s*([^\\n|]{3,60})','i'));return r&&r[1]?r[1].trim():'';};
  o.elaboro=re('elabor(?:ado|o|ó)');o.reviso=re('revis(?:ado|o|ó)');o.aprobo=re('aprobad[oa]|aprob(?:o|ó)');
  if(!o.aprobo&&/aprobad[oa] por/i.test(head)){const x=head.match(/aprobad[oa] por\s*[:\-]?\s*([^\n|]{3,60})/i);if(x)o.aprobo=x[1].trim();}
  o.borrador=/\b(borrador|draft|version preliminar|en elaboracion)\b/.test(cab);
  const ph=[];[/\bx{3,}\b/g,/_{4,}/g,/\blorem ipsum\b/g,/por definir|pendiente de definir|\btbd\b|completar aqui|<insertar|\[(?:nombre|fecha|completar|insertar|xxx)[^\]]{0,20}\]/g].forEach(r=>{let k;while((k=r.exec(p))&&ph.length<6)ph.push(snip(orig,k.index,k[0].length,25));});
  o.placeholders=ph;
  o.historial=/(historial|control|registro) de (cambios|revisiones|versiones)|historico de (cambios|versiones)/.test(p);
  if(meta){o.cambiosPend=meta.cambiosPend||0;o.comentarios=meta.comentarios||0;}
  return o;
}

/* ---------- Tablas ---------- */
const ROLES_COL={
 resp:['Responsable','respons|propietari|due.o|owner|encargad|asignad'],fecha:['Fecha o plazo','fecha|plazo|vencim|deadline|limite|cierre'],estado:['Estado','estado|status|avance|situacion'],
 nivel:['Nivel de riesgo','nivel|criticidad|severidad|valor del riesgo|riesgo (inherente|actual)'],control:['Control','control|medida|salvaguarda'],evidencia:['Evidencia','evidencia|soporte|documento'],
 residual:['Riesgo residual','residual'],trat:['Tratamiento','tratamiento|opcion|decision'],clasif:['Clasificación','clasificacion'],prob:['Probabilidad','probabilidad'],impacto:['Impacto','impacto|consecuencia'],
 activo:['Activo','activo'],amenaza:['Amenaza','amenaza'],vuln:['Vulnerabilidad','vulnerabilidad'],indicador:['Indicador','indicador|kpi'],meta:['Meta','meta']};
const _CERRADO=/cerrad|complet|implementad|ejecutad|finaliz|realizad|cumplid|resuelt|listo|100 ?%|aprobad/;
function _celda(c){return c==null?'':String(c).trim();}
function _fechaCelda(c,hoy){
  const s=_celda(c);if(!s)return null;
  let m=s.match(/^(\d{4})-(\d{2})-(\d{2})/);if(m)return _fechaOk(+m[3],+m[2],+m[1]);
  m=s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);if(m)return _fechaOk(+m[1],+m[2],+m[3]);
  const f=fechasEn(s);return f.length?f[0].f:null;
}
function analizarTablas(hojas,hoy){
  const out=[];
  (hojas||[]).forEach(h=>{
    const filas=h.filas||[];if(filas.length<2)return;
    let hi=-1;
    for(let i=0;i<Math.min(filas.length,25);i++){const r=filas[i].map(_celda);const ne=r.filter(Boolean);if(ne.length>=3){const txt=ne.filter(c=>!/^[\d.,%\-\/ ]+$/.test(c)).length;if(txt/ne.length>=0.7){hi=i;break;}}}
    if(hi<0)return;
    const cab=filas[hi].map(_celda),pc=cab.map(plano);
    const datos=[];for(let i=hi+1;i<filas.length;i++){const r=filas[i].map(_celda);if(r.filter(Boolean).length>=2)datos.push({n:i+1,r});}
    if(!datos.length)return;
    const roles={};
    Object.entries(ROLES_COL).forEach(([k,[et,rx]])=>{
      const idx=pc.findIndex(c=>new RegExp(rx).test(c));if(idx<0)return;
      if(k==='residual'&&!pc[idx])return;
      const vac=datos.filter(d=>!d.r[idx]);
      roles[k]={col:cab[idx]||('col '+(idx+1)),idx,etiqueta:et,total:datos.length,vacios:vac.length,ejemplos:vac.slice(0,6).map(d=>d.n)};
    });
    const t={hoja:h.nombre||'',filas:datos.length,columnas:cab.filter(Boolean),roles,vencidas:null};
    if(roles.fecha){
      const ie=roles.estado?roles.estado.idx:-1;const v=[];
      datos.forEach(d=>{const f=_fechaCelda(d.r[roles.fecha.idx],hoy);if(f&&f<new Date(hoy.getFullYear(),hoy.getMonth(),hoy.getDate())){const est=plano(ie>=0?d.r[ie]:'');if(!_CERRADO.test(est))v.push({n:d.n,f});}});
      t.vencidas={n:v.length,ejemplos:v.slice(0,6).map(x=>x.n+' ('+fmtF(x.f)+')'),conEstado:ie>=0};
    }
    out.push(t);
  });
  return out;
}
function analizarSoA(hojas,texto,idsControles){
  const ids=new Set(),viejos=new Set();
  (hojas||[]).forEach(h=>(h.filas||[]).forEach(r=>{const c=_celda(r[0]);const m=c.match(/^A?\.?\s?(\d{1,2})\.(\d{1,2})$/i);if(m){const k='A.'+m[1]+'.'+m[2];if(idsControles.includes(k))ids.add(k);else if(+m[1]>=9)viejos.add(k);}}));
  if(!ids.size){const r=/\bA\.(\d{1,2})\.(\d{1,2})\b/g;let m;while((m=r.exec(texto))){const k='A.'+m[1]+'.'+m[2];if(idsControles.includes(k))ids.add(k);else if(+m[1]>=9)viejos.add(k);}}
  const faltan=idsControles.filter(x=>!ids.has(x));
  return {total:ids.size,esperados:idsControles.length,faltan,viejos:Array.from(viejos)};
}

/* ---------- Mapa de requisitos tratados ---------- */
function mapaRequisitos(orig){
  const p=plano(orig),out=[];
  KW_REQ.forEach(([ref,et,rx])=>{const r=new RegExp(rx,'g');let n=0,first=null,m;while((m=r.exec(p))){n++;if(!first)first=m.index+'|'+m[0].length;if(n>50)break;}if(n)out.push({ref,etiqueta:et,n,snip:snip(orig,+first.split('|')[0],+first.split('|')[1],60)});});
  return out.sort((a,b)=>b.n-a.n).slice(0,10);
}

/* ---------- Análisis completo ---------- */
function analizarDocumento(d,ctx){
  const hoy=ctx.hoy||new Date(),texto=String(d.texto||'').normalize('NFC');
  const A={version:2,fecha:hoy.toISOString(),palabras:(texto.match(/\S+/g)||[]).length,sinTexto:false,aviso:'',tipo:'',tipoAuto:'',conf:'',alt:[],control:null,elementos:[],tablas:[],soa:null,mapa:[],conclusiones:[],preguntas:[],borradores:[],nivel:'',resumen:'',paraInforme:''};
  if(d.esImagen){A.sinTexto=true;A.aviso='Imagen: se adjunta como evidencia, pero su contenido no se puede leer automáticamente. Describa lo que muestra en las notas.';A.nivel='neutro';A.resumen='Imagen adjunta como evidencia. No se analizó su contenido.';A.conclusiones=[{n:'neutro',t:'Las imágenes se guardan como evidencia, pero la herramienta no puede leerlas. Anote qué muestran (qué sistema, fecha, qué se observa) en la nota del documento o de la pregunta.'}];return A;}
  if(A.palabras<40&&!(d.hojas&&d.hojas.some(h=>(h.filas||[]).length>=2))){A.sinTexto=true;A.nivel='neutro';A.aviso=d.esPDF?'El PDF no contiene texto seleccionable (parece un escaneo o imagen). No se puede analizar su contenido; revíselo manualmente y anote lo que verifique.':'El documento tiene muy poco texto para analizarlo.';A.resumen=A.aviso;A.conclusiones=[{n:'neutro',t:A.aviso}];return A;}
  const det=detectarTipo(d.nombre,texto,!!(d.hojas&&d.hojas.length));A.tipoAuto=det.tipo;A.tipo=(d.tipoForzado&&TIPOS_DOC[d.tipoForzado])?d.tipoForzado:det.tipo;A.conf=d.tipoForzado?'confirmada':det.conf;A.alt=det.alt;
  const T=TIPOS_DOC[A.tipo];
  A.control=controlDoc(d.nombre,texto,d.meta,hoy);
  const tb=texto.replace(/\s+/g,' '),p=plano(tb);   /* una sola línea: las frases partidas por el ancho de página (PDF) también se encuentran */
  /* elementos esperados */
  (T.el||[]).forEach(([id,et,ref,niv,rx,ask])=>{
    const m=new RegExp(rx).exec(p);
    A.elementos.push({id,t:et,ref,niv,ask,ok:!!m,snip:m?snip(tb,m.index,m[0].length,70):''});
  });
  /* tablas */
  A.tablas=analizarTablas(d.hojas,hoy);
  if(A.tipo==='soa')A.soa=analizarSoA(d.hojas,texto,ctx.controles||[]);
  A.mapa=mapaRequisitos(tb);
  sintetizar(A,d,T,hoy);
  return A;
}

/* ---------- Conclusiones, preguntas y borradores ---------- */
const lc=t=>t?t.charAt(0).toLowerCase()+t.slice(1):t;
const pl1=(n,s,p)=>n+' '+(n===1?s:p);
const ETQ_F={aprobacion:'aprobación',emision:'emisión',revision:'revisión',elaboracion:'elaboración','mas reciente':'la más reciente','metadatos del archivo':'metadatos del archivo'};
const ef=t=>ETQ_F[t]||t;
function sintetizar(A,d,T,hoy){
  const C=A.control,nom=d.nombre,nivRank={ok:0,warn:1,bad:2};let peor='ok';
  const sube=n=>{if(nivRank[n]>nivRank[peor])peor=n;};
  const id=(C.codigo?C.codigo+' ':'')+(C.version?'v'+C.version:'');
  const evid='Documento «'+nom+'»'+(id?' ('+id.trim()+')':'')+(d.sha?', SHA-256 '+d.sha.slice(0,12)+'…':'')+(d.fechaAdj?', adjuntado el '+fmtF(new Date(d.fechaAdj)):'');
  const B=(tipo,ref,o)=>{if(A.tipo!=='otro')A.borradores.push(Object.assign({tipo,ref,evid},o));};
  const falt=A.elementos.filter(e=>!e.ok),hall=A.elementos.filter(e=>e.ok);
  const req=A.elementos.filter(e=>e.niv==='r'),reqOk=req.filter(e=>e.ok),reqFalta=req.filter(e=>!e.ok),bue=A.elementos.filter(e=>e.niv==='b'&&!e.ok);
  /* 1. Identificación */
  A.conclusiones.push({n:'neutro',t:'Se identificó como «'+T.n+'»'+(A.conf==='baja'?' (confianza baja: confirme el tipo)':A.conf==='media'?' (confianza media)':'')+'. Texto analizado: '+pl1(A.palabras.toLocaleString('es'),'palabra','palabras')+(d.paginas?', '+pl1(d.paginas,'página','páginas'):'')+(d.hojasN?', '+pl1(d.hojasN,'hoja','hojas'):'')+'.'});
  /* 2. Control documental (7.5.2) */
  if(T.formal||A.tipo==='otro'){
    const falta=[];if(!C.codigo)falta.push('código');if(!C.version)falta.push('versión');if(!C.fechaRef||C.fechaRefTipo==='metadatos del archivo')falta.push('fecha de emisión o aprobación');if(!C.aprobo)falta.push('aprobador');
    if(falta.length===0&&!C.borrador){A.conclusiones.push({n:'ok',t:'Control documental: se identificó código '+C.codigo+', versión '+C.version+', fecha '+fmtF(C.fechaRef)+' ('+ef(C.fechaRefTipo)+') y aprobador.'});}
    else{
      const n=falta.length>=3?'bad':'warn';sube(n);
      A.conclusiones.push({n,t:'Control documental (7.5.2): no se identificó '+(falta.length?falta.join(', '):'—')+'.'+(C.borrador?' El documento se presenta como borrador.':'')+' Verifique si figura en el encabezado, pie de página o en el sistema documental.'});
      if(falta.length||C.borrador)B('obs','7.5.2',{sit:'en el documento «'+nom+'» no se identifica '+(falta.length?falta.join(', '):'una versión aprobada')+(C.borrador?' y se presenta como borrador':''),riesgo:'dificultar la identificación de la versión vigente y la demostración de que el documento fue revisado y aprobado',pregunta:'¿Cuál es la versión vigente aprobada de este documento y dónde consta su aprobación?'});
    }
    if(C.antiguedadMeses!=null&&C.antiguedadMeses>12&&C.fechaRefTipo!=='metadatos del archivo'){sube('warn');A.conclusiones.push({n:'warn',t:'La fecha más reciente detectada ('+fmtF(C.fechaRef)+', '+ef(C.fechaRefTipo)+') tiene '+C.antiguedadMeses+' meses. Verifique la última revisión (la norma exige revisar a intervalos planificados o ante cambios significativos).'});
      B('obs',A.tipo==='politica'?'A.5.1':'7.5.2',{sit:'la fecha más reciente que consta en el documento «'+nom+'» es '+fmtF(C.fechaRef)+', es decir, hace '+C.antiguedadMeses+' meses',riesgo:'que el documento no refleje la situación actual de la organización',pregunta:'¿Cuándo se revisó por última vez este documento y dónde queda registrado?'});}
    if(C.futura&&!(d.hojas&&d.hojas.length))A.conclusiones.push({n:'warn',t:'Se detectó al menos una fecha futura en el documento: podría ser un error de edición o una fecha de vigencia programada.'});
    if(C.placeholders.length){sube('warn');A.conclusiones.push({n:'warn',t:'Hay marcas de texto sin completar: «'+C.placeholders.slice(0,2).join('», «')+'».'});}
    if(C.cambiosPend>0){sube('warn');A.conclusiones.push({n:'warn',t:'El archivo Word contiene '+pl1(C.cambiosPend,'cambio','cambios')+' sin aceptar o rechazar (control de cambios activo): puede no ser la versión final.'});
      B('obs','7.5.2',{sit:'el archivo «'+nom+'» contiene '+pl1(C.cambiosPend,'cambio','cambios')+' sin aceptar o rechazar',riesgo:'que exista más de una versión del contenido y no esté claro cuál es la vigente',pregunta:'¿Esta es la versión final aprobada o hay cambios pendientes?'});}
  }
  /* 3. Elementos esperados */
  if(req.length){
    const r=reqOk.length/req.length;const n=r>=0.85?'ok':r>=0.55?'warn':'bad';sube(n);
    A.conclusiones.push({n,t:'Contenido esperado para «'+T.n+'» ('+T.ref+'): se identificaron '+reqOk.length+' de '+req.length+' elementos exigidos por la norma'+(bue.length?'; además faltan '+bue.length+' de buena práctica':'')+'.'+(reqFalta.length?' No se encontró mención de: '+reqFalta.slice(0,4).map(e=>lc(e.t)).join('; ')+(reqFalta.length>4?'; y '+(reqFalta.length-4)+' más':'')+'.':'')});
    reqFalta.slice(0,6).forEach(e=>{
      B('obs',e.ref,{sit:'en el documento «'+nom+'» no se identifica referencia a «'+lc(e.t)+'»',riesgo:'limitar la capacidad de demostrar el cumplimiento del requisito '+e.ref,pregunta:e.ask||''});
    });
    if(reqFalta.length)A.conclusiones.push({n:'neutro',t:'Importante: esto es una búsqueda de términos. Si el documento usa otras palabras, o el contenido está en imágenes o anexos, puede haber falsos «no encontrado». Confirme con el auditado antes de redactar un hallazgo.'});
  }
  /* 4. Tablas */
  A.tablas.forEach(t=>{
    const pie=' (hoja «'+t.hoja+'», '+pl1(t.filas,'registro','registros')+')';
    A.conclusiones.push({n:'neutro',t:'Tabla'+pie+': columnas detectadas — '+t.columnas.slice(0,10).join(', ')+(t.columnas.length>10?'…':'')+'.'});
    ['resp','fecha','estado','evidencia'].forEach(k=>{
      const r=t.roles[k];if(!r)return;
      if(r.vacios>0){const pct=Math.round(100*r.vacios/r.total);const n=pct>=25?'bad':'warn';sube(n);
        const tx=r.vacios+' de '+r.total+' registros ('+pct+' %) no tienen '+r.etiqueta.toLowerCase()+' en la columna «'+r.col+'» (filas '+r.ejemplos.join(', ')+(r.vacios>r.ejemplos.length?'…':'')+')';
        A.conclusiones.push({n,t:'Tabla: '+tx+'.'});
        B('obs',k==='resp'?'6.1.3':k==='fecha'?'8.3':'7.5.3',{sit:'en la hoja «'+t.hoja+'» del documento «'+nom+'», '+tx,riesgo:k==='resp'?'dificultar el seguimiento y la rendición de cuentas de cada registro':k==='fecha'?'que no se pueda controlar el cumplimiento en plazo':'limitar la trazabilidad del seguimiento',pregunta:'¿Por qué hay registros sin '+r.etiqueta.toLowerCase()+' y quién los completará?'});
      }else A.conclusiones.push({n:'ok',t:'Tabla: todos los '+r.total+' registros tienen '+r.etiqueta.toLowerCase()+' (columna «'+r.col+'»).'});
    });
    if(t.vencidas&&t.vencidas.n>0){sube('bad');const tx=pl1(t.vencidas.n,'registro con fecha vencida','registros con fecha vencida')+(t.vencidas.conEstado?' y sin estado de cierre':'')+' (filas '+t.vencidas.ejemplos.join(', ')+(t.vencidas.n>t.vencidas.ejemplos.length?'…':'')+')';
      A.conclusiones.push({n:'bad',t:'Tabla: '+tx+'.'});
      B('obs','8.3',{sit:'en la hoja «'+t.hoja+'» del documento «'+nom+'», '+tx,riesgo:'que las acciones no se ejecuten en los plazos definidos',pregunta:'¿Cuál es el estado real de los registros vencidos y quién los replanificó?'});}
    else if(t.vencidas&&t.vencidas.n===0)A.conclusiones.push({n:'ok',t:'Tabla: no se detectaron registros con fecha vencida pendientes de cierre.'});
  });
  /* 5. SoA */
  if(A.soa){const s=A.soa;
    if(s.total===s.esperados){A.conclusiones.push({n:'ok',t:'SoA: se listan los '+s.total+' controles del Anexo A de ISO 27001:2022.'});}
    else{sube(s.total<s.esperados*0.9?'bad':'warn');A.conclusiones.push({n:s.total<s.esperados*0.9?'bad':'warn',t:'SoA: se identificaron '+s.total+' de '+s.esperados+' controles'+(s.faltan.length?' (faltan '+s.faltan.slice(0,8).join(', ')+(s.faltan.length>8?'…':'')+')':'')+'.'});
      if(s.faltan.length)B('obs','6.1.3',{sit:'la Declaración de Aplicabilidad «'+nom+'» lista '+s.total+' de los '+s.esperados+' controles del Anexo A (no se identifican '+s.faltan.slice(0,6).join(', ')+(s.faltan.length>6?' y otros':'')+')',riesgo:'que no se pueda demostrar que se compararon los controles necesarios contra todos los del Anexo A',pregunta:'¿Por qué no figuran estos controles en el SoA?'});}
    if(s.viejos.length){sube('warn');A.conclusiones.push({n:'warn',t:'SoA: aparecen referencias con numeración de la versión 2013 ('+s.viejos.slice(0,5).join(', ')+'). La norma vigente es ISO/IEC 27001:2022.'});}
  }
  /* 6. Requisitos tratados */
  if(A.mapa.length)A.conclusiones.push({n:'neutro',t:'El documento trata principalmente: '+A.mapa.slice(0,6).map(x=>x.etiqueta+' ('+x.ref+')').join('; ')+'.'});
  /* Punto fuerte */
  if(peor==='ok'&&req.length&&reqOk.length===req.length&&T.formal&&C.codigo&&C.version&&C.aprobo&&!C.borrador){B('fortaleza',T.ref.split(' ')[0],{practica:'el documento «'+nom+'» incluye código, versión, fecha y aprobación, y cubre los '+req.length+' elementos que la norma exige para '+lc(T.n),benef:'facilitar la identificación de la versión vigente y demostrar el cumplimiento del requisito'});}
  /* Preguntas para el auditado (sin repetir) */
  const vistos=new Set();A.borradores.filter(b=>b.pregunta).forEach(b=>{if(!vistos.has(b.pregunta)){vistos.add(b.pregunta);A.preguntas.push(b.pregunta);}});
  reqFalta.forEach(e=>{if(e.ask&&!vistos.has(e.ask)&&A.preguntas.length<10){vistos.add(e.ask);A.preguntas.push(e.ask);}});
  /* Nivel y textos finales */
  A.nivel=peor;
  const txtN={ok:'sin brechas evidentes en lo que se pudo revisar',warn:'con puntos a verificar',bad:'con brechas importantes a verificar'};
  A.resumen='«'+nom+'» ('+T.n+'): '+txtN[peor]+'.';
  A.paraInforme='Se revisó el documento «'+nom+'»'+(id?' ('+id.trim()+')':'')+', identificado como '+lc(T.n)+'. '+(req.length?'Se identificaron '+reqOk.length+' de '+req.length+' elementos esperados según '+T.ref+'. ':'')+(reqFalta.length?'No se identificó mención de '+reqFalta.slice(0,3).map(e=>lc(e.t)).join(', ')+'; este punto fue consultado al auditado. ':'')+(C.fechaRef?'La fecha más reciente detectada es '+fmtF(C.fechaRef)+'. ':'')+'La revisión se realizó sobre el contenido textual del documento.';
  /* Limita borradores a los 8 más relevantes */
  A.borradores=A.borradores.slice(0,8).map((b,i)=>Object.assign(b,{id:'B'+(i+1)}));
}
