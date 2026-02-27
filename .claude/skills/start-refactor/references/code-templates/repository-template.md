# Repository Template（Dapper + Oracle）

> 取代 EF Core DbContext 模式。所有資料存取透過 Repository 介面，Service 層僅依賴介面（方便 Moq mock 測試）。

## Entity POCO（Models/Entities/User.cs）

```text
namespace Api.Models.Entities;

// 純 POCO — 不使用任何 ORM attribute
public class User
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

## Repository 介面（Data/Repositories/IUserRepository.cs）

```text
namespace Api.Data.Repositories;

public interface IUserRepository
{
    Task<IEnumerable<User>> GetAllAsync();
    Task<User?> GetByIdAsync(int id);
    Task<int> CreateAsync(User user);
    Task<bool> UpdateAsync(User user);
    Task<bool> DeleteAsync(int id);
}
```

## Repository 實作（Data/Repositories/UserRepository.cs）

```text
using System.Data;
using Api.Data.Sql;
using Api.Models.Entities;
using Dapper;

namespace Api.Data.Repositories;

public class UserRepository(IDbConnection connection) : IUserRepository
{
    public async Task<IEnumerable<User>> GetAllAsync()
    {
        return await connection.QueryAsync<User>(UserSql.GetAll);
    }

    public async Task<User?> GetByIdAsync(int id)
    {
        return await connection.QueryFirstOrDefaultAsync<User>(
            UserSql.GetById, new { Id = id });
    }

    public async Task<int> CreateAsync(User user)
    {
        // 回傳新產生的 ID（需 SQL 包含 RETURNING 子句）
        return await connection.ExecuteScalarAsync<int>(UserSql.Insert, user);
    }

    public async Task<bool> UpdateAsync(User user)
    {
        var rows = await connection.ExecuteAsync(UserSql.Update, user);
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var rows = await connection.ExecuteAsync(UserSql.Delete, new { Id = id });
        return rows > 0;
    }
}
```

## SQL 常數類別（Data/Sql/UserSql.cs）

```text
namespace Api.Data.Sql;

// ⚠️ Oracle 參數使用 :paramName，不是 @paramName
public static class UserSql
{
    public const string GetAll = """
        SELECT ID, NAME, EMAIL, CREATED_AT
        FROM USERS
        ORDER BY ID
        """;

    public const string GetById = """
        SELECT ID, NAME, EMAIL, CREATED_AT
        FROM USERS
        WHERE ID = :Id
        """;

    // RETURNING INTO 可取得新插入的 ID
    public const string Insert = """
        INSERT INTO USERS (NAME, EMAIL, CREATED_AT)
        VALUES (:Name, :Email, SYSDATE)
        RETURNING ID INTO :Id
        """;

    public const string Update = """
        UPDATE USERS
        SET NAME = :Name,
            EMAIL = :Email
        WHERE ID = :Id
        """;

    public const string Delete = """
        DELETE FROM USERS
        WHERE ID = :Id
        """;
}
```

## DI 註冊（Extensions/ServiceCollectionExtensions.cs）

```text
using System.Data;
using Api.Data.Repositories;
using Oracle.ManagedDataAccess.Client;

namespace Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services,
        IConfiguration configuration)
    {
        // Oracle 連線（Scoped = 每個 Request 一個連線）
        services.AddScoped<IDbConnection>(_ =>
            new OracleConnection(configuration.GetConnectionString("DefaultConnection")));

        // Repositories
        services.AddScoped<IUserRepository, UserRepository>();

        // Services
        services.AddScoped<IUserService, UserService>();

        return services;
    }
}
```

## 測試中使用 Moq mock Repository

```text
// 在 Service 單元測試中 mock IUserRepository
var mockRepo = new Mock<IUserRepository>();
mockRepo.Setup(r => r.GetByIdAsync(1))
        .ReturnsAsync(new User { Id = 1, Name = "Test", Email = "test@test.com" });

var service = new UserService(mockRepo.Object);
```

## 注意事項

- Column 名稱大寫時，可用 `[Column("COLUMN_NAME")]` 或 SQL 別名對應 C# 屬性
- 若需 Transaction，在 DI 時改用 `OracleConnection` 具體型別，並手動呼叫 `connection.Open()`
- 複雜查詢（JOIN 多表）可用 Dapper 的 `Multi-mapping`（`splitOn` 參數）
