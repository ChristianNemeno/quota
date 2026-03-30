# Quota — AI Task Execution Guide

## Purpose

This file is a complete, self-contained instruction set for an AI coding agent to implement the Quota quotes website from scratch. Each task includes its exact goal, file paths, inputs, outputs, and dependencies. Tasks must be executed in order unless stated otherwise.

---

## Project Context

**Quota** is a Next.js 14 (App Router) quotes website.

- Users browse, filter, and favorite quotes.
- Favorites are stored in `localStorage` (no user accounts).
- A force-directed graph on `/favorites` visualizes saved quotes as nodes, with edges between quotes that share tags.
- An admin panel at `/admin` allows adding, editing, and deleting quotes.

**Stack:**
- Framework: Next.js 14 (App Router, TypeScript)
- Styling: Tailwind CSS
- ORM: Prisma
- Database: PostgreSQL
- Graph: `react-force-graph-2d`
- Favorites: `localStorage`

**Repo root:** All paths below are relative to the project root (where `package.json` lives).

---

## Conventions

- All components under `components/` are named with PascalCase.
- All pages use the Next.js App Router convention (`app/page.tsx`, `app/quotes/page.tsx`, etc.).
- Server components are the default. Add `'use client'` only when using browser APIs, hooks, or event handlers.
- API routes live under `app/api/` and export named functions `GET`, `POST`, `PUT`, `DELETE`.
- All API responses are JSON via `NextResponse.json(...)`.
- Prisma client is imported from `@/lib/prisma` — never instantiated directly in route files.
- Environment variables: `DATABASE_URL` (PostgreSQL connection string), `ADMIN_PASSWORD` (plain string).
- Do not use `any` types. Use proper TypeScript types throughout.
- Tailwind only — no CSS modules, no inline styles.

---

## Data Types (TypeScript)

These types are used throughout the app. Define them in `lib/types.ts`.

```ts
export type Tag = {
  id: string;
  name: string;
};

export type Quote = {
  id: string;
  text: string;
  author: string;
  createdAt: string;
  tags: Tag[];
};

export type TagWithCount = Tag & {
  _count: { quotes: number };
};

export type GraphNode = {
  id: string;
  text: string;
  author: string;
  tags: Tag[];
  primaryTag: string | null;
};

export type GraphLink = {
  source: string;
  target: string;
  sharedTags: string[];
};
```

---

## Task List

---

### Task 1 — Scaffold Next.js 14 App

**Status:** Do this manually before running other tasks.

**Action:** Run the following in the project root:

```bash
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*"
```

When prompted about React Compiler and AGENTS.md — answer **No** to both.

Then install additional dependencies:

```bash
npm install @prisma/client react-force-graph-2d
npm install -D prisma tsx
```

**Result:** Standard Next.js 14 project with Tailwind, TypeScript, and App Router. Extra packages installed.

---

### Task 2 — Configure Environment Variables

**Files to create:**
- `.env`
- `.env.example`

**`.env` content:**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/quota"
ADMIN_PASSWORD="admin"
```

**`.env.example` content:**
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/quota"
ADMIN_PASSWORD="your-secret-password"
```

**Also:** Ensure `.env` is in `.gitignore` (Next.js scaffold adds this by default — verify it is present).

---

### Task 3 — Write Prisma Schema

**File to create:** `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

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
  quote   Quote  @relation(fields: [quoteId], references: [id], onDelete: Cascade)
  tag     Tag    @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([quoteId, tagId])
}
```

