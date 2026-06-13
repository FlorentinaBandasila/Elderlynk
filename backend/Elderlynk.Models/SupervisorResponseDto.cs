namespace Elderlynk.Models
{
    public class SupervisorResponseDto
    {
        public int SupervisorId { get; set; }
        public string Email { get; set; } = null!;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Phone { get; set; }
        public string? Department { get; set; }
        public bool? Active { get; set; }
    }
}
