from datetime import datetime
from pathlib import Path

from PIL import Image

from config import ARCHIVOS_DIR, CARPETA_POR_TIPO


def init_storage():
    carpetas = set(CARPETA_POR_TIPO.values()) | {"No_Reconocidos"}
    for carpeta in carpetas:
        (ARCHIVOS_DIR / carpeta).mkdir(parents=True, exist_ok=True)


def guardar_documento(img: Image.Image, tipo: str, nombre_original: str) -> str:
    carpeta = CARPETA_POR_TIPO.get(tipo, "No_Reconocidos")
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    ext = Path(nombre_original).suffix or ".jpg"
    nombre = f"{ts}_{Path(nombre_original).stem}{ext}"
    destino = ARCHIVOS_DIR / carpeta / nombre
    img.save(str(destino))
    return str(destino)
