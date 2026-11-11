# Solicitud de evidencias · Gestión de Operaciones TI (Servicios y Productos TI) · Miércoles 11 de noviembre de 2026

Preguntas en el orden numérico de los controles del Anexo A de la ISO/IEC 27001:2022. Auditor: Alan Montilla.

> Pida evidencias de una muestra, no de todo. Anote fecha, responsable y quién la mostró. Una declaración verbal no es evidencia hasta que se vea el registro.

---

# Requisitos del SGSI (cláusulas 4 a 10)

## 1. ¿Qué servicios y productos TI ofrece la organización? ¿Cuáles son los más críticos y cuáles están dentro del alcance del SGSI?
*Requisitos: 8.1*

- [ ] Catálogo de servicios y productos TI con clientes y acuerdos de nivel de servicio (SLA)
- [ ] Identificación de los servicios críticos y su relación con el alcance del SGSI (documento de alcance)
- [ ] Análisis de impacto al negocio (BIA) o clasificación de criticidad de servicios
- [ ] Organigrama y roles del área de operaciones, con responsable por servicio

---

# A.5 · Controles organizacionales

## 2. Muéstreme el inventario de activos. ¿Quién es el dueño de cada activo y cuándo se actualizó? (Pruebe en las dos direcciones: 3 equipos reales → inventario; 3 del inventario → existen.)
*Requisitos: A.5.9*

- [ ] Inventario de activos con propietario, ubicación, clasificación y fecha de última actualización
- [ ] Prueba en dos direcciones: 3 equipos hallados en campo contra el inventario y 3 del inventario ubicados físicamente
- [ ] Procedimiento de gestión del inventario y de asignación de propietarios
- [ ] Registro de devolución de activos de personas que salieron en los últimos 6 meses
- [ ] Esquema de clasificación y etiquetado de la información y su aplicación en una muestra

## 3. ¿Qué proveedores críticos usan (nube, hosting, conectividad)? ¿Cómo revisan su desempeño y su seguridad (certificaciones, informes, SLA)?
*Requisitos: A.5.19, A.5.22, A.5.23*

- [ ] Lista de proveedores críticos (nube, hosting, conectividad, soporte) con su criticidad
- [ ] Contratos y SLA de una muestra de 3 proveedores críticos, con cláusulas de seguridad y confidencialidad
- [ ] Evaluación inicial y revisión periódica del proveedor (desempeño, incidentes, auditorías)
- [ ] Certificaciones o informes independientes del proveedor (ej.: ISO 27001, SOC 2) vigentes y su alcance
- [ ] Acuerdos de confidencialidad firmados y plan de salida o terminación del servicio
- [ ] Incidentes o cambios del proveedor que afectaron a la empresa y su gestión

## 4. Cuénteme del último incidente de seguridad: cómo se detectó, quién lo evaluó, cómo lo clasificó, qué se hizo y qué aprendieron. Muéstreme el registro.
*Requisitos: A.5.24, A.5.25, A.5.26, A.5.27*

- [ ] Procedimiento de gestión de incidentes de seguridad: roles, clasificación, escalamiento y comunicación
- [ ] Registro de incidentes de los últimos 12 meses con clasificación, fechas de detección y cierre, causa raíz y acción tomada
- [ ] Expediente completo del último incidente: detección, evaluación, contención, recuperación e informe final
- [ ] Evidencia de lecciones aprendidas y de cambios derivados (controles, capacitación, procedimientos)
- [ ] Eventos reportados por usuarios, clientes o proveedores y cómo se decidió si eran incidentes
- [ ] Evidencia de notificación a clientes o autoridades cuando correspondía según contratos y normativa aplicable

## 5. Si hubiera que investigar un incidente, ¿cómo preservan la evidencia (registros, imágenes de disco)? ¿Quién la custodia?
*Requisitos: A.5.28*

