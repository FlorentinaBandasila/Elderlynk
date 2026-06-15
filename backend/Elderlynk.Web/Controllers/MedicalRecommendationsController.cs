using Elderlynk.Models;
using Elderlynk.Services;
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
    }
}
