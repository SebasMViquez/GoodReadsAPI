# GoodReads Frontend

React + Vite + TypeScript frontend for the GoodReadsAPI project.

## What this client is today

- Product UI and routes are already implemented.
- State is currently backed by seeded/mock data.
- API adapters exist under `src/services/api` and can be replaced incrementally with real HTTP clients.

## Main stack

- React 18
- Vite 5
- TypeScript
- React Router
- Framer Motion
- Vitest + Testing Library
- ESLint

## Project structure

```text
goodreadsapi.client/
  src/
    components/
    context/
    data/
    i18n/
    layouts/
    pages/
    routes/
    services/
      api/
      monitoring/
      session/
      storage/
    styles/
    test/
    types/
```

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run test
npm run test:run
```

## Data and backend mode

The frontend still runs with mock/local persistence.

- Seed data: `src/data/*`
- API facade: `src/services/api/*`
- Mock state persistence: `src/services/api/mock/*`

## Backend handoff

Backend integration contract is documented in:

- `BACKEND_HANDOFF.md`

Use that document to implement server endpoints and replace adapters module by module.
