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

        /// <summary>All HL7 messages for a patient, newest first.</summary>
        Task<IEnumerable<HL7MessageResponseDto>> GetByPatientAsync(int patientId, CancellationToken cancellationToken = default);

        /// <summary>
        /// Generates an outbound HL7 referral (REF^I12) to a specialist's system and
        /// persists it as a Directie='OUT' message.
        /// </summary>
        Task<HL7MessageResponseDto> GenerateReferralAsync(GenerateReferralDto dto, CancellationToken cancellationToken = default);

        /// <summary>
        /// Simulates the specialist system returning a medical letter (REF^I13) for a
        /// previously sent referral, persisting it as a Directie='IN' message.
        /// </summary>
        Task<HL7MessageResponseDto?> GenerateReplyAsync(int referralMessageId, CancellationToken cancellationToken = default);
    }
}
