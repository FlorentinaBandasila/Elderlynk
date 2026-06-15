import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

/**
 * Guards routes. Redirects unauthenticated users to /login and users without an
 * allowed role to /unauthorized. Remember: the backend is the real gatekeeper.
 */
export default function ProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, hasRole } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.some((r) => hasRole(r))) {
    return <Navigate to="/unauthorized" replace />
  }

  return children ?? <Outlet />
}
