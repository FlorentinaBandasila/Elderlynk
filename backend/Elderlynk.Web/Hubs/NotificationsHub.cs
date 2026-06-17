using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Elderlynk.Web.Hubs
{
    /// <summary>
    /// Real-time channel for alarms and notifications. Authenticated clients connect
    /// (passing the JWT via the <c>access_token</c> query string) and receive pushes:
    ///   - "AlarmRaised"   : a new alarm/warning was created.
    ///   - "AlarmResolved" : an alarm was resolved/updated.
    ///   - "Notification"  : a generic notification payload.
    /// The Web layer pushes through <see cref="IHubContext{NotificationsHub}"/>.
    /// </summary>
    [Authorize]
    public class NotificationsHub : Hub
    {
        // Client-callable event names kept in one place so controllers stay in sync.
        public const string AlarmRaised = "AlarmRaised";
        public const string AlarmResolved = "AlarmResolved";
        public const string Notification = "Notification";
    }
}
