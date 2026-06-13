using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Elderlynk.Models
{
    [Table("Utilizatori_Roluri")]
    public class UserRole
    {
        [Column("ID_Utilizator")]
        [Required]
        public int UserId { get; set; }

        [Column("ID_Rol")]
        [Required]
        public int RoleId { get; set; }
    }
}
