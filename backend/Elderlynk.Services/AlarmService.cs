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

            return alarms.Select(a => new AlarmResponseDto
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
                IsResolved = a.IsResolved
            });
        }

        public async Task<AlarmResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var alarm = await _context.Set<Alarm>()
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.AlarmId == id, cancellationToken);

            if (alarm == null)
                return null;

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
                IsResolved = alarm.IsResolved
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
                IsResolved = alarm.IsResolved
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
