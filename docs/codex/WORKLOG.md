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
