namespace Elderlynk.Models
{
    public class UpdateAuditLogDto
    {
        public int? UserId { get; set; }
        public string? Action { get; set; }
        public string? AffectedTable { get; set; }
        public string? SourceIp { get; set; }
    }
}
