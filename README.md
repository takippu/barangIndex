# GroceryIndex

> Community-Powered Grocery Price Intelligence Platform

## What is GroceryIndex?

**GroceryIndex** is a **civic technology** platform that empowers consumers with real-time, community-verified grocery price data. It operates as a crowdsourced marketplace of price information where shoppers can track prices, discover deals, and contribute to an open, transparent database of grocery prices across different markets and regions.

Think of it as a "Waze for grocery prices" — instead of traffic data, the community contributes price data that helps everyone make better shopping decisions.

### Core Concept
- **Community-Powered**: Prices are submitted and verified by everyday shoppers
- **Open Data**: All price information is transparent and accessible
- **Real-Time**: Track price movements and trends as they happen
- **Free Forever**: Built as a public good with no hidden fees

---

## What is the Aim?

### Mission
To **democratize grocery price information** and empower consumers with transparent, actionable data that helps them make informed shopping decisions while promoting fair pricing across markets.

### Key Objectives

1. **Price Transparency**: Break down information barriers by making grocery prices visible and comparable across different markets and regions

2. **Consumer Empowerment**: Give shoppers the data they need to:
   - Find the best deals in their area
   - Track price trends over time
   - Make informed purchasing decisions
   - Save money on their grocery bills (avg. 15% savings)

3. **Community Building**: Create a trusted community of contributors who:
   - Submit price reports while shopping
   - Verify reports from other community members
   - Earn reputation and recognition for contributions
   - Help fellow citizens make better choices

4. **Civic Impact**: Serve as a public good that:
   - Promotes fair competition among retailers
   - Provides open data for researchers and policymakers
   - Supports economic transparency at the grassroots level
   - Remains free and accessible to everyone

---

## 🌟 Features

### Core Features
- **🔍 Price Search** - Find real-time prices for groceries across multiple markets
- **📊 Price Index** - Track historical price trends with interactive charts
- **📝 Submit Reports** - Contribute prices from your local market in seconds
- **✅ Community Verification** - Crowdsourced verification ensures data accuracy (1 verification needed)
- **🔔 Smart Alerts** - Get notified when prices change or your reports are verified
- **🏆 Gamification** - Earn badges and reputation as you contribute

### Civic Tech Features
- **📡 Open Data** - All price data is transparent and accessible
- **🤝 Community Driven** - Built by the community, for the community
- **🔒 Privacy First** - No personal data sold or shared
- **🌐 Public Good** - Free forever for all users

---

## ⚠️ Current Limitations

| Limitation | Details |
|------------|---------|
| **Items** | Currently seeded with 10 core grocery items (expandable) |
| **Verification** | Reports need **1 community verification** to be marked as verified |
| **Regions** | Limited to Malaysia regions (Klang Valley, Penang, Johor Bahru) |
| **Auth** | Google OAuth only (email/password coming soon) |

---

## 🔮 Future Roadmap

| Feature | Status | Description |
|---------|--------|-------------|
| **Admin Management** | Planned | Dashboard for moderators to manage items, markets, and verify reports |
| **PWA Support** | Planned | Installable web app with offline support and push notifications |
| **Email/Password Auth** | Planned | Alternative to Google OAuth |
| **Price Alerts** | Planned | Get notified when specific items drop below target prices |
| **Market Comparison** | Planned | Side-by-side price comparison across multiple markets |
| **API Access** | Planned | Public API for researchers and developers |

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| **Backend** | Next.js API Routes, tRPC-style API pattern |
| **Database** | PostgreSQL 15, Drizzle ORM |
| **Authentication** | Better Auth (OAuth 2.0 with Google) |
| **UI Components** | Material Symbols, Custom Components |
| **Deployment** | Docker-ready, PM2 compatible |

---

## 📦 Prerequisites

- **Node.js** >= 20.0.0
- **PostgreSQL** >= 15.0
- **Bun** or **npm**
- **Google OAuth Credentials** (for authentication)

---

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/groceryindex.git
cd groceryindex
```

### 2. Install Dependencies

```bash
# Using Bun (recommended)
bun install

# Or using npm
npm install
```

### 3. Environment Configuration

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/groceryindex

# Better Auth
BETTER_AUTH_SECRET=your-secret-key-min-32-characters-long
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 4. Database Setup

```bash
# 1. Sync database schema (Critical step to create tables)
npm run migrate:push

# 2. Seed Data
# Option A: Seed only core data (Items, Regions) - For production/clean state
npm run seed:items

