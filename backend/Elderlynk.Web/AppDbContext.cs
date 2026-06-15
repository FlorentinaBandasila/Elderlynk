using Elderlynk.Models;
using Microsoft.EntityFrameworkCore;

namespace Elderlynk.Web
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Patient> Patients { get; set; }
        public DbSet<Alarm> Alarms { get; set; }
        public DbSet<Consultation> Consultations { get; set; }
        public DbSet<Device> Devices { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<SensorMeasurement> SensorMeasurements { get; set; }
        public DbSet<HL7Message> HL7Messages { get; set; }
        public DbSet<Recommendation> Recommendations { get; set; }
        public DbSet<MedicalRecommendation> MedicalRecommendations { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<SensorConfig> SensorConfigs { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }
        // public DbSet<Doctor> Doctors { get; set; }
        // public DbSet<Supervisor> Supervisors { get; set; }
        // Note: Doctor and Supervisor tables not in existing schema

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.UserId);
                entity.Property(e => e.UserId)
                    .HasColumnName("ID_Utilizator");
                entity.Property(e => e.Email)
                    .IsRequired()
                    .HasMaxLength(255);
                entity.Property(e => e.PasswordHash)
                    .IsRequired()
                    .HasMaxLength(255)
                    .HasColumnName("Parola_Hash");
                entity.Property(e => e.FirstName)
                    .HasMaxLength(100)
                    .HasColumnName("Nume");
                entity.Property(e => e.LastName)
                    .HasMaxLength(100)
                    .HasColumnName("Prenume");
                entity.Property(e => e.Phone)
                    .HasMaxLength(20)
                    .HasColumnName("Telefon");
                entity.Property(e => e.CreatedDate)
                    .HasColumnName("Data_Creare");
                entity.Property(e => e.Active)
                    .HasColumnName("Activ");
            });

            modelBuilder.Entity<Patient>(entity =>
            {
                entity.HasKey(e => e.PatientId);
                entity.Property(e => e.PatientId)
                    .HasColumnName("ID_Pacient");
                entity.Property(e => e.CNP)
                    .IsRequired()
                    .HasMaxLength(13)
                    .HasColumnName("CNP");
                entity.Property(e => e.Street)
                    .HasMaxLength(100)
                    .HasColumnName("Adresa_Strada");
                entity.Property(e => e.City)
                    .HasMaxLength(50)
                    .HasColumnName("Adresa_Oras");
                entity.Property(e => e.County)
                    .HasMaxLength(50)
                    .HasColumnName("Adresa_Judet");
                entity.Property(e => e.Profession)
                    .HasMaxLength(50)
                    .HasColumnName("Profesie");
                entity.Property(e => e.WorkPlace)
                    .HasMaxLength(50)
                    .HasColumnName("Loc_Munca");
                entity.Property(e => e.FirstName)
                    .HasMaxLength(100)
                    .HasColumnName("Prenume");
                entity.Property(e => e.LastName)
                    .HasMaxLength(100)
                    .HasColumnName("Nume");
            });

            modelBuilder.Entity<UserRole>(entity =>
            {
                entity.HasKey(e => new { e.UserId, e.RoleId });
            });
        }
    }
}
