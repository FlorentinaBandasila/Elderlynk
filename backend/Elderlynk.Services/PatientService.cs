using Elderlynk.Models;
using Microsoft.EntityFrameworkCore;

namespace Elderlynk.Services
{
    public class PatientService : IPatientService
    {
        private readonly DbContext _context;

        public PatientService(DbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PatientResponseDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var patients = await _context.Set<Patient>()
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            return patients.Select(p => new PatientResponseDto
            {
                PatientId = p.PatientId,
                LastName = p.LastName,
                FirstName = p.FirstName,
                CNP = p.CNP,
                Street = p.Street,
                City = p.City,
                County = p.County,
                PostalCode = p.PostalCode,
                Phone = p.Phone,
                Email = p.Email,
                Profession = p.Profession,
                WorkPlace = p.WorkPlace,
                DateAdded = p.DateAdded,
                LastModified = p.LastModified,
                Active = p.Active
            });
        }

        public async Task<PatientResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var patient = await _context.Set<Patient>()
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.PatientId == id, cancellationToken);

            if (patient == null)
                return null;

            return new PatientResponseDto
            {
                PatientId = patient.PatientId,
                LastName = patient.LastName,
                FirstName = patient.FirstName,
                CNP = patient.CNP,
                Street = patient.Street,
                City = patient.City,
                County = patient.County,
                PostalCode = patient.PostalCode,
                Phone = patient.Phone,
                Email = patient.Email,
                Profession = patient.Profession,
                WorkPlace = patient.WorkPlace,
                DateAdded = patient.DateAdded,
                LastModified = patient.LastModified,
                Active = patient.Active
            };
        }
    }
}
