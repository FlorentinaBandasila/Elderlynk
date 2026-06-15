using Elderlynk.Models;

namespace Elderlynk.Services
{
    public interface IAlarmService
    {
        Task<IEnumerable<AlarmResponseDto>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<AlarmResponseDto>> GetForUserAsync(int userId, int role, CancellationToken cancellationToken = default);
        Task<AlarmResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<AlarmResponseDto> CreateAsync(CreateAlarmDto dto, CancellationToken cancellationToken = default);
        Task UpdateAsync(int id, UpdateAlarmDto dto, CancellationToken cancellationToken = default);
        Task DeleteAsync(int id, CancellationToken cancellationToken = default);
    }
}
