# Worklog

## 2026-04-11

### Added

- Frontend flow and architecture audit:
  - `docs/FRONTEND_FLOW_AUDIT.md`
  - Detailed mapping of real product flow (profile, follows, library, reviews, activity, notifications, messages).
- Backend endpoint roadmap aligned to current UI flow:
  - `docs/BACKEND_ENDPOINT_MATRIX.md`
- Supabase SQL expansion for social domain:
  - `GoodReadsAPI.Server/Database/Sql/002_social_core.sql`
  - `GoodReadsAPI.Server/Database/Sql/003_authors_bulk_seed.sql`
  - `GoodReadsAPI.Server/Database/Sql/004_books_bulk_seed.sql`
- Restored messaging page in frontend:
  - `goodreadsapi.client/src/pages/MessagesPage.tsx`
  - Supports conversation list, start via `?user=username`, send messages, mark seen, unread badges.

### Changed

- `docs/ARCHITECTURE.md` now references the new frontend audit and backend endpoint matrix.
- `GoodReadsAPI.Server/README.md` now documents SQL execution order for social schema and bulk seeds.

### Notes

- This iteration focuses on structural readiness before full adapter migration from mock persistence to backend APIs.
- Books creation by end users remains discouraged at product level; bulk seed scripts are now available for catalog loading.

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
- Moved SQL bootstrap script from `docs/codex/supabase/` to `GoodReadsAPI.Server/Database/Sql/` to keep `docs/codex` documentation-only.

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

## 2026-04-11

### Added

- Frontend catalog bootstrap now supports backend hydration from `GET /api/books`.
- Fallback strategy to seeded data if API call fails or mock mode is enabled.

### Changed

- `goodreadsapi.client/src/services/api/catalog.ts` now exposes `hydrateCatalogFromApi()` and keeps derived catalog views (`featured`, `trending`, `editor picks`, `genre labels`) synchronized after remote load.
- `goodreadsapi.client/src/main.tsx` now runs catalog bootstrap before rendering React app.
- `goodreadsapi.client/.env.example` switched to `VITE_USE_MOCK_API=false` for backend-first testing.

### Notes

- This integration updates only catalog read paths (books list/by-id/by-slug) and keeps auth/library/social flows on existing mocks.

## 2026-04-11

### Added

- Frontend development testing page for Supabase persistence:
  - Route: `/dev/books-lab` (development only).
  - Supports create/list/delete book operations against backend `api/books`.

### Changed

- Router now registers the dev-only books lab route.
- Frontend can validate DB writes from UI without using Swagger.
- Backend `.http` file now includes ready-to-run create/read/delete requests for `books`.

### Notes

- This page is intended only for local verification and can be removed once full product flows are connected.

## 2026-04-11

### Changed

- Frontend catalog API defaults now target backend in development mode without requiring `.env`:
  - default `VITE_API_BASE_URL` fallback: `http://localhost:5068`
  - default `VITE_USE_MOCK_API`: `false`
- `.env.example` updated to HTTP local backend for easier browser testing.

### Notes

- This removes the "API base not configured / mock=true" blocker when testing the existing product flow locally.

### Added

- Fixed `004_books_bulk_seed.sql` JSON payload (missing comma between book objects).
- Expanded `003_authors_bulk_seed.sql` from 1 to 10 authors to match all `authorId` values used in books seed.

### Notes

- Both payloads now parse as valid JSON.
- Author coverage now fully matches the books seed (`authorId` references resolved).

## 2026-04-11

### Added

