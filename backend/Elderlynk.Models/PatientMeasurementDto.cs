namespace Elderlynk.Models
{
    /// <summary>
    /// A single sensor reading for a patient, enriched with sensor metadata so the
    /// frontend can plot evolution graphs without extra lookups.
    /// </summary>
    public class PatientMeasurementDto
    {
        public long MeasurementId { get; set; }
        public int SensorId { get; set; }
        public string? SensorType { get; set; }
        public string? MeasurementUnit { get; set; }
        public decimal? Value { get; set; }
        public DateTimeOffset? MeasurementDateTime { get; set; }

        // Per-sensor thresholds (used to draw warning/alarm reference lines).
        public decimal? LowerAlarmThreshold { get; set; }
        public decimal? LowerWarningThreshold { get; set; }
        public decimal? UpperWarningThreshold { get; set; }
        public decimal? UpperAlarmThreshold { get; set; }
    }
}
