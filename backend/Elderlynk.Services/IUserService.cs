using Elderlynk.Models;

namespace Elderlynk.Services
{
    public interface IUserService
    {
        Task<IEnumerable<UserResponseDto>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<UserResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<UserResponseDto> CreateAsync(CreateUserDto dto, CancellationToken cancellationToken = default);
        Task UpdateAsync(int id, UpdateUserDto dto, CancellationToken cancellationToken = default);
        Task DeleteAsync(int id, CancellationToken cancellationToken = default);
    }
}
