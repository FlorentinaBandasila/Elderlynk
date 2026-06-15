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
    public class PatientsController : ControllerBase
    {
        private const int RoleMedic = 2;

        private readonly IPatientService _service;
        private readonly ILogger<PatientsController> _logger;
        private readonly IWebHostEnvironment _env;

        public PatientsController(IPatientService service, ILogger<PatientsController> logger, IWebHostEnvironment env)
        {
            _service = service;
            _logger = logger;
            _env = env;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PatientResponseDto>>> GetAll(CancellationToken cancellationToken)
        {
            try
            {
                var patients = await _service.GetForUserAsync(User.GetUserId(), User.GetRole(), cancellationToken);
                return Ok(patients);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving patients");
                var errorMessage = _env.IsDevelopment()
                    ? $"Error: {ex.Message}\n{ex.InnerException?.Message}"
                    : "Internal server error";
                return StatusCode(500, errorMessage);
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PatientResponseDto>> GetById(int id, CancellationToken cancellationToken)
        {
            try
            {
                var patient = await _service.GetByIdAsync(id, cancellationToken);
                if (patient == null)
                    return NotFound();

                return Ok(patient);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving patient with ID {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}/allergies")]
        public async Task<ActionResult<IEnumerable<AllergyResponseDto>>> GetAllergies(int id, CancellationToken cancellationToken)
        {
            try
            {
                return Ok(await _service.GetAllergiesAsync(id, cancellationToken));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving allergies for patient {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}/history")]
        public async Task<ActionResult<IEnumerable<MedicalHistoryResponseDto>>> GetHistory(int id, CancellationToken cancellationToken)
        {
            try
            {
                return Ok(await _service.GetHistoryAsync(id, cancellationToken));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving medical history for patient {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}/medications")]
        public async Task<ActionResult<IEnumerable<MedicationSchemeResponseDto>>> GetMedications(int id, CancellationToken cancellationToken)
        {
            try
            {
                return Ok(await _service.GetMedicationsAsync(id, cancellationToken));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving medication schemes for patient {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        // Admin (free) and Medic (auto-links to themselves via Consultatii).
        [HttpPost]
        [Authorize(Roles = "1,2")]
        public async Task<ActionResult<PatientResponseDto>> Create([FromBody] CreatePatientDto dto, CancellationToken cancellationToken)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var currentUserId = User.GetUserId();
                // A medic always links the new patient to themselves – id comes from the token, never the body.
                int? linkMedicId = User.GetRole() == RoleMedic ? currentUserId : null;

                var patient = await _service.CreateAsync(dto, linkMedicId, currentUserId,
                    HttpContext.Connection.RemoteIpAddress?.ToString(), cancellationToken);

                return CreatedAtAction(nameof(GetById), new { id = patient.PatientId }, patient);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating patient");
                var errorMessage = _env.IsDevelopment()
                    ? $"Error: {ex.Message}\n{ex.InnerException?.Message}"
                    : "Internal server error";
                return StatusCode(500, errorMessage);
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "1,2")]
        public async Task<ActionResult<PatientResponseDto>> Update(int id, [FromBody] UpdatePatientDto dto, CancellationToken cancellationToken)
        {
            try
            {
                var updated = await _service.UpdateAsync(id, dto, User.GetUserId(), Ip(), cancellationToken);
                return updated == null ? NotFound() : Ok(updated);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating patient {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "1,2")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            try
            {
                var ok = await _service.DeleteAsync(id, User.GetUserId(), Ip(), cancellationToken);
                return ok ? NoContent() : NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting patient {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}/activity")]
        public async Task<ActionResult<IEnumerable<AuditLogResponseDto>>> GetActivity(int id, CancellationToken cancellationToken)
        {
            try
            {
                return Ok(await _service.GetActivityAsync(id, cancellationToken));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving activity for patient {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        // ===== Medical item edit/delete (roles 1,2) =====

        [HttpPut("allergies/{allergyId}")]
        [Authorize(Roles = "1,2")]
        public async Task<IActionResult> UpdateAllergy(int allergyId, [FromBody] CreateAllergyDto dto, CancellationToken cancellationToken)
            => await _service.UpdateAllergyAsync(allergyId, dto, User.GetUserId(), Ip(), cancellationToken) ? NoContent() : NotFound();

        [HttpDelete("allergies/{allergyId}")]
        [Authorize(Roles = "1,2")]
        public async Task<IActionResult> DeleteAllergy(int allergyId, CancellationToken cancellationToken)
            => await _service.DeleteAllergyAsync(allergyId, User.GetUserId(), Ip(), cancellationToken) ? NoContent() : NotFound();

        [HttpPut("history/{historyId}")]
        [Authorize(Roles = "1,2")]
        public async Task<IActionResult> UpdateHistory(int historyId, [FromBody] CreateMedicalHistoryDto dto, CancellationToken cancellationToken)
            => await _service.UpdateHistoryAsync(historyId, dto, User.GetUserId(), Ip(), cancellationToken) ? NoContent() : NotFound();

        [HttpDelete("history/{historyId}")]
        [Authorize(Roles = "1,2")]
        public async Task<IActionResult> DeleteHistory(int historyId, CancellationToken cancellationToken)
            => await _service.DeleteHistoryAsync(historyId, User.GetUserId(), Ip(), cancellationToken) ? NoContent() : NotFound();

        [HttpPut("medications/{medicationId}")]
        [Authorize(Roles = "1,2")]
        public async Task<IActionResult> UpdateMedication(int medicationId, [FromBody] CreateMedicationSchemeDto dto, CancellationToken cancellationToken)
            => await _service.UpdateMedicationAsync(medicationId, dto, User.GetUserId(), Ip(), cancellationToken) ? NoContent() : NotFound();

        [HttpDelete("medications/{medicationId}")]
        [Authorize(Roles = "1,2")]
        public async Task<IActionResult> DeleteMedication(int medicationId, CancellationToken cancellationToken)
            => await _service.DeleteMedicationAsync(medicationId, User.GetUserId(), Ip(), cancellationToken) ? NoContent() : NotFound();

        private string? Ip() => HttpContext.Connection.RemoteIpAddress?.ToString();
    }
}
