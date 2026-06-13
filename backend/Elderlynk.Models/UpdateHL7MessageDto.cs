namespace Elderlynk.Models
{
    public class UpdateHL7MessageDto
    {
        public int? PatientId { get; set; }
        public string? Direction { get; set; }
        public string? Content { get; set; }
    }
}
