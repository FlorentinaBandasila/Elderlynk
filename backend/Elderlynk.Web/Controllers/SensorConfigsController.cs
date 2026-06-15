using Elderlynk.Models;
using Elderlynk.Services;
using Elderlynk.Web.Auth;
using Microsoft.AspNetCore.Mvc;

namespace Elderlynk.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public class SensorConfigsController : ControllerBase
    {
        private readonly ISensorConfigService _service;
        private readonly ILogger<SensorConfigsController> _logger;

        public SensorConfigsController(ISensorConfigService service, ILogger<SensorConfigsController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SensorConfigResponseDto>>> GetAll(CancellationToken cancellationToken)
        {
            try
            {
                var configs = await _service.GetForUserAsync(User.GetUserId(), User.GetRole(), cancellationToken);
                return Ok(configs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving sensor configs");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SensorConfigResponseDto>> GetById(int id, CancellationToken cancellationToken)
        {
            try
            {
                var config = await _service.GetByIdAsync(id, cancellationToken);
                if (config == null)
                    return NotFound();

                return Ok(config);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving sensor config with ID {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost]
        public async Task<ActionResult<SensorConfigResponseDto>> Create(
            [FromBody] CreateSensorConfigDto dto,
            CancellationToken cancellationToken)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _service.CreateAsync(dto, cancellationToken);
                return CreatedAtAction(nameof(GetById), new { id = result.SensorId }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating sensor config");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateSensorConfigDto dto, CancellationToken cancellationToken)
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
                _logger.LogError(ex, "Error updating sensor config with ID {Id}", id);
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
                _logger.LogError(ex, "Error deleting sensor config with ID {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
