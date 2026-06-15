namespace Elderlynk.Models
{
    public class AllergyResponseDto
    {
        public int AllergyId { get; set; }
        public int PatientId { get; set; }
        public string Denumire { get; set; } = null!;
    }
}
