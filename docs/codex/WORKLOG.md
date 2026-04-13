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

## 2026-04-12

### Added

- Backend legacy-auth fallback authentication handler:
  - `GoodReadsAPI.Server/Infrastructure/Auth/LegacyUserIdAuthenticationHandler.cs`
  - Enables authenticated principal creation from `X-User-Id` / `userId` during migration.

### Changed

- Auth hardening for social/library endpoints:
  - `GoodReadsAPI.Server/Controllers/MeController.cs`
  - `GoodReadsAPI.Server/Controllers/UsersController.cs`
  - Added `[Authorize]` to `/api/me/*` and follow/unfollow mutation endpoints.
- Hybrid auth pipeline in backend startup:
  - `GoodReadsAPI.Server/Program.cs`
  - Uses policy scheme to prefer JWT bearer and optionally allow legacy fallback.
- Current-user resolver now respects fallback toggle:
  - `GoodReadsAPI.Server/Controllers/ControllerUserIdResolver.cs`
- Supabase auth config expanded:
  - `GoodReadsAPI.Server/Configuration/SupabaseAuthOptions.cs`
  - `GoodReadsAPI.Server/appsettings.json`
  - `GoodReadsAPI.Server/appsettings.Development.json`
  - New flag: `AllowLegacyUserIdFallback`.
- API docs/examples updated to match protected endpoints:
  - `GoodReadsAPI.Server/README.md`
  - `GoodReadsAPI.Server/GoodReadsAPI.Server.http`
  - `docs/BACKEND_ENDPOINT_MATRIX.md`
  - `docs/AUTH_SUPABASE_MIGRATION.md` (rewritten in UTF-8 clean format).

### Notes

- This cut secures write/me social flows while keeping a controlled migration path.
- To enforce strict Supabase-only auth in an environment, set:
  - `SupabaseAuth.Enabled=true`
  - `SupabaseAuth.AllowLegacyUserIdFallback=false`

## 2026-04-12 (Supabase project binding)

### Added

- Frontend local runtime config file:
  - `goodreadsapi.client/.env.local` (ignored by git)
  - Enables Supabase auth and points to the provided Supabase project URL + publishable key.

### Changed

- Local backend secret store configured with Supabase credentials and auth flags via `dotnet user-secrets`:
  - `Supabase:Url`
  - `Supabase:ServiceRoleKey`
  - `SupabaseAuth:Enabled=true`
  - `SupabaseAuth:Authority=https://<project-ref>.supabase.co/auth/v1`
  - `SupabaseAuth:Audience=authenticated`
  - `SupabaseAuth:AllowLegacyUserIdFallback=true`

### Notes

- No sensitive values were committed to repository-tracked files.
- Backend and frontend are now wired to the same Supabase project for local execution.

## 2026-04-12 (Supabase register UX hardening)

### Changed

- Improved Supabase register flow in:
  - `goodreadsapi.client/src/context/AuthContext.tsx`
- New behavior when Supabase returns `User already registered` on signup:
  - attempts automatic sign-in with same email/password.
  - if auto sign-in succeeds, session is restored and user continues without failure.
  - if auto sign-in fails, returns clear guidance to use login with existing account.

### Notes

- This avoids confusing hard failure on repeated signup attempts with an existing email.

## 2026-04-12 (Supabase register flow fallback on null session)

### Changed

- Hardened register flow in:
  - `goodreadsapi.client/src/context/AuthContext.tsx`
- New behavior when Supabase signup returns no session (`requiresEmailConfirmation=true`):
  - attempts sign-in with the same email/password before showing confirmation message.
  - if sign-in succeeds, user is authenticated and can continue.
  - if sign-in fails with existing-account semantics, user gets clear message to use login.
- Reduced noisy error logging for expected `already registered` path by reporting only unhandled signup errors.

### Notes

- This covers projects where Supabase signup behavior may return null session even when account creation/already-exists logic is involved.

## 2026-04-12 (Post-login UX fix when profile hydration is delayed)

### Changed

- Session/auth state robustness improvements:
  - `goodreadsapi.client/src/context/AuthContext.tsx`
  - `isAuthenticated` now depends on active session token (`currentSessionUserId`) instead of requiring a pre-hydrated `currentUser` entity.
  - Added temporary fallback session user model (derived from Supabase session data) when user profile is not yet present in local `state.users`.
- Supabase session user passthrough added:
  - `goodreadsapi.client/src/services/api/supabaseAuth.ts`
  - `goodreadsapi.client/src/services/api/authClient.ts`
- Redirect behavior after auth success no longer blocks on `currentUser`:
  - `goodreadsapi.client/src/pages/LoginPage.tsx`
  - `goodreadsapi.client/src/pages/RegisterPage.tsx`

### Notes

- This ensures protected navigation and user-enabled UI become available immediately after successful session creation, even if backend social profile sync arrives slightly later.

## 2026-04-12 (Readers/Profile alignment with backend users)

### Changed

- Backend user sync in auth state now prefers remote source without retaining local-only seeded users:
  - `goodreadsapi.client/src/context/AuthContext.tsx`
  - Readers and other user lists now reflect backend-registered users instead of hardcoded seed-only entries.
