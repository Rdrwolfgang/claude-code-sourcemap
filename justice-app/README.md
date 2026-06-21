# Shelby Justice Tracker

A production-ready public transparency web app for Shelby County, Tennessee criminal justice data. Search defendants, track judge decisions, analyze DA Mulroy's 30th Judicial District prosecutions, and identify patterns across Memphis courts.

## Features

- **Defendant Search** — Search by name, view full case history with charges, bonds, dispositions, and hearing timelines
- **Judge Dashboard** — All Shelby County Criminal Court, Circuit Court, and General Sessions judges with live stats (case volume, violent case rates, avg bond, guilty plea rates, dismissal rates)
- **Case Explorer** — Filterable/sortable table of all cases by court, severity, outcome, year, and violent flag
- **Analytics & Charts** — Recharts visualizations: cases by year, charge severity breakdown, disposition patterns, judge volume comparisons
- **DA Office Focus** — Steve Mulroy / 30th Judicial District case tracking, ADA breakdowns, high-profile cases, nolle pros rates
- **CSV Export** — Download cases and judges as CSV for research/advocacy
- **Methodology & Data Sources** — Full transparency on collection methods, limitations, and official source links
- **Dark mode, responsive, accessible** — Tailwind CSS with professional dark theme

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Server Components) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Charts | Recharts 2 |
| Database | SQLite (Prisma ORM) → drop-in PostgreSQL upgrade |
| Icons | Lucide React |
| Runtime | Bun |

## Quick Start

```bash
cd justice-app
bun install

# Set up environment
cp .env.example .env
# Default uses SQLite — no external DB needed

# Initialize database and seed with Shelby County data
bunx prisma migrate dev --name init
bun run prisma/seed.ts

# Run development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
bun run dev          # Next.js dev server with HMR
bun run build        # Production build
bun run start        # Production server
bun run db:migrate   # Run Prisma migrations
bun run db:seed      # Seed database (prisma/seed.ts)
bun run db:studio    # Prisma Studio DB browser
```

## Project Structure

```
justice-app/
├── prisma/
│   ├── schema.prisma          # Data model (Judge, Defendant, Case, Charge, Hearing)
│   └── seed.ts                # Shelby County seed data (27 judges, 150 sample cases)
├── src/
│   ├── app/
│   │   ├── page.tsx           # Home page with search + stats
│   │   ├── defendants/        # Search + detail pages
│   │   ├── judges/            # Dashboard + per-judge detail
│   │   ├── cases/             # Explorer + case detail
│   │   ├── analytics/         # Charts and aggregate stats
│   │   ├── da-office/         # DA Mulroy prosecutorial data
│   │   ├── methodology/       # How data is collected
│   │   ├── data-sources/      # Official source links
│   │   └── api/               # REST API routes
│   │       ├── defendants/    # GET /api/defendants?q=...
│   │       ├── judges/        # GET /api/judges?court=...
│   │       ├── cases/         # GET /api/cases (filters)
│   │       ├── analytics/     # GET /api/analytics
│   │       └── export/        # GET /api/export?type=cases&format=csv
│   ├── components/
│   │   ├── layout/            # Header, Footer
│   │   ├── search/            # GlobalSearch with live results
│   │   ├── charts/            # Recharts wrappers
│   │   └── ui/                # Badge, StatCard, Pagination, LegalTooltip, Disclaimer
│   ├── lib/
│   │   ├── db.ts              # Prisma singleton
│   │   └── utils.ts           # Formatters, color helpers, legal glossary
│   └── types/index.ts         # Shared TypeScript interfaces
```

## Data Model

```
Judge → Cases → Charges
                     ↓
              Defendants (many-to-many via CaseDefendant)
              Hearings
```

- **Judge**: name, division, court, party, bio, isActive
- **Case**: caseNumber, court, county, status, judge, prosecutor, DA office, isHighProfile
- **Charge**: description, severity (Felony A/B/C, Misdemeanor, Violation), isViolent, isDrugRelated, disposition, bondAmount, sentence
- **Hearing**: hearingDate, hearingType, outcome
- **Defendant**: name, DOB, race, sex, city

## Seeded Judges (27 total)

**Criminal Court (Divs 1–15):** Felicia Corbin-Johnson, James Lammey, Jennifer Mitchell, Carolyn Wade, Chris Craft, John Campbell, Paula Skahan, Cyndy Becker, Lee Coffee, Glenn Wright, Mark Ward, J. Robert Carter, William Anderson, Royce Taylor, Michael Peters

**General Sessions (Divs 1–9):** Melissa Boyd, Gerald Skahan, Louis Montesi, Kathleen Gomes, Gary Gober, Rachel Tenpenny, Tanika White, Bill Anderson, Joy Touliatos

**Circuit Court (Divs 1–3):** James F. Russell, Gina Higgins, Robert Sammons

## Migrating to PostgreSQL

1. In `prisma/schema.prisma`, change:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Set `DATABASE_URL` to your Postgres connection string
3. Run `bunx prisma migrate dev`

Also re-enable `mode: "insensitive"` in all API `where` clauses for case-insensitive search.

## Extending to Other Counties

Each `Case` and `Defendant` record has `county` and `state` fields. To add a new jurisdiction:

1. Add judges to the seed with the correct `court` and `division`
2. Import case data via CSV upload (see `/methodology` page for format)
3. Set `county`/`state` on all imported records
4. Filter by county using the Cases API `?county=Hamilton` parameter

## Official Data Sources

| Source | URL |
|---|---|
| Shelby County CJS Portal | https://cjs.shelbycountytn.gov |
| DA Office (Mulroy) | https://www.shelbycountytn.gov/185/District-Attorney |
| TN Court Info | https://tncrtinfo.com |
| Criminal Court Clerk | https://www.shelbycountytn.gov/219/Criminal-Court-Clerk |
| TDOC Offender Lookup | https://foil.app.tn.gov/foil/search.jsp |

## Disclaimer

This application aggregates **publicly available court records only**. It is not legal advice, not affiliated with any government agency, and data may be incomplete or delayed. Charges do not imply guilt. All individuals have presumption of innocence. For authoritative records, consult official Shelby County court portals.

## Deployment

**Vercel + Supabase (recommended):**
1. Push to GitHub
2. Connect repo to Vercel
3. Add `DATABASE_URL` (Supabase PostgreSQL) to Vercel environment variables
4. Deploy — Vercel runs `bunx prisma generate` on build

**Docker:**
```dockerfile
FROM oven/bun:1
WORKDIR /app
COPY . .
RUN bun install
RUN bunx prisma generate
RUN bun run build
EXPOSE 3000
CMD ["bun", "run", "start"]
```
