# WebAPI Project Scaffold Guide

## Step 1: Create Project

```bash
dotnet new webapi -n Api -o api/ --use-controllers
dotnet new sln -n LegacyRefactor -o .
dotnet sln add api/Api.csproj
```

## Step 2: Install NuGet Packages

```text
cd api
dotnet add package Dapper
dotnet add package Oracle.ManagedDataAccess.Core
dotnet add package FluentValidation.AspNetCore
dotnet add package Serilog.AspNetCore
dotnet add package Serilog.Sinks.Console
dotnet add package Swashbuckle.AspNetCore
```

## Step 3: Create Folder Structure

```text
cd api
mkdir -p Controllers Services Models/Entities Models/DTOs Data/Repositories Data/Sql Middleware Extensions Validators
```

## Step 4: Configure Program.cs

See [code-templates/program-cs.md](code-templates/program-cs.md) for the full template.

## Step 5: Create Foundation Files

1. `ApiResponse<T>` — Standardized response wrapper
2. `IDbConnection` registration — `OracleConnection` via DI (see `program-cs.md`)
3. `BaseRepository` — Dapper base class (see `code-templates/repository-template.md`)
4. `ExceptionHandlingMiddleware` — Global error handling
5. `ServiceCollectionExtensions` — DI registration helper

## Step 5b: Create Test Project

```bash
dotnet new xunit -n Api.Tests -o api.Tests/
dotnet add api.Tests/ reference api/
dotnet add api.Tests/ package Moq
dotnet add api.Tests/ package Microsoft.AspNetCore.Mvc.Testing
dotnet sln add api.Tests/Api.Tests.csproj
mkdir -p api.Tests/Controllers api.Tests/Services api.Tests/Fixtures
```

## Step 6: Configure appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=ORASERVER;User Id=MYUSER;Password=MYPASS;"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "Cors": {
    "AllowedOrigins": ["http://localhost:5173", "https://localhost:7001"]
  }
}
```

## Step 7: Verify

```bash
dotnet build
dotnet run --project api/
# Visit https://localhost:{port}/swagger to verify Swagger UI
```
