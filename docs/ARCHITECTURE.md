# Architecture baseline

This document describes the current baseline after structural cleanup.

## High level

- `goodreadsapi.client`: frontend experience and temporary mock adapters.
- `GoodReadsAPI.Server`: API backend that will replace mock adapters incrementally.

## Frontend architecture

- Domain model source of truth: `goodreadsapi.client/src/types/index.ts`
- Adapter boundary: `goodreadsapi.client/src/services/api/*`
- Temporary storage/mocks: `goodreadsapi.client/src/services/api/mock/*`

The migration strategy is to keep UI and contexts stable while replacing adapter internals.

## Backend architecture

- `Controllers`: thin HTTP layer
- `Contracts`: request/response DTOs
- `Domain`: entities and domain rules
- `Application`: use cases
- `Infrastructure`: persistence and external integrations

## Cross-project conventions

- Keep API route prefix under `/api`.
- Return UTC timestamps in ISO format.
- Keep stable string IDs.
- Preserve locale-aware text contract where needed (`es`, `en`).

## Build and workflow

- Frontend and backend are decoupled for development speed.
- CI validates each app independently.
- Integration happens through HTTP contracts, not direct project coupling.
