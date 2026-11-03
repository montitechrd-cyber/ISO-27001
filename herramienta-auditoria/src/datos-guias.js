/* ===== GUÍAS DE AUDITORÍA POR PROCESO =====
   q: lo que se pregunta · ev: evidencia que se pide ver · al: señales de alerta · sug: true = lo agrego yo, no figura en el cronograma */
const GUIAS={

apertura:{
 etiqueta:'Puntos a cubrir',
 objetivo:'Dejar claro el marco de la auditoría y obtener el compromiso de los auditados. Una buena apertura evita el 80 % de los conflictos posteriores.',
 simple:'Es la reunión formal que da inicio. Usted no debe «explicar la norma», sino confirmar alcance, criterios, método, confidencialidad y calendario (ISO 19011, 6.4).',
 prep:['Lista de asistencia lista para firmar','Plan de auditoría impreso o en pantalla','Copia del alcance del SGSI y de la última SoA','Confirmar quién es el contacto/guía de cada proceso'],
 preguntas:[
  {ref:[],q:'Presentar al equipo auditor, funciones de cada auditor y registrar asistentes.',ev:'Lista de asistencia firmada.'},
  {ref:['4.3'],q:'Confirmar el OBJETIVO y el ALCANCE de la auditoría (procesos, sedes, normas ISO 9001 / 27001 / 20000-1, período auditado).',ev:'Plan de auditoría aprobado.'},
  {ref:[],q:'Confirmar los CRITERIOS: ISO/IEC 27001:2022, políticas y procedimientos del SGSI, SoA vigente, requisitos legales y contractuales aplicables.',ev:''},
  {ref:[],q:'Explicar el MÉTODO: auditoría basada en evidencia y muestreo; las conclusiones se limitan a lo muestreado.',ev:'',al:'Si no lo aclara, el auditado puede entender que «no hallazgo = todo conforme».'},
  {ref:[],q:'Confidencialidad: cómo se tratarán las evidencias y el informe (cuántas personas tendrán acceso).',ev:''},
  {ref:['A.8.34'],q:'Acordar el acceso a sistemas: las pruebas de auditoría deben hacerse en modo lectura y sin afectar producción; quién acompaña, qué pantallas se pueden mostrar.',ev:'Acuerdo verbal registrado en acta.'},
  {ref:[],q:'Clasificación de hallazgos (NC mayor, NC menor, observación, OM) según el procedimiento de auditoría interna de la empresa.',ev:'Procedimiento de auditoría interna.'},
  {ref:[],q:'Cómo se comunicarán los hallazgos (reuniones diarias, validación con el responsable del proceso, plazos para réplicas).',ev:''},
  {ref:[],q:'Confirmar el calendario, ajustes de horarios y disponibilidad de los auditados (especialmente SoA y días técnicos).',ev:'Calendario confirmado.'},
  {ref:[],q:'Dudas y cierre; indicar fecha de la reunión de cierre.',ev:''}
 ]},

planificacion:{
 objetivo:'Comprobar que la empresa entiende su contexto, definió el alcance y PLANIFICÓ el SGSI sobre la base de riesgos: evaluación de riesgos, plan de tratamiento, SoA, objetivos y gestión de cambios. Un fallo aquí contamina todo lo demás.',
 simple:'Cláusulas 4 y 6. Todo el SGSI se apoya en una pregunta: ¿qué puede salir mal con nuestra información y qué hacemos al respecto? Si el riesgo está mal evaluado, los controles de los otros procesos pueden estar bien… pero ser los equivocados.',
 prep:['Declaración de alcance del SGSI','Análisis de contexto y matriz de partes interesadas','Metodología de gestión de riesgos (procedimiento aprobado)','Última matriz de riesgos y su fecha','Plan de tratamiento de riesgos y SoA (versión y fecha)','Objetivos de seguridad con indicadores','Informe de auditoría anterior y estado de acciones'],
 preguntas:[
  {ref:['4.1'],q:'¿Qué factores internos y externos (legales, tecnológicos, de mercado, contractuales) afectan su capacidad de proteger la información? ¿Cuándo fue la última revisión?',ev:'Análisis de contexto con fecha y acta/registro de revisión.',al:'Documento genérico copiado del SGC (calidad) sin factores de seguridad; sin fecha de revisión.'},
  {ref:['4.2'],q:'¿Quiénes son las partes interesadas del SGSI y qué requisitos tiene cada una? ¿Cuáles se abordan mediante el SGSI?',ev:'Matriz de partes interesadas con requisitos concretos (clientes, reguladores, empleados, proveedores).',al:'Lista de partes sin requisitos; cláusulas de seguridad de contratos de clientes no consideradas.'},
  {ref:['4.3'],q:'Muéstreme el alcance del SGSI. ¿Qué procesos, sedes, sistemas y activos incluye y cuáles excluye y por qué?',ev:'Declaración de alcance aprobada, con interfaces y dependencias (nube, proveedores).',al:'Alcance que no coincide con la realidad (ej. desarrollo de software ofrecido a clientes pero fuera del alcance; trabajo remoto no mencionado); exclusiones sin justificar.'},
  {ref:['4.4'],q:'¿Cómo se relacionan los procesos del SGSI entre sí y dónde está su documentación?',ev:'Mapa de procesos; evidencia de que el SGSI se opera, no solo se documenta.',al:'SGSI tratado como un conjunto de documentos y no como un sistema que funciona.'},
  {ref:['6.1.1'],q:'¿Cómo se determinaron los riesgos y oportunidades del SGSI a partir del contexto y de las partes interesadas?',ev:'Vínculo entre contexto (4.1), partes interesadas (4.2) y riesgos.',al:'Los riesgos no guardan relación con el contexto declarado.'},
  {ref:['6.1.2'],q:'Explíqueme la metodología de evaluación de riesgos: criterios de aceptación, escalas de probabilidad e impacto, identificación de activos, amenazas y vulnerabilidades. ¿Quién es dueño de cada riesgo?',ev:'Metodología aprobada, matriz de riesgos con fecha, criterios de aceptación y propietarios.',al:'Sin criterios de aceptación; sin dueños de riesgo; matriz con más de 12 meses o sin actualizar tras cambios; no incluye proveedores/nube.'},
  {ref:['6.1.2','6.1.3'],q:'Tomemos 3 riesgos ALTOS de la matriz: ¿cómo se identificó cada uno, cómo se valoró, qué tratamiento se decidió y quién lo aprobó?',ev:'Trazabilidad: riesgo → decisión → control en SoA → evidencia de implementación.',al:'Riesgos altos sin tratamiento o aceptados sin firma del dueño del riesgo.'},
  {ref:['6.1.3'],q:'Muéstreme el plan de tratamiento y cómo se eligieron los controles. ¿Se comparó con el Anexo A para confirmar que no falta ningún control necesario?',ev:'Plan de tratamiento aprobado con responsables y plazos; comparación contra Anexo A.',al:'Plan sin fechas ni responsables; sin avance en el último año.'},
  {ref:['6.1.3'],q:'Muéstreme la Declaración de Aplicabilidad (SoA): versión, fecha, quién la aprobó. ¿Incluye la justificación de inclusión, el estado de implementación y la justificación de exclusiones?',ev:'SoA vigente con los 93 controles y numeración ISO 27001:2022.',al:'Versión, fecha o aprobador inexistentes; justificaciones que no se vinculan a riesgos.'},
  {ref:['6.1.3'],q:'¿Hubo aprobación formal del plan de tratamiento y aceptación de los riesgos residuales por parte de sus dueños?',ev:'Acta o firma del plan y de la aceptación de riesgos residuales.',al:'Aprobación del plan solo por el área de calidad o TI; ningún directivo.'},
  {ref:['6.2'],q:'¿Cuáles son los objetivos de seguridad de la información? ¿Cómo se miden, quién es responsable, cuál es el plazo y cómo se monitorean?',ev:'Objetivos con indicador, meta, responsable, plazo y resultados recientes.',al:'Objetivos no medibles («mejorar la seguridad»), sin seguimiento, copia de los de calidad.'},
  {ref:['6.3'],q:'¿Se hizo algún cambio al SGSI en el último año (alcance, estructura, herramientas, procesos)? ¿Cómo se planificó?',ev:'Registro de cambios con evaluación de impacto (requisito nuevo en 2022).',al:'Cambios importantes sin planificación ni registro.'},
  {ref:['8.2'],q:'¿Con qué frecuencia se reevalúan los riesgos de seguridad de la información? ¿Cuándo fue la última vez y qué la originó (fecha planificada o un cambio significativo)?',ev:'Evaluaciones de riesgo con fecha y registros de sus resultados; criterio que define cuándo reevaluar.',al:'Una sola evaluación inicial sin revisiones; cambios importantes (nuevo sistema, proveedor, sede) sin reevaluar.'},
  {ref:['8.3'],q:'¿Cuál es el avance del plan de tratamiento de riesgos? Tome 5 acciones: ¿quién es el responsable, cuál era la fecha y cuál es el estado real? ¿Se conservan los resultados del tratamiento?',ev:'Plan de tratamiento con estado de cada acción y evidencia de las cerradas.',al:'Acciones vencidas sin reprogramar; sin responsable; acciones «cerradas» sin evidencia.'},
  {ref:['A.5.8'],sug:true,q:'¿Cómo se incorpora la seguridad de la información en la gestión de proyectos?',ev:'Plantilla de proyecto con evaluación de riesgos de seguridad; 2 proyectos recientes como muestra.',al:'Proyectos de TI aprobados sin ninguna revisión de seguridad.'}
 ]},

sig:{
 objetivo:'Comprobar liderazgo real de la alta dirección, una política conocida y aplicada, roles definidos y un sistema documental controlado.',
 simple:'Cláusula 5 (liderazgo) y 7.5 (información documentada). En ISO 9001 usted conoce estos mismos temas; aquí la diferencia es la seguridad de la información y los controles A.5.35/A.5.36.',
 prep:['Política de seguridad de la información vigente','Organigrama y designación del responsable de seguridad','Listado maestro de documentos del SGSI','Programa de auditorías internas y de revisión independiente','Actas recientes de comités de seguridad'],
 preguntas:[
  {ref:['5.1'],q:'(A la VP) ¿Cómo demuestra la alta dirección su compromiso con el SGSI? ¿Qué recursos asignó este año?',ev:'Presupuesto de seguridad aprobado, actas de comités, comunicados.',al:'Todo se delega a TI o a Calidad; la VP no conoce objetivos ni riesgos principales.'},
  {ref:['5.2'],q:'Muéstreme la política de seguridad: aprobador, fecha, revisión. ¿Cómo la comunicaron y cómo la conoce el personal?',ev:'Política firmada; evidencia de difusión; verifique con 2 empleados al azar.',al:'Política desactualizada; sin compromiso de cumplir requisitos ni de mejora continua; el personal no la conoce.'},
  {ref:['5.3','A.5.2'],q:'¿Quién es el responsable del SGSI y a quién reporta? ¿Dónde está formalizado?',ev:'Designación escrita, descripción del puesto, organigrama.',al:'El responsable no tiene autoridad ni tiempo asignado; conflicto de interés (opera y audita lo mismo).'},
  {ref:['A.5.3'],q:'¿Hay funciones que, por riesgo, no deben estar en una misma persona (quien aprueba accesos y quien los usa, quien desarrolla y quien despliega)? ¿Cómo lo controlan?',ev:'Matriz de segregación de funciones o regla documentada.',al:'Una sola persona controla un proceso crítico de principio a fin.'},
  {ref:['7.5'],q:'¿Qué información documentada exige la norma y cuál definieron como necesaria? Muéstreme el listado maestro.',ev:'Listado maestro con código, versión, fecha, responsable.',al:'Faltan documentos obligatorios: alcance, política, metodología de riesgos, SoA, objetivos, resultados de auditoría, revisión por la dirección.'},
  {ref:['7.5'],q:'Elijamos 3 documentos (política, procedimiento, registro): ¿están identificados (código, versión, autor, aprobador)? ¿Cómo se controla quién puede modificarlos?',ev:'Documentos reales con control de versiones y permisos de edición.',al:'Varias versiones circulando; permisos de edición abiertos a todos; documentos en carpetas personales o correo.'},
  {ref:['A.5.35'],q:'¿Cómo se hace la revisión independiente de la seguridad de la información (auditoría interna/externa, pruebas)? ¿Con qué frecuencia y quién es independiente de lo revisado?',ev:'Programa de auditoría, informes de revisión independiente, informe de pentest si aplica.',al:'La revisión la hace quien opera los controles; no hay planificación.'},
  {ref:['A.5.36'],q:'¿Cómo comprueba la gerencia que se cumplen las políticas y normas de seguridad? ¿Cómo se gestionan las excepciones?',ev:'Informes de cumplimiento por gerencia, registro de excepciones aprobadas.',al:'Excepciones informales sin aprobación ni plazo.'},
  {ref:['A.5.1'],sug:true,q:'Además de la política general, ¿qué políticas específicas existen (control de acceso, respaldo, uso aceptable, criptografía, clasificación)? ¿Quién las aprueba?',ev:'Listado de políticas específicas con aprobación de la dirección.',al:'Pocas políticas específicas o sin aprobación formal.'},
  {ref:['A.5.4'],sug:true,q:'¿Cómo exige la dirección que el personal aplique las reglas de seguridad?',ev:'Comunicados, evaluación de desempeño que incluye seguridad.',al:''}
 ]},

ventas:{
 objetivo:'Verificar que la información de clientes y prospectos se maneja con seguridad durante la venta, que los requisitos de seguridad de los clientes se identifican antes de comprometerse y que los datos personales se tratan de forma lícita.',
 simple:'A.5.14 (cómo se envía información a terceros) y A.5.34 (datos personales). El riesgo típico: propuestas con datos del cliente enviadas por WhatsApp o correo personal, CRM abierto a todos y promesas de seguridad que operaciones no puede cumplir.',
 prep:['Política de transferencia de información','Muestra de 3 propuestas o contratos recientes','Acuerdos de confidencialidad (NDA) con clientes','Registro de bases de datos / tratamiento de datos personales','Lista de usuarios del CRM y nómina actual de vendedores'],
 preguntas:[
  {ref:['A.5.14'],q:'Cuando envía una propuesta, cotización o contrato a un cliente, ¿por qué medio lo hace? ¿Existe una regla sobre canales permitidos (correo corporativo, WhatsApp, Drive personal)?',ev:'Política de transferencia; 3 envíos recientes con el canal usado.',al:'Uso de WhatsApp o correo personal para documentos con datos de clientes; sin regla.'},
  {ref:['A.5.14','A.6.6'],q:'¿Cómo protege la información sensible al compartirla (contraseña, cifrado, enlace con vencimiento)? ¿Hay NDA firmado con clientes y prospectos?',ev:'Muestra de NDAs firmados; plantilla estándar.',al:'Se comparte información sensible antes de firmar NDA.'},
  {ref:['A.5.34'],q:'¿Qué datos personales de clientes y prospectos recopilan (nombre, documento de identidad, correo, teléfono)? ¿Dónde se guardan y quién accede?',ev:'Registro de tratamiento de datos o inventario de datos personales; política de privacidad.',al:'Datos en hojas de Excel locales; CRM abierto a todos.'},
  {ref:['A.5.34','A.5.31'],q:'¿Cómo obtienen y registran el consentimiento de los titulares? ¿Cómo atienden solicitudes de acceso, rectificación, actualización o supresión de datos (Ley 172-13, República Dominicana)?',ev:'Formato de consentimiento y registro de solicitudes atendidas. Pida el procedimiento de protección de datos personales y compare lo que dice con lo que hacen.',al:'No hay procedimiento; nadie sabe quién atiende estas solicitudes; el procedimiento existe pero los vendedores no lo conocen.'},
  {ref:['4.2','A.5.31'],q:'¿Cómo identifican los requisitos de seguridad que el cliente exige (confidencialidad, SLA, auditorías, certificaciones) antes de firmar? ¿Quién los revisa?',ev:'Revisión de contratos de 3 clientes; checklist de revisión previa; matriz de requisitos de clientes.',al:'Ventas promete cosas sin revisión técnica ni legal; las cláusulas de seguridad no llegan a Operaciones.'},
  {ref:['A.5.18','A.8.3'],sug:true,q:'¿Quién tiene acceso al CRM? ¿Qué pasa con el acceso de un vendedor que se va de la empresa?',ev:'Lista de usuarios del CRM comparada con la nómina actual (3 salidas recientes).',al:'Usuarios de ex-empleados activos; cuentas compartidas.'},
  {ref:['A.5.12','A.5.13'],sug:true,q:'¿Cómo sabe si un documento es confidencial? ¿Está clasificado o etiquetado?',ev:'Política de clasificación; 3 documentos de muestra.',al:'El personal no distingue información interna de confidencial.'},
  {ref:['A.7.7'],sug:true,q:'Observación en sitio: pantallas desbloqueadas, documentos con datos de clientes sobre escritorios, impresiones olvidadas.',ev:'Anote cantidad de puestos observados y cuántos incumplen.',al:''},
  {ref:['A.6.7'],sug:true,q:'¿Los vendedores trabajan fuera de la oficina? ¿Con qué equipos y qué protección (VPN, cifrado)?',ev:'Política de trabajo remoto; equipos usados.',al:'Uso de equipos personales sin ninguna regla.'}
 ]},

marcas:{
 objetivo:'Verificar el uso lícito y seguro de datos en mercadeo, el control de cuentas de redes sociales y proveedores externos, y que lo que se afirma a los clientes sobre seguridad sea veraz.',
 simple:'Mismo A.5.14 y A.5.34 que Ventas, pero aplicados a campañas, redes sociales, agencias y respuestas a cuestionarios de seguridad (preventa).',
 prep:['Bases de datos de contactos y política de privacidad','Contratos con agencias de mercadeo','Lista de quién administra redes sociales y web','Cuestionarios de seguridad de clientes respondidos recientemente','Material comercial que menciona ISO / certificaciones'],
 preguntas:[
  {ref:['A.5.34','A.5.31'],q:'¿De dónde provienen las bases de datos de correos y teléfonos usadas en campañas? ¿Cómo se obtuvo el consentimiento y cómo puede una persona darse de baja? ¿Conocen la Ley 172-13 de protección de datos y la ley dominicana sobre correos comerciales no solicitados (Ley 310-14)? Confirme con el Asesor Legal su vigencia y aplicabilidad: esta referencia no sustituye asesoría legal.',ev:'Origen de las listas, mecanismo de baja, muestra de consentimientos.',al:'Listas compradas o heredadas sin consentimiento; sin opción de baja.'},
  {ref:['A.5.14','A.5.12'],q:'¿Se publican casos de éxito, logos o información de clientes? ¿Quién autoriza y cómo?',ev:'Autorización escrita del cliente (muestra de 2 casos publicados).',al:'Publicación de logos o resultados sin permiso, violando NDA.'},
  {ref:['A.5.17','A.8.5'],q:'¿Quién tiene acceso a las cuentas de redes sociales, web y herramientas de campañas? ¿Se usan contraseñas compartidas? ¿Hay doble factor? ¿Qué pasa cuando alguien sale?',ev:'Lista de administradores de cada cuenta comparada con el equipo actual.',al:'Contraseña única compartida; ex-empleados o agencia anterior con acceso.'},
  {ref:['A.5.19','A.5.20'],q:'¿Qué agencias o proveedores externos tienen acceso a información de la empresa o de clientes? ¿Hay contrato con cláusulas de confidencialidad?',ev:'Contratos y NDAs con agencias; evaluación del proveedor.',al:'Agencia con acceso a datos de clientes sin contrato de confidencialidad.'},
  {ref:['4.2','A.5.31'],q:'(Preventa) Cuando un cliente envía un cuestionario o licitación con requisitos de seguridad, ¿quién responde y cómo verifica que lo que afirma es cierto?',ev:'2 cuestionarios respondidos y la evidencia que respalda cada respuesta.',al:'Se afirma tener controles o certificaciones que no existen o que están fuera del alcance.'},
  {ref:['7.4'],q:'¿Qué se dice públicamente sobre ISO 27001 u otras certificaciones? ¿Quién valida que sea exacto respecto al alcance real?',ev:'Material comercial, web, firmas de correo.',al:'Publicidad que afirma «certificados» cuando solo hay auditoría interna, o el alcance difiere.'},
  {ref:['A.5.5','A.5.14'],sug:true,q:'Si hubiera un incidente que afecte a clientes, ¿quién comunica a los clientes y a los medios? ¿Está definido?',ev:'Procedimiento de comunicación de crisis.',al:'Sin portavoz definido.'}
 ]},

tecnologia:{
 objetivo:'Comprobar que los controles técnicos centrales (malware, vulnerabilidades, respaldos, redes y cifrado) existen, funcionan y se mantienen, y que los recursos son suficientes.',
 simple:'Día técnico por excelencia. Usted no necesita saber cómo se configura un firewall. Necesita ver que existe, que alguien lo revisa, que se puede demostrar y que coincide con los riesgos y la SoA. Pida que le MUESTREN en pantalla.',
 prep:['Inventario de activos de TI','Políticas: respaldo, criptografía, control de acceso, malware','Último informe de escaneo de vulnerabilidades y de pentest','Diagrama de red','Reportes de respaldo de los últimos 30 días y última prueba de restauración','Lista de administradores y de empleados que salieron en los últimos 6 meses (solicitar a RRHH)'],
 preguntas:[
  {ref:['7.1'],q:'¿Cuenta el área con presupuesto, personal y herramientas suficientes para mantener el SGSI? ¿Cómo lo determinan?',ev:'Presupuesto de seguridad, estructura del área, herramientas licenciadas.',al:'Una sola persona sostiene toda la seguridad; herramientas con licencia vencida.'},
  {ref:['A.8.7'],q:'¿Qué protección contra malware (antivirus/EDR) tienen y en qué porcentaje de equipos y servidores está instalada y actualizada? ¿Cómo lo saben?',ev:'Pida ver la consola EN VIVO: equipos totales, protegidos y con definiciones actualizadas. Compare con el inventario.',al:'Equipos sin agente; firmas desactualizadas; la cobertura no se mide.'},
  {ref:['A.8.8'],q:'¿Cada cuánto escanean vulnerabilidades? ¿Cómo las priorizan y en cuánto tiempo corrigen las críticas? ¿Hacen pruebas de penetración?',ev:'Último informe de escaneo, listado de críticas/altas y estado, plazo de parcheo, informe de pentest y plan de remediación.',al:'Críticas abiertas fuera de plazo; software sin soporte del fabricante; sin escaneo al menos trimestral.'},
  {ref:['A.8.8','A.8.19'],q:'¿Cómo gestionan las actualizaciones de sistemas operativos y aplicaciones? ¿Cuántos equipos están atrasados hoy?',ev:'Reporte de parches pendientes, ventanas de mantenimiento recientes.',al:'Parches aplicados «cuando se puede», sin registro.'},
  {ref:['A.8.13'],q:'¿Qué se respalda, con qué frecuencia, dónde se guarda y por cuánto tiempo? ¿Cuándo fue la última prueba de restauración y qué resultado tuvo? Muéstremela.',ev:'Política de respaldo, reportes de ejecución (fallos y reintentos), acta de prueba de restauración, copia fuera del sitio, cifrado.',al:'Respaldos fallidos sin seguimiento; sin prueba de restauración; copia en el mismo servidor; respaldo accesible a ransomware.'},
  {ref:['A.8.20'],q:'¿Cómo protegen la red (firewall, VPN, WiFi de invitados)? ¿Quién revisa las reglas del firewall y con qué frecuencia?',ev:'Diagrama de red, acta de revisión de reglas, configuración de WiFi de invitados.',al:'Reglas abiertas «any-any»; sin diagrama; WiFi de invitados conectado a la red interna; servicios expuestos a Internet sin justificación.'},
  {ref:['A.8.22'],sug:true,q:'¿Están separadas las redes de usuarios, servidores e invitados?',ev:'Diagrama de segmentación.',al:'Red plana donde todo ve a todo.'},
  {ref:['A.8.24'],q:'¿Dónde usan cifrado (discos de laptops, respaldos, comunicaciones web, base de datos)? ¿Hay política de criptografía? ¿Cómo gestionan llaves y certificados?',ev:'Política, inventario de certificados con vencimientos, evidencia de laptops cifradas.',al:'Laptops sin cifrar; certificados vencidos; claves guardadas junto a los datos.'},
  {ref:['A.5.15','A.5.16','A.5.18','A.8.2','A.8.5'],sug:true,q:'¿Cómo se otorgan, modifican y retiran accesos? Muéstreme la lista de administradores y cuándo se revisó. ¿Se usa doble factor (MFA)? ¿En qué sistemas?',ev:'Procedimiento de altas y bajas; lista de administradores; revisión periódica; prueba: ex-empleados de los últimos 6 meses con cuentas activas.',al:'Cuentas activas de personas que ya salieron; cuenta «admin» compartida; sin MFA en correo, VPN y administración.'},
  {ref:['A.8.1'],sug:true,q:'¿Qué reglas aplican a laptops y celulares de trabajo (cifrado, bloqueo, borrado remoto, uso de equipos personales)?',ev:'Política de dispositivos; configuración de una muestra de 3 equipos.',al:'Equipos personales con acceso a correo corporativo sin ningún control.'},
  {ref:['A.8.15','A.8.17'],sug:true,q:'¿Qué eventos se registran (accesos, cambios de privilegios, acciones administrativas), por cuánto tiempo y quién puede borrarlos?',ev:'Configuración de registros y retención; protección contra modificación.',al:'Los administradores pueden borrar sus propios registros.'},
  {ref:['A.8.9'],sug:true,q:'¿Existen configuraciones base seguras para servidores y equipos? ¿Cómo detectan cambios no autorizados?',ev:'Documento de línea base; ejemplo de desviación detectada.',al:''},
  {ref:['A.8.12','A.8.23'],sug:true,q:'¿Cómo evitan que información sensible salga de la empresa (USB, correo, nube personal) y cómo filtran sitios web peligrosos?',ev:'Reglas configuradas y reportes.',al:'Puertos USB abiertos y sin control.'},
  {ref:['A.7.1','A.7.2','A.7.4','A.7.5','A.7.8','A.7.11','A.7.12','A.7.13'],sug:true,q:'RECORRIDO FÍSICO (cuarto de servidores / comunicaciones): control de acceso y bitácora de visitas, detección de incendio y extintores, climatización, UPS o planta eléctrica, cámaras, orden del cableado.',ev:'Fotografíe o describa lo observado. Pida la bitácora de acceso del último mes y los registros de mantenimiento.',al:'Puerta abierta o sin control; el cuarto se usa como almacén; sin extintor o con fecha vencida; sin respaldo eléctrico probado.'},
  {ref:['A.7.14','A.7.10'],sug:true,q:'¿Cómo se destruyen o reutilizan equipos y discos al final de su vida útil?',ev:'Certificados de borrado o destrucción.',al:'Equipos dados de baja sin borrado verificado.'}
 ]},

desarrollo:{
 objetivo:'Verificar que el software se desarrolla con seguridad desde los requisitos hasta la liberación: ambientes separados, código revisado, pruebas, control de cambios y acceso controlado al código.',
 simple:'La mejor técnica para quien no programa es seguir UN cambio real de punta a punta: «Elijamos las dos últimas funcionalidades liberadas. Muéstreme el requerimiento, el código, la revisión, las pruebas, la aprobación y la liberación». La trazabilidad se audita sin entender el código.',
 prep:['Procedimiento de ciclo de vida de desarrollo','Lista de proyectos/liberaciones del último trimestre (usted elegirá 2-3)','Diagrama de entornos (desarrollo, pruebas, producción)','Lista de miembros del repositorio de código','Contratos con proveedores de desarrollo externo (si hay)'],
 preguntas:[
  {ref:['A.8.25'],q:'Explíqueme cómo se desarrolla un software desde la solicitud hasta producción. ¿Existe un procedimiento de ciclo de vida de desarrollo seguro?',ev:'Procedimiento; una liberación reciente rastreada completa: solicitud → código → pruebas → aprobación → despliegue.',al:'El proceso real difiere del documentado; un solo desarrollador hace todo; no hay evidencia del flujo.'},
  {ref:['A.8.26'],q:'¿Cómo identifican los requisitos de seguridad de una aplicación (autenticación, protección de datos, registros, cumplimiento)? Muéstreme los de un proyecto reciente.',ev:'Requisitos de seguridad dentro de la historia de usuario o especificación; análisis de riesgos del proyecto.',al:'Los requisitos de seguridad no aparecen en ningún documento de proyecto.'},
  {ref:['A.8.28'],q:'¿Existen estándares de codificación segura? ¿Hacen revisión de código entre pares antes de integrar? ¿Cómo gestionan librerías de terceros?',ev:'Guía de codificación; pull requests recientes con revisor distinto al autor; reporte de análisis de código o de dependencias.',al:'El mismo desarrollador aprueba y despliega; contraseñas o llaves escritas dentro del código; librerías desactualizadas con vulnerabilidades conocidas.'},
  {ref:['A.8.8'],q:'¿Cómo se enteran de vulnerabilidades en las librerías que usan y cómo las corrigen?',ev:'Reporte de escaneo de dependencias y tiempos de corrección.',al:'Sin ninguna herramienta ni proceso.'},
  {ref:['A.8.29'],q:'¿Qué pruebas se hacen antes de liberar (funcionales, de seguridad, aceptación del usuario)? ¿Quién aprueba la salida a producción? Muéstreme las dos últimas liberaciones.',ev:'Plan y resultados de pruebas; acta de aceptación; resultados de escaneos o pentest.',al:'Se prueba directamente en producción; sin criterios de aceptación; vulnerabilidades críticas abiertas al liberar.'},
  {ref:['A.8.31'],q:'¿Existen entornos separados de desarrollo, pruebas y producción? ¿Quién accede a cada uno? ¿Los desarrolladores pueden modificar producción directamente?',ev:'Diagrama de entornos; lista de accesos por entorno.',al:'Mismo servidor o base de datos para pruebas y producción; desarrolladores con administración de producción.'},
  {ref:['A.8.33','A.8.11','A.5.34'],sug:true,q:'¿Qué datos se usan en las pruebas? ¿Se usan datos reales de clientes? ¿Se enmascaran?',ev:'Muestra de la base de datos de pruebas.',al:'Copia de la base de producción con datos reales en el entorno de pruebas.'},
  {ref:['A.8.32'],sug:true,q:'¿Cómo controlan los cambios a los sistemas? ¿Quién autoriza, cómo planifican el despliegue y la reversión (rollback)? Muéstreme 3 cambios del último trimestre.',ev:'Expedientes de cambio con aprobación y plan de reversión.',al:'Cambios urgentes sin registro posterior; el solicitante se aprueba a sí mismo.'},
  {ref:['A.8.4'],sug:true,q:'¿Quién tiene acceso al código fuente? ¿Dónde está alojado y se exige doble factor? ¿Qué pasa cuando alguien deja la empresa?',ev:'Pida ver la lista de miembros del repositorio y compárela con la nómina; revise si hay ramas protegidas.',al:'Ex-empleados o cuentas genéricas con acceso; acceso total para todos.'},
  {ref:['A.8.27'],sug:true,q:'¿Aplican principios de arquitectura segura (mínimo privilegio, defensa en profundidad)? ¿Quién los revisa?',ev:'Documento de arquitectura y su revisión.',al:''},
  {ref:['A.8.30','A.5.21'],sug:true,q:'¿Hay desarrollo subcontratado? ¿Cómo exigen seguridad al proveedor y cómo revisan lo que entrega?',ev:'Contrato con requisitos de seguridad; revisión de entregables.',al:'El proveedor trabaja directamente sobre producción sin supervisión.'}
 ]},

servicios_ti:{
 objetivo:'Comprobar que los servicios y productos TI se operan con seguridad: continuidad, monitoreo, gestión de incidentes, cambios, capacidad e inventario de activos.',
 simple:'Aquí hay dos temas que el cronograma NO asigna a nadie y que son de los más importantes: gestión de incidentes (A.5.24-A.5.28) y gestión de cambios/activos. Se los agregué como «sugeridos». El orden recomendado: continuidad → incidentes → monitoreo → cambios.',
 prep:['Catálogo de servicios y SLA ofrecidos a clientes','Plan de continuidad (BCP/DRP) y análisis de impacto (BIA)','Informe de la última prueba de recuperación','Registro de incidentes de los últimos 12 meses','Inventario de activos','Contratos con proveedores críticos (nube, hosting, conectividad)'],
 preguntas:[
  {ref:['8.1'],q:'¿Qué servicios y productos TI ofrece la organización? ¿Cuáles son los más críticos y cuáles están dentro del alcance del SGSI?',ev:'Catálogo de servicios y su relación con el alcance.',al:'Servicios críticos fuera del alcance.'},
  {ref:['A.5.29'],q:'¿Cómo mantienen la seguridad durante una interrupción (falla grave, ciberataque, desastre)? ¿Qué controles se mantienen o se relajan en contingencia?',ev:'Plan de continuidad con requisitos de seguridad, BIA.',al:'El plan ignora la seguridad (ej.: en emergencia se comparten contraseñas); nunca se probó.'},
  {ref:['A.5.30'],q:'¿Cuáles son los RTO y RPO de los sistemas críticos? ¿Cuándo fue la última prueba de recuperación? ¿Qué resultado tuvo y qué corrigieron?',ev:'Informe de prueba con fecha, participantes, resultados y acciones. (RTO = tiempo máximo para volver a operar; RPO = máxima pérdida de datos tolerable.)',al:'Prueba de más de 12 meses o inexistente; el RTO declarado no se alcanzó en la prueba y no se actuó.'},
  {ref:['A.5.24','A.5.25','A.5.26','A.5.27'],sug:true,q:'Cuénteme del último incidente de seguridad: cómo se detectó, quién lo evaluó, cómo lo clasificó, qué se hizo y qué aprendieron. Muéstreme el registro.',ev:'Procedimiento de incidentes; registro del último año con clasificación, causa raíz, tiempos y lecciones aprendidas.',al:'«No hemos tenido incidentes» (muy improbable: detección débil); incidentes sin análisis de causa; la misma falla se repite; sin criterios de clasificación.'},
  {ref:['A.5.28'],sug:true,q:'Si hubiera que investigar un incidente, ¿cómo preservan la evidencia (registros, imágenes de disco)? ¿Quién la custodia?',ev:'Procedimiento; ejemplo de custodia.',al:'Se reinstala el equipo antes de preservar evidencia.'},
  {ref:['A.8.16'],q:'¿Qué monitorean (servidores, red, aplicaciones, accesos)? ¿Quién revisa las alertas y qué ocurre fuera de horario?',ev:'Panel de monitoreo EN VIVO; ejemplos de alertas, tickets generados y tiempos de respuesta.',al:'Alertas que nadie atiende; monitoreo solo en horario laboral con SLA 24/7 comprometido a clientes.'},
  {ref:['A.8.14'],sug:true,q:'¿Qué sistemas críticos tienen redundancia (servidores, enlaces, energía)? ¿Probaron la conmutación?',ev:'Arquitectura y prueba de failover.',al:'Un único punto de falla en un servicio comprometido con SLA alto.'},
  {ref:['A.8.32','A.8.9'],sug:true,q:'¿Cómo gestionan los cambios en producción (ventanas, aprobación, pruebas, reversión)? Elijamos 3 cambios y muéstreme su expediente.',ev:'Expedientes de cambio completos.',al:'Cambios directos sin registro; cambios de emergencia sin revisión posterior.'},
  {ref:['A.8.6'],sug:true,q:'¿Cómo monitorean la capacidad (almacenamiento, procesamiento, ancho de banda) y planifican el crecimiento?',ev:'Informes de capacidad.',al:'Se reacciona solo cuando el disco se llena.'},
  {ref:['A.5.9'],sug:true,q:'Muéstreme el inventario de activos. ¿Quién es el dueño de cada activo y cuándo se actualizó? (Pruebe en las dos direcciones: 3 equipos reales → inventario; 3 del inventario → existen.)',ev:'Inventario actualizado con propietario y clasificación.',al:'Inventario desactualizado o sin dueños.'},
  {ref:['A.5.37'],sug:true,q:'¿Existen procedimientos operativos documentados para tareas críticas (respaldo, altas y bajas, despliegues) y están al alcance de quien los usa?',ev:'2 procedimientos y evidencia de que se siguen.',al:'Todo está en la cabeza de una persona.'},
  {ref:['A.5.19','A.5.22','A.5.23'],sug:true,q:'¿Qué proveedores críticos usan (nube, hosting, conectividad)? ¿Cómo revisan su desempeño y su seguridad (certificaciones, informes, SLA)?',ev:'Contratos, SLA, informes de desempeño, certificados del proveedor (ej. ISO 27001, SOC 2).',al:'Proveedor crítico sin contrato, sin revisión desde la contratación; responsabilidades en la nube no definidas.'}
 ]},

legal:{
 objetivo:'Comprobar que la empresa identifica y cumple los requisitos legales y contractuales de seguridad, la propiedad intelectual, la retención de registros y la protección de datos personales.',
 simple:'A.5.31 a A.5.34. La pregunta de fondo: ¿qué leyes y contratos nos obligan en materia de información y cómo sabemos que los cumplimos?',
 prep:['Matriz de requisitos legales con fecha','Tabla de retención documental','Política de privacidad','Muestra de 3 contratos con clientes y 3 con proveedores','Inventario de licencias de software'],
 preguntas:[
  {ref:['4.2','A.5.31'],q:'¿Cuál es el listado de requisitos legales, reglamentarios y contractuales sobre seguridad de la información (datos personales, delitos informáticos, propiedad intelectual, sector, clientes)? ¿Quién lo mantiene y cuándo se actualizó? ¿Incluye, por ejemplo, la Ley 172-13 (datos personales), la Ley 53-07 (delitos de alta tecnología), la Ley 65-00 (derecho de autor) y la Ley 310-14 (correos comerciales no solicitados)? Verifique vigencia con el propio Asesor Legal: son referencias para orientarse, no asesoría legal.',ev:'Pida la matriz de cumplimiento de requisitos legales: debe tener fecha de revisión, responsable y evaluación de cumplimiento.',al:'Matriz sin actualizar; ignora requisitos contractuales; sin responsable.'},
  {ref:['A.5.31'],q:'¿Cómo verifican el cumplimiento de cada requisito? ¿Hay evidencia?',ev:'Evaluación de cumplimiento legal.',al:'Se asume cumplimiento sin verificación.'},
  {ref:['A.5.32'],q:'¿Cómo garantizan que todo el software esté licenciado? ¿Controlan licencias de código abierto en lo que desarrollan?',ev:'Inventario de licencias vs. instalaciones (muestra de 3 equipos).',al:'Software sin licencia; sin control de licencias de código abierto en productos propios.'},
  {ref:['A.5.33'],q:'¿Qué registros deben conservarse y por cuánto tiempo (contratos, financieros, personal, registros)? ¿Cómo se protegen contra pérdida, alteración y acceso no autorizado?',ev:'Tabla de retención y ubicación de los registros.',al:'Sin tabla de retención; destrucción sin control.'},
  {ref:['A.5.34'],q:'¿Cuentan con política de privacidad, registro de bases de datos, responsable designado, procedimiento para atender derechos de las personas y para notificar brechas? ¿Hubo reclamos o requerimientos de autoridades?',ev:'Política, registro, procedimientos y casos atendidos.',al:'No saben qué ley aplica ni qué plazo tienen para notificar una brecha.'},
  {ref:['A.5.20'],sug:true,q:'¿Qué cláusulas de seguridad y confidencialidad incluyen los contratos con clientes y proveedores? ¿Existe plantilla estándar? Muéstreme 3 contratos.',ev:'Contratos y plantilla.',al:'Contratos sin confidencialidad ni derecho de auditoría.'},
  {ref:['A.5.5'],sug:true,q:'¿Quién contacta a las autoridades (reguladores, policía cibernética) ante un incidente? ¿Está definido y vigente el contacto?',ev:'Lista de contactos y procedimiento.',al:''}
 ]},

revision:{
 objetivo:'Comprobar que la dirección revisa el SGSI con las entradas que exige 9.3.2 y toma decisiones documentadas y con seguimiento (9.3.3). Verificar que Presidente y VP conocen política, objetivos y principales riesgos.',
 simple:'Es la única sesión con la alta dirección. La matriz le asigna la cláusula 5, pero lo central es 9.3. En 1 hora y con dos directivos, no hay tiempo para descubrir cosas: llegue con el acta ya revisada y use la entrevista para confirmar.',
 prep:['Actas de revisión por la dirección de los últimos 2 años (solicitar antes)','Informe de auditoría interna anterior','Indicadores del SGSI','Estado de riesgos y de acciones correctivas'],
 preguntas:[
  {ref:['9.3'],q:'¿Con qué frecuencia hacen la revisión por la dirección? ¿Cuándo fue la última y quiénes participaron?',ev:'Acta con fecha, asistentes y agenda.',al:'Se hace una vez al año «de papel», sin la alta dirección.'},
  {ref:['9.3'],q:'Verifique en el acta que estén las entradas: (a) estado de acciones previas; (b) cambios en cuestiones internas y externas; (c) cambios en necesidades de partes interesadas; (d) desempeño: NC, seguimiento y medición, auditorías, objetivos; (e) retroalimentación de partes interesadas; (f) resultados de riesgos y estado del plan de tratamiento; (g) oportunidades de mejora.',ev:'Acta vs. lista 9.3.2 (a-g). Marque cuál falta.',al:'Faltan las entradas (c) o (f): son las que suelen olvidarse.'},
  {ref:['9.3'],q:'¿Qué decisiones se tomaron (oportunidades de mejora, necesidad de cambios al SGSI, recursos)? ¿Quién las ejecuta y para cuándo? ¿Cómo se les da seguimiento?',ev:'Acta con decisiones, responsables, plazos y verificación en la reunión siguiente.',al:'Acta meramente informativa, sin decisiones; decisiones sin seguimiento.'},
  {ref:['5.1'],q:'(Presidente) ¿Qué decisiones concretas tomó en el último año sobre seguridad de la información y qué recursos asignó?',ev:'Aprobaciones, presupuesto, comunicados.',al:'No recuerda ninguna decisión.'},
  {ref:['5.2','6.2'],q:'¿Cuál es la política de seguridad y cuáles son los objetivos de este año? (Pida que los digan con sus palabras.)',ev:'Compare con la política y los objetivos documentados.',al:'No los conocen o los describen distinto.'},
  {ref:['6.1.2','6.1.3'],q:'¿Cuáles son los 3 principales riesgos de seguridad de la información de la empresa y quién aceptó el riesgo residual?',ev:'Compare con la matriz de riesgos.',al:'No conocen los riesgos principales; el riesgo residual lo acepta TI y no el negocio.'},
  {ref:['5.3'],q:'¿Quién es el responsable del SGSI, a quién reporta y con qué frecuencia le informa?',ev:'Designación y frecuencia de reportes.',al:''},
  {ref:['9.2'],q:'¿Conoce los resultados de la última auditoría interna y las acciones tomadas?',ev:'Informe anterior y plan de acciones.',al:'Las acciones correctivas nunca llegaron a la dirección.'},
  {ref:['9.1'],q:'¿Qué indicadores del SGSI revisa la dirección (procesos y controles de seguridad), con qué frecuencia y qué decisiones ha tomado a partir de ellos?',ev:'Tablero o informe de indicadores; acta donde se analizan.',al:'Se miden cosas que nadie analiza; sin indicadores de controles de seguridad.'},
  {ref:['10.1','10.2'],q:'Ante una no conformidad (auditoría, incidente, queja) ¿cómo se corrige, se analiza la causa y se verifica que la acción fue eficaz? Muéstreme un caso reciente completo.',ev:'Registro de no conformidad con causa raíz, acción, responsable y verificación de eficacia.',al:'Acciones que corrigen el síntoma pero no la causa; sin verificación de eficacia; auditoría anterior con acciones sin cerrar (puede constituir NC mayor según la definición de la empresa).'}
 ]},

soa:{
 especial:'soa',
 objetivo:'Auditar los controles del Anexo A que la Declaración de Aplicabilidad de la empresa declara aplicables (los 93) y verificar la integridad del documento SoA.',
 simple:'La herramienta sabe qué controles verificó usted en otras sesiones. Primero valide el SoA como documento y luego recorra los controles pendientes, empezando por los de mayor riesgo; use la lista de verificación FOR-SGI-10 como apoyo.',
 prep:['SoA vigente (versión y fecha)','Matriz de riesgos y plan de tratamiento','Resumen de lo verificado en la semana (pestaña «Cobertura»)','Acordar con los auditados el horario de cada bloque temático'],
 preguntas:[
  {ref:['6.1.3'],q:'La Declaración de Aplicabilidad lista los 93 controles de ISO 27001:2022 (numeración A.5 a A.8, no la de 2013) y cada uno indica si aplica.',ev:'Cuente los controles del documento.',al:'Aparecen controles A.9 a A.18 (numeración 2013); faltan controles.'},
  {ref:['6.1.3'],q:'Cada control tiene la justificación de su inclusión o exclusión. Revise 10 filas al azar y confirme que la justificación responde a un riesgo o requisito, no a una descripción genérica del control.',ev:'Revise 10 filas al azar.',al:'Justificaciones vacías o que solo describen para qué sirve el control.'},
  {ref:['6.1.2','6.1.3'],q:'Hay trazabilidad entre riesgos, plan de tratamiento y SoA. Tome 3 riesgos y rastréelos hasta el control.',ev:'Riesgo → control → evidencia de implementación.',al:'Riesgos sin controles asociados en el SoA; controles sin riesgo que los origine.'},
  {ref:['6.1.3','7.5'],q:'El SoA tiene versión, fecha de aprobación y aprobación de la alta dirección.',ev:'Control documental: versión, fecha, elaborador, aprobador.',al:'SoA sin versión, fecha o aprobación.'},
  {ref:['4.3','6.1.3'],q:'El alcance del SGSI es coherente con los controles que el SoA declara aplicables.',ev:'Alcance vs. SoA.',al:'Un proceso dentro del alcance sin controles aplicables asociados.'}
 ]},

equipo:{
 especial:'equipo',
 etiqueta:'Puntos de la reunión',
 objetivo:'Consolidar la evidencia del día, acordar la clasificación de hallazgos con el equipo y preparar el día siguiente.',
 simple:'Es el momento de calibrar criterios entre auditores. Que dos auditores clasifiquen distinto el mismo hecho es un riesgo mayor que cualquier hallazgo.',
 prep:[],
 preguntas:[
  {ref:[],q:'Cada auditor presenta sus hallazgos del día con requisito, evidencia y clasificación.',ev:''},
  {ref:[],q:'¿La evidencia es suficiente y verificable (documento, fecha, muestra, quién lo mostró)?',ev:'',al:'Hallazgos basados en una sola opinión o en memoria.'},
  {ref:[],q:'Se acuerda la clasificación (mayor, menor, observación, OM) con criterio común.',ev:''},
  {ref:[],q:'¿Se confirmaron los hechos con el auditado antes de cerrar el día?',ev:'',al:'Hallazgos que el auditado verá recién en el informe.'},
  {ref:[],q:'¿Hay hallazgos que afectan a procesos de otro auditor (para cruzar información)?',ev:''},
  {ref:[],q:'Pendientes y evidencias por solicitar para mañana.',ev:''},
  {ref:[],q:'Revisión del plan del día siguiente y roles.',ev:''}
 ]},

pendientes:{
 especial:'pendientes',
 etiqueta:'Pendientes',
 objetivo:'Cerrar todo lo que quedó abierto con evidencia, para no entregar un informe con vacíos.',
 simple:'La herramienta junta automáticamente todas las preguntas que quedaron como «pendiente» o «requiere seguimiento» en sus sesiones. Priorícelas por riesgo.',
 prep:[],
 preguntas:[]
 },

informe:{
 especial:'informe',
 etiqueta:'Estructura del informe',
 objetivo:'Preparar el informe con trazabilidad total entre hallazgos, evidencias y requisitos.',
 simple:'ISO 19011 (6.6) indica qué debe incluir el informe. La herramienta genera un borrador con sus hallazgos que usted puede copiar a Word.',
 prep:[],
 preguntas:[]
 },

cierre:{
 etiqueta:'Guion de la reunión',
 objetivo:'Presentar los resultados con claridad, sin sorpresas, y acordar los siguientes pasos.',
 simple:'ISO 19011 (6.5). Si hizo las validaciones diarias, aquí nadie debería enterarse de algo nuevo.',
 prep:['Borrador de informe y resumen de hallazgos','Lista de asistencia','Aclaraciones previas con los responsables de procesos'],
 preguntas:[
  {ref:[],q:'Agradecer, recordar alcance y criterios, y presentar al equipo.',ev:''},
  {ref:[],q:'Recordar que la auditoría fue por MUESTREO: la ausencia de hallazgos no garantiza que no existan.',ev:''},
  {ref:[],q:'Presentar fortalezas y buenas prácticas observadas.',ev:''},
  {ref:[],q:'Presentar hallazgos: cantidad por clasificación, descripción, requisito y evidencia.',ev:''},
  {ref:[],q:'Presentar la conclusión sobre el grado de cumplimiento de los criterios y la eficacia del SGSI.',ev:''},
  {ref:[],q:'Explicar plazos y proceso para planes de acción (análisis de causa, acción correctiva, verificación de eficacia).',ev:''},
  {ref:[],q:'Registrar discrepancias que no se hayan resuelto y cómo se gestionarán.',ev:'',al:'Auditado en desacuerdo con un hallazgo y sin registro formal.'},
  {ref:[],q:'Confidencialidad, distribución del informe y fecha prevista de emisión.',ev:''},
  {ref:[],q:'Cerrar con agradecimiento y lista de asistencia.',ev:''}
 ]}
};

