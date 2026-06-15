using Elderlynk.Services;
using Microsoft.AspNetCore.Mvc;

namespace Elderlynk.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public class ICDController : ControllerBase
    {
        private readonly IICDService _service;
        private readonly ILogger<ICDController> _logger;

        public ICDController(IICDService service, ILogger<ICDController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet("lookup/{code}")]
        public async Task<ActionResult<object>> GetICDDescription(string code, CancellationToken cancellationToken)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(code))
                    return BadRequest("ICD code is required");

                var description = await _service.GetICDDescriptionAsync(code, cancellationToken);
                return Ok(new { code, description });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error looking up ICD code {code}: {ex.Message}");
                return StatusCode(500, "Error looking up ICD code");
            }
        }

        [HttpPost("lookup")]
        public async Task<ActionResult<object>> GetICDDescriptions([FromBody] string[] codes, CancellationToken cancellationToken)
        {
            try
            {
                if (codes == null || codes.Length == 0)
                    return BadRequest("ICD codes are required");

                var results = new Dictionary<string, string>();
                foreach (var code in codes)
                {
                    var description = await _service.GetICDDescriptionAsync(code, cancellationToken);
                    results[code] = description;
                }

                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error looking up ICD codes: {ex.Message}");
                return StatusCode(500, "Error looking up ICD codes");
            }
        }
    }
}
