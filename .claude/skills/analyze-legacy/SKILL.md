---
name: analyze-legacy
description: 分析 legacy-codes/ 中的舊專案，產出完整分析報告
---

# Legacy Code Analyzer

Analyze .NET Framework legacy projects and generate a comprehensive analysis report.

## References

- references/project-type-detection.md
- references/common-dependencies.md
- references/analysis-template.md

## Prerequisites

Before starting, list all project directories under `legacy-codes/`:

```text
ls -d legacy-codes/*/
```

- If empty, ask the user to place their legacy project in `legacy-codes/` first.
- If only one subdirectory exists, automatically select it as the target project.
- If multiple subdirectories exist, list them and ask the user which project to analyze.

Store the selected directory name as `{project-name}` for use in subsequent steps.

Verify the selected project contains project files:

```text
find legacy-codes/{project-name}/ -name "*.sln" -o -name "*.csproj" | head -20
```

## Workflow

### Step 1: Identify Project Type

Search for project type indicators in `.csproj` files:

```text
# Find all project files
find legacy-codes/ -name "*.csproj" -o -name "*.vbproj"
```

Read each `.csproj` and check for type indicators. See references/project-type-detection.md for detection rules.

**Classification:**

| Indicator | Project Type |
| --- | --- |
| `<ProjectTypeGuids>` contains `FAE04EC0-301F-11D3-BF4B-00C04F79EFBC` + Windows refs | WinForms |
| `<ProjectTypeGuids>` contains `349c5851-65df-11da-9384-00065b846f21` | WebForms |
| References to `System.Web.Mvc` | ASP.NET MVC |
| `<OutputType>WinExe</OutputType>` + `System.Windows.Forms` | WinForms |
| `.aspx` files present | WebForms |
| `Controllers/` folder + `RouteConfig.cs` | ASP.NET MVC |

### Step 2: Scan Architecture

Gather project statistics:

```text
# Count files by type
find legacy-codes/ -name "*.cs" | wc -l
find legacy-codes/ -name "*.aspx" | wc -l
find legacy-codes/ -name "*.cshtml" | wc -l
find legacy-codes/ -name "*.config" | wc -l

# Show directory structure (top 3 levels)
find legacy-codes/ -type d -maxdepth 3
```

Read key files to understand architecture:

- Solution file (`.sln`) — project dependencies
- Main `.csproj` — framework version, references, NuGet packages
- `Web.config` or `App.config` — configuration, connection strings
- `Global.asax.cs` — application startup
- `Startup.cs` or `RouteConfig.cs` — routing setup

### Step 3: Analyze Dependencies

Check for NuGet packages:

```text
# packages.config style
find legacy-codes/ -name "packages.config"

# PackageReference style (in .csproj)
grep -r "PackageReference" legacy-codes/ --include="*.csproj"
```

Map each dependency to its .NET 8 equivalent. See references/common-dependencies.md for the mapping table.

### Step 4: Identify Data Access Patterns

Search for data access code:

```text
# ADO.NET
grep -rl "SqlConnection\|SqlCommand\|SqlDataAdapter" legacy-codes/ --include="*.cs"

# Entity Framework 6
grep -rl "DbContext\|DbSet\|Database.SetInitializer" legacy-codes/ --include="*.cs"

# Dapper
grep -rl "Dapper\|QueryAsync\|ExecuteAsync" legacy-codes/ --include="*.cs"

# DataSet/DataTable
grep -rl "DataSet\|DataTable\|DataAdapter" legacy-codes/ --include="*.cs"

# LINQ to SQL
grep -rl "DataContext\|Table<" legacy-codes/ --include="*.cs"

# Connection strings
grep -r "connectionString\|ConnectionString" legacy-codes/ --include="*.config"
```

### Step 5: Inventory All Features

Based on project type, enumerate features:

**For WinForms:** List all Form classes and their purposes

```text
grep -rn "class.*: Form\|class.*: UserControl" legacy-codes/ --include="*.cs"
```

**For WebForms:** List all .aspx pages

```text
find legacy-codes/ -name "*.aspx" | sort
```

**For ASP.NET MVC:** List all controllers and actions

```text
grep -rn "class.*Controller" legacy-codes/ --include="*.cs"
grep -rn "public.*ActionResult\|public.*IActionResult\|public.*JsonResult" legacy-codes/ --include="*.cs"
```

### Step 6: Assess Migration Challenges

Look for patterns that are difficult to migrate:

- COM interop / P/Invoke calls
- Third-party controls (DevExpress, Telerik, Infragistics)
- Crystal Reports or SSRS integration
- Windows-specific APIs (Registry, WMI, Services)
- Custom HTTP modules/handlers
- Heavy ViewState usage
- Direct session state manipulation
- Significant stored procedure logic

### Step 7: Generate Report

Create the output directory and generate the report:

```bash
mkdir -p docs/{project-name}
```

Output the analysis to `docs/{project-name}/analysis-report.md` using the template in references/analysis-template.md

**IMPORTANT:**

- Use Traditional Chinese for all descriptions and analysis text
- Keep the report factual — do not include migration recommendations (that's for `/plan-refactor`)
- Assign complexity ratings (Low/Medium/High) to each feature based on migration difficulty
- Assign priority (P1/P2/P3) based on business importance (ask user if unclear)
- List ALL features found, even small utility forms/pages

## Output

The final report is written to: `docs/{project-name}/analysis-report.md`

**IMPORTANT:** 在報告結尾加入「環境準備」段落，提醒使用者在執行 `/start-refactor` 之前需要安裝的工具：

```text
## 環境準備

在執行 `/plan-refactor` 和 `/start-refactor` 之前，請確認已安裝以下工具：

| 工具 | 安裝方式 | 備註 |
| --- | --- | --- |
| .NET 8 SDK | `winget install Microsoft.DotNet.SDK.8` 或 https://dotnet.microsoft.com/download/dotnet/8.0 | 必要 |
| Git | `winget install Git.Git` 或 https://git-scm.com/downloads | 必要 |
| EF Core CLI | `dotnet tool install --global dotnet-ef` | 資料庫遷移時需要 |
| Node.js + npm | `winget install OpenJS.NodeJS.LTS` 或 https://nodejs.org/ | 僅在使用 React/Vue 前端時需要 |
```

After generating, inform the user:

- Summary of findings (project type, scale, key challenges)
- 提示使用者在 VS Code 側邊欄的「Legacy Refactor」面板中，點擊「規劃」按鈕以進行下一步

## Troubleshooting

### 報告內容有誤或不完整

刪除 `docs/{project-name}/analysis-report.md`，重新執行 `/analyze-legacy`。AI 會重新掃描並產出完整報告。

### 找不到 .csproj

確認專案放在 `legacy-codes/{project-name}/` 下，且該目錄中包含 `.sln` 或 `.csproj` 檔案。如果專案結構較深，AI 會遞迴搜尋子目錄。

### 專案類型判斷錯誤

手動告知 AI 正確的專案類型（例如「這是 WebForms 專案，不是 MVC」），AI 會根據你的指示修正報告中的分類和相關分析。
