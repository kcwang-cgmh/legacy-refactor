---
name: plan-refactor
description: 根據分析報告產出 .NET 8 遷移計畫，包含 API 設計、前端建議、資料遷移方案
---

# Migration Plan Generator

Generate a phased migration plan from .NET Framework to .NET 8 based on the analysis report.

## References

- references/frontend-comparison.md
- references/data-migration-patterns.md
- references/plan-template.md

## Prerequisites

List all projects that have an analysis report:

```bash
ls docs/*/analysis-report.md
```

- If no reports found, ask the user to run `/analyze-legacy` first.
- If only one project has a report, automatically select it.
- If multiple projects have reports, list them and ask the user which project to plan.

Store the selected project name as `{project-name}` for use in subsequent steps.

## Workflow

### Step 1: Read Analysis Report

Read `docs/{project-name}/analysis-report.md` thoroughly. Extract:

- Project type (WinForms/WebForms/MVC)
- Feature inventory with complexity and priority
- Data access patterns
- Dependencies and their .NET 8 equivalents
- Migration challenges

### Step 2: Recommend Frontend Framework

Based on the analysis, recommend a frontend approach. See references/frontend-comparison.md for detailed comparison.

**Decision Matrix:**

| Criteria | ASP.NET Core MVC | React + TailwindCSS | Vue + TailwindCSS | Angular + TailwindCSS | Blazor |
| --- | --- | --- | --- | --- | --- |
| Simple CRUD app | **Best** | OK | OK | OK | Good |
| Complex interactive UI | OK | **Best** | **Best** | **Best** | Good |
| Team knows .NET only | **Best** | Poor | Poor | Poor | **Best** |
| Team knows JS/TS | Good | **Best** | **Best** | **Best** | OK |
| Real-time features needed | Good | **Best** | **Best** | Good | Good |
| SEO important | **Best** | Good* | Good* | Good* | OK |
| Mobile app later | Poor | **Best** | **Best** | Good | OK |
| Large enterprise app | Good | Good | Good | **Best** | Good |

*With SSR/SSG setup

**Default:** ASP.NET Core MVC + TailwindCSS (unless analysis shows reasons to recommend otherwise)

Present the recommendation to the user with rationale and ask for confirmation before proceeding.

### Step 3: Design API Architecture

Based on the feature inventory, design the API:

1. **Group features into domains** (e.g., Users, Products, Orders)
2. **Design RESTful endpoints** for each domain
3. **Identify shared concerns**: authentication, authorization, logging, validation
4. **Plan the data model**: map legacy entities to Dapper POCO entities and design Repository interfaces

API endpoint format:

```json
[HTTP Method] /api/{domain}/{action}

GET    /api/users          → List users
GET    /api/users/{id}     → Get user by ID
POST   /api/users          → Create user
PUT    /api/users/{id}     → Update user
DELETE /api/users/{id}     → Delete user
```

### Step 4: Plan Migration Phases

Divide the migration into 3-5 phases based on:

- **Dependencies**: migrate foundational features first
- **Priority**: P1 features before P2/P3
- **Complexity**: mix simple and complex features per phase

**Standard Phase Structure:**

| Phase | Focus | Typical Content |
| --- | --- | --- |
| Phase 1 | Foundation | Project scaffold, auth, DB setup, core models |
| Phase 2 | Core Features | P1 features, main CRUD operations |
| Phase 3 | Secondary Features | P2 features, reports, batch operations |
| Phase 4 | Enhancement | P3 features, optimization, caching |
| Phase 5 | Finalization | Testing, deployment config, documentation |

Each phase should include:

- Features to migrate (with references to analysis report)
- API endpoints to implement
- Frontend pages/components to build
- Database changes required
- Estimated scope (Small/Medium/Large)

### Step 5: Plan Data Migration

See references/dapper-oracle-guide.md and references/data-migration-patterns.md for detailed strategies.

Key decisions:

1. **Schema changes?** — Write Oracle DDL scripts (no EF Core migrations in this project)
2. **Stored procedures?** — Decide: keep as-is (call via Dapper), or rewrite as C# service methods
3. **Data transformation?** — Plan SQL scripts for any data format changes
4. **Repository design** — Define `IRepository` interfaces for each domain entity

### Step 6: Generate Plan

Output the migration plan to `docs/{project-name}/migration-plan.md` using the template in references/plan-template.md

**IMPORTANT:** 計畫中必須包含「環境需求」段落（參考模板中的對應區塊），根據技術選型列出所有必要和可選的開發工具及其安裝方式。如果計畫使用 JS 前端框架，Node.js 應標記為「必要」；否則標記為「視需要」。

### Step 7: User Review Checkpoint

產出計畫後，必須請使用者確認以下項目再結束：

1. **前端技術選型** — 確認選擇的框架符合團隊技能
2. **Phase 劃分** — 確認優先順序和分組合理
3. **API 設計** — 確認 endpoint 命名和分組
4. **資料遷移策略** — 確認 Schema 策略（A/B/C）

若使用者有異議，回到對應步驟修改後重新產出。
只有在使用者明確表示「確認」或「OK」後，才將計畫寫入檔案。

## Output

The final plan is written to: `docs/{project-name}/migration-plan.md`

After generating, inform the user:

- Summary of the plan (# phases, recommended frontend, key decisions)
- Any items that need user input before proceeding
- Suggest running `/start-refactor` after they review and approve the plan

## Troubleshooting

### 想修改已產出的計畫

直接告訴 AI 要改哪部分，AI 會即時修改。或者刪除 `docs/{project-name}/migration-plan.md` 後重新執行 `/plan-refactor`。

### 前端技術選型想改

告知 AI 新的技術選擇（例如「改用 Vue 而非 React」），AI 會更新計畫中所有相關段落，包括 scaffold 指令、前端結構和套件清單。

### Phase 規劃不合理

說明你期望的調整（例如「把報表功能移到 Phase 2」），AI 會重新編排 Phase 內容和依賴關係。
