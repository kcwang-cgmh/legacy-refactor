# Dapper + Oracle 資料存取指南

本專案使用 **Dapper** + **Oracle.ManagedDataAccess.Core** 作為唯一的資料存取方案。
不使用 Entity Framework Core（與專案 Oracle 資料庫不相容）。

## NuGet 套件

```bash
dotnet add package Dapper
dotnet add package Oracle.ManagedDataAccess.Core
```

## DI 註冊（Program.cs）

```text
// 注入 IDbConnection（Scoped — 每個 Request 一個連線）
builder.Services.AddScoped<IDbConnection>(_ =>
    new OracleConnection(builder.Configuration.GetConnectionString("DefaultConnection")));

// 注入 Repository
builder.Services.AddScoped<IUserRepository, UserRepository>();
```

## appsettings.json 連線字串格式

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=ORASERVER;User Id=MYUSER;Password=MYPASS;"
  }
}
```

TNS 格式（如有 tnsnames.ora）：

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=myhost)(PORT=1521))(CONNECT_DATA=(SERVICE_NAME=MYSERVICE)));User Id=MYUSER;Password=MYPASS;"
  }
}
```

## ⚠️ Oracle 參數語法

Oracle 使用 `:paramName`，**不是** `@paramName`（SQL Server 語法）：

```text
// ✅ 正確 — Oracle 語法
"SELECT * FROM USERS WHERE ID = :Id"

// ❌ 錯誤 — SQL Server 語法，在 Oracle 無效
"SELECT * FROM Users WHERE Id = @Id"
```

## 基本 CRUD 範例

### QueryAsync\<T\> — 查詢多筆

```csharp
public async Task<IEnumerable<User>> GetAllAsync()
{
    return await _connection.QueryAsync<User>(UserSql.GetAll);
}
```

### QueryFirstOrDefaultAsync\<T\> — 查詢單筆

```csharp
public async Task<User?> GetByIdAsync(int id)
{
    return await _connection.QueryFirstOrDefaultAsync<User>(
        UserSql.GetById,
        new { Id = id });
}
```

### ExecuteAsync — 新增 / 更新 / 刪除

```csharp
public async Task<int> CreateAsync(User user)
{
    return await _connection.ExecuteAsync(UserSql.Insert, user);
}

public async Task<bool> UpdateAsync(User user)
{
    var rows = await _connection.ExecuteAsync(UserSql.Update, user);
    return rows > 0;
}

public async Task<bool> DeleteAsync(int id)
{
    var rows = await _connection.ExecuteAsync(UserSql.Delete, new { Id = id });
    return rows > 0;
}
```

## SQL 集中管理（Data/Sql/ 靜態類別）

```text
// Data/Sql/UserSql.cs
namespace Api.Data.Sql;

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

    public const string Insert = """
        INSERT INTO USERS (NAME, EMAIL, CREATED_AT)
        VALUES (:Name, :Email, SYSDATE)
        """;

    public const string Update = """
        UPDATE USERS
        SET NAME = :Name, EMAIL = :Email
        WHERE ID = :Id
        """;

    public const string Delete = """
        DELETE FROM USERS WHERE ID = :Id
        """;
}
```

## DynamicParameters — 動態建立參數

```text
var parameters = new DynamicParameters();
parameters.Add("Name", name, DbType.String);
parameters.Add("Email", email, DbType.String);

await _connection.ExecuteAsync(UserSql.Insert, parameters);
```

## Stored Procedure 呼叫

```csharp
public async Task<IEnumerable<User>> GetUsersByDeptAsync(int deptId)
{
    var parameters = new DynamicParameters();
    parameters.Add("P_DEPT_ID", deptId, DbType.Int32);
    // 如果 SP 有 OUT 參數：
    // parameters.Add("P_CURSOR", dbType: DbType.Object, direction: ParameterDirection.Output);

    return await _connection.QueryAsync<User>(
        "PKG_USERS.GET_BY_DEPT",
        parameters,
        commandType: CommandType.StoredProcedure);
}
```

## Transaction 處理

```csharp
public async Task TransferAsync(int fromId, int toId, decimal amount)
{
    _connection.Open();
    using var transaction = _connection.BeginTransaction();

    try
    {
        await _connection.ExecuteAsync(AccountSql.Debit,
            new { Id = fromId, Amount = amount }, transaction);

        await _connection.ExecuteAsync(AccountSql.Credit,
            new { Id = toId, Amount = amount }, transaction);

        transaction.Commit();
    }
    catch
    {
        transaction.Rollback();
        throw;
    }
}
```

## 常見 Oracle 型別對應

| Oracle 型別 | C# 型別 | 備註 |
| --- | --- | --- |
| `NUMBER(10)` | `int` / `long` | - |
| `NUMBER(18,2)` | `decimal` | - |
| `VARCHAR2(n)` | `string` | - |
| `NVARCHAR2(n)` | `string` | - |
| `DATE` | `DateTime` | 含時間資訊 |
| `TIMESTAMP` | `DateTime` | 高精度時間 |
| `CLOB` | `string` | 大型文字 |
| `CHAR(1)` | `bool` 或 `string` | 通常用 'Y'/'N' 代表布林 |

## 常見問題

### IDbConnection 是否需要手動 Open？

Dapper 會自動開啟連線（若連線未開啟）。但若需要 Transaction，必須先手動 `_connection.Open()`。

### 大量寫入（Bulk Insert）

Dapper 不內建 bulk 功能。大量寫入建議：

1. 使用 `Oracle.ManagedDataAccess.Core` 的 `OracleBulkCopy`
2. 或使用多行 `INSERT ALL` SQL

### Column 名稱對應

Oracle 欄位名稱通常為大寫（如 `USER_ID`），Dapper 預設不區分大小寫對應 C# 屬性名稱，但若欄位名稱含底線（snake_case），需使用以下方式之一：

1. 在 POCO 屬性加 `[Column("USER_ID")]`（需引用 `System.ComponentModel.DataAnnotations.Schema`）
2. 或在 SQL 中使用別名：`SELECT USER_ID AS UserId FROM ...`
