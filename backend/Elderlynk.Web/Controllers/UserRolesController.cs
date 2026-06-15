using Elderlynk.Models;
using Elderlynk.Services;
using Microsoft.AspNetCore.Mvc;

namespace Elderlynk.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Microsoft.AspNetCore.Authorization.Authorize(Roles = "1")]
    public class UserRolesController : ControllerBase
    {
        private readonly IUserRoleService _service;
        private readonly ILogger<UserRolesController> _logger;

        public UserRolesController(IUserRoleService service, ILogger<UserRolesController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserRoleResponseDto>>> GetAll(CancellationToken cancellationToken)
        {
            try
            {
                var userRoles = await _service.GetAllAsync(cancellationToken);
                return Ok(userRoles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user roles");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{userId}/{roleId}")]
        public async Task<ActionResult<UserRoleResponseDto>> GetById(int userId, int roleId, CancellationToken cancellationToken)
        {
            try
            {
                var userRole = await _service.GetByIdAsync(userId, roleId, cancellationToken);
                if (userRole == null)
                    return NotFound();

                return Ok(userRole);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user role for user {UserId} and role {RoleId}", userId, roleId);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost]
        public async Task<ActionResult<UserRoleResponseDto>> Create(
            [FromBody] CreateUserRoleDto dto,
            CancellationToken cancellationToken)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _service.CreateAsync(dto, cancellationToken);
                return CreatedAtAction(nameof(GetById), new { userId = result.UserId, roleId = result.RoleId }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user role");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("{userId}/{roleId}")]
        public async Task<IActionResult> Update(int userId, int roleId, [FromBody] UpdateUserRoleDto dto, CancellationToken cancellationToken)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                await _service.UpdateAsync(userId, roleId, dto, cancellationToken);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user role for user {UserId} and role {RoleId}", userId, roleId);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("{userId}/{roleId}")]
        public async Task<IActionResult> Delete(int userId, int roleId, CancellationToken cancellationToken)
        {
            try
            {
                await _service.DeleteAsync(userId, roleId, cancellationToken);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user role for user {UserId} and role {RoleId}", userId, roleId);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
