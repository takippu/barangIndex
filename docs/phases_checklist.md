# BarangHarga MVP Phases Checklist

Scope lock for this MVP:
- [ ] Backend is inside Next.js (`app/api/*`) with PostgreSQL + Drizzle ORM
- [ ] Auth uses **Better Auth**
- [ ] **Google login only**
- [ ] No email/password auth in MVP
- [ ] Includes Admin Dashboard for index/report management

---

## Phase 0 - Project Setup (Zero)
- [ ] Confirm Node/Bun versions for team and VPS
- [ ] Confirm `.env` keys list (DB URL, Better Auth secret, Google OAuth creds)
- [ ] Create/update `.env.example`
- [ ] Align folder structure (`app/api/v1`, `src/server`, `src/server/db`)
- [ ] Add base scripts for dev/build/start/lint/typecheck

Definition of done:
- [ ] App runs locally with no missing env errors

---

## Phase 1 - Database & Drizzle Foundation
- [ ] Add Drizzle config (`drizzle.config.ts`)
- [ ] Create DB client module
- [ ] Add initial schema files
- [ ] Setup migration + generate commands
- [ ] Run first migration successfully

Definition of done:
- [ ] Fresh DB can be migrated from zero using one command

---

## Phase 2 - Better Auth (Google-Only)
- [ ] Install and configure Better Auth in Next.js
- [ ] Configure Google OAuth provider only
- [ ] Disable/remove email+password auth paths
- [ ] Add auth route handlers and session handling
- [ ] Add protected route middleware for user pages
- [ ] Add admin role guard helper (RBAC checks)

Definition of done:
- [ ] User can sign in with Google
- [ ] Non-Google auth attempts are not available
- [ ] Authenticated session works across app/API

---

## Phase 3 - Core Domain Schema + Seed Data
- [ ] Create `users` profile extension fields (role, reputation metadata)
- [ ] Create `regions`, `markets`, `items`, `item_variants`
- [ ] Create `price_reports` with moderation status
- [ ] Create `admin_audit_logs`
- [ ] Add indexes for query performance
- [ ] Seed first 10 common index items:
- [ ] Eggs (Grade A tray 30)
- [ ] Whole Chicken
- [ ] Chicken Breast
- [ ] Beef
- [ ] Mackerel Fish
- [ ] Cooking Oil (5kg)
- [ ] Rice (10kg)
- [ ] Onion
- [ ] Tomato
- [ ] Cabbage

Definition of done:
- [ ] Seed script inserts top 10 items idempotently

---

## Phase 4 - User MVP APIs
- [ ] `GET /api/v1/items` (limit/search/category)
- [ ] `GET /api/v1/items/:itemId`
- [ ] `GET /api/v1/markets`
- [ ] `POST /api/v1/price-reports` (authenticated)
- [ ] `GET /api/v1/price-reports/feed`
- [ ] `GET /api/v1/price-index/:itemId` (timeframe + region)
- [ ] `GET /api/v1/search`
- [ ] Add Zod validation for all request payloads
- [ ] Add standardized error response shape

Definition of done:
- [ ] Home/Markets/Price Index/Search/Submit screens can read/write real API data

---

## Phase 5 - Admin API (RBAC)
- [ ] Add admin role checks on `/api/v1/admin/*`
- [ ] `GET /api/v1/admin/dashboard`
- [ ] `POST /api/v1/admin/items` (add new index)
- [ ] `PATCH /api/v1/admin/items/:itemId` (edit/activate/deactivate)
- [ ] `POST /api/v1/admin/item-variants`
- [ ] `PATCH /api/v1/admin/item-variants/:variantId`
- [ ] `POST /api/v1/admin/markets`
- [ ] `PATCH /api/v1/admin/markets/:marketId`
- [ ] `GET /api/v1/admin/reports?status=pending`
- [ ] `POST /api/v1/admin/reports/:reportId/verify`
- [ ] `POST /api/v1/admin/reports/:reportId/reject`
- [ ] `PATCH /api/v1/admin/users/:userId/role`
- [ ] `GET /api/v1/admin/audit-logs`

Definition of done:
- [ ] Admin can add/edit indexes and moderate reports end-to-end

---

## Phase 6 - Admin Dashboard UI (MVP)
- [ ] Create `/admin` page shell with nav
- [ ] Create `/admin/indexes` page (list/create/edit/deactivate)
- [ ] Create `/admin/reports` moderation queue
- [ ] Create `/admin/markets` basic CRUD page
- [ ] Create `/admin/users` role assignment page
- [ ] Show success/error toasts and empty states

Definition of done:
- [ ] Non-admin user is blocked from admin pages
- [ ] Admin can perform core management flows in UI

---

## Phase 7 - Security, Quality, and Guardrails
- [ ] Add route-level rate limiting for submit and auth callbacks
- [ ] Add duplicate report prevention rule
- [ ] Add request logging with request-id
- [ ] Add API tests for critical user/admin endpoints
- [ ] Add role/permission tests (forbidden scenarios)
- [ ] Add migration rollback check in staging/local

Definition of done:
- [ ] Core tests pass and high-risk flows are covered

---

## Phase 8 - VPS + PM2 Deployment
- [ ] Provision PostgreSQL (managed or self-hosted)
- [ ] Configure Nginx reverse proxy + SSL
- [ ] Add PM2 ecosystem config for Next.js process
- [ ] Setup deployment script/steps (install, build, migrate, restart)
- [ ] Configure backup schedule and restore test
- [ ] Configure production env vars securely

Definition of done:
- [ ] App is reachable on domain with HTTPS
- [ ] Deploy + migrate + restart flow is repeatable

---

## Phase 9 - MVP Acceptance Checklist
- [ ] Google login works in production
- [ ] Email/password login is not present
- [ ] Users can submit price reports
- [ ] Users can view index/search/markets/profile data
- [ ] Admin can add new index item from dashboard
- [ ] Admin can verify/reject reports
- [ ] Audit logs capture admin actions
- [ ] No blocker bugs in critical flows

Definition of done:
- [ ] Team signs off MVP as launch-ready
