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
