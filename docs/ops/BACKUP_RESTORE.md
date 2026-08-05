# Backup and restore runbook

Covers Postgres and object storage for staging/production. Test this procedure once on staging before relying on it in production.

## Scope

| Asset | What to protect |
|---|---|
| Postgres | Users, documents metadata, extracted fields, notifications, refresh tokens, automation logs |
| Object storage | Document binaries (`local` volume or Supabase Storage bucket) |

Application secrets (`SECRET_KEY`, storage keys) live in the secret store / env — rotate separately; do not bake them into DB dumps.

## Prerequisites

- Access to the Compose host (or managed Postgres + storage console)
- `pg_dump` / `psql` matching the server major version
- For Supabase: service-role or dashboard access to the `documents` bucket
- A writeable off-host backup location (not only the DB volume)

## Backup — Postgres

From the Compose project root (service name `db`):

```bash
# Timestamped logical dump (custom format — supports parallel restore)
docker compose exec -T db pg_dump -U sdw -d smart_docs -Fc > "backup-smart_docs-$(date +%Y%m%d-%H%M%S).dump"
```

Windows PowerShell equivalent:

```powershell
$ts = Get-Date -Format "yyyyMMdd-HHmmss"
docker compose exec -T db pg_dump -U sdw -d smart_docs -Fc | Set-Content -Encoding Byte "backup-smart_docs-$ts.dump"
```

Prefer piping to a file on the **host**, then copy to durable storage.

Retain at least: daily for 7 days, weekly for 4 weeks (adjust to your RPO).

## Backup — object storage

### Local Compose volume (`STORAGE_BACKEND=local`)

The API service mounts uploads (see `docker-compose.yml` volume). Archive the volume or bind path:

```bash
docker compose exec -T api tar -C /app/uploads -czf - . > "backup-uploads-$(date +%Y%m%d-%H%M%S).tar.gz"
```

### Supabase Storage

Use the Supabase dashboard **or** Storage API to export/sync the configured bucket (`SUPABASE_STORAGE_BUCKET`, default `documents`). Store objects with the same keys as `documents.file_path` / `stored_filename` so restore stays consistent with DB rows.

## Restore — Postgres (staging drill)

1. Stop writers (scale API/web down or put the environment in maintenance).
2. Recreate an empty database (staging only):

```bash
docker compose exec -T db psql -U sdw -d postgres -c "DROP DATABASE IF EXISTS smart_docs WITH (FORCE);"
docker compose exec -T db psql -U sdw -d postgres -c "CREATE DATABASE smart_docs OWNER sdw;"
```

3. Restore:

```bash
cat backup-smart_docs-YYYYMMDD-HHMMSS.dump | docker compose exec -T db pg_restore -U sdw -d smart_docs --clean --if-exists
```

4. Run `alembic upgrade head` only if the dump predates a migration you still need (normally the dump already includes schema).
5. Bring API/web back up; hit `GET /ready`.

## Restore — object storage

### Local

```bash
# Extract into the uploads mount used by the api service
docker compose exec -T api tar -C /app/uploads -xzf - < backup-uploads-YYYYMMDD-HHMMSS.tar.gz
```

### Supabase

Re-upload objects to the bucket using original keys. Confirm a sample document download via the app after DB restore.

## Staging validation checklist

- [ ] Fresh dump created from staging
- [ ] Restore into a clean staging DB succeeds
- [ ] Sample user can login
- [ ] Sample document metadata visible and binary openable
- [ ] `/ready` returns 200
- [ ] Record date/operator of the drill in your ops log

## Notes

- Prefer logical dumps (`pg_dump`) over raw volume copies for portability across hosts.
- After restore, revoke compromised refresh tokens by rotating `SECRET_KEY` only when credentials were exposed (forces re-login; plan downtime).
- Production restores should be coordinated; never overwrite production without an explicit change window.
