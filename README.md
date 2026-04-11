# GoodReadsAPI

Monorepo with:

- `goodreadsapi.client`: React + Vite frontend (currently mock driven)
- `GoodReadsAPI.Server`: ASP.NET Core Web API backend (base scaffold to start real features)

## Current project status

- Frontend has complete navigation and product flows with seeded/local data.
- Backend is now cleaned from template boilerplate and ready for domain-first implementation.
- Structure is prepared to integrate both parts without rewriting the frontend.

## Repository structure

```text
GoodReadsAPI/
  goodreadsapi.client/     # Frontend app
  GoodReadsAPI.Server/     # Backend API
  docs/                    # Project docs and architecture notes
```

## Requirements

- .NET SDK 10
- Node.js 20+
- npm 10+

## Quick start

### Frontend

```bash
cd goodreadsapi.client
npm install
npm run dev
```

### Backend

```bash
cd GoodReadsAPI.Server
dotnet restore
dotnet run
```

Default health endpoint:

```text
GET /api/health
```

## Useful docs

- `docs/ARCHITECTURE.md`
- `docs/codex/README.md`
- `goodreadsapi.client/README.md`
- `goodreadsapi.client/BACKEND_HANDOFF.md`
- `GoodReadsAPI.Server/README.md`
