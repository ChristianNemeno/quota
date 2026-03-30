# Quota — Development Guide

## Prerequisites

- Node.js 20+
- npm or pnpm
- PostgreSQL running locally (or a remote connection string)

---

## 1. Clone & Install

```bash
git clone <your-repo>
cd quota
npm install
```

---

## 2. Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

```env
# .env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/quota"
ADMIN_PASSWORD="your-secret-password"
```

The `ADMIN_PASSWORD` is used to protect the `/admin` route via middleware.

---

## 3. Database Setup

### Create the database

```bash
createdb quota
# or in psql:
# CREATE DATABASE quota;
```

### Push schema and run migrations

```bash
npx prisma db push
```

### Seed initial quotes

```bash
npm run db:seed
```

This runs `prisma/seed.ts` which inserts ~30 curated quotes across tags like:
`philosophy`, `humor`, `motivation`, `science`, `literature`, `stoicism`, `creativity`, `wisdom`

### Open Prisma Studio (optional GUI)

```bash
npm run db:studio
```

---

## 4. Run the Dev Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## 5. Project Structure Overview

```
app/            Next.js App Router pages and API routes
components/     Reusable React components
lib/            Shared utilities (Prisma client, localStorage helpers)
prisma/         Schema and seed script
middleware.ts   Admin route protection
```

---

## 6. Key Files

| File | Purpose |
|------|---------|
| `lib/prisma.ts` | Singleton Prisma client (avoids connection exhaustion in dev) |
| `lib/favorites.ts` | localStorage helpers: `getFavorites()`, `toggleFavorite(id)`, `isFavorite(id)` |
| `components/QuoteCard.tsx` | Main quote display — accepts `quote` prop with `text`, `author`, `tags[]` |
| `components/QuoteGraph.tsx` | Force-directed graph of favorited quotes; edges = shared tags |
| `components/FavoriteButton.tsx` | Heart icon that syncs with localStorage |
| `app/api/quotes/daily/route.ts` | Returns the same quote all day using `hash(date) % count` |
| `prisma/seed.ts` | Run via `npm run db:seed` to populate the database |
| `middleware.ts` | Checks `ADMIN_PASSWORD` cookie before allowing access to `/admin` |

---

## 7. API Reference

All responses are JSON.

### List quotes
```
GET /api/quotes
GET /api/quotes?tag=stoicism
GET /api/quotes?page=2&limit=20
GET /api/quotes?ids=clx1,clx2,clx3
```

### Random quote
```
GET /api/quotes/random
```

### Daily quote (changes once per day)
```
GET /api/quotes/daily
```

### Single quote
```
GET /api/quotes/:id
```

### Create quote (admin)
```
POST /api/quotes
Content-Type: application/json

{
  "text": "The only way to do great work is to love what you do.",
  "author": "Steve Jobs",
  "tags": ["motivation", "work"]
}
```

### Update quote (admin)
```
PUT /api/quotes/:id
Content-Type: application/json

{ "text": "...", "author": "...", "tags": ["..."] }
```

### Delete quote (admin)
```
DELETE /api/quotes/:id
```

### List tags
```
GET /api/tags
```

Returns: `[{ "id": "...", "name": "stoicism", "_count": { "quotes": 5 } }]`

---

## 8. Favorites Graph

The graph on `/favorites`:

1. Reads quote IDs from `localStorage` under the key `quota_favorites`
2. Fetches full data for those IDs: `GET /api/quotes?ids=id1,id2,...`
3. Builds a graph where:
   - Each quote is a **node** (colored by its primary/first tag)
   - Two nodes get an **edge** if they share at least one tag
4. Uses `react-force-graph-2d` for canvas-based rendering
5. Hover a node → tooltip with author + truncated text
6. Click a node → modal with full quote and tags

---

## 9. Admin Panel

Visit `/admin` in the browser.

You'll be prompted for the admin password (set in `.env` as `ADMIN_PASSWORD`).

From the admin panel you can:
- View all quotes in a table
- Add a new quote (text, author, tags — new tags are created automatically)
- Edit any existing quote
- Delete a quote

---

## 10. Building for Production

```bash
npm run build
npm start
```

Make sure `DATABASE_URL` in your production environment points to your hosted PostgreSQL instance (e.g. Supabase, Railway, Neon).

---

## 11. Common Issues

### Prisma client not generated
```bash
npx prisma generate
```

### Database connection refused
Make sure PostgreSQL is running and `DATABASE_URL` is correct. On macOS:
```bash
brew services start postgresql
```
On Linux:
```bash
sudo systemctl start postgresql
```

### Graph not rendering
`react-force-graph-2d` uses the Canvas API — it requires a browser environment. The graph component must be loaded with `dynamic(() => import(...), { ssr: false })` to avoid SSR errors.

### Admin redirect loop
Clear the `admin_token` cookie in your browser's DevTools, then re-enter the password.
