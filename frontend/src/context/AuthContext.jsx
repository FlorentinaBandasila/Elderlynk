import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getToken, setToken, clearToken, USER_KEY, authAPI } from '@/services/api'

export const ROLES = {
  ADMIN: 1,
  MEDIC: 2,
  SUPRAVEGHETOR: 3,
  PACIENT: 4,
  INGRIJITOR: 5,
}

export const ROLE_LABELS = {
  1: 'Administrator',
  2: 'Medic',
  3: 'Supraveghetor',
  4: 'Pacient',
  5: 'Îngrijitor',
}

const AuthContext = createContext(null)

// Auto-logout after this much user inactivity (no mouse/keyboard/touch).
export const IDLE_TIMEOUT_MS = 10 * 60 * 1000 // 10 minutes
// sessionStorage flag so the login screen can show "Sesiunea a expirat".
export const SESSION_EXPIRED_KEY = 'cl_session_expired'

/** Decodes a JWT payload (no verification — only used for the exp check). */
function decodeJwt(token) {
  try {
    const payload = token.split('.')[1]
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json)
  } catch {
    return null
  }
}

function isExpired(token) {
  const claims = decodeJwt(token)
  if (!claims?.exp) return false
  return claims.exp * 1000 <= Date.now()
}

function loadStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = getToken()
    if (!token || isExpired(token)) {
      clearToken()
      return null
    }
    return loadStoredUser()
  })

  // Auto-logout when the token expires while the app is open.
  useEffect(() => {
    const token = getToken()
    if (!token) return
    const claims = decodeJwt(token)
    if (!claims?.exp) return
    const ms = claims.exp * 1000 - Date.now()
    if (ms <= 0) {
      logout({ expired: true })
      return
    }
    const timer = setTimeout(() => logout({ expired: true }), ms)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const login = useCallback(async (email, parola) => {
    const res = await authAPI.login(email, parola)
    const profile = {
      userId: res.userId,
      email: res.email,
      nume: res.nume,
      role: Number(res.role),
      roles: Array.isArray(res.roles) ? res.roles.map(Number) : [Number(res.role)],
      userType: res.userType,
    }
    setToken(res.token)
    localStorage.setItem(USER_KEY, JSON.stringify(profile))
    setUser(profile)
    return profile
  }, [])

  const logout = useCallback((opts) => {
    // Record the logout server-side (Criteriul 26) while the token is still valid.
    // Fire-and-forget so the UI logs out instantly; skip when the token is already
    // expired, since the call would 401 and force a redirect.
    const token = getToken()
    if (token && !isExpired(token)) {
      authAPI.logout().catch(() => {})
    }
    // Mark the session as expired (vs. a manual "Deconectare") so Login can explain why.
    if (opts?.expired) sessionStorage.setItem(SESSION_EXPIRED_KEY, '1')
    clearToken()
    setUser(null)
  }, [])

  // Auto-logout after IDLE_TIMEOUT_MS of inactivity. Any user interaction resets the timer.
  useEffect(() => {
    if (!user) return

    let timer
    const reset = () => {
      clearTimeout(timer)
      timer = setTimeout(() => logout({ expired: true }), IDLE_TIMEOUT_MS)
    }
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click']
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }))
    reset() // start counting from mount

    return () => {
      clearTimeout(timer)
      events.forEach((e) => window.removeEventListener(e, reset))
    }
  }, [user, logout])

  const hasRole = useCallback(
    (roleId) => !!user && (user.roles?.includes(roleId) || user.role === roleId),
    [user],
  )

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    hasRole,
    role: user?.role ?? null,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
