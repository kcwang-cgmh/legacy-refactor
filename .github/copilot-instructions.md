# Legacy Code Refactoring Project

## Communication Language

**IMPORTANT**: Always reply to users in **Traditional Chinese**.

**IMPORTANT**: 每次需要向使用者確認問題時，必須使用 `ask_questions` 工具進行互動，不得在文字訊息中直接提問。

## Project Context

本專案協助團隊將 .NET Framework 舊專案遷移至 .NET 8。工作流程分三步驟：

1. `/analyze-legacy` — 分析 legacy-codes/ 中的舊專案，產出分析報告
2. `/plan-refactor` — 根據分析報告產出遷移計畫
3. `/start-refactor` — 建立新專案並依計畫執行遷移

## Key Files

| Path | Purpose |
|------|---------|
| `legacy-codes/` | 放置要遷移的 .NET Framework 舊專案（可多個子目錄） |
| `docs/{project-name}/analysis-report.md` | 分析報告（由 /analyze-legacy 產出，按專案分類） |
| `docs/{project-name}/migration-plan.md` | 遷移計畫（由 /plan-refactor 產出，按專案分類） |
| `docs/{project-name}/.migration-progress.json` | 遷移進度追蹤（由 /start-refactor 管理） |
| `refactored-projects/{project-name}/` | 遷移後的新 .NET 8 專案 |

## Development Commands

```bash
dotnet new webapi -n Api -o api/          # 建立 WebAPI 專案
dotnet new mvc -n Web -o web/             # 建立 MVC 前端專案
dotnet new sln -n LegacyRefactor          # 建立 Solution
dotnet sln add api/ web/                  # 加入專案到 Solution
dotnet build                              # 建置全部
dotnet test                               # 執行測試
dotnet format                             # 格式化程式碼

# 測試專案
dotnet new xunit -n Api.Tests -o api.Tests/  # 建立測試專案
dotnet add api.Tests/ reference api/         # 加入 API 專案參考
```

## Authority Levels

### MUST (Non-negotiable)

- Target framework MUST be `net8.0`
- API MUST use ASP.NET Core WebAPI (Controller-based or Minimal API)
- All data access MUST use Dapper with `Oracle.ManagedDataAccess.Core`, following Repository Pattern
- MUST NOT use Entity Framework Core — incompatible with the project Oracle database
- All configuration MUST use `appsettings.json` + `IOptions<T>` pattern
- Dependency Injection MUST be used for all services
- MUST NOT copy legacy code verbatim — rewrite following modern patterns
- All API endpoints MUST return consistent `ApiResponse<T>` format
- MUST use `async/await` for all I/O operations

### SHOULD (Strongly recommended)

- SHOULD use `record` types for DTOs
- SHOULD enable nullable reference types (`<Nullable>enable</Nullable>`)
- SHOULD use file-scoped namespaces
- SHOULD use primary constructors where appropriate
- SHOULD implement global exception handling middleware
- SHOULD use FluentValidation for input validation
- SHOULD follow RESTful API design conventions

### MAY (Optional)

- MAY use MediatR for CQRS if project complexity warrants it
- MAY use AutoMapper or Mapster for object mapping
- MAY use Serilog for structured logging
- MAY use Redis for caching

## Common Mistakes

| Legacy Pattern | Modern Replacement |
|---|---|
| `System.Web` namespace | `Microsoft.AspNetCore.*` |
| `HttpContext.Current` | Inject `IHttpContextAccessor` |
| `ConfigurationManager` | `IConfiguration` / `IOptions<T>` |
| `SqlConnection` directly | Inject `IDbConnection` via DI (Repository Pattern) |
| `EF Core` / `DbContext` | Dapper + `IRepository<T>` — EF Core is incompatible with this project |
| `@paramName` (SQL Server syntax) | `:paramName` (Oracle parameter syntax) |
| `Global.asax` | `Program.cs` middleware pipeline |
| `Web.config` transforms | `appsettings.{Environment}.json` |
| `Session["key"]` | `IDistributedCache` or JWT claims |
| `ViewState` | Frontend state management |
| `UpdatePanel` | Fetch API / AJAX |
| `Membership/Roles` | ASP.NET Core Identity |
| `BundleConfig` | Vite / webpack / ASP.NET Core bundling |
| Synchronous I/O | `async/await` throughout |

## Environment Prerequisites

在執行任何 `dotnet` 或 `npm` 指令前，請先確認以下工具已安裝且版本正確：

- **.NET 8 SDK** — 執行 `dotnet --list-sdks`，確認輸出包含 `8.x` 版本
- **Git** — 執行 `git --version`，確認已安裝
- **Node.js + npm**（僅當 `web/package.json` 存在時需要）— 執行 `node --version` 及 `npm --version`

如果任何工具缺失或版本不符，請在執行指令前先告知使用者安裝方式。
