using Elderlynk.Models;
using Microsoft.EntityFrameworkCore;

namespace Elderlynk.Services
{
    public class SensorConfigService : ISensorConfigService
    {
        // Role ids (Roluri): 1=Admin, 2=Medic, 3=Supraveghetor, 4=Pacient
        private const int RoleAdmin = 1;
        private const int RoleMedic = 2;
        private const int RoleSupervisor = 3;
        private const int RolePatient = 4;

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
                Active = c.Active,
                PersistenceSeconds = c.PersistenceSeconds,
                ActivityGraceSeconds = c.ActivityGraceSeconds
            });
        }

        public async Task<IEnumerable<SensorConfigResponseDto>> GetForUserAsync(int userId, int role, CancellationToken cancellationToken = default)
        {
            // Resolve the set of patient ids this account may see. null = no restriction (Admin).
            HashSet<int>? visiblePatients;
            switch (role)
            {
                case RoleAdmin:
                    visiblePatients = null;
                    break;
                case RoleMedic:
                    visiblePatients = (await _context.Set<Consultation>().AsNoTracking()
                        .Where(c => c.DoctorId == userId && c.PatientId != null)
                        .Select(c => c.PatientId!.Value)
                        .Distinct()
                        .ToListAsync(cancellationToken)).ToHashSet();
                    break;
                case RoleSupervisor:
                    visiblePatients = (await _context.Set<Alarm>().AsNoTracking()
                        .Where(a => a.SupervisorId == userId && a.PatientId != null)
                        .Select(a => a.PatientId!.Value)
                        .Distinct()
                        .ToListAsync(cancellationToken)).ToHashSet();
                    break;
                case RolePatient:
                    visiblePatients = new HashSet<int> { userId };
                    break;
                default:
                    return Enumerable.Empty<SensorConfigResponseDto>();
            }

            var sensors = await _context.Set<SensorConfig>().AsNoTracking().ToListAsync(cancellationToken);
            var deviceToPatient = await _context.Set<Device>().AsNoTracking()
                .Where(d => d.PatientId != null)
                .ToDictionaryAsync(d => d.DeviceId, d => d.PatientId!.Value, cancellationToken);
            var patientNames = await _context.Set<Patient>().AsNoTracking()
                .ToDictionaryAsync(p => p.PatientId, p => BuildName(p.FirstName, p.LastName), cancellationToken);

            // Latest reading per sensor from Masuratori_Senzori, keyed by sensor id.
            var sensorIds = sensors.Select(s => s.SensorId).ToList();
            var latestReadings = (await _context.Set<SensorMeasurement>().AsNoTracking()
                .Where(m => m.SensorId != null && sensorIds.Contains(m.SensorId.Value))
                .GroupBy(m => m.SensorId!.Value)
                .Select(g => g
                    .OrderByDescending(m => m.MeasurementDateTime)
                    .Select(m => new { m.SensorId, m.Value, m.MeasurementDateTime })
                    .First())
                .ToListAsync(cancellationToken))
                .ToDictionary(r => r.SensorId!.Value, r => (r.Value, r.MeasurementDateTime));

            var result = new List<SensorConfigResponseDto>();
            foreach (var sensor in sensors)
            {
                int? patientId = sensor.DeviceId.HasValue && deviceToPatient.TryGetValue(sensor.DeviceId.Value, out var pid)
                    ? pid
                    : null;

                if (visiblePatients != null && (patientId == null || !visiblePatients.Contains(patientId.Value)))
                    continue;

                var patientName = patientId != null && patientNames.TryGetValue(patientId.Value, out var n) ? n : null;
                var (lastValue, lastDate) = latestReadings.TryGetValue(sensor.SensorId, out var reading)
                    ? reading
                    : (null, null);
                result.Add(Map(sensor, patientId, patientName, lastValue, lastDate));
            }

            return result;
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
                Active = config.Active,
                PersistenceSeconds = config.PersistenceSeconds,
                ActivityGraceSeconds = config.ActivityGraceSeconds
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
                Active = dto.Active ?? true,
                PersistenceSeconds = dto.PersistenceSeconds,
                ActivityGraceSeconds = dto.ActivityGraceSeconds
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
                Active = config.Active,
                PersistenceSeconds = config.PersistenceSeconds,
                ActivityGraceSeconds = config.ActivityGraceSeconds
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
            if (dto.PersistenceSeconds.HasValue)
                config.PersistenceSeconds = dto.PersistenceSeconds;
            if (dto.ActivityGraceSeconds.HasValue)
                config.ActivityGraceSeconds = dto.ActivityGraceSeconds;

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

        private static SensorConfigResponseDto Map(
            SensorConfig c,
            int? patientId,
            string? patientName,
            decimal? lastValue = null,
            DateTimeOffset? lastReadingDateTime = null) => new()
        {
            SensorId = c.SensorId,
            DeviceId = c.DeviceId,
            PatientId = patientId,
            PatientName = patientName,
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
            Active = c.Active,
            PersistenceSeconds = c.PersistenceSeconds,
            ActivityGraceSeconds = c.ActivityGraceSeconds,
            LastValue = lastValue,
            LastReadingDateTime = lastReadingDateTime
        };

        private static string? BuildName(string? first, string? last)
        {
            var name = $"{first} {last}".Trim();
            return string.IsNullOrEmpty(name) ? null : name;
        }
    }
}
