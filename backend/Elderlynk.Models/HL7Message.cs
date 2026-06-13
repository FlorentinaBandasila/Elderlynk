using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Elderlynk.Models
{
    [Table("Mesaje_HL7_Audit")]
    public class HL7Message
    {
        [Key]
        [Column("ID_Mesaj")]
        public int MessageId { get; set; }

        [Column("ID_Pacient")]
        public int? PatientId { get; set; }

        [Column("Directie")]
        [MaxLength(10)]
        public string? Direction { get; set; }

        [Column("Continut_XML_HL7")]
        public string? Content { get; set; }

        [Column("Data_Transfer")]
        public DateTime? TransferDate { get; set; }
    }
}
