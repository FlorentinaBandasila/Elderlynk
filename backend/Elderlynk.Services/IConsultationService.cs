using Elderlynk.Models;

namespace Elderlynk.Services
{
    public interface IConsultationService
    {
        Task<IEnumerable<ConsultationResponseDto>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<ConsultationResponseDto>> GetForUserAsync(int userId, int role, CancellationToken cancellationToken = default);
        Task<ConsultationResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<ConsultationResponseDto> CreateAsync(CreateConsultationDto dto, CancellationToken cancellationToken = default);
        Task UpdateAsync(int id, UpdateConsultationDto dto, CancellationToken cancellationToken = default);
        Task DeleteAsync(int id, CancellationToken cancellationToken = default);
        Task<IEnumerable<MedicalRecommendationResponseDto>> GetRecommendationsAsync(int consultationId, CancellationToken cancellationToken = default);
        Task<IEnumerable<MedicationSchemeResponseDto>> GetMedicationsAsync(int consultationId, CancellationToken cancellationToken = default);
    }
}
