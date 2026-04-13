# Build Log

## 2026-04-11 - Backend compile

### Attempt 1

- Command:
  - `dotnet build GoodReadsAPI.Server/GoodReadsAPI.Server.csproj --no-restore`
- Result:
  - Failed
- Errors fixed:
  - Invalid `CreateRequest` call signature in `SupabaseRestClient`.
  - Generic nullability issue in `UpdateSingleAsync<T>`.
  - Invalid `with` usage on non-record `BookRow`.

### Attempt 2

- Command:
  - `dotnet build GoodReadsAPI.Server/GoodReadsAPI.Server.csproj --no-restore`
- Result:
  - Success
- Output summary:
  - `0 Warning(s)`
  - `0 Error(s)`
  - Build target produced `GoodReadsAPI.Server.dll` in `bin/Debug/net10.0`.

### Attempt 3

- Command:
  - `dotnet build GoodReadsAPI.Server/GoodReadsAPI.Server.csproj --no-restore`
- Result:
  - Success
- Output summary:
  - `0 Warning(s)`
  - `0 Error(s)`
  - Verified after enabling `UserSecretsId` in project file.

## 2026-04-11 - Frontend validation after backend catalog integration

### Attempt 1

- Command:
  - `npm run lint`
- Result:
  - Success
- Output summary:
  - ESLint completed with no errors.

### Attempt 2

- Command:
  - `npx tsc -b`
- Result:
  - Success
- Output summary:
  - TypeScript project references compiled with no errors.

## 2026-04-11 - Frontend validation after books lab route

### Attempt 1

- Command:
  - `npm run lint`
- Result:
  - Success
- Output summary:
  - ESLint completed with no errors.

### Attempt 2

- Command:
  - `npx tsc -b`
- Result:
  - Success
- Output summary:
  - TypeScript build completed with no errors.

## 2026-04-11 - Frontend validation after default backend fallback update

### Attempt 1

- Command:
  - `npm run lint`
- Result:
  - Success
- Output summary:
  - ESLint completed with no errors.

### Attempt 2

- Command:
  - `npx tsc -b`
- Result:
  - Success
- Output summary:
  - TypeScript build completed with no errors.

## 2026-04-11 - Backend validation after HTTP test workflow update

### Attempt 1

- Command:
  - `dotnet build GoodReadsAPI.Server/GoodReadsAPI.Server.csproj --no-restore`
- Result:
  - Success
- Output summary:
  - `0 Warning(s)`
  - `0 Error(s)`
  - Build produced `GoodReadsAPI.Server.dll` in `bin/Debug/net10.0`.

### Attempt 4

- Command:
  - `dotnet build GoodReadsAPI.Server/GoodReadsAPI.Server.csproj`
- Result:
  - Failed
- Errors fixed:
  - Sandbox environment denied default `.dotnet` home path access.
  - Re-ran with `DOTNET_CLI_HOME` set to workspace path.

### Attempt 5

- Command:
  - `$env:DOTNET_CLI_HOME='c:\.NET\WEB\GoodReadsAPI\.dotnet'; dotnet build GoodReadsAPI.Server/GoodReadsAPI.Server.csproj`
- Result:
  - Failed
- Key errors:
  - Initial sandbox run could not complete NuGet TLS/auth handshake.
  - Escalated run restored packages correctly, then failed to copy outputs because `GoodReadsAPI.Server` process was running and locking `bin\Debug\net10.0` artifacts.

### Attempt 6

- Command:
  - `$env:DOTNET_CLI_HOME='c:\.NET\WEB\GoodReadsAPI\.dotnet'; dotnet build GoodReadsAPI.Server/GoodReadsAPI.Server.csproj -o c:\.NET\WEB\GoodReadsAPI\.artifacts\server-build`
- Result:
  - Success
- Output summary:
  - `0 Warning(s)`
  - `0 Error(s)`
  - Build output generated in `.artifacts/server-build`.

## 2026-04-11 - Validation after frontend flow audit + social schema scripts

### Attempt 1

- Command:
  - `npm run lint`
- Result:
  - Failed
- Key errors:
  - PowerShell execution policy blocked `npm.ps1`.

### Attempt 2

- Command:
  - `npx tsc -b`
- Result:
  - Failed
- Key errors:
  - PowerShell execution policy blocked `npx.ps1`.

### Attempt 3

- Command:
  - `npm.cmd run lint`
- Result:
  - Success
- Output summary:
  - ESLint completed with no errors.

### Attempt 4

- Command:
  - `npx.cmd tsc -b`
- Result:
  - Success
- Output summary:
  - TypeScript project references compiled with no errors.

