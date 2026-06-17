namespace Elderlynk.Models
{
    /// <summary>Request to forward a stored HL7/FHIR message to an external clinic's API.</summary>
    public class SendHL7MessageDto
    {
        /// <summary>
        /// Full URL of the receiving clinic's endpoint, e.g.
        /// "https://abc123.ngrok-free.app/api/hl7messages/receive".
        /// </summary>
        public string? TargetUrl { get; set; }
    }

    /// <summary>Outcome of forwarding a message to an external clinic.</summary>
    public class SendHL7ResultDto
    {
        public bool Success { get; set; }
        public int StatusCode { get; set; }
        public string? ResponseBody { get; set; }
    }
}
