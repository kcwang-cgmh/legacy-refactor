# Migration Progress Tracking Guide

跨 session 的遷移進度追蹤機制。每次 session 結束時更新，下次 session 開始時自動讀取並續做。

## 進度檔位置

```
docs/.migration-progress.json
```

此檔案位於專案根目錄的 `docs/` 下，**應追蹤於 git**（不加入 .gitignore），以完整記錄遷移歷程。
不放在 `refactored-project/` 內，避免被 commit 進新專案的 git repo。

---

## JSON 結構定義

```json
{
  "schemaVersion": "1.0",
  "projectName": "{SolutionName}",
  "currentPhase": 1,
  "currentStep": 2,
  "currentFeature": null,
  "completedFeatures": [],
  "completedPhases": [],
  "pendingFeatures": [],
  "lastUpdated": "2026-02-27T10:00:00",
  "sessionHistory": [],
  "nextAction": "繼續 Phase 1 Step 2 — 建立 WebAPI 專案骨架"
}
```

### 欄位說明

| 欄位 | 說明 | 範例 |
|------|------|------|
| `schemaVersion` | 進度檔格式版本 | `"1.0"` |
| `projectName` | Solution 名稱（由 Step 1 命名互動決定） | `"OpdSystem"` |
| `currentPhase` | 目前執行的 Phase（1~4） | `2` |
| `currentStep` | 目前執行的 Step（0~6） | `3` |
| `currentFeature` | Step 3 中正在進行的功能名稱；非 Step 3 時為 `null` | `"門診帳務統計查詢"` |
| `completedFeatures` | 當前 Phase 中已完成 TDD 循環的功能列表 | `["Entity POCO 建立"]` |
| `completedPhases` | 已完成的 Phase 號碼列表（Phase 完成時更新，取代修改 migration-plan.md） | `[1, 2]` |
| `pendingFeatures` | 當前 Phase 中尚未完成的功能列表（來自 migration-plan.md） | `["看診次數統計", "CSV 匯出"]` |
| `lastUpdated` | 最後更新時間（ISO 8601） | `"2026-02-27T15:30:00"` |
| `sessionHistory` | 歷次 session 紀錄陣列 | 見下方 |
| `nextAction` | 下個 session 應執行的動作（中文描述） | `"從 Phase 2 Step 3 繼續遷移「看診次數統計」"` |

### sessionHistory 元素結構

```json
{
  "sessionNumber": 1,
  "date": "2026-02-27",
  "phase": 1,
  "stepsCompleted": ["Step 0", "Step 0.2", "Step 0.5", "Step 1", "Step 2"],
  "featuresCompleted": [],
  "summary": "環境檢查 + .editorconfig + Phase 1 專案骨架建立",
  "commitHash": "a1b2c3d"
}
```

---

## 建立初始進度檔

**時機**：Step 0.5 首次執行，進度檔不存在時建立。

```bash
cat > docs/.migration-progress.json << 'EOF'
{
  "schemaVersion": "1.0",
  "projectName": "{SolutionName}",   ← 請替換為 Step 1 確認的 Solution 名稱
  "currentPhase": 1,
  "currentStep": 0,
  "currentFeature": null,
  "completedFeatures": [],
  "completedPhases": [],
  "pendingFeatures": [],
  "lastUpdated": "{{ISO8601_NOW}}",
  "sessionHistory": [],
  "nextAction": "執行 Phase 1 Step 0 — 環境檢查"
}
EOF
```

> 將 `{{ISO8601_NOW}}` 替換為當前時間，格式如 `2026-02-27T10:00:00`。

---

## Session 切割規則

| Session 類型 | 對應 Steps | 完成條件 |
|---|---|---|
| **Session A** — 環境 + Scaffold | Step 0 → Step 2 | Step 2 完成 + `.editorconfig` 建立 + 初始 commit |
| **Session B~N** — 功能遷移 | Step 3（每個 Feature 一個 session） | 該 Feature 測試全部通過 + feature commit |
| **Session Final** — 驗證 + 完成 | Step 4 → Step 6 | Phase 完成狀態更新 + commit |

---

## Session 結束流程（必須執行）

每次 session 結束時，依序執行以下步驟：

### 1. 取得最新 commit hash

```bash
cd refactored-project
git rev-parse --short HEAD
```

### 2. 更新進度檔

根據本次 session 完成的內容，更新 `.migration-progress.json`：

- `currentPhase`：若 Phase 有變更，更新當前 Phase 號碼
- `currentStep`：更新為下一個尚未完成的 Step 號碼
- `currentFeature`：若 Step 3 有進行中的功能，填入名稱；完成後設為 `null`
- `completedFeatures`：將本次完成的功能追加到陣列
- `pendingFeatures`：從陣列移除已完成的功能
- `lastUpdated`：填入當前 ISO 8601 時間
- `sessionHistory`：追加本次 session 紀錄（sessionNumber 遞增）
- `nextAction`：用中文明確描述下個 session 應執行的第一個動作

### 3. Commit 進度檔

```bash
git add docs/.migration-progress.json
git commit -m "chore(progress): Phase {N} Step {S} 進度更新"
```

### 4. 向使用者顯示結束訊息

```
╔══════════════════════════════════════════════════════╗
║  ✅ 本次 Session 完成！                               ║
╠══════════════════════════════════════════════════════╣
║  📍 Phase {N}  /  Step {S}  /  {X}/{Y} 功能已完成   ║
║  📋 下一步：{nextAction}                               ║
║                                                      ║
║  💡 請開啟新的 Copilot Chat session                   ║
║     輸入 /start-refactor 即可從斷點繼續               ║
╚══════════════════════════════════════════════════════╝
```

---

## Session 開始流程（Step 0.5）

新 session 開始時，檢查進度檔並決定是否為續做模式：

### 檢查進度檔

```bash
ls -la docs/.migration-progress.json
```

### 若進度檔存在 — 顯示摘要並詢問

讀取 `.migration-progress.json`，顯示：

```
╔══════════════════════════════════════════════════════╗
║  📂 發現遷移進度                                      ║
╠══════════════════════════════════════════════════════╣
║  Phase：{currentPhase}                                ║
║  Step： {currentStep}                                 ║
║  已完成：{completedFeatures 列表（用逗號分隔）}        ║
║  上次更新：{lastUpdated}                              ║
║  下一步：{nextAction}                                 ║
╚══════════════════════════════════════════════════════╝
```

詢問使用者：「是否從上次進度繼續？」
- **是** → 跳至對應的 Step，從 `nextAction` 指定的動作開始
- **否** → 確認是否要從頭重新開始，並警告這會覆蓋現有進度

### 若進度檔不存在 — 首次執行

建立初始進度檔，繼續正常的 Step 0 → Step 1 → Step 2 流程。
