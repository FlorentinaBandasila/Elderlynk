using Elderlynk.Models;
using Microsoft.EntityFrameworkCore;

namespace Elderlynk.Services
{
    public class SensorConfigService : ISensorConfigService
    {
        private readonly DbContext _context;

        public SensorConfigService(DbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<SensorConfigResponseDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var configs = await _context.Set<SensorConfig>()
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            return configs.Select(c => new SensorConfigResponseDto
            {
                SensorId = c.SensorId,
                DeviceId = c.DeviceId,
                OrderNumber = c.OrderNumber,
                Name = c.Name,
                SensorType = c.SensorType,
                MeasurementUnit = c.MeasurementUnit,
                SamplingPeriodSeconds = c.SamplingPeriodSeconds,
                ScaleFactor = c.ScaleFactor,
                LowerAlarmThreshold = c.LowerAlarmThreshold,
                LowerWarningThreshold = c.LowerWarningThreshold,
                UpperWarningThreshold = c.UpperWarningThreshold,
                UpperAlarmThreshold = c.UpperAlarmThreshold,
                Active = c.Active
            });
        }

        public async Task<SensorConfigResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var config = await _context.Set<SensorConfig>()
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.SensorId == id, cancellationToken);

            if (config == null)
                return null;

            return new SensorConfigResponseDto
            {
                SensorId = config.SensorId,
                DeviceId = config.DeviceId,
                OrderNumber = config.OrderNumber,
                Name = config.Name,
                SensorType = config.SensorType,
                MeasurementUnit = config.MeasurementUnit,
                SamplingPeriodSeconds = config.SamplingPeriodSeconds,
                ScaleFactor = config.ScaleFactor,
                LowerAlarmThreshold = config.LowerAlarmThreshold,
                LowerWarningThreshold = config.LowerWarningThreshold,
                UpperWarningThreshold = config.UpperWarningThreshold,
                UpperAlarmThreshold = config.UpperAlarmThreshold,
                Active = config.Active
            };
        }

        public async Task<SensorConfigResponseDto> CreateAsync(CreateSensorConfigDto dto, CancellationToken cancellationToken = default)
        {
            var config = new SensorConfig
            {
                DeviceId = dto.DeviceId,
                OrderNumber = dto.OrderNumber,
                Name = dto.Name,
                SensorType = dto.SensorType,
                MeasurementUnit = dto.MeasurementUnit,
                SamplingPeriodSeconds = dto.SamplingPeriodSeconds ?? 600,
                ScaleFactor = dto.ScaleFactor,
                LowerAlarmThreshold = dto.LowerAlarmThreshold,
                LowerWarningThreshold = dto.LowerWarningThreshold,
                UpperWarningThreshold = dto.UpperWarningThreshold,
                UpperAlarmThreshold = dto.UpperAlarmThreshold,
                Active = dto.Active ?? true
            };

            _context.Set<SensorConfig>().Add(config);
            await _context.SaveChangesAsync(cancellationToken);

            return new SensorConfigResponseDto
            {
                SensorId = config.SensorId,
                DeviceId = config.DeviceId,
                OrderNumber = config.OrderNumber,
                Name = config.Name,
                SensorType = config.SensorType,
                MeasurementUnit = config.MeasurementUnit,
                SamplingPeriodSeconds = config.SamplingPeriodSeconds,
                ScaleFactor = config.ScaleFactor,
                LowerAlarmThreshold = config.LowerAlarmThreshold,
                LowerWarningThreshold = config.LowerWarningThreshold,
                UpperWarningThreshold = config.UpperWarningThreshold,
                UpperAlarmThreshold = config.UpperAlarmThreshold,
                Active = config.Active
            };
        }

        public async Task UpdateAsync(int id, UpdateSensorConfigDto dto, CancellationToken cancellationToken = default)
        {
            var config = await _context.Set<SensorConfig>()
                .FirstOrDefaultAsync(c => c.SensorId == id, cancellationToken);

            if (config == null)
                throw new KeyNotFoundException($"Sensor config with ID {id} not found.");

            if (dto.DeviceId.HasValue)
                config.DeviceId = dto.DeviceId;
            if (dto.OrderNumber.HasValue)
                config.OrderNumber = dto.OrderNumber;
            if (dto.Name != null)
                config.Name = dto.Name;
            if (dto.SensorType != null)
                config.SensorType = dto.SensorType;
            if (dto.MeasurementUnit != null)
                config.MeasurementUnit = dto.MeasurementUnit;
            if (dto.SamplingPeriodSeconds.HasValue)
                config.SamplingPeriodSeconds = dto.SamplingPeriodSeconds;
            if (dto.ScaleFactor.HasValue)
                config.ScaleFactor = dto.ScaleFactor;
            if (dto.LowerAlarmThreshold.HasValue)
                config.LowerAlarmThreshold = dto.LowerAlarmThreshold;
            if (dto.LowerWarningThreshold.HasValue)
                config.LowerWarningThreshold = dto.LowerWarningThreshold;
            if (dto.UpperWarningThreshold.HasValue)
                config.UpperWarningThreshold = dto.UpperWarningThreshold;
            if (dto.UpperAlarmThreshold.HasValue)
                config.UpperAlarmThreshold = dto.UpperAlarmThreshold;
            if (dto.Active.HasValue)
                config.Active = dto.Active;

            _context.Set<SensorConfig>().Update(config);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var config = await _context.Set<SensorConfig>()
                .FirstOrDefaultAsync(c => c.SensorId == id, cancellationToken);

            if (config == null)
                throw new KeyNotFoundException($"Sensor config with ID {id} not found.");

            _context.Set<SensorConfig>().Remove(config);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
