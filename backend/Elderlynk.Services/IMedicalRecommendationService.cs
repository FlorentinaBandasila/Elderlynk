using Elderlynk.Models;

namespace Elderlynk.Services
{
    public interface IMedicalRecommendationService
    {
        Task<IEnumerable<MedicalRecommendationResponseDto>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<MedicalRecommendationResponseDto>> GetByPatientIdAsync(int patientId, CancellationToken cancellationToken = default);

        /// <summary>
        /// Adds a recommendation for a patient. Recomandari_Medicale requires a consultation,
        /// so it is attached to the medic's most recent consultation for that patient, creating
        /// one if none exists.
        /// </summary>
        Task<MedicalRecommendationResponseDto> CreateAsync(CreateMedicalRecommendationDto dto, int doctorId, string? sourceIp, CancellationToken cancellationToken = default);
        Task<bool> UpdateAsync(int id, CreatePatientRecommendationDto dto, int actingUserId, string? sourceIp, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(int id, int actingUserId, string? sourceIp, CancellationToken cancellationToken = default);
    }
}
