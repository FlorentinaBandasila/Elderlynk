namespace Elderlynk.Models
{
    public class MedicalRecommendationResponseDto
    {
        public int RecommendationId { get; set; }
        public int PatientId { get; set; }
        public int ConsultationId { get; set; }
        public DateTime DataRecomandarii { get; set; }
        public string? TipRecomandare { get; set; }
        public string? Descriere { get; set; }
    }
}
