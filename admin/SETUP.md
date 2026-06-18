# Deploying the Admin Panel as a Separate Railway Service

This guide walks through extracting the admin panel from the main website repo into its own GitHub repository and deploying it as an independent Railway service.

---

## Overview

The admin panel is a standalone React + Vite SPA. It has no server-side code of its own — it calls the same backend API (`/api/trpc`) that the main website uses. Deploying it separately means:

- Its own Railway service, domain, and deployment pipeline
- Zero coupling to the main website's build or deploy cycle
- The backend service is shared; only the frontend is split out

**Architecture after the split:**

```
GitHub: Vekkst-website  →  Railway: backend + main website
GitHub: vekkst-admin    →  Railway: admin panel (this guide)
```

---

## Step 1 — Create the new GitHub repository

1. Go to [github.com/new](https://github.com/new).
2. Name it `vekkst-admin` (or whatever you prefer).
3. Set it to **Private**.
4. Do **not** initialise it with a README, `.gitignore`, or licence — you will push files manually.
5. Click **Create repository** and copy the remote URL (e.g. `git@github.com:your-org/vekkst-admin.git`).

---

## Step 2 — Copy the admin app files

The admin panel lives in the `admin/` subdirectory of the main repo. You need to copy its contents to the root of the new repo.

### Option A — Using the terminal (recommended)

```bash
# Clone the main website repo if you haven't already
git clone git@github.com:your-org/Vekkst-website.git
cd Vekkst-website

# Create a fresh directory for the new repo
mkdir ../vekkst-admin
cd ../vekkst-admin
git init
git remote add origin git@github.com:your-org/vekkst-admin.git

# Copy all admin files to the new repo root
cp -r ../Vekkst-website/admin/. .

# The railpack.toml currently points rootDir at "admin/" — update it for the new repo
# (see Step 3 below before committing)
```

### Option B — Download as a ZIP

1. In the main repo on GitHub, navigate to the `admin/` folder.
2. Click **Code → Download ZIP** (this downloads the whole repo).
3. Extract only the `admin/` folder contents into your new repo directory.

---

## Step 3 — Update `railpack.toml`

In the main repo, `railpack.toml` sets `rootDir = "admin"` so Railway knows to look inside the subdirectory. In the new standalone repo the admin files are at the root, so that line must be removed.

Open `railpack.toml` in the new repo and replace its contents with:

```toml
[providers.node]
enabled = true

[deploy]
buildCommand = "npm run build"
startCommand = "npm start"
```

---

## Step 4 — Update `vite.config.ts`

In the main repo, `vite.config.ts` defines path aliases that point at the backend source tree (`../source/contracts`, `../source/db`). These are used only at **build time** to resolve the `AppRouter` type from `src/providers/trpc.tsx`. In the standalone repo those relative paths no longer exist.

You have two options:

### Option A — Bundle the type stubs (recommended for a clean standalone repo)

Copy the required backend type files into the new repo and update the aliases to point at them locally.

**Files to copy from the main repo:**

```
source/api/router.ts          →  backend/api/router.ts
source/api/trpc.ts            →  backend/api/trpc.ts
source/api/admin-router.ts    →  backend/api/admin-router.ts
source/api/admin-auth-router.ts → backend/api/admin-auth-router.ts
source/api/message-router.ts  →  backend/api/message-router.ts
source/api/media-router.ts    →  backend/api/media-router.ts
source/api/product-router.ts  →  backend/api/product-router.ts
source/api/quote-router.ts    →  backend/api/quote-router.ts
source/api/subadmin-router.ts →  backend/api/subadmin-router.ts
source/api/translation-router.ts → backend/api/translation-router.ts
source/api/auth-router.ts     →  backend/api/auth-router.ts
source/api/local-auth-router.ts → backend/api/local-auth-router.ts
source/api/middleware.ts      →  backend/api/middleware.ts
source/api/context.ts         →  backend/api/context.ts
source/api/queries/           →  backend/api/queries/
source/api/lib/               →  backend/api/lib/
source/api/kimi/              →  backend/api/kimi/
source/contracts/             →  backend/contracts/
source/db/                    →  backend/db/
```

Then update `vite.config.ts` in the new repo:

```ts
import path from "path";
const __dirname = import.meta.dirname;
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL || "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@contracts": path.resolve(__dirname, "./backend/contracts"),
      "@db": path.resolve(__dirname, "./backend/db"),
    },
  },
  envDir: path.resolve(__dirname),
  publicDir: path.resolve(__dirname, "public"),
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
});
```

Also update `tsconfig.json` paths and `include` to match:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@contracts/*": ["./backend/contracts/*"],
      "@db/*": ["./backend/db/*"]
    }
  },
  "include": ["src", "vite.config.ts", "./backend/api", "./backend/contracts", "./backend/db"]
}
```

### Option B — Use a type-only stub (minimal approach)

If you don't want to copy backend files, create a minimal type stub at `src/types/router.ts`:

```ts
// Minimal AppRouter type stub — keeps the tRPC client type-safe
// without needing the full backend source tree.
// Update this whenever the backend API changes.
import type { AnyTRPCRouter } from "@trpc/server";
export type AppRouter = AnyTRPCRouter;
```

Then update the import in `src/providers/trpc.tsx`:

```ts
// Replace:
import type { AppRouter } from "../../../source/api/router";
// With:
import type { AppRouter } from "@/types/router";
```

> **Note:** Option B loses end-to-end type safety. Option A is strongly recommended.

---

## Step 5 — Add a `.gitignore`

Create `.gitignore` in the new repo root:

```gitignore
# Dependencies
node_modules/

# Build output
dist/

# Environment files
.env
.env.local
.env.*.local

# Editor
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
```

---

## Step 6 — Copy static assets

The login screen and sidebar reference `/images/vekkst-logo.png`. Make sure the `public/images/` directory exists in the new repo and contains the logo:

```bash
# From the main repo root
cp -r admin/public/ ../vekkst-admin/public/
```

If the `public/` directory is empty in the main repo, add your logo manually:

```
vekkst-admin/
└── public/
    └── images/
        └── vekkst-logo.png
```

---

## Step 7 — Commit and push

```bash
cd ../vekkst-admin

git add .
git commit -m "feat: initial standalone admin panel"
git push -u origin main
```

---

## Step 8 — Create a Railway service

1. Open your Railway project at [railway.app](https://railway.app).
2. Click **New Service → GitHub Repo**.
3. Select the `vekkst-admin` repository.
4. Railway will detect `railpack.toml` and configure the build automatically.

---

## Step 9 — Set environment variables

In the Railway service settings, add the following variables:

| Variable | Value | Notes |
|---|---|---|
| `VITE_API_URL` | `https://your-backend.railway.app` | Your backend Railway service URL — **no trailing slash** |
| `VITE_WEBSITE_URL` | `https://yourdomain.com` | Public website URL for the "Back to Website" link |
| `NODE_ENV` | `production` | Enables production optimisations |

> **How `VITE_API_URL` works:** At runtime the admin SPA makes all tRPC calls to `${VITE_API_URL}/api/trpc`. If the variable is unset, calls go to `/api/trpc` (relative), which only works when the admin and backend are on the same origin. Always set this in production.

---

## Step 10 — Add a custom domain (optional)

1. In the Railway service, go to **Settings → Networking → Custom Domain**.
2. Add `admin.yourdomain.com`.
3. Create a `CNAME` record in your DNS provider pointing `admin` at the Railway-provided hostname.
4. Railway provisions a TLS certificate automatically.

---

## Step 11 — Configure CORS on the backend

The backend must allow requests from the admin domain. In the main website repo, find where CORS is configured (typically `source/api/boot.ts` or the Hono/Express setup) and add the admin origin:

```ts
// Example — adjust to match your actual CORS setup
const allowedOrigins = [
  "https://yourdomain.com",
  "https://admin.yourdomain.com",   // ← add this
];
```

Redeploy the backend after making this change.

---

## Local development

Start the backend first, then the admin dev server:

```bash
# Terminal 1 — backend (in the main website repo)
cd source
npm run dev        # starts on http://localhost:3000

# Terminal 2 — admin panel (in the new vekkst-admin repo)
npm install
npm run dev        # starts on http://localhost:3001
```

The Vite dev server proxies all `/api` requests to `http://localhost:3000`, so no `VITE_API_URL` is needed locally.

---

## File checklist

Before pushing to GitHub, confirm the new repo contains all of these:

```
vekkst-admin/
├── src/
│   ├── pages/
│   │   └── Admin.tsx
│   ├── providers/
│   │   ├── trpc.tsx
│   │   └── LanguageProvider.tsx
│   ├── lib/
│   │   ├── translations.ts
│   │   └── utils.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
│   └── images/
│       └── vekkst-logo.png
├── backend/              ← only if using Option A from Step 4
│   ├── api/
│   ├── contracts/
│   └── db/
├── index.html
├── package.json
├── vite.config.ts        ← updated aliases (Step 4)
├── tsconfig.json         ← updated paths (Step 4)
├── tailwind.config.js
├── postcss.config.js
├── railpack.toml         ← updated (Step 3)
├── .env.example
└── .gitignore            ← new (Step 5)
```

---

## Troubleshooting

**Build fails with "Cannot find module '../../../source/api/router'"**
The `AppRouter` type import in `src/providers/trpc.tsx` still points at the main repo's source tree. Follow Step 4 to update the path aliases.

**API calls return 404 or CORS errors in production**
Check that `VITE_API_URL` is set correctly in Railway (no trailing slash, full `https://` URL). Also verify the backend CORS config includes the admin domain (Step 11).

**Login screen shows but login always fails**
The admin password is set via the `ADMIN_PASSWORD` environment variable on the **backend** service. Confirm it is set and matches what you are entering. The default if unset is `superadmin2025`.

**"Back to Website" link goes to `/`**
Set `VITE_WEBSITE_URL` to your public website URL in the Railway service environment variables.

**White screen after deploy**
Run `npm run build` locally first to catch any TypeScript or Vite errors before they surface in Railway's build logs.
