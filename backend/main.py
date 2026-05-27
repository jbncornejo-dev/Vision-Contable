import io
import json
import os
import shutil
import tempfile
from datetime import datetime
from pathlib import Path

from PIL import Image

os.environ["KERAS_BACKEND"] = "tensorflow"

import keras
import openpyxl
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")
load_dotenv(Path(__file__).resolve().parent / ".env")

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from services.prediction import predict_image, cargar_imagen_desde_url
from services.schemas import ProcesarBlobRequest
from services.storage import (
    init_storage,
    guardar_resultado_json,
    guardar_documento,
    listar_documentos as listar_documentos_storage,
    vaciar_carpeta as vaciar_carpeta_storage,
)

MODELOS_DIR = os.getenv("MODELOS_DIR", "./Modelos_Exportados")
ARCHIVOS_DIR = Path(os.getenv("ARCHIVOS_DIR", "./Documentos_Clasificados"))
RESULTADOS_DIR = Path(os.getenv("RESULTADOS_DIR", "./Documentos_Resultados"))
OCRSPACE_API_KEY = os.getenv("OCRSPACE_API_KEY", "").strip()

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


@app.on_event("startup")
def load_models():
    global modelo_calidad, modelo_orientacion, modelo_estructural
    global clases_orientacion, clases_estructural

    init_storage(ARCHIVOS_DIR, RESULTADOS_DIR)

    modelo_calidad = keras.saving.load_model(f"{MODELOS_DIR}/modelo_calidad.keras")
    modelo_orientacion = keras.saving.load_model(f"{MODELOS_DIR}/modelo_orientacion.keras")
    modelo_estructural = keras.saving.load_model(f"{MODELOS_DIR}/modelo_estructural.keras")

    with open(f"{MODELOS_DIR}/clases_orientacion.json") as f:
        clases_orientacion.update({v: k for k, v in json.load(f).items()})

    with open(f"{MODELOS_DIR}/clases_estructural.json") as f:
        clases_estructural.update({v: k for k, v in json.load(f).items()})


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


def run_prediction(img: Image.Image, nombre: str) -> dict:
    init_storage(ARCHIVOS_DIR, RESULTADOS_DIR)
    return predict_image(
        img,
        nombre,
        modelo_calidad=modelo_calidad,
        modelo_orientacion=modelo_orientacion,
        modelo_estructural=modelo_estructural,
        clases_orientacion=clases_orientacion,
        clases_estructural=clases_estructural,
        ocrspace_api_key=OCRSPACE_API_KEY,
        guardar_documento_fn=lambda image, tipo, original: guardar_documento(ARCHIVOS_DIR, image, tipo, original),
        guardar_resultado_json_fn=lambda nombre_base, payload: guardar_resultado_json(RESULTADOS_DIR, nombre_base, payload),
    )


async def predict_upload(file: UploadFile) -> dict:
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="El archivo debe ser una imagen.")

    raw = await file.read()
    img = Image.open(io.BytesIO(raw))
    nombre = file.filename or "documento.jpg"
    return run_prediction(img, nombre)


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    return await predict_upload(file)


@app.post("/uploads/procesar")
def procesar_desde_blob(payload: ProcesarBlobRequest):
    if not payload.archivos:
        return {"cantidad": 0, "resultados": []}

    resultados = []
    for item in payload.archivos:
        try:
            img = cargar_imagen_desde_url(str(item.url_blob))
            resultado = run_prediction(img, item.nombre_original)
            resultados.append(
                {
                    "archivo_url": str(item.url_blob),
                    "nombre_original": item.nombre_original,
                    "resultado": resultado,
                }
            )
        except Exception as exc:
            resultados.append(
                {
                    "archivo_url": str(item.url_blob),
                    "nombre_original": item.nombre_original,
                    "error": str(exc),
                }
            )

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
        "fecha",
        "monto",
        "contenido",
        "qr_contenido",
    ])

    for path in archivos:
        data = json.loads(path.read_text(encoding="utf-8"))
        ocr_campos = (data.get("ocr") or {}).get("campos", {})
        ocr_texto = (data.get("ocr") or {}).get("texto", "")
        qr_data = data.get("qr") or {}
        ws.append([
            Path(data.get("archivo_guardado", "")).name,
            data.get("tipo_documento"),
            data.get("confianza_documento"),
            ocr_campos.get("fecha"),
            ocr_campos.get("monto"),
            ocr_texto,
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
        "fecha",
        "monto",
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
            str(ocr_campos.get("fecha") or ""),
            str(ocr_campos.get("monto") or ""),
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
    return listar_documentos_storage(ARCHIVOS_DIR)


@app.get("/documentos/{tipo}/descargar")
def descargar_carpeta(tipo: str):
    carpeta = ARCHIVOS_DIR / tipo
    if not carpeta.exists():
        raise HTTPException(status_code=404, detail="Carpeta no encontrada.")

    zip_path = Path(tempfile.gettempdir()) / f"{tipo}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    shutil.make_archive(str(zip_path), "zip", str(carpeta))
    archivo_zip = str(zip_path) + ".zip"

    return FileResponse(
        archivo_zip,
        media_type="application/zip",
        filename=f"{tipo}.zip",
    )


@app.delete("/documentos/{tipo}")
def vaciar_carpeta(tipo: str):
    carpeta = ARCHIVOS_DIR / tipo
    if not carpeta.exists():
        raise HTTPException(status_code=404, detail="Carpeta no encontrada.")

    eliminados, resultados_eliminados = vaciar_carpeta_storage(ARCHIVOS_DIR, RESULTADOS_DIR, tipo)

    return {
        "tipo": tipo,
        "eliminados": eliminados,
        "resultados_eliminados": resultados_eliminados,
    }


@app.get("/health")
def health():
    return {"status": "ok"}
