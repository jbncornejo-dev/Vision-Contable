# Vision Contable - Clasificación Inteligente de Documentos

Plataforma web impulsada por Inteligencia Artificial para la clasificación, rotación automática y validación de calidad de documentos contables (Facturas, Contratos y NITs).

## 🏗 Arquitectura del Proyecto

Este proyecto está dividido en microservicios:

* **Frontend:** Interfaz de usuario moderna construida con Next.js y React. Permite la carga por lotes de imágenes.
* **Backend (API):** Servidor construido con Python y FastAPI encargado de orquestar el flujo de datos.
* **Inteligencia Artificial:** Modelos de Redes Neuronales Convolucionales (CNN) entrenados desde cero con Keras 3 y TensorFlow, encargados de evaluar la calidad, orientación y estructura visual de los documentos.

## Estructura del Repositorio

* `/frontend` - Código fuente de la aplicación web (Next.js).
* `/backend` - Código fuente de la API (FastAPI) y entorno virtual.
* `/notebooks` - Archivos `.ipynb` con el código utilizado para entrenar los modelos en Google Colab.

*(Nota: Los datasets de imágenes y los archivos binarios `.keras` se almacenan de forma externa para mantener la ligereza del repositorio).*

---

## Guía de Instalación y Ejecución (Local)

Levanta el proyecto en una sola computadora configurándolo de manera local.

### Requisitos Previos
Necesitas clonar el repositorio y configurar los `.env`:

```bash
git clone https://github.com/jbncornejo-dev/Vision-Contable.git
cd Vision-Contable
```

**Variables de Entorno:**
1. Copia `backend/.env.example` a `backend/.env` y añade tu `OCRSPACE_API_KEY`.
2. Copia `frontend/.env.local.example` a `frontend/.env.local` y ajusta `BLOB_READ_WRITE_TOKEN` o `NEXT_PUBLIC_BACKEND_URL` (para local es `http://127.0.0.1:8000`).

---

### Ejecución Local Manual

Sigue estos pasos secuenciales teniendo instalados **Python (3.10+)** y **Node.js (18+)**.

#### 1. Configurar y Ejecutar el Backend (FastAPI + IA)

1. **Navega al directorio del backend:**
   ```bash
   cd backend
   ```
2. **Crea y activa un entorno virtual de Python:**
   * En **Windows**:
     ```bash
     python -m venv venv
     venv\Scripts\activate
     ```
   * En **macOS/Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
3. **Instala las dependencias necesarias:**
   ```bash
   pip install -r requirements.txt
   ```
4. **Inicia el servidor Backend:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

#### 2. Configurar y Ejecutar el Frontend (Next.js)

Abre una **nueva terminal** (mantén el backend corriendo en la primera).

1. **Navega al directorio del frontend:**
   ```bash
   cd frontend
   ```
2. **Instala las dependencias de Node.js:**
   ```bash
   npm install
   ```
3. **Inicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

**¡Prueba la Aplicación!** Abre tu navegador en **[http://localhost:3000](http://localhost:3000)**.

---

## Pipeline de Inferencia (Características Principales)

El sistema opera mediante una arquitectura modular y secuencial que aplica tres redes neuronales especializadas:

1. **Validación de Calidad Visual:** Ejecuta una clasificación binaria probabilística para detectar si una imagen es nítida o borrosa. Si no supera el umbral, se activa un mecanismo de salida temprana (*early exit*).
2. **Normalización Espacial (Orientación):** Estima el operador de rotación (0°, 90°, 180°, 270°) y endereza automáticamente el documento para restablecer su orientación canónica.
3. **Clasificación Estructural:** Finalmente, clasifica el tensor normalizado en categorías documentales rígidas (Facturas, NITs y Declaraciones Juradas).

### Enfoque de Inteligencia Artificial

* **Entrenamiento "From Scratch":** Los tres modelos fueron entrenados de forma independiente sin Transfer Learning, optimizando la topología y garantizando confidencialidad.
* **Preprocesamiento y Data Augmentation:** Se aplican transformaciones afines aleatorias (zoom, desplazamiento, brillo) durante el entrenamiento para robustecer el modelo.

## 🛠 Endpoints Principales de la API Backend

* `GET /`: Ruta raíz. Mensaje de bienvenida y versión de la API.
* `GET /health`: Verifica el estado de los servicios.
* `GET /models/info`: Metadatos técnicos de los modelos de IA cargados.
* `POST /predict`: Endpoint principal. Recibe una imagen, ejecuta la validación, rotación y clasificación devolviendo las métricas.
* `POST /preprocess/normalize`: Ejecuta únicamente la normalización y enderezamiento (útil para depuración).
* `GET /analytics/stats`: Métricas acumuladas del sistema (tasa de rechazo, volúmenes de documentos, latencias).
* `GET /resultados/export/excel`: Exporta los resultados almacenados a un archivo Excel.
* `GET /resultados/export/pdf`: Exporta los resultados almacenados a un archivo PDF.

## Stack Tecnológico

* **Inteligencia Artificial:** TensorFlow 2.21.0, Keras 3.14.0, NumPy 2.4.4, Pillow 12.2.0
* **Backend:** Python 3.11.9, FastAPI 0.136.1, Uvicorn 0.46.0, python-multipart 0.0.27
* **Frontend:** Next.js 16.2.6
* **Entorno de Entrenamiento:** Google Colab (GPU T4)
