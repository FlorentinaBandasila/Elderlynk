using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Elderlynk.Models
{
    [Table("Pacienti")]
    public class Patient
    {
        [Key]
        [Column("ID_Pacient")]
        public int PatientId { get; set; }

        [Column("Nume")]
        public string? LastName { get; set; }

        [Column("Prenume")]
        public string? FirstName { get; set; }

        [Column("CNP")]
        public string CNP { get; set; } = null!;

        [Column("Adresa_Strada")]
        public string? Street { get; set; }

        [Column("Adresa_Oras")]
        public string? City { get; set; }

        [Column("Adresa_Judet")]
        public string? County { get; set; }

        [Column("Cod_Postal")]
        public string? PostalCode { get; set; }

        [Column("Telefon")]
        public string? Phone { get; set; }

        [Column("Email")]
        public string? Email { get; set; }

        [Column("Profesie")]
        public string? Profession { get; set; }

        [Column("Loc_Munca")]
        public string? WorkPlace { get; set; }

        [Column("ID_Ingrijitor")]
        public int? CaregiverId { get; set; }

        [Column("Parola_Hash")]
        public string? PasswordHash { get; set; }

        [Column("Data_Adaugare")]
        public DateTime? DateAdded { get; set; }

        [Column("Data_Ultima_Modificare")]
        public DateTime? LastModified { get; set; }

        [Column("Activ")]
        public bool Active { get; set; } = true;
    }
}
