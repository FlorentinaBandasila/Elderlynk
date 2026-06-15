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
        /// Consultatii row is created so the medic "owns" the patient.
        /// </summary>
        Task<PatientResponseDto> CreateAsync(CreatePatientDto dto, int? linkMedicId, int actingUserId, string? sourceIp, CancellationToken cancellationToken = default);
    }
}
