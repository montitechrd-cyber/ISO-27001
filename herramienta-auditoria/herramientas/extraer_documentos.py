#!/usr/bin/env python3
"""Genera src/datos-lista.js y src/plantillas.js a partir de los documentos originales de la empresa.

Uso:  python3 herramientas/extraer_documentos.py <carpeta con los 3 originales>
Originales esperados (por su nombre):
  - *Formato_de_Retroalimentaci*Diaria*.docx
  - *Formulario_Hallazgos*.xlsx
  - *Lista_de_Verificaci*.pdf
"""
import base64, glob, json, pathlib, re, sys, zipfile

raiz = pathlib.Path(__file__).resolve().parent.parent
carpeta = pathlib.Path(sys.argv[1])


def buscar(patron):
    r = sorted(glob.glob(str(carpeta / patron)))
    if not r:
        sys.exit("No encuentro: " + patron)
    return r[0]


# ---------- 1) Lista de verificación (PDF → datos) ----------
import pdfplumber

items = []
with pdfplumber.open(buscar("*Lista_de_Verificaci*.pdf")) as pdf:
    for p in pdf.pages:
        for t in p.extract_tables():
            for r in t:
                r = [(c or "").replace("\n", " ").strip() for c in r]
                if re.match(r"^(A\.)?\d+(\.\d+)*(-[\d.]+)?$", r[0]) and r[2]:
                    items.append(r[:3])


def norm(ref):
    if ref.startswith("7.5."):
        return "7.5"
    if ref.startswith("9.2."):
        return "9.2"
    if ref.startswith("9.3."):
        return "9.3"
    return ref


lista = [[r[0], norm(r[0]), r[1], r[2]] for r in items]
assert len(lista) == 128, len(lista)
(raiz / "src" / "datos-lista.js").write_text(
    "/* Lista de verificación FOR-SGI-10 V01 (ISO 27001), extraída del PDF de la empresa.\n"
    "   [cláusula tal como figura, id normalizado, apartado, cuestión a revisar] */\n"
    "const LISTA=" + json.dumps(lista, ensure_ascii=False, indent=0) + ";\n",
    encoding="utf-8")
print("Lista de verificación:", len(lista), "ítems")


# ---------- 2) Plantillas (docx / xlsx) ----------
def partes(ruta, limpiar=None):
    z = zipfile.ZipFile(ruta)
    out = []
    for i in z.infolist():
        datos = z.read(i.filename)
        out.append([i.filename, datos])
    if limpiar:
        out = limpiar(out)
    res = []
    for nombre, datos in out:
        try:
            res.append([nombre, "t", datos.decode("utf-8")])
        except UnicodeDecodeError:
            res.append([nombre, "b", base64.b64encode(datos).decode()])
    return res


def limpiar_xlsx(ps):
    d = {n: b for n, b in ps}
    # Se quitan las casillas flotantes (controles de formulario): se sustituyen por ☒/☐ en las celdas.
    for n in list(d):
        if n.startswith("xl/ctrlProps/") or n == "xl/drawings/vmlDrawing1.vml":
            del d[n]
    s = d["xl/worksheets/sheet1.xml"].decode()
    a = s.index("<legacyDrawing")
    b = s.index("</worksheet>")
    s = s[:a] + s[b:]
    d["xl/worksheets/sheet1.xml"] = s.encode()
    rel = d["xl/worksheets/_rels/sheet1.xml.rels"].decode()
    rel = re.sub(r'<Relationship Id="rId\d+" Type="[^"]*/(?:ctrlProp|vmlDrawing)"[^>]*/>', "", rel)
    d["xl/worksheets/_rels/sheet1.xml.rels"] = rel.encode()
    ct = d["[Content_Types].xml"].decode()
    ct = re.sub(r'<Override PartName="/xl/ctrlProps/[^>]*/>', "", ct)
    d["[Content_Types].xml"] = ct.encode()
    dr = d["xl/drawings/drawing1.xml"].decode()
    bloques = re.findall(r"<xdr:twoCellAnchor.*?</xdr:twoCellAnchor>", dr, flags=re.S)
    for bl in bloques:
        if "<xdr:pic" not in bl:
            dr = dr.replace(bl, "")
    d["xl/drawings/drawing1.xml"] = dr.encode()
    return [[n, d[n]] for n, _ in ps if n in d]


plant = {
    "docx": partes(buscar("*Formato_de_Retroalimentaci*.docx")),
    "xlsx": partes(buscar("*Formulario_Hallazgos*.xlsx"), limpiar_xlsx),
}
(raiz / "src" / "plantillas.js").write_text(
    "/* Plantillas originales de la empresa (FOR-SGC-004 y Retroalimentación diaria), embebidas para generarlas sin internet. */\n"
    "const PLANTILLAS=" + json.dumps(plant, ensure_ascii=False) + ";\n", encoding="utf-8")
print("Plantillas:", {k: len(v) for k, v in plant.items()})
