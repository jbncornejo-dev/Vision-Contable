import io
import re
import urllib.parse

import cv2
import numpy as np
import requests
from PIL import Image

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


def ocr_space_image(img: Image.Image, ocrspace_api_key: str) -> dict:
    if not ocrspace_api_key:
        return {"error": "OCRSPACE_API_KEY no configurada"}

    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    try:
        resp = requests.post(
            "https://api.ocr.space/parse/image",
            files={"file": ("documento.png", buffer, "image/png")},
            data={"language": "spa", "OCREngine": 2},
            headers={"apikey": ocrspace_api_key},
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


def calcular_rotacion(clase_orientacion: str) -> int:
    digits = "".join(ch for ch in clase_orientacion if ch.isdigit())
    if not digits:
        return 0
    return int(digits)


def cargar_imagen_desde_url(url: str) -> Image.Image:
    resp = requests.get(url, timeout=20)
    resp.raise_for_status()
    return Image.open(io.BytesIO(resp.content))


def predict_image(
    img: Image.Image,
    nombre: str,
    *,
    modelo_calidad,
    modelo_orientacion,
    modelo_estructural,
    clases_orientacion: dict,
    clases_estructural: dict,
    ocrspace_api_key: str,
    guardar_documento_fn,
    guardar_resultado_json_fn,
) -> dict:
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
        ruta = guardar_documento_fn(img, "Ninguno", nombre)
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
    ruta = guardar_documento_fn(img, tipo, nombre)

    ocr = ocr_space_image(img_para_qr, ocrspace_api_key)
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

    resultado["resultado_guardado"] = guardar_resultado_json_fn(nombre, resultado)

    return resultado