- Fallback session profile data softened to avoid hardcoded biography/role placeholders:
  - `goodreadsapi.client/src/context/AuthContext.tsx`
  - `role`, `bio`, `pagesRead`, and badges default to empty values for first-time profiles pending edit.
- Profile page improved for first-time Supabase users:
  - `goodreadsapi.client/src/pages/ProfilePage.tsx`
  - Shows account email on own profile header.
  - Hides empty lede segments (role/genres) to avoid noisy placeholder UI.

### Notes

- This keeps profile fields editable-first rather than prefilled with synthetic narrative text.

## 2026-04-12 (Auth to app-users consistency fix)

### Changed

- `GoodReadsAPI.Server/Database/Sql/005_supabase_auth_alignment.sql`
  - Added backfill insert to create missing `public.users` rows for accounts already present in `auth.users` before trigger rollout.
  - Updated default profile payload for auth-created users to editable-first values (no hardcoded bio/role/badges).
- `docs/AUTH_SUPABASE_MIGRATION.md`
  - Documented new backfill behavior and added validation query for `auth.users` <-> `public.users` mapping.

### Notes

- This closes the gap where an account could exist in Supabase Auth but be absent from app social tables, causing fallback/placeholder profiles in frontend.

## 2026-04-12 (Auth-user ID mapping and legacy user sync)

### Changed

- Backend now maps JWT `sub` (auth id) to app user id when available:
  - `GoodReadsAPI.Server/Infrastructure/Repositories/IUserRepository.cs`
  - `GoodReadsAPI.Server/Infrastructure/Repositories/SupabaseUserRepository.cs`
  - `GoodReadsAPI.Server/Program.cs`
  - `GoodReadsAPI.Server/Controllers/ControllerUserIdResolver.cs`
- Added `GetByAuthUserIdAsync` repository path and JWT `OnTokenValidated` enrichment with `app_user_id` claim.
- Expanded auth alignment SQL for existing auth accounts:
  - `GoodReadsAPI.Server/Database/Sql/005_supabase_auth_alignment.sql`
  - Inserts missing rows in `public.users` for pre-existing `auth.users` accounts.
  - Uses editable-first defaults for role/bio/pages/badges.
- Updated docs:
  - `GoodReadsAPI.Server/README.md`
  - `docs/AUTH_SUPABASE_MIGRATION.md`

### Notes

- This fixes the inconsistency where sessions existed in Supabase Auth but app profile rows were missing or resolved under a different app id path.

## 2026-04-12 (Profile DB persistence + follow error hardening)

### Added

- Backend contract and domain model for profile updates:
  - `GoodReadsAPI.Server/Contracts/UpdateMyProfileRequest.cs`
  - `GoodReadsAPI.Server/Domain/Entities/UserProfileUpdate.cs`
- Settings persistence matrix doc:
  - `docs/SETTINGS_PERSISTENCE_MATRIX.md`

### Changed

- Backend profile persistence path:
  - `GoodReadsAPI.Server/Controllers/MeController.cs` (`PUT /api/me/profile`)
  - `GoodReadsAPI.Server/Application/Interfaces/IUserService.cs`
  - `GoodReadsAPI.Server/Application/Services/UserService.cs`
  - `GoodReadsAPI.Server/Infrastructure/Repositories/IUserRepository.cs`
  - `GoodReadsAPI.Server/Infrastructure/Repositories/SupabaseUserRepository.cs`
- Frontend profile/account save now calls backend/Auth instead of local-only state when backend is enabled:
  - `goodreadsapi.client/src/services/api/authClient.ts`
  - `goodreadsapi.client/src/services/api/supabaseAuth.ts`
  - `goodreadsapi.client/src/context/AuthContext.tsx`
- Follow flow hardening to avoid generic 500 on duplicate follow/follow-request races:
  - `GoodReadsAPI.Server/Application/Services/SocialGraphService.cs`
  - `GoodReadsAPI.Server/Controllers/UsersController.cs`
- API docs updated:
  - `GoodReadsAPI.Server/README.md`
  - `GoodReadsAPI.Server/GoodReadsAPI.Server.http`
  - `docs/BACKEND_ENDPOINT_MATRIX.md`

### Notes

- Profile section fields now persist in `public.users` via backend API.
- Account email/password updates in Supabase mode are routed through Supabase Auth update-user endpoint.
- Notifications/appearance/language/reading/security settings remain local-only for now (documented in matrix).

## 2026-04-12 (Hotfix profile update 404)

### Changed

- `GoodReadsAPI.Server/Application/Services/UserService.cs`
  - `UpdateProfileAsync` now resolves current user by:
    1) `public.users.id`
    2) fallback `public.users.auth_user_id` (Supabase `sub`)
  - Prevents 404 when authenticated user id in token differs from app user table primary key.

### Notes

- This hotfix keeps profile updates working even if JWT claim mapping (`app_user_id`) is temporarily missing.

## 2026-04-12 (Profile update auto-provision fallback)

### Changed

