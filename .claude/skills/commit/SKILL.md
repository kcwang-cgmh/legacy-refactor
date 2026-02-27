---
name: commit
description: 自動生成 Conventional Commits 格式的 git commit message（中文）
---

# Commit Message Generator

Generate Conventional Commits formatted messages in Traditional Chinese.

## References

- references/conventional-commits.md

## Workflow

### Step 1: Analyze Changes

Run these commands in parallel to gather context:

```text
git status
git diff --staged
git diff
git log --oneline -5
```

### Step 2: Determine Commit Type

Based on the changes, select the appropriate type:

| Type | When to Use |
| --- | --- |
| `feat` | New feature or capability |
| `fix` | Bug fix |
| `refactor` | Code restructuring without behavior change |
| `style` | Formatting, linting (no logic change) |
| `docs` | Documentation only |
| `test` | Adding or updating tests |
| `perf` | Performance improvement |
| `build` | Build system or dependencies |
| `ci` | CI/CD configuration |
| `chore` | Maintenance tasks |

For detailed type definitions, see references/conventional-commits.md

### Step 3: Identify Scope

Determine scope from the changed files:

- Feature folder name: `auth`, `user`, `course`
- Layer: `api`, `store`, `ui`
- Component name: `navbar`, `dialog`
- Use most specific applicable scope

### Step 4: Generate Message

Format: `type(scope): 動詞 + 描述`

**Message Guidelines:**

- Start with action verb: 新增、修正、重構、更新、移除、優化
- Keep subject under 72 characters
- Focus on WHAT changed, not HOW
- Use Traditional Chinese

**Examples:**

```text
feat(auth): 新增 ADFS 單一登入功能
fix(cart): 修正商品數量無法更新的問題
refactor(api): 重構 HTTP 錯誤處理邏輯
style(lint): 修正 ESLint 格式警告
docs(readme): 更新專案安裝說明
test(user): 新增用戶服務單元測試
perf(query): 優化列表查詢效能
build(deps): 升級 Angular 至 v21
```

### Step 5: Execute Commit

```text
git add <files>
git commit -m "$(cat <<'EOF'
type(scope): 提交訊息
EOF
)"
```

## Breaking Changes

When changes break backward compatibility:

```text
feat(api)!: 變更回傳資料格式

BREAKING CHANGE: response.data 從陣列改為分頁物件
```

## Multi-file Changes

When changes span multiple areas, use the primary purpose:

- Adding feature with tests → `feat`
- Fixing bug with refactor → `fix`
- Multiple unrelated fixes → Consider separate commits
