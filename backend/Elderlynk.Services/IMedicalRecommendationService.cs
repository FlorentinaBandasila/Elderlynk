using Elderlynk.Models;

namespace Elderlynk.Services
{
    public interface IMedicalRecommendationService
    {
        Task<IEnumerable<MedicalRecommendationResponseDto>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<MedicalRecommendationResponseDto>> GetByPatientIdAsync(int patientId, CancellationToken cancellationToken = default);
    }
}
