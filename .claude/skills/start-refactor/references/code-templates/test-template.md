# Test Template（xUnit + Moq）

## Service 單元測試範本（最重要）

```text
using Api.Data.Repositories;
using Api.Models.DTOs;
using Api.Models.Entities;
using Api.Services;
using Moq;

namespace Api.Tests.Services;

public class UserServiceTests
{
    private readonly Mock<IUserRepository> _mockRepo;
    private readonly IUserService _sut; // System Under Test

    public UserServiceTests()
    {
        _mockRepo = new Mock<IUserRepository>();
        _sut = new UserService(_mockRepo.Object);
    }

    // ─── GetAllAsync ───────────────────────────────────────────

    [Fact]
    public async Task GetAllAsync_HasUsers_ReturnsAllMappedResponses()
    {
        // Arrange
        _mockRepo.Setup(r => r.GetAllAsync())
                 .ReturnsAsync([
                     new User { Id = 1, Name = "Alice", Email = "alice@test.com" },
                     new User { Id = 2, Name = "Bob",   Email = "bob@test.com" }
                 ]);

        // Act
        var result = await _sut.GetAllAsync();

        // Assert
        var list = result.ToList();
        Assert.Equal(2, list.Count);
        Assert.Equal("Alice", list[0].Name);
    }

    [Fact]
    public async Task GetAllAsync_NoUsers_ReturnsEmptyCollection()
    {
        _mockRepo.Setup(r => r.GetAllAsync()).ReturnsAsync([]);

        var result = await _sut.GetAllAsync();

        Assert.Empty(result);
    }

    // ─── GetByIdAsync ──────────────────────────────────────────

    [Fact]
    public async Task GetByIdAsync_ExistingId_ReturnsUserResponse()
    {
        // Arrange
        _mockRepo.Setup(r => r.GetByIdAsync(1))
                 .ReturnsAsync(new User { Id = 1, Name = "Alice", Email = "alice@test.com" });

        // Act
        var result = await _sut.GetByIdAsync(1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(1, result.Id);
        Assert.Equal("Alice", result.Name);
    }

    [Fact]
    public async Task GetByIdAsync_NonExistingId_ReturnsNull()
    {
        _mockRepo.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((User?)null);

        var result = await _sut.GetByIdAsync(99);

        Assert.Null(result);
    }

    // ─── CreateAsync ───────────────────────────────────────────

    [Fact]
    public async Task CreateAsync_ValidRequest_ReturnsNewUserResponse()
    {
        // Arrange
        var request = new CreateUserRequest("Alice", "alice@test.com");
        _mockRepo.Setup(r => r.CreateAsync(It.IsAny<User>())).ReturnsAsync(42);

        // Act
        var result = await _sut.CreateAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(42, result.Id);
        Assert.Equal("Alice", result.Name);
        _mockRepo.Verify(r => r.CreateAsync(It.IsAny<User>()), Times.Once);
    }

    // ─── DeleteAsync ───────────────────────────────────────────

    [Fact]
    public async Task DeleteAsync_ExistingId_ReturnsTrue()
    {
        _mockRepo.Setup(r => r.DeleteAsync(1)).ReturnsAsync(true);

        var result = await _sut.DeleteAsync(1);

        Assert.True(result);
    }

    [Fact]
    public async Task DeleteAsync_NonExistingId_ReturnsFalse()
    {
        _mockRepo.Setup(r => r.DeleteAsync(99)).ReturnsAsync(false);

        var result = await _sut.DeleteAsync(99);

        Assert.False(result);
    }
}
```

## Controller 單元測試範本

```text
using Api.Controllers;
using Api.Models.DTOs;
using Api.Services;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace Api.Tests.Controllers;

public class UsersControllerTests
{
    private readonly Mock<IUserService> _mockService;
    private readonly UsersController _sut;

    public UsersControllerTests()
    {
        _mockService = new Mock<IUserService>();
        _sut = new UsersController(_mockService.Object);
    }

    // ─── GetAll ────────────────────────────────────────────────

    [Fact]
    public async Task GetAll_HasUsers_ReturnsOkWithData()
    {
        // Arrange
        _mockService.Setup(s => s.GetAllAsync())
                    .ReturnsAsync([new UserResponse(1, "Alice", "alice@test.com")]);

        // Act
        var actionResult = await _sut.GetAll();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
        var response = Assert.IsType<ApiResponse<IEnumerable<UserResponse>>>(okResult.Value);
        Assert.True(response.Success);
        Assert.Single(response.Data!);
    }

    // ─── GetById ───────────────────────────────────────────────

    [Fact]
    public async Task GetById_ExistingId_ReturnsOk()
    {
        _mockService.Setup(s => s.GetByIdAsync(1))
                    .ReturnsAsync(new UserResponse(1, "Alice", "alice@test.com"));

        var actionResult = await _sut.GetById(1);

        var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
        var response = Assert.IsType<ApiResponse<UserResponse>>(okResult.Value);
        Assert.True(response.Success);
        Assert.Equal(1, response.Data!.Id);
    }

    [Fact]
    public async Task GetById_NonExistingId_ReturnsNotFound()
    {
        _mockService.Setup(s => s.GetByIdAsync(99)).ReturnsAsync((UserResponse?)null);

        var actionResult = await _sut.GetById(99);

        Assert.IsType<NotFoundObjectResult>(actionResult.Result);
    }

    // ─── Create ────────────────────────────────────────────────

    [Fact]
    public async Task Create_ValidRequest_ReturnsCreated()
    {
        var request = new CreateUserRequest("Alice", "alice@test.com");
        _mockService.Setup(s => s.CreateAsync(request))
                    .ReturnsAsync(new UserResponse(1, "Alice", "alice@test.com"));

        var actionResult = await _sut.Create(request);

        Assert.IsType<CreatedAtActionResult>(actionResult.Result);
    }

    // ─── Delete ────────────────────────────────────────────────

    [Fact]
    public async Task Delete_ExistingId_ReturnsOk()
    {
        _mockService.Setup(s => s.DeleteAsync(1)).ReturnsAsync(true);

        var actionResult = await _sut.Delete(1);

        Assert.IsType<OkObjectResult>(actionResult.Result);
    }

    [Fact]
    public async Task Delete_NonExistingId_ReturnsNotFound()
    {
        _mockService.Setup(s => s.DeleteAsync(99)).ReturnsAsync(false);

        var actionResult = await _sut.Delete(99);

        Assert.IsType<NotFoundObjectResult>(actionResult.Result);
    }
}
```

## Key Conventions

- 使用 `_sut`（System Under Test）命名被測試的物件
- 每個測試方法只測一件事
- `[Fact]` 用於單一固定案例；`[Theory] + [InlineData]` 用於多組參數
- Verify 只在需要確認「是否被呼叫」時使用，不濫用
- 不在測試中寫商業邏輯，保持測試簡單直觀
