---
applyTo: "refactored-project/**/*.cs"
---

# .NET 8 / C# 12 Coding Conventions

## Language Features

- Use file-scoped namespaces: `namespace Api.Services;`
- Use primary constructors for DI: `public class UserService(IUserRepository repo)`
- Use collection expressions: `List<int> ids = [1, 2, 3];`
- Use `required` keyword for mandatory properties
- Use raw string literals for multi-line strings
- Use pattern matching (`is`, `switch` expressions) over type casting

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Public members | PascalCase | `GetUserById()` |
| Private fields | _camelCase | `_userRepository` |
| Parameters | camelCase | `userId` |
| Constants | PascalCase | `MaxRetryCount` |
| Interfaces | I-prefix | `IUserService` |
| Async methods | Async suffix | `GetUserByIdAsync()` |
| DTOs | Suffix with Dto/Request/Response | `CreateUserRequest` |

## Project Structure (API)

```
Api/
├── Controllers/          # API endpoints
│   └── UsersController.cs
├── Services/             # Business logic
│   ├── IUserService.cs
│   └── UserService.cs
├── Models/
│   ├── Entities/         # Database entity POCOs (no ORM attributes)
│   │   └── User.cs
│   └── DTOs/             # Data transfer objects
│       ├── CreateUserRequest.cs
│       └── UserResponse.cs
├── Data/
│   ├── Repositories/     # Dapper repository interfaces + implementations
│   │   ├── IUserRepository.cs
│   │   └── UserRepository.cs
│   └── Sql/              # SQL query constants (static classes)
│       └── UserSql.cs
├── Middleware/
│   └── ExceptionHandlingMiddleware.cs
├── Extensions/           # Service registration extensions
│   └── ServiceCollectionExtensions.cs
├── Program.cs
└── appsettings.json
```

## API Response Format

All endpoints MUST return a consistent response wrapper:

```csharp
public record ApiResponse<T>(
    bool Success,
    T? Data,
    string? Message = null,
    IEnumerable<string>? Errors = null
);
```

## Dapper & Oracle Conventions

- `IDbConnection` is injected via DI (`OracleConnection` registered as `Scoped`)
- All data access goes through a Repository interface — never write SQL directly in Service classes
- Oracle parameter syntax is `:paramName` (NOT `@paramName`)
- All repository methods MUST be `async` using `QueryAsync<T>`, `QueryFirstOrDefaultAsync<T>`, `ExecuteAsync`
- SQL queries are centralized in `Data/Sql/` static classes (e.g., `UserSql.GetById`)
- Use `DynamicParameters` for building parameter collections
- Stored Procedures: call with `CommandDefinition` and `CommandType.StoredProcedure`
- Transactions: use `IDbConnection.BeginTransaction()` and pass to Dapper commands

## Dependency Injection

Register services in extension methods for clean `Program.cs`:

```csharp
// Extensions/ServiceCollectionExtensions.cs
public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IUserService, UserService>();
        return services;
    }
}
```

## Error Handling

- Use global exception handling middleware (not try-catch in every controller)
- Return appropriate HTTP status codes (400 for validation, 404 for not found, 500 for server errors)
- Log exceptions with structured logging
- Never expose internal error details in production responses
