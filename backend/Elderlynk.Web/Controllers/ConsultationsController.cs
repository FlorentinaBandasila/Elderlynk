using Elderlynk.Models;
using Elderlynk.Services;
using Microsoft.AspNetCore.Mvc;

namespace Elderlynk.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ConsultationsController : ControllerBase
    {
        private readonly IConsultationService _service;
        private readonly ILogger<ConsultationsController> _logger;

        public ConsultationsController(IConsultationService service, ILogger<ConsultationsController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ConsultationResponseDto>>> GetAll(CancellationToken cancellationToken)
        {
            try
            {
                var consultations = await _service.GetAllAsync(cancellationToken);
                return Ok(consultations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving consultations");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ConsultationResponseDto>> GetById(int id, CancellationToken cancellationToken)
        {
            try
            {
                var consultation = await _service.GetByIdAsync(id, cancellationToken);
                if (consultation == null)
                    return NotFound();

                return Ok(consultation);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving consultation with ID {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost]
        public async Task<ActionResult<ConsultationResponseDto>> Create(
            [FromBody] CreateConsultationDto dto,
            CancellationToken cancellationToken)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _service.CreateAsync(dto, cancellationToken);
                return CreatedAtAction(nameof(GetById), new { id = result.ConsultationId }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating consultation");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateConsultationDto dto, CancellationToken cancellationToken)
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
                _logger.LogError(ex, "Error updating consultation with ID {Id}", id);
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
                _logger.LogError(ex, "Error deleting consultation with ID {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
