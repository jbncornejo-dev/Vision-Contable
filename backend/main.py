import io
import json
import os
import shutil
import urllib.parse
import re
from datetime import datetime
from pathlib import Path
import uuid

import numpy as np
from PIL import Image

os.environ["KERAS_BACKEND"] = "tensorflow"

import keras
import cv2
import openpyxl
import requests
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware

MODELOS_DIR = os.getenv("MODELOS_DIR", "./Modelos_Exportados")
ARCHIVOS_DIR = Path(os.getenv("ARCHIVOS_DIR", "./Documentos_Clasificados"))
TEMP_DIR = Path(os.getenv("TEMP_DIR", "./Documentos_Temporales"))
RESULTADOS_DIR = Path(os.getenv("RESULTADOS_DIR", "./Documentos_Resultados"))
OCRSPACE_API_KEY = os.getenv("OCRSPACE_API_KEY", "").strip()

IMG_SIZE = (224, 224)

ACCIONES_POR_TIPO = {
    "Facturas": {
        "accion": "Registrar en libro de compras/ventas",
        "campos_requeridos": [
            "NIT emisor",
            "fecha de emisión",
            "monto total",
            "número de factura",
            "descripción del bien o servicio",
        ],
        "siguiente_paso": "Enviar a módulo OCR para extracción y contabilización automática",
        "area_responsable": "Contabilidad / Cuentas por pagar",
    },
    "Declaraciones_Juradas": {
        "accion": "Archivar en expediente tributario del contribuyente",
        "campos_requeridos": [
            "NIT contribuyente",
            "período fiscal declarado",
            "impuesto determinado",
            "impuesto a compensar o pagar",
        ],
        "siguiente_paso": "Validar montos declarados contra registros internos del SIN",
        "area_responsable": "Departamento Tributario / Cumplimiento fiscal",
    },
    "NITs": {
        "accion": "Registrar o actualizar datos del contribuyente en el sistema",
        "campos_requeridos": [
            "número de NIT",
            "razón social o nombre",
            "actividad económica",
            "domicilio fiscal",
        ],
        "siguiente_paso": "Vincular NIT a perfil de proveedor, cliente o empleado según corresponda",
        "area_responsable": "Administración / Gestión de terceros",
    },
}

MENSAJES_ORIENTACION = {
    "0_grados": "El documento está en orientación correcta. No requiere corrección.",
    "90_grados": "El documento esta rotado 90° en sentido horario. Se recomienda corregir antes de procesar.",
    "180_grados": "El documento esta invertido (180°). Se recomienda corregir antes de procesar.",
    "270_grados": "El documento esta rotado 270° en sentido horario. Se recomienda corregir antes de procesar.",
}

CARPETA_POR_TIPO = {
    "Facturas": "Facturas",
    "NITs": "NITs",
    "Declaraciones_Juradas": "Declaraciones_Juradas",
}

