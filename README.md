# DONGNE

A Korea neighborhood discovery & community platform — cities, places, food, culture, events, gamified language learning (Korean/Russian/Uzbek), an AI assistant, and a social feed. Full UI available in English, Russian, Korean, and Uzbek.

`client/` — React + Vite frontend
`server/` — Express + MongoDB API

## Prerequisites

- Node.js 18+
- MongoDB running locally (or a connection string to a remote instance)

## Setup

**This step is easy to miss when cloning onto a new machine: MongoDB data lives outside git.** Cloning the repo gets you the code, not the database contents — every computer has its own local MongoDB, so right after cloning it's empty. If you skip the seed step below, the app runs without errors but every page looks blank and the demo/admin logins don't exist yet.

### 1. Server

```bash
cd server
npm install
cp .env.example .env
```

Open `.env` and set at least `JWT_SECRET` to something random. `MONGO_URI` defaults to `mongodb://127.0.0.1:27017/dongne` (a local MongoDB), which is fine for development. `OPENAI_API_KEY` is optional — without it, the AI Assistant still works but with simpler rule-based results instead of AI-generated text.

Make sure MongoDB is running, then seed the database (**required** — this creates all cities/places/food/culture/events/language lessons and the demo accounts):

```bash
npm run seed
```

Start the API:

```bash
npm run dev
```

Runs on http://localhost:4000.

### 2. Client

```bash
cd client
npm install
npm run dev
```

Runs on http://localhost:5173.

## Demo accounts

After seeding, these accounts exist (all seed data is reset if you run `npm run seed` again):

| Role | Email | Password |
|---|---|---|
| Admin | `admin@gmail.com` | `admin123` |
| Moderator | `moderator@dongne.app` | `password123` |
| User | `jinwoo_seoul@dongne.app` / `haerin_explores@dongne.app` / `minsoo_busan@dongne.app` | `password123` |

## Notes for sharing this project with another computer

- Re-run `npm install` in both `client/` and `server/` — `node_modules/` isn't tracked in git.
- Re-run `npm run seed` in `server/` — the database itself isn't tracked in git, only the code that generates it.
- Copy `server/.env.example` to `server/.env` and fill it in — `.env` is gitignored on purpose (it can hold secrets).
- User-uploaded files (avatars, cover photos uploaded through the app) are saved to `server/uploads/` on whichever machine received the upload; they don't automatically sync elsewhere.

## Deployment

Backend on **Render**, frontend on **Vercel**. Deploy the backend first — the frontend needs its live URL.

### Backend → Render

Either use the included `render.yaml` blueprint (Render dashboard → New → Blueprint → point at this repo), or configure a Web Service manually:

- **Root directory:** `server`
- **Build command:** `npm install`
- **Start command:** `npm start`
- **Health check path:** `/health`
- **Environment variables:**
  - `MONGO_URI` — your MongoDB Atlas (or other hosted) connection string, including the database name (e.g. `.../dongne?...`)
  - `JWT_SECRET` — a long random string (the blueprint auto-generates one)
  - `CLIENT_ORIGIN` — your Vercel URL once you have it (comma-separate multiple, e.g. production domain + a preview URL)
  - `OPENAI_API_KEY` — optional
  - `NODE_ENV=production`

Render assigns `PORT` itself — don't set it manually. After the first deploy, run the seed script once against that database from your machine (point a local `.env`'s `MONGO_URI` at the same Atlas database and run `npm run seed` from `server/`) so the live site isn't empty.

**Uploads caveat:** avatar/cover/post images are saved to local disk (`server/uploads/`) via multer. Render's free/starter web services have an *ephemeral* filesystem — uploaded files are lost on every restart or redeploy. This is fine for a demo, but for real persistence you'd want to swap the storage in `server/src/middleware/upload.js` for something like an S3-compatible bucket or a Render persistent disk.

### Frontend → Vercel

Import this repo into Vercel and set:

- **Root directory:** `client`
- **Framework preset:** Vite (auto-detected)
- **Build command:** `npm run build` (default)
- **Output directory:** `dist` (default)
- **Environment variables** (point these at your Render URL from above):
  - `VITE_API_URL=https://<your-render-service>.onrender.com/api/v1`
  - `VITE_SOCKET_URL=https://<your-render-service>.onrender.com`
  - `VITE_UPLOADS_URL=https://<your-render-service>.onrender.com`

`client/vercel.json` is already set up to rewrite all routes to `index.html`, so client-side routing (react-router) works on refresh/direct links.

After the first Vercel deploy, go back to Render and set `CLIENT_ORIGIN` to the resulting `https://your-app.vercel.app` URL (and redeploy) so CORS allows it.
