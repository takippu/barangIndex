# Backend Guidelines - GroceryIndex (Next.js MVP)

## Goal
Build a simple MVP backend using:
- Next.js Route Handlers (`app/api/*`)
- PostgreSQL
- Drizzle ORM
- Linux VPS deployment with PM2

This plan covers current user screens and requested admin scope.

## 1) Screen Analysis -> Backend Requirements

### User App Screens
- `/login`: Google sign-in flow and session handling
- `/onboarding`: save onboarding completion
- `/` (home): market pulse, top movers, recent activity feed
- `/markets`: list item indexes with current price + 24h stats
- `/price-index`: item detail, chart (7D/30D/90D/1Y), transparency stats
- `/search`: price comparison, filters, sorting, pagination
- `/submit`: submit new price report
- `/profile`: user stats, badges, activity

### Admin Dashboard (new)
- `/admin`: overview metrics
- `/admin/indexes`: create/edit/deactivate index items
- `/admin/variants`: manage grade/unit/packaging variants
- `/admin/markets`: manage market/store records
- `/admin/reports`: verify/reject submitted reports
- `/admin/users`: role management (`user`, `moderator`, `admin`)
- `/admin/audit`: admin action logs

---

## 2) Recommended MVP Stack

## Runtime/API
- `next` (Route Handlers)
- `zod` (request validation)
- `pino` (structured logs)

## Database
- `pg`
- `drizzle-orm`
- `drizzle-kit`

## Auth/Security
- `better-auth`
- `better-auth` Google provider

## Optional later
- `redis` / `ioredis` (cache + rate limit)
- `bullmq` (background moderation jobs)

---

## 3) Suggested Project Structure (Single Next.js App)

```txt
app/
  api/
    v1/
      auth/
      items/
      markets/
      price-index/
      price-reports/
      search/
      users/
      admin/
  admin/
    page.tsx
    indexes/
    variants/
    markets/
    reports/
    users/
    audit/
src/
  server/
    db/
      schema/
      migrations/
      seed/
      client.ts
    modules/
      auth/
      items/
      markets/
      price-index/
      price-reports/
      search/
      users/
      admin/
    shared/
      validation/
      security/
      telemetry/

drizzle.config.ts
```

---

## 4) Database Model (PostgreSQL + Drizzle)

## Core entities
- `users`
- `auth_identities`
- `sessions` (managed by Better Auth)
- `regions`
- `markets`
- `items` (these are index items)
- `item_variants`
- `price_reports`
- `report_votes`
- `user_reputation_events`
- `badges`
- `user_badges`
- `admin_audit_logs`

## Role model (MVP)
- Add `users.role` enum: `user | moderator | admin`

## Important fields
- Prices: `numeric(10,2)`
- `currency` explicit (`MYR`)
- Keep both `reported_at` and `created_at`
- Moderation fields on report:
  - `status` (`pending | verified | rejected`)
  - `verified_by`, `verified_at`, `rejection_reason`
- Soft-delete support for admin managed entities:
  - `is_active`, `deleted_at`

## Critical indexes
- `price_reports(item_id, region_id, reported_at desc)`
- `price_reports(market_id, item_id, reported_at desc)`
- `price_reports(user_id, created_at desc)`
- search index on `items.name`/`slug` (GIN trigram suggested)
- geospatial index for markets if using lat/lng filtering

---

## 5) Initial Item Index Seed (Top 10 Common Items)

Seed these first:
1. Eggs (Grade A, tray 30)
2. Whole Chicken
3. Chicken Breast
4. Beef
5. Mackerel Fish
6. Cooking Oil (5kg)
7. Rice (10kg)
8. Onion
9. Tomato
10. Cabbage

Suggested `items` columns:
- `id`, `slug`, `name`, `category`, `default_unit`, `is_active`, `created_at`

---

## 6) API Design (v1)

Base path: `/api/v1`

## Auth
- Better Auth catch-all route (e.g. `app/api/auth/[...all]/route.ts`)
- Google provider only enabled
- No email/password endpoints in MVP
- Session read endpoint for app usage:
  - `GET /auth/session`

