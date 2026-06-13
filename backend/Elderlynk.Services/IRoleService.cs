using Elderlynk.Models;

namespace Elderlynk.Services
{
    public interface IRoleService
    {
        Task<IEnumerable<RoleResponseDto>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<RoleResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<RoleResponseDto> CreateAsync(CreateRoleDto dto, CancellationToken cancellationToken = default);
        Task UpdateAsync(int id, UpdateRoleDto dto, CancellationToken cancellationToken = default);
        Task DeleteAsync(int id, CancellationToken cancellationToken = default);
    }
}
