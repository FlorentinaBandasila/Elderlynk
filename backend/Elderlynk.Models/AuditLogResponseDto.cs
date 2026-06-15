namespace Elderlynk.Models
{
    public class AuditLogResponseDto
    {
        public int LogId { get; set; }
        public int? UserId { get; set; }
        public int? PatientId { get; set; }
        public string? UserName { get; set; }
        public string? Action { get; set; }
        public string? AffectedTable { get; set; }
        public DateTime? LogDateTime { get; set; }
        public string? SourceIp { get; set; }
        public string? Details { get; set; }
    }
}
