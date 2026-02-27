---
name: start-refactor
description: 執行 .NET 8 遷移，逐階段建立新專案並使用 TDD 流程遷移功能，搭配 Dapper 和 Oracle
---

# Migration Executor

Execute the migration plan phase by phase, creating new .NET 8 projects and migrating features.

## References

- references/api-scaffold-guide.md
- references/dapper-oracle-guide.md
- references/frontend-scaffold-guide.md
- references/gitignore-template.md
- references/editorconfig-template.md
- references/progress-tracking-guide.md
- references/code-templates/program-cs.md
- references/code-templates/repository-template.md
- references/code-templates/controller-template.md
- references/code-templates/service-template.md
- references/code-templates/test-template.md

## Prerequisites

List all projects that have a migration plan:

```bash
ls docs/*/migration-plan.md
```

- If no plans found, ask the user to run `/plan-refactor` first.
- If only one project has a plan, automatically select it.
- If multiple projects have plans, list them and ask the user which project to work on.

Store the selected project name as `{project-name}` for use in subsequent steps.

## Workflow

### Step 0: Check Development Environment

Run all checks in parallel:

```bash
dotnet --version
dotnet --list-sdks
node --version
npm --version
git --version
```

#### Required Tools

| Tool | Check Command | Minimum Version | Install Guide |
| --- | --- | --- | --- |
| .NET 8 SDK | `dotnet --list-sdks` | 8.0.x | <https://dotnet.microsoft.com/download/dotnet/8.0> |
| Git | `git --version` | any | <https://git-scm.com/downloads> |

#### Conditionally Required (based on migration plan)

| Tool | When Needed | Check Command | Install Guide |
| --- | --- | --- | --- |
| Node.js + npm | React/Vue/Angular/TailwindCSS frontend | `node --version` | <https://nodejs.org/> |

#### Auto-fix Actions

If missing tools are detected:

1. **.NET 8 SDK missing** → Show install instructions and STOP:
    - Windows: `winget install Microsoft.DotNet.SDK.8`
    - Or download from <https://dotnet.microsoft.com/download/dotnet/8.0>
    - Ask user to restart terminal after installation

2. **Node.js missing** (only if plan uses JS frontend) → Show install instructions:
    - Windows: `winget install OpenJS.NodeJS.LTS`
    - Or download from <https://nodejs.org/>

3. **Git missing** → Show install instructions:
    - Windows: `winget install Git.Git`

#### Verify Git Config

Check that git user identity is configured:

```text
git config user.name
git config user.email
```

If either is empty, prompt the user to set them before proceeding:

```text
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

Do NOT proceed to Step 1 until all required tools are verified and git config is set.

### Step 0.2: Verify refactored-projects Directory

Before proceeding, ensure the target project directory is initialized:

**Check directory exists:**

```bash
ls -ld refactored-projects/{project-name}
```

**If directory NOT found:**
- Go back to the project root directory
- Create the directory: `mkdir -p refactored-projects/{project-name}`
- Follow `references/init-refactored-project.md` to set up the directory
- Return to this step once initialized

**If directory exists:**
- Continue to the next check

**Check git repository:**

```bash
cd refactored-projects/{project-name} && git status
```

If git is not initialized, run:

```bash
cd refactored-projects/{project-name}
git init
git config user.name "Your Name"
git config user.email "your@email.com"
```

> ℹ️ Use the same values as Step 0 for consistency, or set different values for this project.

#### Verification Checklist

Before proceeding to Step 1, confirm:

- [ ] `refactored-projects/{project-name}/` directory exists and is accessible
- [ ] `git status` shows successful git initialization in refactored-projects/{project-name}
- [ ] Git user.name and user.email are configured (locally or globally)

✅ **Steps 0 and 0.2 complete!** You are now ready for **Step 0.5: Resume Progress Check**.

### Step 0.5: Resume Progress Check

Check for an existing progress file to determine whether this is a fresh start or a continuation:

```bash
ls -la docs/{project-name}/.migration-progress.json
```

**If the file exists — continuation mode:**

Read `docs/{project-name}/.migration-progress.json` and display a progress summary:

```
╔══════════════════════════════════════════════════════╗
║  📂 發現遷移進度                                      ║
╠══════════════════════════════════════════════════════╣
║  Phase: {currentPhase}                               ║
║  Step:  {currentStep}                                ║
║  已完成: {completedFeatures (逗號分隔)}               ║
║  上次更新: {lastUpdated}                             ║
║  下一步: {nextAction}                                ║
╚══════════════════════════════════════════════════════╝
```

Ask the user: **「是否從上次進度繼續？」**
- **是** → Skip to the step indicated by `currentStep`, begin with `nextAction`
- **否** → Confirm intent to restart from scratch (warn this will overwrite progress)

**If the file does not exist — first run:**

Create the initial progress file:

```bash
cat > docs/{project-name}/.migration-progress.json << 'EOF'
{
  "schemaVersion": "1.0",
  "projectName": "{SolutionName}",
  "currentPhase": 1,
  "currentStep": 1,
  "currentFeature": null,
  "completedFeatures": [],
  "completedPhases": [],
  "pendingFeatures": [],
  "lastUpdated": "",
  "sessionHistory": [],
  "nextAction": "執行 Phase 1 Step 1 — 確認遷移範圍"
}
EOF
```

> ⚠️ 請將 `{SolutionName}` 替換為 Step 1 命名互動中確認的 Solution 名稱。

See references/progress-tracking-guide.md for the full JSON schema and update rules.

✅ **Step 0.5 complete!** You are now ready for **Step 1: Confirm Scope**.

### Step 1: Confirm Scope

Read `docs/{project-name}/migration-plan.md` and perform the following:

#### 1a. 建議 Solution 名稱

從 `migration-plan.md` 擷取系統功能名稱、部門或專案描述，產出 1~3 個命名建議（PascalCase 格式，例如 `{部門}System`、`{Domain}.{CompanyAbbr}`）：

```
根據遷移計畫，建議以下 Solution 名稱：
  1. {建議A}
  2. {建議B}
  3. {建議C}
  4. 自行輸入

