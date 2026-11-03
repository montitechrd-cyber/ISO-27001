# Guía de Auditoría ISO 27001:2022 – Soluciones Globales JM

Herramienta de apoyo para el auditor Alan Montilla. Se basa en:

- el cronograma «Auditoría Interna Soluciones Globales JM (ISO 9001, ISO 27001, ISO 20000-1)»;
- la Declaración de Aplicabilidad (SoA): **solo** se usa para saber qué controles deben auditarse
  (los 93 figuran «Aplica»); no se usa ningún estado de implementación ni cumplimiento;
- los formatos de la empresa: Formulario de hallazgos FOR-SGC-004, Retroalimentación diaria al
  auditado y Lista de verificación FOR-SGI-10.

## Cómo usarla

1. Abra **`Guia-Auditoria-ISO27001.html`** con Chrome, Edge o Safari (doble clic). No necesita
   internet ni instalar nada.
2. **Plan**: su calendario y la preparación. Dentro de cada sesión: **1 · Preparar**, **2 · Preguntar**
   (resultado, notas, evidencia y método de auditoría) y **3 · Cerrar** (hallazgos y datos para los formatos).
3. Cada pregunta muestra la cuestión oficial de la **Lista de verificación FOR-SGI-10** (Sí / No / N/A).
4. **Hallazgos**: se redactan con las reglas de la empresa (NC: Requisito → Evidencia → Brecha →
   Conclusión; Observación; Oportunidad de mejora; Punto fuerte) y con sus criterios de gravedad MAYOR/MENOR.
5. **Formatos**: genera automáticamente el **Formulario de hallazgos (.xlsx)** y la **Retroalimentación
   diaria (.docx)** por sesión, por día (.zip) o de todo el período (.zip).
6. **Lista**: la lista de verificación completa (35 cláusulas + 93 controles).
7. **Cobertura**, **Más** (revisión del cronograma, biblioteca, datos y respaldo).
8. Botón **Modo claro / Modo oscuro** arriba a la izquierda; recuerda su elección.

## Confidencialidad

Todo se guarda **solo en el navegador del dispositivo**; nada se envía a ningún servidor. Los
formatos se generan en el propio dispositivo. El archivo HTML lleva **incorporadas las plantillas
de la empresa**: no lo comparta fuera de la organización. Haga respaldos (Más → Datos).

## Para quien mantenga los archivos

Los fuentes están en `src/`. Para regenerar las plantillas y la lista de verificación desde los
documentos originales: `python3 herramientas/extraer_documentos.py <carpeta con los originales>`
(requiere `pdfplumber`). Luego `python3 construir.py` genera el HTML único.
