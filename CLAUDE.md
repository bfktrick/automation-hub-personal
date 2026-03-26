# CLAUDE.md - Automation Hub Personal

This file provides guidance to Claude Code when working with this project.

---

## Project Overview

**Automation Hub Personal** — A self-hosted automation system that runs on your own Ubuntu Linux server at home. Create automated tasks (with cron schedules, webhooks, or manual triggers) that execute actions like HTTP requests, AI-powered operations, or notifications.

**Purpose:** Manage personal automations without relying on third-party services. Own your data and automation workflows.

**Key features:**
- Cron-based scheduling
- Multiple trigger types (cron, manual, webhook, interval)
- Action integrations (HTTP, OpenAI GPT-4o-mini, Telegram, Email)
- Full execution logs with success/error details
- Web panel to manage everything (no coding needed)
- Self-hosted on your home server via Docker

---

## Development Stack

| Layer | Technology |
|-------|------------|
| **Runtime** | Node.js 20+, TypeScript |
| **Framework** | NestJS 11 |
| **ORM** | Prisma 5 |
| **Database** | PostgreSQL 16 |
| **Cache/Queues** | Redis 7 |
| **Auth** | JWT + Passport |
| **Scheduling** | @nestjs/schedule (cron jobs), BullMQ (queues - future) |
| **Logging** | Pino (nestjs-pino) |
| **Metrics** | Prometheus (prom-client) |
| **Frontend** | React + Vite + Tailwind CSS |
| **Validation** | Zod (env), class-validator (DTOs) |
| **Testing** | Jest |
| **Environment** | Docker + Docker Compose |

---

## Quick Start (Development)

```bash
# Start everything (API, frontend, PostgreSQL, Redis)
docker compose up

# Access points:
# - Frontend: http://localhost (default admin/admin123)
# - API: http://localhost:3000
# - Swagger: http://localhost:3000/docs
# - Database: localhost:5432 (admin/admin123)
# - Redis: localhost:6379
```

---

## Project Structure

```
automation-hub/
├── docker-compose.yml           # Development environment
├── .env.example                 # Environment template
├── install.sh                   # Production setup script (TODO)
├── CLAUDE.md                    # This file

├── backend/                     # NestJS API
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── migrations/
│   └── src/
│       ├── main.ts              # Bootstrap
│       ├── app.module.ts        # Root module
│       ├── core/                # Infrastructure (config, errors, logging, metrics, request context)
│       ├── infrastructure/      # External integrations (Prisma)
│       └── modules/
│           ├── auth/            # JWT authentication
│           ├── health/          # Health checks
│           ├── automations/     # CRUD automations
│           ├── jobs/            # Cron job execution (@nestjs/schedule)
│           ├── logs/            # Execution logs
│           └── integrations/    # HTTP, OpenAI, Telegram actions

└── frontend/                    # React + Vite
    ├── Dockerfile
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── src/
        ├── main.tsx
        ├── App.tsx              # Root component, routing
        ├── index.css            # Tailwind styles
        ├── types/               # TypeScript interfaces
        ├── hooks/               # useAuth, useAutomations, useLogs
        ├── components/          # Toast, AutomationCard, LogViewer
        └── views/               # LoginView, DashboardView, AutomationsView, LogsView
```

---

## Data Model (Prisma)

### User
- `id`: UUID, primary key
- `email`: String, unique (admin user only)
- `password`: String, hashed
- `createdAt`, `updatedAt`: DateTime

### Automation
- `id`: UUID
- `name`: String
- `description`: String?
- `isActive`: Boolean (can toggle on/off)
- `trigger`: JSON object
  - `type`: "cron" | "manual" | "webhook" | "interval"
  - `config`: object (varies by type)
    - cron: `{ schedule: "0 8 * * *" }` (crontab format)
    - interval: `{ intervalMs: 1800000 }`
    - webhook: `{ secretToken?: "abc123" }`
- `action`: JSON object
  - `type`: "http" | "openai" | "telegram" | "email" | "js_script"
  - `config`: object (varies by type)
    - http: `{ url, method: "GET"|"POST"|"PUT", headers?, body? }`
    - openai: `{ prompt, model: "gpt-4o-mini", maxTokens? }`
    - telegram: `{ message }`
- `lastRunAt`: DateTime?
- `lastRunStatus`: "success" | "error" | null
- `createdAt`, `updatedAt`: DateTime

### ExecutionLog
- `id`: UUID
- `automationId`: UUID (FK → Automation)
- `status`: "running" | "success" | "error"
- `startedAt`: DateTime
- `finishedAt`: DateTime?
- `durationMs`: Int?
- `output`: JSON? (response from the action)
- `error`: String? (error message if failed)
- `triggeredBy`: "cron" | "manual" | "webhook"
- `createdAt`: DateTime

