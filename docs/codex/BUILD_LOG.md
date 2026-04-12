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