app = FastAPI(title="Vision Contable API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

modelo_calidad = None
modelo_orientacion = None
modelo_estructural = None
clases_orientacion = {}
clases_estructural = {}


def init_storage():
    carpetas = set(CARPETA_POR_TIPO.values()) | {"No_Reconocidos"}
    for carpeta in carpetas:
        (ARCHIVOS_DIR / carpeta).mkdir(parents=True, exist_ok=True)
    TEMP_DIR.mkdir(parents=True, exist_ok=True)
    RESULTADOS_DIR.mkdir(parents=True, exist_ok=True)


@app.on_event("startup")
def load_models():
    global modelo_calidad, modelo_orientacion, modelo_estructural
    global clases_orientacion, clases_estructural

    init_storage()

    modelo_calidad = keras.saving.load_model(f"{MODELOS_DIR}/modelo_calidad.keras")
    modelo_orientacion = keras.saving.load_model(f"{MODELOS_DIR}/modelo_orientacion.keras")
    modelo_estructural = keras.saving.load_model(f"{MODELOS_DIR}/modelo_estructural.keras")

    with open(f"{MODELOS_DIR}/clases_orientacion.json") as f:
        clases_orientacion.update({v: k for k, v in json.load(f).items()})

    with open(f"{MODELOS_DIR}/clases_estructural.json") as f:
        clases_estructural.update({v: k for k, v in json.load(f).items()})


def preprocess(img: Image.Image) -> np.ndarray:
    img = img.convert("RGB").resize(IMG_SIZE)
    return np.expand_dims(np.array(img, dtype=np.float32), axis=0)


def leer_qr(img: Image.Image) -> dict | None:
    img_cv = cv2.cvtColor(np.array(img.convert("RGB")), cv2.COLOR_RGB2BGR)
    detector = cv2.QRCodeDetector()
    data, _, _ = detector.detectAndDecode(img_cv)
    if not data:
        return None

    contenido = data.strip()
    resultado = {"contenido_raw": contenido}

    parsed = urllib.parse.urlparse(contenido)
    es_url = parsed.scheme in {"http", "https"} and bool(parsed.netloc)
    if es_url:
        try:
            resp = requests.get(contenido, timeout=5)
            content_type = resp.headers.get("Content-Type", "")
            title_match = re.search(r"<title>(.*?)</title>", resp.text, re.IGNORECASE | re.DOTALL)
            titulo = title_match.group(1).strip() if title_match else None
            resultado["fetch"] = {
                "url": contenido,
                "status_code": resp.status_code,
                "content_type": content_type,
                "title": titulo,
            }
        except Exception as exc:
            resultado["fetch"] = {
                "url": contenido,
                "error": str(exc),
            }

    if "impuestos.gob.bo" in contenido:
        try:
            params = dict(urllib.parse.parse_qsl(urllib.parse.urlparse(contenido).query))
            resultado["fuente"] = "SIN Bolivia"
            resultado["datos_factura"] = {
                "nit_emisor": params.get("nit"),
                "numero_factura": params.get("nroFactura"),
                "fecha_emision": params.get("fechaEmision"),
                "monto_total": params.get("importe"),
                "codigo_control": params.get("codigoControl"),
            }
        except Exception:
            pass
    elif "|" in contenido:
        partes = [p.strip() for p in contenido.split("|")]
        resultado["fuente"] = "QR simple"
        resultado["datos_factura"] = {
            "raw": contenido,
            "partes": partes,
        }

    return resultado


def ocr_space_image(img: Image.Image) -> dict:
    if not OCRSPACE_API_KEY:
        return {"error": "OCRSPACE_API_KEY no configurada"}

    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    try:
        resp = requests.post(
            "https://api.ocr.space/parse/image",
            files={"file": ("documento.png", buffer, "image/png")},
            data={"language": "spa", "OCREngine": 2},
            headers={"apikey": OCRSPACE_API_KEY},
            timeout=20,
        )
        data = resp.json()
    except Exception as exc:
        return {"error": str(exc)}

    if not data or data.get("IsErroredOnProcessing"):
        return {"error": data.get("ErrorMessage") or data.get("ErrorDetails") or "OCR error"}

    parsed = data.get("ParsedResults") or []
    texto = "\n".join(p.get("ParsedText", "") for p in parsed).strip()
    return {"texto": texto}


def extraer_campos_ocr(texto: str, tipo: str) -> dict:
    resultado = {}

    nit_match = re.search(r"\b\d{7,13}\b", texto)
    if nit_match:
        resultado["nit"] = nit_match.group(0)

    fecha_match = re.search(r"\b\d{2}/\d{2}/\d{4}\b", texto)
    if fecha_match:
        resultado["fecha"] = fecha_match.group(0)

    monto_match = re.search(r"\b\d{1,3}(?:[\.,]\d{3})*(?:[\.,]\d{2})\b", texto)
    if monto_match:
        resultado["monto"] = monto_match.group(0)

    if tipo == "Declaraciones_Juradas":
        form_match = re.search(r"\bform(?:ulario)?\s*(\d{2,4})\b", texto, re.IGNORECASE)
        if form_match:
            resultado["formulario"] = form_match.group(1)

    return resultado


def guardar_resultado_json(nombre_base: str, payload: dict) -> str:
    nombre = f"{Path(nombre_base).stem}.json"
    ruta = RESULTADOS_DIR / nombre
    ruta.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    return str(ruta)


def guardar_documento(img: Image.Image, tipo: str, nombre_original: str) -> str:
    carpeta = CARPETA_POR_TIPO.get(tipo, "No_Reconocidos")
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    ext = Path(nombre_original).suffix or ".jpg"
    nombre = f"{ts}_{Path(nombre_original).stem}{ext}"
    destino = ARCHIVOS_DIR / carpeta / nombre
    img.save(str(destino))
    return str(destino)


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


def calcular_rotacion(clase_orientacion: str) -> int:
    digits = "".join(ch for ch in clase_orientacion if ch.isdigit())
    if not digits:
        return 0
    return int(digits)


def predict_image(img: Image.Image, nombre: str) -> dict:
    x = preprocess(img)

    prob_calidad = float(modelo_calidad.predict(x, verbose=0)[0][0])
    es_nitida = prob_calidad >= 0.5

    if not es_nitida:
        return {
            "etapa": "Calidad",
            "calidad": "Rechazada",
            "confianza_calidad": round(1 - prob_calidad, 4),
            "mensaje": "Imagen con calidad insuficiente. Por favor envíe una imagen más nítida.",
            "utilidad": {
                "accion": "Recapturar el documento",
                "recomendaciones": [
                    "Asegúrese de que el documento esté bien iluminado",
                    "Evite sombras o reflejos sobre el papel",
                    "Mantenga la cámara estable al momento de la captura",
                    "Limpie el lente de la cámara antes de fotografiar",
                ],
            },
        }

    pred_orient = modelo_orientacion.predict(x, verbose=0)[0]
    idx_orient = int(np.argmax(pred_orient))
    orientacion = clases_orientacion.get(idx_orient, "Desconocida")

    angulo_rotacion = calcular_rotacion(orientacion)
    if angulo_rotacion != 0:
        img_enderezada = img.rotate(-angulo_rotacion, expand=True)
        x_estructural = preprocess(img_enderezada)
        img_para_qr = img_enderezada
    else:
        x_estructural = x
        img_para_qr = img

    pred_struct = modelo_estructural.predict(x_estructural, verbose=0)[0]
    idx_struct = int(np.argmax(pred_struct))
    tipo = clases_estructural.get(idx_struct, "Desconocido")

    if tipo == "Ninguno":
        ruta = guardar_documento(img, "Ninguno", nombre)
        return {
            "etapa": "Clasificación estructural",
            "calidad": "Aprobada",
            "confianza_calidad": round(prob_calidad, 4),
            "orientacion": orientacion,
            "confianza_orientacion": round(float(pred_orient[idx_orient]), 4),
            "aviso_orientacion": MENSAJES_ORIENTACION.get(orientacion, ""),
            "tipo_documento": "No reconocido",
            "confianza_documento": round(float(pred_struct[idx_struct]), 4),
            "mensaje": "El documento no corresponde a ninguna categoría registrada.",
            "archivo_guardado": ruta,
            "utilidad": {
                "accion": "Derivar a revisión manual",
                "siguiente_paso": "Enviar al operador para clasificación y archivo manual",
            },
        }

    qr_data = leer_qr(img_para_qr) if tipo == "Facturas" else None
    accion_info = ACCIONES_POR_TIPO.get(tipo, {})
    ruta = guardar_documento(img, tipo, nombre)

    ocr = ocr_space_image(img_para_qr)
    if "texto" in ocr:
        ocr["campos"] = extraer_campos_ocr(ocr["texto"], tipo)

    resultado = {
        "etapa": "Completado",
        "calidad": "Aprobada",
        "confianza_calidad": round(prob_calidad, 4),
        "orientacion": orientacion,
        "confianza_orientacion": round(float(pred_orient[idx_orient]), 4),
        "aviso_orientacion": MENSAJES_ORIENTACION.get(orientacion, ""),
        "tipo_documento": tipo,
        "confianza_documento": round(float(pred_struct[idx_struct]), 4),
        "qr": qr_data,
        "ocr": ocr,
        "archivo_guardado": ruta,
        "utilidad": accion_info,
    }

    resultado["resultado_guardado"] = guardar_resultado_json(nombre, resultado)

    return resultado


async def predict_upload(file: UploadFile) -> dict:
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="El archivo debe ser una imagen.")

    raw = await file.read()
    img = Image.open(io.BytesIO(raw))
    nombre = file.filename or "documento.jpg"
    return predict_image(img, nombre)


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    return await predict_upload(file)


