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
                CNP = p.CNP,
                Age = p.Age,
                Street = p.Street,
                City = p.City,
                County = p.County,
                Profession = p.Profession,
                WorkPlace = p.WorkPlace,
                FamilyDoctorId = p.FamilyDoctorId
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
                CNP = patient.CNP,
                Age = patient.Age,
                Street = patient.Street,
                City = patient.City,
                County = patient.County,
                Profession = patient.Profession,
                WorkPlace = patient.WorkPlace,
                FamilyDoctorId = patient.FamilyDoctorId
            };
        }
    }
}
