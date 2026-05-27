import os
from pathlib import Path

MODELOS_DIR = os.getenv("MODELOS_DIR", "./Modelos_Exportados")
ARCHIVOS_DIR = Path(os.getenv("ARCHIVOS_DIR", "./Documentos_Clasificados"))

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
