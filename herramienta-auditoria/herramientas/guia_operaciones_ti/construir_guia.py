# -*- coding: utf-8 -*-
"""Genera la «Guía de auditoría · Gestión de Operaciones TI» en Word (.docx).
Uso: python3 construir_guia.py <ruta de salida .docx>"""
import re, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from glosario import GLOS
from contenido_clausulas import CLAUSULAS_OPS
from contenido_controles1 import CONTROLES_1
from contenido_controles2 import CONTROLES_2

SALIDA = sys.argv[1] if len(sys.argv) > 1 else 'Guia-Operaciones-TI-11nov.docx'
CONTROLES = CONTROLES_1 + CONTROLES_2
TOKEN = re.compile(r'\[\[(\w+)\]\](es|s)?')
PLURAL = {'activo': 'activos de información', 'proveedor_critico': 'proveedores críticos', 'incidente': 'incidentes de seguridad'}

INK = RGBColor(0x1F, 0x2A, 0x3C); MUT = RGBColor(0x5A, 0x68, 0x7F); ACC = RGBColor(0x1D, 0x4E, 0x89)
ROJO = RGBColor(0xA3, 0x2A, 0x2A); VERDE = RGBColor(0x1E, 0x6B, 0x3A)
MINUTOS = {1: 20, 2: 8, 3: 5}
ETQ_PRIO = {1: 'Imprescindible', 2: 'Importante', 3: 'Solo cruzar / si sobra tiempo'}


SIGLAS = ['SGSI', 'SoA', 'SLA', 'RTO', 'RPO', 'BCP', 'DRP', 'BIA', 'SIEM', 'SOC', 'CMDB', 'RFC', 'CAB', 'KPI', 'UPS', 'RCA', 'TIC', 'TI']
BARE = re.compile(r'(?<![\w\[«.])(SOC 2|' + '|'.join(SIGLAS) + r')(?![\w\]])(?! ?2\b)?')


def auto_tokens(texto):
    def r(m):
        k = m.group(1)
        return '[[SOC2]]' if k == 'SOC 2' else '[[%s]]' % k
    texto = re.sub(r'(?<![\w\[«.])SOC 2(?![\w\]])', '[[SOC2]]', texto)
    return re.sub(r'(?<![\w\[«.])(' + '|'.join(SIGLAS) + r')(?![\w\]])(?! 2\b)', lambda m: '[[%s]]' % m.group(1), texto)


def expandir(texto, visto):
    texto = auto_tokens(texto)
    """Primera vez en la ficha: sigla (nombre completo: significado). Luego: nombre completo (sigla)."""
    def r(m):
        k, suf = m.group(1), m.group(2)
        sigla, completo, expl, tarde = GLOS[k]
        if suf:
            base = PLURAL.get(k, tarde + suf)
            if k in visto:
                return base
            visto.add(k)
            return '%s (en singular, «%s»: %s)' % (base, completo, expl)
        if k in visto:
            return tarde
        visto.add(k)
        if sigla == completo or sigla.lower() == completo.lower():
            return '%s (%s)' % (sigla, expl)
        return '%s (%s: %s)' % (sigla, completo, expl)
    return TOKEN.sub(r, texto)


def sombrear(celda, color):
    tcPr = celda._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd'); shd.set(qn('w:val'), 'clear'); shd.set(qn('w:color'), 'auto'); shd.set(qn('w:fill'), color)
    tcPr.append(shd)


def bordes(tabla, color='B8C2D0'):
    tbl = tabla._tbl; pr = tbl.tblPr
    b = OxmlElement('w:tblBorders')
    for lado in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'):
        e = OxmlElement('w:' + lado); e.set(qn('w:val'), 'single'); e.set(qn('w:sz'), '4'); e.set(qn('w:space'), '0'); e.set(qn('w:color'), color); b.append(e)
    pr.append(b)


def ancho(tabla, anchos):
    tabla.autofit = False
    for i, w in enumerate(anchos):
        tabla.columns[i].width = Cm(w)
    for fila in tabla.rows:
        for i, w in enumerate(anchos):
            fila.cells[i].width = Cm(w)


def no_partir(fila):
    trPr = fila._tr.get_or_add_trPr(); e = OxmlElement('w:cantSplit'); trPr.append(e)


def repetir_encabezado(fila):
    trPr = fila._tr.get_or_add_trPr(); e = OxmlElement('w:tblHeader'); trPr.append(e)


