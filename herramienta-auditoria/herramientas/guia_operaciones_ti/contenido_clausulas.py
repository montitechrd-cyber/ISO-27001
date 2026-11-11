# -*- coding: utf-8 -*-
"""Fichas de las cláusulas de la norma ISO/IEC 27001:2022 que tocan el proceso «Gestión de Operaciones TI».
prio: 1 = imprescindible hoy · 2 = importante · 3 = solo cruzar con lo ya auditado en otra sesión (o si sobra tiempo)."""

CLAUSULAS_OPS = [
{'id':'4.3','nombre':'Determinación del alcance del Sistema de Gestión de Seguridad de la Información','prio':2,
 'exige':'La empresa debe haber definido, por escrito, qué partes del negocio protege el [[SGSI]]: qué procesos, qué ubicaciones, qué sistemas y qué servicios entran, y cuáles quedan fuera. Debe tener en cuenta lo que dependen de terceros (proveedores) y lo que ofrece a clientes.',
 'importa':'Si un servicio que se vende a clientes (por ejemplo, un sistema alojado para un cliente) queda fuera del alcance, la empresa podría estar prometiendo seguridad que el [[SGSI]] no garantiza. Este proceso (operaciones de [[TI]]) es justamente el que sostiene los servicios.',
 'preguntas':[
  ('¿Puede mostrarme el documento de alcance del Sistema de Gestión de Seguridad de la Información y señalarme dónde aparece la operación de los servicios y productos de tecnologías de la información?','Debe poder señalar el párrafo o el cuadro exacto. Si tiene que buscar mucho o no sabe dónde está, el alcance no es conocido por quien opera.'),
  ('De los servicios que la empresa vende o presta, ¿cuáles son los críticos y están todos dentro del alcance? ¿Hay alguno que se preste a clientes y no esté incluido?','Debe haber una lista de servicios y su relación con el alcance. Un servicio vendido y no incluido es una brecha.'),
  ('¿Qué proveedores o servicios externos sostienen estos servicios y cómo aparecen reflejados en el alcance (interfaces y dependencias)?','El alcance debe mencionar las dependencias (nube, conectividad, hosting). Si no las menciona, el alcance está incompleto.')],
 'evidencias':['Documento de alcance del SGSI vigente (fecha, versión, aprobación)','Catálogo de servicios y productos de TI','Lista de proveedores que sostienen esos servicios'],
 'prueba':'Tome 2 servicios del catálogo de ventas y 2 del alcance. Compruebe que cada uno de los 4 aparece en ambos documentos.',
 'alertas':['El alcance no menciona operaciones de TI ni los servicios que se venden','Servicios críticos vendidos a clientes fuera del alcance','Alcance sin fecha o sin aprobación','El responsable de operaciones no sabe qué dice el alcance'],
 'nc':'Hay un servicio en operación que debería estar en el alcance y no lo está, o el documento de alcance no existe (el requisito 4.3 pide que esté disponible como información documentada).'},

{'id':'4.4','nombre':'Sistema de gestión de la seguridad de la información','prio':3,
 'exige':'La empresa debe tener establecido, funcionando, mantenido y mejorado el [[SGSI]] con sus procesos y la forma en que se relacionan. En términos prácticos: no basta con tener documentos; los procesos (como operaciones de [[TI]]) deben funcionar de la manera descrita.',
 'importa':'Un sistema que existe solo en papel no protege nada. La mejor forma de comprobarlo en esta sesión es seguir un caso real de principio a fin.',
 'preguntas':[
  ('¿Cómo se relaciona el trabajo de operaciones de TI con el resto del Sistema de Gestión de Seguridad de la Información (riesgos, incidentes, cambios, proveedores)? ¿Dónde está eso documentado?','Debe poder describir con sus palabras cómo se conectan: un riesgo alto genera un control; un incidente genera una acción; un cambio pasa por aprobación.'),
  ('Elijamos juntos el último incidente de la lista: ¿puede mostrarme cada paso que se siguió según el procedimiento?','Esta es la verdadera prueba. Si los pasos reales coinciden con el procedimiento, el sistema funciona.')],
 'evidencias':['Mapa de procesos o descripción de procesos del SGSI','Un caso completo trazable (por ejemplo, un cambio o un incidente reciente)'],
 'prueba':'Siga un solo incidente o un solo cambio desde el aviso inicial hasta el cierre. Anote cada documento que le muestren.',
 'alertas':['Los procedimientos describen una cosa y la práctica es otra','Cada área trabaja aislada sin conexión con el SGSI'],
 'nc':'El proceso real no coincide con el documentado de forma sistemática (varios casos), o no hay forma de demostrar que el proceso se opera.'},

{'id':'5.3','nombre':'Roles, responsabilidades y autoridades en la organización','prio':2,
 'exige':'La alta dirección debe asignar y comunicar quién es responsable de qué en seguridad de la información. En operaciones de [[TI]] esto significa que cada servicio, cada activo y cada tarea crítica tenga un responsable con nombre y apellido.',
 'importa':'Cuando todos son responsables, nadie lo es. Un servicio sin responsable es el que se cae sin que nadie actúe.',
 'preguntas':[
  ('¿Quién es el responsable de cada servicio crítico y quién lo reemplaza si no está? ¿Dónde está definido por escrito?','Debe haber nombres (o puestos) concretos y un suplente. «Todo el equipo» no es una respuesta válida.'),
  ('¿Quién decide, de forma final, cuándo se declara un incidente de seguridad y cuándo se activa el plan de continuidad?','Debe existir una persona o un comité con esa autoridad. Si nadie sabe, la decisión se paraliza justo cuando más se necesita.')],
 'evidencias':['Organigrama del área de operaciones','Descripciones de puesto con responsabilidades de seguridad','Documento de asignación de responsables por servicio o por activo'],
 'prueba':'Pregunte a una segunda persona del equipo quién es el responsable de un servicio. Compare con lo que dijo el gerente.',
 'alertas':['Dos personas dicen que el responsable es distinto','Una sola persona sostiene todo sin suplente','Responsabilidades no escritas'],
 'nc':'No hay responsables asignados para los servicios o activos críticos, o las responsabilidades definidas no se conocen ni se cumplen.'},

{'id':'6.1.2 y 6.1.3','nombre':'Apreciación de los riesgos de seguridad de la información (6.1.2) y Tratamiento de los riesgos (6.1.3)','prio':3,
 'exige':'La empresa debe tener un método para identificar riesgos (qué puede salir mal, qué tan probable es y qué tan grave sería) y decidir qué hacer con cada uno (reducirlo con un control, aceptarlo, evitarlo o transferirlo). Debe existir un plan de tratamiento aprobado por el dueño del riesgo y la [[SoA]] debe ser coherente con ese plan.',
 'importa':'Estas cláusulas ya se auditaron en la sesión de planificación del 4 de noviembre. Hoy solo se cruzan con el proceso de operaciones: los riesgos de continuidad, caída de servicios, proveedores y cambios deben estar en la matriz de riesgos.',
 'preguntas':[
  ('¿Qué riesgos de la matriz de riesgos afectan a operaciones de TI (caída de servicios, falla de proveedores, pérdida de datos, errores en cambios)? ¿Puede mostrármelos?','Debe poder señalar riesgos concretos de operaciones. Si la matriz no los contiene, la matriz no refleja la realidad del proceso.'),
  ('Tomemos un riesgo alto de operaciones: ¿qué tratamiento se decidió, qué control lo reduce y dónde está la evidencia de que ese control está implementado?','Debe poder seguir el camino riesgo → decisión → control → evidencia.')],
 'evidencias':['Matriz de riesgos con los riesgos de operaciones de TI','Plan de tratamiento de riesgos con responsable y fechas','Declaración de Aplicabilidad (SoA) con los controles relacionados'],
 'prueba':'Elija un riesgo alto y compruebe que tiene control asignado, responsable, fecha y evidencia de que se cumplió.',
 'alertas':['Riesgos de operaciones ausentes de la matriz','Riesgos altos sin tratamiento','Tratamiento sin responsable o con fecha vencida'],
 'nc':'Un riesgo alto de operaciones no tiene tratamiento definido ni aceptación formal del dueño del riesgo.'},

{'id':'6.2','nombre':'Objetivos de seguridad de la información y planificación para su consecución','prio':2,
 'exige':'La empresa debe fijar objetivos de seguridad medibles, con responsable, plazo y forma de medirse. Para operaciones de [[TI]] esto significa indicadores concretos, como el porcentaje de tiempo disponible de los servicios o el tiempo de atención de incidentes.',
 'importa':'Sin medidas no se sabe si el proceso mejora o empeora. Es la base para que la dirección pueda decidir.',
 'preguntas':[
  ('¿Qué objetivos o indicadores de seguridad tiene el área de operaciones (por ejemplo, disponibilidad de servicios o tiempo de atención de incidentes)? ¿Cómo y con qué frecuencia se miden?','Debe haber números concretos con meta, no frases generales.'),
  ('¿Cuál fue el resultado del último mes y qué se hizo cuando no se cumplió la meta?','Si hay una meta incumplida sin ninguna acción, el objetivo no se gestiona.')],
 'evidencias':['Lista de objetivos con meta, responsable, frecuencia de medición y fecha','Reporte del último periodo con resultados reales','Evidencia de acciones por metas incumplidas'],
 'prueba':'Pida los resultados de los últimos 3 meses de un indicador y verifique que existen los 3 registros y que se midió de la misma forma.',
 'alertas':['Objetivos sin números','Mediciones antiguas o inexistentes','Metas incumplidas sin acción'],
 'nc':'No existen objetivos de seguridad para el proceso o existen pero no se miden.'},

{'id':'6.3','nombre':'Planificación de los cambios (requisito nuevo en la versión 2022)','prio':2,
 'exige':'Cuando la empresa decide cambiar el propio Sistema de Gestión de Seguridad de la Información (por ejemplo, añadir un servicio, cambiar el alcance, adoptar una nueva plataforma), el cambio debe planificarse: para qué se hace, qué consecuencias tiene, qué recursos requiere y quién lo ejecuta.',
 'importa':'No es lo mismo que el control A.8.32 (cambios técnicos en los sistemas). Esta cláusula trata de cambios en el sistema de gestión, que en operaciones ocurren cuando se lanza un servicio nuevo o se migra a otra plataforma.',
 'preguntas':[
  ('¿Se ha lanzado un servicio nuevo, migrado una plataforma o cambiado algo importante en el último año? ¿Cómo se planificó y cómo se verificó que no debilitaba la seguridad?','Debe haber un registro de planificación: motivo, riesgos revisados, responsable y recursos.'),
  ('Cuando ocurre un cambio así, ¿se actualiza el alcance, la matriz de riesgos y la Declaración de Aplicabilidad?','Debe haber coherencia: si cambió el servicio, cambió la documentación.')],
 'evidencias':['Plan o acta del último cambio importante','Evidencia de actualización de alcance, riesgos y SoA después del cambio'],
 'prueba':'Compare la fecha del último servicio nuevo con la fecha de la última actualización de la matriz de riesgos.',
 'alertas':['Servicios nuevos sin evaluación de riesgos','Documentación que no se actualizó después del cambio'],
 'nc':'Hubo un cambio importante en el sistema o en los servicios y no existe evidencia de que se planificó ni de que se actualizó la documentación del SGSI.'},

{'id':'7.1','nombre':'Recursos','prio':2,
 'exige':'La empresa debe determinar y proporcionar los recursos necesarios (personas, herramientas, presupuesto, tiempo) para establecer, mantener y mejorar el [[SGSI]].',
 'importa':'Un área de operaciones de [[TI]] con una sola persona, o con licencias vencidas, no puede sostener los compromisos con los clientes.',
 'preguntas':[
  ('¿Cuántas personas trabajan en operaciones y qué parte de su tiempo dedican a seguridad? ¿Considera que son suficientes?','Compare la respuesta con el organigrama. Si la persona dice que no son suficientes, pregunte qué se ha solicitado a la dirección.'),
  ('¿Qué herramientas usa el área (monitoreo, copias de seguridad, gestión de tickets) y están todas con licencia y soporte vigente?','Pida la lista con fechas de vencimiento.'),
  ('¿Qué presupuesto tiene el área para el año y se ha ejecutado?','Debe existir un presupuesto aprobado, aunque sea parte de uno mayor.')],
 'evidencias':['Presupuesto del área y su ejecución','Lista de herramientas con licencias y vencimientos','Organigrama y carga de trabajo'],
 'prueba':'Elija 2 herramientas de la lista y compruebe que la licencia no está vencida.',
 'alertas':['Una sola persona sostiene toda la operación','Licencias vencidas','Solicitudes de recursos rechazadas sin registro'],
 'nc':'Falta un recurso necesario para cumplir un compromiso del SGSI y la dirección no lo ha determinado ni atendido.'},

{'id':'7.2','nombre':'Competencia','prio':2,
 'exige':'Las personas que realizan trabajo que afecta la seguridad deben ser competentes: tener la formación, la capacitación o la experiencia necesaria, y la empresa debe conservar evidencia de ello.',
 'importa':'Un operador sin la capacitación adecuada puede cometer un error que tumbe un servicio o abra una brecha de seguridad.',
 'preguntas':[
  ('¿Qué conocimientos y certificaciones se exigen para operar los servicios críticos? ¿Dónde está definido?','Debe haber un perfil de puesto con requisitos.'),
  ('Muéstreme la capacitación en seguridad y en las herramientas que recibieron en el último año los dos integrantes del equipo.','Debe haber certificados o registros de asistencia con fecha.'),
  ('Si una persona clave se va, ¿quién puede operar en su lugar y cómo se asegura de que sepa hacerlo?','Debe existir un suplente capacitado.')],
 'evidencias':['Perfiles de puesto','Registros de capacitación y certificados','Matriz de competencias'],
 'prueba':'Elija a dos personas del equipo y compare sus certificados con los requisitos de su puesto.',
 'alertas':['Sin registros de capacitación','Competencias no verificadas','Dependencia total de una persona'],
 'nc':'Personas que operan servicios críticos no cumplen los requisitos de competencia definidos y no hay acción correctiva.'},

{'id':'7.5','nombre':'Información documentada','prio':2,
 'exige':'Los documentos y registros que la norma exige o que la empresa decidió tener deben crearse, actualizarse, aprobarse, estar disponibles para quien los necesita y protegerse. Eso incluye los procedimientos de operaciones, los registros de incidentes, los registros de cambios y los informes de pruebas.',
 'importa':'Un procedimiento desactualizado o que el operador no encuentra es peor que no tenerlo, porque da falsa seguridad. Y un registro sin fecha, sin responsable o sin firma no sirve como evidencia.',
 'preguntas':[
  ('¿Dónde guardan los procedimientos de operaciones y quién los aprueba? ¿Cómo sabe un operador que está usando la versión vigente?','Debe existir un lugar único con control de versiones, fecha y aprobador.'),
  ('Muéstreme, en el equipo del operador, dónde encuentra el procedimiento de [una tarea crítica].','Si no lo encuentra en menos de un minuto, no está realmente disponible.'),
  ('¿Cómo se protegen los registros contra borrado o modificación y por cuánto tiempo se conservan?','Debe haber una regla de conservación y permisos que impidan borrar registros.')],
 'evidencias':['Lista maestra de documentos con versión y fecha','Ejemplo de un procedimiento con fecha de aprobación y aprobador','Regla de conservación de registros'],
 'prueba':'Pida el procedimiento y verifique que tiene código, versión, fecha, aprobador y que la fecha de revisión no está vencida.',
 'alertas':['Procedimientos sin fecha o sin aprobador','Varias versiones circulando','Registros editables por cualquiera'],
 'nc':'Documentos o registros exigidos por la norma no existen, no están aprobados o no están disponibles donde se usan.'},

{'id':'8.1','nombre':'Planificación y control operativo','prio':1,
 'exige':'La empresa debe planificar, implementar y controlar los procesos necesarios para cumplir los requisitos de seguridad y para llevar a cabo las acciones definidas en la planificación de riesgos. Esto incluye: fijar criterios para cada proceso, controlarlos según esos criterios, conservar documentación suficiente para confiar en que se ejecutaron como estaba previsto, controlar los cambios planificados, revisar las consecuencias de los cambios no previstos y asegurarse de que los procesos, productos o servicios que presta un tercero y que son relevantes para el sistema estén controlados.',
 'importa':'Este es el requisito central de la sesión de hoy: la norma pide que los procesos operativos estén definidos, se ejecuten y dejen huella. Todo el trabajo de operaciones cuelga de aquí.',
 'preguntas':[
  ('¿Cuáles son los procesos de operación de los servicios (por ejemplo, atención de solicitudes, gestión de incidentes, gestión de cambios, monitoreo) y qué criterios definen que cada uno se hizo bien?','Debe haber una lista de procesos con criterios medibles (tiempos, aprobaciones, registros).'),
  ('Muéstreme tres ejemplos recientes (últimos 3 meses) de que cada proceso se ejecutó como estaba definido.','Los ejemplos deben ser recientes y de fechas distintas, elegidos por usted, no por el auditado.'),
  ('Cuando hay un cambio que no estaba planificado (una caída, un cambio urgente), ¿cómo se revisan sus consecuencias y qué se hace para reducir el daño?','Debe existir un procedimiento y al menos un caso registrado.'),
  ('¿Qué partes de la operación están subcontratadas y cómo se asegura de que el proveedor cumple lo que usted necesita?','Debe haber contratos, acuerdos de nivel de servicio y revisión periódica.')],
 'evidencias':['Procedimientos de operación con criterios definidos','Registros de ejecución de al menos 3 casos recientes de cada proceso','Registro de cambios urgentes y su revisión posterior','Contratos y revisión de procesos subcontratados'],
 'prueba':'Pida tres tickets de fechas distintas de cada proceso y verifique que cumplen los criterios del procedimiento.',
 'alertas':['Los procesos existen solo en papel','No hay registros de ejecución','Cambios urgentes sin ninguna revisión posterior','Procesos subcontratados que nadie controla'],
 'nc':'Un proceso operativo no está definido, no se ejecuta como se definió o no deja registros; o los procesos subcontratados no están controlados.'},

{'id':'8.2','nombre':'Apreciación de los riesgos de seguridad de la información (ejecución operativa)','prio':2,
 'exige':'Además del estudio de riesgos inicial, la empresa debe volver a evaluar los riesgos a intervalos planificados o cuando haya cambios significativos, y guardar la evidencia. Para operaciones esto ocurre cuando se agrega un servicio, se cambia de proveedor, se migra a la nube o se sufre un incidente grave.',
 'importa':'Un análisis de riesgos que no se actualiza queda obsoleto: los riesgos reales de hoy pueden no estar en la matriz.',
 'preguntas':[
  ('¿Cuándo fue la última vez que se revisó la matriz de riesgos y qué la motivó? ¿Cada cuánto está planificado hacerlo?','Debe haber una fecha reciente y una periodicidad definida.'),
  ('¿Qué riesgos se revisaron a raíz de los últimos incidentes o cambios importantes?','Debe haber relación entre incidentes o cambios y la matriz.')],
 'evidencias':['Matriz de riesgos con fecha de la última revisión','Acta de la última revisión de riesgos','Calendario de revisiones'],
 'prueba':'Compare las fechas del último incidente grave y de la última revisión de riesgos: la revisión debe ser posterior.',
 'alertas':['Matriz sin fecha o de hace más de un año','Incidentes que nunca llegan a la matriz'],
 'nc':'No se ha realizado la apreciación de riesgos a los intervalos que la propia empresa definió, ni tras cambios significativos.'},

{'id':'8.3','nombre':'Tratamiento de los riesgos de seguridad de la información (ejecución operativa)','prio':2,
 'exige':'La empresa debe poner en práctica el plan de tratamiento de riesgos y conservar la evidencia de los resultados. En operaciones, cada control que se prometió (por ejemplo, redundancia, monitoreo, pruebas de recuperación) debe estar efectivamente implementado.',
 'importa':'Un plan de tratamiento sin ejecutar es una promesa. Esta cláusula pide demostrar que las acciones se cumplieron.',
 'preguntas':[
  ('Tomemos 5 acciones del plan de tratamiento de riesgos que correspondan a operaciones: ¿quién es el responsable, cuál era la fecha y cuál es el estado real?','Pida el documento y compare las fechas con la realidad. Las acciones vencidas sin reprogramar son una señal de alerta.'),
  ('Para las acciones cerradas, ¿qué evidencia demuestra que se hicieron?','Cada acción cerrada debe tener un registro (captura, informe, acta).')],
 'evidencias':['Plan de tratamiento con estado de cada acción','Evidencia de las acciones cerradas'],
 'prueba':'Elija 3 acciones «cerradas» y pida la evidencia de cada una; compruebe que existe y que tiene fecha.',
 'alertas':['Acciones vencidas sin reprogramar','Acciones cerradas sin evidencia','Acciones sin responsable'],
 'nc':'Acciones del plan de tratamiento en operaciones no se ejecutaron y no existe justificación aprobada.'},

{'id':'9.1','nombre':'Seguimiento, medición, análisis y evaluación','prio':2,
 'exige':'La empresa debe decidir qué medir, cómo, cuándo, quién lo mide y quién analiza los resultados, y debe evaluar el desempeño del [[SGSI]]. Para operaciones: disponibilidad de los servicios, tiempos de respuesta a incidentes, cumplimiento de las ventanas de cambio y resultados de las pruebas de recuperación.',
 'importa':'Lo que no se mide no se gestiona. La dirección toma decisiones con estos números y los auditores externos los piden primero.',
 'preguntas':[
  ('¿Qué mide el área de operaciones, cada cuánto y quién lo revisa? Muéstreme el último informe.','Debe haber un informe con fecha, valores reales y comparación con la meta.'),
  ('¿Qué decisión se tomó a partir de esos resultados en los últimos meses?','Una medición que nunca genera decisiones indica que nadie la usa.')],
 'evidencias':['Informe de indicadores del último trimestre','Acta donde se revisaron los resultados'],
 'prueba':'Compare el valor de un indicador del informe con la fuente (por ejemplo, el número de incidentes del informe contra el listado de tickets).',
 'alertas':['Indicadores sin fecha o sin fuente','Resultados nunca revisados','Los números del informe no coinciden con los registros'],
 'nc':'No se mide ni se evalúa el desempeño del proceso, o los resultados no se analizan.'},

{'id':'10.2','nombre':'No conformidad y acción correctiva','prio':2,
 'exige':'Cuando algo no se cumple (un incidente, una falla, un hallazgo de auditoría), la empresa debe reaccionar, corregirlo, analizar la causa, tomar acciones para que no se repita, verificar que funcionaron y guardar evidencia.',
 'importa':'Un incidente que se resuelve pero cuya causa no se corrige se repite. Esta cláusula conecta la gestión de incidentes con la mejora real del sistema.',
 'preguntas':[
  ('De los incidentes del último año, ¿cuáles terminaron en una acción correctiva y qué cambió realmente?','Debe haber al menos un caso con causa raíz, acción y verificación de eficacia.'),
  ('¿Hay algún incidente que se haya repetido? ¿Por qué?','Un incidente repetido sin explicación indica acciones ineficaces.'),
  ('¿Cómo se atendieron los hallazgos de auditorías anteriores relacionados con operaciones?','Debe haber un plan, responsable, fecha y cierre con evidencia.')],
 'evidencias':['Registro de acciones correctivas','Informe de incidentes con análisis de causa raíz','Cierre de hallazgos anteriores con evidencia'],
 'prueba':'Elija un incidente, siga su acción correctiva y compruebe que existe la verificación de que funcionó.',
 'alertas':['Se corrige el síntoma y no la causa','Incidentes repetidos','Hallazgos anteriores sin cerrar'],
 'nc':'Hay incumplimientos sin acción correctiva, o acciones correctivas de auditorías anteriores sin implementar (según los criterios de la empresa esto último eleva la gravedad a MAYOR).'},
]
