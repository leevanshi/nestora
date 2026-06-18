<div align="center">

<img src="./artifacts/realestate/public/opengraph.jpg" alt="Nestora — real estate listing platform" width="100%" />

# 🏡 Nestora

**A full-stack real estate listing platform — browse, search, save, and list properties.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-149ECA?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Drizzle_ORM-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://orm.drizzle.team/)
[![pnpm](https://img.shields.io/badge/pnpm-workspaces-F69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](#license)

</div>

---

## Overview

Nestora is a type-safe, full-stack real estate listing portal. Buyers and renters can browse a catalogue of properties, filter by price, bedrooms, type, and status, save favorites, and view rich listing detail pages — while property owners can list a home of their own through a validated submission form.

Under the hood, the project is a **pnpm monorepo** with a single source of truth for the API contract (an OpenAPI spec), from which both the server-side validation and the client-side React Query hooks are code-generated — so the frontend and backend can never drift out of sync.

## ✨ Features

- **Browse & search** — keyword search across title, address, and city, with filters for price range, minimum bedrooms, property type, status, and city
- **Listing detail pages** — full property specs: price, beds/baths, square footage, year built, parking, amenities, and photo gallery
- **Save / unsave listings** — one-click favoriting backed by a dedicated `saved_listings` join table
- **Submit a listing** — validated multi-field form (React Hook Form + Zod) for creating new property listings
- **Market stats & featured/recent rails** — aggregate stats (average price, counts by status/type) and curated featured + recently-added carousels on the homepage
- **Type-safe, end-to-end** — one OpenAPI spec generates both server-side Zod validators and a fully-typed React Query client, so request/response shapes are guaranteed to match
- **Polished UI** — Tailwind CSS 4 + shadcn/ui (Radix primitives) component library with responsive layouts and subtle Framer Motion interactions

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4, shadcn/ui (Radix), wouter (routing), TanStack Query, React Hook Form |
| Backend | Node.js 24, Express 5, Pino (structured logging) |
| Database | PostgreSQL, Drizzle ORM, `drizzle-zod` |
| API contract | OpenAPI 3.1 spec → **Orval** codegen → Zod schemas + React Query hooks |
| Tooling | pnpm workspaces, TypeScript project references, esbuild |

## 🏗️ Architecture

The monorepo is split into `artifacts/` (deployable apps) and `lib/` (shared, generated, and internal packages). The OpenAPI spec is the single source of truth: it is compiled once and consumed by both the server and the client, so there is no hand-written, duplicated API typing on either side.

```mermaid
flowchart TB
    subgraph Spec["📄 lib/api-spec"]
        OAS["openapi.yaml<br/>(source of truth)"]
    end

    subgraph Codegen["⚙️ Orval codegen"]
        direction LR
        OAS --> ZOD["@workspace/api-zod<br/>Zod schemas & types"]
        OAS --> CLIENT["@workspace/api-client-react<br/>React Query hooks"]
    end

    subgraph Frontend["🖥️ artifacts/realestate"]
        UI["React 19 + Vite + Tailwind<br/>Pages: Home · Listings · Detail · Saved · Submit"]
    end

    subgraph Backend["🔧 artifacts/api-server"]
        EXPRESS["Express 5 routes<br/>/listings · /saved-listings · /healthz"]
    end

    subgraph Data["🗄️ lib/db"]
        DRIZZLE["Drizzle ORM"]
        PG[("PostgreSQL")]
        DRIZZLE --> PG
    end

    CLIENT --> UI
    ZOD --> EXPRESS
    UI <-->|"fetch via\ntyped hooks"| EXPRESS
    EXPRESS --> DRIZZLE

    style OAS fill:#1e293b,color:#fff,stroke:#475569
    style PG fill:#336791,color:#fff,stroke:#1e3a5f
    style UI fill:#149ECA,color:#fff,stroke:#0c5d7a
    style EXPRESS fill:#2d2d2d,color:#fff,stroke:#000
```

### Request flow — saving a listing

A concrete walk-through of one user action, showing how the generated client, the Express router, Zod validation, and Drizzle all cooperate:

```mermaid
sequenceDiagram
    actor User
    participant UI as React UI<br/>(ListingCard)
    participant Hook as useSaveListing()<br/>(generated hook)
    participant API as Express<br/>/api/saved-listings
    participant Zod as Zod validator
    participant DB as Drizzle ORM
    participant PG as PostgreSQL

    User->>UI: clicks ♥ on a listing
    UI->>Hook: mutate({ listingId })
    Hook->>API: POST /api/saved-listings
    API->>Zod: SaveListingBody.safeParse(body)
    Zod-->>API: ✅ parsed data
    API->>DB: select listing by id
    DB->>PG: SELECT ... WHERE id = $1
    PG-->>DB: listing row
    DB-->>API: listing found
    API->>DB: insert into saved_listings
    DB->>PG: INSERT ... RETURNING *
    PG-->>DB: saved row
    DB-->>API: saved row
    API-->>Hook: 201 Created + saved listing
    Hook-->>UI: invalidate cache, show toast
    UI-->>User: "Saved to your listings"
```

### Data model

```mermaid
erDiagram
    LISTINGS {
        serial id PK
        text title
        text description
        integer price
        text address
        text city
        text state
        text zip
        integer bedrooms
        numeric bathrooms
        integer sqft
        text property_type
        text status
        text_array images
        integer year_built
        integer parking_spots
        text_array features
        boolean is_featured
        timestamp created_at
        timestamp updated_at
    }

    SAVED_LISTINGS {
        serial id PK
        integer listing_id FK
        timestamp created_at
    }

    LISTINGS ||--o{ SAVED_LISTINGS : "saved as"
```

## 📁 Project structure

```
real-estate-listing/
├── artifacts/
│   ├── realestate/          # Frontend — React + Vite + Tailwind app ("Nestora")
│   │   └── src/
│   │       ├── pages/        # home, listings, listing-detail, saved-listings, submit-listing
│   │       └── components/   # layout (Navbar, Footer), listing (ListingCard), ui (shadcn/ui)
│   ├── api-server/           # Backend — Express 5 REST API
│   │   └── src/
│   │       └── routes/       # health, listings, saved-listings
│   └── mockup-sandbox/       # Internal Replit design-preview sandbox
├── lib/
│   ├── api-spec/             # openapi.yaml — single source of truth + Orval config
│   ├── api-zod/               # Generated Zod request/response schemas
│   ├── api-client-react/      # Generated TanStack Query hooks
│   └── db/                    # Drizzle ORM schema & Postgres connection
└── scripts/                   # Misc workspace scripts
```

## 🚀 Getting started

### Prerequisites

- Node.js 24+
- pnpm
- A PostgreSQL database

### Installation

```bash
git clone https://github.com/leevanshi/real-estate-listing.git
cd real-estate-listing
pnpm install
```

### Configure the environment

The API server requires a Postgres connection string:

```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/nestora"
export PORT=5000
```

### Set up the database

```bash
pnpm --filter @workspace/db run push
```

### Run it

```bash
# Backend — API server on $PORT
pnpm --filter @workspace/api-server run dev

# Frontend — Vite dev server (defaults to localhost:5173)
pnpm --filter @workspace/realestate run dev
```

### Regenerate the API client (after editing the OpenAPI spec)

```bash
pnpm --filter @workspace/api-spec run codegen
```

## 🔌 API reference

All routes are mounted under `/api`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/healthz` | Health check |
| `GET` | `/listings` | List/search listings — supports `search`, `minPrice`, `maxPrice`, `minBedrooms`, `propertyType`, `status`, `city` |
| `POST` | `/listings` | Create a new listing |
| `GET` | `/listings/stats` | Aggregate market statistics (average price, counts by status/type) |
| `GET` | `/listings/featured` | Up to 6 featured listings |
| `GET` | `/listings/recent` | Most recently added listings (`limit` query param) |
| `GET` | `/listings/:id` | Get a single listing |
| `PATCH` | `/listings/:id` | Update a listing |
| `DELETE` | `/listings/:id` | Delete a listing |
| `GET` | `/saved-listings` | List all saved listings (joined with listing data) |
| `POST` | `/saved-listings` | Save a listing |
| `DELETE` | `/saved-listings/:id` | Remove a saved listing |

## 🛠️ Available scripts

| Command | Description |
|---|---|
| `pnpm run typecheck` | Typecheck across all packages |
| `pnpm run build` | Typecheck + build all packages |
| `pnpm --filter @workspace/api-server run dev` | Run the API server |
| `pnpm --filter @workspace/realestate run dev` | Run the frontend dev server |
| `pnpm --filter @workspace/api-spec run codegen` | Regenerate API hooks & Zod schemas from the OpenAPI spec |
| `pnpm --filter @workspace/db run push` | Push DB schema changes (dev only) |

## 🤝 Contributing

Contributions are welcome! Fork the repo, create a feature branch, and open a pull request. For non-trivial changes, please open an issue first to discuss what you'd like to change.

## 📄 License

Licensed under the [MIT License](./LICENSE).
