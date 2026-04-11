# GoodReadsAPI Server

ASP.NET Core Web API project for the GoodReads backend.

## Purpose

This project now starts from a clean API-first baseline (no WeatherForecast template code), so we can implement real domain features directly.

## Current structure

```text
GoodReadsAPI.Server/
  Controllers/
  Contracts/
  Domain/
  Application/
  Infrastructure/
  Properties/
  Program.cs
```

## Running locally

```bash
dotnet restore
dotnet run
```

Health endpoint:

```text
GET /api/health
```

## Implementation order recommendation

1. Define domain entities and value objects under `Domain`.
2. Add use cases/services under `Application`.
3. Implement persistence and external adapters under `Infrastructure`.
4. Keep controllers thin and contract driven (`Contracts`).