- `GoodReadsAPI.Server/Application/Services/UserService.cs`
  - `UpdateProfileAsync` now auto-provisions user profile in `public.users` when no matching row exists yet.
  - Resolution order for current user on update:
    1) `id`
    2) `auth_user_id`
    3) `email`
  - If all miss, creates a new row with the submitted profile payload.
- `GoodReadsAPI.Server/Infrastructure/Repositories/IUserRepository.cs`
  - Added `CreateProfileAsync(...)`.
- `GoodReadsAPI.Server/Infrastructure/Repositories/SupabaseUserRepository.cs`
  - Implemented `CreateProfileAsync(...)` with safe defaults.

### Notes

- This removes the persistent 404 on `PUT /api/me/profile` for auth users whose social profile row has not been created/synced yet.

## 2026-04-12 (Frontend profile update JSON parse hardening)

### Changed

- `goodreadsapi.client/src/services/api/authClient.ts`
  - Added `parseJsonTextSafely(...)` helper to avoid parsing obvious non-JSON payloads.
  - Updated `readJsonSafely(...)` to use the safe parser helper.
  - Hardened `updateMyProfile(...)` error handling so non-JSON backend responses no longer throw raw `SyntaxError`.
  - Error messages now include response status/content-type plus a compact body snippet for faster diagnosis.

### Notes

- This addresses the frontend runtime error:
  - `Unexpected token 'G', "GoodReadsA"... is not valid JSON`
- The flow now fails gracefully with actionable error text even when backend/proxy returns plain text or HTML.

## 2026-04-12 (Backend profile-update 500 hardening for Supabase errors)

### Changed

- `GoodReadsAPI.Server/Infrastructure/Repositories/SupabaseUserRepository.cs`
  - `GetByAuthUserIdAsync(...)` now skips lookup when the provided value is not a valid UUID.
- `GoodReadsAPI.Server/Application/Services/UserService.cs`
  - `ResolveCurrentUserAsync(...)` now tolerates missing `auth_user_id` column errors and continues with email fallback.
- `GoodReadsAPI.Server/Controllers/MeController.cs`
  - Added `SupabaseRequestException` handling for `PUT /api/me/profile`.
  - Supabase failures now return structured `ProblemDetails` (400/401/403/404/409) instead of bubbling as unhandled 500.

### Notes

- This removes the plain-text stacktrace 500 path and surfaces actionable backend detail to frontend.

## 2026-04-12 (PostgREST return=representation hotfix)

### Changed

- `GoodReadsAPI.Server/Infrastructure/Supabase/SupabaseRestClient.cs`
  - Fixed `InsertAsync(...)` and `UpdateSingleAsync(...)` to request representation using `Prefer: return=representation` header.
  - Removed invalid `return=representation` query parameter usage from request path builder.

### Notes

- This fixes `PGRST100` on profile update:
  - `failed to parse filter (representation)`
- Root cause: PostgREST treated `return=representation` as a malformed filter query param.

## 2026-04-12 (Auth screen auto-redirect consistency)

### Changed

- `goodreadsapi.client/src/pages/LoginPage.tsx`
  - Added automatic redirect when `isAuthenticated` is true, even without pending local redirect state.
  - Added redirect target sanitization to prevent remaining in `/login` or `/register`.
- `goodreadsapi.client/src/pages/RegisterPage.tsx`
  - Added same authenticated auto-redirect behavior.
  - Added sanitized redirect target resolution from route state (`from`) with fallback to `/settings`.

### Notes

- This fixes the UI inconsistency where login/register view could remain visible after successful authentication until manual navigation.

## 2026-04-12 (Navbar/Mobile logout quick access)

### Changed

- `goodreadsapi.client/src/components/layout/Navbar.tsx`
  - Added authenticated logout button (icon action) next to profile avatar.
  - Wired to `logout()` and immediate redirect to `/login`.
- `goodreadsapi.client/src/components/layout/MobileMenu.tsx`
  - Added explicit `Cerrar sesion` action for authenticated users.
  - Wired to `logout()`, menu close, and redirect to `/login`.

### Notes

- This provides a direct sign-out path from global navigation without requiring entry to Settings.

## 2026-04-12 (Neutral default avatar for new users)

### Changed

- `goodreadsapi.client/src/context/AuthContext.tsx`
  - Replaced hardcoded portrait avatar fallback with neutral placeholder avatar URL.
  - Applied same neutral placeholder in local/mock register flow for newly created users.
- `GoodReadsAPI.Server/Database/Sql/005_supabase_auth_alignment.sql`
  - Updated default `avatar` for auth-alignment inserts and auth trigger user creation.
- `GoodReadsAPI.Server/Database/Sql/006_default_avatar_placeholder.sql`
  - Added migration to update existing users still using old default portrait avatar.
  - Recreates `handle_new_auth_user()` so future auth-created users use neutral placeholder.
- `GoodReadsAPI.Server/README.md`
  - Added `006_default_avatar_placeholder.sql` to SQL run order.
- `docs/AUTH_SUPABASE_MIGRATION.md`
  - Added `006_default_avatar_placeholder.sql` and explained what it does.

### Notes

- Goal: avoid assigning a gendered portrait to users who have not uploaded an avatar yet.
