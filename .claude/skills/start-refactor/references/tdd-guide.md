# TDD 開發指南（xUnit + Moq）

## 建立測試專案

```text
# 建立 xUnit 測試專案
dotnet new xunit -n Api.Tests -o api.Tests/

# 加入主專案參考（測試才能存取 API 型別）
dotnet add api.Tests/ reference api/

# 安裝 Mock 和整合測試套件
dotnet add api.Tests/ package Moq
dotnet add api.Tests/ package Microsoft.AspNetCore.Mvc.Testing

# 加入 Solution
dotnet sln add api.Tests/Api.Tests.csproj

# 建立測試資料夾結構
mkdir -p api.Tests/Controllers api.Tests/Services api.Tests/Fixtures
```

## 測試專案 .csproj 設定

```text
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <IsPackable>false</IsPackable>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.*" />
    <PackageReference Include="xunit" Version="2.*" />
    <PackageReference Include="xunit.runner.visualstudio" Version="2.*" />
    <PackageReference Include="Moq" Version="4.*" />
    <PackageReference Include="Microsoft.AspNetCore.Mvc.Testing" Version="8.*" />
  </ItemGroup>
  <ItemGroup>
    <ProjectReference Include="..\api\Api.csproj" />
  </ItemGroup>
</Project>
```

## 執行測試

```text
# 執行全部測試
dotnet test

# 執行並顯示詳細結果
dotnet test --verbosity normal

# 只執行特定測試類別
dotnet test --filter "FullyQualifiedName~UserServiceTests"

# 執行並產生覆蓋率報告（需安裝 coverlet）
dotnet test --collect:"XPlat Code Coverage"
```

## Moq 基本用法

### Setup — 設定回傳值

```text
var mockRepo = new Mock<IUserRepository>();

// 回傳固定值
mockRepo.Setup(r => r.GetByIdAsync(1))
        .ReturnsAsync(new User { Id = 1, Name = "Alice" });

// 回傳 null（模擬找不到）
mockRepo.Setup(r => r.GetByIdAsync(99))
        .ReturnsAsync((User?)null);

// 任意參數都回傳
mockRepo.Setup(r => r.GetByIdAsync(It.IsAny<int>()))
        .ReturnsAsync(new User { Id = 1, Name = "Test" });

// 拋出例外
mockRepo.Setup(r => r.CreateAsync(It.IsAny<User>()))
        .ThrowsAsync(new Exception("DB Error"));
```

### Verify — 驗證是否被呼叫

```text
// 驗證 DeleteAsync(1) 被呼叫恰好一次
mockRepo.Verify(r => r.DeleteAsync(1), Times.Once);

// 驗證從未被呼叫
mockRepo.Verify(r => r.DeleteAsync(It.IsAny<int>()), Times.Never);
```

## 整合測試（WebApplicationFactory）

```text
// Fixtures/WebApplicationFactoryFixture.cs
namespace Api.Tests.Fixtures;

public class ApiWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // 替換成 Mock Repository（避免真實連 Oracle）
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(IUserRepository));
            if (descriptor != null) services.Remove(descriptor);

            var mockRepo = new Mock<IUserRepository>();
            mockRepo.Setup(r => r.GetAllAsync())
                    .ReturnsAsync([new User { Id = 1, Name = "Test", Email = "t@t.com" }]);
            services.AddScoped<IUserRepository>(_ => mockRepo.Object);
        });
    }
}
```

```text
// Controllers/UsersControllerIntegrationTests.cs
public class UsersControllerIntegrationTests(ApiWebApplicationFactory factory)
    : IClassFixture<ApiWebApplicationFactory>
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task GetAll_ReturnsOkWithUsers()
    {
        var response = await _client.GetAsync("/api/users");
        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadFromJsonAsync<ApiResponse<IEnumerable<UserResponse>>>();
        Assert.NotNull(content);
        Assert.True(content.Success);
    }
}
```

## `[Theory]` 參數化測試

```json
[Theory]
[InlineData(0)]
[InlineData(-1)]
[InlineData(int.MinValue)]
public async Task GetByIdAsync_InvalidId_ReturnsNull(int invalidId)
{
    var mockRepo = new Mock<IUserRepository>();
    mockRepo.Setup(r => r.GetByIdAsync(invalidId)).ReturnsAsync((User?)null);

    var service = new UserService(mockRepo.Object);
    var result = await service.GetByIdAsync(invalidId);

    Assert.Null(result);
}
```

## 測試資料夾結構

```text
api.Tests/
├── Api.Tests.csproj
├── Controllers/
│   └── UsersControllerTests.cs       # Controller 單元測試
├── Services/
│   └── UserServiceTests.cs           # Service 單元測試（最主要）
└── Fixtures/
    └── ApiWebApplicationFactory.cs   # 整合測試 Factory
```
