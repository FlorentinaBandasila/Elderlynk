const API_BASE = 'https://localhost:7135/api'

// ============ TOKEN STORAGE ============
export const TOKEN_KEY = 'cl_token'
export const USER_KEY = 'cl_user'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

const handleResponse = async (res) => {
  const text = await res.text()
  if (!res.ok) {
    throw new Error(`API Error: ${res.status} - ${text}`)
  }
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

/**
 * Central fetch wrapper.
 * - Attaches `Authorization: Bearer <token>` to every request.
 * - On 401 clears the token and redirects to /login.
 * - On 403 dispatches a `cl:forbidden` event (so the UI can toast) and throws.
 */
const request = async (path, { method = 'GET', body, auth = true } = {}) => {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const token = getToken()
  if (auth && token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  // Only treat 401 as an expired session for authenticated calls. For the login
  // request itself (auth: false) a 401 means bad credentials – let it fall through.
  if (res.status === 401 && auth) {
    clearToken()
    if (window.location.pathname !== '/login') {
      window.location.assign('/login')
    }
    throw new Error('Sesiune expirată. Autentificați-vă din nou.')
  }

  if (res.status === 403) {
    window.dispatchEvent(new CustomEvent('cl:forbidden', { detail: { path } }))
    throw new Error('Acces interzis')
  }

  return handleResponse(res)
}

// ============ AUTH ============
export const authAPI = {
  login: (email, parola) =>
    request('/auth/login', { method: 'POST', body: { email, parola }, auth: false }),

  register: (data) =>
    request('/auth/register', { method: 'POST', body: data }),

  registerPacient: (data) =>
    request('/auth/register-pacient', { method: 'POST', body: data }),

  me: () => request('/auth/me'),
}

// ============ PATIENTS ============
export const patientAPI = {
  getAll: () => request('/Patients'),
  getById: (id) => request(`/Patients/${id}`),
  create: (data) => request('/Patients', { method: 'POST', body: data }),
  update: (id, data) => request(`/Patients/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/Patients/${id}`, { method: 'DELETE' }),
  getAllergies: (id) => request(`/Patients/${id}/allergies`),
  getHistory: (id) => request(`/Patients/${id}/history`),
  getMedications: (id) => request(`/Patients/${id}/medications`),
}

// ============ ALARMS ============
export const alarmAPI = {
  getAll: () => request('/alarms'),
  getById: (id) => request(`/alarms/${id}`),
  create: (data) => request('/alarms', { method: 'POST', body: data }),
  update: (id, data) => request(`/alarms/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/alarms/${id}`, { method: 'DELETE' }),
}

// ============ CONSULTATIONS ============
export const consultationAPI = {
  getAll: () => request('/consultations'),
  getById: (id) => request(`/consultations/${id}`),
  create: (data) => request('/consultations', { method: 'POST', body: data }),
  update: (id, data) => request(`/consultations/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/consultations/${id}`, { method: 'DELETE' }),
  getRecommendations: (id) => request(`/consultations/${id}/recommendations`),
  getMedications: (id) => request(`/consultations/${id}/medications`),
}

// ============ DEVICES ============
export const deviceAPI = {
  getAll: () => request('/devices'),
  getById: (id) => request(`/devices/${id}`),
  create: (data) => request('/devices', { method: 'POST', body: data }),
  update: (id, data) => request(`/devices/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/devices/${id}`, { method: 'DELETE' }),
}

// ============ SENSOR MEASUREMENTS ============
export const sensorMeasurementAPI = {
  getAll: () => request('/sensormeasurements'),
  getById: (id) => request(`/sensormeasurements/${id}`),
  create: (data) => request('/sensormeasurements', { method: 'POST', body: data }),
  update: (id, data) => request(`/sensormeasurements/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/sensormeasurements/${id}`, { method: 'DELETE' }),
}

// ============ SENSOR CONFIG ============
export const sensorConfigAPI = {
  getAll: () => request('/sensorconfigs'),
  getById: (id) => request(`/sensorconfigs/${id}`),
  create: (data) => request('/sensorconfigs', { method: 'POST', body: data }),
  update: (id, data) => request(`/sensorconfigs/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/sensorconfigs/${id}`, { method: 'DELETE' }),
}

// ============ RECOMMENDATIONS ============
export const recommendationAPI = {
  getAll: () => request('/recommendations'),
  getById: (id) => request(`/recommendations/${id}`),
  create: (data) => request('/recommendations', { method: 'POST', body: data }),
  update: (id, data) => request(`/recommendations/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/recommendations/${id}`, { method: 'DELETE' }),
}

// ============ RECOMANDARI MEDICALE ============
export const medicalRecommendationAPI = {
  getAll: () => request('/medicalrecommendations'),
  getByPatientId: (patientId) => request(`/medicalrecommendations/patient/${patientId}`),
}

// ============ ROLES ============
export const roleAPI = {
  getAll: () => request('/roles'),
  getById: (id) => request(`/roles/${id}`),
  create: (data) => request('/roles', { method: 'POST', body: data }),
  update: (id, data) => request(`/roles/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/roles/${id}`, { method: 'DELETE' }),
}

// ============ USER ROLES ============
export const userRoleAPI = {
  getAll: () => request('/userroles'),
  getById: (userId, roleId) => request(`/userroles/${userId}/${roleId}`),
  create: (data) => request('/userroles', { method: 'POST', body: data }),
  update: (userId, roleId, data) => request(`/userroles/${userId}/${roleId}`, { method: 'PUT', body: data }),
  delete: (userId, roleId) => request(`/userroles/${userId}/${roleId}`, { method: 'DELETE' }),
}

// ============ AUDIT LOGS ============
export const auditLogAPI = {
  getAll: () => request('/auditlogs'),
  getById: (id) => request(`/auditlogs/${id}`),
  create: (data) => request('/auditlogs', { method: 'POST', body: data }),
  update: (id, data) => request(`/auditlogs/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/auditlogs/${id}`, { method: 'DELETE' }),
}

// ============ HL7 MESSAGES ============
export const hl7MessageAPI = {
  getAll: () => request('/hl7messages'),
  getById: (id) => request(`/hl7messages/${id}`),
  create: (data) => request('/hl7messages', { method: 'POST', body: data }),
  update: (id, data) => request(`/hl7messages/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/hl7messages/${id}`, { method: 'DELETE' }),
}

// ============ DOCTORS ============
export const doctorAPI = {
  getAll: () => request('/doctors'),
  getById: (id) => request(`/doctors/${id}`),
  create: (data) => request('/doctors', { method: 'POST', body: data }),
  update: (id, data) => request(`/doctors/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/doctors/${id}`, { method: 'DELETE' }),
}

// ============ SUPERVISORS ============
export const supervisorAPI = {
  getAll: () => request('/supervisors'),
  getById: (id) => request(`/supervisors/${id}`),
  create: (data) => request('/supervisors', { method: 'POST', body: data }),
  update: (id, data) => request(`/supervisors/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/supervisors/${id}`, { method: 'DELETE' }),
}

// ============ USERS (UTILIZATORI) ============
export const userAPI = {
  getAll: () => request('/users'),
  getById: (id) => request(`/users/${id}`),
  create: (data) => request('/users', { method: 'POST', body: data }),
  update: (id, data) => request(`/users/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/users/${id}`, { method: 'DELETE' }),
}
