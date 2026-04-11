# Backend handoff for frontend integration

This document defines the first backend contract expected by the current frontend.

## Current frontend assumptions

- Catalog data is read from in-memory seed modules.
- Auth/library/social state is persisted in browser storage.
- Domain types live in `src/types/index.ts`.

## Suggested API base path

- `/api`

## Suggested first endpoint set

### Health

- `GET /api/health`

### Catalog

- `GET /api/books`
- `GET /api/books/{bookId}`
- `GET /api/books/slug/{slug}`
- `GET /api/authors`
- `GET /api/authors/{authorId}`
- `GET /api/reviews`
- `GET /api/reviews/{reviewId}`

### Auth and profile

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `GET /api/users/me`
- `GET /api/users/{userId}`

### Library

- `GET /api/library/me`
- `PUT /api/library/me/shelves`
- `PUT /api/library/me/progress`
- `PUT /api/library/me/favorites`

### Social

- `GET /api/conversations/me`
- `POST /api/conversations/{conversationId}/messages`
- `GET /api/notifications/me`
- `PATCH /api/notifications/{notificationId}/read`
- `POST /api/follow-requests`
- `PATCH /api/follow-requests/{requestId}`

## Contract notes

- Keep response IDs as stable strings to match current frontend model types.
- Keep locale-aware text shape where frontend currently expects `Record<'es' | 'en', string>`.
- Return ISO-8601 UTC timestamps.

## Incremental migration plan

1. Replace read-only catalog endpoints first.
2. Replace auth/session flows.
3. Replace library persistence.
4. Replace conversations and notifications.
5. Remove seed modules once all adapters are HTTP based.
