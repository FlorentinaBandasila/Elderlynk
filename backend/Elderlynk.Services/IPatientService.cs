using Elderlynk.Models;

namespace Elderlynk.Services
{
    public interface IPatientService
    {
        Task<IEnumerable<PatientResponseDto>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<PatientResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    }
}