### Attempt 5

- Command:
  - `$env:DOTNET_CLI_HOME='c:\.NET\WEB\GoodReadsAPI\.dotnet'; dotnet build GoodReadsAPI.Server/GoodReadsAPI.Server.csproj --no-restore`
- Result:
  - Success
- Output summary:
  - `0 Warning(s)`
  - `0 Error(s)`
  - Build produced `GoodReadsAPI.Server.dll` in `bin/Debug/net10.0`.

### Attempt 6

- Command:
  - `npm.cmd run lint`
- Result:
  - Success
- Output summary:
  - ESLint completed with no errors after `MessagesPage` adjustment.

### Attempt 7

- Command:
  - `npx.cmd tsc -b`
- Result:
  - Success
- Output summary:
  - TypeScript project references compiled with no errors after `MessagesPage` adjustment.

### Attempt 8

- Command:
  - `npm.cmd run lint`
- Result:
  - Success
- Output summary:
  - ESLint completed with no errors after ASCII cleanup in `MessagesPage`.

### Attempt 9

- Command:
  - `npx.cmd tsc -b`
- Result:
  - Success
- Output summary:
  - TypeScript project references compiled with no errors after ASCII cleanup in `MessagesPage`.

## 2026-04-11 - SQL seed validation after books/authors fix

### Attempt 1

- Command:
  - JSON parse validation for `003_authors_bulk_seed.sql` payload
- Result:
  - Success
- Output summary:
  - `AUTHORS_JSON_OK count=10`

### Attempt 2

- Command:
  - JSON parse validation for `004_books_bulk_seed.sql` payload
- Result:
  - Success
- Output summary:
  - `BOOKS_JSON_OK count=10`

### Attempt 3

- Command:
  - Cross-check `books.authorId` vs authors seed IDs
- Result:
  - Success
- Output summary:
  - `AUTHOR_COVERAGE_OK`

## 2026-04-11 - Backend validation after social graph + user-library implementation

### Attempt 1

- Command:
  - `$env:DOTNET_CLI_HOME='c:\.NET\WEB\GoodReadsAPI\.dotnet'; dotnet build GoodReadsAPI.Server/GoodReadsAPI.Server.csproj --no-restore`
- Result:
  - Failed
- Key errors:
  - Build output target in `bin\Debug\net10.0\GoodReadsAPI.Server.exe` was locked by another running process.
  - Copy step failed with `MSB3027` / `MSB3021` after retries.

### Attempt 2

- Command:
  - `$env:DOTNET_CLI_HOME='c:\.NET\WEB\GoodReadsAPI\.dotnet'; dotnet build GoodReadsAPI.Server/GoodReadsAPI.Server.csproj --no-restore -o c:\.NET\WEB\GoodReadsAPI\.artifacts\server-build-social`
- Result:
  - Success
- Output summary:
  - `0 Warning(s)`
  - `0 Error(s)`
  - Build output generated in `.artifacts/server-build-social`.

## 2026-04-11 - Frontend validation after social/library backend adapter integration

### Attempt 1

- Command:
  - `npm.cmd run lint`
- Result:
  - Success
- Output summary:
  - ESLint completed with no errors.

### Attempt 2

- Command:
  - `npx.cmd tsc -b`
- Result:
  - Failed
- Key errors:
  - Invalid toast tone `'error'` in `AuthContext.tsx` and `LibraryContext.tsx` (`ToastTone` only allows `success|info|warning`).

### Attempt 3

- Command:
  - `npm.cmd run lint`
- Result:
  - Success
- Output summary:
  - ESLint completed with no errors after toast/status fix.

### Attempt 4

- Command:
  - `npx.cmd tsc -b`
- Result:
  - Success
- Output summary:
  - TypeScript build completed with no errors after context type corrections.

## 2026-04-12 - Auth hardening validation (hybrid auth + [Authorize])

### Attempt 1

- Command:
  - `$env:DOTNET_CLI_HOME='c:\.NET\WEB\GoodReadsAPI\.dotnet'; dotnet build GoodReadsAPI.Server/GoodReadsAPI.Server.csproj --no-restore -o c:\.NET\WEB\GoodReadsAPI\.artifacts\server-build-auth-cutover`
- Result:
  - Success
- Output summary:
  - `0 Advertencia(s)`
  - `0 Errores`
  - Build output generated in `.artifacts/server-build-auth-cutover`.

### Attempt 2

- Command:
  - `npm.cmd run lint`
- Result:
  - Success
- Output summary:
  - ESLint completed with no errors.

### Attempt 3

- Command:
  - `npx.cmd tsc -b`
