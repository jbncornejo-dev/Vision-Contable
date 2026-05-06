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