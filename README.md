# Cadence

One app that tracks and manages your product marketing channels — built for Facets to track founder/employee LinkedIn content pointers, posting cadence, and LinkedIn Health.

## Stack

- Next.js 16 (App Router, Server Actions)
- Prisma + Postgres
- Tailwind v4, claymorphic UI

## Local development

```bash
npm install
npx prisma migrate dev
npm run dev
```

Requires a `DATABASE_URL` in `.env` pointing at a Postgres database (e.g. a free [Neon](https://neon.tech) project).

## Deployment

Configured for both:

- **Vercel** — zero-config Next.js deploy. Set `DATABASE_URL` in the project's Environment Variables.
- **Render** — deploy via the included `render.yaml` blueprint (New → Blueprint, point at this repo). Set `DATABASE_URL` when prompted.

Both should point at the same hosted Postgres database.
