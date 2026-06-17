import { useEffect, useRef } from 'react'
import { ensureStarted, getConnection } from '@/services/realtime'

/**
 * Subscribes to a SignalR hub event for the lifetime of the component.
 *
 * @param {string}   eventName  Event to listen for (see RT_EVENTS).
 * @param {function} handler    Called with the pushed payload.
 */
export function useRealtime(eventName, handler) {
  const savedHandler = useRef(handler)
  savedHandler.current = handler

  useEffect(() => {
    let cancelled = false
    const conn = getConnection()
    const listener = (payload) => savedHandler.current?.(payload)

    conn.on(eventName, listener)
    ensureStarted().catch(() => {})

    return () => {
      cancelled = true
      conn.off(eventName, listener)
      void cancelled
    }
  }, [eventName])
}
