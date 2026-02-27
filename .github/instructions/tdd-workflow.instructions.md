---
applyTo: "refactored-project/api/**/*.cs,refactored-project/api.Tests/**/*.cs"
---

# TDD 開發工作流程

本專案採用 **Test-Driven Development (TDD)** 開發新 API 功能。每個新功能必須先寫測試，確認失敗（紅燈），再實作程式碼讓測試通過（綠燈），最後重構。

## 循環：紅 → 綠 → 重構

```
RED   → 先寫測試，確認測試失敗（代表功能尚未存在）
GREEN → 寫最小實作使測試通過
REFACTOR → 在測試保護下改善程式碼品質
```

## 每個 Feature 的標準開發順序

1. 定義 `IRepository` 介面（`api/Data/Repositories/`）
2. 定義 `IService` 介面（`api/Services/`）
3. **寫 Service 單元測試** → `dotnet test`（紅燈）
4. 實作 `Service` → `dotnet test`（綠燈）
5. **寫 Controller 單元測試** → `dotnet test`（紅燈）
6. 實作 `Controller` → `dotnet test`（綠燈）
7. 實作 `Repository`（Dapper + Oracle SQL）
8. `dotnet test` 全部通過 → 重構 → `git commit`

## 測試命名規範

格式：`MethodName_Scenario_ExpectedResult`

```csharp
// ✅ 好的命名範例
GetByIdAsync_ExistingId_ReturnsUserResponse()
GetByIdAsync_NonExistingId_ReturnsNull()
CreateAsync_ValidRequest_ReturnsCreatedResponse()
CreateAsync_DuplicateEmail_ThrowsException()

// ❌ 不好的命名
TestGetUser()
Test1()
```

## 測試結構：Arrange-Act-Assert

```csharp
[Fact]
public async Task GetByIdAsync_ExistingId_ReturnsUserResponse()
{
    // Arrange — 準備測試資料與 mock
    var mockRepo = new Mock<IUserRepository>();
    mockRepo.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(new User { Id = 1, Name = "Alice", Email = "alice@test.com" });
    var service = new UserService(mockRepo.Object);

    // Act — 執行被測試的方法
    var result = await service.GetByIdAsync(1);

    // Assert — 驗證結果
    Assert.NotNull(result);
    Assert.Equal(1, result.Id);
    Assert.Equal("Alice", result.Name);
}
```

## 分層測試策略

### Service 單元測試（最重要）

- Mock `IRepository` 介面
- 測試商業邏輯、資料轉換、錯誤處理
- 不觸及資料庫
- 每個 Service 方法至少：一個正向案例 + 一個異常/邊界案例

### Controller 單元測試

- Mock `IService` 介面
- 測試 HTTP 狀態碼是否正確（200、201、404 等）
- 測試 `ApiResponse<T>` 回傳格式
- 測試 route 參數解析

### Repository 整合測試（可選）

- 可使用獨立的 Oracle 測試 Schema
- 或使用 mock `IDbConnection`（較複雜，通常不建議直接測 SQL）
- 主要確認 SQL 語法正確性

## 最低測試覆蓋率要求

- 每個 `IService` 方法 **至少 2 個測試**（正向 + 異常）
- 每個 `IController` action **至少 1 個測試**
- 進入 Code Review 前 `dotnet test` 必須全部通過

## 測試套件

- **xUnit** — 測試框架（`[Fact]`、`[Theory]`）
- **Moq** — Mock 框架（`Mock<T>`、`.Setup()`、`.Verify()`）
- **Microsoft.AspNetCore.Mvc.Testing** — 整合測試（`WebApplicationFactory<Program>`）

參見 `code-templates/test-template.md` 取得完整程式碼範例。