doc = Document()
sec = doc.sections[0]
sec.page_width, sec.page_height = Cm(21.59), Cm(27.94)
sec.left_margin = sec.right_margin = Cm(2.0); sec.top_margin = Cm(2.0); sec.bottom_margin = Cm(1.8)
st = doc.styles['Normal']; st.font.name = 'Calibri'; st.font.size = Pt(11); st.font.color.rgb = INK
st.element.rPr.rFonts.set(qn('w:eastAsia'), 'Calibri')
st.paragraph_format.space_after = Pt(6); st.paragraph_format.line_spacing = 1.12
for nombre, tam, col, antes in (('Heading 1', 20, ACC, 18), ('Heading 2', 15, ACC, 14), ('Heading 3', 12, INK, 10)):
    h = doc.styles[nombre]; h.font.name = 'Calibri'; h.font.size = Pt(tam); h.font.bold = True; h.font.color.rgb = col
    h.element.rPr.rFonts.set(qn('w:eastAsia'), 'Calibri'); h.element.rPr.rFonts.set(qn('w:ascii'), 'Calibri'); h.element.rPr.rFonts.set(qn('w:hAnsi'), 'Calibri')
    h.paragraph_format.space_before = Pt(antes); h.paragraph_format.space_after = Pt(6); h.paragraph_format.keep_with_next = True


def P(texto='', negrita=False, cursiva=False, color=None, tam=None, alin=None, despues=None, antes=None, estilo=None, keep=False):
    p = doc.add_paragraph(style=estilo) if estilo else doc.add_paragraph()
    if texto:
        run(p, texto, negrita, color, tam, cursiva)
    if alin: p.alignment = alin
    if despues is not None: p.paragraph_format.space_after = Pt(despues)
    if antes is not None: p.paragraph_format.space_before = Pt(antes)
    if keep: p.paragraph_format.keep_with_next = True
    return p


def run(p, texto, negrita=False, color=None, tam=None, cursiva=False):
    r = p.add_run(texto); r.bold = negrita; r.italic = cursiva
    if color: r.font.color.rgb = color
    if tam: r.font.size = Pt(tam)
    return r


def viñetas(items, caja=False, tam=None):
    for t in items:
        p = doc.add_paragraph(style='List Bullet') if not caja else doc.add_paragraph()
        if caja:
            p.paragraph_format.left_indent = Cm(0.9); p.paragraph_format.first_line_indent = Cm(-0.7)
            r = p.add_run('☐  '); r.font.name = 'Segoe UI Symbol'
        run(p, t, tam=tam)
        p.paragraph_format.space_after = Pt(3)


def celda_texto(c, texto, negrita=False, color=None, tam=10, cursiva=False):
    c.text = ''
    p = c.paragraphs[0]; p.paragraph_format.space_after = Pt(2)
    run(p, texto, negrita, color, tam, cursiva)


def pie():
    for s in doc.sections:
        p = s.footer.paragraphs[0]; p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run(p, 'Guía de auditoría · Gestión de Operaciones TI · Miércoles 11 de noviembre de 2026 · Página ', color=MUT, tam=8.5)
        r = p.add_run(); r.font.size = Pt(8.5); r.font.color.rgb = MUT
        for tipo, txt in (('begin', None), (None, 'PAGE'), ('end', None)):
            if tipo:
                e = OxmlElement('w:fldChar'); e.set(qn('w:fldCharType'), tipo); r._r.append(e)
            else:
                e = OxmlElement('w:instrText'); e.set(qn('xml:space'), 'preserve'); e.text = txt; r._r.append(e)


# ---------------------------------------------------------------- cronograma de la jornada
ITEMS = [dict(c, tipo='Cláusula') for c in CLAUSULAS_OPS] + [dict(c, tipo='Anexo A') for c in CONTROLES]


