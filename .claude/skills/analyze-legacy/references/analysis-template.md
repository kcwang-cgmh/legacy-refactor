# Analysis Report Template

Use this template to generate `docs/analysis-report.md`. Replace all `{placeholders}` with actual values.

---

```text
# Legacy Code 分析報告

> 產出日期：{date}
> 專案名稱：{project_name}
> 分析工具：Claude Code /analyze-legacy

---

## 1. 專案概覽

| 項目 | 說明 |
| --- | --- |
| **專案類型** | {WinForms / WebForms / ASP.NET MVC} |
| **目標框架** | .NET Framework {version} |
| **Solution 結構** | {N} 個專案 |
| **程式碼規模** | ~{N} 個 .cs 檔案，約 {N} 行程式碼 |
| **頁面/表單數** | {N} 個 {Forms/Pages/Views} |
| **資料庫** | {SQL Server / Oracle / MySQL / etc.} |

## 2. 架構概覽

{描述目前的架構，包含：
- 分層架構（UI / Business Logic / Data Access）
- 是否使用設計模式（Repository / Service / etc.）
- 專案間的相依關係
- 第三方元件使用狀況}

### 專案結構

```

{Solution 資料夾結構，列出主要目錄}

```

## 3. 功能清單

| # | 功能模組 | 檔案位置 | 說明 | 複雜度 | 優先級 |
| --- | --- | --- | --- | --- | --- |
| 1 | {功能名稱} | {路徑} | {簡述} | Low/Med/High | P1/P2/P3 |
| 2 | ... | ... | ... | ... | ... |

**複雜度定義：**
- **Low**：簡單 CRUD、資料顯示
- **Medium**：含業務邏輯、多表關聯、驗證規則
- **High**：複雜報表、批次處理、第三方整合、多步驟工作流

## 4. 資料存取分析

### 4.1 存取模式

| 模式 | 使用位置 | 數量 |
| --- | --- | --- |
| {ADO.NET / EF6 / Dapper / DataSet / LINQ to SQL} | {主要使用的專案或區域} | {N} 處 |

### 4.2 連線字串

| 名稱 | 資料庫 | 位置 |
| --- | --- | --- |
| {name} | {database} | {Web.config / App.config} |

### 4.3 Stored Procedures

| 名稱 | 用途 | 複雜度 |
| --- | --- | --- |
| {sp_name} | {description} | Low/Med/High |

（如未使用 SP，標註「未使用 Stored Procedures」）

## 5. 相依套件分析

| 套件名稱 | 目前版本 | .NET 8 對應 | 狀態 |
| --- | --- | --- | --- |
| {package} | {version} | {equivalent or alternative} | ✅ 可用 / ⚠️ 需替代 / ❌ 已棄用 |

## 6. 遷移挑戰

| # | 挑戰 | 嚴重度 | 影響範圍 | 建議處理方式 |
| --- | --- | --- | --- | --- |
| 1 | {challenge description} | High/Med/Low | {affected areas} | {mitigation approach} |

### 常見挑戰分類：
- **框架相依**：System.Web、HttpContext.Current、Global.asax 等
- **第三方元件**：報表工具、UI 控件、ORM 框架
- **資料存取**：直接 SQL、DataSet、Stored Procedures
- **認證授權**：Forms Authentication、Membership Provider
- **Windows 限定**：COM Interop、Registry、Windows Services

## 7. 建議遷移順序

{根據功能之間的相依性和重要性，建議遷移的先後順序}

1. **第一批**：{基礎功能、認證、核心資料模型}
2. **第二批**：{主要業務功能}
3. **第三批**：{次要功能、報表}
4. **第四批**：{輔助功能、管理工具}

---

> 📋 下一步：執行 `/plan-refactor` 產出詳細的遷移計畫
```
