using Elderlynk.Models;
using Elderlynk.Services;
using Elderlynk.Web.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Elderlynk.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "1,2,3")]
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _service;
        private readonly ILogger<ReportsController> _logger;

        public ReportsController(IReportService service, ILogger<ReportsController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet("overview")]
        public async Task<ActionResult<ReportOverviewDto>> Overview(CancellationToken cancellationToken)
        {
            try
            {
                var report = await _service.GetOverviewAsync(User.GetUserId(), User.GetRole(), cancellationToken);
                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error building report overview");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