def hora(m):
    return '%d:%02d' % (m // 60, m % 60)


t = 9 * 60 + 30; almuerzo = False; AGENDA = []
for it in ITEMS:
    if not almuerzo and t >= 12 * 60 + 15:
        AGENDA.append(('ALMUERZO', t, t + 60)); LUNCH = (t, t + 60); t += 60; almuerzo = True
    dur = MINUTOS[it['prio']]
    it['ini'], it['fin'] = t, t + dur
    AGENDA.append((it['id'], t, t + dur)); t += dur
FIN_JORNADA = t

# ---------------------------------------------------------------- portada
P('', despues=70)
P('GUÍA DE AUDITORÍA', negrita=True, color=ACC, tam=30, despues=2)
P('Gestión de Operaciones TI', negrita=True, color=INK, tam=22, despues=2)
P('(Servicios y Productos de Tecnologías de la Información)', color=MUT, tam=13, despues=26)
for k, v in (('Norma', 'ISO/IEC 27001:2022 · Sistema de Gestión de Seguridad de la Información'),
             ('Empresa auditada', 'Soluciones Globales JM · República Dominicana'),
             ('Tipo de auditoría', 'Auditoría interna'),
             ('Fecha y horario', 'Miércoles 11 de noviembre de 2026 · 9:30 a 17:00'),
             ('Auditor', 'Alan Montilla (con apoyo de Madeline Javier)'),
             ('Auditados', 'Gerente de Servicios TI · Ingeniero TI')):
    p = P(despues=3); run(p, k + ': ', True, color=MUT, tam=11.5); run(p, v, tam=11.5)
P('', despues=18)
P('Cómo está hecha esta guía', negrita=True, color=ACC, tam=12, despues=3)
P('Está escrita para una persona que sabe auditar pero no sabe de tecnología. Cada sigla se explica la primera vez que aparece en cada ficha, '
  'cada pregunta viene con la forma de interpretar la respuesta y cada control trae una prueba que usted mismo puede hacer. '
  'Lo que sigue son orientaciones de apoyo: la decisión final de clasificar un hallazgo siempre es suya, con los criterios de la empresa (FOR-SGC-004).', tam=10.5)
doc.add_page_break()

# ---------------------------------------------------------------- 1. cómo usar
doc.add_heading('1. Cómo usar esta guía', 1)
P('No necesita entender cómo funciona la tecnología. Necesita comprobar tres cosas sobre cada requisito, y esta guía le dice cómo hacerlo:')
viñetas(['EXISTE: hay un documento o un registro que lo respalda (con fecha, versión y responsable).',
         'SE HACE: hay casos reales y recientes que demuestran que se aplica, no solo que está escrito.',
         'SE PUEDE DEMOSTRAR: usted lo ve con sus propios ojos (en pantalla o en papel), no se lo cuentan.'])
doc.add_heading('Reglas de oro', 2)
for t_, d in (
    ('Evidencia, no declaraciones.', 'Cuando alguien le diga «sí, lo hacemos», responda siempre: «¿Me lo puede mostrar?». Una afirmación sin registro no es evidencia.'),
    ('La muestra la elige usted.', 'Si le ofrecen un ejemplo, pida otro distinto elegido por usted (por ejemplo, «muéstreme el tercer incidente de la lista»). Los ejemplos que escoge el auditado suelen ser los mejores.'),
    ('Pida que se lo expliquen como si usted no supiera nada.', 'Es una técnica de auditoría válida: quien opera el proceso debe poder explicarlo con claridad. Si no puede, es un dato.'),
    ('Verifique fechas.', 'Un documento sin fecha, sin versión o sin aprobador no es evidencia suficiente. Un registro con fecha anterior a la creación del sistema es una señal de alerta.'),
    ('Cruce información.', 'Compare dos fuentes: lo que dice el procedimiento contra el registro, el informe contra los tickets, el inventario contra lo que ve en el área.'),
    ('Anote hechos, no opiniones.', 'Escriba qué documento vio, código, versión, fecha y quién se lo mostró. «El procedimiento PR-TI-012 versión 3, aprobado el 10/01/2026, me lo mostró el Ingeniero TI» sirve; «parece bien» no.'),
    ('Un silencio también es información.', 'Haga la pregunta y espere. No complete usted la respuesta. Si el auditado no sabe, anótelo sin juzgar.')):
    p = P(despues=4); run(p, t_ + ' ', True, color=ACC); run(p, d)
doc.add_heading('Cómo leer cada ficha', 2)
for t_, d in (('Qué exige (en simple)', 'lo que pide la norma, explicado sin tecnicismos.'),
              ('Por qué importa', 'el riesgo real: qué le puede pasar a la empresa si esto falla.'),
              ('Qué preguntar', 'las preguntas, tal como puede decirlas, y a la derecha cómo interpretar la respuesta.'),
              ('Qué evidencias solicitar', 'documentos y registros concretos para ver (con casilla para marcar lo recibido).'),
              ('Prueba que usted mismo puede hacer', 'una comprobación que no requiere conocimientos técnicos.'),
              ('Señales de alerta', 'cosas que, si las ve u oye, debe profundizar.'),
              ('Cuándo es hallazgo', 'orientación sobre cuándo clasificarlo; la decisión es suya.'),
              ('Su registro', 'recuadro para anotar el resultado y la evidencia vista.')):
    p = P(despues=3); p.paragraph_format.left_indent = Cm(0.5); run(p, t_ + ': ', True); run(p, d)

# ---------------------------------------------------------------- 2. el proceso
doc.add_heading('2. De qué trata el proceso de hoy', 1)
P('«Gestión de Operaciones TI» es el área que mantiene funcionando los servicios y productos tecnológicos que la empresa vende y que usa para trabajar. '
  'Es el proceso que responde a: ¿cómo nos aseguramos de que los servicios estén disponibles, funcionen bien y estén protegidos todos los días?')
doc.add_heading('Una analogía sencilla', 2)
P('Piense en el área de operaciones como la administración de un edificio de oficinas muy importante. Sus tareas son:')
for a, b in (('Saber qué hay en el edificio', 'el inventario de activos (control A.5.9).'),
             ('Vigilar que todo funcione', 'las cámaras y alarmas: monitoreo y registros (A.8.15, A.8.16).'),
             ('Atender emergencias', 'incendio, robo o inundación: gestión de incidentes (A.5.24 a A.5.28).'),
             ('Hacer obras sin tumbar el edificio', 'los cambios controlados (A.8.32, A.8.9).'),
             ('Tener salidas de emergencia y un plan de evacuación', 'continuidad y redundancia (A.5.29, A.5.30, A.8.14).'),
             ('Vigilar a los contratistas', 'los proveedores y la nube (A.5.19, A.5.22, A.5.23).'),
             ('Tener manuales claros para el personal', 'procedimientos documentados (A.5.37).'),
             ('Prever si el edificio se quedará pequeño', 'gestión de la capacidad (A.8.6).')):
    p = P(despues=2); p.paragraph_format.left_indent = Cm(0.5); run(p, '• ' + a + ': ', True); run(p, b)
doc.add_heading('Las tres propiedades que protege la seguridad de la información', 2)
P('Cada vez que lea «seguridad de la información» recuerde que se refiere a tres cosas a la vez: ' + expandir('[[CID]]', set()) + '. Operaciones de TI es, sobre todo, responsable de la tercera: que el servicio esté disponible.')

# ---------------------------------------------------------------- 3. alcance
doc.add_heading('3. Qué se audita hoy y por qué', 1)
P('El cronograma de la auditoría asigna a esta sesión los siguientes puntos: la cláusula 8 (Operación) completa y los controles A.5.29, A.5.30 y A.8.16 del Anexo A. '
  'Usted pidió auditar «todos los puntos de la norma y todos los controles del Anexo A relacionados con el proceso». Para cumplirlo, esta guía agrega los puntos que, '
  'por su naturaleza, se evidencian en las operaciones de TI.')
doc.add_heading('Lo que se agregó al cronograma (y por qué debe cuestionarlo)', 2)
viñetas(['Se agregaron 17 controles del Anexo A y 13 puntos de cláusulas que el cronograma no menciona expresamente. Es un criterio profesional mío, no del cronograma ni de la norma. Usted puede quitar cualquiera.',
         'No son los 93 controles del Anexo A: los demás se auditan en otras sesiones (por ejemplo, copias de seguridad, redes y cifrado el 5 de noviembre en Gestión Tecnología; desarrollo seguro el 10 de noviembre).',
         'No se incluyen las cláusulas que se auditan en otras sesiones: 4.1 y 4.2 (contexto y partes interesadas), 5.1 y 5.2 (liderazgo y política), 7.3 y 7.4 (toma de conciencia y comunicación), 9.2 y 9.3 (auditoría interna y revisión por la dirección), 10.1 (mejora continua).',
         'Las cláusulas 6.1.2 y 6.1.3 (riesgos) se auditaron el 4 de noviembre; hoy solo se cruzan con el proceso de operaciones.',
         'El control A.8.13 (copias de seguridad) se audita a fondo el 5 de noviembre; hoy solo se cruza con la continuidad del servicio.'])
doc.add_heading('Tiempo realista', 2)
P('Son %d puntos para %d minutos de trabajo efectivo (de 9:30 a 17:00, con una hora de almuerzo). Eso da entre 5 y 20 minutos por punto. '
  'No es una auditoría exhaustiva: es un muestreo. Por eso cada punto lleva una prioridad:' % (len(ITEMS), sum(MINUTOS[i['prio']] for i in ITEMS)))
viñetas(['Prioridad 1 · Imprescindible (20 min): no se puede salir sin haberlo cubierto. Son los puntos del cronograma más gestión de incidentes, cambios y redundancia.',
         'Prioridad 2 · Importante (8 min): cubra al menos la pregunta principal y pida la evidencia más importante.',
         'Prioridad 3 · Solo cruzar (5 min): verifique solo la coherencia con lo auditado en otra sesión o si sobra tiempo.'])
P('Si en un punto detecta una desviación, deténgase y profundice: es preferible auditar bien menos puntos que revisar todos superficialmente. Lo que no alcance a cubrir, déjelo anotado como «no auditado por limitación de tiempo» y repórtelo en la reunión de las 17:00 (no lo declare conforme).', negrita=False)

doc.add_heading('Mapa de los puntos auditados', 2)
tb = doc.add_table(rows=1, cols=5); bordes(tb); tb.alignment = WD_TABLE_ALIGNMENT.CENTER
for i, tx in enumerate(('Ref.', 'Nombre', 'Origen', 'Prioridad', 'Hora sugerida')):
    celda_texto(tb.rows[0].cells[i], tx, True, RGBColor(255, 255, 255), 9.5); sombrear(tb.rows[0].cells[i], '1D4E89')
repetir_encabezado(tb.rows[0])
for it in ITEMS:
    f = tb.add_row(); no_partir(f)
    origen = 'Cronograma' if (it.get('rol') == 'cronograma' or it['id'] == '8.1') else 'Agregado'
    for i, tx in enumerate((it['id'], it['nombre'], origen, str(it['prio']), '%s–%s' % (hora(it['ini']), hora(it['fin'])))):
        celda_texto(f.cells[i], tx, i == 0, None, 9)
    if origen == 'Cronograma':
        for c in f.cells: sombrear(c, 'E6EEF8')
ancho(tb, [2.2, 8.2, 2.3, 1.7, 2.9])
P('Las filas con fondo azul son las que el cronograma asigna expresamente a esta sesión. La cláusula 8 completa figura en el cronograma como «8.*»; aquí se desglosa en 8.1, 8.2 y 8.3. El almuerzo se prevé de %s a %s; la jornada termina hacia las %s, dejando margen antes de la reunión del equipo auditor de las 17:00.' % (hora(LUNCH[0]), hora(LUNCH[1]), hora(FIN_JORNADA)), cursiva=True, color=MUT, tam=9.5, antes=4)

# ---------------------------------------------------------------- 4. glosario
doc.add_page_break()
doc.add_heading('4. Glosario: todas las siglas y términos técnicos', 1)
P('Ordenado alfabéticamente. Cada término se vuelve a explicar dentro de las fichas la primera vez que aparece.', cursiva=True, color=MUT, tam=10)
tb = doc.add_table(rows=1, cols=2); bordes(tb)
for i, tx in enumerate(('Sigla o término', 'Significado completo y qué quiere decir en la práctica')):
    celda_texto(tb.rows[0].cells[i], tx, True, RGBColor(255, 255, 255), 9.5); sombrear(tb.rows[0].cells[i], '1D4E89')
repetir_encabezado(tb.rows[0])
for k, (sigla, completo, expl, _) in sorted(GLOS.items(), key=lambda kv: kv[1][0].lower()):
    f = tb.add_row(); no_partir(f)
    celda_texto(f.cells[0], sigla, True, ACC, 9.5)
    if sigla.upper() == sigla or sigla == 'SoA':
        pre = completo + ': '
    else:
        m = re.search(r'\((en inglés [^)]*)\)', completo)
        pre = (m.group(1)[0].upper() + m.group(1)[1:] + '. ') if m else ''
    txt = pre + expl[0].upper() + expl[1:] + '.'
    celda_texto(f.cells[1], txt, tam=9.5)
ancho(tb, [4.2, 13.1])
doc.add_heading('Otros términos del día a día', 2)
for a, b in (('Producción', 'el entorno real donde funcionan los servicios que usan los clientes y los empleados; un error allí tiene consecuencias reales (en contraste con el entorno de pruebas).'),
             ('Servidor', 'una computadora potente, normalmente sin pantalla, que guarda información o ejecuta programas para muchos usuarios.'),
             ('Disponibilidad', 'el porcentaje del tiempo en que un servicio funciona. 99,9 % significa que puede estar caído unas 8 horas y 45 minutos al año.'),
             ('Muestreo', 'revisar algunos casos elegidos en vez de todos; las conclusiones de la auditoría valen para la muestra revisada.'),
             ('Dueño del riesgo / del activo', 'la persona con autoridad para decidir qué hacer con un riesgo o un activo y responsable de él.')):
    p = P(despues=3); run(p, a + ': ', True); run(p, b)

# ---------------------------------------------------------------- 5. preparación y agenda
doc.add_page_break()
doc.add_heading('5. Antes de empezar y agenda sugerida', 1)
doc.add_heading('Documentos que debe tener sobre la mesa (solicítelos hoy a primera hora)', 2)
viñetas(['Documento de alcance del Sistema de Gestión de Seguridad de la Información',
         'Catálogo de servicios y productos de TI, con los acuerdos de nivel de servicio (SLA)',
         'Inventario de activos de información y de TI',
         'Matriz de riesgos y plan de tratamiento de riesgos',
         'Organigrama del área, perfiles de puesto y registros de capacitación',
         'Presupuesto del área y lista de herramientas con sus licencias',
         'Lista de procedimientos operativos (con dos de ellos completos)',
         'Lista de proveedores críticos y contratos de tres de ellos; informes SOC 2 u otras certificaciones',
         'Procedimiento de gestión de incidentes y registro de incidentes de los últimos 12 meses',
         'Plan de continuidad del negocio, análisis de impacto, tabla de RTO y RPO e informe de la última prueba de recuperación',
         'Panel de monitoreo (para ver en vivo) y alertas del último mes',
         'Procedimiento de gestión de cambios y los expedientes de cambios del último trimestre',
         'Informes de capacidad, configuración estándar segura y política de registros',
         'Objetivos e indicadores del área y su último informe',
         'Informe de auditorías anteriores y cierre de sus hallazgos'], caja=True)
doc.add_heading('Agenda sugerida (en el orden numérico de los puntos)', 2)
P('El orden es el pedido: primero los requisitos de las cláusulas y después los controles del Anexo A en orden numérico. Los horarios son una guía y se ajustan según se desarrolle la conversación.', cursiva=True, color=MUT, tam=10)
tb = doc.add_table(rows=1, cols=3); bordes(tb)
for i, tx in enumerate(('Hora', 'Punto', 'Prioridad')):
    celda_texto(tb.rows[0].cells[i], tx, True, RGBColor(255, 255, 255), 9.5); sombrear(tb.rows[0].cells[i], '1D4E89')
repetir_encabezado(tb.rows[0])
nombres = {i['id']: i for i in ITEMS}
for ref, a, b in AGENDA:
    f = tb.add_row(); no_partir(f)
    if ref == 'ALMUERZO':
        celda_texto(f.cells[0], '%s–%s' % (hora(a), hora(b)), True, MUT, 9.5); celda_texto(f.cells[1], 'Almuerzo', True, MUT, 9.5); celda_texto(f.cells[2], '', tam=9.5)
        for c in f.cells: sombrear(c, 'EEF1F5')
    else:
        it = nombres[ref]
        celda_texto(f.cells[0], '%s–%s' % (hora(a), hora(b)), tam=9.5)
        celda_texto(f.cells[1], '%s · %s' % (ref, it['nombre']), tam=9.5)
        celda_texto(f.cells[2], ETQ_PRIO[it['prio']].split(' /')[0], tam=9.5)
ancho(tb, [3.0, 11.3, 3.0])
P('17:00–18:00 · Reunión del equipo auditor para consolidar hallazgos.', negrita=True, antes=6)

# ---------------------------------------------------------------- 6. fichas
doc.add_page_break()
doc.add_heading('6. Fichas de auditoría', 1)
P('Primero las cláusulas de la norma y luego los controles del Anexo A, en orden numérico.', cursiva=True, color=MUT, tam=10)


def encabezado_seccion(titulo, texto):
    doc.add_heading(titulo, 2)
    P(texto, cursiva=True, color=MUT, tam=10)


def ficha(it, primera_de_grupo=False):
    visto = set()
    if not primera_de_grupo:
        doc.add_page_break()
    h = doc.add_heading(('Cláusula ' if it['tipo'] == 'Cláusula' else 'Control ') + it['id'] + ' · ' + it['nombre'], 3)
    h.runs[0].font.size = Pt(13.5); h.runs[0].font.color.rgb = ACC
    if it.get('en'):
        P(it['en'], cursiva=True, color=MUT, tam=9.5, despues=4, keep=True)
    # cinta de datos
    t = doc.add_table(rows=1, cols=3); bordes(t, 'D3DAE5')
    origen = 'Cronograma' if (it.get('rol') == 'cronograma' or it['id'] == '8.1') else 'Agregado por el auditor'
    for i, (k, v) in enumerate((('Origen', origen), ('Prioridad', '%d · %s' % (it['prio'], ETQ_PRIO[it['prio']])), ('Hora sugerida', '%s a %s (%d min)' % (hora(it['ini']), hora(it['fin']), it['fin'] - it['ini'])))):
        c = t.rows[0].cells[i]; c.text = ''; p = c.paragraphs[0]; p.paragraph_format.space_after = Pt(0)
        run(p, k + ': ', True, MUT, 9); run(p, v, False, None, 9); sombrear(c, 'F2F5F9')
    ancho(t, [4.6, 7.0, 5.7])
    P('', despues=2)

    def bloque(titulo, color=ACC):
        p = P(titulo, True, color=color, tam=11, despues=2, antes=6, keep=True)
        return p
    bloque('Qué exige (en simple)'); P(expandir(it['exige'], visto))
    bloque('Por qué importa'); P(expandir(it['importa'], visto))
    bloque('Qué preguntar')
    tb = doc.add_table(rows=1, cols=2); bordes(tb)
    for i, tx in enumerate(('Pregunta (puede leerla tal cual)', 'Cómo interpretar la respuesta')):
        celda_texto(tb.rows[0].cells[i], tx, True, RGBColor(255, 255, 255), 9); sombrear(tb.rows[0].cells[i], '1D4E89')
    for n, (q, b) in enumerate(it['preguntas'], 1):
        f = tb.add_row(); no_partir(f)
        celda_texto(f.cells[0], '%d. %s' % (n, expandir(q, visto)), tam=9.5)
        celda_texto(f.cells[1], expandir(b, visto), tam=9.5, color=MUT)
    ancho(tb, [9.3, 8.0])
    bloque('Qué evidencias solicitar'); viñetas([expandir(e, visto) for e in it['evidencias']], caja=True, tam=10.5)
    bloque('Prueba que usted mismo puede hacer'); P(expandir(it['prueba'], visto))
    bloque('Señales de alerta', ROJO); viñetas([expandir(a, visto) for a in it['alertas']], tam=10.5)
    bloque('Cuándo es hallazgo (orientación; la decisión es suya)'); P(expandir(it['nc'], visto), tam=10.5)
    # registro
    t = doc.add_table(rows=3, cols=1); bordes(t, '8795AA')
    c0 = t.rows[0].cells[0]; c0.text = ''; p = c0.paragraphs[0]; p.paragraph_format.space_after = Pt(2)
    run(p, 'SU REGISTRO · ' + it['id'] + '   ', True, ACC, 9.5)
    r = p.add_run('☐ Conforme   ☐ Punto fuerte   ☐ Oportunidad de mejora   ☐ Observación   ☐ NC menor   ☐ NC mayor   ☐ No auditado'); r.font.size = Pt(9); r.font.name = 'Segoe UI Symbol'
    sombrear(c0, 'F2F5F9')
    celda_texto(t.rows[1].cells[0], 'Evidencia vista (documento, código, versión, fecha, quién la mostró):\n\n', False, MUT, 9)
    celda_texto(t.rows[2].cells[0], 'Notas y número de hallazgo, si aplica:\n\n', False, MUT, 9)
    for f in t.rows: no_partir(f)


encabezado_seccion('6.1 Requisitos de la norma (cláusulas 4 a 10)', 'Se verifican en las conversaciones y en los documentos del proceso. Los números son los de la ISO/IEC 27001:2022.')
primera = True
for it in ITEMS:
    if it['tipo'] != 'Cláusula':
        continue
    ficha(it, primera); primera = False
doc.add_page_break()
encabezado_seccion('6.2 Controles del Anexo A relacionados con el proceso', 'El Anexo A tiene 93 controles en 4 grupos: A.5 organizacionales, A.6 de personas, A.7 físicos y A.8 tecnológicos. Hoy se auditan los que se relacionan con operaciones de TI.')
primera = True
for it in ITEMS:
    if it['tipo'] != 'Anexo A':
        continue
    ficha(it, primera); primera = False

# ---------------------------------------------------------------- 7. clasificación
doc.add_page_break()
doc.add_heading('7. Cómo clasificar y redactar un hallazgo', 1)
P('Definiciones oficiales de la empresa (formulario FOR-SGC-004). Úselas tal cual.', cursiva=True, color=MUT, tam=10)
for a, b in (('Punto fuerte / buena práctica', 'Actividades que generan valor al cumplimiento de la normativa.'),
             ('Oportunidad de mejora', 'Iniciativa para aumentar la capacidad del proceso, de adopción opcional. El requisito se cumple, pero existe una forma de fortalecer el proceso.'),
             ('Observación', 'Riesgo potencial de incumplimiento de un requisito. Existe una situación que podría generar un problema, pero no se ha demostrado el incumplimiento. No debe afirmar un incumplimiento.'),
             ('No conformidad (NC)', 'Incumplimiento de un requisito. Existe incumplimiento demostrado.')):
    p = P(despues=4); run(p, a + ': ', True, ACC); run(p, b)
doc.add_heading('No conformidad MAYOR: si se cumple al menos uno de estos criterios', 2)
viñetas(['Incumplimiento total de un requisito de la norma.', 'Existe una falla sistemática o generalizada en un proceso.', 'Se evidencia que el sistema no es eficaz.',
         'Hay alto riesgo para la calidad del producto o servicio.', 'Se detectan varias no conformidades menores repetidas sobre el mismo requisito.', 'No se implementaron acciones correctivas de auditorías anteriores.'])
doc.add_heading('No conformidad MENOR: cuando', 2)
viñetas(['El sistema está definido, pero no se cumple en un caso aislado.', 'Existe un error puntual de implementación.', 'Hay una desviación sin impacto significativo en el producto o servicio.', 'Faltan algunos registros evidenciales, pero el proceso sí existe.'])
doc.add_heading('Estructura de redacción de la empresa', 2)
for a, b in (('No conformidad (Requisito → Evidencia → Brecha → Conclusión)', 'En [documento / procedimiento / requisito], se establece que [criterio]. No obstante, durante la auditoría se evidenció que [situación encontrada]. Además de lo anterior, [evidencia adicional, si aplica]. Con base en la evidencia/muestra revisada, no se logra asegurar que [conclusión sobre el incumplimiento].'),
             ('Observación (Situación → Riesgo)', 'Durante la auditoría se evidenció que [situación encontrada]. Esta situación podría [riesgo o consecuencia potencial]. Por lo anterior, se considera pertinente dar seguimiento a este aspecto.'),
             ('Oportunidad de mejora (Situación actual → Mejora → Beneficio)', 'Durante la auditoría se evidenció que [situación actual que cumple con el requisito]. No obstante, se identifica una oportunidad para [posibilidad de mejora], con el propósito de [beneficio esperado].'),
             ('Punto fuerte (Práctica → Evidencia → Beneficio)', 'Se evidenció como punto fuerte que [práctica destacada], mediante [evidencia]. Esta práctica contribuye a [beneficio o resultado positivo].')):
    p = P(despues=1, keep=True); run(p, a, True)
    p = P(b, cursiva=True, color=MUT, tam=10.5, despues=7)
doc.add_heading('Ejemplo aplicado a hoy (con datos inventados, solo para ilustrar)', 2)
P('Control A.5.30 · Observación. «Durante la auditoría se evidenció que existe una tabla de objetivos de tiempo de recuperación (RTO) y de punto de recuperación (RPO) para los servicios críticos, pero que la última prueba de recuperación se realizó hace más de 18 meses. Esta situación podría generar que los tiempos de recuperación declarados no se puedan cumplir ante una interrupción real. Por lo anterior, se considera pertinente dar seguimiento a este aspecto.»', cursiva=True, tam=10.5)
P('Si, en cambio, nunca se ha hecho una prueba y la tabla ni siquiera existe, ya no es un riesgo potencial sino un incumplimiento demostrado: se redactaría como No conformidad.', tam=10.5)

# ---------------------------------------------------------------- 8. cierre
doc.add_page_break()
doc.add_heading('8. Hoja resumen de la jornada', 1)
P('Complete esta tabla al terminar cada punto. Le servirá para la reunión del equipo auditor de las 17:00 y para llenar el formulario de hallazgos.', cursiva=True, color=MUT, tam=10)
tb = doc.add_table(rows=1, cols=4); bordes(tb)
for i, tx in enumerate(('Ref.', 'Resultado (C = Conforme, PF, OM, OBS, NCm, NCM, NA = no auditado)', 'Evidencia principal vista', 'N.° de hallazgo')):
    celda_texto(tb.rows[0].cells[i], tx, True, RGBColor(255, 255, 255), 8.5); sombrear(tb.rows[0].cells[i], '1D4E89')
repetir_encabezado(tb.rows[0])
for it in ITEMS:
    f = tb.add_row(); no_partir(f)
    celda_texto(f.cells[0], it['id'], True, None, 9)
    for c in f.cells[1:]: celda_texto(c, '', tam=9)
    f.height = Cm(0.9)
ancho(tb, [2.3, 4.4, 8.0, 2.6])
doc.add_heading('Antes de irse de la sesión', 2)
viñetas(['Confirmar con el auditado la lista de evidencias que quedaron pendientes de entregar y la fecha límite.',
         'Resumir en voz alta los hallazgos preliminares y confirmar que los hechos son correctos (validación con el auditado).',
         'Agradecer y recordar la hora de la retroalimentación diaria.',
         'Anotar los puntos NO auditados por tiempo.'], caja=True)
doc.add_heading('Reunión del equipo auditor (17:00 a 18:00)', 2)
viñetas(['Cada auditor presenta sus hallazgos con evidencia y referencia a la norma.',
         'Clasificar cada hallazgo (mayor, menor, observación, oportunidad de mejora, punto fuerte) con los criterios de la empresa.',
         'Decidir qué puntos quedan pendientes de verificar otro día.',
         'Preparar el formato de retroalimentación diaria para el auditado.'], caja=True)

pie()
doc.core_properties.title = 'Guía de auditoría · Gestión de Operaciones TI'
doc.core_properties.author = 'Apoyo a la auditoría interna ISO/IEC 27001:2022'
doc.save(SALIDA)
print('OK', SALIDA, len(ITEMS), 'puntos; fin estimado', hora(FIN_JORNADA))
