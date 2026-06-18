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

1. Go to the main repo on GitHub.
2. Navigate to the `admin/` directory.
3. Click **Code → Download ZIP**.
4. Extract the ZIP and move the contents to your new repo directory.

---

## Step 3 — Update railpack.toml

In the monorepo, `railpack.toml` sets `rootDir = "admin"` so Railpack knows where the app lives. In the standalone repo, the app is at the root, so you need to remove that line.

Open `railpack.toml` and change it from:

```toml
[options]
rootDir = "admin"

[providers.node]
enabled = true

[deploy]
buildCommand = "npm run build"
startCommand = "npm start"
```

to:

```toml
[providers.node]
enabled = true

[deploy]
buildCommand = "npm run build"
startCommand = "npm start"
```

---

## Step 4 — Resolve the AppRouter type import

The tRPC client in `src/providers/trpc.tsx` imports `AppRouter` from the backend:

```ts
import type { AppRouter } from "../../../source/api/router";
```

This path works in the monorepo (three levels up to reach `source/`), but not in a standalone repo. You have two options:

### Option A — Copy the backend source files (recommended for full type safety)

```bash
# From the standalone repo root
mkdir -p backend/api backend/contracts backend/db

# Copy the required source files from the main repo
cp -r /path/to/Vekkst-website/source/api/. backend/api/
cp -r /path/to/Vekkst-website/source/contracts/. backend/contracts/
cp -r /path/to/Vekkst-website/source/db/. backend/db/
```

Then update the import in `src/providers/trpc.tsx`:

```ts
import type { AppRouter } from "../../backend/api/router";
```

And update `vite.config.ts` aliases:

```ts
"@contracts": path.resolve(__dirname, "./backend/contracts"),
"@db": path.resolve(__dirname, "./backend/db"),
```

And update `tsconfig.json`:

```json
"paths": {
  "@/*": ["./src/*"],
  "@contracts/*": ["./backend/contracts/*"],
  "@db/*": ["./backend/db/*"]
},
"include": ["src", "vite.config.ts", "./backend/api", "./backend/contracts", "./backend/db"]
```

> **Note:** The backend files are used **only at build time** for TypeScript type checking. They are not bundled into the final output.

### Option B — Use a minimal type stub (simpler, less type safety)

Create `backend/api/router.ts` with just the type you need:

```ts
// Minimal stub — replace with the real AppRouter type if you have it
export type AppRouter = any;
```

This removes type safety on the tRPC calls but lets the app build without copying the entire backend.

---

## Step 5 — Add a .gitignore

Create `.gitignore` in the repo root:

```
node_modules/
dist/
.env
.env.local
.env.*.local
.DS_Store
```

---

## Step 6 — Copy the logo

The login screen and sidebar reference `/images/vekkst-logo.png`. Copy it from the main repo:

```bash
cp /path/to/Vekkst-website/public/images/vekkst-logo.png public/images/
```

---

## Step 7 — Verify the build locally

```bash
npm install
npm run build   # should complete without errors
```

Fix any TypeScript errors before pushing.

---

## Step 8 — Push to GitHub

```bash
git add .
git commit -m "feat: initial standalone admin panel"
git push -u origin main
```

---

## Step 9 — Deploy on Railway

1. Open your Railway project at [railway.app](https://railway.app).
2. Click **New Service → GitHub Repo** and select your new `vekkst-admin` repo.
3. Railway detects `railpack.toml` and configures the build automatically.
4. Go to **Variables** and add:
   - `VITE_API_URL` — your backend Railway service URL (e.g. `https://your-backend.up.railway.app`)
   - `VITE_WEBSITE_URL` — your public website URL (e.g. `https://vekkst.com`)
5. Click **Deploy**.

---

## Step 10 — Configure a custom domain (optional)

1. In the Railway service settings, go to **Networking → Custom Domain**.
2. Add your domain (e.g. `admin.vekkst.com`).
3. Add the CNAME record to your DNS provider as instructed.

---

## Step 11 — Update backend CORS (if needed)

If your backend restricts CORS origins, add the admin panel domain to the allowed origins list in `source/api/boot.ts` or wherever CORS is configured.

---

## Troubleshooting

### Build fails: "Cannot find module '../../backend/api/router'"

You haven't copied the backend source files or created the type stub. Follow Step 4.

### Login fails with "Invalid password"

- Check that `ADMIN_PASSWORD` is set correctly in the backend Railway service environment variables.
- The admin panel calls the same `/api/trpc/adminAuth.login` endpoint as the main website. Make sure `VITE_API_URL` points to the correct backend URL.

### "Back to Website" link goes to "/"

Set `VITE_WEBSITE_URL` in the Railway environment variables to your public website URL.

### Images not loading

The admin panel's `public/images/` directory needs `vekkst-logo.png`. Copy it from the main repo (Step 6).

### CORS errors in the browser console

The backend is rejecting requests from the admin panel's domain. Update the CORS configuration in the backend to allow the admin panel's Railway URL (Step 11).

### Vite preview not accessible on Railway

Make sure `railpack.toml` has `startCommand = "npm start"` and that `package.json` has `"start": "vite preview --port 4173 --host"`. The `--host` flag is required for Railway to route traffic to the container.
