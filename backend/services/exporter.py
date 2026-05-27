import io
from datetime import datetime

import openpyxl


def construir_excel(resultado: dict) -> io.BytesIO:
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Resultado"

    ws.column_dimensions["A"].width = 28
    ws.column_dimensions["B"].width = 45

    ws.append(["Campo", "Valor"])
    ws.append(["Fecha procesamiento", datetime.now().strftime("%Y-%m-%d %H:%M:%S")])
    ws.append(["Calidad", resultado.get("calidad")])
    ws.append(["Confianza calidad", resultado.get("confianza_calidad")])
    ws.append(["Orientación detectada", resultado.get("orientacion")])
    ws.append(["Aviso orientación", resultado.get("aviso_orientacion")])
    ws.append(["Tipo de documento", resultado.get("tipo_documento")])
    ws.append(["Confianza documento", resultado.get("confianza_documento")])

    utilidad = resultado.get("utilidad", {})
    ws.append(["Acción recomendada", utilidad.get("accion")])
    ws.append(["Siguiente paso", utilidad.get("siguiente_paso")])
    ws.append(["Área responsable", utilidad.get("area_responsable")])

    campos = utilidad.get("campos_requeridos", [])
    if campos:
        ws.append(["Campos requeridos", ", ".join(campos)])

    qr = resultado.get("qr")
    if qr and "datos_factura" in qr:
        ws.append([])
        ws.append(["--- Datos extraídos del QR ---", ""])
        for k, v in qr["datos_factura"].items():
            ws.append([k, v or "No disponible"])

    archivo_guardado = resultado.get("archivo_guardado")
    if archivo_guardado:
        ws.append([])
        ws.append(["Archivo guardado en", archivo_guardado])

    stream = io.BytesIO()
    wb.save(stream)
    stream.seek(0)
    return stream
