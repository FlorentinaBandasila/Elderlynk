namespace Elderlynk.Models
{
    public class CreateSensorConfigDto
    {
        public int? DeviceId { get; set; }
        public int? OrderNumber { get; set; }
        public string? SensorType { get; set; }
        public string? MeasurementUnit { get; set; }
        public int? SamplingPeriodSeconds { get; set; }
        public decimal? ScaleFactor { get; set; }
        public decimal? LowerAlarmThreshold { get; set; }
        public decimal? LowerWarningThreshold { get; set; }
        public decimal? UpperWarningThreshold { get; set; }
        public decimal? UpperAlarmThreshold { get; set; }
        public bool? Active { get; set; }
    }
}
