import os
import json
import io
import numpy as np
from PIL import Image

os.environ["KERAS_BACKEND"] = "tensorflow"

import keras
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

MODELOS_DIR = os.getenv("MODELOS_DIR", "./Modelos_Exportados")

app = FastAPI(title="Vision Contable API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

modelo_calidad     = None
modelo_orientacion = None
modelo_estructural = None
clases_orientacion = {}
clases_estructural = {}

IMG_SIZE = (224, 224)


@app.on_event("startup")
def load_models():
    global modelo_calidad, modelo_orientacion, modelo_estructural
    global clases_orientacion, clases_estructural

    modelo_calidad     = keras.saving.load_model(f"{MODELOS_DIR}/modelo_calidad.keras")
    modelo_orientacion = keras.saving.load_model(f"{MODELOS_DIR}/modelo_orientacion.keras")
    modelo_estructural = keras.saving.load_model(f"{MODELOS_DIR}/modelo_estructural.keras")

    with open(f"{MODELOS_DIR}/clases_orientacion.json") as f:
        raw = json.load(f)
        clases_orientacion = {v: k for k, v in raw.items()}

    with open(f"{MODELOS_DIR}/clases_estructural.json") as f:
        raw = json.load(f)
        clases_estructural = {v: k for k, v in raw.items()}


def preprocess(img: Image.Image) -> np.ndarray:
    img = img.convert("RGB").resize(IMG_SIZE)
    x   = np.array(img, dtype=np.float32)
    return np.expand_dims(x, axis=0)


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="El archivo debe ser una imagen.")

    raw = await file.read()
    img = Image.open(io.BytesIO(raw))
    x   = preprocess(img)

    prob_calidad = float(modelo_calidad.predict(x, verbose=0)[0][0])
    es_nitida    = prob_calidad >= 0.5

    if not es_nitida:
        return {
            "calidad":           "Rechazada",
            "confianza_calidad": round(prob_calidad, 4),
            "mensaje":           "Imagen con calidad insuficiente. Por favor envíe una imagen más nítida.",
        }

    pred_orient  = modelo_orientacion.predict(x, verbose=0)[0]
    idx_orient   = int(np.argmax(pred_orient))

    pred_struct  = modelo_estructural.predict(x, verbose=0)[0]
    idx_struct   = int(np.argmax(pred_struct))

    return {
        "calidad":           "Aprobada",
        "confianza_calidad": round(prob_calidad, 4),
        "orientacion":       clases_orientacion[idx_orient],
        "confianza_orient":  round(float(pred_orient[idx_orient]), 4),
        "tipo_documento":    clases_estructural[idx_struct],
        "confianza_tipo":    round(float(pred_struct[idx_struct]), 4),
    }


@app.get("/health")
def health():
    return {"status": "ok"}