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

        /// <summary>
        /// Forwards a stored message's FHIR Bundle to an external clinic's HTTP endpoint
        /// (e.g. exposed via ngrok). Returns null if the message does not exist.
        /// </summary>
        Task<SendHL7ResultDto?> SendToExternalAsync(int messageId, string targetUrl, CancellationToken cancellationToken = default);

        /// <summary>
        /// Persists a FHIR Bundle received from an external clinic as a Directie='IN'
        /// message, matching it to a local patient by CNP when possible.
        /// </summary>
        Task<HL7MessageResponseDto> ReceiveExternalAsync(string fhirXml, CancellationToken cancellationToken = default);
    }
}
