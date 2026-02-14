# Database Seeders

This document explains the database seeding system for GroceryIndex.

## Overview

Seeders are used to populate the database with initial data for development, testing, and demonstration purposes. All seeders are **idempotent** — they can be run multiple times without creating duplicates.

## Available Seeders

### 1. `seed-items.ts` — Core Items Seeder

**Purpose:** Seeds the essential grocery items that form the foundation of the platform.

**What it seeds:**
| Item | Category | Unit |
|------|----------|------|
| Eggs (Grade A tray 30) | protein | tray |
| Whole Chicken | protein | kg |
| Chicken Breast | protein | kg |
| Beef | protein | kg |
| Mackerel Fish | protein | kg |
| Cooking Oil (5kg) | grocery | bottle |
| Rice (10kg) | grocery | bag |
| Onion | vegetable | kg |
| Tomato | vegetable | kg |
| Cabbage | vegetable | kg |

**Run command:**
```bash
npm run seed:items
```

**Behavior:**
- Uses `ON CONFLICT DO UPDATE` to ensure items are created or updated
- Sets `isActive: true` for all seeded items
- Safe to run multiple times

---

### 2. `seed-demo-data.ts` — Demo Data Seeder

**Purpose:** Generates realistic demo data for development and presentation.

⚠️ **WARNING:** This seeder **TRUNCATES** existing app data before seeding. Only use in development/demo environments!

**What it seeds:**

#### Regions (3)
- Klang Valley
- Penang  
- Johor Bahru

#### Markets (12)
| Region | Markets |
|--------|---------|
| Klang Valley | Pasar Besar Chow Kit, Pasar Borong Selayang, NSK Trade City Kuchai Lama, Lotus's Kepong, Jaya Grocer Intermark, Village Grocer Bangsar Village |
| Penang | Bayan Baru Market, Pulau Tikus Market, Lotus's E-Gate |
| Johor Bahru | Larkin Market, Taman Ungku Tun Aminah Market, Lotus's Setia Tropika |

#### Demo Contributors (10)
Fake users with Malay/Local names for realistic demo data:
- Aiman, Siti, Farah, Hafiz, Nadia, Jason, Kumar, Mei Ling, Amirul, Syafiqah

#### Price Reports (~4 months of data)
- **125 days** of historical data
- **~2,000-5,000** price reports generated
- Realistic price fluctuations with:
  - Base prices for each item
  - Market-specific noise/variation
  - Weekly seasonality patterns
  - Gradual inflation trends
  - Random market activity spikes

#### Report Status Distribution
- ~84% Verified
- ~12% Pending
- ~4% Rejected

#### Social Data
- **Votes:** 30% of reports get 1-5 "helpful" votes
- **Comments:** 10% of reports get 1-2 comments (in Malay/English mix)

**Run command:**
```bash
npm run seed:demo
```

**Behavior:**
1. **TRUNCATES** all app-domain tables (keeps auth tables intact)
2. Resets user counters (report_count, verified_report_count)
3. Seeds items, regions, markets
4. Creates demo contributor users
5. Generates 125 days of price reports with realistic patterns
6. Adds votes and comments to reports
7. Updates user statistics

---

## Data Generation Algorithm

The demo seeder uses a **deterministic pseudo-random algorithm** to generate realistic data:

```
Price = Base Price + Market Noise + Weekly Seasonality + Trend
```

| Factor | Description |
|--------|-------------|
| Base Price | Fixed reference price per item (e.g., Eggs: RM 13.90) |
| Market Noise | ±5% random variation per market |
| Weekly Seasonality | Sine wave pattern for weekend/weekday differences |
| Trend | Small daily inflation (0.3%) |

Reports are timestamped with realistic shopping hours (7 AM - 9 PM).

---

## Typical Seeding Workflow

### Fresh Development Setup
```bash
# 1. Push migrations
npm run migrate:push

# 2. Seed core items (required)
npm run seed:items

# 3. Optional: Seed demo data for testing
npm run seed:demo
```

### Reset Demo Data
```bash
# Just re-run the demo seeder (it truncates automatically)
npm run seed:demo
```

---

## Extending Seeders

### Adding New Items
Edit `src/server/db/seeds/seed-items.ts`:

```typescript
const seedItems = [
  // ... existing items
  {
    name: "Your New Item",
    slug: "your-new-item",
    category: "vegetable", // or protein, grocery, etc.
    defaultUnit: "kg",
  },
];
```

### Adding New Markets
Edit `src/server/db/seeds/seed-demo-data.ts`:

```typescript
const seedMarketsByRegion = {
  "Your Region": [
    { name: "Market Name", latitude: "1.2345", longitude: "103.4567" },
  ],
  // ... existing regions
};
```

### Adjusting Data Volume
In `seed-demo-data.ts`, modify:
```typescript
const totalDays = 125; // Change to generate more/less history
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Foreign key constraint" errors | Run `npm run migrate:push` first to ensure tables exist |
| Duplicate items | Seeders are idempotent — check if items already exist |
| Demo data too old | Demo data is generated relative to current system time. Re-run to refresh. |
| Need to keep some data | Demo seeder truncates everything — back up data first if needed |

---

## Environment Notes

- **Development:** Use both seeders freely
- **Staging:** Use `seed:items` only; demo data optional
- **Production:** **NEVER** run `seed:demo`. Use `seed:items` only for initial setup.
