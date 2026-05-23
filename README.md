# ConfectionCo Platform

Internal operations platform for ConfectionCo Bakery. Handles customer order intake, admin order management, and Stripe payment collection via SMS/email links.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Webpack, React Router v7, TanStack Query |
| Backend | Spring Boot, Java 17 |
| Database | PostgreSQL + Flyway migrations |
| Auth | Auth0 (JWT, admin-only routes) |
| Payments | Stripe (payment links + webhooks) |
| Storage | AWS S3 (order photos) |
| Email | Resend |
| SMS | Twilio |
| Deployment | Docker + Docker Compose |

## Project Structure

```
ConfectionCo-Platform/
├── client/          # React frontend
│   └── src/
│       ├── components/   # Header, OrderForm, OrderCard, AuthWrapper
│       ├── Routes/       # Page-level components
│       └── utils/        # Shared utilities (parseApiError)
├── server/          # Spring Boot backend
│   └── src/main/java/.../
│       ├── api/          # REST controllers
│       ├── config/       # Security, CORS
│       ├── dtos/         # Data transfer objects
│       ├── exceptions/   # GlobalExceptionHandler
│       ├── model/        # JPA entities & enums
│       ├── services/     # Business logic (Stripe, S3, Twilio, Resend)
│       └── repository/   # Spring Data repositories
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

## Routes

| Path | Description |
|---|---|
| `/` | Customer-facing home page + order form |
| `/admin` | Admin dashboard (Auth0-protected) |
| `/payment-success` | Stripe redirect on successful payment |
| `/payment-cancel` | Stripe redirect on cancelled payment |
| `/privacy-policy` | Privacy policy |
| `/terms-and-conditions` | Terms and conditions |

## Order Lifecycle

```
PENDING → AWAITING_DEPOSIT → IN_PROGRESS → AWAITING_FINAL_PAYMENT → PAID_IN_FULL → COMPLETED
       ↘ REJECTED                                                              ↘ REFUND_PENDING → REFUNDED
```

| Status | Description |
|---|---|
| `PENDING` | Order submitted, awaiting admin review |
| `AWAITING_DEPOSIT` | Admin accepted — 40% deposit link sent to customer |
| `IN_PROGRESS` | Deposit paid — baker is working on the order |
| `AWAITING_FINAL_PAYMENT` | Final payment link sent to customer |
| `PAID_IN_FULL` | Full payment received |
| `COMPLETED` | Order fulfilled and closed |
| `REJECTED` | Admin rejected the order — customer notified via SMS |
| `REFUND_PENDING` | Stripe refund submitted, awaiting confirmation |
| `REFUNDED` | Refund confirmed by Stripe webhook |
| `REMOVED` | Soft-deleted from the dashboard |

State transitions are enforced server-side — invalid transitions (e.g. completing an unpaid order) return a 400. Payment links are tokenized and expire once used. Stripe events are processed idempotently via a `stripe_processed_events` deduplication table.

## Getting Started

### Environment Variables

Copy `.env.example` to `.env` at the project root and fill in your credentials:

```bash
cp .env.example .env
```

```
# Database (Docker Compose sets these automatically — only needed for manual setup)
DB_URL=jdbc:postgresql://localhost:5432/confectionco
DB_USERNAME=confectionco
DB_PASSWORD=your_password

# App
APP_BASE_URL=http://localhost:5173
OWNER_PHONE=+1xxxxxxxxxx

# Auth0
AUTH0_ISSUER_URI=https://your-tenant.us.auth0.com/
AUTH0_AUDIENCE=https://confectionco-api

# Stripe
STRIPE_API_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend
RESEND_API_KEY=re_...

# AWS S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-2
AWS_BUCKET_ASSETS=...
AWS_BUCKET_INSPO=...
AWS_BUCKET_URL=https://...

# Twilio
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
```

### Docker (recommended)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
docker compose up --build
```

Starts the app on port 8080 and a Postgres instance. Flyway migrations run automatically. Use `--build` when you've changed code; omit it on subsequent starts.

### Running Locally (without Docker)

Requires Node.js 22+, Java 17, and PostgreSQL on `localhost:5432/confectionco`.

**Frontend** (port 5173):
```bash
cd client
npm install
npm run dev
```

**Backend** (port 8080):
```bash
cd server
./mvnw spring-boot:run
```

The Webpack dev server proxies `/api/*` to `http://localhost:8080`, so no CORS configuration is needed during development.

### Production Build

```bash
cd server
./mvnw clean install
```

Maven compiles the React bundle via the Frontend Maven Plugin and copies it into `server/src/main/resources/static/`. Spring Boot then serves the frontend as static assets.

## Database Migrations

Flyway migrations live in `server/src/main/resources/db/migration/` and run automatically on startup.

| Migration | Description |
|---|---|
| V1 | Create users table |
| V2 | Add orders table with serving count, comments, and photo URLs |
| V3 | Add final payment amount to orders |
| V4 | Add fulfillment type and delivery address to orders |
| V5 | Add fulfillment date to orders |
| V6 | Rename total_amount to deposit_amount |
| V7 | Add Stripe refund ID to orders |
| V8 | Add customer name to orders |
| V9 | Add stripe_processed_events table for idempotent webhook handling |
| V10 | Add SMS consent to orders |
| V11 | Add refund amount to orders |
| V12 | Add payment link token and URL to orders |
| V13 | Add order total amount to orders |
