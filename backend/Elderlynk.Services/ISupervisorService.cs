using Elderlynk.Models;

namespace Elderlynk.Services
{
    public interface ISupervisorService
    {
        Task<IEnumerable<SupervisorResponseDto>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<SupervisorResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<SupervisorResponseDto> CreateAsync(CreateSupervisorDto dto, CancellationToken cancellationToken = default);
        Task UpdateAsync(int id, UpdateSupervisorDto dto, CancellationToken cancellationToken = default);
        Task DeleteAsync(int id, CancellationToken cancellationToken = default);
    }
}