請選擇或輸入你偏好的名稱：
```

將使用者確認的名稱存為 `{SolutionName}`，後續所有步驟一律使用此變數。

#### 1b. 確認執行範圍

1. Which Phase to execute? (default: Phase 1 if starting fresh, next incomplete phase if continuing)
2. Any changes to the plan before starting?

### Step 2: Scaffold Projects (Phase 1 Only)

If this is Phase 1, create the project structure based on the frontend technology stack identified in the migration plan.

All scaffold commands should be executed inside `refactored-projects/{project-name}/`.

#### 情境 A：前後端皆為 .NET（MVC / Blazor）

放在同一個 Solution，採分層目錄：

```
refactored-projects/{project-name}/
├── {SolutionName}.sln
├── src/
│   ├── {SolutionName}.Api/          ← WebAPI 專案
│   └── {SolutionName}.Web/          ← MVC 或 Blazor 前端
└── tests/
    └── {SolutionName}.Api.Tests/
```

```bash
dotnet new sln -n {SolutionName} -o .
dotnet new webapi -n {SolutionName}.Api -o src/{SolutionName}.Api/
dotnet new mvc -n {SolutionName}.Web -o src/{SolutionName}.Web/   # 或 blazor
dotnet new xunit -n {SolutionName}.Api.Tests -o tests/{SolutionName}.Api.Tests/
dotnet sln add src/{SolutionName}.Api/{SolutionName}.Api.csproj
dotnet sln add src/{SolutionName}.Web/{SolutionName}.Web.csproj
dotnet sln add tests/{SolutionName}.Api.Tests/{SolutionName}.Api.Tests.csproj
```

#### 情境 B：後端為 .NET，前端為 React / Vue / Angular（非 .NET）

.NET Solution 僅包含後端；前端另立獨立目錄（不加入 sln）：

```
refactored-projects/{project-name}/
├── {SolutionName}.sln               ← 僅含後端 + 測試
├── src/
│   └── {SolutionName}.Api/
├── tests/
│   └── {SolutionName}.Api.Tests/
└── frontend/                        ← React / Vue / Angular 根目錄（獨立）
    ├── package.json
    └── ...
```

```bash
dotnet new sln -n {SolutionName} -o .
dotnet new webapi -n {SolutionName}.Api -o src/{SolutionName}.Api/
dotnet new xunit -n {SolutionName}.Api.Tests -o tests/{SolutionName}.Api.Tests/
dotnet sln add src/{SolutionName}.Api/{SolutionName}.Api.csproj
dotnet sln add tests/{SolutionName}.Api.Tests/{SolutionName}.Api.Tests.csproj

