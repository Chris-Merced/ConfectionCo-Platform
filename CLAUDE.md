# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ConfectionCo Platform — an e-commerce web app for a confectionery business. Early-stage: basic scaffolding is in place, most features are planned or stubbed.

## Commands

### Frontend (React/TypeScript)
```bash
cd client
npm install          # Install dependencies
npm run dev          # Webpack dev server on port 5173 (hot reload)
npm run build        # Production bundle → client/dist/
```

### Backend (Spring Boot / Java 17)
```bash
cd server
./mvnw spring-boot:run   # Run the app on port 8080
./mvnw test              # Run tests
./mvnw clean install     # Full build — also compiles the React client via Frontend Maven Plugin
```

### Development Setup
- Run frontend (`npm run dev`) and backend (`./mvnw spring-boot:run`) concurrently.
- Webpack dev server proxies `/api/*` to `http://localhost:8080` — no CORS issues in dev.
- Format-on-save is configured in `.vscode/settings.json` (Prettier for TS/JS, RedHat for Java).

## Architecture

**Monorepo:** `client/` (React) and `server/` (Spring Boot) live side-by-side. For production builds, Maven compiles the React bundle and copies it into `server/src/main/resources/static/` so Spring Boot serves the frontend as static assets.

**Frontend** (`client/src/`):
- Entry: `index.tsx` → renders into `#root`
- Components in `src/components/` — currently `Header` and `Main`
- No routing library yet (planned)

**Backend** (`server/src/main/java/com/chrismerced/projects/confectionco/`):
- `ConfectioncoApplication` — Spring Boot entry point
- `api/BaseController` — single REST endpoint `GET /api/base` returns `{"status": "ok"}`; CORS is currently hardcoded to `http://localhost:5173` (TODO: move to env vars)
- `services/EmailService` + `ResendEmailService` — stubbed; planned integration with Resend for email-based auth (no traditional password auth)

**Database:** PostgreSQL at `localhost:5432/confectionco`. Flyway manages migrations from `server/src/main/resources/db/migration/`. Current schema: `users` table (id, email, password_hash, first_name, last_name, is_admin, is_active, created_at).

**Planned integrations (from TODO.txt):** Resend (email/auth), Stripe (payments), AWS S3 (image storage), Instagram feed, SMS notifications.
