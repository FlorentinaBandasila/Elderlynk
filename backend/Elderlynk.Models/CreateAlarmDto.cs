namespace Elderlynk.Models
{
    public class CreateAlarmDto
    {
        public int? SensorId { get; set; }
        public int? PatientId { get; set; }
        public string? AlarmType { get; set; }
        public string? Message { get; set; }
    }
}