@app.post("/uploads")
async def upload_temporales(files: list[UploadFile] = File(...)):
    resultados = []
    for archivo in files:
        contenido = await archivo.read()
        ext = Path(archivo.filename or "archivo").suffix or ".bin"
        nombre = f"{uuid.uuid4().hex}{ext}"
        destino = TEMP_DIR / nombre
        destino.write_bytes(contenido)
        resultados.append({
            "nombre_original": archivo.filename,
            "archivo_temporal": str(destino),
        })

    return {"cantidad": len(resultados), "archivos": resultados}


@app.post("/uploads/procesar")
def procesar_temporales():
    archivos = [p for p in TEMP_DIR.iterdir() if p.is_file()]
    if not archivos:
        return {"cantidad": 0, "resultados": []}

    resultados = []
    for path in archivos:
        try:
            img = Image.open(path)
            resultado = predict_image(img, path.name)
            resultados.append({"archivo_temporal": str(path), "resultado": resultado})
            path.unlink(missing_ok=True)
        except Exception as exc:
            resultados.append({"archivo_temporal": str(path), "error": str(exc)})

    return {"cantidad": len(resultados), "resultados": resultados}


@app.get("/resultados/export/excel")
def exportar_resultados_excel(limpiar: bool = False):
    archivos = [p for p in RESULTADOS_DIR.iterdir() if p.is_file() and p.suffix.lower() == ".json"]
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Resultados"
    ws.append([
        "archivo",
        "tipo_documento",
        "confianza_documento",
        "nit",
        "fecha",
        "monto",
        "formulario",
        "qr_contenido",
    ])

    for path in archivos:
        data = json.loads(path.read_text(encoding="utf-8"))
        ocr_campos = (data.get("ocr") or {}).get("campos", {})
        qr_data = data.get("qr") or {}
        ws.append([
            Path(data.get("archivo_guardado", "")).name,
            data.get("tipo_documento"),
            data.get("confianza_documento"),
            ocr_campos.get("nit"),
            ocr_campos.get("fecha"),
            ocr_campos.get("monto"),
            ocr_campos.get("formulario"),
            qr_data.get("contenido_raw"),
        ])

    stream = io.BytesIO()
    wb.save(stream)
    stream.seek(0)

    if limpiar:
        for path in archivos:
            path.unlink(missing_ok=True)

    return StreamingResponse(
        stream,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=resultados_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"},
    )