**Also update `package.json`** to add the seed script entry under `"prisma"`:
```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

---

### Task 4 — Run Database Migration

**Prerequisite:** PostgreSQL must be running and `DATABASE_URL` must be set correctly in `.env`.

**Commands to run:**
```bash
npx prisma db push
npx prisma generate
```

**Result:** Database tables created. Prisma client generated at `node_modules/@prisma/client`.

---

### Task 5 — Write Seed Script

**File to create:** `prisma/seed.ts`

**Requirements:**
- Insert exactly 30 quotes into the database.
- Use `prisma.quote.upsert` or clear and re-insert (idempotent).
- Each quote has: `text`, `author`, and an array of 1–3 tag names.
- Tags used across quotes (to create graph edges later): `philosophy`, `stoicism`, `motivation`, `humor`, `science`, `literature`, `creativity`, `wisdom`.
- Tags are created via `upsert` by name so re-seeding is safe.
- At least 5 quotes share the `stoicism` tag, at least 4 share `humor`, etc. so the graph has visible edges.

**Seed script structure:**
```ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const quotes = [
  {
    text: '...',
    author: '...',
    tags: ['stoicism', 'wisdom'],
  },
  // ... 29 more
];

async function main() {
  await prisma.tagsOnQuotes.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.tag.deleteMany();

  for (const q of quotes) {
    await prisma.quote.create({
      data: {
        text: q.text,
        author: q.author,
        tags: {
          create: q.tags.map((name) => ({
            tag: {
              connectOrCreate: {
                where: { name },
                create: { name },
              },
            },
          })),
        },
      },
    });
  }

  console.log('Seeded', quotes.length, 'quotes');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Run with:**
```bash
npx prisma db seed
```

---

### Task 6 — Create Shared Library Files

#### `lib/types.ts`

Define all shared TypeScript types as listed in the **Data Types** section above.

---

#### `lib/prisma.ts`

Prisma client singleton — prevents exhausting connections during Next.js hot reload in development.

```ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ['error'] });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

---

#### `lib/favorites.ts`

localStorage helpers. This file must only be imported in client components (it uses `window`).

```ts
const KEY = 'quota_favorites';

export function getFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function isFavorite(id: string): boolean {
  return getFavorites().includes(id);
}

export function toggleFavorite(id: string): boolean {
  const current = getFavorites();
  const exists = current.includes(id);
  const updated = exists ? current.filter((x) => x !== id) : [...current, id];
  localStorage.setItem(KEY, JSON.stringify(updated));
  return !exists;
}
```

---

### Task 7 — API Route: `/api/quotes`

**File:** `app/api/quotes/route.ts`

**GET `/api/quotes`**

Supports query params:
- `?tag=stoicism` — filter by tag name (case-insensitive)
- `?ids=id1,id2,id3` — fetch specific quotes by comma-separated IDs
- `?page=1` — page number (default: 1)
- `?limit=20` — results per page (default: 20)

Always include tags in the response: `include: { tags: { include: { tag: true } } }`.

Transform the Prisma result to flatten `TagsOnQuotes` into `tags: Tag[]` before returning.

**POST `/api/quotes`**

Request body:
```json
{ "text": "...", "author": "...", "tags": ["stoicism", "wisdom"] }
```

- Validate that `text` and `author` are non-empty strings.
- Tags: use `connectOrCreate` to upsert each tag by name.
- Return the created quote with tags.
- Return 400 if validation fails, 201 on success.

---

### Task 8 — API Route: `/api/quotes/random`

**File:** `app/api/quotes/random/route.ts`

**GET `/api/quotes/random`**

- Count total quotes: `prisma.quote.count()`.
- Pick a random skip: `Math.floor(Math.random() * count)`.
- Fetch one quote with `take: 1, skip: randomSkip`.
- Include tags (flatten as in Task 7).
- Return 404 if no quotes exist.

---

### Task 9 — API Route: `/api/quotes/daily`

**File:** `app/api/quotes/daily/route.ts`

**GET `/api/quotes/daily`**

Returns the same quote all day. Changes at midnight. No external cron needed.

Algorithm:
```ts
function dateHash(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0;
  }
  return hash;
}

