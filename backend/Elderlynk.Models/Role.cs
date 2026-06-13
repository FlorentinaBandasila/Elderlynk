using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Elderlynk.Models
{
    [Table("Roluri")]
    public class Role
    {
        [Key]
        [Column("ID_Rol")]
        public int RoleId { get; set; }

        [Column("Nume_Rol")]
        [MaxLength(50)]
        [Required]
        public string RoleName { get; set; } = null!;
    }
}
