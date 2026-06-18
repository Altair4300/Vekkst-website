# VEKKST Admin Panel

A standalone React application for the VEKKST admin panel. Runs as an independent service and calls the same backend API (`/api/trpc`) as the main website.

## Structure

```
admin/
├── src/
│   ├── pages/
│   │   └── Admin.tsx          # Full admin panel (login + all sections)
│   ├── providers/
│   │   ├── trpc.tsx           # tRPC client + React Query provider
│   │   └── LanguageProvider.tsx
│   ├── lib/
│   │   ├── translations.ts    # i18n strings (10 languages)
│   │   └── utils.ts           # cn() helper
│   ├── App.tsx                # Root component (renders Admin)
│   ├── main.tsx               # Entry point
│   └── index.css              # Tailwind base styles
├── public/
│   └── images/                # Logo and other static assets
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── railpack.toml              # Railway deployment config
└── .env.example
```

## Development

```bash
cd admin
npm install
npm run dev        # starts on http://localhost:3001
```

The dev server proxies `/api` requests to `http://localhost:3000` (the main backend). Start the backend first with `cd source && npm run dev`.

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend API base URL (no trailing slash) | *(proxied to localhost:3000 in dev)* |
| `VITE_WEBSITE_URL` | Public website URL for "Back to Website" link | `/` |

## Production Deployment (Railway)

1. Create a new Railway service pointing at this repository.
2. Set `rootDir = "admin"` in `railpack.toml` (already configured).
3. Set `VITE_API_URL` to your backend service's Railway URL.
4. Set `VITE_WEBSITE_URL` to your public website URL.
5. Deploy — Railway will run `npm run build` then `npm start`.

The built static files are served by `vite preview`. For a production-grade setup, consider serving the `dist/` folder with a proper static file server (e.g. nginx or Caddy).
