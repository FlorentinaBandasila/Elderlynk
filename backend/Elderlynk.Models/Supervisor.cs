using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Elderlynk.Models
{
    [Table("Supraveghetori")]
    public class Supervisor
    {
        [Key]
        [Column("ID_Supraveghetor")]
        public int SupervisorId { get; set; }

        [Column("Email")]
        [Required]
        [MaxLength(100)]
        public string Email { get; set; } = null!;

        [Column("Nume")]
        [MaxLength(100)]
        public string? FirstName { get; set; }

        [Column("Prenume")]
        [MaxLength(100)]
        public string? LastName { get; set; }

        [Column("Telefon")]
        [MaxLength(20)]
        public string? Phone { get; set; }

        [Column("Departament")]
        [MaxLength(100)]
        public string? Department { get; set; }

        [Column("Activ")]
        public bool? Active { get; set; }
    }
}
