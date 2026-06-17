using Elderlynk.Models;
using Elderlynk.Services;
using Elderlynk.Web.Auth;
using Elderlynk.Web.Hubs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace Elderlynk.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AlarmsController : ControllerBase
    {
        private readonly IAlarmService _service;
        private readonly IAlarmEvaluationService _evaluation;
        private readonly ILogger<AlarmsController> _logger;
        private readonly IHubContext<NotificationsHub> _hub;

        public AlarmsController(
            IAlarmService service,
            IAlarmEvaluationService evaluation,
            ILogger<AlarmsController> logger,
            IHubContext<NotificationsHub> hub)
        {
            _service = service;
            _evaluation = evaluation;
            _logger = logger;
            _hub = hub;
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

                // Push the new alarm to all connected clients (quasi-real-time).
                await _hub.Clients.All.SendAsync(NotificationsHub.AlarmRaised, result, cancellationToken);

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

                // Notify clients the alarm changed (e.g. resolved by a supervisor).
                var updated = await _service.GetByIdAsync(id, cancellationToken);
                await _hub.Clients.All.SendAsync(NotificationsHub.AlarmResolved, updated, cancellationToken);

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

        // Evaluate a sensor's latest readings against its thresholds (Annex 3 rules).
        // Raises + broadcasts an alarm/warning when the conditions are met.
        [HttpPost("evaluate")]
        [Authorize(Roles = "1,2,3")]
        public async Task<ActionResult<AlarmEvaluationResult>> Evaluate([FromBody] EvaluateAlarmDto dto, CancellationToken cancellationToken)
        {
            try
            {
                if (dto == null || dto.SensorId <= 0)
                    return BadRequest("SensorId is required.");

                var result = await _evaluation.EvaluateSensorAsync(dto.SensorId, dto.ActivityStart, cancellationToken);
                if (result.CreatedAlarm != null)
                    await _hub.Clients.All.SendAsync(NotificationsHub.AlarmRaised, result.CreatedAlarm, cancellationToken);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error evaluating sensor {SensorId}", dto?.SensorId);
                return StatusCode(500, "Internal server error");
            }
        }

        // Resolve an alarm. The resolution timestamp + supervisor are stamped server-side.
        [HttpPost("{id}/resolve")]
        [Authorize(Roles = "1,2,3")]
        public async Task<ActionResult<AlarmResponseDto>> Resolve(int id, [FromBody] ResolveAlarmDto? dto, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _service.ResolveAsync(id, User.GetUserId(), dto?.Notes, cancellationToken);
                if (result == null) return NotFound();

                await _hub.Clients.All.SendAsync(NotificationsHub.AlarmResolved, result, cancellationToken);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resolving alarm with ID {Id}", id);
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
