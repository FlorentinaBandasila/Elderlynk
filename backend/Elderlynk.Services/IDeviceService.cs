using Elderlynk.Models;

namespace Elderlynk.Services
{
    public interface IDeviceService
    {
        Task<IEnumerable<DeviceResponseDto>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<DeviceResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<DeviceResponseDto> CreateAsync(CreateDeviceDto dto, CancellationToken cancellationToken = default);
        Task UpdateAsync(int id, UpdateDeviceDto dto, CancellationToken cancellationToken = default);
        Task DeleteAsync(int id, CancellationToken cancellationToken = default);
    }
}
