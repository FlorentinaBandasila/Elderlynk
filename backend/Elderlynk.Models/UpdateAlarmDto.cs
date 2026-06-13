namespace Elderlynk.Models
{
    public class UpdateAlarmDto
    {
        public int? SensorId { get; set; }
        public int? PatientId { get; set; }
        public string? AlarmType { get; set; }
        public string? Message { get; set; }
        public DateTime? ResolutionDate { get; set; }
        public int? SupervisorId { get; set; }
        public string? ResolutionNotes { get; set; }
        public bool? IsResolved { get; set; }
    }
}
