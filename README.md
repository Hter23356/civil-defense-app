# Civil Defense App

Full-stack web app for civil protection information: active alerts, shelter map, first-aid instructions, and public update messages.

## Tech Stack

- Backend: FastAPI, MongoDB, Motor, Pydantic
- Frontend: React, CRACO, Tailwind CSS, Radix UI, Leaflet

## Local Setup

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

Required backend variables:

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=civil_defense
CORS_ORIGINS=http://localhost:3000
TELEGRAM_TOKEN=
```

### Frontend

```powershell
cd frontend
yarn install
Copy-Item .env.example .env
yarn start
```

Required frontend variables:

```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

After both apps are running, open `http://localhost:3000` and use the sample-data button once to seed demo content.

## Hosting

A simple deployment option is Render:

1. Create a MongoDB Atlas database and copy the connection string.
2. Deploy the backend as a Python web service from `backend`.
3. Set backend environment variables: `MONGO_URL`, `DB_NAME`, `CORS_ORIGINS`, and optional `TELEGRAM_TOKEN`.
4. Deploy the frontend as a static site from `frontend`.
5. Set `REACT_APP_BACKEND_URL` to the public backend URL.
6. Set backend `CORS_ORIGINS` to the public frontend URL.

Suggested backend start command:

```bash
uvicorn server:app --host 0.0.0.0 --port $PORT
```

Suggested frontend build command:

```bash
yarn install && yarn build
```

Suggested frontend publish directory:

```text
build
```
