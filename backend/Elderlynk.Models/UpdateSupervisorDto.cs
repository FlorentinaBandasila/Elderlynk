namespace Elderlynk.Models
{
    public class UpdateSupervisorDto
    {
        public string? Email { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Phone { get; set; }
        public string? Department { get; set; }
        public bool? Active { get; set; }
    }
}