const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
const count = await prisma.quote.count();
const skip = dateHash(today) % count;
const quote = await prisma.quote.findFirst({ skip, include: ... });
```

Include tags, flatten, return quote.

---

### Task 10 — API Route: `/api/quotes/[id]`

**File:** `app/api/quotes/[id]/route.ts`

**GET `/api/quotes/[id]`**
- Fetch by ID with tags included.
- Return 404 if not found.

**PUT `/api/quotes/[id]`**
- Body: `{ text?, author?, tags?: string[] }`
- If tags are provided: disconnect all existing tags, then reconnect using `connectOrCreate`.
- Return updated quote with tags.
- Return 404 if quote not found.

**DELETE `/api/quotes/[id]`**
- Delete the quote. Cascade on `TagsOnQuotes` is handled by the schema.
- Return `{ success: true }` on success.
- Return 404 if not found.

---

### Task 11 — API Route: `/api/tags`

**File:** `app/api/tags/route.ts`

**GET `/api/tags`**

```ts
const tags = await prisma.tag.findMany({
  include: { _count: { select: { quotes: true } } },
  orderBy: { quotes: { _count: 'desc' } },
});
```

Return array of `TagWithCount`.

---

### Task 12 — Component: `TagBadge`

**File:** `components/TagBadge.tsx`

- Props: `name: string`, `active?: boolean`, `href?: string`
- Renders as an `<a>` linking to `/tags/[name]` if `href` is not provided.
- Active state: darker background.
- Tailwind classes: small rounded pill, hover effect.

```tsx
import Link from 'next/link';

type Props = { name: string; active?: boolean };

export default function TagBadge({ name, active }: Props) {
  return (
    <Link
      href={`/tags/${name}`}
      className={`inline-block rounded-full px-3 py-1 text-xs font-medium transition-colors
        ${active
          ? 'bg-neutral-800 text-white dark:bg-white dark:text-neutral-900'
          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
        }`}
    >
      {name}
    </Link>
  );
}
```

---

### Task 13 — Component: `FavoriteButton`

**File:** `components/FavoriteButton.tsx`

**Must be `'use client'`.**

- Props: `quoteId: string`
- On mount, reads `isFavorite(quoteId)` from `lib/favorites.ts`.
- On click, calls `toggleFavorite(quoteId)` and updates local state.
- Renders a heart icon (use an SVG or a Unicode `♥`).
- Filled heart when favorited, outline when not.
- Accessible: `aria-label="Add to favorites"` / `"Remove from favorites"`.

---

### Task 14 — Component: `QuoteCard`

**File:** `components/QuoteCard.tsx`

- Props: `quote: Quote` (from `lib/types.ts`)
- Layout:
  - Opening `"` large decorative quotation mark
  - Quote text in a large serif font
  - Author name below (smaller, muted)
  - Row of `TagBadge` components
  - `FavoriteButton` in the top-right corner
- Tailwind: card with border, padding, rounded corners, subtle shadow. Hover lifts slightly.

---

### Task 15 — App Layout and Global Styles

**File:** `app/layout.tsx`

- Import `globals.css`.
- Set `<html lang="en">`.
- Dark mode: add `className` to `<html>` — read from a cookie or default to light. Keep it simple: use Tailwind's `dark` class strategy.
- Render a `<Navbar />` component above `{children}`.
- Navbar links: **Quota** (home, `/`), **Browse** (`/quotes`), **Favorites** (`/favorites`).
- Navbar is a separate component at `components/Navbar.tsx`. It must be `'use client'` if it uses `usePathname` for active link highlighting.

