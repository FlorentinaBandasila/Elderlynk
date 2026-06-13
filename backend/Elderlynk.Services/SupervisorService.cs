using Elderlynk.Models;
using Microsoft.EntityFrameworkCore;

namespace Elderlynk.Services
{
    public class SupervisorService : ISupervisorService
    {
        private readonly DbContext _context;

        public SupervisorService(DbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<SupervisorResponseDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var supervisors = await _context.Set<Supervisor>()
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            return supervisors.Select(s => new SupervisorResponseDto
            {
                SupervisorId = s.SupervisorId,
                Email = s.Email,
                FirstName = s.FirstName,
                LastName = s.LastName,
                Phone = s.Phone,
                Department = s.Department,
                Active = s.Active
            });
        }

        public async Task<SupervisorResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var supervisor = await _context.Set<Supervisor>()
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.SupervisorId == id, cancellationToken);

            if (supervisor == null)
                return null;

            return new SupervisorResponseDto
            {
                SupervisorId = supervisor.SupervisorId,
                Email = supervisor.Email,
                FirstName = supervisor.FirstName,
                LastName = supervisor.LastName,
                Phone = supervisor.Phone,
                Department = supervisor.Department,
                Active = supervisor.Active
            };
        }

        public async Task<SupervisorResponseDto> CreateAsync(CreateSupervisorDto dto, CancellationToken cancellationToken = default)
        {
            var supervisor = new Supervisor
            {
                Email = dto.Email,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Phone = dto.Phone,
                Department = dto.Department,
                Active = true
            };

            _context.Set<Supervisor>().Add(supervisor);
            await _context.SaveChangesAsync(cancellationToken);

            return new SupervisorResponseDto
            {
                SupervisorId = supervisor.SupervisorId,
                Email = supervisor.Email,
                FirstName = supervisor.FirstName,
                LastName = supervisor.LastName,
                Phone = supervisor.Phone,
                Department = supervisor.Department,
                Active = supervisor.Active
            };
        }

        public async Task UpdateAsync(int id, UpdateSupervisorDto dto, CancellationToken cancellationToken = default)
        {
            var supervisor = await _context.Set<Supervisor>()
                .FirstOrDefaultAsync(s => s.SupervisorId == id, cancellationToken);

            if (supervisor == null)
                throw new KeyNotFoundException($"Supervisor with ID {id} not found.");

            if (dto.Email != null)
                supervisor.Email = dto.Email;
            if (dto.FirstName != null)
                supervisor.FirstName = dto.FirstName;
            if (dto.LastName != null)
                supervisor.LastName = dto.LastName;
            if (dto.Phone != null)
                supervisor.Phone = dto.Phone;
            if (dto.Department != null)
                supervisor.Department = dto.Department;
            if (dto.Active.HasValue)
                supervisor.Active = dto.Active;

            _context.Set<Supervisor>().Update(supervisor);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var supervisor = await _context.Set<Supervisor>()
                .FirstOrDefaultAsync(s => s.SupervisorId == id, cancellationToken);

            if (supervisor == null)
                throw new KeyNotFoundException($"Supervisor with ID {id} not found.");

            _context.Set<Supervisor>().Remove(supervisor);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
