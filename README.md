# Vision Contable - Clasificación Inteligente de Documentos

Plataforma web con frontend Next.js y backend FastAPI para la clasificación, rotación y validación de documentos contables

## Prerequisitos

* Docker Desktop con docker compose funcional
* Git

## Como Ejecutar

1. Clona el repositorio y entra a la carpeta:

```bash
git clone https://github.com/jbncornejo-dev/Vision-Contable.git
cd Vision-Contable
```

2. Copia las variables de entorno:

```bash
copy backend\.env.example backend\.env
copy frontend\.env.local.example frontend\.env
```

3. Levanta todo con Docker Compose:

```bash
docker compose up --build
```

4. Abre:

```bash
http://localhost:3000
```

Backend (API): `http://localhost:8000`.

## Tecnologías del proyecto

* Python 3.12
* Node.js 18+
* Git
* Docker

## Ejecucion manual (opcional sin docker)

### Backend

```bash
cd backend
py -3.12 -m venv .venv
.venv\Scripts\activate
python -m pip install --upgrade pip setuptools wheel
python -m pip install -r requirements.txt
copy .env.example .env
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Si el comando `uvicorn` no se encuentra:

```bash
cd backend
.venv\Scripts\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

> En macOS/Linux:
>
> ```bash
> python3.12 -m venv .venv
> source .venv/bin/activate
> python -m pip install --upgrade pip setuptools wheel
> python -m pip install -r requirements.txt
> cp .env.example .env
> uvicorn main:app --reload --host 0.0.0.0 --port 8000
> ```

### Frontend

Antes de instalar, copia el archivo de configuración:

```bash
cd frontend
copy .env.local.example .env
npm install
npm run dev
```

> En macOS/Linux:
>
> ```bash
> cd frontend
> cp .env.local.example .env
> npm install
> npm run dev
> ```

Abre una nueva terminal y ejecuta:

```bash
cd frontend
npm install
npm run dev
```

Debe abrir el navegador en:

```bash
http://localhost:3000
```

## Enlaces
* Carpeta de archivos y organización: https://drive.google.com/drive/folders/1sdp1bp2hRd-aGpk7vOGql042lgbh8okN
* Colab del proyecto: https://colab.research.google.com/drive/1LQ6VaRtbjCX_2h3w-9YFENiVGkCzb4Un
* Repositorio original: https://github.com/jbncornejo-dev/Vision-Contable.git

## Endpoints principales del backend

* `GET /`
* `GET /health`
* `GET /models/info`
* `POST /predict`
* `POST /preprocess/normalize`
* `GET /analytics/stats`
* `GET /resultados/export/excel`
* `GET /resultados/export/pdf`
