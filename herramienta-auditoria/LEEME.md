# Guía de Auditoría ISO 27001:2022 – Soluciones Globales JM

Herramienta de apoyo para el auditor Alan Montilla. Se basa en el cronograma
«Auditoría Interna Soluciones Globales JM (ISO 9001, ISO 27001, ISO 20000-1)», la
Declaración de Aplicabilidad (SoA) de la empresa y la matriz de entregables de la
revisión del SoA. Cada pregunta muestra lo que el SoA declara del control.

## Cómo usarla

1. Abra el archivo **`Guia-Auditoria-ISO27001.html`** con Chrome, Edge o Safari
   (doble clic). No necesita internet ni instalar nada.
2. Pestaña **Plan**: su calendario, lo que debe preparar y la sesión siguiente.
3. Dentro de cada sesión: **1 · Preparar** (qué debe demostrar y qué pedir antes),
   **2 · Preguntar** (preguntas, evidencia a pedir, señales de alerta, resultado y
   notas) y **3 · Cerrar** (resumen y hallazgos).
4. Toque cualquier código azul (por ejemplo `A.8.13`) para ver qué significa en simple.
5. **Hallazgos**: se crean desde una pregunta y la herramienta verifica que estén bien
   redactados (requisito, evidencia objetiva, hechos, validación con el auditado).
6. **Cobertura**: qué requisitos están asignados en el cronograma y cuáles ha
   verificado realmente.
7. **Cronograma**: revisión crítica del Excel (puntos que conviene aclarar con el líder
   del equipo).
8. **Biblioteca**: cláusulas, los 93 controles del Anexo A, glosario y técnicas de entrevista.
9. **Solicitud documental** (desde el Plan): los 31 documentos que el SoA de la empresa cita como evidencia.
10. **Datos**: descargue un respaldo al final de cada día.

## Confidencialidad

Todo se guarda **solo en el navegador del dispositivo** donde lo use; nada se envía a
ningún servidor. Si borra los datos del navegador se pierde: haga respaldos (pestaña Datos).

## Para quien mantenga los archivos

Los fuentes están en `src/`. Después de editarlos, ejecute `python3 construir.py`
para regenerar el HTML único.
