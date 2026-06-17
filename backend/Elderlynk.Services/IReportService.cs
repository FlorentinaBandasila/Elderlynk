using Elderlynk.Models;

namespace Elderlynk.Services
{
    public interface IReportService
    {
        /// <summary>Aggregate statistics scoped to the data the given account may see.</summary>
        Task<ReportOverviewDto> GetOverviewAsync(int userId, int role, CancellationToken cancellationToken = default);
    }
}
