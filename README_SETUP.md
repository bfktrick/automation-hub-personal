# Automation Hub - Setup & Usage Guide

## What is Automation Hub?

A self-hosted personal automation system that runs on your own Ubuntu server. Create tasks that execute automatically on schedules, via webhooks, or manually.

**Features:**
- 🎯 Scheduled automations (cron)
- 🔗 Webhook triggers for external systems
- 🚀 Manual execution on-demand
- 📊 Real-time logs and monitoring
- 🔌 Multiple integrations (HTTP, OpenAI, Telegram, Email)
- 🌐 Web dashboard for management
- 🔐 Secure JWT authentication

## Getting Started

### Option 1: Automated Installation (Recommended)

```bash
# 1. Download/clone the project
cd /path/to/automation-hub

# 2. Run installer
chmod +x install.sh
./install.sh
```

The installer will:
- ✅ Install Docker & Docker Compose
- ✅ Install Cloudflare Tunnel
- ✅ Build images
- ✅ Start services
- ✅ Setup database
- ✅ Create admin user
- ✅ (Optional) Configure remote access

### Option 2: Manual Docker Setup

```bash
# Start services
docker-compose up -d

# Wait for database
sleep 10

# Run migrations
docker-compose exec api npx prisma migrate deploy

# Create admin user
docker-compose exec postgres psql -U admin automation_hub << 'SQL'
INSERT INTO users (id, email, "passwordHash", "isAdmin", "createdAt", "updatedAt")
VALUES ('admin-user', 'admin@automation-hub.local',
  '$2a$10$jNQFHJ.ZZK.0z0Kzx0Kz0OK.ZZK.0z0Kzx0Kz0OK.ZZK.0z0Kzx0Kz0OK',
  true, NOW(), NOW())
ON CONFLICT DO NOTHING;
SQL
```

## First Login

1. Open **http://localhost** in browser
2. Login with:
   - Email: `admin@automation-hub.local`
   - Password: `admin123`
3. ⚠️ **Change password immediately!**

## Creating Your First Automation

### Dashboard

See real-time KPIs:
- Total automations
- Active count
- Executions today
- Success rate

Click "View All" to see detailed execution logs.

### Automations Tab

#### Create Automation

1. Click **"Create Automation"**
2. Set **Name** and optional **Description**
3. Choose **Trigger Type:**
   - **Manual** - Click "Execute Now" button
   - **Cron** - Recurring schedule (e.g., `0 9 * * *` = 9am daily)
   - **Webhook** - POST to `http://YOUR_SERVER/api/v1/webhooks/{automationId}`
4. Choose **Action Type:**
   - **HTTP** - Make HTTP requests
   - **OpenAI** - Call GPT with a prompt
   - **Telegram** - Send Telegram messages
   - **Email** - Send emails (coming soon)
5. Configure action parameters
6. Click **Create**

#### Example: Daily Status Check

```
Name: Daily Status Check
Trigger: Cron (0 9 * * *)  # Every day at 9 AM
Action: HTTP
  URL: https://api.example.com/status
  Method: GET

Expected: API returns status code 200
```

#### Example: Webhook Alert

```
Name: GitHub Deploy Alert
Trigger: Webhook
Action: Telegram
  Message: "Deploy completed: {{ input.branch }}"

Usage: curl -X POST http://localhost/api/v1/webhooks/{ID} \
  -H "Content-Type: application/json" \
  -d '{"branch": "main"}'
```

## Understanding Logs

### Execution Log Details

**Status:**
- 🟢 **success** - Action completed successfully
- 🔴 **error** - Action failed (see error message)
- 🟡 **running** - Currently executing

**Triggered By:**
- `manual` - User clicked "Execute Now"
- `cron` - Scheduled execution
- `webhook` - External trigger

**Output:**
- **HTTP:** Response status, body, headers
- **OpenAI:** Prompt, response text, token usage
- **Telegram:** Message ID, confirmation
- **Error:** Error message and stack trace

## Integration Examples

### HTTP Integration

Useful for:
- Triggering other services
- Polling external APIs
- Webhooks to third-party services

