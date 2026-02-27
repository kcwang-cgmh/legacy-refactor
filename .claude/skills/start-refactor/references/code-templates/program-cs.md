# Program.cs Template

```text
using System.Data;
using Api.Extensions;
using Api.Middleware;
using Oracle.ManagedDataAccess.Client;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Serilog
builder.Host.UseSerilog((context, config) =>
    config.ReadFrom.Configuration(context.Configuration));

// Database — IDbConnection 透過 DI 注入（Dapper 用）
builder.Services.AddScoped<IDbConnection>(_ =>
    new OracleConnection(builder.Configuration.GetConnectionString("DefaultConnection")));

// Application services (repositories + services)
builder.Services.AddApplicationServices(builder.Configuration);

// Controllers
builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
        policy.WithOrigins(origins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Middleware pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseHttpsRedirection();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

## ExceptionHandlingMiddleware

```text
namespace Api.Middleware;

public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception occurred");
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await context.Response.WriteAsJsonAsync(new
            {
                Success = false,
                Message = "An unexpected error occurred.",
                Errors = app.Environment.IsDevelopment() ? new[] { ex.Message } : null
            });
        }
    }
}
```

## ApiResponse<T>

```text
namespace Api.Models.DTOs;

public record ApiResponse<T>(
    bool Success,
    T? Data,
    string? Message = null,
    IEnumerable<string>? Errors = null
)
{
    public static ApiResponse<T> Ok(T data, string? message = null)
        => new(true, data, message);

    public static ApiResponse<T> Fail(string message, IEnumerable<string>? errors = null)
        => new(false, default, message, errors);
}
```

## ServiceCollectionExtensions

```text
using System.Data;
using Api.Data.Repositories;
using Oracle.ManagedDataAccess.Client;

namespace Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(
        this IServiceCollection services, IConfiguration configuration)
    {
        // Oracle IDbConnection
        services.AddScoped<IDbConnection>(_ =>
            new OracleConnection(configuration.GetConnectionString("DefaultConnection")));

        // Repositories
        services.AddScoped<IUserRepository, UserRepository>();

        // Services
        // services.AddScoped<IUserService, UserService>();

        return services;
    }
}
```
