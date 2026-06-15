using Elderlynk.Models;
using Microsoft.EntityFrameworkCore;

namespace Elderlynk.Services
{
    public class AlarmService : IAlarmService
    {
        private readonly DbContext _context;

        public AlarmService(DbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<AlarmResponseDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var alarms = await _context.Set<Alarm>()
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            var patients = await _context.Set<Patient>()
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            var sensors = await _context.Set<SensorConfig>()
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            var measurements = await _context.Set<SensorMeasurement>()
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            return alarms.Select(a => {
                var patient = patients.FirstOrDefault(p => p.PatientId == a.PatientId);
                var sensor = sensors.FirstOrDefault(s => s.SensorId == a.SensorId);
                var latestMeasurement = measurements
                    .Where(m => m.SensorId == a.SensorId)
                    .OrderByDescending(m => m.MeasurementDateTime)
                    .FirstOrDefault();

                return new AlarmResponseDto
                {
                    AlarmId = a.AlarmId,
                    SensorId = a.SensorId,
                    PatientId = a.PatientId,
                    AlarmType = a.AlarmType,
                    Message = a.Message,
                    TriggerDate = a.TriggerDate,
                    ResolutionDate = a.ResolutionDate,
                    SupervisorId = a.SupervisorId,
                    ResolutionNotes = a.ResolutionNotes,
                    IsResolved = a.IsResolved,
                    PatientFirstName = patient?.FirstName,
                    PatientLastName = patient?.LastName,
                    SensorName = sensor?.Name,
                    MeasurementValue = latestMeasurement?.Value
                };
            });
        }

        public async Task<IEnumerable<AlarmResponseDto>> GetForUserAsync(int userId, int role, CancellationToken cancellationToken = default)
        {
            // Role ids: 1=Admin, 2=Medic, 3=Supraveghetor, 4=Pacient
            IQueryable<Alarm> query = _context.Set<Alarm>().AsNoTracking();

            switch (role)
            {
                case 1: // Admin – all
                    break;
                case 2: // Medic – alarms of patients the medic owns (via Consultatii)
                    query = query.Where(a => _context.Set<Consultation>()
                        .Any(c => c.PatientId == a.PatientId && c.DoctorId == userId));
                    break;
                case 3: // Supraveghetor – alarms assigned to this supervisor
                    query = query.Where(a => a.SupervisorId == userId);
                    break;
                case 4: // Pacient – own alarms (userId == ID_Pacient)
                    query = query.Where(a => a.PatientId == userId);
                    break;
                default:
                    return Enumerable.Empty<AlarmResponseDto>();
            }

            var alarms = await query.ToListAsync(cancellationToken);

            var patients = await _context.Set<Patient>().AsNoTracking().ToListAsync(cancellationToken);
            var sensors = await _context.Set<SensorConfig>().AsNoTracking().ToListAsync(cancellationToken);
            var measurements = await _context.Set<SensorMeasurement>().AsNoTracking().ToListAsync(cancellationToken);

            return alarms.Select(a =>
            {
                var patient = patients.FirstOrDefault(p => p.PatientId == a.PatientId);
                var sensor = sensors.FirstOrDefault(s => s.SensorId == a.SensorId);
                var latestMeasurement = measurements
                    .Where(m => m.SensorId == a.SensorId)
                    .OrderByDescending(m => m.MeasurementDateTime)
                    .FirstOrDefault();

                return new AlarmResponseDto
                {
                    AlarmId = a.AlarmId,
                    SensorId = a.SensorId,
                    PatientId = a.PatientId,
                    AlarmType = a.AlarmType,
                    Message = a.Message,
                    TriggerDate = a.TriggerDate,
                    ResolutionDate = a.ResolutionDate,
                    SupervisorId = a.SupervisorId,
                    ResolutionNotes = a.ResolutionNotes,
                    IsResolved = a.IsResolved,
                    PatientFirstName = patient?.FirstName,
                    PatientLastName = patient?.LastName,
                    SensorName = sensor?.Name,
                    MeasurementValue = latestMeasurement?.Value
                };
            });
        }

        public async Task<AlarmResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var alarm = await _context.Set<Alarm>()
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.AlarmId == id, cancellationToken);

            if (alarm == null)
                return null;

