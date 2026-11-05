/* ===== EVIDENCIAS A SOLICITAR POR PREGUNTA =====
   Clave: id de la pregunta (sesión.n; las transversales, sesión.T n).
   Cada evidencia es un registro, documento u observación concreta que se puede pedir y ver.
   Criterio: evidencia OBJETIVA y verificable (registros con fecha y responsable), no declaraciones.
   Son listas orientativas: el auditor decide la muestra y puede pedir más o menos según el riesgo. */
const EVID={
'tecnologia.1':[
 'Presupuesto de seguridad de la información del año en curso y su ejecución (o el rubro de TI/seguridad dentro del presupuesto general)',
 'Organigrama del área de TI y seguridad, con nombres y funciones; descripción de puestos con responsabilidades de seguridad',
 'Listado de herramientas de seguridad con licencia/soporte vigente (antivirus/EDR, firewall, respaldo, gestor de parches) y fecha de vencimiento',
 'Documento donde la dirección determinó y aprobó los recursos del SGSI (acta de revisión por la dirección o aprobación del plan)',
 'Contratos de soporte con proveedores críticos de seguridad o infraestructura'],
'tecnologia.2':[
 'Política o procedimiento de protección contra malware, con fecha de aprobación y versión',
 'Consola del antivirus/EDR mostrada EN VIVO: total de equipos y servidores, protegidos, con definiciones actualizadas, con alertas abiertas',
 'Inventario de activos de TI para cotejar contra la consola (muestra: 5 equipos que figuren en uno y se busquen en el otro)',
 'Registro de detecciones de malware del último trimestre y cómo se atendió cada una',
 'Evidencia de que el agente no puede ser desinstalado por el usuario (configuración o política de la consola)'],
'tecnologia.3':[
 'Procedimiento de gestión de vulnerabilidades (frecuencia, criterios de criticidad, plazos de corrección)',
 'Último informe de escaneo de vulnerabilidades y los dos anteriores (para ver la tendencia)',
 'Listado de vulnerabilidades críticas y altas con fecha de detección, responsable, fecha de cierre y estado',
 'Informe de prueba de penetración (si aplica según el riesgo) y plan de remediación con seguimiento',
 'Inventario de software con fechas de fin de soporte del fabricante (identificar sistemas sin soporte)',
 'Evidencia de cierre de 3 vulnerabilidades críticas (reescaneo o captura posterior a la corrección)'],
'tecnologia.4':[
 'Procedimiento o política de gestión de parches y actualizaciones',
 'Reporte de la herramienta de parches: equipos con actualizaciones pendientes, hoy y su antigüedad',
 'Calendario o registros de ventanas de mantenimiento de los últimos 3 meses',
 'Registros de cambio de 2 actualizaciones importantes (aprobación, prueba previa y plan de reversión)',
 'Excepciones aprobadas para equipos que no se pueden actualizar, con justificación y control compensatorio'],
'tecnologia.5':[
 'Política de copias de respaldo: qué se respalda, frecuencia, retención, ubicación y cifrado',
 'Reportes de ejecución de los respaldos de los últimos 30 días, incluidos fallos y cómo se reintentaron',
 'Acta o registro de la última prueba de restauración: fecha, qué se restauró, resultado, tiempo y quién la realizó',
 'Evidencia de copia fuera del sitio o en nube (ubicación, acceso) y de protección contra borrado/ransomware (copia inmutable o aislada)',
 'Relación entre lo respaldado y los sistemas críticos del análisis de impacto o plan de continuidad (RPO/RTO definidos)',
 'Registro de respaldos fallidos con acción correctiva (muestra de 3)',
 'Prueba presencial: pedir la restauración de un archivo elegido por usted y observarla'],
'tecnologia.6':[
 'Diagrama de red actualizado, con fecha y versión',
 'Política de seguridad de redes y de uso de VPN/acceso remoto',
 'Listado de reglas del firewall exportado en el momento y acta de la última revisión de reglas (fecha, revisor, reglas eliminadas o ajustadas)',
 'Configuración de la red WiFi de invitados que demuestre su separación de la red interna',
 'Lista de servicios expuestos a Internet con justificación de negocio de cada uno',
 'Lista de usuarios con acceso VPN, comparada contra la nómina vigente',
 'Contratos y acuerdos de nivel de servicio del proveedor de internet y de servicios de red'],
'tecnologia.7':[
 'Diagrama de segmentación: redes/VLAN de usuarios, servidores, invitados y administración',
 'Reglas de comunicación entre segmentos (qué puede hablar con qué) y su aprobación',
 'Prueba de campo: desde la red de invitados, intentar llegar a un recurso interno (con acompañamiento del personal de TI)'],
'tecnologia.8':[
 'Política de uso de criptografía y gestión de llaves, con fecha y aprobación',
 'Inventario de certificados digitales con fecha de vencimiento y responsable de renovación',
 'Evidencia de cifrado de disco en una muestra de laptops (consola de gestión o verificación en pantalla)',
 'Evidencia de cifrado de los respaldos y de datos en tránsito (configuración TLS de los sitios y servicios críticos)',
 'Procedimiento de custodia de llaves/contraseñas maestras: dónde se guardan, quién accede, respaldo de las llaves',
 'Registro de renovación de los dos últimos certificados vencidos o próximos a vencer'],
'tecnologia.9':[
 'Procedimiento de altas, cambios y bajas de usuarios y de accesos',
 'Lista de administradores (de dominio, de aplicaciones críticas y de bases de datos) y acta de su última revisión',
 'Solicitudes de acceso de una muestra de 5 altas recientes, con su aprobación del jefe/dueño del sistema',
 'Listado de empleados que salieron en los últimos 6 meses (de RRHH) cotejado con las cuentas activas: ninguna debería seguir activa',
 'Evidencia de MFA habilitada en correo, VPN y consolas de administración (configuración o lista de usuarios con MFA)',
 'Última revisión periódica de derechos de acceso a sistemas críticos, con las correcciones realizadas',
 'Cuentas genéricas, compartidas o de servicio: inventario, responsable y justificación',
 'Política de contraseñas y su aplicación técnica (configuración del directorio)'],
'tecnologia.10':[
 'Política de dispositivos móviles/portátiles y de uso de equipos personales (BYOD)',
 'Configuración de gestión de dispositivos (MDM o equivalente): cifrado, bloqueo de pantalla, borrado remoto',
 'Inspección de 3 equipos elegidos al azar: cifrado activo, bloqueo automático, antivirus y parches al día',
 'Registro de equipos perdidos o robados y las acciones tomadas (borrado remoto, reporte de incidente)',
 'Inventario/asignación de equipos con responsable y firma de entrega'],
'tecnologia.11':[
 'Política o configuración de registros: qué eventos se auditan (accesos, cambios de privilegios, acciones administrativas) y retención',
 'Muestra real de registros de un sistema crítico del último mes',
 'Evidencia de que los registros están protegidos contra modificación o borrado (envío a servidor central, permisos)',
 'Registro de revisión de los logs o alertas (SIEM o revisión manual): quién, cuándo y qué encontró',
 'Sincronización horaria de los sistemas (configuración NTP) para la validez de los registros'],
'tecnologia.12':[
 'Documento de línea base o estándar de configuración segura de servidores y equipos',
 'Comparación de la configuración real de 2 equipos contra la línea base',
 'Evidencia de detección de cambios no autorizados y un caso real de desviación atendida',
 'Gestión de cambios: registro de un cambio de configuración reciente con su aprobación'],
'tecnologia.13':[
 'Política de uso aceptable y de transferencia de información, con constancia de aceptación del personal',
 'Configuración del bloqueo de USB/dispositivos externos y excepciones autorizadas',
 'Reglas de filtrado web y de prevención de fuga de datos (DLP) o de correo; reporte de bloqueos del último mes',
 'Reglas de acceso a servicios en la nube y almacenamiento personal',
 'Muestra de una excepción aprobada con su justificación y fecha de revisión'],
'tecnologia.14':[
 'Procedimiento de seguridad física del cuarto de servidores y áreas seguras',
 'Bitácora de acceso físico (visitas y personal) del último mes y lista de personas autorizadas',
 'Registros de mantenimiento y de prueba de climatización, UPS/planta eléctrica y extinción de incendios (con fechas)',
 'Fecha de vencimiento de los extintores y señalización observada en el recorrido',
 'Evidencia de cámaras y su retención de grabaciones',
 'Observación directa durante el recorrido: puerta, orden del cableado, uso como almacén'],
'tecnologia.15':[
 'Procedimiento de eliminación segura y reutilización de equipos, discos y medios',
 'Certificados de borrado seguro o destrucción de los últimos equipos dados de baja (fecha, método, responsable)',
 'Registro de baja de activos en el inventario, cotejado con los certificados (muestra de 3)',
 'Contrato y acreditaciones del proveedor que realiza la destrucción o el reciclaje, si es externo'],
'tecnologia.T1':[
 'Política de seguridad de la información vigente (versión, fecha y aprobación de la dirección)',
 'Evidencia de comunicación de la política al personal (correo, intranet, inducción, firma de recepción)',
 'Verificación de campo: preguntar a 2-3 empleados al azar y anotar la respuesta espontánea'],
'tecnologia.T2':[
 'Objetivos de seguridad de la información con indicadores, meta, responsable y fecha de medición',
 'Evidencia de comunicación de los objetivos al área',
 'Verificación de campo: que el entrevistado explique con sus palabras cómo contribuye su trabajo'],
'tecnologia.T3':[
 'Plan anual de capacitación y concientización en seguridad',
 'Registros de asistencia o certificados de los entrevistados (fecha, tema, duración)',
 'Evaluaciones o simulacros de phishing y sus resultados',
 'Evidencia de inducción en seguridad para el personal nuevo'],
'tecnologia.T4':[
 'Procedimiento de reporte de eventos e incidentes de seguridad y canal oficial (correo, ticket)',
 'Registro de eventos e incidentes reportados en el último año con su análisis y cierre',
 'Evidencia de que el entrevistado conoce el canal (cartelera, intranet o respuesta verbal)'],
'tecnologia.T5':[
 'Proceso disciplinario aplicable a incumplimientos de seguridad, comunicado al personal',
 'Cláusulas de seguridad en contratos o acuerdos de confidencialidad firmados (muestra)',
 'Casos de incumplimiento tratados en el último año y su resolución (sin datos personales innecesarios)'],
'tecnologia.T6':[
 'Política de uso aceptable de activos, correo, internet y dispositivos, con aceptación del personal',
 'Reglas para uso de cuentas, equipos y USB personales',
 'Excepciones autorizadas y controles compensatorios'],
'tecnologia.T7':[
 'Observación directa de escritorios y pantallas durante el recorrido (anotar hora y área, sin fotografiar personas)',
 'Política de escritorio y pantalla limpios, con fecha y aprobación',
 'Configuración de bloqueo automático de pantalla (política del sistema)']
};