---

## Core Features

### Authentication
- JWT-based with Passport strategy
- Location: `src/modules/auth/`
- Guards: `JwtAuthGuard` for protected routes
- Single admin user (created during installation)
- **Important:** Token stored in localStorage on frontend

### Configuration
- **Typed with Zod** in `src/core/config/env.validation.ts`
- **Organized by concern:** app, cors, database, logging, redis, jwt, openai, telegram
- **Environment variables** loaded via `@nestjs/config` from `.env`
- **ConfigService** used to access config (never `process.env`)

### Error Handling
- Global exception filter: `all-exceptions.filter.ts`
- Handles HttpException, Prisma errors, validation errors, unknown errors
- Standard error response: `{ statusCode, message, timestamp, path, requestId }`

### Logging
- **Pino logger** via nestjs-pino
- Automatic request/response logging
- Structured logs with context (useful for debugging automations)

### Metrics
- **Prometheus** metrics middleware
- Tracked metrics:
  - `automation_hub_http_requests_total`
  - `automation_hub_http_request_duration_seconds`
  - `automation_hub_automations_executed_total`
  - `automation_hub_automation_errors_total`
- Exposed at `/metrics` endpoint

### API Structure
- **Versioning:** URI-based (`/api/v1/...`)
- **Global prefix:** `/api` (excludes `/docs`, `/metrics`)
- **CORS:** Enabled for frontend
- **Rate limiting:** Configurable throttle (default: 100 requests/15 min per IP)
- **Validation:** Global `ValidationPipe` with whitelist enforcement

### Swagger
- Auto-generated from decorators
- Available at `/docs`

---

## Automations Module Details

### Endpoints
- `GET /api/v1/automations` — List all
- `POST /api/v1/automations` — Create new
- `GET /api/v1/automations/:id` — Get one
- `PUT /api/v1/automations/:id` — Update
- `DELETE /api/v1/automations/:id` — Delete
- `PATCH /api/v1/automations/:id/toggle` — Toggle active/inactive
- `POST /api/v1/automations/:id/execute` — Manual trigger

### Jobs Module (@nestjs/schedule)
- On app startup: read all active automations with `trigger.type === "cron"`
- Register each one as a dynamic cron job
- When cron fires: execute via JobExecutorService
- When automation is created/updated/deleted: register/update/unregister job
- Uses `SchedulerRegistry` for dynamic job management

### Job Executor Service
- Takes an `Automation` object
- Executes the appropriate action based on `action.type`
- Wraps execution in try-catch
- Creates `ExecutionLog` before starting
- Updates log with result/error after completing
- Respects timeout (e.g., 30s max execution)

---

## Important Patterns

**Never use `process.env` directly.** Use `ConfigService`:
```typescript
// ❌ Don't do this
const secret = process.env.JWT_SECRET;

// ✅ Do this
constructor(private config: ConfigService) {}
const secret = this.config.getOrThrow<string>('jwt.secret');
```

**Inject `PrismaService` for database access:**
```typescript
constructor(private prisma: PrismaService) {}
const automation = this.prisma.automation.findUnique({ where: { id } });
```

**Use `RequestContext` for correlation IDs:**
```typescript
import { RequestContext } from './core/request-context';
const requestId = RequestContext.get('requestId');
```

**DTO validation with class-validator:**
```typescript
export class CreateAutomationDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsObject()
  trigger: any; // In reality, validate this properly with nested DTOs

  @IsObject()
  action: any;
}
```

---

## Frontend Architecture

### Theme System
- **Modes:** `'dynamic'` (dark, modern) | `'corporate'` (light, professional)
- Currently uses `'dynamic'` (glassmorphism, animated gradients)
- Stored in `App.tsx` state, passed via context or props

### Design Patterns
**1. Glassmorphism**
- Cards: `bg-white/5 backdrop-blur-xl border border-white/10`
- Animated blobs background (3 blobs with staggered animations)
- Gradient borders on KPI cards

**2. Theme-Aware Components**
- Create `tApp` object at component top:
  ```typescript
  const tApp = {
    bgBase: theme === 'dynamic' ? '#060b18' : 'bg-gray-50',
    bgCard: theme === 'dynamic' ? 'bg-white/5 backdrop-blur-xl' : 'bg-white',
    textPrimary: theme === 'dynamic' ? 'text-white' : 'text-gray-900',
  };
  ```
- Use `tApp` instead of hardcoded colors

**3. Component Examples**
- `Toast.tsx` — Global notifications (copied from Proyecto Horarios template)
- `AutomationCard.tsx` — Displays one automation (name, state, buttons)
- `LogViewer.tsx` — Table of execution logs with filtering
- `TriggerEditor.tsx` — Form to configure trigger type and config