```bash
# Test HTTP trigger
curl -X POST http://localhost/api/v1/automations/{ID}/execute \
  -H "Authorization: Bearer {TOKEN}"

# Via webhook
curl -X POST http://localhost/api/v1/webhooks/{ID} \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'
```

### Telegram Integration

1. Create bot with @BotFather on Telegram
2. Get bot token and chat ID
3. Set environment variables:
   ```bash
   TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
   TELEGRAM_CHAT_ID=987654321
   ```
4. Use in automation action:
   ```
   Action: Telegram
   Message: "Your automation ran!"
   ```

### OpenAI Integration

1. Get API key from https://platform.openai.com
2. Set in `.env`:
   ```bash
   OPENAI_API_KEY=sk-proj-...
   ```
3. Use in automation:
   ```
   Action: OpenAI
   Prompt: "Summarize the latest news"
   ```

## Cron Schedule Examples

```
0 0 * * *     # Midnight daily
0 9 * * 1-5   # 9am Monday-Friday
*/15 * * * *  # Every 15 minutes
0 */6 * * *   # Every 6 hours
0 0 1 * *     # First day of month
```

[Cron Expression Help](https://crontab.guru/)

## Dashboard Monitoring

### KPI Cards

- **Total Automations** - All automations count
- **Active** - Count and percentage of enabled automations
- **Executions Today** - Number of runs in the last 24 hours
- **Success Rate** - Percentage of successful vs failed executions

### Recent Executions

Shows latest automation runs with:
- Status badge
- Automation ID
- Trigger type
- Start time
- Duration
- View details button

Click "View All" to see full logs with filtering and pagination.

## Remote Access via Cloudflare Tunnel

After installation, Cloudflare Tunnel provides:
- ✅ HTTPS by default
- ✅ No port forwarding needed
- ✅ No router configuration
- ✅ Permanent public URL
- ✅ Free tier included

Access from anywhere: `https://automation-hub.your-domain.com`

## Webhook Examples

### Basic Webhook

```bash
curl -X POST http://localhost/api/v1/webhooks/AUTOMATION_ID \
  -H "Content-Type: application/json" \
  -d '{"event": "deployment"}'
```

### GitHub Workflow Trigger

```yaml
name: Trigger Automation
on: [push]

jobs:
  trigger:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Trigger Automation Hub
        run: |
          curl -X POST ${{ secrets.WEBHOOK_URL }} \
            -H "Content-Type: application/json" \
            -d '{"ref": "${{ github.ref }}", "sha": "${{ github.sha }}"}'
```

### Integration with Other Services

Any service that can make HTTP requests can trigger automations:
- IFTTT webhooks
- Zapier
- Make.com
- n8n
- Custom scripts

## Troubleshooting

### Can't login

```bash
# Reset admin password
docker-compose exec postgres psql -U admin automation_hub
# UPDATE users SET "passwordHash" = ... WHERE email = 'admin@automation-hub.local';
```

### Automation not running

1. Check if active (toggle switch on)
2. Check cron syntax: https://crontab.guru
3. View logs for error details
4. Check integrations are configured (API keys, tokens)

### Webhook not triggering

1. Verify automation ID is correct
2. Check automation is active
3. Ensure webhook URL is accessible
4. Check API logs: `docker-compose logs api`

## Performance & Limits

- Concurrent executions: Limited by resources
- Log retention: All logs are kept (implement cleanup if needed)
- Automation limit: Tested with 100+ automations
- Cron frequency: Can run every minute if configured

## Backup Your Data

```bash
# Backup database
docker-compose exec postgres pg_dump -U admin automation_hub > backup.sql

# Restore from backup
cat backup.sql | docker-compose exec -T postgres \
  psql -U admin automation_hub
```

## Next Steps

1. ✅ Create test automation
2. ✅ Configure integrations
3. ✅ Setup remote access
4. ✅ Configure backups
5. ✅ Monitor logs regularly

## Support

- 📖 [Full Deployment Guide](./DEPLOYMENT.md)
- 📚 API Docs: http://localhost:3000/docs
- 🐛 Report issues on GitHub

Enjoy automating! 🚀
