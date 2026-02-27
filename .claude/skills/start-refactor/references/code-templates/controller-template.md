# Controller Template

```text
using Api.Models.DTOs;
using Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController(IUserService userService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<UserResponse>>>> GetAll()
    {
        var users = await userService.GetAllAsync();
        return Ok(ApiResponse<IEnumerable<UserResponse>>.Ok(users));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<UserResponse>>> GetById(int id)
    {
        var user = await userService.GetByIdAsync(id);
        if (user is null)
            return NotFound(ApiResponse<UserResponse>.Fail("User not found"));

        return Ok(ApiResponse<UserResponse>.Ok(user));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<UserResponse>>> Create(CreateUserRequest request)
    {
        var user = await userService.CreateAsync(request);
        return CreatedAtAction(
            nameof(GetById),
            new { id = user.Id },
            ApiResponse<UserResponse>.Ok(user, "User created successfully"));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ApiResponse<UserResponse>>> Update(int id, UpdateUserRequest request)
    {
        var user = await userService.UpdateAsync(id, request);
        if (user is null)
            return NotFound(ApiResponse<UserResponse>.Fail("User not found"));

        return Ok(ApiResponse<UserResponse>.Ok(user, "User updated successfully"));
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(int id)
    {
        var result = await userService.DeleteAsync(id);
        if (!result)
            return NotFound(ApiResponse<bool>.Fail("User not found"));

        return Ok(ApiResponse<bool>.Ok(true, "User deleted successfully"));
    }
}
```

## Key Conventions

- Use `[ApiController]` attribute for automatic model validation
- Use `[Route("api/[controller]")]` for conventional routing
- Inject services via primary constructor
- Always return `ApiResponse<T>` wrapped responses
- Use appropriate HTTP status codes (200, 201, 404, etc.)
- Use `{id:int}` route constraints for type safety
- Method naming: `GetAll`, `GetById`, `Create`, `Update`, `Delete`
