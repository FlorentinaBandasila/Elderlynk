using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Elderlynk.Models
{
    [Table("Utilizatori")]
    public class User
    {
        [Key]
        [Column("ID_Utilizator")]
        public int UserId { get; set; }

        [Column("ID_Rol")]
        public int? RoleId { get; set; }

        [Column("Email")]
        [Required]
        [MaxLength(255)]
        public string Email { get; set; } = null!;

        [Column("Parola_Hash")]
        [Required]
        [MaxLength(255)]
        public string PasswordHash { get; set; } = null!;

        [Column("Nume")]
        [MaxLength(100)]
        public string? FirstName { get; set; }

        [Column("Prenume")]
        [MaxLength(100)]
        public string? LastName { get; set; }

        [Column("Telefon")]
        [MaxLength(20)]
        public string? Phone { get; set; }

        [Column("Data_Creare")]
        public DateTimeOffset? CreatedDate { get; set; }

        [Column("Activ")]
        public bool? Active { get; set; }
    }
}
