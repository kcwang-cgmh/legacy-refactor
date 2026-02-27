# Project Type Detection Rules

## Detection by .csproj Content

### WinForms Detection

```text
<!-- Any of these indicate WinForms -->
<OutputType>WinExe</OutputType>
<Reference Include="System.Windows.Forms" />
<ProjectTypeGuids>{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}</ProjectTypeGuids>
```

File indicators:

- `*.Designer.cs` files with `InitializeComponent()` calls
- Classes inheriting from `Form`, `UserControl`, `Panel`
- `Application.Run(new MainForm())` in `Program.cs`
- `App.config` (not `Web.config`)

### WebForms Detection

```text
<!-- Any of these indicate WebForms -->
<ProjectTypeGuids>{349c5851-65df-11da-9384-00065b846f21}</ProjectTypeGuids>
<Reference Include="System.Web" />
<!-- No System.Web.Mvc reference -->
```

File indicators:

- `.aspx` files with `<%@ Page ... %>` directive
- `.aspx.cs` code-behind files
- `.ascx` user control files
- `.master` master page files
- `Global.asax` / `Global.asax.cs`
- `Web.config` with `<system.web>` section

### ASP.NET MVC Detection

```text
<!-- MVC indicators -->
<Reference Include="System.Web.Mvc" />
<ProjectTypeGuids>{E3E379DF-F4C6-4180-9B81-6769533ABE47}</ProjectTypeGuids>
<!-- Also check for -->
<package id="Microsoft.AspNet.Mvc" />
```

File indicators:

- `Controllers/` directory with `*Controller.cs` files
- `Views/` directory with `.cshtml` files (Razor)
- `App_Start/RouteConfig.cs`
- `App_Start/FilterConfig.cs`
- `App_Start/BundleConfig.cs`
- `Global.asax.cs` with `RouteConfig.RegisterRoutes()`

## Detection Priority

If multiple indicators are found (e.g., an MVC project that also has WebForms pages):

1. Check for `System.Web.Mvc` reference → ASP.NET MVC
2. Check for `.aspx` files → WebForms
3. Check for `System.Windows.Forms` → WinForms
4. If still unclear → report as mixed and list all indicators

## Framework Version Detection

Read from `.csproj`:

```text
<TargetFrameworkVersion>v4.8</TargetFrameworkVersion>
<TargetFrameworkVersion>v4.7.2</TargetFrameworkVersion>
<TargetFrameworkVersion>v4.5</TargetFrameworkVersion>
```

Or from `packages.config`:

```text
<packages>
  <package id="..." version="..." targetFramework="net48" />
</packages>
```
