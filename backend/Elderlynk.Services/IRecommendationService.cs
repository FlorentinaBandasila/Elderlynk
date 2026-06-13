using Elderlynk.Models;

namespace Elderlynk.Services
{
    public interface IRecommendationService
    {
        Task<IEnumerable<RecommendationResponseDto>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<RecommendationResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<RecommendationResponseDto> CreateAsync(CreateRecommendationDto dto, CancellationToken cancellationToken = default);
        Task UpdateAsync(int id, UpdateRecommendationDto dto, CancellationToken cancellationToken = default);
        Task DeleteAsync(int id, CancellationToken cancellationToken = default);
    }
}
