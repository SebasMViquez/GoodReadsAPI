# Worklog

## 2026-04-11

### Added

- Supabase configuration model and DI wiring.
- Full backend vertical for `books`:
  - Domain entity (`Book`, `LocalizedText`)
  - DTO contracts (`SaveBookRequest`, `BookResponse`, `LocalizedTextDto`)
  - Application interface/service (`IBookService`, `BookService`)
  - Infrastructure repository (`IBookRepository`, `SupabaseBookRepository`)
  - Supabase REST client abstraction (`ISupabaseRestClient`, `SupabaseRestClient`)
  - API controller (`BooksController`) with CRUD endpoints
- Supabase SQL setup script for `books` table.
- Codex continuous documentation folder and policy.
- `UserSecretsId` in backend project to store Supabase secrets safely.

### Changed

- `Program.cs` updated to register Supabase options, HTTP client, repository, and service.
- `appsettings.json` and `appsettings.Development.json` now include `Supabase` section.
- `.http` file updated with catalog API calls.
- Server README updated with user-secrets setup commands.

### Notes

- This phase enables real persistence against Supabase PostgREST for books.
- Next phases should mirror this pattern for `authors`, `reviews`, `users`, auth sessions, and library state.

## 2026-04-11

### Added

- Swagger/OpenAPI support for backend endpoint exploration:
  - `Swashbuckle.AspNetCore` package reference.
  - API explorer and Swagger generator registration in DI.
  - Swagger middleware/UI enabled in `Development`.

### Changed

- `Program.cs` now maps root `/` to `/swagger` in `Development` for quicker local API testing.
- `Program.cs` returns a simple health-style message on `/` outside `Development`.
- Server README now documents Swagger URL for local testing.

### Notes

- This change keeps controllers as the source of truth for endpoint contracts while improving local testing flow.
