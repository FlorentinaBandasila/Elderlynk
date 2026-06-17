using Elderlynk.Models;
using Microsoft.EntityFrameworkCore;

namespace Elderlynk.Services
{
    /// <summary>
    /// Result of evaluating a sensor's recent readings against its thresholds.
    /// <see cref="Decision"/> is one of "OK", "Atentionare" (warning), "Alarma" (alarm).
    /// When an alarm/warning was raised, <see cref="CreatedAlarm"/> holds the new row.
    /// </summary>
    public class AlarmEvaluationResult
    {
        public string Decision { get; set; } = "OK";
        public string? Message { get; set; }
        public decimal? Value { get; set; }
        public bool Suppressed { get; set; }   // true when within the post-activity grace window
        public AlarmResponseDto? CreatedAlarm { get; set; }
    }

    public class AlarmEvaluationService : IAlarmEvaluationService
    {
        private readonly DbContext _context;
        private readonly IAlarmService _alarms;

        public AlarmEvaluationService(DbContext context, IAlarmService alarms)
        {
            _context = context;
            _alarms = alarms;
        }

        public async Task<AlarmEvaluationResult> EvaluateSensorAsync(
            int sensorId, DateTimeOffset? activityStart, CancellationToken cancellationToken = default)
        {
            var sensor = await _context.Set<SensorConfig>()
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.SensorId == sensorId, cancellationToken);

            if (sensor == null)
                return new AlarmEvaluationResult { Decision = "OK", Message = "Senzor inexistent." };

            // Pull recent readings (newest first) so we can measure how long a breach has persisted.
            var recent = await _context.Set<SensorMeasurement>()
                .AsNoTracking()
                .Where(m => m.SensorId == sensorId && m.Value != null)
                .OrderByDescending(m => m.MeasurementDateTime)
                .Take(200)
                .ToListAsync(cancellationToken);

            if (recent.Count == 0)
                return new AlarmEvaluationResult { Decision = "OK", Message = "Nicio măsurătoare." };

            var latest = recent[0];
            var value = latest.Value!.Value;

            // Which band is the latest reading in?
            var band = Classify(value, sensor);
            if (band == Band.Normal)
                return new AlarmEvaluationResult { Decision = "OK", Value = value };

            // Annex 3: tolerate breaches during the grace window after activity starts.
            if (activityStart.HasValue && sensor.ActivityGraceSeconds is int grace && grace > 0)
            {
                var sinceActivity = (DateTimeOffset.Now - activityStart.Value).TotalSeconds;
                if (sinceActivity >= 0 && sinceActivity < grace)
                {
                    return new AlarmEvaluationResult
                    {
                        Decision = "OK",
                        Suppressed = true,
                        Value = value,
                        Message = $"Valoare în afara limitelor, dar în perioada de toleranță post-activitate ({grace}s).",
                    };
                }
            }

            // Annex 3: the breach must persist for at least PersistenceSeconds.
            var persistence = sensor.PersistenceSeconds ?? 0;
            if (persistence > 0)
            {
                // Walk back through contiguous out-of-range readings and find the oldest in the run.
                DateTimeOffset breachStart = latest.MeasurementDateTime ?? DateTimeOffset.Now;
                foreach (var m in recent)
                {
                    if (Classify(m.Value!.Value, sensor) == Band.Normal) break;
                    if (m.MeasurementDateTime.HasValue && m.MeasurementDateTime.Value < breachStart)
                        breachStart = m.MeasurementDateTime.Value;
                }

                var breachDuration = ((latest.MeasurementDateTime ?? DateTimeOffset.Now) - breachStart).TotalSeconds;
                if (breachDuration < persistence)
                {
                    return new AlarmEvaluationResult
                    {
                        Decision = "OK",
                        Value = value,
                        Message = $"Valoare în afara limitelor de {breachDuration:0}s (sub pragul de persistență de {persistence}s).",
                    };
                }
            }

            // Conditions met → raise. Alarm band maps to a critical alarm, warning band to a medium warning.
            var isAlarm = band is Band.LowAlarm or Band.HighAlarm;
            var alarmType = isAlarm ? "Critical" : "Medium";
            var direction = band is Band.LowAlarm or Band.LowWarning ? "sub limita inferioară" : "peste limita superioară";
            var label = isAlarm ? "ALARMĂ" : "Atenționare";
            var message = $"{label}: {sensor.SensorType ?? "senzor"} = {value}{sensor.MeasurementUnit} ({direction}).";

            var patientId = await ResolvePatientIdAsync(sensor.DeviceId, cancellationToken);

            var created = await _alarms.CreateAsync(new CreateAlarmDto
            {
                SensorId = sensorId,
                PatientId = patientId,
                AlarmType = alarmType,
                Message = message,
            }, cancellationToken);

            return new AlarmEvaluationResult
            {
                Decision = isAlarm ? "Alarma" : "Atentionare",
                Message = message,
                Value = value,
                CreatedAlarm = created,
            };
        }

        private async Task<int?> ResolvePatientIdAsync(int? deviceId, CancellationToken cancellationToken)
        {
            if (deviceId == null) return null;
            var device = await _context.Set<Device>().AsNoTracking()
                .FirstOrDefaultAsync(d => d.DeviceId == deviceId, cancellationToken);
            return device?.PatientId;
        }

        private enum Band { Normal, LowWarning, HighWarning, LowAlarm, HighAlarm }

        private static Band Classify(decimal value, SensorConfig s)
        {
            if (s.LowerAlarmThreshold.HasValue && value < s.LowerAlarmThreshold.Value) return Band.LowAlarm;
            if (s.UpperAlarmThreshold.HasValue && value > s.UpperAlarmThreshold.Value) return Band.HighAlarm;
            if (s.LowerWarningThreshold.HasValue && value < s.LowerWarningThreshold.Value) return Band.LowWarning;
            if (s.UpperWarningThreshold.HasValue && value > s.UpperWarningThreshold.Value) return Band.HighWarning;
            return Band.Normal;
        }
    }
}
