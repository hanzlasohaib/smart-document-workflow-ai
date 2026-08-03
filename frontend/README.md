# Smart Document Workflow — Frontend

Next.js App Router product surfaces (PAS-05): marketing, auth, user portal, admin portal.

## Local development

```bash
# from repo root
cp frontend/.env.example frontend/.env.local   # if needed
cd frontend
npm install
npm run dev
```

App: http://localhost:3000  
API (separate): http://localhost:8000/api/v1

Auth uses BFF route handlers under `/api/auth/*` (httpOnly refresh cookie). Access tokens stay in memory.

## Compose

From repo root:

```bash
docker compose up --build
```

- Web: http://localhost:3000  
- API: http://localhost:8000  
- Seed admin: `docker compose exec api python -m scripts.seed_admin`

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run lint` | ESLint |
| `npm run build` | Production build |
| `npm start` | Serve production build |
