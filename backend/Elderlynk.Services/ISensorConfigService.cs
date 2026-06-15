using Elderlynk.Models;

namespace Elderlynk.Services
{
    public interface ISensorConfigService
    {
        Task<IEnumerable<SensorConfigResponseDto>> GetAllAsync(CancellationToken cancellationToken = default);

        /// <summary>
        /// Returns sensors visible to the account according to its role. Sensors are linked to
        /// patients via Dispozitive_ESP32 (device → patient); a medic sees the sensors of every
        /// patient they own through Consultatii.
        /// </summary>
        Task<IEnumerable<SensorConfigResponseDto>> GetForUserAsync(int userId, int role, CancellationToken cancellationToken = default);

        Task<SensorConfigResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<SensorConfigResponseDto> CreateAsync(CreateSensorConfigDto dto, CancellationToken cancellationToken = default);
        Task UpdateAsync(int id, UpdateSensorConfigDto dto, CancellationToken cancellationToken = default);
        Task DeleteAsync(int id, CancellationToken cancellationToken = default);
    }
}
