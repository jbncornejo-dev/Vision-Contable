import json
from datetime import datetime
from pathlib import Path

from PIL import Image

CARPETA_POR_TIPO = {
    "Facturas": "Facturas",
    "NITs": "NITs",
    "Declaraciones_Juradas": "Declaraciones_Juradas",
}


def init_storage(archivos_dir: Path, resultados_dir: Path) -> None:
    carpetas = set(CARPETA_POR_TIPO.values()) | {"No_Reconocidos"}
    for carpeta in carpetas:
        (archivos_dir / carpeta).mkdir(parents=True, exist_ok=True)
    resultados_dir.mkdir(parents=True, exist_ok=True)


def guardar_resultado_json(resultados_dir: Path, nombre_base: str, payload: dict) -> str:
    nombre = f"{Path(nombre_base).stem}.json"
    resultados_dir.mkdir(parents=True, exist_ok=True)
    ruta = resultados_dir / nombre
    ruta.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    return str(ruta)


def guardar_documento(archivos_dir: Path, img: Image.Image, tipo: str, nombre_original: str) -> str:
    carpeta = CARPETA_POR_TIPO.get(tipo, "No_Reconocidos")
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    ext = Path(nombre_original).suffix or ".jpg"
    nombre = f"{ts}_{Path(nombre_original).stem}{ext}"
    (archivos_dir / carpeta).mkdir(parents=True, exist_ok=True)
    destino = archivos_dir / carpeta / nombre
    img.save(str(destino))
    return str(destino)


def listar_documentos(archivos_dir: Path) -> dict:
    resultado = {}
    if not archivos_dir.exists():
        return resultado
    for carpeta in archivos_dir.iterdir():
        if carpeta.is_dir():
            archivos = [f.name for f in carpeta.iterdir() if f.is_file()]
            resultado[carpeta.name] = {"cantidad": len(archivos), "archivos": archivos}
    return resultado


def vaciar_carpeta(archivos_dir: Path, resultados_dir: Path, tipo: str) -> tuple[int, int]:
    carpeta = archivos_dir / tipo

    if not carpeta.exists():
        return 0, 0

    eliminados = 0
    for archivo in carpeta.iterdir():
        if archivo.is_file():
            archivo.unlink(missing_ok=True)
            eliminados += 1

    resultados_eliminados = 0
    if not resultados_dir.exists():
        return eliminados, resultados_eliminados
    for resultado in resultados_dir.iterdir():
        if not (resultado.is_file() and resultado.suffix.lower() == ".json"):
            continue
        try:
            data = json.loads(resultado.read_text(encoding="utf-8"))
            if data.get("tipo_documento") == tipo:
                resultado.unlink(missing_ok=True)
                resultados_eliminados += 1
        except Exception:
            continue

    return eliminados, resultados_eliminados
