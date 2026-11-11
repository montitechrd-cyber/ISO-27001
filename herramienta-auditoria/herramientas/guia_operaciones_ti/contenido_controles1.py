# -*- coding: utf-8 -*-
"""Controles del Anexo A (ISO/IEC 27001:2022) relacionados con «Gestión de Operaciones TI». Parte 1: A.5.9 a A.5.28."""

CONTROLES_1 = [
{'id':'A.5.9','nombre':'Inventario de información y otros activos asociados','en':'Inventory of information and other associated assets','rol':'relacionado','prio':2,
 'exige':'La empresa debe tener una lista actualizada de sus [[activo]]s (equipos, programas, bases de datos, servicios), y cada uno debe tener un dueño: la persona responsable de protegerlo. El inventario debe mantenerse al día.',
 'importa':'No se puede proteger lo que no se sabe que existe. Un servidor olvidado, sin parches y sin dueño es una de las formas más comunes de ser atacado.',
 'preguntas':[
  ('Muéstreme el inventario de activos. ¿Quién lo mantiene, cuándo se actualizó por última vez y con qué frecuencia se revisa?','Debe tener fecha de actualización reciente (idealmente menos de seis meses) y un responsable de mantenerlo.'),
  ('Para cada activo del inventario, ¿dónde se indica quién es su dueño?','Cada línea debe tener un dueño con nombre o puesto, no «Sistemas» en general.'),
  ('¿Cómo se registra un equipo o servicio nuevo y cómo se da de baja uno que ya no se usa?','Debe existir un procedimiento y un caso reciente de alta y de baja.')],
 'evidencias':['Inventario de activos con dueño, ubicación, clasificación y fecha de última actualización','Procedimiento de gestión del inventario','Registros de altas y bajas recientes'],
 'prueba':'Haga la prueba en las DOS direcciones: (1) elija 3 equipos que usted vea físicamente en el área y compruebe que están en el inventario; (2) elija 3 líneas del inventario y pida que se los muestren. Si falla alguna, el inventario no es confiable.',
 'alertas':['Inventario sin fecha o de hace más de un año','Activos sin dueño','Equipos reales que no están en el inventario','Activos del inventario que ya no existen'],
 'nc':'No existe inventario, o de la muestra revisada más de un caso no coincide con la realidad (activos no registrados o sin dueño).'},

{'id':'A.5.19','nombre':'Seguridad de la información en las relaciones con proveedores','en':'Information security in supplier relationships','rol':'relacionado','prio':2,
 'exige':'La empresa debe definir y aplicar procesos para manejar los riesgos de seguridad que vienen de usar productos o servicios de proveedores. Incluye saber qué proveedores son [[proveedor_critico]]es, qué requisitos de seguridad se les exigen y dejarlos por escrito en el contrato.',
 'importa':'Muchos servicios de operaciones dependen de terceros (nube, [[hosting]], conectividad). Si el proveedor falla o es atacado, el servicio de la empresa también cae, aunque la empresa haya hecho todo bien.',
 'preguntas':[
  ('¿Cuáles son los proveedores de los que dependen los servicios que ustedes operan? ¿Cuáles consideran críticos y por qué?','Debe haber una lista con criterio de criticidad. Compárela con lo que usted ve en el catálogo de servicios.'),
  ('Muéstreme el contrato de tres proveedores críticos. ¿Dónde están las cláusulas de seguridad, confidencialidad y atención de incidentes?','Cada contrato debe tener cláusulas de seguridad. Un contrato solo comercial es insuficiente.'),
  ('¿Qué pasa si el proveedor tiene un incidente que afecta sus datos? ¿Está obligado a avisar y en cuánto tiempo?','Debe existir una obligación contractual de notificar con un plazo.')],
 'evidencias':['Lista de proveedores con su criticidad','Contratos o acuerdos de nivel de servicio de una muestra de 3 proveedores críticos','Acuerdos de confidencialidad firmados'],
 'prueba':'Pida el contrato de un proveedor crítico y busque con el dedo la palabra «seguridad», «confidencialidad» o «incidente». Si no aparece, anótelo.',
 'alertas':['Proveedor crítico sin contrato','Contratos sin cláusulas de seguridad','Lista de proveedores desactualizada','Nadie sabe quién es el responsable de la relación'],
 'nc':'Existen proveedores críticos sin requisitos de seguridad acordados por escrito, o no hay proceso para gestionarlos.'},

{'id':'A.5.22','nombre':'Seguimiento, revisión y gestión del cambio de los servicios de proveedores','en':'Monitoring, review and change management of supplier services','rol':'relacionado','prio':2,
 'exige':'La empresa no solo debe contratar bien: debe vigilar regularmente que el proveedor cumpla (prácticas de seguridad y calidad del servicio) y gestionar los cambios que el proveedor introduce.',
 'importa':'Un proveedor que cumplía hace dos años puede haber dejado de cumplir. Sin revisión periódica, la empresa se entera cuando ya hay un problema.',
 'preguntas':[
  ('¿Cómo y con qué frecuencia revisan el desempeño de los proveedores críticos (cumplimiento del acuerdo de nivel de servicio, incidentes, informes de seguridad)?','Debe haber revisiones con fecha, participantes y conclusiones.'),
  ('¿Cuándo fue la última vez que el proveedor tuvo una falla que los afectó? ¿Qué hicieron?','Debe haber un registro del caso y una acción.'),
  ('¿Cómo se enteran cuando el proveedor cambia algo importante (de ubicación, de subcontratista, de tecnología)?','Debe haber un canal o una cláusula de notificación.'),
  ('¿Tienen el informe SOC 2 u otra certificación independiente del proveedor y está vigente?','Revise la fecha de emisión y el alcance (que cubra el servicio contratado).')],
 'evidencias':['Actas o informes de revisión de proveedores','Informes de cumplimiento del acuerdo de nivel de servicio','Certificaciones o informes independientes del proveedor y su vigencia'],
 'prueba':'Pida la última revisión de un proveedor crítico y compruebe fecha, quién participó y qué se decidió.',
 'alertas':['Nunca se ha revisado a los proveedores','Certificaciones vencidas','Incumplimientos del acuerdo de servicio sin reclamo','Cambios del proveedor no comunicados'],
 'nc':'No se realiza ninguna revisión de los proveedores críticos, o se revisaron y no se actuó ante incumplimientos conocidos.'},

{'id':'A.5.23','nombre':'Seguridad de la información para el uso de servicios en la nube','en':'Information security for use of cloud services','rol':'relacionado','prio':2,
 'exige':'Si la empresa usa [[nube]], debe tener procesos definidos para contratar, usar, administrar y, muy importante, terminar esos servicios de acuerdo con sus requisitos de seguridad. Debe quedar claro qué le corresponde proteger a la empresa y qué al proveedor (responsabilidad compartida).',
 'importa':'Mucha gente asume que «lo de la nube lo protege el proveedor». En realidad, configuraciones, accesos y copias de seguridad suelen ser responsabilidad de la empresa.',
 'preguntas':[
  ('¿Qué servicios en la nube usa la empresa para operar sus servicios y quién los aprobó?','Debe haber una lista con responsable. Un servicio contratado «con tarjeta» por un empleado, sin aprobación, es una señal de alerta.'),
  ('¿Dónde está escrito qué le corresponde proteger a la empresa y qué al proveedor?','Debe haber un documento o cláusula que reparta responsabilidades.'),
  ('Si mañana la empresa decide dejar ese proveedor, ¿cómo recupera sus datos y cómo se asegura de que el proveedor los borre?','Debe existir un plan de salida con recuperación y borrado de datos.')],
 'evidencias':['Lista de servicios en la nube con responsable','Contratos y documento de responsabilidad compartida','Procedimiento o plan de salida del servicio'],
 'prueba':'Elija un servicio en la nube y pida ver quién tiene permisos de administrador. Compare con la lista de empleados actuales.',
 'alertas':['Servicios contratados sin aprobación','No se sabe quién administra la cuenta','Sin plan de salida','Datos de clientes en la nube sin acuerdo de confidencialidad'],
 'nc':'La empresa usa servicios en la nube que procesan información del SGSI sin requisitos de seguridad definidos ni responsable.'},

{'id':'A.5.24','nombre':'Planificación y preparación de la gestión de incidentes de seguridad de la información','en':'Information security incident management planning and preparation','rol':'relacionado','prio':1,
 'exige':'La empresa debe definir, de antemano, cómo manejará los [[incidente]]s: qué procedimiento sigue, quién hace qué, cómo se clasifican por gravedad, a quién se avisa y cómo se comunica. Todos los involucrados deben conocerlo.',
 'importa':'En el momento de un ataque no hay tiempo para decidir quién manda. Si el procedimiento no existe o nadie lo conoce, la reacción es lenta y desordenada y el daño crece.',
 'preguntas':[
  ('¿Existe un procedimiento de gestión de incidentes? Muéstremelo: ¿quién lo aprobó y cuándo se revisó?','Debe tener versión, fecha y aprobador vigentes.'),
  ('¿Quién forma el equipo de respuesta, cómo se les contacta fuera de horario y quién toma la decisión final?','Debe haber una lista de roles con teléfonos actualizados y suplentes.'),
  ('¿Cómo se clasifican los incidentes (por ejemplo, bajo, medio, alto, crítico) y qué cambia según la clasificación?','Debe haber criterios claros y plazos de atención por nivel.'),
  ('¿Cuándo se avisa a los clientes, a la dirección o a las autoridades?','Debe haber criterios escritos y, si hay obligación contractual o legal, deben estar identificados.')],
 'evidencias':['Procedimiento de gestión de incidentes','Lista de roles y contactos del equipo de respuesta','Criterios de clasificación y escalamiento','Registro de capacitación o simulacro de incidentes'],
 'prueba':'Pregunte a un operador, sin avisar, qué haría si detecta un correo sospechoso o un servidor comprometido. Compare su respuesta con el procedimiento.',
 'alertas':['No hay procedimiento escrito','Contactos desactualizados','El equipo no conoce el procedimiento','Nunca se ha hecho un simulacro'],
 'nc':'No existe un proceso de gestión de incidentes definido y comunicado, o existe pero el personal que debe aplicarlo lo desconoce.'},

{'id':'A.5.25','nombre':'Evaluación y decisión sobre eventos de seguridad de la información','en':'Assessment and decision on information security events','rol':'relacionado','prio':1,
 'exige':'No todo [[evento]] es un [[incidente]]. La empresa debe evaluar cada evento reportado y decidir, con criterios definidos, si lo clasifica como incidente y con qué gravedad. Debe dejar registro de la decisión.',
 'importa':'Si todo se trata como incidente, el equipo se satura; si nada se trata como incidente, se pasan por alto ataques reales. Los criterios claros evitan ambos extremos.',
 'preguntas':[
  ('Cuando llega un aviso o una alerta, ¿quién decide si es un incidente y con qué criterios? ¿Dónde están escritos?','Debe haber criterios concretos y una persona o rol responsable de decidir.'),
  ('Muéstreme tres eventos del último año: uno que se clasificó como incidente, otro que se descartó y otro dudoso. ¿Qué decidieron y por qué?','Debe haber registro con la decisión y su justificación, incluyendo los eventos descartados.'),
  ('¿En cuánto tiempo se evalúa un evento después de recibirlo?','Debe haber un plazo definido y registros que lo respalden.')],
 'evidencias':['Registro de eventos con su evaluación y decisión','Criterios de clasificación de eventos e incidentes','Tiempos entre la recepción y la evaluación'],
 'prueba':'Pida el listado de eventos del último trimestre. Compruebe que se registran también los descartados y que cada uno tiene fecha, responsable y decisión.',
 'alertas':['Solo se registran los incidentes graves','Eventos sin evaluar durante días','Clasificaciones sin justificación','Todos los eventos se clasifican igual'],
 'nc':'No se evalúan sistemáticamente los eventos reportados, o la evaluación no deja registro.'},

{'id':'A.5.26','nombre':'Respuesta a incidentes de seguridad de la información','en':'Response to information security incidents','rol':'relacionado','prio':1,
 'exige':'Los [[incidente]]s deben atenderse siguiendo el procedimiento documentado: contener el daño, eliminar la causa, recuperar el servicio y comunicar a quien corresponda. Todo debe quedar registrado con fechas y responsables.',
 'importa':'Es la prueba real de si el sistema funciona: un procedimiento perfecto no sirve si en el incidente real se improvisa.',
 'preguntas':[
  ('Cuénteme del último incidente de seguridad: ¿cómo y cuándo se detectó, quién lo atendió, qué se hizo primero y cuánto tardó la recuperación?','Pida el [[ticket]] o expediente y compare cada fecha con lo que le cuentan. Deben coincidir.'),
  ('¿Se siguió el procedimiento documentado? ¿Hubo pasos que se saltaron?','Si el responsable admite desviaciones, pregunte por qué y si se corrigió el procedimiento.'),
  ('¿A quién se informó (dirección, clientes, autoridades) y en qué momento?','Debe existir registro de las comunicaciones y deben cumplir los plazos contractuales o legales.')],
 'evidencias':['Expediente completo del último incidente (detección, evaluación, contención, recuperación, cierre)','Registro de comunicaciones realizadas','Informe final del incidente'],
 'prueba':'Elija usted un incidente de la lista (no el que le ofrezcan) y reconstruya con el expediente la secuencia de fechas.',
 'alertas':['Incidentes sin expediente','Fechas del relato que no coinciden con los registros','Cierre sin informe','No se avisó a un cliente afectado'],
 'nc':'Hay incidentes atendidos sin seguir el procedimiento definido o sin registro, de manera repetida.'},

{'id':'A.5.27','nombre':'Aprendizaje de los incidentes de seguridad de la información','en':'Learning from information security incidents','rol':'relacionado','prio':2,
 'exige':'Después de cada [[incidente]] importante, la empresa debe analizar qué pasó, por qué ([[RCA]]) y qué cambia para que no se repita, y usar ese conocimiento para reforzar sus controles.',
 'importa':'Quien no aprende de sus incidentes los repite. Es también lo que conecta con la mejora continua exigida por la cláusula 10.',
 'preguntas':[
  ('Del último incidente importante, ¿qué análisis de causa raíz se hizo y qué se cambió como resultado?','Debe haber un informe con causa, acción y responsable. «Se reinició el servidor» no es una acción de aprendizaje.'),
  ('¿Con qué frecuencia se revisan en conjunto los incidentes para detectar patrones?','Debe existir una revisión periódica (por ejemplo, trimestral) con acta.'),
  ('¿Se ha repetido algún incidente? ¿Por qué ocurrió otra vez?','Un incidente repetido indica que la acción anterior fue insuficiente.')],
 'evidencias':['Informes de causa raíz de incidentes','Actas de revisión de incidentes','Acciones de mejora derivadas y su cierre'],
 'prueba':'Elija un incidente con acción de mejora y compruebe que la acción se implementó (pida verla funcionando).',
 'alertas':['Cierre del incidente sin análisis de causa','Mismas fallas repetidas','Lecciones sin responsables'],
 'nc':'No se analizan los incidentes para aprender de ellos y los incidentes se repiten por la misma causa.'},

{'id':'A.5.28','nombre':'Recopilación de evidencias','en':'Collection of evidence','rol':'relacionado','prio':3,
 'exige':'La empresa debe tener procedimientos para identificar, recopilar y conservar las evidencias de un evento o incidente (registros, imágenes de discos, correos), de forma que puedan usarse en una investigación o un proceso legal, manteniendo la [[custodia]].',
 'importa':'Si se reinstala un equipo comprometido antes de guardar evidencia, se pierde la prueba de lo que ocurrió y, si hay que reclamar legalmente, no hay con qué.',
 'preguntas':[
  ('Cuando hay un incidente grave, ¿qué evidencias se preservan antes de limpiar o reinstalar un equipo y quién se encarga?','Debe existir un procedimiento y un responsable. Si la respuesta es «se reinstala de inmediato», es una alerta.'),
  ('¿Cómo se garantiza que la evidencia no se altere y quién la guarda?','Debe existir registro de custodia o, al menos, copia protegida con acceso restringido.')],
 'evidencias':['Procedimiento de recopilación y preservación de evidencias','Ejemplo de evidencia preservada de un incidente con registro de custodia'],
 'prueba':'Pregunte por un incidente grave pasado y pida ver dónde se guardaron los registros de ese día.',
 'alertas':['Se reinstala sin preservar','Evidencias en lugares sin control de acceso','Sin responsable'],
 'nc':'Existen incidentes graves sin ninguna evidencia preservada y sin procedimiento para hacerlo.'},
]