**File:** `app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

### Task 16 — Page: Home (`/`)

**File:** `app/page.tsx`

- Server component.
- Fetch the daily quote: `GET /api/quotes/daily` — call the Prisma query directly (not via fetch, since it's server-side). Import from `lib/prisma.ts` and reuse the `dateHash` logic or extract it to `lib/daily.ts`.
- Display the daily quote using `QuoteCard`.
- Below it, render a `<RandomQuote />` client component (in `components/RandomQuote.tsx`).

**`components/RandomQuote.tsx`** — `'use client'`:
- Button labeled "Random Quote".
- On click: `fetch('/api/quotes/random')`, update state, render the new quote with `QuoteCard`.
- Animate the card swap with a CSS fade (Tailwind `transition-opacity`).

---

### Task 17 — Page: Browse (`/quotes`)

**File:** `app/quotes/page.tsx`

- Server component. Receives `searchParams: { page?: string }`.
- Fetch quotes from Prisma directly (not via fetch):
  - `page` defaults to 1, `limit` = 20.
  - Include tags.
- Fetch all tags from Prisma for the sidebar.
- Layout: two-column on desktop (sidebar left, grid right). Single column on mobile.
- Sidebar: list of all tags as `TagBadge` components.
- Grid: `QuoteCard` for each quote.
- Pagination: Previous / Next links using `?page=` query param.

---

### Task 18 — Page: Tag Filter (`/tags/[tag]`)

**File:** `app/tags/[tag]/page.tsx`

- Server component. Receives `params: { tag: string }`.
- Fetch quotes from Prisma where tag name matches `params.tag`.
- Render grid of `QuoteCard` components.
- Show the active tag name as a heading.
- Include a "Back to all quotes" link to `/quotes`.
- Show a 404-style message if the tag does not exist.

---

### Task 19 — Component: `QuoteGraph`

**File:** `components/QuoteGraph.tsx`

**Must be `'use client'` and loaded with `next/dynamic` (ssr: false) from the page that uses it.**

**Props:**
```ts
type Props = {
  quotes: Quote[];
};
```

**Graph construction:**

```ts
// Nodes: one per quote
const nodes: GraphNode[] = quotes.map((q) => ({
  id: q.id,
  text: q.text,
  author: q.author,
  tags: q.tags,
  primaryTag: q.tags[0]?.name ?? null,
}));

// Edges: connect quotes that share at least one tag
const links: GraphLink[] = [];
for (let i = 0; i < quotes.length; i++) {
  for (let j = i + 1; j < quotes.length; j++) {
    const tagsI = new Set(quotes[i].tags.map((t) => t.name));
    const shared = quotes[j].tags.map((t) => t.name).filter((t) => tagsI.has(t));
    if (shared.length > 0) {
      links.push({ source: quotes[i].id, target: quotes[j].id, sharedTags: shared });
    }
  }
}
```

**Tag color palette** (map tag name → hex color):
```ts
const TAG_COLORS: Record<string, string> = {
  philosophy: '#6366f1',
  stoicism:   '#8b5cf6',
  motivation: '#f59e0b',
  humor:      '#10b981',
  science:    '#3b82f6',
  literature: '#ec4899',
  creativity: '#f97316',
  wisdom:     '#14b8a6',
};
const DEFAULT_COLOR = '#94a3b8';
```

**Rendering with `react-force-graph-2d`:**
- `nodeColor`: use `TAG_COLORS[node.primaryTag] ?? DEFAULT_COLOR`.
- `nodeLabel`: `"${node.author}: ${node.text.slice(0, 60)}..."`.
- `onNodeClick`: set selected node in state, open a modal.
- `linkColor`: `'#e2e8f0'` (light gray).
- `nodeRelSize`: 6.
- Set `width` and `height` to fill the container (use `useRef` on a wrapper div and `ResizeObserver` or `window.innerWidth/Height`).

**Modal:** When a node is clicked, show a centered overlay with the full quote text, author, and tags. Click outside or press Escape to close.

---

### Task 20 — Page: Favorites Graph (`/favorites`)

**File:** `app/favorites/page.tsx`

**Must be `'use client'`.**

- On mount: read favorite IDs from `localStorage` via `getFavorites()`.
- If no favorites: render an empty state — "No favorites yet. Browse quotes and heart the ones you love." with a link to `/quotes`.
- If favorites exist: `fetch('/api/quotes?ids=' + ids.join(','))` to get full quote data.
- Dynamically import `QuoteGraph`:
  ```ts
  const QuoteGraph = dynamic(() => import('@/components/QuoteGraph'), { ssr: false });
  ```
- Render `<QuoteGraph quotes={quotes} />` inside a full-height container.
- Show a loading state while fetching.

---

### Task 21 — Component: `AdminQuoteForm`

**File:** `components/AdminQuoteForm.tsx`

**Must be `'use client'`.**

**Props:**
```ts
type Props = {
  initial?: { id: string; text: string; author: string; tags: string[] };
  onSuccess: () => void;
};
```

- Fields: `text` (textarea), `author` (text input), `tags` (text input, comma-separated, e.g. `"stoicism, wisdom"`).
- On submit:
  - If `initial` is provided → `PUT /api/quotes/[initial.id]`.
  - Otherwise → `POST /api/quotes`.
  - Parse tags by splitting on comma and trimming.
- Call `onSuccess()` after a successful save.
- Show inline error on failure.
- Include a Cancel button that calls `onSuccess()` without saving.

---

### Task 22 — Page: Admin (`/admin`)

**File:** `app/admin/page.tsx`

**Must be `'use client'`.**

- On mount: fetch all quotes from `/api/quotes?limit=1000` (no pagination for admin).
- Layout:
  - Header: "Admin" title + "Add Quote" button.
  - When "Add Quote" is clicked: show `AdminQuoteForm` with no initial values.
  - Table of quotes: columns — Quote (truncated to 60 chars), Author, Tags (badges), Actions.
  - Actions column: "Edit" button (shows `AdminQuoteForm` pre-filled), "Delete" button (calls `DELETE /api/quotes/[id]`, confirms with `window.confirm` first).
- After any form success or delete: refetch the quote list.

---

### Task 23 — Admin Route Protection

**File:** `middleware.ts` (in the project root, next to `package.json`)

- Intercept all requests to `/admin` (but not `/admin/login`).
- Check for a cookie named `admin_token`. If its value equals `process.env.ADMIN_PASSWORD`, allow the request.
- Otherwise, redirect to `/admin/login`.

```ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value;
  if (token === process.env.ADMIN_PASSWORD) return NextResponse.next();
  return NextResponse.redirect(new URL('/admin/login', req.url));
}