# 前端（不進 sln）
npm create vite@latest frontend -- --template react-ts   # React
npm create vite@latest frontend -- --template vue-ts     # Vue
npx @angular/cli@latest new frontend --style css --ssr false --routing true  # Angular
cd frontend && npm install
```

After scaffolding, set up the foundation:

- Configure `Program.cs` using references/code-templates/program-cs.md
- Register `IDbConnection` (OracleConnection) and Repository DI — see references/code-templates/repository-template.md
- Set up global exception handling middleware
- Configure CORS for frontend ↔ API communication
- Set up authentication if needed
- Install common NuGet packages:

```bash
cd src/{SolutionName}.Api
dotnet add package Dapper
dotnet add package Oracle.ManagedDataAccess.Core
dotnet add package FluentValidation.AspNetCore
dotnet add package Serilog.AspNetCore
dotnet add package Serilog.Sinks.Console
dotnet add package Swashbuckle.AspNetCore
```

- Add test project references:

```bash
cd tests/{SolutionName}.Api.Tests
dotnet add reference ../../src/{SolutionName}.Api/{SolutionName}.Api.csproj
dotnet add package Moq
dotnet add package Microsoft.AspNetCore.Mvc.Testing
```

#### Scaffold Review Checkpoint

Scaffold 完成後、commit 之前，顯示建立的專案結構並請使用者確認：
- 專案名稱正確
- 目錄結構符合預期
- NuGet 套件清單正確

確認後才進行 git commit。

#### Initialize Version Control

After scaffolding is complete, set up git:

1. Generate standard .NET gitignore:

```bash
    dotnet new gitignore
    ```

2. Append project-specific exclusion rules from references/gitignore-template.md

3. Create `.editorconfig` from references/editorconfig-template.md to enforce consistent code style:

```bash
    # Run the cat > .editorconfig command as defined in references/editorconfig-template.md
    ```

4. Initialize repository and create initial commit:

```bash
    git add -A
    git commit -m "chore(project): 初始化 {SolutionName} 遷移專案（含 .editorconfig）"
    ```

5. Update progress file and commit:

```bash
    # Update docs/{project-name}/.migration-progress.json: set currentStep=3, nextAction="進入 Phase 1 Step 3 — 遷移第一個功能"
    git add docs/{project-name}/.migration-progress.json
    git commit -m "chore(progress): 完成 Phase 1 Step 2 — 專案骨架已建立"
    ```

6. Notify session end — display the session completion message (see references/progress-tracking-guide.md) and ask the user to open a new Copilot Chat session before continuing to Step 3.

### Step 3: Migrate Features (TDD Workflow)

For each feature in the current phase, follow the **TDD red-green-refactor cycle**:

1. **Read legacy code** — Find and read the relevant files in `legacy-codes/`
2. **Define interfaces** — Create `IRepository` and `IService` interfaces first
3. **Write Service tests (RED)** — Write unit tests for the Service using `Mock<IRepository>`, confirm they fail:

```text
    dotnet test  # Should show failing tests
    ```

4. **Implement Service (GREEN)** — Write `Service` implementation until tests pass:

```text
    dotnet test  # Should now pass
    ```

5. **Write Controller tests (RED)** — Write unit tests for the Controller using `Mock<IService>`, confirm they fail
6. **Implement Controller (GREEN)** — Write `Controller` implementation until tests pass:
    - Use references/code-templates/controller-template.md as a starting point
7. **Implement Repository** — Write `Repository` with Dapper + Oracle SQL:
    - Use references/code-templates/repository-template.md as a starting point
    - See references/dapper-oracle-guide.md for Oracle syntax and patterns
8. **Create Frontend** — Build the corresponding UI page/component (in `web/`)
9. **Register Services** — Add DI registration in `Extensions/ServiceCollectionExtensions.cs`
10. **Final verify** — Run all tests and build:

```text
    dotnet test
    dotnet build
    ```

11. **Feature Review Checkpoint** — 在 commit 之前，向使用者摘要本次功能的實作內容：
    - 建立了哪些檔案
    - API endpoint 路徑
    - 測試數量和覆蓋範圍
    - 與遷移計畫的差異（如有）

    使用者確認後才 commit。

12. **Commit Feature** — After all tests pass and user confirms:

```text
    git add -A
    git commit -m "feat({scope}): 新增{功能描述}"
    ```

13. **Update progress and end session** — After committing the feature:
    - Update `docs/{project-name}/.migration-progress.json`:
        - Move `currentFeature` to `completedFeatures`
        - Remove it from `pendingFeatures`
        - Set `currentFeature` to the next pending feature (or `null` if none remain)
        - Update `lastUpdated` and `nextAction`
        - Append a new entry to `sessionHistory`
    - Commit the progress file:

    ```bash
    git add docs/{project-name}/.migration-progress.json
    git commit -m "chore(progress): 完成{功能描述}進度更新"
    ```

    - Display the session end message:

    ```
    ╔══════════════════════════════════════════════════════╗
    ║  ✅ 本次 Session 完成！                               ║
    ╠══════════════════════════════════════════════════════╣
    ║  📍 Phase {N}  /  Step 3  /  {X}/{Y} 功能已完成     ║
    ║  📋 下一步：{nextAction}                               ║
    ║                                                      ║
    ║  💡 請開啟新的 Copilot Chat session                   ║
    ║     在側邊欄點擊「執行」按鈕即可從斷點繼續            ║
    ╚══════════════════════════════════════════════════════╝
    ```

    - If the user explicitly asks to continue in the same session, allow it — but warn that the context window may be too full for reliable results.

**IMPORTANT rules:**

- MUST NOT copy legacy code verbatim — rewrite following modern patterns
- MUST use `async/await` for all I/O operations
- MUST use Dapper + Oracle for data access (NOT EF Core, NOT raw ADO.NET directly)
- MUST use `IOptions<T>` for configuration
- MUST write tests BEFORE implementation (TDD)
- SHOULD use `record` types for DTOs
- SHOULD use file-scoped namespaces

### Step 4: Verify Build & Tests

After implementing all features in the phase:

```text
# Run tests first
dotnet test

