#!/usr/bin/env python3
"""Une los archivos de /src (y las librerías de /vendor) en un solo HTML que funciona sin internet."""
import base64, datetime, pathlib

base = pathlib.Path(__file__).parent
src, vendor = base / "src", base / "vendor"

ORDEN = ["datos-norma.js", "datos-soa.js", "datos-lista.js", "datos-sesiones.js", "datos-guias.js", "datos-evidencias.js",
         "plantillas.js", "formatos.js", "analisis.js", "documentos.js", "iconos.js",
         "nucleo.js", "docs-estado.js", "vistas.js", "vistas2.js", "eventos.js", "arranque.js"]
js = "\n".join((src / n).read_text(encoding="utf-8") for n in ORDEN)
js = js.replace("/*BUILD*/", datetime.datetime.now().strftime("%d/%m/%Y %H:%M"))

# fuentes embebidas (IBM Plex, licencia OFL)
def face(familia, peso, archivo):
    b64 = base64.b64encode((vendor / "fuentes" / archivo).read_bytes()).decode()
    return ("@font-face{font-family:\"%s\";font-weight:%s;font-style:normal;font-display:swap;"
            "src:url(data:font/woff2;base64,%s) format(\"woff2\")}" % (familia, peso, b64))
fuentes = "\n".join([
    face("IBM Plex Sans", 400, "ibm-plex-sans-latin-400-normal.woff2"), face("IBM Plex Sans", 500, "ibm-plex-sans-latin-500-normal.woff2"),
    face("IBM Plex Sans", 600, "ibm-plex-sans-latin-600-normal.woff2"), face("IBM Plex Sans", 700, "ibm-plex-sans-latin-700-normal.woff2"),
    face("IBM Plex Mono", 400, "ibm-plex-mono-latin-400-normal.woff2"), face("IBM Plex Mono", 500, "ibm-plex-mono-latin-500-normal.woff2"),
    face("IBM Plex Serif", 600, "ibm-plex-serif-latin-600-normal.woff2")])
css = (src / "estilo.css").read_text(encoding="utf-8").replace("/*FUENTES*/", fuentes)

pdfjs = (vendor / "pdf.min.js").read_text(encoding="utf-8").replace("</script", "<\\/script")
worker = base64.b64encode((vendor / "pdf.worker.min.js").read_bytes()).decode()

html = (src / "plantilla.html").read_text(encoding="utf-8")
html = html.replace("/*CSS*/", css).replace("/*PDFJS*/", pdfjs).replace("/*PDFWORKER*/", worker)
html = html.replace("/*JS*/", js.replace("</script", "<\\/script"))
salida = base / "Guia-Auditoria-ISO27001.html"
salida.write_text(html, encoding="utf-8")
print("Generado:", salida, "(%d KB)" % (salida.stat().st_size / 1024))
