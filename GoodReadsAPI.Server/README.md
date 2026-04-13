# GoodReadsAPI Server

ASP.NET Core Web API for GoodReads, connected to Supabase (PostgREST) for persistence.

## Current status

- Health endpoint ready: `GET /api/health`
- Books CRUD ready: `GET/POST/PUT/DELETE /api/books`
- Book by slug ready: `GET /api/books/slug/{slug}`
- Users and social graph endpoints ready:
  - `GET /api/users`
  - `GET /api/users/{username}`
  - `GET /api/users/{userId}/followers`
  - `GET /api/users/{userId}/following`
  - `POST /api/users/{targetUserId}/follow`
  - `DELETE /api/users/{targetUserId}/follow`
- Me/library social endpoints ready:
  - `PUT /api/me/profile`
  - `GET /api/me/follow-requests`
  - `POST /api/me/follow-requests/{requestId}/accept`
  - `POST /api/me/follow-requests/{requestId}/decline`
  - `GET /api/me/library`
  - `PUT /api/me/library/books/{bookId}/shelf`
  - `PUT /api/me/library/books/{bookId}/favorite`
  - `PUT /api/me/library/books/{bookId}/progress`
  - `GET /api/me/library/favorites/following`
- Swagger UI ready in development: `GET /swagger`
- Social data model migration scripts ready (users, follows, library, reviews, activity, messages, notifications)

## Layers

```text
GoodReadsAPI.Server/
  Controllers/
  Contracts/
  Domain/
  Application/
  Infrastructure/
  Configuration/
```

## Supabase setup

1. Run SQL bootstrap script:
   - `GoodReadsAPI.Server/Database/Sql/001_books.sql`
   - `GoodReadsAPI.Server/Database/Sql/002_social_core.sql`
   - `GoodReadsAPI.Server/Database/Sql/005_supabase_auth_alignment.sql` (auth/users alignment)
2. Optional catalog seed (bulk, SQL editor):
   - `GoodReadsAPI.Server/Database/Sql/003_authors_bulk_seed.sql`
   - `GoodReadsAPI.Server/Database/Sql/004_books_bulk_seed.sql`
   - Both files include a sample JSON payload. Replace it with your full catalog before running.
3. Configure secrets:

```json
"Supabase": {
  "Url": "https://your-project-ref.supabase.co",
  "ServiceRoleKey": "<service-role-key>",
  "Schema": "public",
  "BooksTable": "books",
  "UsersTable": "users",
  "UserFollowsTable": "user_follows",
  "FollowRequestsTable": "follow_requests",
  "UserBookLibraryTable": "user_book_library"
},
"SupabaseAuth": {
  "Enabled": false,
  "Authority": "https://your-project-ref.supabase.co/auth/v1",
  "Audience": "authenticated",
  "RequireHttpsMetadata": true,
  "AllowLegacyUserIdFallback": true
}
```

Recommended: keep `ServiceRoleKey` in user-secrets or environment variables.

Example with user-secrets:

```bash
dotnet user-secrets set "Supabase:Url" "https://your-project-ref.supabase.co" --project GoodReadsAPI.Server
dotnet user-secrets set "Supabase:ServiceRoleKey" "<service-role-key>" --project GoodReadsAPI.Server
```

## Run locally

```bash
dotnet restore
dotnet run
```

Swagger local URLs:

- `http://localhost:5068/swagger`
- `https://localhost:7039/swagger`

## Auth behavior (`/api/me` and follow mutations)

Protected endpoints:

- `POST /api/users/{targetUserId}/follow`
- `DELETE /api/users/{targetUserId}/follow`
- All `/api/me/*` endpoints

Authentication strategy:

- Hybrid scheme picks `Bearer` token when present.
- If `SupabaseAuth.AllowLegacyUserIdFallback=true`, requests can still authenticate using `X-User-Id` (or `userId` query) for migration environments.
- If `SupabaseAuth.AllowLegacyUserIdFallback=false`, protected endpoints require valid `Authorization: Bearer <supabase-access-token>`.
- During JWT validation, backend maps `sub` (auth user id) to app profile id (`public.users.id`) via `auth_user_id` and adds claim `app_user_id` when found.

## Current user resolution

Current user resolution order:

1. JWT claim `app_user_id` (derived from `auth_user_id` mapping when available).
2. JWT claim `sub`.
3. Header `X-User-Id` (legacy fallback, only if `AllowLegacyUserIdFallback=true`).
4. Query parameter `userId` (legacy fallback, only if `AllowLegacyUserIdFallback=true`).

This allows incremental migration from local mock sessions to Supabase Auth.

## Continuous codex docs

- `docs/codex/WORKLOG.md`
- `docs/codex/BUILD_LOG.md`
