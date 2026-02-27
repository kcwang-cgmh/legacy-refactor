---
applyTo: "refactored-project/**/*.{cs,csproj,sln,json,tsx,ts}"
---

# Project Folder Structure Conventions

## API Project Structure

```
refactored-project/api/
├── Api.csproj
├── Program.cs                 # Entry point, service/middleware config
├── appsettings.json
├── appsettings.Development.json
├── Controllers/               # API endpoints grouped by domain
│   ├── AuthController.cs
│   └── UsersController.cs
├── Services/                  # Business logic interfaces + implementations
│   ├── IUserService.cs
│   └── UserService.cs
├── Models/
│   ├── Entities/              # Database entity POCOs (no ORM attributes)
│   │   └── User.cs
│   └── DTOs/                  # Request/Response objects
│       ├── CreateUserRequest.cs
│       └── UserResponse.cs
├── Data/
│   ├── Repositories/          # Dapper repository interfaces + implementations
│   │   ├── IUserRepository.cs
│   │   └── UserRepository.cs
│   └── Sql/                   # SQL query constants (static classes)
│       └── UserSql.cs
├── Middleware/                 # Custom middleware
│   └── ExceptionHandlingMiddleware.cs
├── Extensions/                # IServiceCollection extension methods
│   └── ServiceCollectionExtensions.cs
└── Validators/                # FluentValidation validators
    └── CreateUserRequestValidator.cs
```

## Test Project Structure

```
refactored-project/api.Tests/
├── Api.Tests.csproj
├── Controllers/               # Controller unit tests
│   └── UsersControllerTests.cs
├── Services/                  # Service unit tests
│   └── UserServiceTests.cs
└── Fixtures/                  # Shared test setup/fixtures
    └── WebApplicationFactoryFixture.cs
```

## Web Project Structure (ASP.NET Core MVC)

```
refactored-project/web/
├── Web.csproj
├── Program.cs
├── appsettings.json
├── Controllers/
├── Views/
│   ├── Shared/
│   │   ├── _Layout.cshtml
│   │   └── _ValidationScriptsPartial.cshtml
│   ├── Home/
│   │   └── Index.cshtml
│   └── _ViewImports.cshtml
├── Models/                    # View models
├── wwwroot/
│   ├── css/
│   ├── js/
│   └── lib/
└── Services/                  # API client services
    └── ApiClient.cs
```

## Web Project Structure (React + TailwindCSS)

```
refactored-project/web/
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/            # Reusable UI components
│   ├── pages/                 # Route pages
│   ├── services/              # API client functions
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Utility functions
└── public/
```

## Naming Conventions for Files

| Type | Convention | Example |
|------|-----------|---------|
| Controller | `{Domain}Controller.cs` | `UsersController.cs` |
| Service interface | `I{Name}Service.cs` | `IUserService.cs` |
| Service impl | `{Name}Service.cs` | `UserService.cs` |
| Repository interface | `I{Name}Repository.cs` | `IUserRepository.cs` |
| Repository impl | `{Name}Repository.cs` | `UserRepository.cs` |
| SQL constants | `{Name}Sql.cs` | `UserSql.cs` |
| Entity | `{Name}.cs` | `User.cs` |
| DTO | `{Action}{Domain}{Type}.cs` | `CreateUserRequest.cs` |
| Middleware | `{Name}Middleware.cs` | `ExceptionHandlingMiddleware.cs` |
| Validator | `{DtoName}Validator.cs` | `CreateUserRequestValidator.cs` |
| Test class | `{Name}Tests.cs` | `UserServiceTests.cs` |
