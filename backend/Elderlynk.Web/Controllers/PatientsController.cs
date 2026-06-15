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
    }
}
