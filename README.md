# Clasificación Inteligente de Documentos

Plataforma web impulsada por Inteligencia Artificial para la clasificación, rotación automática y validación de calidad de documentos contables (Facturas, Contratos y NITs).

## Arquitectura del Proyecto

Este proyecto está dividido en microservicios:

* **Frontend:** Interfaz de usuario moderna construida con Next.js y React. Permite la carga por lotes de imágenes.
* **Backend (API):** Servidor construido con Python y FastAPI encargado de orquestar el flujo de datos.
* **Inteligencia Artificial:** Modelos de Redes Neuronales Convolucionales (CNN) entrenados desde cero con Keras 3 y TensorFlow, encargados de evaluar la calidad, orientación y estructura visual de los documentos.

## Estructura del Repositorio

* `/frontend` - Código fuente de la aplicación web (Next.js).
* `/backend` - Código fuente de la API (FastAPI) y entorno virtual.
* `/notebooks` - Archivos `.ipynb` con el código utilizado para entrenar los modelos en Google Colab.

*(Nota: Los datasets de imágenes y los archivos binarios `.keras` se almacenan de forma externa para mantener la ligereza del repositorio).*

Aquí tienes la continuación y expansión de tu README basándome en los detalles técnicos de tu informe. Te lo entrego en texto plano estructurado para que puedas darle el formato Markdown fácilmente.

Clasificación Inteligente de Documentos

Plataforma web impulsada por Inteligencia Artificial para la clasificación, rotación automática y validación de calidad de documentos contables (Facturas, NITs y Declaraciones Juradas).

Arquitectura del Proyecto Este proyecto está dividido en microservicios: Frontend: Interfaz de usuario moderna construida con Next.js y React. Permite la carga de imágenes. Backend (API): Servidor construido con Python y FastAPI encargado de orquestar el flujo de datos. Inteligencia Artificial: Modelos de Redes Neuronales Convolucionales (CNN) entrenados desde cero con Keras 3 y TensorFlow, encargados de evaluar la calidad, orientación y estructura visual de los documentos.

Estructura del Repositorio /frontend - Código fuente de la aplicación web (Next.js). /backend - Código fuente de la API (FastAPI) y entorno virtual. /notebooks - Archivos .ipynb con el código utilizado para entrenar los modelos en Google Colab. (Nota: Los datasets de imágenes y los archivos binarios .keras se almacenan de forma externa para mantener la ligereza del repositorio).

Pipeline de Inferencia (Características Principales) El sistema opera mediante una arquitectura modular y secuencial que aplica tres redes neuronales especializadas:

- Validación de Calidad Visual: Ejecuta una clasificación binaria probabilística para detectar si una imagen es nítida o borrosa (desenfoque gaussiano, iluminación deficiente). Si no supera el umbral paramétrico, se activa un mecanismo de salida temprana (early exit) que rechaza la imagen, ahorrando recursos computacionales.
- Normalización Espacial (Orientación): Un segundo modelo estima el operador de rotación espacial (0°, 90°, 180°, 270°) y endereza automáticamente el documento para restablecer su orientación canónica.
- Clasificación Estructural: Finalmente, clasifica el tensor normalizado en categorías documentales rígidas: Facturas, NITs y Declaraciones Juradas.

Enfoque de Inteligencia Artificial

- Entrenamiento "From Scratch": Los tres modelos fueron entrenados desde cero de forma totalmente independiente, descartando el Transfer Learning. Esto optimiza la topología dimensional, garantiza la confidencialidad de los datos contables y extrae características de alta frecuencia específicas de documentos impresos (líneas de texto, cuadrículas, sellos).
- Preprocesamiento y Aumento de Datos (Data Augmentation): Para mitigar el sobreajuste y simular la variabilidad estocástica de las capturas móviles, los tensores se procesan en escala de grises y se les aplican transformaciones afines aleatorias (zoom, desplazamiento, variaciones de brillo) durante el entrenamiento.

Endpoints de la API

- GET /health: Verifica el estado del servicio backend.
- POST /predict: Recibe un archivo de imagen (multipart/form-data) y ejecuta el pipeline. Retorna un objeto JSON con el estado de aprobación, clases predichas y niveles de confianza de cada modelo. Incluye integración con Swagger UI en la ruta /docs para pruebas interactivas.

Stack Tecnológico

- Inteligencia Artificial: TensorFlow 2.21.0, Keras 3.14.0, NumPy 2.4.4, Pillow 12.2.0
- Backend: Python 3.11.9, FastAPI 0.136.1, Uvicorn 0.46.0, python-multipart 0.0.27
- Frontend: Next.js 16.2.6
- Entorno de Entrenamiento: Google Colab (GPU T4)