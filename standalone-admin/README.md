# VEKKST Admin Panel — Standalone Repo

A ready-to-deploy standalone React + Vite SPA for the VEKKST admin panel. This is a self-contained template designed to be pushed to its own GitHub repository and deployed as an independent Railway service.

---

## Quick Start

### 1. Copy this template to a new GitHub repo

```bash
# Create a new directory for the standalone repo
mkdir vekkst-admin && cd vekkst-admin
git init
git remote add origin git@github.com:your-org/vekkst-admin.git

# Copy all files from standalone-admin/ in the main repo
cp -r /path/to/Vekkst-website/standalone-admin/. .
```

### 2. Add the backend type stubs

The tRPC client in `src/providers/trpc.tsx` imports `AppRouter` from `../../backend/api/router` for full end-to-end type safety. Copy the required source files from the main repo:

```bash
# From the main Vekkst-website repo root
cp -r source/api   /path/to/vekkst-admin/backend/api
cp -r source/contracts /path/to/vekkst-admin/backend/contracts
cp -r source/db    /path/to/vekkst-admin/backend/db
```

> **Note:** These files are used **only at build time** for TypeScript type checking. They are not bundled into the final output and do not run in production.

### 3. Add the logo

Copy the logo from the main repo's public assets:

```bash
cp /path/to/Vekkst-website/public/images/vekkst-logo.png public/images/
```

The login screen and sidebar both reference `/images/vekkst-logo.png`.

### 4. Install dependencies and verify the build

```bash
npm install
npm run build   # catches any TypeScript errors before deploying
```

### 5. Push to GitHub

```bash
git add .
git commit -m "feat: initial standalone admin panel"
git push -u origin main
```

---

## Deploy to Railway

1. Open your Railway project at [railway.app](https://railway.app).
2. Click **New Service → GitHub Repo** and select `vekkst-admin`.
3. Railway detects `railpack.toml` and configures the build automatically.
4. Set the following environment variables in the Railway service settings:

| Variable | Value | Notes |
|---|---|---|
| `VITE_API_URL` | `https://your-backend.railway.app` | Backend Railway URL — **no trailing slash** |
| `VITE_WEBSITE_URL` | `https://yourdomain.com` | Public website URL for the "Back to Website" link |
| `NODE_ENV` | `production` | Enables production optimisations |

5. Deploy. Railway runs `npm run build` then `npm start` (`vite preview --host`).

---

## Local Development

Start the backend first, then the admin dev server:

```bash
# Terminal 1 — backend (in the main Vekkst-website repo)
cd source && npm run dev   # starts on http://localhost:3000

# Terminal 2 — admin panel (in this repo)
npm install
npm run dev                # starts on http://localhost:3001
```

The Vite dev server proxies all `/api` requests to `http://localhost:3000`, so no `VITE_API_URL` is needed locally.

---

## Project Structure

```
vekkst-admin/
├── src/
│   ├── pages/
│   │   └── Admin.tsx          # Full admin panel (login + all sections)
│   ├── providers/
│   │   ├── trpc.tsx           # tRPC client + React Query provider
│   │   └── LanguageProvider.tsx
│   ├── lib/
│   │   ├── translations.ts    # i18n strings (10 languages)
│   │   └── utils.ts           # cn() helper
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
│   └── images/
│       └── vekkst-logo.png    # ← copy from main repo
├── backend/                   # ← copy from main repo (type stubs only)
│   ├── api/
│   ├── contracts/
│   └── db/
├── index.html
├── package.json
├── vite.config.ts             # aliases point at ./backend/
├── tsconfig.json              # paths point at ./backend/
├── tailwind.config.js
├── postcss.config.js
├── railpack.toml              # no rootDir — files are at repo root
├── .env.example
└── .gitignore
```

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend API base URL (no trailing slash) | *(proxied to localhost:3000 in dev)* |
| `VITE_WEBSITE_URL` | Public website URL for "Back to Website" link | `/` |

---

## Architecture

```
GitHub: Vekkst-website  →  Railway: backend + main website
GitHub: vekkst-admin    →  Railway: admin panel (this repo)
```

Both services share the same backend API. The admin panel is a pure SPA — it has no server-side code of its own. All data is fetched via tRPC over HTTP from the backend.

---

## CORS Configuration

The backend must allow requests from the admin domain. In the main repo, find the CORS configuration (typically `source/api/boot.ts`) and add the admin origin:

```ts
const allowedOrigins = [
  "https://yourdomain.com",
  "https://admin.yourdomain.com",   // ← add this
];
```

Redeploy the backend after making this change.

---

## Troubleshooting

**Build fails with "Cannot find module '../../backend/api/router'"**
The `backend/` directory is missing. Copy `source/api`, `source/contracts`, and `source/db` from the main repo into `backend/` as described in Step 2 above.

**API calls return 404 or CORS errors in production**
Check that `VITE_API_URL` is set correctly in Railway (no trailing slash, full `https://` URL). Also verify the backend CORS config includes the admin domain.

**Login screen shows but login always fails**
The admin password is set via the `ADMIN_PASSWORD` environment variable on the **backend** service. Confirm it is set and matches what you are entering.

**"Back to Website" link goes to `/`**
Set `VITE_WEBSITE_URL` to your public website URL in the Railway service environment variables.

**White screen after deploy**
Run `npm run build` locally first to catch any TypeScript or Vite errors before they surface in Railway's build logs.
