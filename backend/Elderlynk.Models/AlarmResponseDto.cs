namespace Elderlynk.Models
{
    public class AlarmResponseDto
    {
        public int AlarmId { get; set; }
        public int? SensorId { get; set; }
        public int? PatientId { get; set; }
        public string? AlarmType { get; set; }
        public string? Message { get; set; }
        public DateTime? TriggerDate { get; set; }
        public DateTime? ResolutionDate { get; set; }
        public int? SupervisorId { get; set; }
        public string? ResolutionNotes { get; set; }
        public bool? IsResolved { get; set; }
        public string? PatientFirstName { get; set; }
        public string? PatientLastName { get; set; }
        public string? SensorName { get; set; }
        public decimal? MeasurementValue { get; set; }
    }
}
