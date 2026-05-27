import io

import numpy as np
from PIL import Image
from fastapi import UploadFile, HTTPException

from config import ACCIONES_POR_TIPO, MENSAJES_ORIENTACION
from services.image_preprocess import preprocess
from services import model_loader
from services.qr_reader import leer_qr
from services.storage import guardar_documento


async def predict_upload(file: UploadFile) -> dict:
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="El archivo debe ser una imagen.")

    raw = await file.read()
    img = Image.open(io.BytesIO(raw))
    x = preprocess(img)
    nombre = file.filename or "documento.jpg"

    prob_calidad = float(model_loader.modelo_calidad.predict(x, verbose=0)[0][0])
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

    pred_orient = model_loader.modelo_orientacion.predict(x, verbose=0)[0]
    idx_orient = int(np.argmax(pred_orient))
    orientacion = model_loader.clases_orientacion.get(idx_orient, "Desconocida")

    pred_struct = model_loader.modelo_estructural.predict(x, verbose=0)[0]
    idx_struct = int(np.argmax(pred_struct))
    tipo = model_loader.clases_estructural.get(idx_struct, "Desconocido")

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

    qr_data = leer_qr(img) if tipo == "Facturas" else None
    accion_info = ACCIONES_POR_TIPO.get(tipo, {})
    ruta = guardar_documento(img, tipo, nombre)

    return {
        "etapa": "Completado",
        "calidad": "Aprobada",
        "confianza_calidad": round(prob_calidad, 4),
        "orientacion": orientacion,
        "confianza_orientacion": round(float(pred_orient[idx_orient]), 4),
        "aviso_orientacion": MENSAJES_ORIENTACION.get(orientacion, ""),
        "tipo_documento": tipo,
        "confianza_documento": round(float(pred_struct[idx_struct]), 4),
        "qr": qr_data,
        "archivo_guardado": ruta,
        "utilidad": accion_info,
    }
