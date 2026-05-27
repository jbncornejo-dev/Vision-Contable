import numpy as np
from PIL import Image

from config import IMG_SIZE


def preprocess(img: Image.Image) -> np.ndarray:
    img = img.convert("RGB").resize(IMG_SIZE)
    return np.expand_dims(np.array(img, dtype=np.float32), axis=0)