- Result:
  - Success
- Output summary:
  - TypeScript project references compiled with no errors.

## 2026-04-12 - Validation after Supabase local configuration binding

### Attempt 1

- Command:
  - `$env:DOTNET_CLI_HOME='c:\.NET\WEB\GoodReadsAPI\.dotnet'; dotnet build GoodReadsAPI.Server/GoodReadsAPI.Server.csproj --no-restore -o c:\.NET\WEB\GoodReadsAPI\.artifacts\server-build-supabase-config`
- Result:
  - Success
- Output summary:
  - `0 Advertencia(s)`
  - `0 Errores`
  - Build output generated in `.artifacts/server-build-supabase-config`.

### Attempt 2

- Command:
  - `npm.cmd run lint`
- Result:
  - Success
- Output summary:
  - ESLint completed with no errors.

### Attempt 3

- Command:
  - `npx.cmd tsc -b`
- Result:
  - Success
- Output summary:
  - TypeScript project references compiled with no errors.

## 2026-04-12 - Frontend validation after Supabase "User already registered" handling

### Attempt 1

- Command:
  - `npm.cmd run lint`
- Result:
  - Success
- Output summary:
  - ESLint completed with no errors.

### Attempt 2

- Command:
  - `npx.cmd tsc -b`
- Result:
  - Success
- Output summary:
  - TypeScript project references compiled with no errors.

## 2026-04-12 - Frontend validation after signup-null-session fallback

### Attempt 1

- Command:
  - `npm.cmd run lint`
- Result:
  - Success
- Output summary:
  - ESLint completed with no errors.

### Attempt 2

- Command:
  - `npx.cmd tsc -b`
- Result:
  - Success
- Output summary:
  - TypeScript project references compiled with no errors.

## 2026-04-12 - Frontend validation after post-login hydration fix

### Attempt 1

- Command:
  - `npm.cmd run lint`
- Result:
  - Failed
- Key errors:
  - Unused `currentUser` variable in `LoginPage.tsx` and `RegisterPage.tsx` after redirect condition update.

### Attempt 2

- Command:
  - `npm.cmd run lint`
- Result:
  - Success
- Output summary:
  - ESLint completed with no errors.

### Attempt 3

- Command:
  - `npx.cmd tsc -b`
- Result:
  - Success
- Output summary:
  - TypeScript project references compiled with no errors.

## 2026-04-12 - Frontend validation after readers/profile backend-alignment fixes

### Attempt 1

- Command:
  - `npm.cmd run lint`
- Result:
  - Success
- Output summary:
  - ESLint completed with no errors.

### Attempt 2

- Command:
  - `npx.cmd tsc -b`
- Result:
  - Success
- Output summary:
  - TypeScript project references compiled with no errors.

## 2026-04-12 - Backend validation after auth-user sync SQL fix

### Attempt 1

- Command:
  - `$env:DOTNET_CLI_HOME='c:\.NET\WEB\GoodReadsAPI\.dotnet'; dotnet build GoodReadsAPI.Server/GoodReadsAPI.Server.csproj --no-restore -o c:\.NET\WEB\GoodReadsAPI\.artifacts\server-build-auth-user-sync-fix`
- Result:
  - Success
- Output summary:
  - `0 Advertencia(s)`
  - `0 Errores`
  - Build output generated in `.artifacts/server-build-auth-user-sync-fix`.

## 2026-04-12 - Backend validation after JWT app_user_id mapping

### Attempt 1

- Command:
  - `$env:DOTNET_CLI_HOME='c:\.NET\WEB\GoodReadsAPI\.dotnet'; dotnet build GoodReadsAPI.Server/GoodReadsAPI.Server.csproj --no-restore -o c:\.NET\WEB\GoodReadsAPI\.artifacts\server-build-auth-app-id-claim`
- Result:
  - Success
- Output summary:
  - `0 Advertencia(s)`
  - `0 Errores`
  - Build output generated in `.artifacts/server-build-auth-app-id-claim`.

## 2026-04-12 - Validation after profile DB persistence + follow hardening

### Attempt 1

- Command:
  - `$env:DOTNET_CLI_HOME='c:\.NET\WEB\GoodReadsAPI\.dotnet'; dotnet build GoodReadsAPI.Server/GoodReadsAPI.Server.csproj --no-restore -o c:\.NET\WEB\GoodReadsAPI\.artifacts\server-build-profile-persist-follow-fix`
- Result:
  - Success
- Output summary:
  - `0 Advertencia(s)`
  - `0 Errores`
  - Build output generated in `.artifacts/server-build-profile-persist-follow-fix`.

### Attempt 2

