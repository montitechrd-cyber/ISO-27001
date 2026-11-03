#!/usr/bin/env python3
"""Une los archivos de /src en un solo HTML que funciona sin internet."""
import pathlib

base = pathlib.Path(__file__).parent
src = base / "src"
js = "\n".join(
    (src / nombre).read_text(encoding="utf-8")
    for nombre in ["datos-norma.js", "datos-soa.js", "datos-lista.js", "datos-sesiones.js", "datos-guias.js", "plantillas.js", "formatos.js", "app.js"]
)
html = (src / "plantilla.html").read_text(encoding="utf-8")
html = html.replace("/*CSS*/", (src / "estilo.css").read_text(encoding="utf-8"))
import datetime
js = js.replace("/*BUILD*/", datetime.datetime.now().strftime("%d/%m/%Y %H:%M"))
html = html.replace("/*JS*/", js.replace("</script", "<\\/script"))
salida = base / "Guia-Auditoria-ISO27001.html"
salida.write_text(html, encoding="utf-8")
print("Generado:", salida, "(%d KB)" % (salida.stat().st_size / 1024))
