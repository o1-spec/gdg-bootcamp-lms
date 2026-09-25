# GDG LASU Bootcamp LMS

Production-ready Learning Management System built for Google Developer Groups on Campus, Lagos State University (GDG on Campus LASU).

---

## 🏛️ Architecture & Tech Stack

```
Next.js (App Router, React 19)
  │
  ▼
Prisma ORM (v6 with dual connection URLs)
  │
  ├──► DATABASE_URL (Transaction-mode PgBouncer Pooler on Port 6543) ──► Runtime Queries
  └──► DIRECT_URL   (Session-mode Pooler on Port 5432)               ──► Migrations & DDL
  │
  ▼
PostgreSQL (Hosted on Supabase)
```

> **Important architectural boundary:** Supabase is utilized **strictly as hosted PostgreSQL**. No Supabase Auth, client SDK, Data API, or RLS-based logic is used. Authentication and role-based access control are enforced natively server-side in Next.js via HTTP-only JWT session cookies and Prisma queries.

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui + Lucide Icons
- **Database ORM**: Prisma ORM with PostgreSQL
- **Authentication**: Native HTTP-only cookies (`bootcamp_lms_session`), bcrypt password hashing, jose JWT
- **Media & File Storage**: Cloudinary (resource documents, avatars, submissions)
- **Validation**: Zod (strict schema validation for all mutations & environment variables)
- **Visual Aesthetic**: Signature GDG LASU theme (`#0D0E11` near-black, `#FAF7EE` warm cream, bold typography, Google color accents `#4285F4`, `#EA4335`, `#FBBC04`, `#34A853`)

---

## 🔐 Environment Variables

Create a `.env` file in the project root. Refer to `.env.example` for the required placeholders.

```bash
# ==============================================================================
# DATABASE CONFIGURATION (Supabase Hosted PostgreSQL)
# ==============================================================================
# Transaction-mode connection pooler (IPv4-compatible) for application runtime queries:
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]:6543/[DB]?pgbouncer=true"

# Session-mode connection pooler for schema migrations and DDL operations:
DIRECT_URL="postgresql://[USER]:[PASSWORD]@[HOST]:5432/[DB]"

# ==============================================================================
# AUTHENTICATION
# ==============================================================================
# High-entropy secret for signing JWT session cookies (min 32 characters):
AUTH_SECRET="your-32-char-random-auth-secret-here"

# Canonical base URL of the deployment:
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"

# ==============================================================================
# CLOUDINARY (Media & Document Storage)
# ==============================================================================
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
CLOUDINARY_URL="cloudinary://[API_KEY]:[API_SECRET]@[CLOUD_NAME]"
```

---

## 🗄️ Database Setup & Prisma Workflow

### 1. Connection Architecture
- **Runtime Pooler (`DATABASE_URL`)**: Port `6543` with `?pgbouncer=true`. Provides efficient serverless transaction connection pooling for fast Next.js API routes and server components.
- **Direct Pooler (`DIRECT_URL`)**: Port `5432`. Used by Prisma CLI for running migrations and DDL statements without transaction pooling restrictions.

### 2. Migration Commands

- **Local Schema Evolution**:
  ```bash
  npx prisma migrate dev --name <migration_name>
  ```
- **Syncing Schema Directly to Hosted Database**:
  ```bash
  npx prisma db push
  ```
- **Deploying Migrations in Production CI/CD**:
  ```bash
  npx prisma migrate deploy
  ```
- **Generate Type-Safe Client**:
  ```bash
  npx prisma generate
  ```

---

## 🛡️ Security & Production Hardening

1. **Zero Leaked Credentials**:
   - `passwordHash` is excluded from all Prisma queries via `safeUserSelect`.
   - Grep audits confirm password hashes never appear in API responses, logs, or client-rendered props.
2. **Restrictive Relations**:
   - `onDelete: Restrict` is configured for historical data (`Submission`, `Attendance`, `LessonProgress`, `Enrollment`, `Resource`, `Assignment`, `Announcement`, `Invite`) to protect student work from accidental cascade deletion.
3. **Role & IDOR Authorization**:
   - Enforced server-side in all mutations and sensitive queries (`STUDENT`, `MENTOR`, `ADMIN`, `SUPER_ADMIN`).
   - Students cannot view or modify other students' submissions, mark attendance, or create courses/resources.
   - Mentors can only mutate modules, lessons, resources, and attendance for tracks to which they are explicitly assigned.
   - Only `SUPER_ADMIN` can promote users to `SUPER_ADMIN` or modify other admin privileges.
4. **Security Headers**:
   - Configured in `next.config.ts`: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy`.
5. **Private LMS Protection**:
   - Configured in `src/app/robots.ts`: search engines are disallowed from indexing authenticated dashboard routes (`/dashboard`, `/tracks`, `/assignments`, `/progress`, `/attendance`, `/mentor`, `/admin`, `/settings`), while allowing public landing and join pages.

---

## 🚀 Local Development & Testing

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Validate environment & schema**:
   ```bash
   npx prisma validate
   npx prisma generate
   ```
3. **Run local dev server**:
   ```bash
   npm run dev
   ```
4. **Run TypeScript check**:
   ```bash
   npx tsc --noEmit
   ```
5. **Run ESLint**:
   ```bash
   npm run lint
   ```
6. **Run Production Readiness Test Suite**:
   ```bash
   node scripts/test-production-readiness.mjs
   ```

---

## 📦 Production Deployment Checklist (Vercel / Node Host)

- [ ] **Hosted Database**: Ensure PostgreSQL on Supabase has active compute and connection pooler enabled.
- [ ] **Environment Variables**: Add `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` to deployment settings.
- [ ] **Build Command**: `prisma generate && next build`
- [ ] **Install Command**: `npm install`
- [ ] **Database Migration**: Run `npx prisma db push` or `npx prisma migrate deploy` before deploying application changes.
- [ ] **Security Validation**: Verify `AUTH_SECRET` is at least 32 random characters and not a default string.
- [ ] **Super Admin Provisioning**: Create initial Super Admin account securely via administrative seed script or direct database insert with a bcrypt-hashed password.
