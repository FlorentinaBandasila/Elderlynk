namespace Elderlynk.Models
{
    public class CreateMedicalRecommendationDto
    {
        public int PatientId { get; set; }
        public string? TipRecomandare { get; set; }
        public string Descriere { get; set; } = null!;
    }
}