### Views
- **LoginView** — Email + password form, stores JWT
- **DashboardView** — KPI cards, recent logs, quick stats
- **AutomationsView** — Grid of AutomationCards + create button
- **LogsView** — Table of all ExecutionLogs with filters

---

## Common Commands

### Build & Run
```bash
npm install              # Install dependencies
npm run build           # Compile TypeScript
npm run start           # Run compiled app
npm run start:dev       # Watch mode (hot reload)
npm run start:debug     # Debug mode
```

### Code Quality
```bash
npm run lint            # Fix linting issues
npm run lint:check      # Check without fixing
npm run format          # Format with Prettier
```

### Testing
```bash
npm test                # Run unit tests
npm test:watch          # Watch mode
npm test:cov            # Coverage report
npm test:e2e            # End-to-end tests
```

### Database
```bash
npx prisma generate     # Generate Prisma client
npx prisma migrate dev  # Create migration
npx prisma db push      # Sync schema to DB (dev only)
npx prisma studio      # Open Prisma Studio UI
```

---

## Development Workflow

### Adding a New Module

1. **Create module directory:**
   ```bash
   mkdir src/modules/my-module
   ```

2. **Structure:**
   ```
   my-module/
   ├── my-module.module.ts
   ├── my-module.controller.ts
   ├── my-module.service.ts
   ├── dto/
   │   ├── create-my-resource.dto.ts
   │   └── update-my-resource.dto.ts
   └── my-module.spec.ts
   ```

3. **Register in `app.module.ts`:**
   ```typescript
   import { MyModuleModule } from './modules/my-module/my-module.module';

   @Module({
     imports: [MyModuleModule],
   })
   export class AppModule {}
   ```

### Adding Database Changes

1. **Modify `prisma/schema.prisma`**
2. **Create migration:**
   ```bash
   npx prisma migrate dev --name describe_change
   ```
3. **Regenerate client:**
   ```bash
   npx prisma generate
   ```

---

## Environment Variables

Required (validated via Zod in `src/core/config/env.validation.ts`):

```env
# Application
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug

# Database
DATABASE_URL=postgresql://admin:admin123@postgres:5432/automation_hub

# Redis
REDIS_URL=redis://redis:6379

# CORS
CORS_ORIGINS=*
CORS_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT=100
RATE_TTL=900

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=3600

# Optional integrations
OPENAI_API_KEY=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

---

## Next Steps for Development

1. **Run locally:**
   ```bash
   docker compose up
   # Frontend: http://localhost
   # API: http://localhost:3000
   # Login with: admin / admin123 (created during first run)
   ```

2. **Add backend features:**
   - Create new modules in `src/modules/`
   - Use Prisma migrations for schema changes
   - Add validation with DTOs
   - Test with Jest

3. **Add frontend changes:**
   - Create new components in `src/components/`
   - Create new views in `src/views/`
   - Create new hooks in `src/hooks/`
   - Use theme colors via `tApp` object
   - Pass `theme` prop to components that need it

4. **Before committing:**
   ```bash
   npm run lint && npm run format
   ```

---

## Key Files Reference

**Backend**
| File | Purpose |
|------|---------|
| `src/main.ts` | Bootstrap, middleware setup, Swagger config |
| `src/app.module.ts` | Root module, imports all modules |
| `src/core/config/env.validation.ts` | Environment variable schema (Zod) |
| `src/core/errors/all-exceptions.filter.ts` | Global error handler |
| `prisma/schema.prisma` | Database schema and data model |
| `docker-compose.yml` | Dev environment (Postgres, Redis, API, Frontend) |

**Frontend**
| File | Purpose |
|------|---------|
| `src/App.tsx` | Root component, routing, theme/auth state |
| `src/views/LoginView.tsx` | Authentication |
| `src/views/DashboardView.tsx` | Main dashboard with KPIs |
| `src/views/AutomationsView.tsx` | Automation management grid |
| `src/views/LogsView.tsx` | Execution logs table |
| `src/hooks/useAuth.ts` | Authentication & token management |
| `src/hooks/useAutomations.ts` | Automation data fetching & state |
| `src/hooks/useLogs.ts` | Logs fetching & filtering |

---

## Deployment to Ubuntu Server

**Phase 4 will include:**
1. `install.sh` script that automates everything
2. Cloudflare Tunnel setup for secure remote access
3. Systemd service for cloudflared daemon
4. Automatic health checks and restarts

**For now (development):**
- Just run `docker compose up` on your Windows machine
- Once Phase 1-3 are complete, move to Ubuntu and run the install script
