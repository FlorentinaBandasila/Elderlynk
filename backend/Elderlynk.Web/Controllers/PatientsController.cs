using Elderlynk.Models;
using Elderlynk.Services;
using Microsoft.AspNetCore.Mvc;

namespace Elderlynk.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PatientsController : ControllerBase
    {
        private readonly IPatientService _service;
        private readonly ILogger<PatientsController> _logger;

        public PatientsController(IPatientService service, ILogger<PatientsController> logger)
        {
            _service = service;
            _logger = logger;
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
                return StatusCode(500, "Internal server error");
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
    }
}
