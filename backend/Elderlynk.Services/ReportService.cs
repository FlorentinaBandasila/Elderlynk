using System.Globalization;
using Elderlynk.Models;
using Microsoft.EntityFrameworkCore;

namespace Elderlynk.Services
{
    public class ReportService : IReportService
    {
        private const int RoleAdmin = 1;
        private const int RoleMedic = 2;
        private const int RoleSupervisor = 3;

        private readonly DbContext _context;

        public ReportService(DbContext context)
        {
            _context = context;
        }

        public async Task<ReportOverviewDto> GetOverviewAsync(int userId, int role, CancellationToken cancellationToken = default)
        {
            // Resolve the set of patient ids in scope. null = no restriction (Admin).
            HashSet<int>? scope = await ResolveScopeAsync(userId, role, cancellationToken);
            if (scope != null && scope.Count == 0)
                return new ReportOverviewDto();   // nothing visible

            bool InScope(int? pid) => scope == null || (pid.HasValue && scope.Contains(pid.Value));

            var alarms = (await _context.Set<Alarm>().AsNoTracking().ToListAsync(cancellationToken))
                .Where(a => InScope(a.PatientId)).ToList();
            var consultations = (await _context.Set<Consultation>().AsNoTracking().ToListAsync(cancellationToken))
                .Where(c => InScope(c.PatientId)).ToList();

            var patientCount = scope?.Count
                ?? await _context.Set<Patient>().AsNoTracking().CountAsync(p => p.Active, cancellationToken);

            // Sensors → measurements in scope (sensor → device → patient).
            var deviceToPatient = await _context.Set<Device>().AsNoTracking()
                .Where(d => d.PatientId != null)
                .ToDictionaryAsync(d => d.DeviceId, d => d.PatientId!.Value, cancellationToken);
            var sensors = await _context.Set<SensorConfig>().AsNoTracking().ToListAsync(cancellationToken);
            var scopedSensorIds = sensors
                .Where(s => s.DeviceId.HasValue && deviceToPatient.TryGetValue(s.DeviceId.Value, out var pid) && InScope(pid))
                .ToDictionary(s => s.SensorId, s => s);

            var measurements = (await _context.Set<SensorMeasurement>().AsNoTracking().ToListAsync(cancellationToken))
                .Where(m => m.SensorId.HasValue && scopedSensorIds.ContainsKey(m.SensorId.Value)).ToList();

            var dto = new ReportOverviewDto
            {
                TotalPatients = patientCount,
                ActiveAlarms = alarms.Count(a => a.IsResolved != true),
                ResolvedAlarms = alarms.Count(a => a.IsResolved == true),
                TotalConsultations = consultations.Count,
                TotalMeasurements = measurements.Count,
            };

            // Alarms by type.
            dto.AlarmsByType = alarms
                .GroupBy(a => string.IsNullOrWhiteSpace(a.AlarmType) ? "Necunoscut" : a.AlarmType!)
                .Select(g => new ReportPoint { Label = g.Key, Value = g.Count() })
                .OrderByDescending(p => p.Value)
                .ToList();

            // Last 6 months buckets (chronological).
            var months = LastSixMonths();
            dto.AlarmsByMonth = months
                .Select(m => new ReportPoint
                {
                    Label = m.label,
                    Value = alarms.Count(a => a.TriggerDate.HasValue && SameMonth(a.TriggerDate.Value, m.year, m.month)),
                }).ToList();

            dto.ConsultationsByMonth = months
                .Select(m => new ReportPoint
                {
                    Label = m.label,
                    Value = consultations.Count(c => c.ConsultationDate.HasValue && SameMonth(c.ConsultationDate.Value, m.year, m.month)),
                }).ToList();

            // Top diagnoses (by ICD code or free text).
            dto.TopDiagnoses = consultations
                .Select(c => !string.IsNullOrWhiteSpace(c.DiagnosisCode) ? c.DiagnosisCode!
                    : (!string.IsNullOrWhiteSpace(c.DiagnosticText) ? c.DiagnosticText! : null))
                .Where(d => d != null)
                .GroupBy(d => d!)
                .Select(g => new ReportPoint { Label = g.Key, Value = g.Count() })
                .OrderByDescending(p => p.Value)
                .Take(8)
                .ToList();

            // Average reading per sensor type.
            dto.AvgMeasurementBySensorType = measurements
                .Where(m => m.Value.HasValue)
                .GroupBy(m => scopedSensorIds[m.SensorId!.Value].SensorType ?? $"Senzor {m.SensorId}")
                .Select(g => new ReportPoint { Label = g.Key, Value = Math.Round(g.Average(m => m.Value!.Value), 2) })
                .OrderBy(p => p.Label)
                .ToList();

            return dto;
        }

        private async Task<HashSet<int>?> ResolveScopeAsync(int userId, int role, CancellationToken cancellationToken)
        {
            switch (role)
            {
                case RoleAdmin:
                    return null;
                case RoleMedic:
                    return (await _context.Set<Consultation>().AsNoTracking()
                        .Where(c => c.DoctorId == userId && c.PatientId != null)
                        .Select(c => c.PatientId!.Value).Distinct().ToListAsync(cancellationToken)).ToHashSet();
                case RoleSupervisor:
                    return (await _context.Set<Alarm>().AsNoTracking()
                        .Where(a => a.SupervisorId == userId && a.PatientId != null)
                        .Select(a => a.PatientId!.Value).Distinct().ToListAsync(cancellationToken)).ToHashSet();
                default:
                    return new HashSet<int>();   // patients/others: no reporting scope
            }
        }

        private static List<(int year, int month, string label)> LastSixMonths()
        {
            var list = new List<(int, int, string)>();
            var now = DateTime.Now;
            var ci = CultureInfo.GetCultureInfo("ro-RO");
            for (int i = 5; i >= 0; i--)
            {
                var d = now.AddMonths(-i);
                list.Add((d.Year, d.Month, d.ToString("MMM yy", ci)));
            }
            return list;
        }

        private static bool SameMonth(DateTime d, int year, int month) => d.Year == year && d.Month == month;
    }
}
