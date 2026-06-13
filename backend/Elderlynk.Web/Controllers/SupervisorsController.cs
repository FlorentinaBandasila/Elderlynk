using Elderlynk.Models;
using Elderlynk.Services;
using Microsoft.AspNetCore.Mvc;

namespace Elderlynk.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SupervisorsController : ControllerBase
    {
        private readonly ISupervisorService _service;
        private readonly ILogger<SupervisorsController> _logger;

        public SupervisorsController(ISupervisorService service, ILogger<SupervisorsController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SupervisorResponseDto>>> GetAll(CancellationToken cancellationToken)
        {
            try
            {
                var supervisors = await _service.GetAllAsync(cancellationToken);
                return Ok(supervisors);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving supervisors");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SupervisorResponseDto>> GetById(int id, CancellationToken cancellationToken)
        {
            try
            {
                var supervisor = await _service.GetByIdAsync(id, cancellationToken);
                if (supervisor == null)
                    return NotFound();

                return Ok(supervisor);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving supervisor with ID {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost]
        public async Task<ActionResult<SupervisorResponseDto>> Create(
            [FromBody] CreateSupervisorDto dto,
            CancellationToken cancellationToken)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _service.CreateAsync(dto, cancellationToken);
                return CreatedAtAction(nameof(GetById), new { id = result.SupervisorId }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating supervisor");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateSupervisorDto dto, CancellationToken cancellationToken)
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
                _logger.LogError(ex, "Error updating supervisor with ID {Id}", id);
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
                _logger.LogError(ex, "Error deleting supervisor with ID {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
