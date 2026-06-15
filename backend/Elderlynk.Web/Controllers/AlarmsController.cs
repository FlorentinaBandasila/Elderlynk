using Elderlynk.Models;
using Elderlynk.Services;
using Elderlynk.Web.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Elderlynk.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AlarmsController : ControllerBase
    {
        private readonly IAlarmService _service;
        private readonly ILogger<AlarmsController> _logger;

        public AlarmsController(IAlarmService service, ILogger<AlarmsController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AlarmResponseDto>>> GetAll(CancellationToken cancellationToken)
        {
            try
            {
                var alarms = await _service.GetForUserAsync(User.GetUserId(), User.GetRole(), cancellationToken);
                return Ok(alarms);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving alarms");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AlarmResponseDto>> GetById(int id, CancellationToken cancellationToken)
        {
            try
            {
                var alarm = await _service.GetByIdAsync(id, cancellationToken);
                if (alarm == null)
                    return NotFound();

                return Ok(alarm);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving alarm with ID {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost]
        [Authorize(Roles = "1,2,3")]
        public async Task<ActionResult<AlarmResponseDto>> Create(
            [FromBody] CreateAlarmDto dto,
            CancellationToken cancellationToken)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _service.CreateAsync(dto, cancellationToken);
                return CreatedAtAction(nameof(GetById), new { id = result.AlarmId }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating alarm");
                return StatusCode(500, "Internal server error");
            }
        }

        // Resolve / update an alarm – staff only (patients cannot resolve).
        [HttpPut("{id}")]
        [Authorize(Roles = "1,2,3")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateAlarmDto dto, CancellationToken cancellationToken)
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
                _logger.LogError(ex, "Error updating alarm with ID {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "1")]
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
                _logger.LogError(ex, "Error deleting alarm with ID {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
