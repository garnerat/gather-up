# Bro Weekends - Project Documentation

## Tech Stack
- Next.js 15 with React 19
- Prisma ORM with Neon Postgres (via Vercel)
- Tailwind CSS
- TypeScript

## Database Commands

### Push schema to Neon Postgres
```bash
npm run db:push
```
Pushes the Prisma schema to the connected Neon Postgres database. Run this after schema changes or for initial setup.

### Generate Prisma client
```bash
npx prisma generate
```
Regenerates the Prisma client after schema changes. This runs automatically during `npm run build`.

### Pull Vercel environment variables
```bash
npx vercel env pull .env.local
```
Downloads `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING` from Vercel to local `.env.local`.

## Environment Variables
- `POSTGRES_PRISMA_URL` - Pooled connection string (uses pgBouncer) for queries
- `POSTGRES_URL_NON_POOLING` - Direct connection for migrations
- `NEXT_PUBLIC_BASE_URL` - Base URL for generating invite links

## Deployment
The build script automatically runs `prisma generate` before building Next.js. Database schema changes require running `npm run db:push` separately.
