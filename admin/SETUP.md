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
2. Navigate to the `admin/` folder.
3. Click **Code → Download ZIP**.
4. Extract the ZIP and move the contents to your new repo directory.

---

## Step 3 — Update railpack.toml

When the admin panel is deployed from its own repo (not a subdirectory), the `rootDir` setting in `railpack.toml` should be removed or set to `.`:

```toml
[options]
# rootDir is not needed when the repo root IS the app root
# rootDir = "admin"   ← remove or comment out this line

[providers.node]
enabled = true

[deploy]
buildCommand = "npm run build"
startCommand = "npm start"
```

---

## Step 4 — Push to the new repo

```bash
cd ../vekkst-admin
git add .
git commit -m "Initial commit: admin panel"
git push -u origin main
```

---

## Step 5 — Create a Railway service

1. Go to [railway.app](https://railway.app) and open your project.
2. Click **New Service → GitHub Repo**.
3. Select the `vekkst-admin` repository.
4. Railway will detect the `railpack.toml` and use the Node.js provider.

---

## Step 6 — Set environment variables

In the Railway service settings, add:

| Variable | Value |
|---|---|
| `VITE_API_URL` | Your backend Railway service URL (e.g. `https://vekkst-backend.up.railway.app`) |
| `VITE_WEBSITE_URL` | Your public website URL (e.g. `https://vekkst.com`) |

> **Note:** `VITE_API_URL` must not have a trailing slash. Railway injects these at build time via Vite's env system.

---

## Step 7 — Deploy

Click **Deploy** in Railway. The build will:

1. Run `npm install`
2. Run `npm run build` (Vite compiles the React app to `dist/`)
3. Start `npm start` (runs `vite preview --port 4173 --host`)

The admin panel will be available at the Railway-assigned domain.

---

## Keeping the admin panel in the same repo (current setup)

If you prefer to keep the admin panel in the `admin/` subdirectory of the main repo (the current setup), Railway's `rootDirectory` service setting handles this:

1. In Railway, go to the service settings.
2. Set **Root Directory** to `admin`.
3. The `railpack.toml` inside `admin/` will be used for build configuration.

This is the current deployment configuration for the `vekkst-admin` service.
