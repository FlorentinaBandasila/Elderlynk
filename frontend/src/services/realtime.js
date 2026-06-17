import { HubConnectionBuilder, HttpTransportType, LogLevel } from '@microsoft/signalr'
import { getToken } from './api'

// Hub lives next to the API (…:7135/hubs/notifications). Derived from the API base.
const HUB_URL = 'https://localhost:7135/hubs/notifications'

// Event names mirror NotificationsHub on the backend.
export const RT_EVENTS = {
  ALARM_RAISED: 'AlarmRaised',
  ALARM_RESOLVED: 'AlarmResolved',
  NOTIFICATION: 'Notification',
}

let connection = null

/** Lazily builds (and starts) the shared hub connection. */
export function getConnection() {
  if (connection) return connection

  connection = new HubConnectionBuilder()
    .withUrl(HUB_URL, {
      accessTokenFactory: () => getToken() || '',
      // Negotiation can fail with self-signed dev certs; WebSockets is fine here.
      transport: HttpTransportType.WebSockets,
      skipNegotiation: true,
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build()

  return connection
}

/** Ensures the connection is started. Safe to call repeatedly. */
export async function ensureStarted() {
  const conn = getConnection()
  if (conn.state === 'Disconnected') {
    try {
      await conn.start()
    } catch (err) {
      console.warn('SignalR connection failed:', err)
    }
  }
  return conn
}
