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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Entity configuration
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
        }
    }
}
