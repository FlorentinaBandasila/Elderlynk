namespace Elderlynk.Models
{
    public class RecommendationResponseDto
    {
        public int RecommendationId { get; set; }
        public int? PatientId { get; set; }
        public int? DoctorId { get; set; }
        public string? ActivityType { get; set; }
        public int? DailyDurationMinutes { get; set; }
        public string? Description { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? StopDate { get; set; }
    }
}