@app.get("/resultados/export/pdf")
def exportar_resultados_pdf(limpiar: bool = False):
    archivos = [p for p in RESULTADOS_DIR.iterdir() if p.is_file() and p.suffix.lower() == ".json"]
    stream = io.BytesIO()
    c = canvas.Canvas(stream, pagesize=letter)
    width, height = letter
    y = height - 50

    c.setFont("Helvetica-Bold", 14)
    c.drawString(40, y, "Reporte de resultados")
    y -= 24

    c.setFont("Helvetica", 9)
    headers = [
        "archivo",
        "tipo",
        "conf.",
        "nit",
        "fecha",
        "monto",
        "form",
        "qr",
    ]
    c.drawString(40, y, " | ".join(headers))
    y -= 14

    for path in archivos:
        data = json.loads(path.read_text(encoding="utf-8"))
        ocr_campos = (data.get("ocr") or {}).get("campos", {})
        qr_data = data.get("qr") or {}
        fila = [
            Path(data.get("archivo_guardado", "")).name,
            str(data.get("tipo_documento") or ""),
            str(data.get("confianza_documento") or ""),
            str(ocr_campos.get("nit") or ""),
            str(ocr_campos.get("fecha") or ""),
            str(ocr_campos.get("monto") or ""),
            str(ocr_campos.get("formulario") or ""),
            str(qr_data.get("contenido_raw") or ""),
        ]

        if y < 60:
            c.showPage()
            y = height - 50
            c.setFont("Helvetica", 9)
            c.drawString(40, y, " | ".join(headers))
            y -= 14

        c.drawString(40, y, " | ".join(fila))
        y -= 12

    c.showPage()
    c.save()
    stream.seek(0)

    if limpiar:
        for path in archivos:
            path.unlink(missing_ok=True)

    return StreamingResponse(
        stream,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=resultados_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"},
    )


@app.post("/predict/export/excel")
async def predict_and_export_excel(file: UploadFile = File(...)):
    contenido = await file.read()
    fake_file = UploadFile(
        filename=file.filename,
        file=io.BytesIO(contenido),
        headers=file.headers,
    )
    resultado = await predict_upload(fake_file)
    stream = construir_excel(resultado)
    return StreamingResponse(
        stream,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=resultado_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"},
    )


@app.get("/documentos")
def listar_documentos():
    resultado = {}
    for carpeta in ARCHIVOS_DIR.iterdir():
        if carpeta.is_dir():
            archivos = [f.name for f in carpeta.iterdir() if f.is_file()]
            resultado[carpeta.name] = {"cantidad": len(archivos), "archivos": archivos}
    return resultado


@app.get("/documentos/{tipo}/descargar")
def descargar_carpeta(tipo: str):
    carpeta = ARCHIVOS_DIR / tipo
    if not carpeta.exists():
        raise HTTPException(status_code=404, detail="Carpeta no encontrada.")

    zip_path = Path(f"/tmp/{tipo}_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
    shutil.make_archive(str(zip_path), "zip", str(carpeta))
    archivo_zip = str(zip_path) + ".zip"

    return FileResponse(
        archivo_zip,
        media_type="application/zip",
        filename=f"{tipo}.zip",
    )


@app.get("/health")
def health():
    return {"status": "ok"}
