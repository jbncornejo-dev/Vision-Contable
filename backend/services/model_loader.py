import json
import os

os.environ["KERAS_BACKEND"] = "tensorflow"

import keras

from config import MODELOS_DIR

modelo_calidad = None
modelo_orientacion = None
modelo_estructural = None
clases_orientacion = {}
clases_estructural = {}


def load_models():
    global modelo_calidad, modelo_orientacion, modelo_estructural
    global clases_orientacion, clases_estructural

    modelo_calidad = keras.saving.load_model(f"{MODELOS_DIR}/modelo_calidad.keras")
    modelo_orientacion = keras.saving.load_model(f"{MODELOS_DIR}/modelo_orientacion.keras")
    modelo_estructural = keras.saving.load_model(f"{MODELOS_DIR}/modelo_estructural.keras")

    with open(f"{MODELOS_DIR}/clases_orientacion.json") as f:
        clases_orientacion.update({v: k for k, v in json.load(f).items()})

    with open(f"{MODELOS_DIR}/clases_estructural.json") as f:
        clases_estructural.update({v: k for k, v in json.load(f).items()})
