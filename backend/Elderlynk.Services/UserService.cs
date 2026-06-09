using Elderlynk.Models;
using Microsoft.EntityFrameworkCore;

namespace Elderlynk.Services
{
    public class UserService : IUserService
    {
        private readonly DbContext _context;

        public UserService(DbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<UserResponseDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var users = await _context.Set<User>()
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            return users.Select(u => new UserResponseDto
            {
                UserId = u.UserId,
                Email = u.Email,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Phone = u.Phone,
                CreatedDate = u.CreatedDate,
                Active = u.Active
            });
        }

        public async Task<UserResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var user = await _context.Set<User>()
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserId == id, cancellationToken);

            if (user == null)
                return null;

            return new UserResponseDto
            {
                UserId = user.UserId,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Phone = user.Phone,
                CreatedDate = user.CreatedDate,
                Active = user.Active
            };
        }

        public async Task<UserResponseDto> CreateAsync(CreateUserDto dto, CancellationToken cancellationToken = default)
        {
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var user = new User
            {
                Email = dto.Email,
                PasswordHash = passwordHash,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Phone = dto.Phone,
                CreatedDate = DateTimeOffset.UtcNow,
                Active = true
            };

            _context.Set<User>().Add(user);
            await _context.SaveChangesAsync(cancellationToken);

            return new UserResponseDto
            {
                UserId = user.UserId,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Phone = user.Phone,
                CreatedDate = user.CreatedDate,
                Active = user.Active
            };
        }

        public async Task UpdateAsync(int id, UpdateUserDto dto, CancellationToken cancellationToken = default)
        {
            var user = await _context.Set<User>()
                .FirstOrDefaultAsync(u => u.UserId == id, cancellationToken);

            if (user == null)
                throw new KeyNotFoundException($"User with ID {id} not found.");

            if (dto.FirstName != null)
                user.FirstName = dto.FirstName;
            if (dto.LastName != null)
                user.LastName = dto.LastName;
            if (dto.Phone != null)
                user.Phone = dto.Phone;
            if (dto.Active.HasValue)
                user.Active = dto.Active;

            _context.Set<User>().Update(user);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var user = await _context.Set<User>()
                .FirstOrDefaultAsync(u => u.UserId == id, cancellationToken);

            if (user == null)
                throw new KeyNotFoundException($"User with ID {id} not found.");

            _context.Set<User>().Remove(user);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
