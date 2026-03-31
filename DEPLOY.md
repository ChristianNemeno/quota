# Deploying Quota to Google Cloud Compute Engine

## 1. Create a VM Instance

In the GCP Console → Compute Engine → VM instances → Create:

- **Name**: `quota`
- **Region**: Choose one close to your users
- **Machine type**: `e2-small` (2 vCPU, 2 GB RAM) or larger
- **Boot disk**: Debian 12 or Ubuntu 22.04, 20 GB
- **Firewall**: Check "Allow HTTP traffic" and "Allow HTTPS traffic"

## 2. Install Docker

SSH into your VM, then run:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sudo sh

# Add your user to docker group (avoids needing sudo)
sudo usermod -aG docker $USER

# Log out and back in for group change to take effect
exit
```

SSH back in and verify:

```bash
docker --version
```

## 3. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/quota.git
cd quota
```

## 4. Create Environment File

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

## 5. Deploy

```bash
docker compose up -d
```

First run will:
1. Build the Next.js app image
2. Start PostgreSQL
3. Start the app
4. Start Caddy and obtain SSL certificate

Check status:

```bash
docker compose ps
docker compose logs -f
```

## 6. Seed the Database

After the app is running:

```bash
docker compose exec app npx prisma db push
docker compose exec app node prisma/seed.js
```

Note: The seed script runs from the compiled output in the standalone build.

## 7. Configure DNS

Point your domain to the VM's external IP:

| Type | Name | Value |
|------|------|-------|
| A | quota.nenome.online | YOUR_VM_EXTERNAL_IP |

Find your VM's external IP in the GCP Console or:

```bash
curl -s ifconfig.me
```

DNS propagation may take a few minutes. Caddy will automatically obtain an SSL certificate once DNS resolves.

## 8. Verify

Visit https://quota.nenome.online — you should see the app with HTTPS.

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
