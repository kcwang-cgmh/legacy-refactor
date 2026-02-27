# Common NuGet Package Migration Map

## ORM & Data Access

| Legacy Package | .NET 8 Equivalent | Notes |
| --- | --- | --- |
| EntityFramework (6.x) | ~~Microsoft.EntityFrameworkCore~~ | ⛔ 不使用 — 與本專案 Oracle 資料庫不相容 |
| Dapper | **Dapper** ✅ 首選方案 | 相對專案原始 ADO.NET 代碼，直接擴展 |
| System.Data.SqlClient | 不適用 (Oracle 專案) | 改用 Oracle.ManagedDataAccess.Core |
| Oracle.ManagedDataAccess | **Oracle.ManagedDataAccess.Core** ✅ 必要 | ODP.NET Core 官方驅動 |

## Web & API

| Legacy Package | .NET 8 Equivalent | Notes |
| --- | --- | --- |
| Microsoft.AspNet.Mvc | Built-in (Microsoft.AspNetCore.Mvc) | Part of framework |
| Microsoft.AspNet.WebApi | Built-in (ASP.NET Core WebAPI) | Part of framework |
| Microsoft.Owin | Built-in (middleware pipeline) | Part of framework |
| Newtonsoft.Json | System.Text.Json (built-in) or Newtonsoft.Json | STJ preferred, Newtonsoft still works |
| Swashbuckle | Swashbuckle.AspNetCore | Different package |

## Authentication & Security

| Legacy Package | .NET 8 Equivalent | Notes |
| --- | --- | --- |
| Microsoft.AspNet.Identity | Microsoft.AspNetCore.Identity | API changes |
| Microsoft.Owin.Security.* | Microsoft.AspNetCore.Authentication.* | Different package names |
| System.IdentityModel.Tokens.Jwt | Microsoft.AspNetCore.Authentication.JwtBearer | Built-in support |

## Logging

| Legacy Package | .NET 8 Equivalent | Notes |
| --- | --- | --- |
| log4net | Serilog.AspNetCore or NLog.Web.AspNetCore | Consider switching |
| NLog | NLog.Web.AspNetCore | Updated package |
| Elmah | Serilog + Seq or Application Insights | Modern alternatives |

## Validation

| Legacy Package | .NET 8 Equivalent | Notes |
| --- | --- | --- |
| FluentValidation | FluentValidation.AspNetCore | Updated package |
| DataAnnotations | DataAnnotations (built-in) | Same, different namespace |

## IoC / DI

| Legacy Package | .NET 8 Equivalent | Notes |
| --- | --- | --- |
| Unity | Built-in DI (IServiceCollection) | No package needed |
| Ninject | Built-in DI | No package needed |
| Autofac | Autofac.Extensions.DependencyInjection | Optional, built-in usually sufficient |
| StructureMap | Built-in DI | No package needed |

## Mapping

| Legacy Package | .NET 8 Equivalent | Notes |
| --- | --- | --- |
| AutoMapper | AutoMapper | Same package, update version |
| - | Mapster | Lighter alternative |

## Caching

| Legacy Package | .NET 8 Equivalent | Notes |
| --- | --- | --- |
| System.Web.Caching | Microsoft.Extensions.Caching.Memory | Different API |
| System.Runtime.Caching | Microsoft.Extensions.Caching.Memory | Different API |
| StackExchange.Redis | StackExchange.Redis | Compatible |

## UI Controls (No Direct Equivalent)

| Legacy Package | Recommended Approach |
| --- | --- |
| DevExpress (WinForms/WebForms) | Rewrite UI with modern frontend |
| Telerik UI | Rewrite UI with modern frontend |
| Infragistics | Rewrite UI with modern frontend |
| ComponentOne | Rewrite UI with modern frontend |
| Crystal Reports | SSRS, Stimulsoft, or custom reporting |

## Testing

| Legacy Package | .NET 8 Equivalent | Notes |
| --- | --- | --- |
| NUnit (2.x) | NUnit (4.x) | Major version update |
| xUnit | **xUnit** ✅ 首選測試框架 | .NET Core 官方範例使用 |
| MSTest | MSTest | Compatible |
| Moq | **Moq** ✅ 首選 Mock 框架 | 適合 mock IRepository 介面 |
| - | Microsoft.AspNetCore.Mvc.Testing | 整合測試用 WebApplicationFactory |
