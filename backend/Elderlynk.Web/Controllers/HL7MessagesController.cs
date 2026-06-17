using Elderlynk.Models;
using Elderlynk.Services;
using Microsoft.AspNetCore.Mvc;

namespace Elderlynk.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public class HL7MessagesController : ControllerBase
    {
        private readonly IHL7MessageService _service;
        private readonly ILogger<HL7MessagesController> _logger;

        public HL7MessagesController(IHL7MessageService service, ILogger<HL7MessagesController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<HL7MessageResponseDto>>> GetAll(CancellationToken cancellationToken)
        {
            try
            {
                var messages = await _service.GetAllAsync(cancellationToken);
                return Ok(messages);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving HL7 messages");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<HL7MessageResponseDto>> GetById(int id, CancellationToken cancellationToken)
        {
            try
            {
                var message = await _service.GetByIdAsync(id, cancellationToken);
                if (message == null)
                    return NotFound();

                return Ok(message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving HL7 message with ID {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("patient/{patientId}")]
        public async Task<ActionResult<IEnumerable<HL7MessageResponseDto>>> GetByPatient(int patientId, CancellationToken cancellationToken)
        {
            try
            {
                return Ok(await _service.GetByPatientAsync(patientId, cancellationToken));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving HL7 messages for patient {Id}", patientId);
                return StatusCode(500, "Internal server error");
            }
        }

        // Generate an outbound HL7 referral to a specialist (doctors/admin only).
        [Microsoft.AspNetCore.Authorization.Authorize(Roles = "1,2")]
        [HttpPost("referral")]
        public async Task<ActionResult<HL7MessageResponseDto>> Referral([FromBody] GenerateReferralDto dto, CancellationToken cancellationToken)
        {
            try
            {
                if (dto == null || dto.PatientId <= 0)
                    return BadRequest("PatientId is required.");

                var result = await _service.GenerateReferralAsync(dto, cancellationToken);
                return CreatedAtAction(nameof(GetById), new { id = result.MessageId }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating HL7 referral");
                return StatusCode(500, "Internal server error");
            }
        }

        // Simulate receiving the specialist's medical letter for a referral (doctors/admin only).
        [Microsoft.AspNetCore.Authorization.Authorize(Roles = "1,2")]
        [HttpPost("{id}/reply")]
        public async Task<ActionResult<HL7MessageResponseDto>> Reply(int id, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _service.GenerateReplyAsync(id, cancellationToken);
                return result == null ? NotFound() : Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating HL7 medical letter for referral {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost]
        public async Task<ActionResult<HL7MessageResponseDto>> Create(
            [FromBody] CreateHL7MessageDto dto,
            CancellationToken cancellationToken)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _service.CreateAsync(dto, cancellationToken);
                return CreatedAtAction(nameof(GetById), new { id = result.MessageId }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating HL7 message");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateHL7MessageDto dto, CancellationToken cancellationToken)
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
                _logger.LogError(ex, "Error updating HL7 message with ID {Id}", id);
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
                _logger.LogError(ex, "Error deleting HL7 message with ID {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
