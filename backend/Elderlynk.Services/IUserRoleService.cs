using Elderlynk.Models;

namespace Elderlynk.Services
{
    public interface IUserRoleService
    {
        Task<IEnumerable<UserRoleResponseDto>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<UserRoleResponseDto?> GetByIdAsync(int userId, int roleId, CancellationToken cancellationToken = default);
        Task<UserRoleResponseDto> CreateAsync(CreateUserRoleDto dto, CancellationToken cancellationToken = default);
        Task UpdateAsync(int userId, int roleId, UpdateUserRoleDto dto, CancellationToken cancellationToken = default);
        Task DeleteAsync(int userId, int roleId, CancellationToken cancellationToken = default);
    }
}
