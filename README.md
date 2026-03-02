# Legacy Code Refactoring Framework

AI 協作遷移框架 — 透過 VS Code Copilot Chat 的 slash commands，將 .NET Framework 舊專案遷移至 .NET 8。

## 前置準備

| 工具 | 安裝方式 | 備註 |
| --- | --- | --- |
| VS Code | [下載](https://code.visualstudio.com/) | 主要編輯器 |
| GitHub Copilot Chat 擴充套件 | VS Code Extensions 搜尋 `GitHub Copilot Chat` 安裝 | 需要 GitHub Copilot 訂閱 |
| .NET 8 SDK | `winget install Microsoft.DotNet.SDK.8` 或[下載](https://dotnet.microsoft.com/download/dotnet/8.0) | 必要 |
| Git | `winget install Git.Git` 或[下載](https://git-scm.com/downloads) | 必要 |
| Node.js + npm | `winget install OpenJS.NodeJS.LTS` 或[下載](https://nodejs.org/) | 僅 React/Vue/Angular 前端需要 |
| Legacy Refactor Helper 擴充套件 | 見下方「安裝 VS Code 擴充套件」 | 提供側邊欄 GUI 操作介面 |

安裝完成後，在終端機確認：

```bash
dotnet --version    # 應顯示 8.x
git --version
```

## 安裝 VS Code 擴充套件

本專案附帶 **Legacy Refactor Helper** 擴充套件，提供側邊欄 GUI 介面來管理遷移流程。

```bash
cd vscode-extension
npm install
npm run compile
npx @vscode/vsce package --allow-missing-repository
```

打包完成後安裝產出的 `.vsix` 檔：

```bash
code --install-extension legacy-refactor-helper-*.vsix
```

安裝後 VS Code 左側 Activity Bar 會出現 **Legacy Refactor** 圖示，可從側邊欄直接操作分析、規劃與遷移流程。若 `legacy-codes/` 為空，側邊欄會顯示「匯入舊專案」按鈕，點擊即可選擇資料夾匯入。

## 快速開始（三步驟）

### 1. 放入舊專案

將要遷移的 .NET Framework 專案資料夾放入 `legacy-codes/` 下，或透過側邊欄的「匯入舊專案」按鈕選擇資料夾匯入：

```
legacy-codes/
└── YourProjectName/
    ├── YourProject.sln
    ├── YourProject/
    │   ├── YourProject.csproj
    │   └── ...
    └── ...
```

### 2. 分析 → 規劃

在 Copilot Chat 中依序執行：

1. **`/analyze-legacy`** — 分析舊專案，產出分析報告到 `docs/{專案名稱}/analysis-report.md`
2. **`/plan-refactor`** — 根據分析報告產出遷移計畫到 `docs/{專案名稱}/migration-plan.md`

### 3. 執行遷移

3. **`/start-refactor`** — 依照計畫逐階段建立 .NET 8 新專案，使用 TDD 流程遷移每個功能

每個功能遷移完成後會自動 commit，並記錄進度到 `docs/{專案名稱}/.migration-progress.json`。下次開啟新的 Copilot Chat session 時，輸入 `/start-refactor` 即可從斷點繼續。

## 專案結構

```
legacy-refactor/
├── legacy-codes/                  ← 放置要遷移的舊專案（可多個）
│   ├── ProjectA/
│   └── ProjectB/
├── docs/                          ← 分析報告、遷移計畫、進度追蹤（按專案分類）
│   ├── ProjectA/
│   │   ├── analysis-report.md
│   │   ├── migration-plan.md
│   │   └── .migration-progress.json
│   └── ProjectB/
│       └── ...
├── refactored-projects/           ← 遷移後的新專案
│   └── ProjectA/
├── .github/
│   ├── copilot-instructions.md    ← Copilot Chat 全域指示
│   └── instructions/              ← 各領域的詳細指示
├── vscode-extension/              ← VS Code 擴充套件原始碼
│   ├── package.json
│   ├── src/
│   └── out/
├── .claude/
│   └── skills/                    ← Slash command 定義
│       ├── analyze-legacy/
│       ├── plan-refactor/
│       ├── start-refactor/
│       └── commit/
└── README.md
```

## 常見問題 FAQ

### 分析階段（/analyze-legacy）

- **找不到 .csproj** → 確認專案放在 `legacy-codes/{project-name}/` 下，且包含 .sln 或 .csproj
- **報告內容有誤** → 刪除 `docs/{project}/analysis-report.md`，重跑 `/analyze-legacy`
- **專案類型判斷錯誤** → 手動告知 AI 正確類型，AI 會修正報告

### 規劃階段（/plan-refactor）

- **想修改已產出的計畫** → 直接告訴 AI 要改哪部分，或刪除 `docs/{project}/migration-plan.md` 重跑
- **前端技術選型想改** → 告知 AI 新選擇，AI 會更新計畫中所有相關段落

### 遷移階段（/start-refactor）

- **TDD 測試一直紅燈** → 要求 AI 先檢查測試邏輯，若卡住超過 3 次允許跳過先繼續
- **`dotnet build` 失敗** → 要求 AI 讀取完整錯誤訊息逐一修復
- **想回退** → `git log --oneline -10` 找到對應 commit，用 `git revert`
- **Progress JSON 損壞** → 刪除 `docs/{project}/.migration-progress.json`，重跑 `/start-refactor` 會重建

詳細的錯誤恢復說明請參考各 skill 的 SKILL.md 中的 Troubleshooting 段落。
