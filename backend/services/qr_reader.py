import urllib.parse

import cv2
import numpy as np
from PIL import Image

try:
    from pyzbar import pyzbar
    _PYZBAR_OK = True
except Exception:
    pyzbar = None
    _PYZBAR_OK = False


def leer_qr(img: Image.Image) -> dict | None:
    if not _PYZBAR_OK:
        return None

    img_cv = cv2.cvtColor(np.array(img.convert("RGB")), cv2.COLOR_RGB2BGR)
    codigos = pyzbar.decode(img_cv)
    if not codigos:
        return None

    contenido = codigos[0].data.decode("utf-8")
    resultado = {"contenido_raw": contenido}

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

    return resultado
