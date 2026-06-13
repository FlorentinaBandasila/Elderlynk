using Elderlynk.Models;

namespace Elderlynk.Services
{
    public interface IDoctorService
    {
        Task<IEnumerable<DoctorResponseDto>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<DoctorResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<DoctorResponseDto> CreateAsync(CreateDoctorDto dto, CancellationToken cancellationToken = default);
        Task UpdateAsync(int id, UpdateDoctorDto dto, CancellationToken cancellationToken = default);
        Task DeleteAsync(int id, CancellationToken cancellationToken = default);
    }
}