# Then build to check for compilation errors
dotnet build
```

Fix any failures before proceeding. If any fixes were made, commit them:

```text
git add -A
git commit -m "fix(build): 修正 Phase {N} 建置/測試錯誤"
```

### Step 5: Build and Verify

After verifying all tests pass, run a final build check.

### Step 6: Phase Completion

After completing a phase:

1. Report what was implemented:
    - List of features migrated
    - API endpoints created
    - Frontend pages built
    - Any deviations from the plan and why
2. Update `docs/{project-name}/.migration-progress.json`：將當前 Phase 加入 `completedPhases` 陣列，並更新 `nextAction`：

```bash
    # 範例：Phase 1 完成後
    # "completedPhases": [1]
    git add docs/{project-name}/.migration-progress.json
    git commit -m "chore(progress): 完成 Phase {N} 所有步驟"
    ```

3. Ask if the user wants to proceed to the next phase
4. If continuing, go back to Step 1 with the next phase

## Code Quality Checklist

Before marking a phase complete, verify:

- [ ] All code compiles without warnings
- [ ] `dotnet test` passes — all unit tests green
- [ ] Every new Service method has at least one unit test
- [ ] File-scoped namespaces used throughout
- [ ] All services and repositories registered in DI
- [ ] API returns `ApiResponse<T>` format consistently
- [ ] No `System.Web` references in new code
- [ ] No synchronous I/O calls
- [ ] No EF Core / `DbContext` usage
- [ ] Oracle parameter syntax uses `:paramName` (not `@paramName`)
- [ ] Connection strings in `appsettings.json` (not hardcoded)

## Session Management

Context window exhaustion is the most common cause of incomplete migrations. Follow these rules to keep each session manageable:

### Session Boundaries

| Session Type | Covers | End Condition |
|---|---|---|
| **Session A** — 環境 + Scaffold | Step 0 → Step 2 | Step 2 完成 + `.editorconfig` 建立 + 初始 commit |
| **Session B~N** — 功能遷移 | Step 3（每個 Feature 一個 session） | 該 Feature 所有測試通過 + feature commit |
| **Session Final** — 驗證 + 完成 | Step 4 → Step 6 | Phase 完成狀態 commit |

### Session End Protocol

At the end of **every** session:

1. Update `docs/{project-name}/.migration-progress.json` with current state and `nextAction`
2. Commit the progress file: `git commit -m "chore(progress): ..."`
3. Display the session end message (defined in references/progress-tracking-guide.md)
4. **Do NOT proceed to the next feature or step in the same session**

### Session Resume Protocol

At the start of every session, Step 0.5 will:

1. Detect `docs/{project-name}/.migration-progress.json`
2. Display progress summary
3. Skip completed steps and jump directly to `nextAction`

Full details: references/progress-tracking-guide.md

## Output

Progress is tracked by:

1. **`docs/{project-name}/migration-plan.md`** — 遷移計畫（唯讀參考，不記錄狀態）
2. **`docs/{project-name}/.migration-progress.json`** — 所有進度追蹤，包含 Phase、Step、Feature 層級，支援跨 session 續做

## Troubleshooting

### TDD 測試一直紅燈

要求 AI 先檢查測試邏輯是否正確，再檢查實作。若同一個測試卡住超過 3 次，允許跳過該測試先繼續後續功能，稍後再回來處理。

### `dotnet build` 失敗

要求 AI 讀取完整錯誤訊息並逐一修復。常見原因：
- 缺少 NuGet 套件 → `dotnet add package {套件名稱}`
- Namespace 衝突 → 檢查 `using` 語句和專案參考
- Oracle 參數語法錯誤 → 確認使用 `:paramName` 而非 `@paramName`

### 想回退到上一個功能的狀態

執行 `git log --oneline -10` 找到對應的 commit hash，然後用 `git revert {hash}` 回退。或者告知 AI 你想回到哪個功能的狀態，AI 會協助操作。

### Progress JSON 損壞

刪除 `docs/{project-name}/.migration-progress.json`，重新執行 `/start-refactor`，系統會自動重建進度檔案。
