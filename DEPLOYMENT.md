# Automation Hub - Deployment Guide

Complete guide to deploy Automation Hub on your Ubuntu server.

## Requirements

- Ubuntu 20.04 LTS or newer
- Internet connection
- A Cloudflare account (free tier is fine for Tunnel)
- Minimum 2GB RAM, 10GB storage

## Quick Start (Automated)

```bash
# 1. Clone or download the project
git clone https://github.com/your-repo/automation-hub.git
cd automation-hub

# 2. Run the installer
chmod +x install.sh
./install.sh

# 3. Follow the prompts
```

## Step-by-Step Manual Setup

### 1. Install Docker

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
```

### 2. Install Docker Compose

```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 3. Install Cloudflare Tunnel

```bash
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb
rm cloudflared.deb
```

### 4. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit with your settings
nano .env

# Generate a secure JWT secret
openssl rand -base64 32
# Copy the output and update JWT_SECRET in .env
```

### 5. Start Services

```bash
# Build images (if first time)
docker-compose build

# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

### 6. Verify Installation

```bash
# Check API health
curl http://localhost:3000/api/v1/health

# Check if frontend is running
curl http://localhost/ | head -20
```

## Accessing the Application

### Local Access (from the server)

- **Frontend:** http://localhost
- **API:** http://localhost:3000
- **API Docs:** http://localhost:3000/docs

### Remote Access (Cloudflare Tunnel)

```bash
# 1. Login to Cloudflare
cloudflared tunnel login

# 2. Create a tunnel
cloudflared tunnel create automation-hub

# 3. Configure tunnel (edit ~/.cloudflared/config.yml)
tunnel: automation-hub
credentials-file: /home/USER/.cloudflared/automation-hub.json

ingress:
  - hostname: automation-hub.YOUR_DOMAIN.com
    service: http://localhost
  - service: http_status:404

# 4. Setup as system service
# Create /etc/systemd/system/cloudflare-tunnel.service:
[Unit]
Description=Cloudflare Tunnel
After=network.target

[Service]
Type=simple
User=YOUR_USERNAME
ExecStart=/usr/local/bin/cloudflared tunnel run
Restart=on-failure

[Install]
WantedBy=multi-user.target

# 5. Enable and start
sudo systemctl daemon-reload
sudo systemctl enable cloudflare-tunnel
sudo systemctl start cloudflare-tunnel

# 6. Check status
sudo systemctl status cloudflare-tunnel
```

## Default Credentials

- **Email:** admin@automation-hub.local
- **Password:** admin123

⚠️ **CHANGE THESE AFTER FIRST LOGIN!**

## Common Commands

```bash
# View logs
docker-compose logs -f api

# Stop all services
docker-compose down

# Restart API
docker-compose restart api

# Enter API container
docker-compose exec api bash

# Database access
docker-compose exec postgres psql -U admin -d automation_hub

# Tunnel status
sudo systemctl status cloudflare-tunnel

# Tunnel logs
sudo journalctl -u cloudflare-tunnel -f

# Restart tunnel
sudo systemctl restart cloudflare-tunnel
```

## Updating

```bash
# Pull latest code
git pull

# Rebuild images
docker-compose build

# Restart services
docker-compose up -d
```

## Backup & Restore

### Backup Database

```bash
docker-compose exec postgres pg_dump -U admin automation_hub > backup.sql
```

### Restore Database

```bash
cat backup.sql | docker-compose exec -T postgres psql -U admin automation_hub
```

## Troubleshooting

### Services won't start

```bash
# Check logs
docker-compose logs

# Ensure ports are available
sudo lsof -i :3000
sudo lsof -i :5173
sudo lsof -i :5433
```

### Database connection error

```bash
# Wait longer for PostgreSQL to initialize
sleep 30

# Try migrations again
docker-compose exec api npx prisma migrate deploy
```

### Can't access from outside

1. Check firewall rules
2. Verify Cloudflare Tunnel is running: `sudo systemctl status cloudflare-tunnel`
3. Check tunnel config: `cat ~/.cloudflared/config.yml`
4. View tunnel logs: `sudo journalctl -u cloudflare-tunnel -f`

## Environment Variables

Key variables in `.env`:

- `NODE_ENV`: Set to `production` for production deployments
- `LOG_LEVEL`: `info` for production, `debug` for troubleshooting
- `JWT_SECRET`: Keep this secret and secure!
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `OPENAI_API_KEY`: For OpenAI integration (optional)
- `TELEGRAM_BOT_TOKEN`: For Telegram integration (optional)
- `TELEGRAM_CHAT_ID`: For Telegram integration (optional)

## Performance Tips

1. **Set appropriate resource limits** in docker-compose.yml
2. **Use a reverse proxy** (nginx) in front for better performance
3. **Enable logging rotation** to avoid disk space issues
4. **Monitor resource usage**: `docker stats`

## Security Recommendations

1. ✅ Change default admin password immediately
2. ✅ Use strong JWT_SECRET (at least 32 characters)
3. ✅ Keep Docker and system updated
4. ✅ Use HTTPS (Cloudflare Tunnel provides this)
5. ✅ Regularly backup your database
6. ✅ Monitor logs for suspicious activity
7. ✅ Use API authentication for webhooks (coming soon)

## Getting Help

- Check logs: `docker-compose logs api`
- API documentation: http://localhost:3000/docs
- GitHub Issues: [Your repo URL]

## Next Steps

After deployment:

1. ✅ Log in to the dashboard
2. ✅ Change default admin password
3. ✅ Create your first automation
4. ✅ Test the webhook endpoint
5. ✅ Configure integrations (OpenAI, Telegram, etc.)
6. ✅ Set up automated backups

Enjoy your Automation Hub! 🚀
