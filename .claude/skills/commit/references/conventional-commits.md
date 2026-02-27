# Conventional Commits Reference

## Commit Types

| Type | Description | Example |
| --- | --- | --- |
| `feat` | New feature | `feat(auth): 新增用戶登入功能` |
| `fix` | Bug fix | `fix(cart): 修正購物車數量計算錯誤` |
| `docs` | Documentation only | `docs(readme): 更新安裝說明` |
| `style` | Code style (formatting, semicolons) | `style(lint): 修正 ESLint 警告` |
| `refactor` | Code refactoring (no feature/fix) | `refactor(api): 重構 API 呼叫邏輯` |
| `perf` | Performance improvement | `perf(query): 優化資料庫查詢效能` |
| `test` | Adding/updating tests | `test(user): 新增用戶服務單元測試` |
| `build` | Build system or dependencies | `build(deps): 升級 Angular 至 v21` |
| `ci` | CI/CD configuration | `ci(github): 新增自動部署流程` |
| `chore` | Other changes (no src/test) | `chore(config): 更新環境設定檔` |
| `revert` | Revert a previous commit | `revert: 還原 feat(auth) 變更` |

## Scope Guidelines

Scope is optional but recommended. Common patterns:

- **Feature area**: `auth`, `cart`, `user`, `payment`
- **Layer**: `api`, `ui`, `db`, `config`
- **Component**: `navbar`, `sidebar`, `modal`
- **File type**: `deps`, `config`, `types`

## Breaking Changes

For breaking changes, add `!` after type/scope:

```text
feat(api)!: 變更 API 回傳格式

BREAKING CHANGE: API 回傳格式從陣列改為物件
```

## Message Guidelines

### Subject Line (First Line)

- Use imperative mood: "新增" not "新增了"
- No period at end
- Max 72 characters
- Focus on WHAT changed

### Body (Optional)

- Explain WHY the change was made
- Use when the subject alone is not sufficient
- Wrap at 72 characters

### Footer (Optional)

- Reference issues: `Closes #123`, `Fixes #456`
- Breaking change details
- Co-authors: `Co-authored-by: Name <email>`