            var patient = await _context.Set<Patient>()
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.PatientId == alarm.PatientId, cancellationToken);

            var sensor = await _context.Set<SensorConfig>()
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.SensorId == alarm.SensorId, cancellationToken);

            var latestMeasurement = await _context.Set<SensorMeasurement>()
                .AsNoTracking()
                .Where(m => m.SensorId == alarm.SensorId)
                .OrderByDescending(m => m.MeasurementDateTime)
                .FirstOrDefaultAsync(cancellationToken);

            return new AlarmResponseDto
            {
                AlarmId = alarm.AlarmId,
                SensorId = alarm.SensorId,
                PatientId = alarm.PatientId,
                AlarmType = alarm.AlarmType,
                Message = alarm.Message,
                TriggerDate = alarm.TriggerDate,
                ResolutionDate = alarm.ResolutionDate,
                SupervisorId = alarm.SupervisorId,
                ResolutionNotes = alarm.ResolutionNotes,
                IsResolved = alarm.IsResolved,
                PatientFirstName = patient?.FirstName,
                PatientLastName = patient?.LastName,
                SensorName = sensor?.Name,
                MeasurementValue = latestMeasurement?.Value
            };
        }

        public async Task<AlarmResponseDto> CreateAsync(CreateAlarmDto dto, CancellationToken cancellationToken = default)
        {
            var alarm = new Alarm
            {
                SensorId = dto.SensorId,
                PatientId = dto.PatientId,
                AlarmType = dto.AlarmType,
                Message = dto.Message,
                TriggerDate = DateTime.Now,
                IsResolved = false
            };

            _context.Set<Alarm>().Add(alarm);
            await _context.SaveChangesAsync(cancellationToken);

            var patient = await _context.Set<Patient>()
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.PatientId == alarm.PatientId, cancellationToken);

            var sensor = await _context.Set<SensorConfig>()
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.SensorId == alarm.SensorId, cancellationToken);

            var latestMeasurement = await _context.Set<SensorMeasurement>()
                .AsNoTracking()
                .Where(m => m.SensorId == alarm.SensorId)
                .OrderByDescending(m => m.MeasurementDateTime)
                .FirstOrDefaultAsync(cancellationToken);

            return new AlarmResponseDto
            {
                AlarmId = alarm.AlarmId,
                SensorId = alarm.SensorId,
                PatientId = alarm.PatientId,
                AlarmType = alarm.AlarmType,
                Message = alarm.Message,
                TriggerDate = alarm.TriggerDate,
                ResolutionDate = alarm.ResolutionDate,
                SupervisorId = alarm.SupervisorId,
                ResolutionNotes = alarm.ResolutionNotes,
                IsResolved = alarm.IsResolved,
                PatientFirstName = patient?.FirstName,
                PatientLastName = patient?.LastName,
                SensorName = sensor?.Name,
                MeasurementValue = latestMeasurement?.Value
            };
        }

        public async Task UpdateAsync(int id, UpdateAlarmDto dto, CancellationToken cancellationToken = default)
        {
            var alarm = await _context.Set<Alarm>()
                .FirstOrDefaultAsync(a => a.AlarmId == id, cancellationToken);

            if (alarm == null)
                throw new KeyNotFoundException($"Alarm with ID {id} not found.");

            if (dto.SensorId.HasValue)
                alarm.SensorId = dto.SensorId;
            if (dto.PatientId.HasValue)
                alarm.PatientId = dto.PatientId;
            if (dto.AlarmType != null)
                alarm.AlarmType = dto.AlarmType;
            if (dto.Message != null)
                alarm.Message = dto.Message;
            if (dto.ResolutionDate.HasValue)
                alarm.ResolutionDate = dto.ResolutionDate;
            if (dto.SupervisorId.HasValue)
                alarm.SupervisorId = dto.SupervisorId;
            if (dto.ResolutionNotes != null)
                alarm.ResolutionNotes = dto.ResolutionNotes;
            if (dto.IsResolved.HasValue)
                alarm.IsResolved = dto.IsResolved;

            _context.Set<Alarm>().Update(alarm);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var alarm = await _context.Set<Alarm>()
                .FirstOrDefaultAsync(a => a.AlarmId == id, cancellationToken);

            if (alarm == null)
                throw new KeyNotFoundException($"Alarm with ID {id} not found.");

            _context.Set<Alarm>().Remove(alarm);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
