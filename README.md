# Vision Contable - Clasificación Inteligente de Documentos

Plataforma web con frontend Next.js y backend FastAPI para la clasificación, rotación y validación de documentos contables.

## Requisitos mínimos

* Python 3.12
* Node.js 18+
* Git

## Instalación y ejecución rápida

Abre una terminal y ejecuta estos comandos:

```bash
git clone https://github.com/jbncornejo-dev/Vision-Contable.git
cd Vision-Contable
```

### 1. Backend

```bash
cd backend
py -3.12 -m venv .venv
.venv\Scripts\activate
python -m pip install --upgrade pip setuptools wheel
python -m pip install -r requirements.txt
copy .env.example .env
uvicorn main:app --reload --host 0.0.0.0 --port 8000
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

### 2. Frontend

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

Luego abre el navegador en:

```bash
http://localhost:3000
```

## Notas importantes

* Copia `backend/.env.example` a `backend/.env`.
* Copia `frontend/.env.local.example` a `frontend/.env`.
* Si necesitas editar variables de entorno, modifica `backend/.env` o `frontend/.env`.
* El backend usa `reportlab==4.5.1`, compatible con Python 3.12.
* No es necesario ejecutar ningún paso adicional fuera de los comandos mostrados arriba.

## Estructura principal

* `/frontend` - Aplicación web Next.js.
* `/backend` - API FastAPI y dependencias Python.

## Enlaces útiles

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
