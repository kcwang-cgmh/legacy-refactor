---
applyTo: "refactored-project/api/**,refactored-project/web/**,legacy-codes/**"
---

# .NET Framework → .NET 8 Migration Patterns

## WinForms Migration

WinForms 應用的 UI 邏輯無法直接遷移，需拆分為 API + 前端重新設計。

| Legacy (WinForms) | Modern (.NET 8) |
|---|---|
| `Form` class | API Controller + frontend page/component |
| `Button_Click` event handler | API endpoint + frontend event handler |
| `DataGridView` data binding | API returning JSON + frontend table (HTML/React/etc.) |
| `Application.Run(new MainForm())` | `WebApplication.Run()` |
| `Form.Show()` / `ShowDialog()` | Frontend routing / modal dialog |
| `OpenFileDialog` | Frontend file upload (`<input type="file">`) |
| `MessageBox.Show()` | Frontend toast/alert component |
| Direct DB calls in form code | Service layer → Repository → Dapper |
| `BackgroundWorker` | `Task.Run()` / hosted services / message queues |
| App.config | appsettings.json |
| `BindingSource` / `DataSet` | Dapper POCOs + DTOs |

### WinForms Migration Strategy

1. Extract business logic from form event handlers into service classes
2. Identify all data operations and create corresponding API endpoints
3. Map each form to a frontend page/view
4. Replace direct DB access with Dapper repositories
5. Convert synchronous operations to async

## WebForms Migration

| Legacy (WebForms) | Modern (.NET 8) |
|---|---|
| `.aspx` page + `.aspx.cs` code-behind | Controller action + Razor view (or SPA component) |
| `Page_Load` | Controller action method |
| `ViewState` | Frontend state / hidden fields / session |
| `PostBack` | Form submit / AJAX call |
| `UpdatePanel` | Fetch API / AJAX partial update |
| `GridView` / `Repeater` | Frontend table/list component |
| `Web.config` | `appsettings.json` |
| `<asp:SqlDataSource>` | Dapper Repository |
| `Session["key"]` | `IDistributedCache` / JWT claims |
| `Membership` / `Roles` | ASP.NET Core Identity |
| `ScriptManager` | Standard `<script>` tags / module bundler |
| Master Pages | `_Layout.cshtml` / layout components |
| User Controls (`.ascx`) | Partial views / frontend components |
| `HttpModules` | Middleware |
| `HttpHandlers` | Minimal API endpoints |

### WebForms Migration Strategy

1. Map each `.aspx` page to a controller action + view
2. Replace ViewState with proper state management
3. Convert postback-driven flow to standard HTTP GET/POST
4. Replace server controls with HTML + CSS + JS
5. Migrate master pages to layout system
6. Replace UpdatePanel with modern AJAX patterns

## ASP.NET MVC (Framework) Migration

| Legacy (MVC 5) | Modern (.NET 8) |
|---|---|
| `Global.asax` + `Application_Start` | `Program.cs` with `WebApplicationBuilder` |
| `RouteConfig.RegisterRoutes()` | `app.MapControllers()` + attribute routing |
| `FilterConfig.RegisterGlobalFilters()` | Middleware pipeline + filter registration |
| `BundleConfig.RegisterBundles()` | Vite / webpack / `WebOptimizer` |
| `Web.config` connection strings | `appsettings.json` + `IOptions<T>` |
| `Unity` / `Ninject` / `Autofac` | Built-in DI (`builder.Services`) |
| `System.Web.Mvc.Controller` | `Microsoft.AspNetCore.Mvc.Controller` |
| `ActionResult` | `IActionResult` / `ActionResult<T>` |
| `HttpContext.Current` | Inject `IHttpContextAccessor` |
| `[ValidateAntiForgeryToken]` | `[ValidateAntiForgeryToken]` (similar but different namespace) |
| OWIN Startup | `Program.cs` middleware |
| `web.config` transforms | Environment-based `appsettings.{env}.json` |
| `Areas/` registration | `Areas/` with `[Area("Admin")]` attribute |
| `Scripts/` and `Content/` | `wwwroot/` |
| `ViewBag` / `ViewData` | Strongly-typed view models |

### ASP.NET MVC Migration Strategy

1. Start with `Program.cs` — configure services and middleware pipeline
2. Migrate controllers one by one (namespace changes, base class changes)
3. Migrate views (Razor syntax is mostly compatible, update helpers)
4. Replace `BundleConfig` with modern bundling
5. Update DI registrations to built-in container
6. Migrate authentication/authorization to ASP.NET Core Identity or JWT

## Common Cross-Cutting Concerns

### Authentication

| Legacy | Modern |
|---|---|
| Forms Authentication | Cookie auth / JWT Bearer |
| Windows Authentication | Negotiate / Windows auth middleware |
| `[Authorize]` attribute | `[Authorize]` with policies |
| `FormsAuthentication.SetAuthCookie()` | `HttpContext.SignInAsync()` |

### Logging

| Legacy | Modern |
|---|---|
| `System.Diagnostics.Trace` | `ILogger<T>` |
| `log4net` / `NLog` | `ILogger<T>` + Serilog provider |
| `ConfigurationManager.AppSettings["LogLevel"]` | `appsettings.json` logging section |

### Configuration

| Legacy | Modern |
|---|---|
| `ConfigurationManager.AppSettings["key"]` | `IConfiguration["key"]` |
| `ConfigurationManager.ConnectionStrings["name"]` | `builder.Configuration.GetConnectionString("name")` |
| Custom config sections | `IOptions<T>` pattern with POCO classes |
