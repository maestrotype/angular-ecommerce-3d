# Live demo host (seller-only)

GitHub Pages alone is not a marketplace demo. Buyers need catalog, 3D, checkout, and admin on one public HTTPS stack.

This file is excluded from `npm run pack:marketplace`.

---

## Option A — Docker Compose (fastest local / VPS demo)

On a VPS or your laptop with Docker:

```bash
cp backend/.env.example backend/.env
# Set JWT_SECRET (>=32 chars), ADMIN_*, DATABASE_PASSWORD
# For a public VPS, also set:
#   FRONTEND_URL=https://demo.yourdomain.com
#   CORS_ORIGINS=   # optional extra origins

docker compose up -d --build
```

| URL | What |
|-----|------|
| `http://localhost:4200` (or your domain → 80) | Storefront + admin (nginx; `/api` and `/uploads` proxied) |
| `http://localhost:3002/api/health` | API health (also via `https://demo…/api/health`) |
| `http://localhost:3002/api/docs` | Swagger |

Seed + admin:

```bash
docker compose exec backend node -e "/* use host npm seed if easier */" 2>/dev/null || true
# From repo on the host (with DATABASE_HOST=localhost and mapped Postgres):
npm run backend:seed
curl -X POST http://localhost:3002/api/auth/create-admin
```

If host port 5432 is taken: `POSTGRES_HOST_PORT=5434 docker compose up -d --build`.

**Frontend API URL:** production builds use same-origin `/api` when not on `github.io`. Docker nginx already proxies `/api` → backend — no hardcoded Render URL needed for this path.

---

## Option B — Render (split frontend + API)

`render.yaml` defines:

1. **angular-ecommerce-backend** — Docker Nest API (`backend/Dockerfile`, health `/api/health`)
2. **angular-ecommerce-3d** — static Angular build (`dist/angular-ecommerce-3d`)

### Backend env (Render dashboard or Blueprint)

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | `openssl rand -base64 48` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_BOOTSTRAP_TOKEN` | demo-only; rotate |
| `FRONTEND_URL` | `https://<static-service>.onrender.com` (exact origin) |
| `CORS_ORIGINS` | optional second origin |
| `DATABASE_*` | Render Postgres add-on |
| `DATABASE_SSL` | `true` for managed Postgres |
| `TYPEORM_SYNCHRONIZE` | `true` only for disposable demo DB |

### Frontend static site

- Build: `npm ci && npm run build -- --configuration production`
- Publish: `dist/angular-ecommerce-3d/browser` (Angular 17 application builder output)
- If API is on another hostname (no nginx proxy), GitHub Pages–style hosts still need the remote API. Prefer putting API behind the **same domain** (Cloudflare / nginx) so same-origin `/api` works.

### After first deploy

1. `POST /api/auth/create-admin` with `x-admin-bootstrap-token`
2. Seed products (run seed job or one-off shell)
3. Stripe **test** keys in Admin → Settings
4. Paste URL into `marketing-assets/CODECANYON_LISTING.md` (`YOUR_LIVE_DEMO_URL`)

---

## Health checklist (before listing)

1. `/` loads; theme switch Light / Dark / Aurora
2. Shop lists products; PDP rotates a GLB
3. Cart → checkout (Stripe test or labeled demo)
4. `/admin/login` → dashboard
5. `/api/docs` opens

Demo login: put credentials **only on the marketplace page**, not in the public GitHub README. Rotate every 30 days.

---

## Related

- [LAUNCH_PLAYBOOK.md](./LAUNCH_PLAYBOOK.md)
- [LISTING_PACK.md](../../marketing-assets/LISTING_PACK.md)
- Root `docker-compose.yml`, `render.yaml`, `nginx.conf`
