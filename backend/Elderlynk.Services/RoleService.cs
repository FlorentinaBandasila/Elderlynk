using Elderlynk.Models;
using Microsoft.EntityFrameworkCore;

namespace Elderlynk.Services
{
    public class RoleService : IRoleService
    {
        private readonly DbContext _context;

        public RoleService(DbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<RoleResponseDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var roles = await _context.Set<Role>()
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            return roles.Select(r => new RoleResponseDto
            {
                RoleId = r.RoleId,
                RoleName = r.RoleName
            });
        }

        public async Task<RoleResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var role = await _context.Set<Role>()
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.RoleId == id, cancellationToken);

            if (role == null)
                return null;

            return new RoleResponseDto
            {
                RoleId = role.RoleId,
                RoleName = role.RoleName
            };
        }

        public async Task<RoleResponseDto> CreateAsync(CreateRoleDto dto, CancellationToken cancellationToken = default)
        {
            var role = new Role
            {
                RoleName = dto.RoleName
            };

            _context.Set<Role>().Add(role);
            await _context.SaveChangesAsync(cancellationToken);

            return new RoleResponseDto
            {
                RoleId = role.RoleId,
                RoleName = role.RoleName
            };
        }

        public async Task UpdateAsync(int id, UpdateRoleDto dto, CancellationToken cancellationToken = default)
        {
            var role = await _context.Set<Role>()
                .FirstOrDefaultAsync(r => r.RoleId == id, cancellationToken);

            if (role == null)
                throw new KeyNotFoundException($"Role with ID {id} not found.");

            if (dto.RoleName != null)
                role.RoleName = dto.RoleName;

            _context.Set<Role>().Update(role);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var role = await _context.Set<Role>()
                .FirstOrDefaultAsync(r => r.RoleId == id, cancellationToken);

            if (role == null)
                throw new KeyNotFoundException($"Role with ID {id} not found.");

            _context.Set<Role>().Remove(role);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
