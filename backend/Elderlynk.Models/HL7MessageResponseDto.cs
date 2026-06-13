namespace Elderlynk.Models
{
    public class HL7MessageResponseDto
    {
        public int MessageId { get; set; }
        public int? PatientId { get; set; }
        public string? Direction { get; set; }
        public string? Content { get; set; }
        public DateTime? TransferDate { get; set; }
    }
}
