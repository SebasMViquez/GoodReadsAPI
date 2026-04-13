# Backend Endpoint Matrix

Fecha: 2026-04-11

Este documento traduce el flujo actual del frontend a contratos API backend.

## Convenciones

- Prefijo: `/api`
- Fechas: ISO UTC (`timestamptz`)
- IDs: `text` estables (compatibles con seeds actuales)
- Localized fields: JSON `{ "en": "...", "es": "..." }`
- Auth para endpoints protegidos:
  - `Authorization: Bearer <supabase-token>` (preferido)
  - `X-User-Id`/`userId` solo mientras `SupabaseAuth.AllowLegacyUserIdFallback=true`

## Estado Actual

- Implementado:
  - `GET /api/health`
  - `GET /api/books`
  - `GET /api/books/{id}`
  - `GET /api/books/slug/{slug}`
  - `POST /api/books`
  - `PUT /api/books/{id}`
  - `DELETE /api/books/{id}`
  - `GET /api/users`
  - `GET /api/users/{username}`
  - `GET /api/users/{userId}/followers`
  - `GET /api/users/{userId}/following`
  - `POST /api/users/{targetUserId}/follow` (`[Authorize]`)
  - `DELETE /api/users/{targetUserId}/follow` (`[Authorize]`)
  - `PUT /api/me/profile` (`[Authorize]`)
  - `GET /api/me/follow-requests` (`[Authorize]`)
  - `POST /api/me/follow-requests/{requestId}/accept` (`[Authorize]`)
  - `POST /api/me/follow-requests/{requestId}/decline` (`[Authorize]`)
  - `GET /api/me/library` (`[Authorize]`)
  - `PUT /api/me/library/books/{bookId}/shelf` (`[Authorize]`)
  - `PUT /api/me/library/books/{bookId}/favorite` (`[Authorize]`)
  - `PUT /api/me/library/books/{bookId}/progress` (`[Authorize]`)
  - `GET /api/me/library/favorites/following` (`[Authorize]`)
- Pendiente:
  - Todo lo demás del flujo social/library/profile/messaging/settings.

## Fase 1 (Catálogo y usuarios)

### Books

- `GET /api/books`
- `GET /api/books/{id}`
- `GET /api/books/slug/{slug}`

Sugerencia de producto:

- Para usuario final, usar solo GET.
- Mantener escrituras de libros como admin/internal o seed SQL.

### Authors

- `GET /api/authors`
- `GET /api/authors/{id}`

### Users

- `GET /api/users?query=&visibility=&page=&size=`
- `GET /api/users/{username}`
- `GET /api/users/{userId}/followers`
- `GET /api/users/{userId}/following`

### Profile (current user)

- `PUT /api/me/profile`
- `PUT /api/me/account/email`
- `PUT /api/me/account/password`

## Fase 2 (Social graph y biblioteca)

### Follows

- `POST /api/users/{targetUserId}/follow`
- `DELETE /api/users/{targetUserId}/follow`
- `GET /api/me/follow-requests`
- `POST /api/me/follow-requests/{requestId}/accept`
- `POST /api/me/follow-requests/{requestId}/decline`

### Library

- `GET /api/me/library`
- `PUT /api/me/library/books/{bookId}/shelf` body: `{ "shelfStatus": "want-to-read|currently-reading|read" }`
- `PUT /api/me/library/books/{bookId}/favorite` body: `{ "isFavorite": true|false }`
- `PUT /api/me/library/books/{bookId}/progress` body: `{ "progress": 0-100 }`

## Fase 3 (Reviews y actividad)

### Reviews

- `GET /api/reviews?bookId=&userId=&sort=&page=&size=`
- `POST /api/reviews`
- `PUT /api/reviews/{reviewId}`
- `DELETE /api/reviews/{reviewId}`
- `POST /api/reviews/{reviewId}/likes`
- `DELETE /api/reviews/{reviewId}/likes`
- `POST /api/reviews/{reviewId}/comments`
- `GET /api/reviews/{reviewId}/comments`

### Activity Feed

- `GET /api/activity?scope=all|following|reviews|reading|social&page=&size=`
- `POST /api/activity/{activityId}/likes`
- `DELETE /api/activity/{activityId}/likes`
- `POST /api/activity/{activityId}/comments`
- `GET /api/activity/{activityId}/comments`

## Fase 4 (Mensajes y notificaciones)

### Conversations / Messages

- `GET /api/me/conversations`
- `POST /api/me/conversations` body: `{ "partnerUserId": "..." }`
- `GET /api/me/conversations/{conversationId}/messages`
- `POST /api/me/conversations/{conversationId}/messages`
- `POST /api/me/conversations/{conversationId}/seen`

### Notifications

- `GET /api/me/notifications`
- `POST /api/me/notifications/mark-all-read`

## Fase 5 (Settings persistidas)

- `GET /api/me/settings`
- `PUT /api/me/settings/privacy`
- `PUT /api/me/settings/notifications`
- `PUT /api/me/settings/appearance`
- `PUT /api/me/settings/language`
- `PUT /api/me/settings/reading`
- `PUT /api/me/settings/security`

## Notas de Alineación con Front

- `ProfilePage`, `ReadersPage`, `SearchPage(tab=users)` dependen de búsqueda de usuarios y grafo social.
- `BookDetailsPage` depende de relaciones usuario-libro y reviews.
- `CommunityPage` depende de feed social con interacciones.
- `NotificationsPage` depende de follow requests + eventos sociales.
- `MessagesPage` depende de conversaciones y mensajes persistidos.

