namespace Elderlynk.Models
{
    /// <summary>Request to evaluate a sensor's readings for alarm/warning conditions.</summary>
    public class EvaluateAlarmDto
    {
        public int SensorId { get; set; }

        /// <summary>Optional start of the patient's current physical activity (Annex 3 grace window).</summary>
        public DateTimeOffset? ActivityStart { get; set; }
    }
}