- [ ] Procedimiento de recolección y preservación de evidencia digital
- [ ] Registro de cadena de custodia de un caso real o simulado (quién, cuándo, dónde se guardó)
- [ ] Evidencia de retención de registros e imágenes del último incidente investigado
- [ ] Roles autorizados a recolectar evidencia y su formación

## 6. ¿Cómo mantienen la seguridad durante una interrupción (falla grave, ciberataque, desastre)? ¿Qué controles se mantienen o se relajan en contingencia?
*Requisitos: A.5.29*

- [ ] Plan de continuidad del negocio y de recuperación ante desastres (BCP/DRP) vigente, con fecha, versión y aprobación
- [ ] Sección del plan que defina qué controles de seguridad se mantienen en contingencia (accesos, cifrado, registros)
- [ ] Análisis de impacto al negocio (BIA) y evaluación de riesgos de continuidad
- [ ] Lista de contactos y roles de crisis actualizada, y evidencia de su difusión
- [ ] Registro de activación del plan en un evento real o simulacro, con lecciones aprendidas

## 7. ¿Cuáles son los RTO y RPO de los sistemas críticos? ¿Cuándo fue la última prueba de recuperación? ¿Qué resultado tuvo y qué corrigieron?
*Requisitos: A.5.30*

- [ ] Tabla de RTO y RPO por sistema crítico, aprobada por la dirección o los dueños del servicio
- [ ] Informe de la última prueba de recuperación: fecha, alcance, participantes, tiempos reales frente a RTO/RPO y resultado
- [ ] Plan de acciones correctivas derivado de la prueba y evidencia de su cierre
- [ ] Calendario anual de pruebas de continuidad y recuperación
- [ ] Reportes de respaldos o réplicas que sustentan el RPO declarado

## 8. ¿Existen procedimientos operativos documentados para tareas críticas (respaldo, altas y bajas, despliegues) y están al alcance de quien los usa?
*Requisitos: A.5.37*

- [ ] Procedimientos operativos documentados de al menos 2 tareas críticas (respaldo, altas y bajas, despliegue)
- [ ] Registros de ejecución recientes de esos procedimientos, que demuestren que se siguen
- [ ] Control documental: versión, fecha de aprobación y acceso del personal que los usa
- [ ] Verificación de campo: que un operador explique o ejecute el procedimiento sin ayuda de su autor

---

# A.8 · Controles tecnológicos

## 9. ¿Cómo monitorean la capacidad (almacenamiento, procesamiento, ancho de banda) y planifican el crecimiento?
*Requisitos: A.8.6*

- [ ] Informes de capacidad de almacenamiento, procesamiento y ancho de banda de los últimos meses
- [ ] Umbrales y alertas de capacidad configurados
- [ ] Plan de crecimiento o presupuesto asociado a las proyecciones
- [ ] Evidencia de una ampliación de capacidad realizada de forma planificada (no reactiva)

## 10. ¿Cómo gestionan los cambios en producción (ventanas, aprobación, pruebas, reversión)? Elijamos 3 cambios y muéstreme su expediente.
*Requisitos: A.8.9, A.8.32*

- [ ] Procedimiento de gestión de cambios: solicitud, evaluación de riesgo, aprobación, pruebas, implementación y reversión
- [ ] Expedientes completos de 3 cambios recientes elegidos por usted (solicitud, aprobación, pruebas, reversión y cierre)
- [ ] Registro de cambios de emergencia y su revisión posterior
- [ ] Calendario de ventanas de cambio y comunicaciones a las partes afectadas
- [ ] Verificación de que el solicitante no se aprueba a sí mismo (roles distintos)
- [ ] Configuración antes y después de uno de los cambios

## 11. ¿Qué sistemas críticos tienen redundancia (servidores, enlaces, energía)? ¿Probaron la conmutación?
*Requisitos: A.8.14*

- [ ] Diagrama de arquitectura con puntos únicos de falla y componentes redundantes
- [ ] Evidencia de redundancia en energía, enlaces y servidores de los sistemas críticos
- [ ] Informe de la última prueba de conmutación (failover) con su resultado
- [ ] Contratos de enlaces o nube que sustentan la disponibilidad comprometida en el SLA

