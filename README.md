# Tangled Up In Who?

A Bob Dylan character-matching quiz. Drag (or tap) each character card onto
the song it's from, race the clock across 10 questions, and post your
initials to the Hall of Fame leaderboard.

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Prisma ORM** targeting **PostgreSQL**
- Deploy target: **Railway** (Postgres plugin + a Next.js service)

## Local development

### 1. Install dependencies

```bash
npm install
```

This also runs `prisma generate` (via `postinstall`), which generates the
Prisma Client into `app/generated/prisma` (gitignored — regenerated on every
install).

### 2. Get a Postgres database

Pick one:

- **Prisma's local dev database** (no Docker/Postgres install required):

  ```bash
  npx prisma dev
  ```

  This prints a connection string like
  `postgres://postgres:postgres@localhost:PORT/template1?sslmode=disable`.
  Put that in `.env` as `DATABASE_URL`.

- **Your own local/hosted Postgres** — set `DATABASE_URL` in `.env` to its
  connection string.

Copy `.env.example` to `.env` and fill in `DATABASE_URL`:

```bash
cp .env.example .env
```

### 3. Run migrations

```bash
npx prisma migrate deploy
```

(Use `npx prisma migrate dev` instead if you're actively changing
`prisma/schema.prisma` and want Prisma to generate a new migration file.)

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

- `lib/data.ts` — the hardcoded question pool (`DATA`, `ALL_SONGS`).
- `lib/quiz.ts` — quiz logic: picking questions, building answer options,
  shuffling, time formatting.
- `lib/prisma.ts` — Prisma Client singleton, configured with the
  `@prisma/adapter-pg` driver adapter (required by Prisma 7 — connection URLs
  are no longer read from `schema.prisma` at runtime).
- `components/` — game UI (`GameApp`, `QuizGame`, `QuestionCard`,
  `ResultsScreen`, `Leaderboard`).
- `app/api/scores/route.ts` — `POST` a finished run (initials, score,
  timeMs).
- `app/api/scores/leaderboard/route.ts` — `GET` the top 10 scores.
- `prisma/schema.prisma` — the `ScoreEntry` model.

## Deploying to Railway

1. **Create a new Railway project** from this repo (or push this repo to
   GitHub first, then "Deploy from GitHub repo" in Railway).

2. **Add a Postgres plugin** to the project (`+ New` → `Database` →
   `PostgreSQL`). Railway provisions it and exposes a `DATABASE_URL`
   variable on that plugin's service.

3. **On the Next.js app service**, set the environment variable:

   | Variable       | Value                                                                 |
   | -------------- | ---------------------------------------------------------------------|
   | `DATABASE_URL` | Reference the Postgres plugin's URL, e.g. `${{Postgres.DATABASE_URL}}` |

   (Railway lets you reference another service's variable directly in the
   variable's value field — click "Add Reference" and pick the Postgres
   plugin's `DATABASE_URL`.)

4. **Build command** (Railway → service → Settings → Build):

   ```bash
   npm run build
   ```

   (`npm install` runs first automatically and triggers `postinstall` →
   `prisma generate`, so the Prisma Client is always regenerated for the
   build.)

5. **Start command** (Settings → Deploy):

   ```bash
   npx prisma migrate deploy && npm run start
   ```

   This applies any pending migrations before the server starts on every
   deploy. (If your Railway plan exposes a separate "Pre-Deploy Command"
   field, you can instead put `npx prisma migrate deploy` there and leave
   the start command as `npm run start` — functionally equivalent.)

6. **Deploy.** Railway will build and boot the service; the Postgres schema
   is created/updated by the migration step above on first boot.

### Env var summary

| Variable       | Where it's set             | Purpose                        |
| -------------- | --------------------------- | ------------------------------- |
| `DATABASE_URL` | Railway Postgres plugin (referenced by the app service) | Postgres connection string used by Prisma |

## Notes

- Sign-in isn't part of this app — the quiz and leaderboard submission work
  fully anonymously. `ScoreEntry.userId` exists in the schema as an unused,
  nullable column reserved for a future account layer.
- Score submission is always allowed (classic arcade style); the leaderboard
  view caps at the top 10 by score (desc), then time (asc) as the tiebreaker.