export const config = {
  matcher: ['/admin/:path*'],
};
```

**File:** `app/admin/login/page.tsx`

**Must be `'use client'`.**

- Simple centered form with a password input.
- On submit: POST to `/api/admin/login`.

**File:** `app/api/admin/login/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin_token', password, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}
```

After successful login, redirect the user to `/admin`.

---

### Task 24 — Polish

**Requirements:**

1. **Typography** — Quote text uses a serif font (`font-serif` Tailwind class). UI chrome uses the default sans-serif. Large quotes get `text-2xl` or `text-3xl`.

2. **Dark mode** — Tailwind `dark:` variants throughout. Toggle button in `Navbar` that adds/removes `dark` class on `<html>` and persists to `localStorage`.

3. **Responsive layout** — Browse page sidebar collapses on mobile (hidden by default, shown via toggle or just removed — sidebar tags become a horizontal scrollable strip). Graph page takes full viewport height.

4. **Random quote animation** — When random quote loads, briefly set `opacity-0` then `opacity-100` with a CSS transition.

5. **Empty states** — All pages handle zero-results gracefully.

6. **Loading states** — Client components show a skeleton or spinner while fetching.

---

## Verification Checklist

Run through these manually after completing all tasks:

- [ ] `npx prisma db seed` runs without errors and inserts 30 quotes
- [ ] `GET /api/quotes` returns paginated quotes with tags
- [ ] `GET /api/quotes?tag=stoicism` returns only stoicism quotes
- [ ] `GET /api/quotes/random` returns a different quote on repeated calls (usually)
- [ ] `GET /api/quotes/daily` returns the **same** quote across multiple calls on the same day
- [ ] Visit `/` — daily quote is displayed, random quote button works and animates
- [ ] Visit `/quotes` — grid of cards, tag sidebar filters correctly, pagination works
- [ ] Visit `/tags/stoicism` — shows only stoicism quotes
- [ ] Heart several quotes on `/quotes`, then visit `/favorites` — graph renders with nodes and edges
- [ ] Click a graph node — modal shows full quote
- [ ] Visit `/admin/login`, enter password — redirected to `/admin`
- [ ] In `/admin`: add a new quote, edit an existing one, delete one
- [ ] Verify deleted quote no longer appears on `/quotes`
- [ ] Dark mode toggle persists across page navigation
