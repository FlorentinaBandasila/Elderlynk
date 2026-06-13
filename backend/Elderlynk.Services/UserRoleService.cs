using Elderlynk.Models;
using Microsoft.EntityFrameworkCore;

namespace Elderlynk.Services
{
    public class UserRoleService : IUserRoleService
    {
        private readonly DbContext _context;

        public UserRoleService(DbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<UserRoleResponseDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var userRoles = await _context.Set<UserRole>()
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            return userRoles.Select(ur => new UserRoleResponseDto
            {
                UserId = ur.UserId,
                RoleId = ur.RoleId
            });
        }

        public async Task<UserRoleResponseDto?> GetByIdAsync(int userId, int roleId, CancellationToken cancellationToken = default)
        {
            var userRole = await _context.Set<UserRole>()
                .AsNoTracking()
                .FirstOrDefaultAsync(ur => ur.UserId == userId && ur.RoleId == roleId, cancellationToken);

            if (userRole == null)
                return null;

            return new UserRoleResponseDto
            {
                UserId = userRole.UserId,
                RoleId = userRole.RoleId
            };
        }

        public async Task<UserRoleResponseDto> CreateAsync(CreateUserRoleDto dto, CancellationToken cancellationToken = default)
        {
            var userRole = new UserRole
            {
                UserId = dto.UserId,
                RoleId = dto.RoleId
            };

            _context.Set<UserRole>().Add(userRole);
            await _context.SaveChangesAsync(cancellationToken);

            return new UserRoleResponseDto
            {
                UserId = userRole.UserId,
                RoleId = userRole.RoleId
            };
        }

        public async Task UpdateAsync(int userId, int roleId, UpdateUserRoleDto dto, CancellationToken cancellationToken = default)
        {
            var userRole = await _context.Set<UserRole>()
                .FirstOrDefaultAsync(ur => ur.UserId == userId && ur.RoleId == roleId, cancellationToken);

            if (userRole == null)
                throw new KeyNotFoundException($"User role mapping for user {userId} and role {roleId} not found.");

            if (dto.UserId.HasValue)
                userRole.UserId = dto.UserId.Value;
            if (dto.RoleId.HasValue)
                userRole.RoleId = dto.RoleId.Value;

            _context.Set<UserRole>().Update(userRole);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteAsync(int userId, int roleId, CancellationToken cancellationToken = default)
        {
            var userRole = await _context.Set<UserRole>()
                .FirstOrDefaultAsync(ur => ur.UserId == userId && ur.RoleId == roleId, cancellationToken);

            if (userRole == null)
                throw new KeyNotFoundException($"User role mapping for user {userId} and role {roleId} not found.");

            _context.Set<UserRole>().Remove(userRole);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
