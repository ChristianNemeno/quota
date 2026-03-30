# Quota — Project Plan

## Overview

A quotes website with a curated browsing experience, tag-based filtering, daily/random quotes, and a unique force-directed graph visualization of your saved favorites.

---

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| ORM | Prisma |
| Database | PostgreSQL |
| Graph | `react-force-graph-2d` |
| Favorites | `localStorage` (no auth) |

---

## Data Model

```prisma
model Quote {
  id        String         @id @default(cuid())
  text      String
  author    String
  tags      TagsOnQuotes[]
  createdAt DateTime       @default(now())
}

model Tag {
  id     String         @id @default(cuid())
  name   String         @unique
  quotes TagsOnQuotes[]
}

model TagsOnQuotes {
  quoteId String
  tagId   String
  quote   Quote  @relation(fields: [quoteId], references: [id])
  tag     Tag    @relation(fields: [tagId], references: [id])
  @@id([quoteId, tagId])
}
```

---

## Project Structure

```
quota/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                      # Home: daily quote + random button
│   ├── quotes/
│   │   └── page.tsx                  # Browse all quotes (paginated)
│   ├── tags/
│   │   └── [tag]/
│   │       └── page.tsx              # Quotes filtered by tag
│   ├── favorites/
│   │   └── page.tsx                  # Force-graph of favorited quotes
│   ├── admin/
│   │   └── page.tsx                  # Admin CRUD UI
│   └── api/
│       ├── quotes/
│       │   ├── route.ts              # GET (list) + POST (create)
│       │   ├── random/route.ts       # GET random quote
│       │   ├── daily/route.ts        # GET today's deterministic quote
│       │   └── [id]/route.ts         # GET / PUT / DELETE single quote
│       └── tags/
│           └── route.ts              # GET all tags with counts
├── components/
│   ├── QuoteCard.tsx                 # Reusable quote display card
│   ├── FavoriteButton.tsx            # Heart toggle (reads/writes localStorage)
│   ├── QuoteGraph.tsx                # react-force-graph-2d canvas graph
│   ├── TagBadge.tsx                  # Clickable tag chip
│   └── AdminQuoteForm.tsx            # Form to add/edit a quote
├── lib/
│   ├── prisma.ts                     # Prisma client singleton
│   └── favorites.ts                  # localStorage helpers
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                       # ~30 curated quotes across 6-8 tags
└── middleware.ts                     # Protect /admin with ADMIN_PASSWORD
```

---

## Pages & Features

### Home (`/`)
- **Daily quote** — deterministic: `hash(YYYY-MM-DD) % totalQuotes`. Same quote all day, no cron needed.
- **Random quote button** — fetches `/api/quotes/random`, animates card swap.
- Tag chips that link to `/tags/[tag]`.

### Browse (`/quotes`)
- Paginated grid of quote cards (20 per page).
- Tag filter sidebar.
- Each card has a favorite (heart) button.

### Tag page (`/tags/[tag]`)
- All quotes with that tag, same card layout.

### Favorites Graph (`/favorites`)
- Reads favorite IDs from `localStorage`.
- Fetches full quote data via `/api/quotes?ids=...`.
- Renders a force-directed graph with `react-force-graph-2d`:
  - **Nodes** — each favorited quote (colored by primary tag).
  - **Edges** — drawn between quotes sharing at least one tag.
  - **Hover** — shows author + truncated quote text.
  - **Click** — opens a modal with the full quote.

### Admin (`/admin`)
- Protected by `middleware.ts` checking `ADMIN_PASSWORD` from a cookie/header.
- Table of all quotes with edit and delete actions.
- Form to add a new quote with tag multi-select (creates tags on the fly).

---

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/quotes` | List quotes — supports `?tag=`, `?ids=`, `?page=`, `?limit=` |
| POST | `/api/quotes` | Create a quote (admin) |
| GET | `/api/quotes/random` | One random quote |
| GET | `/api/quotes/daily` | Today's deterministic quote |
| GET | `/api/quotes/[id]` | Single quote by ID |
| PUT | `/api/quotes/[id]` | Update quote (admin) |
| DELETE | `/api/quotes/[id]` | Delete quote (admin) |
| GET | `/api/tags` | All tags with quote counts |

---

## Implementation Order

1. Scaffold Next.js 14 app (TypeScript, Tailwind, App Router)
2. Install Prisma + `@prisma/client`, configure `schema.prisma`
3. Write `prisma/seed.ts` and populate the database
4. Implement API routes
5. Build `lib/prisma.ts` and `lib/favorites.ts`
6. Build components: `QuoteCard`, `FavoriteButton`, `TagBadge`
7. Build pages: Home → Browse → Tag → Favorites Graph → Admin
8. Build `QuoteGraph.tsx` with force layout and tag-based edges
9. Build `AdminQuoteForm.tsx` + admin page
10. Add `middleware.ts` for admin protection
11. Design polish — typography, dark mode, responsive layout
