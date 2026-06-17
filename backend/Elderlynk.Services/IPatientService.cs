using Elderlynk.Models;

namespace Elderlynk.Services
{
    public interface IPatientService
    {
        Task<IEnumerable<PatientResponseDto>> GetAllAsync(CancellationToken cancellationToken = default);

        /// <summary>Returns patients visible to the given account according to its role.</summary>
        Task<IEnumerable<PatientResponseDto>> GetForUserAsync(int userId, int role, CancellationToken cancellationToken = default);

        Task<PatientResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

        /// <summary>Lists accounts assignable as a patient's caregiver (Utilizatori with ID_Rol = 5).</summary>
        Task<IEnumerable<UserResponseDto>> GetCaregiversAsync(CancellationToken cancellationToken = default);

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

        Task<PatientResponseDto?> UpdateAsync(int id, UpdatePatientDto dto, int actingUserId, string? sourceIp, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(int id, int actingUserId, string? sourceIp, CancellationToken cancellationToken = default);

        Task<bool> UpdateAllergyAsync(int allergyId, CreateAllergyDto dto, int actingUserId, string? sourceIp, CancellationToken cancellationToken = default);
        Task<bool> DeleteAllergyAsync(int allergyId, int actingUserId, string? sourceIp, CancellationToken cancellationToken = default);

        Task<bool> UpdateHistoryAsync(int historyId, CreateMedicalHistoryDto dto, int actingUserId, string? sourceIp, CancellationToken cancellationToken = default);
        Task<bool> DeleteHistoryAsync(int historyId, int actingUserId, string? sourceIp, CancellationToken cancellationToken = default);

        Task<bool> UpdateMedicationAsync(int medicationId, CreateMedicationSchemeDto dto, int actingUserId, string? sourceIp, CancellationToken cancellationToken = default);
        Task<bool> DeleteMedicationAsync(int medicationId, int actingUserId, string? sourceIp, CancellationToken cancellationToken = default);

        Task<IEnumerable<AuditLogResponseDto>> GetActivityAsync(int patientId, CancellationToken cancellationToken = default);

        /// <summary>
        /// Returns sensor readings for a patient (joined sensor → device → patient),
        /// enriched with sensor metadata/thresholds for graphing. Optionally filtered by date.
        /// </summary>
        Task<IEnumerable<PatientMeasurementDto>> GetMeasurementsAsync(int patientId, DateTimeOffset? from, DateTimeOffset? to, CancellationToken cancellationToken = default);
    }
}
