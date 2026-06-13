using Elderlynk.Models;

namespace Elderlynk.Services
{
    public interface ISensorMeasurementService
    {
        Task<IEnumerable<SensorMeasurementResponseDto>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<SensorMeasurementResponseDto?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
        Task<SensorMeasurementResponseDto> CreateAsync(CreateSensorMeasurementDto dto, CancellationToken cancellationToken = default);
        Task UpdateAsync(long id, UpdateSensorMeasurementDto dto, CancellationToken cancellationToken = default);
        Task DeleteAsync(long id, CancellationToken cancellationToken = default);
    }
}
