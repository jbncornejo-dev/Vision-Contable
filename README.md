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

- GET / * Descripción: Ruta raíz del servicio. Retorna un mensaje de bienvenida, la versión actual de la API, el estado de disponibilidad del sistema y enlaces rápidos a la documentación.

- GET /health * Descripción: Endpoint de verificación de estado (Health Check). Utilizado por herramientas de monitoreo o el frontend para validar que el contenedor o servidor esté activo, confirmando además el backend de ejecución activo (TensorFlow/Keras).

- GET /models/info * Descripción: Metadatos de los modelos de IA. Retorna un objeto JSON detallado con las especificaciones técnicas de las tres redes neuronales convolucionales (CNN) cargadas globalmente en memoria RAM: dimensiones de entrada de los tensores (224x224x3), mapeo inverso de los índices de las clases estructurales y de orientación, y versiones de los archivos .keras utilizados.

- POST /predict * Descripción: Endpoint principal del pipeline de inferencia. Recibe un archivo binario de imagen (multipart/form-data). Realiza de forma secuencial la validación de nitidez, la corrección matricial de la orientación (rotación física si la imagen está invertida o de lado) y la clasificación del tipo de documento contable. Retorna las etiquetas asignadas junto con sus métricas probabilísticas de confianza.

- POST /preprocess/normalize * Descripción: Endpoint modular de procesamiento visual. Diseñado para desacoplar la lógica de IA. Recibe una imagen y ejecuta únicamente la normalización dimensional y el enderezamiento espacial basado en el segundo modelo, retornando la imagen corregida directamente en formato de archivo (image/jpeg) en lugar de datos JSON. Es ideal para depuración en el frontend.

- GET /analytics/stats * Descripción: Panel de métricas e indicadores. Proporciona datos estadísticos acumulados del uso del sistema (útil para la defensa académica del proyecto), tales como la tasa de rechazo por calidad insuficiente, el volumen de documentos procesados por categoría (Facturas, NITs, Declaraciones Juradas) y latencias promedio en el cálculo de tensores.

Stack Tecnológico

- Inteligencia Artificial: TensorFlow 2.21.0, Keras 3.14.0, NumPy 2.4.4, Pillow 12.2.0
- Backend: Python 3.11.9, FastAPI 0.136.1, Uvicorn 0.46.0, python-multipart 0.0.27
- Frontend: Next.js 16.2.6
- Entorno de Entrenamiento: Google Colab (GPU T4)

## Docker (Build y despliegue con Docker Compose)

Se incluye una configuración para ejecutar el backend y frontend con Docker y `docker-compose`.

Archivos añadidos:
- `backend/Dockerfile` — imagen para el backend (Python + uvicorn). Incluye instalación de dependencias y copia de `Modelos_Exportados`.
- `frontend/Dockerfile` — build multi-stage para compilar el `Next.js` frontend y servirlo en producción.
- `docker-compose.yml` — orquesta dos servicios: `backend` (puerto 8000) y `frontend` (puerto 3000).

Comandos rápidos:

1. Construir imágenes y levantar servicios:
```bash
docker compose build
docker compose up -d
```

2. Ver logs:
```bash
docker compose logs -f backend
docker compose logs -f frontend
```

3. Parar y limpiar:
```bash
docker compose down
```

Notas:
- Antes de ejecutar, copia y configura las variables de entorno:
	- `backend/.env` (usa `backend/.env.example` como plantilla)
	- `frontend/.env.local` (pon `BLOB_READ_WRITE_TOKEN` si es necesario)
- Los volúmenes montados hacen persistir `Modelos_Exportados`, `Documentos_Clasificados` y `Documentos_Resultados` en la máquina host.
- Si necesitas una imagen más ligera o usar GPUs, puedo adaptar los Dockerfiles.