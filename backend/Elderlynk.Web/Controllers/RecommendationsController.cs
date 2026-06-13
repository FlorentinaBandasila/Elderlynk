using Elderlynk.Models;
using Elderlynk.Services;
using Microsoft.AspNetCore.Mvc;

namespace Elderlynk.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecommendationsController : ControllerBase
    {
        private readonly IRecommendationService _service;
        private readonly ILogger<RecommendationsController> _logger;

        public RecommendationsController(IRecommendationService service, ILogger<RecommendationsController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RecommendationResponseDto>>> GetAll(CancellationToken cancellationToken)
        {
            try
            {
                var recommendations = await _service.GetAllAsync(cancellationToken);
                return Ok(recommendations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving recommendations");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RecommendationResponseDto>> GetById(int id, CancellationToken cancellationToken)
        {
            try
            {
                var recommendation = await _service.GetByIdAsync(id, cancellationToken);
                if (recommendation == null)
                    return NotFound();

                return Ok(recommendation);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving recommendation with ID {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost]
        public async Task<ActionResult<RecommendationResponseDto>> Create(
            [FromBody] CreateRecommendationDto dto,
            CancellationToken cancellationToken)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _service.CreateAsync(dto, cancellationToken);
                return CreatedAtAction(nameof(GetById), new { id = result.RecommendationId }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating recommendation");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateRecommendationDto dto, CancellationToken cancellationToken)
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
                _logger.LogError(ex, "Error updating recommendation with ID {Id}", id);
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
                _logger.LogError(ex, "Error deleting recommendation with ID {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