## 12. ¿Qué monitorean (servidores, red, aplicaciones, accesos)? ¿Quién revisa las alertas y qué ocurre fuera de horario?
*Requisitos: A.8.16*

- [ ] Panel o consola de monitoreo mostrado EN VIVO: qué sistemas cubre y alertas abiertas
- [ ] Lista de elementos monitoreados cotejada contra el inventario de activos críticos
- [ ] Alertas del último mes con su ticket, responsable y tiempo de respuesta
- [ ] Esquema de guardias o turnos para atención fuera de horario, coherente con el SLA comprometido
- [ ] Procedimiento de revisión de alertas y umbrales definidos
- [ ] Reporte periódico de monitoreo al responsable del servicio o a la dirección

---

# Preguntas transversales (a 2-3 personas del área)

## 13. ¿Conoce la política de seguridad de la información? ¿Dónde la encuentra y qué dice, con sus palabras?
*Requisitos: 5.2*

- [ ] Política de seguridad de la información vigente (versión, fecha y aprobación de la dirección)
- [ ] Evidencia de comunicación de la política al personal (correo, intranet, inducción, firma de recepción)
- [ ] Verificación de campo: preguntar a 2-3 empleados al azar y anotar la respuesta espontánea

## 14. ¿Conoce los objetivos de seguridad y cómo su trabajo contribuye a ellos?
*Requisitos: 6.2, 7.3*

- [ ] Objetivos de seguridad de la información con indicadores, meta, responsable y fecha de medición
- [ ] Evidencia de comunicación de los objetivos al área
- [ ] Verificación de campo: que el entrevistado explique con sus palabras cómo contribuye su trabajo

## 15. ¿Qué capacitación en seguridad recibió y cuándo? ¿Recuerda algo?
*Requisitos: 7.3, A.6.3*

- [ ] Plan anual de capacitación y concientización en seguridad
- [ ] Registros de asistencia o certificados de los entrevistados (fecha, tema, duración)
- [ ] Evaluaciones o simulacros de phishing y sus resultados
- [ ] Evidencia de inducción en seguridad para el personal nuevo

## 16. Si recibe un correo sospechoso o pierde un equipo, ¿qué hace y a quién avisa?
*Requisitos: A.6.8*

- [ ] Procedimiento de reporte de eventos e incidentes de seguridad y canal oficial (correo, ticket)
- [ ] Registro de eventos e incidentes reportados en el último año con su análisis y cierre
- [ ] Evidencia de que el entrevistado conoce el canal (cartelera, intranet o respuesta verbal)

## 17. ¿Qué pasa si alguien incumple las reglas de seguridad?
*Requisitos: 7.3, A.6.4*

- [ ] Proceso disciplinario aplicable a incumplimientos de seguridad, comunicado al personal
- [ ] Cláusulas de seguridad en contratos o acuerdos de confidencialidad firmados (muestra)
- [ ] Casos de incumplimiento tratados en el último año y su resolución (sin datos personales innecesarios)

## 18. ¿Puede usar su cuenta, equipo o USB personales para trabajar? ¿Qué reglas conoce?
*Requisitos: A.5.10, A.8.1*

- [ ] Política de uso aceptable de activos, correo, internet y dispositivos, con aceptación del personal
- [ ] Reglas para uso de cuentas, equipos y USB personales
- [ ] Excepciones autorizadas y controles compensatorios

## 19. (Observación) ¿Bloquea la pantalla al levantarse? Documentos a la vista en el escritorio.
*Requisitos: A.7.7*

- [ ] Observación directa de escritorios y pantallas durante el recorrido (anotar hora y área, sin fotografiar personas)
- [ ] Política de escritorio y pantalla limpios, con fecha y aprobación
- [ ] Configuración de bloqueo automático de pantalla (política del sistema)
