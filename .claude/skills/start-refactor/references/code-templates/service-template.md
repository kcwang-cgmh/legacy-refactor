# Service Template

## Interface

```text
namespace Api.Services;

public interface IUserService
{
    Task<IEnumerable<UserResponse>> GetAllAsync();
    Task<UserResponse?> GetByIdAsync(int id);
    Task<UserResponse> CreateAsync(CreateUserRequest request);
    Task<UserResponse?> UpdateAsync(int id, UpdateUserRequest request);
    Task<bool> DeleteAsync(int id);
}
```

## Implementation

```text
using Api.Data.Repositories;
using Api.Models.DTOs;
using Api.Models.Entities;

namespace Api.Services;

public class UserService(IUserRepository userRepository) : IUserService
{
    public async Task<IEnumerable<UserResponse>> GetAllAsync()
    {
        var users = await userRepository.GetAllAsync();
        return users.Select(u => new UserResponse(u.Id, u.Name, u.Email));
    }

    public async Task<UserResponse?> GetByIdAsync(int id)
    {
        var user = await userRepository.GetByIdAsync(id);
        return user is null ? null : new UserResponse(user.Id, user.Name, user.Email);
    }

    public async Task<UserResponse> CreateAsync(CreateUserRequest request)
    {
        var user = new User { Name = request.Name, Email = request.Email };
        var newId = await userRepository.CreateAsync(user);
        return new UserResponse(newId, request.Name, request.Email);
    }

    public async Task<UserResponse?> UpdateAsync(int id, UpdateUserRequest request)
    {
        var user = await userRepository.GetByIdAsync(id);
        if (user is null) return null;

        user.Name = request.Name;
        user.Email = request.Email;

        await userRepository.UpdateAsync(user);
        return new UserResponse(user.Id, user.Name, user.Email);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        return await userRepository.DeleteAsync(id);
    }
}
```

## Key Conventions

- Interface and implementation in the same folder (`Services/`)
- Use primary constructor for DI — inject `IRepository` interfaces, NOT `IDbConnection` directly
- Map entities to DTOs in the service layer (not in controllers or repositories)
- Return `null` for not-found scenarios (let controller handle HTTP status)
- All methods are `async Task<T>`
- Never write SQL in service layer — delegate all data access to repositories