- Command:
  - `npm.cmd run lint`
- Result:
  - Success
- Output summary:
  - ESLint completed with no errors.

### Attempt 3

- Command:
  - `npx.cmd tsc -b`
- Result:
  - Success
- Output summary:
  - TypeScript project references compiled with no errors.

## 2026-04-12 - Backend validation after profile 404 hotfix

### Attempt 1

- Command:
  - `$env:DOTNET_CLI_HOME='c:\.NET\WEB\GoodReadsAPI\.dotnet'; dotnet build GoodReadsAPI.Server/GoodReadsAPI.Server.csproj --no-restore -o c:\.NET\WEB\GoodReadsAPI\.artifacts\server-build-profile-404-fix`
- Result:
  - Success
- Output summary:
  - `0 Advertencia(s)`
  - `0 Errores`
  - Build output generated in `.artifacts/server-build-profile-404-fix`.

## 2026-04-12 - Backend validation after profile auto-provision fix

### Attempt 1

- Command:
  - `$env:DOTNET_CLI_HOME='c:\.NET\WEB\GoodReadsAPI\.dotnet'; dotnet build GoodReadsAPI.Server/GoodReadsAPI.Server.csproj --no-restore -o c:\.NET\WEB\GoodReadsAPI\.artifacts\server-build-profile-autoprovision-fix`
- Result:
  - Success
- Output summary:
  - `0 Advertencia(s)`
  - `0 Errores`
  - Build output generated in `.artifacts/server-build-profile-autoprovision-fix`.

## 2026-04-12 - Runtime backend refresh after stale endpoint detection

### Attempt 1

- Command:
  - Stop running `GoodReadsAPI.Server` process.
  - `dotnet build GoodReadsAPI.Server/GoodReadsAPI.Server.csproj --no-restore`
  - Start fresh server: `dotnet run --project GoodReadsAPI.Server/GoodReadsAPI.Server.csproj --no-build --urls http://localhost:5068`
  - Verify swagger path contains `/api/me/profile`.
- Result:
  - Success
- Output summary:
  - Build succeeded (`0 warnings`, `0 errors`).
  - New server process started.
  - Swagger verification: `HAS_PROFILE_ENDPOINT=True`.

## 2026-04-12 - Frontend validation after profile JSON parse hardening

### Attempt 1

- Command:
  - `npm.cmd run lint`
- Result:
  - Success
- Output summary:
  - ESLint completed with no errors.

### Attempt 2

- Command:
  - `npx.cmd tsc -b`
- Result:
  - Success
- Output summary:
  - TypeScript project references compiled with no errors.

## 2026-04-12 - Backend validation after profile-update Supabase 500 hardening

### Attempt 1

- Command:
  - `$env:DOTNET_CLI_HOME='c:\.NET\WEB\GoodReadsAPI\.dotnet'; dotnet build GoodReadsAPI.Server/GoodReadsAPI.Server.csproj --no-restore -o c:\.NET\WEB\GoodReadsAPI\.artifacts\server-build-profile-supabase-500-fix`
- Result:
  - Success
- Output summary:
  - `0 Advertencia(s)`
  - `0 Errores`
  - Build output generated in `.artifacts/server-build-profile-supabase-500-fix`.

## 2026-04-12 - Backend validation after PostgREST return-header hotfix

### Attempt 1

- Command:
  - `$env:DOTNET_CLI_HOME='c:\.NET\WEB\GoodReadsAPI\.dotnet'; dotnet build GoodReadsAPI.Server/GoodReadsAPI.Server.csproj --no-restore -o c:\.NET\WEB\GoodReadsAPI\.artifacts\server-build-postgrest-return-header-fix`
- Result:
  - Success
- Output summary:
  - `0 Advertencia(s)`
  - `0 Errores`
  - Build output generated in `.artifacts/server-build-postgrest-return-header-fix`.

## 2026-04-12 - Frontend validation after auth screen auto-redirect fix

### Attempt 1

- Command:
  - `npm.cmd run lint`
- Result:
  - Success
- Output summary:
  - ESLint completed with no errors.

### Attempt 2

- Command:
  - `npx.cmd tsc -b`
- Result:
  - Success
- Output summary:
  - TypeScript project references compiled with no errors.

## 2026-04-12 - Frontend validation after navbar/mobile logout action

### Attempt 1

- Command:
  - `npm.cmd run lint`
- Result:
  - Success
- Output summary:
  - ESLint completed with no errors.

### Attempt 2

- Command:
  - `npx.cmd tsc -b`
- Result:
  - Success
- Output summary:
  - TypeScript project references compiled with no errors.
