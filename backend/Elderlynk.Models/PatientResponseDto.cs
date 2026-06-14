namespace Elderlynk.Models
{
    public class PatientResponseDto
    {
        public int PatientId { get; set; }
        public string? LastName { get; set; }
        public string? FirstName { get; set; }
        public string CNP { get; set; } = null!;
        public string? Street { get; set; }
        public string? City { get; set; }
        public string? County { get; set; }
        public string? PostalCode { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Profession { get; set; }
        public string? WorkPlace { get; set; }
        public DateTime? DateAdded { get; set; }
        public DateTime? LastModified { get; set; }
        public bool Active { get; set; }
    }
}
