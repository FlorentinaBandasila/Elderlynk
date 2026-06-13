using Elderlynk.Models;

namespace Elderlynk.Services
{
    public interface ISensorConfigService
    {
        Task<IEnumerable<SensorConfigResponseDto>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<SensorConfigResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<SensorConfigResponseDto> CreateAsync(CreateSensorConfigDto dto, CancellationToken cancellationToken = default);
        Task UpdateAsync(int id, UpdateSensorConfigDto dto, CancellationToken cancellationToken = default);
        Task DeleteAsync(int id, CancellationToken cancellationToken = default);
    }
}
