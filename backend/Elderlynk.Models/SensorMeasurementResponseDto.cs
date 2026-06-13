namespace Elderlynk.Models
{
    public class SensorMeasurementResponseDto
    {
        public long MeasurementId { get; set; }
        public int? SensorId { get; set; }
        public decimal? Value { get; set; }
        public DateTimeOffset? MeasurementDateTime { get; set; }
    }
}
