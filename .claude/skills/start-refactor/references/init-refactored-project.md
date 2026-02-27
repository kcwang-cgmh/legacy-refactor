# 初始化 refactored-project 資料夾

在執行 start-refactor SKILL 之前，必須先準備 refactored-project 資料夾結構。本文檔說明初始化步驟。

> ℹ️ 本文件中的 `{SolutionName}` 占位符由 **Step 1 命名互動**決定，在實際執行時請替換為使用者確認的 Solution 名稱。

## 前置要求

確保已安裝以下工具：
- .NET 8 SDK 或更新版本
- Git 2.30 或更新版本
- 文本編輯器或 IDE（Visual Studio Code、Visual Studio 等）

## 步驟 1：建立資料夾

在專案根目錄（legacy-refactor 同層級）建立新資料夾：

```bash
mkdir refactored-project
cd refactored-project
```

## 步驟 2：初始化 Git 倉庫

在 refactored-project 資料夾內初始化獨立的 git 倉庫：

> ⚠️ 請將下列命令中的 "Your Name" 和 "your@email.com" 替換為實際的使用者名稱和郵箱

```bash
git init
git config user.name "Your Name"
git config user.email "your@email.com"
```

## 步驟 3：建立基本目錄結構

依前後端技術棧選擇情境 A 或 B（見步驟 6），此時僅建立必要的頂層目錄：

```bash
mkdir src tests
```

## 步驟 4：建立 .gitignore

在 refactored-project 根目錄建立 `.gitignore` 檔案：

```text
# 二進制文件
bin/
obj/

# Visual Studio 緩存
.vs/
.vscode/
*.user
*.rsuser

# 構建結果
*.dll
*.exe
*.so
*.dylib

# NuGet
*.nupkg
*.snupkg
packages/

# Node.js
node_modules/
npm-debug.log
dist/
.env.local

# 系統文件
.DS_Store
Thumbs.db
```

## 步驟 5：建立 README.md

在 refactored-project 根目錄建立 `README.md` 檔案：

```markdown
# {SolutionName} - .NET 8 Migration Project

本項目是從 .NET Framework 遷移至 .NET 8 的新專案。

## 結構

### 情境 A（前後端皆為 .NET）
- `src/{SolutionName}.Api/` - ASP.NET Core WebAPI 專案
- `src/{SolutionName}.Web/` - MVC 或 Blazor 前端專案
- `tests/{SolutionName}.Api.Tests/` - 單元測試專案

### 情境 B（後端 .NET + 前端 React/Vue）
- `src/{SolutionName}.Api/` - ASP.NET Core WebAPI 專案
- `tests/{SolutionName}.Api.Tests/` - 單元測試專案
- `frontend/` - React / Vue 前端（獨立目錄，不加入 sln）

## 參考資料

所有遷移指南位於 `../.github/skills/start-refactor/references/`

## 開發流程

遵循 TDD 工作流程，參照 `../.github/instructions/tdd-workflow.instructions.md`
```

## 步驟 6：建立解決方案檔案

依前後端技術棧選擇對應情境：

### 情境 A：前後端皆為 .NET（MVC / Blazor）

```bash
dotnet new sln -n {SolutionName} -o .
dotnet new webapi -n {SolutionName}.Api -o src/{SolutionName}.Api/
dotnet new mvc -n {SolutionName}.Web -o src/{SolutionName}.Web/   # 或 blazor
dotnet new xunit -n {SolutionName}.Api.Tests -o tests/{SolutionName}.Api.Tests/
dotnet sln add src/{SolutionName}.Api/{SolutionName}.Api.csproj
dotnet sln add src/{SolutionName}.Web/{SolutionName}.Web.csproj
dotnet sln add tests/{SolutionName}.Api.Tests/{SolutionName}.Api.Tests.csproj
```

預期輸出：
```
The template "Solution File" was created successfully.
```

### 情境 B：後端為 .NET，前端為 React / Vue

```bash
dotnet new sln -n {SolutionName} -o .
dotnet new webapi -n {SolutionName}.Api -o src/{SolutionName}.Api/
dotnet new xunit -n {SolutionName}.Api.Tests -o tests/{SolutionName}.Api.Tests/
dotnet sln add src/{SolutionName}.Api/{SolutionName}.Api.csproj
dotnet sln add tests/{SolutionName}.Api.Tests/{SolutionName}.Api.Tests.csproj

# 前端（不進 sln）
npm create vite@latest frontend -- --template react-ts   # 或 vue-ts
cd frontend && npm install
```

## 步驟 7：建立初始提交

```bash
git add -A
git commit -m "chore(project): 初始化 {SolutionName} 遷移專案結構"
```

預期輸出（情境 A 範例）：
```
[master (root-commit) xxxxxxx] chore(project): 初始化 {SolutionName} 遷移專案結構
 N files changed, N insertions(+)
 create mode .gitignore
 create mode README.md
 create mode {SolutionName}.sln
```

## 驗證初始化

確保以下命令成功執行：

```bash
# 檢查 git 狀態
git status

# 檢查目錄結構
ls -la
```

### 預期目錄結構（情境 A）

```
refactored-project/
├── src/
│   ├── {SolutionName}.Api/
│   └── {SolutionName}.Web/
├── tests/
│   └── {SolutionName}.Api.Tests/
├── .git/
├── .gitignore
├── README.md
└── {SolutionName}.sln
```

### 預期目錄結構（情境 B）

```
refactored-project/
├── src/
│   └── {SolutionName}.Api/
├── tests/
│   └── {SolutionName}.Api.Tests/
├── frontend/
│   ├── package.json
│   └── ...
├── .git/
├── .gitignore
├── README.md
└── {SolutionName}.sln
```

初始化完成後，可執行 start-refactor SKILL。
