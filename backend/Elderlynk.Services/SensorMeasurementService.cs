using Elderlynk.Models;
using Microsoft.EntityFrameworkCore;

namespace Elderlynk.Services
{
    public class SensorMeasurementService : ISensorMeasurementService
    {
        private readonly DbContext _context;

        public SensorMeasurementService(DbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<SensorMeasurementResponseDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var measurements = await _context.Set<SensorMeasurement>()
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            return measurements.Select(m => new SensorMeasurementResponseDto
            {
                MeasurementId = m.MeasurementId,
                SensorId = m.SensorId,
                Value = m.Value,
                MeasurementDateTime = m.MeasurementDateTime
            });
        }

        public async Task<SensorMeasurementResponseDto?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
        {
            var measurement = await _context.Set<SensorMeasurement>()
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.MeasurementId == id, cancellationToken);

            if (measurement == null)
                return null;

            return new SensorMeasurementResponseDto
            {
                MeasurementId = measurement.MeasurementId,
                SensorId = measurement.SensorId,
                Value = measurement.Value,
                MeasurementDateTime = measurement.MeasurementDateTime
            };
        }

        public async Task<SensorMeasurementResponseDto> CreateAsync(CreateSensorMeasurementDto dto, CancellationToken cancellationToken = default)
        {
            var measurement = new SensorMeasurement
            {
                SensorId = dto.SensorId,
                Value = dto.Value,
                MeasurementDateTime = DateTimeOffset.UtcNow
            };

            _context.Set<SensorMeasurement>().Add(measurement);
            await _context.SaveChangesAsync(cancellationToken);

            return new SensorMeasurementResponseDto
            {
                MeasurementId = measurement.MeasurementId,
                SensorId = measurement.SensorId,
                Value = measurement.Value,
                MeasurementDateTime = measurement.MeasurementDateTime
            };
        }

        public async Task UpdateAsync(long id, UpdateSensorMeasurementDto dto, CancellationToken cancellationToken = default)
        {
            var measurement = await _context.Set<SensorMeasurement>()
                .FirstOrDefaultAsync(m => m.MeasurementId == id, cancellationToken);

            if (measurement == null)
                throw new KeyNotFoundException($"Sensor measurement with ID {id} not found.");

            if (dto.SensorId.HasValue)
                measurement.SensorId = dto.SensorId;
            if (dto.Value.HasValue)
                measurement.Value = dto.Value;

            _context.Set<SensorMeasurement>().Update(measurement);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteAsync(long id, CancellationToken cancellationToken = default)
        {
            var measurement = await _context.Set<SensorMeasurement>()
                .FirstOrDefaultAsync(m => m.MeasurementId == id, cancellationToken);

            if (measurement == null)
                throw new KeyNotFoundException($"Sensor measurement with ID {id} not found.");

            _context.Set<SensorMeasurement>().Remove(measurement);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