- Backend social core implementation for user-user and user-book relationships:
  - `GoodReadsAPI.Server/Application/Interfaces/ISocialGraphService.cs`
  - `GoodReadsAPI.Server/Application/Interfaces/IUserLibraryService.cs`
  - `GoodReadsAPI.Server/Application/Interfaces/IUserService.cs`
  - `GoodReadsAPI.Server/Application/Services/SocialGraphService.cs`
  - `GoodReadsAPI.Server/Application/Services/UserLibraryService.cs`
  - `GoodReadsAPI.Server/Application/Services/UserService.cs`
  - `GoodReadsAPI.Server/Infrastructure/Repositories/IUserRepository.cs`
  - `GoodReadsAPI.Server/Infrastructure/Repositories/IUserRelationshipRepository.cs`
  - `GoodReadsAPI.Server/Infrastructure/Repositories/IUserLibraryRepository.cs`
  - `GoodReadsAPI.Server/Infrastructure/Repositories/SupabaseUserRepository.cs`
  - `GoodReadsAPI.Server/Infrastructure/Repositories/SupabaseUserRelationshipRepository.cs`
  - `GoodReadsAPI.Server/Infrastructure/Repositories/SupabaseUserLibraryRepository.cs`
- New domain entities/contracts/controllers for social and library endpoints:
  - `User`, `UserFollow`, `FollowRequest`, `UserBookLibraryEntry`, `FollowOperationResult`, `FollowingFavoriteBooks`
  - DTOs for users/follow requests/follow operation/library state/library updates/following favorites
  - Controllers: `UsersController`, `MeController`

### Changed

- `Program.cs` now registers the new repositories and services.
- `SupabaseOptions` + `appsettings*.json` now include:
  - `UsersTable`
  - `UserFollowsTable`
  - `FollowRequestsTable`
  - `UserBookLibraryTable`
- `SupabaseBookRepository`/`IBookRepository` now support `GetByIdsAsync` for social-library projections.
- `GoodReadsAPI.Server.http` now includes examples for follows, follow-requests, library shelf/favorite/progress, and following-favorites.
- `docs/BACKEND_ENDPOINT_MATRIX.md` updated to mark social graph + library endpoints as implemented.

### Notes

- Lógica alineada al front hardcodeado actual:
  - Perfil privado crea `follow_request` pendiente en vez de follow directo.
  - `shelf=currently-reading` inicializa progreso en `18` cuando el libro no tenía progreso.
  - `update progress` fuerza shelf `currently-reading`.
  - Favoritos se persisten por relación `user_book_library` y se expone endpoint para ver favoritos de usuarios seguidos.
- Los endpoints `/api/me/*` usan resolución temporal de usuario por header `X-User-Id` (o `userId` por query) hasta integrar auth real.

## 2026-04-11

### Added

- Frontend API shared config:
  - `goodreadsapi.client/src/services/api/http.ts`
  - Centraliza `VITE_API_BASE_URL`, `VITE_USE_MOCK_API`, y helpers para rutas backend.
- Backend-aware capabilities in `authClient`:
  - `fetchUsers`
  - `fetchFollowingUserIds`
  - `followUser`
  - `unfollowUser`
  - `fetchPendingFollowRequests`
  - `respondToFollowRequest`

### Changed

- `goodreadsapi.client/src/services/api/catalog.ts` ahora reutiliza el config compartido HTTP.
- `goodreadsapi.client/src/services/api/libraryClient.ts` ahora soporta endpoints backend para:
  - `fetchForUser`
  - `setShelf`
  - `setFavorite`
  - `updateProgress`
- `goodreadsapi.client/src/context/AuthContext.tsx`:
  - sincroniza `users` + grafo de follows con backend cuando está habilitado.
  - `toggleFollowUser` y `respondToFollowRequest` usan backend y refrescan estado local.
  - mantiene fallback local/mock para desarrollo sin backend.
- `goodreadsapi.client/src/context/LibraryContext.tsx`:
  - sincroniza biblioteca del usuario autenticado desde `/api/me/library`.
  - `setShelf`, `toggleFavorite`, `updateProgress` escriben en backend y rehidratan estado.
  - mantiene fallback local/mock cuando backend no está habilitado.

### Notes

- Esta fase adapta la UX existente de páginas (`Readers`, `Profile`, `BookDetails`, `Library`, `Notifications`) a endpoints reales sin reescribir páginas una por una, usando los mismos contextos como capa de compatibilidad.
