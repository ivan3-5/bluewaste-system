# BlueWaste System

BlueWaste is a smart waste management platform for Panabo City with:

- Backend API (Express + Prisma + PostgreSQL)
- Web app (Next.js)
- Mobile app (Flutter)
- Optional YOLO inference API (FastAPI)

## Project Structure

- `backend` - Express API, Prisma schema, seed data
- `web` - Next.js web dashboard and citizen reporting UI
- `mobile_flutter` - Flutter mobile app
- `yolo-fastapi-sample` - optional local YOLO inference service

## Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL 14+
- Cloudinary account (for image upload in backend)
- Optional: Python 3.10+ (for local YOLO FastAPI service)

## 1) Install Dependencies

From the repository root:

```bash
npm install
```

## 2) Configure Environment Variables

Create environment files from the examples:

### PowerShell (Windows)

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item web/.env.example web/.env.local
```

### Bash (macOS/Linux)

```bash
cp backend/.env.example backend/.env
cp web/.env.example web/.env.local
```

Then update the values in each file.

### Backend env (`backend/.env`)

```dotenv
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bluewaste?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
PORT="5000"
NODE_ENV="development"
WEB_URL="http://localhost:3000"
MOBILE_URL="http://localhost:8081"
ALLOWED_ORIGINS="http://localhost:19006,http://127.0.0.1:19006"
```

### Web env (`web/.env.local`)

```dotenv
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
BACKEND_API_URL="http://localhost:5000/api"
USE_GEMINI="false"
YOLO_API_URL="https://ishuualt-bluewaste-yolo26.hf.space/analyze"
GEMINI_API_KEY="your-gemini-api-key"
```

The web server reads these settings from `web/.env.local` locally, or from the
web deployment's environment in production. `USE_GEMINI=false` (the default)
uses `YOLO_API_URL`; set it to `true` to use Gemini and configure
`GEMINI_API_KEY` (and optionally `GEMINI_MODEL`). Restart the web server after
changing them. The backend's separate background analysis has its own
`YOLO_API_URL` and `USE_GEMINI` settings. Set `USE_GEMINI` to the same value
in both deployments. When it is `true`, the backend sends unanalyzed report
images to the web analysis service at `WEB_URL`; set `WEB_URL` to the web
deployment's origin and configure Gemini on the web deployment. Existing
analyzed reports are not reanalyzed.

### Mobile runtime config (Flutter)

Use `--dart-define` when launching the mobile app:

```bash
flutter run --dart-define=API_BASE_URL=http://localhost:5000/api
```

Flutter uses its on-device YOLO model by default. To use the server-selected
provider instead, add `--dart-define=USE_GEMINI=true`; this legacy flag selects
cloud analysis, while the web server's `USE_GEMINI` decides whether that cloud
analysis uses Gemini or hosted YOLO. The flag must be set at build/run time.
If the backend and web servers run separately, also set
`--dart-define=ANALYSIS_API_BASE_URL=http://<web-host>:3000/api` to point to
the web server. Use a host reachable by the device or emulator.

## 3) Prepare Database

Run Prisma migration and seed from the root:

```bash
npm run db:migrate
npm run db:seed
```

Before seeding, set the three seed password env vars in `backend/.env` (they are
**never** hardcoded in source and the seed will abort if they are missing):

```dotenv
SEED_ADMIN_PASSWORD="YourStrongAdminPass!"
SEED_WORKER_PASSWORD="YourStrongWorkerPass!"
SEED_CITIZEN_PASSWORD="YourStrongCitizenPass!"
```

Seed accounts (passwords are whatever you set above):

- Admin:   `admin@bluewaste.ph`
- Workers: `worker1-4@bluewaste.ph`
- Citizen: `citizen@bluewaste.ph`

## 4) Run the Apps

Use separate terminals.

Backend API:

```bash
npm run backend:dev
```

Web app:

```bash
npm run web:dev
```

Mobile app:

```bash
npm run mobile:run:android
```

## Optional: Run YOLO Locally

```bash
cd yolo-fastapi-sample
python -m venv .venv
```

PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

If you deploy YOLO to Render, set `YOLO_API_URL` to your deployed `/analyze` endpoint (e.g. `https://bluewaste-system.onrender.com/analyze`).

## Publishing an Updated YOLO Model

After replacing `yolo-fastapi-sample/weights/best.pt`, run one command from the repo root to publish it everywhere:

```bash
pip install "ultralytics[export-litert]" huggingface_hub
hf auth login                     # one-time; the token is saved locally
python publish_model.py
```

The script:

1. Exports `yolo-fastapi-sample/weights/best.pt` to LiteRT/TFLite (FP32, 640×640) and writes `yolo-fastapi-sample/weights/best.tflite`.
2. Copies it to `mobile_flutter/assets/models/best.tflite` for offline use in the app.
3. Uploads the whole `yolo-fastapi-sample/` folder to Hugging Face (`ishuualt/bluewaste-yolo26`, Space). Files matching `.venv/`, `__pycache__/`, `runs/`, `datasets/`, `logs/`, and `.env*` are skipped.

Options:

| Flag | Description |
|---|---|
| `--repo-id owner/name` | Target repo (default `ishuualt/bluewaste-yolo26`) |
| `--repo-type space\|model\|dataset` | Repo type (default `space`) |
| `--skip-export` | Upload only, without re-exporting |
| `--skip-upload` | Export and copy to Flutter only |
| `--skip-flutter` | Skip copying into `mobile_flutter/` |
| `--dry-run` | List the files that would be uploaded and exit |

After the script runs, rebuild the app with `cd mobile_flutter && flutter clean && flutter run`. Assets are bundled at build time, so a hot reload won't pick up the new model.

## Useful Commands

From root:

```bash
npm run backend:typecheck
npm run web:typecheck
npm run mobile:typecheck
npm run mobile:run:android
npm run backend:build
npm run web:build
npm run db:studio
```

## Deployment Notes

- `vercel.json` rewrites `/api/*` to the backend serverless function while Next.js handles frontend routes directly.
- In production, set environment variables in your hosting provider (Vercel, Render, etc.).
