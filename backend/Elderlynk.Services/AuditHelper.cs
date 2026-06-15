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
        public static void Add(DbContext context, int? userId, string action, string affectedTable, string? sourceIp)
        {
            context.Set<AuditLog>().Add(new AuditLog
            {
                UserId = userId,
                Action = action,
                AffectedTable = affectedTable,
                LogDateTime = DateTime.Now,
                SourceIp = sourceIp
            });
        }
    }
}
