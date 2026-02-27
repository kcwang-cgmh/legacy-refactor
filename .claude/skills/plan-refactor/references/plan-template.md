# Migration Plan Template

Use this template to generate `docs/migration-plan.md`. Replace all `{placeholders}` with actual values.

---

```text
# .NET 8 遷移計畫

> 產出日期：{date}
> 專案名稱：{project_name}
> 來源框架：.NET Framework {version} ({WinForms/WebForms/MVC})
> 目標框架：.NET 8

---

## 1. 目標架構

```

┌─────────────┐     ┌─────────────┐
│   Frontend   │────▶│   WebAPI     │
│  {framework} │     │  .NET 8      │
│  + Tailwind  │     │  Controllers │
└─────────────┘     └──────┬──────┘
                           │
                    ┌──────┴──────┐
                    │   Services   │
                    │  Business    │
                    │  Logic       │
                    └──────┬──────┘
                           │
                    ┌──────┴──────┐
                    │  Repositories │
                    │  Dapper +      │
                    │  Oracle SQL    │
                    └──────┬──────┘

```

### 技術選型

| 層級 | 技術 | 選擇理由 |
| --- | --- | --- |
| **API** | ASP.NET Core 8 WebAPI | {理由} |
| **Frontend** | {ASP.NET Core MVC / React / Vue / Blazor} + TailwindCSS | {理由} |
| **資料存取** | Dapper + Oracle.ManagedDataAccess.Core | 與現有 Oracle 資料庫相容 |
| **Database** | Oracle | 沿用現有資料庫 |
| **Authentication** | {JWT / Cookie / Identity} | {理由} |
| **Validation** | FluentValidation | 強型別驗證規則 |
| **Logging** | Serilog | 結構化日誌 |
| **Testing** | xUnit + Moq | TDD 測試框架 |

## 2. 環境需求

在執行 `/start-refactor` 之前，請確認開發環境已安裝以下工具：

| 工具 | 版本需求 | 安裝方式 | 備註 |
| --- | --- | --- | --- |
| .NET 8 SDK | >= 8.0 | `winget install Microsoft.DotNet.SDK.8` | 必要 |
| Node.js | >= 18 LTS | `winget install OpenJS.NodeJS.LTS` | {僅在使用 React/Vue 前端時需要，否則移除此列} |
| Git | any | `winget install Git.Git` | 建議 |

> 💡 `/start-refactor` 會自動檢查環境，缺少工具時會提示安裝指引。

## 3. API 端點設計

### {Domain 1} 模組

| Method | Endpoint | 說明 | 來源功能 |
| --- | --- | --- | --- |
| GET | `/api/{domain}` | 取得列表 | {legacy feature reference} |
| GET | `/api/{domain}/{id}` | 取得單筆 | {legacy feature reference} |
| POST | `/api/{domain}` | 新增 | {legacy feature reference} |
| PUT | `/api/{domain}/{id}` | 更新 | {legacy feature reference} |
| DELETE | `/api/{domain}/{id}` | 刪除 | {legacy feature reference} |

### {Domain 2} 模組

{同上格式}

## 4. 前端頁面規劃

| # | 頁面 | 路由 | 功能說明 | 對應 API |
| --- | --- | --- | --- | --- |
| 1 | {頁面名稱} | {/path} | {說明} | {API endpoints} |

## 5. 資料庫遷移策略

### 5.1 策略選擇

{選擇以下其中一種並說明理由}

- **方案 A：沒用現有 Oracle 資料庫** — 直接建立 Dapper POCO Entity 對應現有表，維持原有 Schema
- **方案 B：新建資料庫 Schema** — 重新設計 Entity，撰寫 Oracle DDL 腳本手動執行
- **方案 C：混合** — 沿用核心表格，新增/重構部分表格

### 5.2 Entity 對照

| Legacy Table | New Entity | 變更說明 |
| --- | --- | --- |
| {table_name} | {EntityName} | {新增/修改/不變} |

### 5.3 Stored Procedure 處理

| SP 名稱 | 處理方式 | 說明 |
| --- | --- | --- |
| {sp_name} | 保留（Dapper 呼叫） / 重寫為 C# Service | {理由} |

## 6. 遷移階段

### Phase 1：基礎建設 {scope: Small/Medium/Large}

**目標**：建立專案骨架、認證機制、測試專案、核心資料存取實作

| 工作項目 | 說明 | 預估範圍 |
| --- | --- | --- |
| 建立 WebAPI 專案 | dotnet new webapi | Small |
| 建立測試專案 | dotnet new xunit + Moq | Small |
| 建立前端專案 | {scaffold command} | Small |
| 設定 Dapper + Oracle 連線 | IDbConnection DI 註冊 | Small |
| BaseRepository 模板 | 建立 Repository 基礎結構 | Small |
| 設定認證授權 | {JWT / Identity / etc.} | Medium |
| 全域例外處理 | ExceptionHandlingMiddleware | Small |
| API 回應格式 | ApiResponse<T> 封裝 | Small |

### Phase 2：核心功能 {scope: Small/Medium/Large}

**目標**：遷移 P1 優先級功能

| 工作項目 | 來源 | API Endpoints | 前端頁面 |
| --- | --- | --- | --- |
| {feature 1} | {legacy location} | {endpoints} | {pages} |
| {feature 2} | {legacy location} | {endpoints} | {pages} |

### Phase 3：次要功能 {scope: Small/Medium/Large}

**目標**：遷移 P2 優先級功能

{同上格式}

### Phase 4：增強與優化（視需要）

**目標**：P3 功能、效能優化、快取

{同上格式}

### Phase 5：收尾（視需要）

**目標**：測試、部署設定、文件

| 工作項目 | 說明 |
| --- | --- |
| 單元測試覆蓋率檢查 | `dotnet test` 全部通過 |
| 整合測試 | 端對端測試所有 API |
| 部署設定 | Dockerfile / CI-CD pipeline |
| API 文件 | Swagger / OpenAPI spec |

## 7. 風險評估

| 風險 | 可能性 | 影響度 | 應對方案 |
| --- | --- | --- | --- |
| {risk description} | High/Med/Low | High/Med/Low | {mitigation} |

## 8. 遷移進度追蹤

| Phase | 狀態 | 開始日期 | 完成日期 | 備註 |
| --- | --- | --- | --- | --- |
| Phase 1 | ⬜ 未開始 | - | - | - |
| Phase 2 | ⬜ 未開始 | - | - | - |
| Phase 3 | ⬜ 未開始 | - | - | - |

狀態：⬜ 未開始 | 🔄 進行中 | ✅ 已完成

---

> 📋 確認計畫後，執行 `/start-refactor` 開始遷移
```
