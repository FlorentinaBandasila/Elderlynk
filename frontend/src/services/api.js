const API_BASE = 'https://localhost:7135/api'

const handleResponse = async (res) => {
  if (!res.ok) {
    const error = await res.text()
    throw new Error(`API Error: ${res.status} - ${error}`)
  }
  return res.json()
}

// ============ PATIENTS ============
export const patientAPI = {
  getAll: async () => {
    const res = await fetch(`${API_BASE}/Patients`)
    return handleResponse(res)
  },

  getById: async (id) => {
    const res = await fetch(`${API_BASE}/Patients/${id}`)
    return handleResponse(res)
  },

  create: async (data) => {
    const res = await fetch(`${API_BASE}/Patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return handleResponse(res)
  },

  update: async (id, data) => {
    const res = await fetch(`${API_BASE}/Patients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return handleResponse(res)
  },

  delete: async (id) => {
    await fetch(`${API_BASE}/patients/${id}`, { method: 'DELETE' })
  },
}

// ============ ALARMS ============
export const alarmAPI = {
  getAll: async () => {
    const res = await fetch(`${API_BASE}/alarms`)
    return res.json()
  },

  getById: async (id) => {
    const res = await fetch(`${API_BASE}/alarms/${id}`)
    return res.json()
  },

  create: async (data) => {
    const res = await fetch(`${API_BASE}/alarms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  update: async (id, data) => {
    const res = await fetch(`${API_BASE}/alarms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  delete: async (id) => {
    await fetch(`${API_BASE}/alarms/${id}`, { method: 'DELETE' })
  },
}

// ============ CONSULTATIONS ============
export const consultationAPI = {
  getAll: async () => {
    const res = await fetch(`${API_BASE}/consultations`)
    return res.json()
  },

  getById: async (id) => {
    const res = await fetch(`${API_BASE}/consultations/${id}`)
    return res.json()
  },

  create: async (data) => {
    const res = await fetch(`${API_BASE}/consultations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  update: async (id, data) => {
    const res = await fetch(`${API_BASE}/consultations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  delete: async (id) => {
    await fetch(`${API_BASE}/consultations/${id}`, { method: 'DELETE' })
  },
}

// ============ DEVICES ============
export const deviceAPI = {
  getAll: async () => {
    const res = await fetch(`${API_BASE}/devices`)
    return res.json()
  },

  getById: async (id) => {
    const res = await fetch(`${API_BASE}/devices/${id}`)
    return res.json()
  },

  create: async (data) => {
    const res = await fetch(`${API_BASE}/devices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  update: async (id, data) => {
    const res = await fetch(`${API_BASE}/devices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  delete: async (id) => {
    await fetch(`${API_BASE}/devices/${id}`, { method: 'DELETE' })
  },
}

// ============ SENSOR MEASUREMENTS ============
export const sensorMeasurementAPI = {
  getAll: async () => {
    const res = await fetch(`${API_BASE}/sensormeasurements`)
    return res.json()
  },

  getById: async (id) => {
    const res = await fetch(`${API_BASE}/sensormeasurements/${id}`)
    return res.json()
  },

  create: async (data) => {
    const res = await fetch(`${API_BASE}/sensormeasurements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  update: async (id, data) => {
    const res = await fetch(`${API_BASE}/sensormeasurements/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  delete: async (id) => {
    await fetch(`${API_BASE}/sensormeasurements/${id}`, { method: 'DELETE' })
  },
}

// ============ SENSOR CONFIG ============
export const sensorConfigAPI = {
  getAll: async () => {
    const res = await fetch(`${API_BASE}/sensorconfigs`)
    return res.json()
  },

  getById: async (id) => {
    const res = await fetch(`${API_BASE}/sensorconfigs/${id}`)
    return res.json()
  },

  create: async (data) => {
    const res = await fetch(`${API_BASE}/sensorconfigs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  update: async (id, data) => {
    const res = await fetch(`${API_BASE}/sensorconfigs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  delete: async (id) => {
    await fetch(`${API_BASE}/sensorconfigs/${id}`, { method: 'DELETE' })
  },
}

// ============ RECOMMENDATIONS ============
export const recommendationAPI = {
  getAll: async () => {
    const res = await fetch(`${API_BASE}/recommendations`)
    return res.json()
  },

  getById: async (id) => {
    const res = await fetch(`${API_BASE}/recommendations/${id}`)
    return res.json()
  },

  create: async (data) => {
    const res = await fetch(`${API_BASE}/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  update: async (id, data) => {
    const res = await fetch(`${API_BASE}/recommendations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  delete: async (id) => {
    await fetch(`${API_BASE}/recommendations/${id}`, { method: 'DELETE' })
  },
}

// ============ ROLES ============
export const roleAPI = {
  getAll: async () => {
    const res = await fetch(`${API_BASE}/roles`)
    return res.json()
  },

  getById: async (id) => {
    const res = await fetch(`${API_BASE}/roles/${id}`)
    return res.json()
  },

  create: async (data) => {
    const res = await fetch(`${API_BASE}/roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  update: async (id, data) => {
    const res = await fetch(`${API_BASE}/roles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  delete: async (id) => {
    await fetch(`${API_BASE}/roles/${id}`, { method: 'DELETE' })
  },
}

// ============ USER ROLES ============
export const userRoleAPI = {
  getAll: async () => {
    const res = await fetch(`${API_BASE}/userroles`)
    return res.json()
  },

  getById: async (userId, roleId) => {
    const res = await fetch(`${API_BASE}/userroles/${userId}/${roleId}`)
    return res.json()
  },

  create: async (data) => {
    const res = await fetch(`${API_BASE}/userroles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  update: async (userId, roleId, data) => {
    const res = await fetch(`${API_BASE}/userroles/${userId}/${roleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  delete: async (userId, roleId) => {
    await fetch(`${API_BASE}/userroles/${userId}/${roleId}`, { method: 'DELETE' })
  },
}

// ============ AUDIT LOGS ============
export const auditLogAPI = {
  getAll: async () => {
    const res = await fetch(`${API_BASE}/auditlogs`)
    return res.json()
  },

  getById: async (id) => {
    const res = await fetch(`${API_BASE}/auditlogs/${id}`)
    return res.json()
  },

  create: async (data) => {
    const res = await fetch(`${API_BASE}/auditlogs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  update: async (id, data) => {
    const res = await fetch(`${API_BASE}/auditlogs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  delete: async (id) => {
    await fetch(`${API_BASE}/auditlogs/${id}`, { method: 'DELETE' })
  },
}

// ============ HL7 MESSAGES ============
export const hl7MessageAPI = {
  getAll: async () => {
    const res = await fetch(`${API_BASE}/hl7messages`)
    return res.json()
  },

  getById: async (id) => {
    const res = await fetch(`${API_BASE}/hl7messages/${id}`)
    return res.json()
  },

  create: async (data) => {
    const res = await fetch(`${API_BASE}/hl7messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  update: async (id, data) => {
    const res = await fetch(`${API_BASE}/hl7messages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  delete: async (id) => {
    await fetch(`${API_BASE}/hl7messages/${id}`, { method: 'DELETE' })
  },
}

// ============ DOCTORS ============
export const doctorAPI = {
  getAll: async () => {
    const res = await fetch(`${API_BASE}/doctors`)
    return res.json()
  },

  getById: async (id) => {
    const res = await fetch(`${API_BASE}/doctors/${id}`)
    return res.json()
  },

  create: async (data) => {
    const res = await fetch(`${API_BASE}/doctors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  update: async (id, data) => {
    const res = await fetch(`${API_BASE}/doctors/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  delete: async (id) => {
    await fetch(`${API_BASE}/doctors/${id}`, { method: 'DELETE' })
  },
}

// ============ SUPERVISORS ============
export const supervisorAPI = {
  getAll: async () => {
    const res = await fetch(`${API_BASE}/supervisors`)
    return res.json()
  },

  getById: async (id) => {
    const res = await fetch(`${API_BASE}/supervisors/${id}`)
    return res.json()
  },

  create: async (data) => {
    const res = await fetch(`${API_BASE}/supervisors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  update: async (id, data) => {
    const res = await fetch(`${API_BASE}/supervisors/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  delete: async (id) => {
    await fetch(`${API_BASE}/supervisors/${id}`, { method: 'DELETE' })
  },
}

// ============ USERS (UTILIZATORI) ============
export const userAPI = {
  getAll: async () => {
    const res = await fetch(`${API_BASE}/users`)
    return res.json()
  },

  getById: async (id) => {
    const res = await fetch(`${API_BASE}/users/${id}`)
    return res.json()
  },

  create: async (data) => {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  update: async (id, data) => {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  delete: async (id) => {
    await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE' })
  },
}
