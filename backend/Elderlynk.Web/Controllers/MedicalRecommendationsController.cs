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
    public class MedicalRecommendationsController : ControllerBase
    {
        private readonly IMedicalRecommendationService _service;
        private readonly ILogger<MedicalRecommendationsController> _logger;

        public MedicalRecommendationsController(IMedicalRecommendationService service, ILogger<MedicalRecommendationsController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MedicalRecommendationResponseDto>>> GetAll(CancellationToken cancellationToken)
        {
            try
            {
                var items = await _service.GetAllAsync(cancellationToken);
                return Ok(items);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Eroare la preluarea recomandărilor medicale");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("patient/{patientId}")]
        public async Task<ActionResult<IEnumerable<MedicalRecommendationResponseDto>>> GetByPatientId(int patientId, CancellationToken cancellationToken)
        {
            try
            {
                var items = await _service.GetByPatientIdAsync(patientId, cancellationToken);
                return Ok(items);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Eroare la preluarea recomandărilor pentru pacientul {PatientId}", patientId);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost]
        [Authorize(Roles = "1,2")]
        public async Task<ActionResult<MedicalRecommendationResponseDto>> Create([FromBody] CreateMedicalRecommendationDto dto, CancellationToken cancellationToken)
        {
            try
            {
                if (!ModelState.IsValid || string.IsNullOrWhiteSpace(dto.Descriere) || dto.PatientId <= 0)
                    return BadRequest("PatientId și descrierea sunt obligatorii.");

                var created = await _service.CreateAsync(dto, User.GetUserId(),
                    HttpContext.Connection.RemoteIpAddress?.ToString(), cancellationToken);
                return Ok(created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Eroare la crearea recomandării medicale");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "1,2")]
        public async Task<IActionResult> Update(int id, [FromBody] CreatePatientRecommendationDto dto, CancellationToken cancellationToken)
        {
            try
            {
                var ok = await _service.UpdateAsync(id, dto, User.GetUserId(),
                    HttpContext.Connection.RemoteIpAddress?.ToString(), cancellationToken);
                return ok ? NoContent() : NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Eroare la actualizarea recomandării {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "1,2")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            try
            {
                var ok = await _service.DeleteAsync(id, User.GetUserId(),
                    HttpContext.Connection.RemoteIpAddress?.ToString(), cancellationToken);
                return ok ? NoContent() : NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Eroare la ștergerea recomandării {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
