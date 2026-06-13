using Elderlynk.Models;
using Microsoft.EntityFrameworkCore;

namespace Elderlynk.Services
{
    public class DoctorService : IDoctorService
    {
        private readonly DbContext _context;

        public DoctorService(DbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<DoctorResponseDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var doctors = await _context.Set<Doctor>()
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            return doctors.Select(d => new DoctorResponseDto
            {
                DoctorId = d.DoctorId,
                Email = d.Email,
                FirstName = d.FirstName,
                LastName = d.LastName,
                Phone = d.Phone,
                Specialty = d.Specialty,
                Active = d.Active
            });
        }

        public async Task<DoctorResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var doctor = await _context.Set<Doctor>()
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.DoctorId == id, cancellationToken);

            if (doctor == null)
                return null;

            return new DoctorResponseDto
            {
                DoctorId = doctor.DoctorId,
                Email = doctor.Email,
                FirstName = doctor.FirstName,
                LastName = doctor.LastName,
                Phone = doctor.Phone,
                Specialty = doctor.Specialty,
                Active = doctor.Active
            };
        }

        public async Task<DoctorResponseDto> CreateAsync(CreateDoctorDto dto, CancellationToken cancellationToken = default)
        {
            var doctor = new Doctor
            {
                Email = dto.Email,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Phone = dto.Phone,
                Specialty = dto.Specialty,
                Active = true
            };

            _context.Set<Doctor>().Add(doctor);
            await _context.SaveChangesAsync(cancellationToken);

            return new DoctorResponseDto
            {
                DoctorId = doctor.DoctorId,
                Email = doctor.Email,
                FirstName = doctor.FirstName,
                LastName = doctor.LastName,
                Phone = doctor.Phone,
                Specialty = doctor.Specialty,
                Active = doctor.Active
            };
        }

        public async Task UpdateAsync(int id, UpdateDoctorDto dto, CancellationToken cancellationToken = default)
        {
            var doctor = await _context.Set<Doctor>()
                .FirstOrDefaultAsync(d => d.DoctorId == id, cancellationToken);

            if (doctor == null)
                throw new KeyNotFoundException($"Doctor with ID {id} not found.");

            if (dto.Email != null)
                doctor.Email = dto.Email;
            if (dto.FirstName != null)
                doctor.FirstName = dto.FirstName;
            if (dto.LastName != null)
                doctor.LastName = dto.LastName;
            if (dto.Phone != null)
                doctor.Phone = dto.Phone;
            if (dto.Specialty != null)
                doctor.Specialty = dto.Specialty;
            if (dto.Active.HasValue)
                doctor.Active = dto.Active;

            _context.Set<Doctor>().Update(doctor);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var doctor = await _context.Set<Doctor>()
                .FirstOrDefaultAsync(d => d.DoctorId == id, cancellationToken);

            if (doctor == null)
                throw new KeyNotFoundException($"Doctor with ID {id} not found.");

            _context.Set<Doctor>().Remove(doctor);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
