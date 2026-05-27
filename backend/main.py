import io
import shutil
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware

from config import ARCHIVOS_DIR
from services.exporter import construir_excel
from services.model_loader import load_models
from services.predictor import predict_upload
from services.storage import init_storage

app = FastAPI(title="Vision Contable API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

init_storage()


@app.on_event("startup")
def on_startup():
    load_models()


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    return await predict_upload(file)


@app.post("/predict/export/excel")
async def predict_and_export_excel(file: UploadFile = File(...)):
    contenido = await file.read()
    fake_file = UploadFile(
        filename=file.filename,
        file=io.BytesIO(contenido),
        headers=file.headers,
    )
    resultado = await predict_upload(fake_file)
    stream    = construir_excel(resultado)
    return StreamingResponse(
        stream,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=resultado_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"}
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
        filename=f"{tipo}.zip"
    )


@app.get("/health")
def health():
    return {"status": "ok"}