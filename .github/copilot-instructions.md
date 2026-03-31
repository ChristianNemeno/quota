# Quota — Copilot Instructions

## Build & Development Commands

```bash
npm run dev          # Start dev server at localhost:3000
npm run build        # Production build
npm run lint         # Run ESLint
npx prisma db push   # Apply schema changes to database
npm run db:seed      # Populate database from prisma/seed.ts
npm run db:studio    # Open Prisma Studio GUI
```

After schema changes, regenerate the client with `npx prisma generate`.

## Architecture

**Stack**: Next.js 14 (App Router) + Prisma + PostgreSQL + Tailwind CSS

**Data model** uses a many-to-many relationship between quotes and tags via the `TagsOnQuotes` join table. Quotes are the core entity; tags are created on-the-fly when adding quotes.

**Key architectural patterns**:

- **Server components by default** — Add `'use client'` only for browser APIs, hooks, or event handlers
- **Prisma singleton** — Import from `@/lib/prisma`, never instantiate `PrismaClient` directly
- **Favorites via localStorage** — No auth; favorites are stored client-side under key `quota_favorites` using helpers in `lib/favorites.ts`
- **Admin protection** — `middleware.ts` checks for `admin_token` cookie against `ADMIN_PASSWORD` env var

**API response format**: API routes return a flattened structure where `tags` is an array of `{ id, name }` objects (not the raw Prisma join table structure). See `toQuoteResponse()` in `app/api/quotes/route.ts`.

## Key Conventions

- **TypeScript throughout** — Avoid `any`. Use types from `lib/types.ts` (`Quote`, `Tag`, `TagWithCount`, `GraphNode`, `GraphLink`)
- **Component naming** — PascalCase files matching component name: `QuoteCard.tsx`, `AdminQuoteForm.tsx`
- **Route folders** — Lowercase: `app/quotes/`, `app/tags/[tag]/`, `app/admin/`
- **Styling** — Tailwind only; no CSS modules or inline style objects (exception: animation-specific styles)
- **Tags are normalized** — Trimmed, lowercased, and deduplicated before storage

## Environment Variables

Required in `.env`:
- `DATABASE_URL` — PostgreSQL connection string
- `ADMIN_PASSWORD` — Password for `/admin` access (stored as `admin_token` cookie)
