# Deploying SaveMe Budget to an Ubuntu VPS (Hostinger)

Target: **https://savemebudget.anysonnet.com**

The stack runs with Docker Compose:

| Service | Role | Exposed |
| --- | --- | --- |
| `caddy` | Reverse proxy, automatic HTTPS (Let's Encrypt) | ports 80, 443 |
| `app` | Next.js server (applies the DB schema on start) | internal only |
| `db` | PostgreSQL 17, data in the `pgdata` volume | internal only (**no published port**) |

## 1. DNS

At the DNS provider for `anysonnet.com`, add:

| Type | Name | Value |
| --- | --- | --- |
| A | `savemebudget` | your VPS public IPv4 |
| AAAA (optional) | `savemebudget` | your VPS public IPv6 |

Verify propagation before deploying (Caddy can't get a certificate until this resolves to the VPS):

```bash
dig +short savemebudget.anysonnet.com
```

If the domain is proxied through Cloudflare, set the record to "DNS only" (grey cloud) for the first deployment.

## 2. SSH and server preparation

```bash
ssh root@YOUR_VPS_IP

# Docker (official convenience script) + compose plugin
curl -fsSL https://get.docker.com | sh
docker compose version

# Firewall: SSH + web only. 5432 is deliberately NOT opened.
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 443/udp
ufw enable
```

Hostinger also has a firewall in hPanel; make sure it doesn't block 80/443. Prefer SSH keys and a non-root sudo user for day-to-day work.

> Docker publishes ports by editing iptables directly and bypasses `ufw`. That is fine here because `docker-compose.yml` only publishes 80/443 — never add a `ports:` entry to `db`.

## 3. Get the code

```bash
mkdir -p /opt && cd /opt
git clone <YOUR_GIT_REPOSITORY_URL> savemebudget
cd savemebudget
```

(Or copy the project with `rsync -av --exclude node_modules --exclude .next ./ root@YOUR_VPS_IP:/opt/savemebudget/`.)

## 4. Environment variables

```bash
cp .env.production.example .env
nano .env
```

| Variable | Meaning |
| --- | --- |
| `DOMAIN` | `savemebudget.anysonnet.com` |
| `ACME_EMAIL` | Email for Let's Encrypt expiry notices |
| `POSTGRES_USER` | Database user (any name; not `root`/`postgres` is preferable) |
| `POSTGRES_PASSWORD` | **Strong, unique, production-only.** Never reuse the local development password |
| `POSTGRES_DB` | Database name |

Generate the password (letters and digits only, so it is safe inside the connection URL):

```bash
openssl rand -base64 36 | tr -d '/+=' | cut -c1-40
```

```bash
chmod 600 .env
```

`.env` is git-ignored. `DATABASE_URL` is assembled by `docker-compose.yml` from these values. Note: `POSTGRES_PASSWORD` only takes effect when the `pgdata` volume is first created; changing it later requires `ALTER USER` inside the database.

## 5. First deployment

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f app caddy
```

The build downloads the Sarabun font, so the server needs outbound internet. On start the app runs `scripts/migrate.mjs`, which only creates missing tables (`CREATE TABLE IF NOT EXISTS`) and never drops or alters data. Caddy obtains the certificate automatically on the first request.

Check it:

```bash
curl -I https://savemebudget.anysonnet.com
# Confirm Postgres is not reachable from outside (run from your own machine):
nc -zv YOUR_VPS_IP 5432     # should fail / time out
```

Then open the site, sign up, and add an expense.

## 6. Updating

```bash
cd /opt/savemebudget
git pull
docker compose up -d --build
docker image prune -f
```

The database volume is untouched by rebuilds. Take a backup first (below) before releases that change `db/schema.sql`.

Useful commands:

```bash
docker compose logs --tail=100 app
docker compose restart app
docker compose down          # stops containers; volumes (data, certs) are kept
```

**Never run `docker compose down -v`** — `-v` deletes the database and certificate volumes.

## 7. Database backup and restore

### Backup

```bash
mkdir -p /opt/backups
cd /opt/savemebudget
set -a; . ./.env; set +a
docker compose exec -T db pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner \
  | gzip > /opt/backups/savemebudget-$(date +%F-%H%M).sql.gz
```

Daily automatic backup with 14-day retention (`crontab -e`):

```cron
15 3 * * * cd /opt/savemebudget && set -a && . ./.env && set +a && docker compose exec -T db pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner | gzip > /opt/backups/savemebudget-$(date +\%F).sql.gz && find /opt/backups -name 'savemebudget-*.sql.gz' -mtime +14 -delete
```

Copy backups off the server too (`scp`, `rclone`, or Hostinger snapshots). A backup that only lives on the VPS doesn't protect against losing the VPS.

### Restore

Restore into a **fresh/empty** database so nothing is overwritten. The simplest way is to restore on a new deployment (new VPS or new empty volume):

```bash
cd /opt/savemebudget
set -a; . ./.env; set +a
docker compose up -d db
gunzip -c /opt/backups/savemebudget-YYYY-MM-DD.sql.gz \
  | docker compose exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1
docker compose up -d
```

If you need to restore over an existing database, first take a fresh backup, then create a separate database (`CREATE DATABASE savemebudget_restore;`), restore into it, inspect it, and only then switch `POSTGRES_DB` to it.

## 8. Troubleshooting

- **Certificate not issued**: DNS must point to the VPS and ports 80/443 must be open. See `docker compose logs caddy`.
- **App restarts in a loop**: `docker compose logs app` — usually a wrong `POSTGRES_*` value (remember the password is fixed once the volume exists).
- **Can't log in right after deploy**: cookies are `Secure`, so use the `https://` URL.
