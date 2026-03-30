# Repository Guidelines

## Project Structure & Module Organization

This repository currently holds planning docs for the Quota app: [PLAN.md](/home/christian/projects/quota/PLAN.md), [TASKS.md](/home/christian/projects/quota/TASKS.md), and [DEVELOPMENT.md](/home/christian/projects/quota/DEVELOPMENT.md). The intended app structure is a Next.js 14 project with `app/` for routes and API handlers, `components/` for reusable UI, `lib/` for shared utilities and types, and `prisma/` for schema and seed data. Keep route files under `app/**/page.tsx` and API handlers under `app/api/**/route.ts`.

## Build, Test, and Development Commands

Use Node.js 20+.

- `npm install`: install project dependencies after scaffolding.
- `npm run dev`: start the local Next.js dev server on `http://localhost:3000`.
- `npm run build`: create a production build.
- `npm start`: run the production server locally.
- `npx prisma db push`: apply the Prisma schema to the configured database.
- `npm run db:seed`: populate the database from `prisma/seed.ts`.
- `npm run db:studio`: inspect data with Prisma Studio.

## Coding Style & Naming Conventions

Use TypeScript throughout and avoid `any`. Prefer server components by default; add `'use client'` only when browser APIs, hooks, or event handlers are required. Name React components in PascalCase, for example `QuoteCard.tsx` and `AdminQuoteForm.tsx`. Keep route folders lowercase and use Tailwind CSS for styling only; do not introduce CSS modules or inline styles. Import Prisma from `@/lib/prisma` rather than creating new clients in route files.

## Testing Guidelines

The scaffold does not yet include a test runner. When adding tests, keep them next to the feature or under a dedicated `tests/` directory, and mirror the source name, for example `QuoteCard.test.tsx`. At minimum, verify API routes, favorites `localStorage` helpers, and Prisma-backed data flows before opening a PR.

## Commit & Pull Request Guidelines

This workspace is not a Git checkout, so local history is unavailable. Follow the repo’s existing documentation style: short, imperative commit subjects such as `Add quote graph component` or `Implement daily quote route`. PRs should include a concise summary, linked issue or task reference, environment or schema changes, and screenshots for UI work such as `/favorites` or `/admin`.

## Configuration Tips

Set `DATABASE_URL` and `ADMIN_PASSWORD` in `.env`. Never commit real secrets. If you change the Prisma schema, regenerate the client and reseed when needed.
