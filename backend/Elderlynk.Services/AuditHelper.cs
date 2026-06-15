using Elderlynk.Models;
using Microsoft.EntityFrameworkCore;

namespace Elderlynk.Services
{
    /// <summary>
    /// Writes rows into Log_Audit for sensitive (mutating) operations.
    /// Call after a successful create/update/delete.
    /// </summary>
    public static class AuditHelper
    {
        public static void Add(DbContext context, int? userId, string action, string affectedTable, string? sourceIp, int? patientId = null, string? details = null)
        {
            context.Set<AuditLog>().Add(new AuditLog
            {
                UserId = userId,
                PatientId = patientId,
                Action = action,
                AffectedTable = affectedTable,
                LogDateTime = DateTime.Now,
                SourceIp = sourceIp,
                Details = details
            });
        }

        /// <summary>Formats an "old → new" change line, or null when the value is unchanged.</summary>
        public static string? Diff(string label, string? oldValue, string? newValue)
        {
            var o = oldValue?.Trim() ?? "";
            var n = newValue?.Trim() ?? "";
            if (o == n) return null;
            return $"{label}: \"{(o.Length == 0 ? "—" : o)}\" → \"{(n.Length == 0 ? "—" : n)}\"";
        }
    }
}
