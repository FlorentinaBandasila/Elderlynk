import { useState, useEffect, useCallback } from 'react'
import { alarmAPI } from '@/services/api'
import { useRealtime } from './useRealtime'
import { RT_EVENTS } from '@/services/realtime'

/**
 * Returns the count of unresolved (active) alarms visible to the current user,
 * kept fresh via SignalR pushes. Used for sidebar/topbar badges.
 */
export function useActiveAlarmCount() {
  const [count, setCount] = useState(0)

  const refresh = useCallback(async () => {
    try {
      const res = await alarmAPI.getAll()
      const active = (res || []).filter(a => !a.isResolved).length
      setCount(active)
    } catch {
      setCount(0)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  useRealtime(RT_EVENTS.ALARM_RAISED, () => refresh())
  useRealtime(RT_EVENTS.ALARM_RESOLVED, () => refresh())

  return count
}
