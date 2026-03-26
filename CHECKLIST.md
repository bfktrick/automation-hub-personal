# Automation Hub - Installation Checklist

Use this checklist to verify your installation is complete and working correctly.

## Pre-Installation

- [ ] Ubuntu 20.04 LTS or newer installed
- [ ] Internet connection available
- [ ] 2GB+ RAM available
- [ ] 10GB+ free disk space
- [ ] SSH access to server (or local terminal)
- [ ] Cloudflare account created (free tier)

## Installation Process

- [ ] Docker installed: `docker --version`
- [ ] Docker Compose installed: `docker-compose --version`
- [ ] Cloudflare Tunnel installed: `cloudflared --version`
- [ ] Project cloned/downloaded to server
- [ ] `.env` file created and configured
- [ ] `install.sh` executed successfully
- [ ] All Docker containers running: `docker-compose ps`

## Verification Checks

### API Health

```bash
curl http://localhost:3000/api/v1/health
```

Expected response:
```json
{"status":"ok","timestamp":"2026-03-26T..."}
```

- [ ] API responds with status code 200

### Frontend Accessibility

- [ ] Open http://localhost in browser
- [ ] Page loads without errors
- [ ] Can see login form

### Database

```bash
docker-compose exec postgres psql -U admin -d automation_hub -c "SELECT COUNT(*) FROM users;"
```

- [ ] Command executes without errors
- [ ] Shows at least 1 user

### Authentication

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@automation-hub.local","password":"admin123"}'
```

- [ ] Returns `access_token` in response
- [ ] Token is not empty

## Web Dashboard

- [ ] Can log in with admin credentials
- [ ] Dashboard loads with KPI cards
- [ ] Can navigate to Automations tab
- [ ] Can navigate to Logs tab
- [ ] Toast notifications appear (test by logging out)

## Creating Test Automation

- [ ] Click "Create Automation"
- [ ] Enter test name: "Test HTTP"
- [ ] Select trigger type: "Manual"
- [ ] Select action type: "HTTP"
- [ ] Enter URL: "https://httpbin.org/get"
- [ ] Select method: "GET"
- [ ] Click "Create"

## Test Execution

- [ ] Go to Automations tab
- [ ] Find your test automation
- [ ] Click "Execute Now" button
- [ ] Wait 2-3 seconds
- [ ] Click Logs tab
- [ ] Latest log shows status "success"
- [ ] Click "View" to see details
- [ ] Output shows HTTP response

## Webhook Testing

```bash
# Get your automation ID
AUTOMATION_ID="cmn6vt8af0000106cwqjy1ozt"

# Trigger via webhook
curl -X POST http://localhost/api/v1/webhooks/$AUTOMATION_ID \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

- [ ] Webhook returns 200 status
- [ ] New log appears within seconds
- [ ] Log shows `triggeredBy: "webhook"`

## Cloudflare Tunnel Setup (Optional)

- [ ] Cloudflared logged in: `cloudflared tunnel list`
- [ ] Tunnel created: "automation-hub" visible in list
- [ ] Config file exists: `~/.cloudflared/config.yml`
- [ ] Systemd service installed: `sudo systemctl status cloudflare-tunnel`
- [ ] Service is active (running)
- [ ] Can access via public URL from another device/network

## Security Checks

- [ ] Default admin password changed
- [ ] JWT_SECRET is at least 32 characters
- [ ] `.env` file is secure (not world-readable)
- [ ] Docker containers are running as non-root
- [ ] Firewall allows only necessary ports:
  - [ ] 80 (HTTP) for local frontend
  - [ ] 3000 (API) - consider blocking from external
  - [ ] 5173 (dev frontend) - block from production

## Monitoring Setup

```bash
# Check logs
docker-compose logs -f api
```

- [ ] Can view API logs
- [ ] No errors in startup messages
- [ ] Can follow logs without hanging

## Data Management

```bash
# Backup database
docker-compose exec postgres pg_dump -U admin automation_hub > backup.sql
```

- [ ] Backup command succeeds
- [ ] Backup file created with size > 1KB
- [ ] Can view backup contents

## Documentation Review

- [ ] Read DEPLOYMENT.md for full setup details
- [ ] Read README_SETUP.md for usage examples
- [ ] Bookmarked API documentation: http://localhost:3000/docs
- [ ] Saved default credentials in secure location

## Post-Installation

- [ ] Created at least one working automation
- [ ] Tested manual execution
- [ ] Tested webhook trigger
- [ ] Configured at least one integration (optional)
- [ ] Set up automated backups (recommended)
- [ ] Configured monitoring/alerting (recommended)

## Troubleshooting

If any checks fail:

1. Check logs: `docker-compose logs api`
2. Restart service: `docker-compose restart api`
3. Check resources: `docker stats`
4. Review DEPLOYMENT.md troubleshooting section
5. Verify environment variables: `docker-compose config`

## Daily Maintenance

- [ ] Regularly check execution logs
- [ ] Review success/error rates
- [ ] Monitor disk space for database growth
- [ ] Keep Docker and system updated
- [ ] Verify backups are working

## Performance Baseline

Note your baseline metrics:

- Average execution time: _____ ms
- Successful executions today: _____
- Failed executions today: _____
- Database size: _____ MB
- API response time: _____ ms

## Final Sign-Off

- [ ] Installation complete and verified
- [ ] All systems functional
- [ ] Documentation reviewed
- [ ] Backups configured
- [ ] Ready for production use

---

**Installation Date:** ________________

**Server Hostname:** ________________

**Domain/URL:** ________________

**Notes:**