/* Preguntas transversales: se pueden hacer a CUALQUIER entrevistado (cubren 5.2, 6.2, 7.3, A.6.3, A.6.8, A.7.7…) */
const TRANSVERSALES=[
{ref:['5.2'],q:'¿Conoce la política de seguridad de la información? ¿Dónde la encuentra y qué dice, con sus palabras?',ev:'Respuesta espontánea; compare con la política.',al:'No la conoce o no sabe dónde está.'},
{ref:['6.2','7.3'],q:'¿Conoce los objetivos de seguridad y cómo su trabajo contribuye a ellos?',ev:'',al:'Ninguna idea; «eso es cosa de TI».'},
{ref:['A.6.3','7.3'],q:'¿Qué capacitación en seguridad recibió y cuándo? ¿Recuerda algo?',ev:'Registro de asistencia a capacitaciones.',al:'Sin capacitación en más de un año.'},
{ref:['A.6.8'],q:'Si recibe un correo sospechoso o pierde un equipo, ¿qué hace y a quién avisa?',ev:'Canal de reporte; registro de reportes.',al:'No saben qué hacer o a quién; reportan por canales informales.'},
{ref:['A.6.4','7.3'],q:'¿Qué pasa si alguien incumple las reglas de seguridad?',ev:'Proceso disciplinario conocido.',al:'«Nunca ha pasado nada».'},
{ref:['A.5.10','A.8.1'],q:'¿Puede usar su cuenta, equipo o USB personales para trabajar? ¿Qué reglas conoce?',ev:'Política de uso aceptable.',al:'Uso de dispositivos y cuentas personales sin reglas.'},
{ref:['A.7.7'],q:'(Observación) ¿Bloquea la pantalla al levantarse? Documentos a la vista en el escritorio.',ev:'Observación directa.',al:'Pantallas desbloqueadas, contraseñas en notas adhesivas.'}
];

/* Preparación general previa (hoy) */
const PREP_GENERAL=[
'Confirmar con el líder del equipo: ¿quién cubre la verificación técnica? ¿qué versión del cronograma es la vigente?',
'Solicitar con anticipación: SoA, matriz de riesgos, alcance, política, informe de auditoría anterior, plan de tratamiento.',
'Confirmar el procedimiento interno de auditoría: definiciones de NC mayor/menor, plazos de respuesta, formatos.',
'Leer (30 min) los apartados de «Más → Biblioteca» sobre cláusulas 4, 6 y 9.3, el método y el glosario.',
'Preparar el equipo: laptop o tablet cargada, copia de la herramienta, formato de lista de asistencia.',
'Verificar el ámbito legal aplicable al país de la empresa (ley de datos personales) con el Asesor Legal.'
];
