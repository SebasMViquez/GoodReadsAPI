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

## Temporary current user resolution (`/api/me`)

Until backend auth is implemented, endpoints that depend on current user context read:

- Header: `X-User-Id`
- Fallback query parameter: `userId`

## Continuous codex docs

- `docs/codex/WORKLOG.md`
- `docs/codex/BUILD_LOG.md`
