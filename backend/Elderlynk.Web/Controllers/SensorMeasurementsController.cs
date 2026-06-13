using Elderlynk.Models;
using Elderlynk.Services;
using Microsoft.AspNetCore.Mvc;

namespace Elderlynk.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SensorMeasurementsController : ControllerBase
    {
        private readonly ISensorMeasurementService _service;
        private readonly ILogger<SensorMeasurementsController> _logger;

        public SensorMeasurementsController(ISensorMeasurementService service, ILogger<SensorMeasurementsController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SensorMeasurementResponseDto>>> GetAll(CancellationToken cancellationToken)
        {
            try
            {
                var measurements = await _service.GetAllAsync(cancellationToken);
                return Ok(measurements);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving sensor measurements");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SensorMeasurementResponseDto>> GetById(long id, CancellationToken cancellationToken)
        {
            try
            {
                var measurement = await _service.GetByIdAsync(id, cancellationToken);
                if (measurement == null)
                    return NotFound();

                return Ok(measurement);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving sensor measurement with ID {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost]
        public async Task<ActionResult<SensorMeasurementResponseDto>> Create(
            [FromBody] CreateSensorMeasurementDto dto,
            CancellationToken cancellationToken)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _service.CreateAsync(dto, cancellationToken);
                return CreatedAtAction(nameof(GetById), new { id = result.MeasurementId }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating sensor measurement");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(long id, [FromBody] UpdateSensorMeasurementDto dto, CancellationToken cancellationToken)
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
                _logger.LogError(ex, "Error updating sensor measurement with ID {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id, CancellationToken cancellationToken)
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
                _logger.LogError(ex, "Error deleting sensor measurement with ID {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
