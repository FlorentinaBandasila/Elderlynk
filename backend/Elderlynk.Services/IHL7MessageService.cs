using Elderlynk.Models;

namespace Elderlynk.Services
{
    public interface IHL7MessageService
    {
        Task<IEnumerable<HL7MessageResponseDto>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<HL7MessageResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<HL7MessageResponseDto> CreateAsync(CreateHL7MessageDto dto, CancellationToken cancellationToken = default);
        Task UpdateAsync(int id, UpdateHL7MessageDto dto, CancellationToken cancellationToken = default);
        Task DeleteAsync(int id, CancellationToken cancellationToken = default);
    }
}
