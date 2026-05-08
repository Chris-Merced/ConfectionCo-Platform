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

## Project Structure

```
ConfectionCo-Platform/
├── client/          # React frontend
│   └── src/
│       ├── components/   # Header, OrderForm, OrderCard, AuthWrapper
│       └── Routes/       # Page-level components
└── server/          # Spring Boot backend
    └── src/main/java/.../
        ├── api/          # REST controllers
        ├── model/        # JPA entities & enums
        ├── services/     # Business logic (Stripe, S3, Twilio, Resend)
        └── repository/   # Spring Data repositories
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
       ↘ REJECTED                                                              ↘ REFUNDED
```

Admin manages all status transitions from the dashboard. Payment links are sent to the customer via SMS or email and processed through Stripe.

## Getting Started

### Prerequisites

- Node.js 18+
- Java 17
- PostgreSQL running on `localhost:5432` with a database named `confectionco`

### Environment Variables

The backend reads the following from `application.properties` or environment:

```
# Database
SPRING_DATASOURCE_URL
SPRING_DATASOURCE_USERNAME
SPRING_DATASOURCE_PASSWORD

# Auth0
AUTH0_AUDIENCE
AUTH0_ISSUER_URI

# Stripe
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET

# AWS S3
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_S3_BUCKET

# Twilio
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER

# Resend
RESEND_API_KEY
```

### Running Locally

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
| V3 | Add final payment amount column to orders |
