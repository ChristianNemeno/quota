# Deploying Quota to Google Cloud Compute Engine

## 1. Create a VM Instance

In the GCP Console → Compute Engine → VM instances → Create:

- **Name**: `quota`
- **Region**: Choose one close to your users
- **Machine type**: `e2-medium` (2 vCPU, 4 GB RAM) or larger
- **Boot disk**: Debian 12 or Ubuntu 22.04, 20 GB
- **Firewall**: Check "Allow HTTP traffic" and "Allow HTTPS traffic"

## 2. Configure Firewall Rules

The "Allow HTTP/HTTPS traffic" checkboxes in step 1 add network tags to the VM. Make sure the corresponding firewall rules exist in your project. In the GCP Console:

**VPC Network → Firewall → check that these rules exist:**

| Rule name | Targets | Ports |
|-----------|---------|-------|
| `default-allow-http` | `http-server` tag | tcp:80 |
| `default-allow-https` | `https-server` tag | tcp:443 |

If they're missing (e.g. you're using an existing VM), create them:

```bash
gcloud compute firewall-rules create allow-http \
  --allow tcp:80 --target-tags http-server

gcloud compute firewall-rules create allow-https \
  --allow tcp:443 --target-tags http-server,https-server
```

Then add the tags to your VM if needed:

```bash
gcloud compute instances add-tags quota --tags http-server,https-server
```

## 3. Set Up the Server

SSH into your VM, then run the setup script (handles Docker install and swap space):

```bash
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/quota/main/scripts/setup-server.sh | bash
```

Or clone the repo first and run it locally:

```bash
git clone https://github.com/YOUR_USERNAME/quota.git
cd quota
bash scripts/setup-server.sh
```

**Log out and SSH back in** so the docker group change takes effect, then verify:

```bash
docker --version
```

## 4. Clone the Repository

If you haven't already:

```bash
git clone https://github.com/YOUR_USERNAME/quota.git
cd quota
```

## 5. Configure Domain

Edit `Caddyfile` and replace the domain with your own:

```
your-domain.com {
    reverse_proxy app:3000
}
```

Caddy uses this domain to obtain an SSL certificate automatically. If the domain doesn't match what you configure in DNS, HTTPS will fail.

## 6. Create Environment File

```bash
cat > .env << 'EOF'
POSTGRES_PASSWORD=your-strong-db-password-here
ADMIN_PASSWORD=your-admin-password-here
EOF
```

Generate a strong password:

```bash
openssl rand -base64 24
```

> **Note:** `DATABASE_URL` (shown in `.env.example`) is only needed for local development without Docker. Do not add it to this `.env` file — the Docker setup derives it from `POSTGRES_PASSWORD` automatically.

## 7. Deploy

```bash
docker compose up -d
```

First run will:
1. Build the Next.js app image
2. Start PostgreSQL
3. Start the app
4. Start Caddy and obtain an SSL certificate

Check status:

```bash
docker compose ps
docker compose logs -f
```

## 8. Initialize the Database

Run the Prisma schema push (creates tables):

```bash
docker compose exec app npx prisma db push
```

> This downloads the Prisma CLI on first run — it may take a moment.

**Optionally seed with sample quotes:**

> **Warning:** `scripts/seed.sh` deletes all existing quotes, tags, and relations before inserting. Only run this on a fresh database.

```bash
bash scripts/seed.sh
```

See [`scripts/seed.sh`](scripts/seed.sh) for details. It runs the TypeScript seed file in a temporary container since the production image does not include dev dependencies.

## 9. Configure DNS

Point your domain to the VM's external IP:

| Type | Name | Value |
|------|------|-------|
| A | your-domain.com | YOUR_VM_EXTERNAL_IP |

Find your VM's external IP:

```bash
curl -s ifconfig.me
```

DNS propagation may take a few minutes. Caddy will automatically obtain an SSL certificate once DNS resolves.

## 10. Verify

Visit `https://your-domain.com` — you should see the app with HTTPS.

Check that Caddy obtained the certificate:

```bash
docker compose logs caddy | grep -i certificate
```

---

## Scripts

| Script | Purpose |
|--------|---------|
| [`scripts/setup-server.sh`](scripts/setup-server.sh) | Initial VM setup: installs Docker |
| [`scripts/seed.sh`](scripts/seed.sh) | Seeds the database with sample quotes (⚠️ wipes existing data) |

---

## Common Commands

```bash
# View logs
docker compose logs -f app

# Rebuild after code changes
git pull
docker compose build app
docker compose up -d app

# Restart everything
docker compose restart

# Stop everything
docker compose down

# Stop and remove volumes (⚠️ deletes data)
docker compose down -v

# Access PostgreSQL
docker compose exec db psql -U quota

# Run Prisma commands
docker compose exec app npx prisma studio
```

## Updating the App

```bash
cd ~/quota
git pull
docker compose build app
docker compose up -d app
```

## Backup Database

```bash
docker compose exec db pg_dump -U quota quota > backup.sql
```

## Restore Database

```bash
cat backup.sql | docker compose exec -T db psql -U quota quota
```
