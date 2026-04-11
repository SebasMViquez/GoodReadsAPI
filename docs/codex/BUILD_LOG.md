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
