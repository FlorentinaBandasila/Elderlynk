using Elderlynk.Models;

namespace Elderlynk.Services
{
    public interface IAuditLogService
    {
        Task<IEnumerable<AuditLogResponseDto>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<AuditLogResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<AuditLogResponseDto> CreateAsync(CreateAuditLogDto dto, CancellationToken cancellationToken = default);
        Task UpdateAsync(int id, UpdateAuditLogDto dto, CancellationToken cancellationToken = default);
        Task DeleteAsync(int id, CancellationToken cancellationToken = default);
    }
}
