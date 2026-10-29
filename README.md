# Rimjhim Pizzeria — Web App, POS & Admin Platform

> **Live Restaurant Operating System** for Rimjhim Pizzeria (Commercial Area, Satellite Town, Bahawalpur).  
> Built as a single TypeScript Next.js application that powers three distinct sides connected to a shared database:
> 1. **Customer Ordering Website** (`/`) — Mobile-first, animated, cart, bottom-sheet item customizer, checkout, WhatsApp click-to-chat, and live status tracker.
> 2. **Owner Live Orders & POS Panel** (`/owner`) — Live orders Kanban board with sound bell alert, touch POS register with 80mm thermal receipt printing, daily sales reports, customer CRM, and cash drawer shifts.
> 3. **Admin Panel** (`/admin`) — Full control of menu items, sold-out switches, bulk percentage price adjustments, delivery zones, and store hours.

---

## Brand & Design System

Sampled directly from the Rimjhim Pizzeria menu boards:
- **Charcoal** (`#393A3C` / `#2A2B2D`): Dark page background, POS touch register.
- **Warm Amber** (`#F8AC32`): Price tags, highlights, active category indicators.
- **Rimjhim Red** (`#DD2928`): Primary action buttons, cart badges, branding.
- **Deal Orange** (`#F47729`): Deal ribbons, special promotions.
- **Fresh Lime** (`#BECF31`): Open now indicator, success states.
- **Typography**: *Oswald* & *Bebas Neue* for headings and bold prices; *Inter* for clean body text.

---

## Project Structure

```
rimjhim-pizzeria/
├── app/
│   ├── (site)/                  # Customer Ordering Website
│   │   ├── page.tsx             # Animated hero, categories, Deal of the Day, bestsellers
│   │   ├── menu/page.tsx        # Sticky category bar, live search, filter tags, item cards
│   │   ├── checkout/page.tsx    # Delivery/Pickup, phone validation, zones, GPS pin, COD
│   │   ├── order/[orderNo]/     # Order confirmation with instant WhatsApp launch
│   │   ├── track/[orderNo]/     # Live status timeline (Received -> Prep -> Ready -> Out)
│   │   └── my-orders/page.tsx   # Order lookup by order number or phone
│   ├── owner/                   # Owner & Counter Portal
│   │   ├── orders/page.tsx      # Live Kanban board with audio chime alert
│   │   ├── pos/page.tsx         # Fast touch POS register + 80mm thermal receipt printing
│   │   ├── reports/page.tsx     # Today's sales, average order value, online vs counter
│   │   ├── customers/page.tsx   # Customer CRM directory & order frequency
│   │   └── shifts/page.tsx      # Register open/close & cash drawer reconciliation
│   ├── admin/                   # Store Admin Portal
│   │   ├── menu/page.tsx        # Items, variants, instant sold-out switches
│   │   ├── prices/page.tsx      # Bulk percentage price adjuster with preview
│   │   ├── zones/page.tsx       # Delivery zones, fees, and minimum orders
│   │   └── settings/page.tsx    # Store hours, 4 AM business day cut-off, order acceptance
│   └── api/                     # REST & SSE API Handlers
│       ├── menu/route.ts        # Cached categories, items, modifiers
│       ├── store/route.ts       # Store open/closed status & zones
│       ├── orders/route.ts      # Atomic order placement & WhatsApp link generator
│       ├── shifts/route.ts      # Active shift totals & cash close
│       └── stream/orders/route.ts # Server-Sent Events (SSE) for live order updates
├── components/
│   ├── navbar.tsx               # Header with phone pill, timings, and cart badge
│   ├── menu/                    # ItemCard, ItemModal with size & modifier choices
│   └── cart/                    # CartDrawer with minimum order warning, FloatingCartBar
├── lib/
│   ├── initial-data.ts          # Complete menu dataset (14 pizzas, 25 foods, 8 drinks, 15 deals)
│   ├── mock-db.ts               # Shared database layer with order lifecycle state machine
│   ├── order-number.ts          # Atomic per-day counter (RP-YYMMDD-NNN) with 4 AM cut-off
│   ├── whatsapp.ts              # Formatted WhatsApp click-to-chat payload builder
│   ├── format.ts                # Whole rupees (Rs) and Pakistani phone formatters
│   └── store.ts                 # Zustand client cart store with localStorage persistence
├── prisma/
│   ├── schema.prisma            # 21 PostgreSQL tables with enums, relations, and indexes
│   └── seed.ts                  # Comprehensive menu seed script
├── docker-compose.yml           # App + PostgreSQL 16 + Nightly backup container
└── Dockerfile                   # Multi-stage production container build
```

---

## Getting Started

### 1. Development Mode
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the customer site.

### 2. Live Portals
- **Customer Site**: `http://localhost:3000/`
- **Menu**: `http://localhost:3000/menu`
- **Owner Live Orders Board**: `http://localhost:3000/owner/orders`
- **POS Touch Register**: `http://localhost:3000/owner/pos`
- **Sales Analytics & Reports**: `http://localhost:3000/owner/reports`
- **Cash Shifts & Day Close**: `http://localhost:3000/owner/shifts`
- **Admin Menu & Sold Out**: `http://localhost:3000/admin/menu`
- **Admin Bulk Price Adjuster**: `http://localhost:3000/admin/prices`

### 3. Production Deployment with Docker Compose
```bash
docker compose up -d --build
```
This starts:
- The Next.js web application on port `3000`
- PostgreSQL 16 database on port `5432` with persistent volumes
- Automated nightly backup service writing `.dump` archives to `./backups`
