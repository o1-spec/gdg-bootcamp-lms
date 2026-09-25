# GDG LASU Bootcamp LMS

Production-ready Learning Management System built for Google Developer Groups on Campus, Lagos State University (GDG on Campus LASU).

---

## 🏛️ Architecture & Tech Stack

```
Next.js 16 (App Router, React 19)
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
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]:6543/[DB]?pgbouncer=true&schema=public"

# Session-mode connection pooler for schema migrations and DDL operations:
DIRECT_URL="postgresql://[USER]:[PASSWORD]@[HOST]:5432/[DB]?schema=public"

# ==============================================================================
# AUTHENTICATION
# ==============================================================================
# High-entropy secret for signing JWT session cookies (min 32 characters):
AUTH_SECRET="your-32-char-random-auth-secret-here"

# Canonical base URL of the deployment:
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"

# ==============================================================================
# CLOUDINARY (Media & Document Storage - Server-Only)
# ==============================================================================
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Node Environment
NODE_ENV="production"
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
- **Syncing Schema to Hosted Supabase PostgreSQL**:
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

## 👑 Initial Production Administrator Setup

To safely create or upgrade your first Super Administrator account without hardcoding credentials in git:

```bash
# Run interactively:
npm run create-admin

# Or provide via environment variables:
ADMIN_EMAIL="admin@gdglasu.dev" ADMIN_PASSWORD="YourStrongPassword123!" npm run create-admin
```

This securely generates the user with bcrypt hashing (cost factor 12) and assigns `Role.SUPER_ADMIN`.

---

## 🚀 Step-by-Step Vercel Deployment Guide

### 1. Push to GitHub
Ensure all code is committed and pushed to your GitHub repository:
```bash
git add .
git commit -m "chore: prepare for production deployment"
git push origin main
```

### 2. Import into Vercel
1. Go to [vercel.com](https://vercel.com) and click **"Add New..." > "Project"**.
2. Select and import your GitHub repository.
3. Framework Preset: **Next.js**.
4. Root Directory: `./`.
5. Build & Output Settings:
   - Build Command: `prisma generate && next build` (defined in `package.json`).
   - Install Command: `npm install`.

### 3. Configure Environment Variables in Vercel
Navigate to **Project > Settings > Environment Variables** and add the following keys for **Production** (and optionally **Preview**):

| Key | Value / Note | Target |
|---|---|---|
| `DATABASE_URL` | Supabase Transaction Pooler URL (`:6543?pgbouncer=true`) | Production |
| `DIRECT_URL` | Supabase Session Pooler URL (`:5432`) | Production |
| `AUTH_SECRET` | 32+ character random string (`openssl rand -base64 32`) | Production, Preview |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` (or custom domain) | Production |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name | Production, Preview |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | Production, Preview |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret (server-only) | Production, Preview |

> **⚠️ Preview Deployments Recommendation**: If using Vercel Preview Deployments on pull requests, consider pointing preview branches to a separate staging/development database to prevent test data from modifying the production PostgreSQL database.

### 4. Deploy Migrations
Before or immediately after launching the production deployment, apply any pending Prisma migrations:
```bash
npx prisma migrate deploy
```

### 5. Custom Domain Configuration (Optional)
To use a custom domain such as `learn.gdglasu.com`:
1. In Vercel, go to **Settings > Domains** and add `learn.gdglasu.com`.
2. Configure DNS CNAME records at your domain registrar.
3. Update `NEXT_PUBLIC_APP_URL="https://learn.gdglasu.com"` in Vercel Environment Variables.
4. Redeploy the latest commit so metadata and absolute links reflect the custom domain.

---

## 🛡️ Database Backups & Data Protection
- Production backups are managed through Supabase's automated daily WAL-G backup architecture.
- Confirm backups are active in the Supabase Dashboard under **Project Settings > Database > Backups**.
- Historical LMS entities (`Submission`, `Attendance`, `LessonProgress`, `Enrollment`, `Resource`, `Assignment`, `Announcement`, `Invite`) have `onDelete: Restrict` rules defined in Prisma to prevent cascade data loss.

---

## 🧪 Post-Deployment Verification Checklist

After deploying to Vercel, test the following core flows:

- [ ] **Homepage & Login**: Visit `https://your-domain/login`. Page renders cleanly without flash or layout shifts.
- [ ] **Registration**: Register a test student account at `/register`. Verify instant 201 Created and onboarding redirect.
- [ ] **Authentication State**: Confirm HTTP-only `bootcamp_lms_session` cookie is set with `Secure`, `HttpOnly`, and `SameSite=Lax`.
- [ ] **Admin Portal**: Log in as Super Admin (`/login`) and verify access to `/admin/dashboard`, cohorts, tracks, and invites.
- [ ] **Invite Links**: Generate an invite code in `/admin/invites`. Verify link copies with production HTTPS domain.
- [ ] **Student Dashboard**: Log in as a student and confirm tracks, upcoming classes, and empty states render gracefully.
- [ ] **Track & Lessons**: Browse `/tracks`, view modules, open a lesson, and toggle completion progress.
- [ ] **Assignments**: Browse `/assignments`, view assignment requirements, and test submission form.
- [ ] **Cloudinary Uploads**: Test uploading an avatar in `/settings` or submitting a file to verify Cloudinary integration.
- [ ] **In-App Notifications**: Check notification bell dropdown and mark items as read.
- [ ] **Logout**: Click Logout and verify session cookie is cleared and redirected to `/login`.
- [ ] **Mobile Responsiveness**: Test viewport at 375px (iPhone) to verify mobile navigation drawer and responsive grids.
