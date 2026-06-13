using Elderlynk.Models;
using Elderlynk.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Elderlynk.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PatientsController : ControllerBase
    {
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
                var patients = await _service.GetAllAsync(cancellationToken);
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

        [HttpPost]
        public async Task<ActionResult<PatientResponseDto>> Create([FromBody] CreatePatientDto dto, CancellationToken cancellationToken)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var patient = new Patient
                {
                    UserId = dto.UserId,
                    CNP = dto.CNP,
                    Age = dto.Age,
                    Street = dto.Street,
                    City = dto.City,
                    County = dto.County,
                    Profession = dto.Profession,
                    WorkPlace = dto.WorkPlace
                };

                var dbContext = _service.GetType().GetField("_context", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)?.GetValue(_service) as DbContext;
                dbContext?.Add(patient);
                await dbContext?.SaveChangesAsync(cancellationToken)!;

                return CreatedAtAction(nameof(GetById), new { id = patient.PatientId }, new PatientResponseDto
                {
                    PatientId = patient.PatientId,
                    UserId = patient.UserId,
                    CNP = patient.CNP,
                    Age = patient.Age,
                    Street = patient.Street,
                    City = patient.City,
                    County = patient.County,
                    Profession = patient.Profession,
                    WorkPlace = patient.WorkPlace
                });
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
