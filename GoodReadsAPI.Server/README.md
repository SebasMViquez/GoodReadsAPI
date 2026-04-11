# GoodReadsAPI Server

ASP.NET Core Web API for GoodReads, connected to Supabase (PostgREST) for persistence.

## Current status

- Health endpoint ready: `GET /api/health`
- Books CRUD ready: `GET/POST/PUT/DELETE /api/books`
- Book by slug ready: `GET /api/books/slug/{slug}`

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
   - `docs/codex/supabase/001_books.sql`
2. Configure secrets:

```json
"Supabase": {
  "Url": "https://your-project-ref.supabase.co",
  "ServiceRoleKey": "<service-role-key>",
  "Schema": "public",
  "BooksTable": "books"
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

## Continuous codex docs

- `docs/codex/WORKLOG.md`
- `docs/codex/BUILD_LOG.md`