# Option B: Seed demo data (Includes core data + 120 days of history) - For development
npm run seed:demo
```

📚 **Learn more:** See [docs/SEEDERS.md](docs/SEEDERS.md) for detailed information about seeders and data generation.

### 5. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

---

## 🏗️ Build for Production

```bash
# Type check
npm run typecheck

# Build
npm run build

# Start production server
npm start
```

---

## 🐳 Docker Deployment

### Using Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/groceryindex
      - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
      - BETTER_AUTH_URL=${BETTER_AUTH_URL}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=groceryindex
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Using PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start npm --name "groceryindex" -- start

# Save PM2 config
pm2 save
pm2 startup
```

---

## 📁 Project Structure

```
groceryindex/
├── app/                      # Next.js App Router
│   ├── api/                 # API Routes
│   │   ├── auth/           # Better Auth endpoints
│   │   └── v1/             # API v1 endpoints
│   ├── (routes)/           # Page routes
│   └── layout.tsx          # Root layout
├── src/
│   ├── components/         # React components
│   │   ├── *.tsx          # Screen components
│   │   └── ui/            # UI components
│   ├── lib/               # Utility libraries
│   ├── server/            # Server-side code
│   │   ├── auth/          # Auth utilities
│   │   ├── db/            # Database schema & client
│   │   └── *.ts           # Server utilities
│   └── data/              # Static data
├── public/                # Static assets
├── drizzle/               # Database migrations
├── docs/                  # Documentation
│   ├── SEEDERS.md        # Database seeders guide
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

## 🔐 Authentication Flow

1. User clicks "Sign in with Google"
2. Better Auth initiates OAuth flow
3. On success, user is created/updated in database
4. Session cookie is set
5. New users are redirected to **Onboarding** (once only)
6. Existing users go to **Home**

### Protected Routes

All routes except the following require authentication:
- `/` - Landing page
- `/login` - Login page
- `/onboarding` - Onboarding flow
- `/markets` - Markets list (public view)
- `/api/auth/*` - Auth endpoints

---

## 🎯 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/sign-in/social` | Social login (Google) |
| POST | `/api/auth/sign-out` | Sign out |
| GET | `/api/auth/session` | Get current session |

### Core API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/items` | List all items |
| GET | `/api/v1/markets` | List all markets |
| GET | `/api/v1/regions` | List all regions |
| GET | `/api/v1/price-index/[itemId]` | Get price index for item |
| POST | `/api/v1/price-reports` | Submit price report |
| GET | `/api/v1/price-reports/feed` | Get community feed |
| POST | `/api/v1/price-reports/[id]/vote` | Vote on report |
| POST | `/api/v1/price-reports/[id]/verify` | Verify report |
| GET | `/api/v1/notifications` | Get user notifications |
| GET | `/api/v1/profile/me` | Get user profile |
| GET | `/api/v1/badges` | Get user badges |
| GET | `/api/v1/community/pulse` | Get community stats |

---

## 🎨 Design System

### Colors
- **Primary**: Sky Blue (`#0ea5e9`) to Cyan (`#06b6d4`)
- **Success**: Emerald (`#10b981`)
- **Warning**: Amber (`#f59e0b`)
- **Error**: Rose (`#f43f5e`)
- **Background**: Slate 50 (`#f8fafc`)

### Typography
- **Font Family**: Inter, Plus Jakarta Sans
- **Icons**: Material Symbols (Rounded, Filled)

### Design Principles
- **Soft UI**: Subtle shadows, rounded corners, gentle gradients
- **Civic Tech**: Clean, trustworthy, transparent
- **Fintech**: Data-driven, professional, reliable
- **Mobile-First**: Responsive design for all screen sizes

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [docs/SEEDERS.md](docs/SEEDERS.md) | Database seeders guide and data generation details |
| [docs/DESIGN.md](docs/DESIGN.md) | Design system and UI guidelines |
| [docs/BACKEND_GUIDELINES.md](docs/BACKEND_GUIDELINES.md) | Backend development guidelines |

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Standards
- TypeScript for all new code
- Follow existing component patterns
- Use Tailwind CSS for styling
- Write meaningful commit messages

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with love for the community
- Inspired by civic tech movements worldwide
- Data powered by contributors like you

---

## 📞 Support

For support, email support@groceryindex.my or join our community Discord.

---

<p align="center">
  <strong>Built for the community. Powered by transparency.</strong>
</p>
