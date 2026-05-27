from pydantic import BaseModel, HttpUrl


class BlobArchivoInput(BaseModel):
    nombre_original: str
    url_blob: HttpUrl


class ProcesarBlobRequest(BaseModel):
    archivos: list[BlobArchivoInput]
