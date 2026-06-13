using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Elderlynk.Models
{
    [Table("Log_Audit")]
    public class AuditLog
    {
        [Key]
        [Column("ID_Log")]
        public int LogId { get; set; }

        [Column("ID_Utilizator")]
        public int? UserId { get; set; }

        [Column("Actiune")]
        [MaxLength(100)]
        public string? Action { get; set; }

        [Column("Tabela_Afectata")]
        [MaxLength(50)]
        public string? AffectedTable { get; set; }

        [Column("Data_Ora")]
        public DateTime? LogDateTime { get; set; }

        [Column("IP_Sursa")]
        [MaxLength(45)]
        public string? SourceIp { get; set; }
    }
}
