using Elderlynk.Models;

namespace Elderlynk.Services
{
    public interface IPatientService
    {
        Task<IEnumerable<PatientResponseDto>> GetAllAsync(CancellationToken cancellationToken = default);

        /// <summary>Returns patients visible to the given account according to its role.</summary>
        Task<IEnumerable<PatientResponseDto>> GetForUserAsync(int userId, int role, CancellationToken cancellationToken = default);

        Task<PatientResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

        /// <summary>
        /// Creates a patient. When <paramref name="linkMedicId"/> is provided, an initial
        /// Consultatii row is created so the medic "owns" the patient. Any allergies,
        /// medical history, recommendations and medication schemes supplied on the DTO are
        /// persisted as well (recommendations/medications are attached to the initial
        /// consultation, so they are only saved when <paramref name="linkMedicId"/> is set).
        /// </summary>
        Task<PatientResponseDto> CreateAsync(CreatePatientDto dto, int? linkMedicId, int actingUserId, string? sourceIp, CancellationToken cancellationToken = default);

        Task<IEnumerable<AllergyResponseDto>> GetAllergiesAsync(int patientId, CancellationToken cancellationToken = default);
        Task<IEnumerable<MedicalHistoryResponseDto>> GetHistoryAsync(int patientId, CancellationToken cancellationToken = default);
        Task<IEnumerable<MedicationSchemeResponseDto>> GetMedicationsAsync(int patientId, CancellationToken cancellationToken = default);
    }
}