## User App APIs
- `GET /items?limit=10&category=&q=`
- `GET /items/:itemId`
- `GET /markets?regionId=&q=&lat=&lng=`
- `POST /price-reports`
- `GET /price-reports/feed?regionId=&cursor=`
- `GET /price-index/:itemId?regionId=&timeframe=7d|30d|90d|1y`
- `GET /price-index/:itemId/stores?regionId=&sort=cheapest|nearest|verified`
- `GET /search?query=&regionId=&sort=&verifiedOnly=&marketType=&cursor=`
- `GET /users/me`
- `GET /users/me/stats`
- `GET /users/me/activity?cursor=`
- `GET /users/me/badges`

## Admin APIs (RBAC protected)
- `GET /admin/dashboard`
- `POST /admin/items`
- `PATCH /admin/items/:itemId`
- `POST /admin/item-variants`
- `PATCH /admin/item-variants/:variantId`
- `POST /admin/markets`
- `PATCH /admin/markets/:marketId`
- `GET /admin/reports?status=pending&cursor=`
- `POST /admin/reports/:reportId/verify`
- `POST /admin/reports/:reportId/reject`
- `PATCH /admin/users/:userId/role`
- `GET /admin/audit-logs?cursor=`

---

## 7) Metrics & Aggregations

Compute from `price_reports`:
- Current price: median of latest verified reports in active window
- 24h high/low: high/low in last 24h
- Change %: current window median vs previous window median
- Confidence score: report count + reporter diversity + verification ratio + recency
- Top movers: highest absolute 24h movement

Materialized views (or cron-refreshed tables):
- `item_daily_stats`
- `item_region_latest`
- `market_item_latest`

---

## 8) Security & Anti-Abuse

- Validate all writes with Zod
- Rate limit auth + submit endpoints
- Use Better Auth session lifecycle (no custom password/JWT flow for MVP)
- Duplicate report detection (same user/item/market/time bucket)
- Enforce RBAC on `/api/v1/admin/*`
- Audit every admin mutation in `admin_audit_logs`

---

## 9) Linux VPS + PM2 Deployment (Single App)

## Build/runtime setup
- Node 20 LTS
- Nginx reverse proxy
- Let's Encrypt SSL
- PM2 running Next.js production server

## PM2 ecosystem example
```js
module.exports = {
  apps: [
    {
      name: "groceryindex-web",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
```

## Deployment flow
1. `bun install --frozen-lockfile`
2. `bun run build`
3. `bunx drizzle-kit migrate`
4. `pm2 start ecosystem.config.cjs && pm2 save`
5. `pm2 startup`
6. monitor with `pm2 logs barangharga-web` and `pm2 monit`

---

## 10) Delivery Plan (MVP Phases)

## Phase 1 - Foundation
- Setup Drizzle + PostgreSQL
- Create core schema (`users`, `items`, `markets`, `price_reports`)
- Seed top 10 items

## Phase 2 - User APIs
- Better Auth setup (Google-only)
- Submit report
- Home feed + markets list + price index + search

## Phase 3 - Admin MVP
- Admin auth guard + role checks
- Manage index items (add/edit/deactivate)
- Manage markets
- Verify/reject reports
- Basic audit log page

## Phase 4 - Profile & Reputation
- User stats/activity endpoints
- Reputation events + badge assignment

## Phase 5 - Hardening
- Caching, observability, backup/restore checks
- Production rollout with PM2 + Nginx

---

## 11) Practical Next Steps

1. Add Drizzle schema + migrations.
2. Add seed script for the 10 initial index items.
3. Implement first user endpoints:
   - Better Auth route + Google provider config
   - `GET /api/v1/auth/session`
   - `GET /api/v1/items?limit=10`
   - `POST /api/v1/price-reports`
   - `GET /api/v1/price-index/:itemId`
4. Implement first admin endpoints:
   - `POST /api/v1/admin/items`
   - `PATCH /api/v1/admin/items/:itemId`
   - `POST /api/v1/admin/reports/:reportId/verify`
5. Build `/admin/indexes` page to add new index items quickly.
