using Elderlynk.Models;
using Elderlynk.Services;
using Microsoft.AspNetCore.Mvc;

namespace Elderlynk.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _service;
        private readonly ILogger<UsersController> _logger;

        public UsersController(IUserService service, ILogger<UsersController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserResponseDto>>> GetAll(CancellationToken cancellationToken)
        {
            try
            {
                var users = await _service.GetAllAsync(cancellationToken);
                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving users");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserResponseDto>> GetById(int id, CancellationToken cancellationToken)
        {
            try
            {
                var user = await _service.GetByIdAsync(id, cancellationToken);
                if (user == null)
                    return NotFound();

                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user with ID {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost]
        public async Task<ActionResult<UserResponseDto>> Create(
            [FromBody] CreateUserDto dto,
            CancellationToken cancellationToken)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _service.CreateAsync(dto, cancellationToken);
                return CreatedAtAction(nameof(GetById), new { id = result.UserId }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateUserDto dto, CancellationToken cancellationToken)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                await _service.UpdateAsync(id, dto, cancellationToken);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user with ID {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            try
            {
                await _service.DeleteAsync(id, cancellationToken);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user with ID {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
