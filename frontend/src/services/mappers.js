
// Derive sex from a Romanian CNP: the first digit encodes both century and sex —
// odd (1,3,5,7,9) = male, even (2,4,6,8) = female.
const extractGenderFromCNP = (cnp) => {
  if (!cnp || cnp.length !== 13) return ''
  const s = cnp[0]
  if ('13579'.includes(s)) return 'Masculin'
  if ('2468'.includes(s)) return 'Feminin'
  return ''
}

// Extract age from Romanian CNP
const extractAgeFromCNP = (cnp) => {
  if (!cnp || cnp.length !== 13) return null

  try {
    const firstDigit = cnp[0]
    const yearStr = cnp.substring(1, 3)
    const monthStr = cnp.substring(3, 5)
    const dayStr = cnp.substring(5, 7)

    const year = parseInt(yearStr)
    const month = parseInt(monthStr)
    const day = parseInt(dayStr)

    if (isNaN(year) || isNaN(month) || isNaN(day)) return null
    if (month < 1 || month > 12 || day < 1 || day > 31) return null

    // Determine century based on first digit
    let fullYear
    switch (firstDigit) {
      case '1':
      case '2':
      case '7':
      case '8':
      case '9':
        fullYear = 1900 + year
        break
      case '3':
      case '4':
        fullYear = 1800 + year
        break
      case '5':
      case '6':
        fullYear = 2000 + year
        break
      default:
        return null
    }

    const birthDate = new Date(fullYear, month - 1, day)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age
  } catch {
    return null
  }
}

// Map API Patient response to frontend Patient format
export const mapPatientFromAPI = (apiPatient, index = 0) => {
  const firstName = apiPatient.firstName || ''
  const lastName = apiPatient.lastName || ''
  const name = [firstName, lastName].filter(Boolean).join(' ') || `Pacient ${apiPatient.patientId}`

  return {
    id: `p${apiPatient.patientId}`,
    patientId: apiPatient.patientId,
    name,
    firstName,
    lastName,
    cnp: apiPatient.cnp || '',
    age: extractAgeFromCNP(apiPatient.cnp),
    gender: extractGenderFromCNP(apiPatient.cnp),
    phone: apiPatient.phone || '',
    email: apiPatient.email || '',
    street: apiPatient.street || '',
    city: apiPatient.city || '',
    county: apiPatient.county || '',
    postalCode: apiPatient.postalCode || '',
    profession: apiPatient.profession || '',
    workplace: apiPatient.workPlace || '',
    caregiverId: apiPatient.caregiverId ?? null,
    caregiverName: apiPatient.caregiverName || '',
    dateAdded: apiPatient.dateAdded,
    lastModified: apiPatient.lastModified,
    active: apiPatient.active,
    room: apiPatient.county || 'N/A',
    diagnoses: [],
    allergies: [],
    risk: 'Medium',
    sensors: [],
    status: 'Admitted',
  }
}

// Map API ManualMeasurement response (Masuratori_Manuale) to frontend format.
export const mapManualMeasurementFromAPI = (apiManual) => ({
  measurementId: apiManual.measurementId,
  patientId: apiManual.patientId,
  systolic: apiManual.tensiuneSistolica != null ? Number(apiManual.tensiuneSistolica) : null,
  diastolic: apiManual.tensiuneDiastolica != null ? Number(apiManual.tensiuneDiastolica) : null,
  glucose: apiManual.glicemie != null ? Number(apiManual.glicemie) : null,
  weight: apiManual.greutate != null ? Number(apiManual.greutate) : null,
  temperature: apiManual.temperatura != null ? Number(apiManual.temperatura) : null,
  recordedAt: apiManual.recordedAt || null,
  notes: apiManual.observatii || '',
})

export const mapPatientToAPI = (patient) => ({
  userId: patient.userId || null,
  cnp: patient.cnp || '',
  age: patient.age || 0,
  adresa_Strada: patient.street || '',
  adresa_Oras: patient.city || '',
  adresa_Judet: patient.county || '',
  profesie: patient.profession || '',
  loc_Munca: patient.workplace || '',
  firstName: patient.firstName || '',
  lastName: patient.lastName || '',
})

// Map API Alarm response to frontend Alarm format
export const mapAlarmFromAPI = (apiAlarm) => {
  const severityMap = {
    CRITICAL: 'Critical',
    HIGH: 'High',
    MEDIUM: 'Medium',
    LOW: 'Low',
  }
  const patientName = [apiAlarm.patientFirstName, apiAlarm.patientLastName].filter(Boolean).join(' ') || 'Pacient necunoscut'

  return {
    id: `a${apiAlarm.alarmId}`,
    alarmId: apiAlarm.alarmId,
    patientId: apiAlarm.patientId || '',
    patientName,
    sensor: apiAlarm.sensorName || 'Senzor necunoscut',
    type: apiAlarm.alarmType || 'Necunoscut',
    severity: severityMap[apiAlarm.alarmType?.toUpperCase()] || 'High',
    value: apiAlarm.measurementValue !== undefined ? apiAlarm.measurementValue : '',
    timestamp: apiAlarm.triggerDate || new Date().toISOString(),
    status: apiAlarm.isResolved ? 'Resolved' : 'Active',
    message: apiAlarm.message || 'Fără mesaj',
    resolutionDate: apiAlarm.resolutionDate || null,
    resolutionNotes: apiAlarm.resolutionNotes || '',
    supervisorId: apiAlarm.supervisorId ?? null,
  }
}

export const mapAlarmToAPI = (alarm) => ({
  sensorId: alarm.sensorId || null,
  patientId: alarm.patientId ? parseInt(alarm.patientId.replace('p', '')) : null,
  alarmType: alarm.type || '',
  message: alarm.message || '',
  resolutionDate: alarm.resolutionDate || null,
  supervisorId: alarm.supervisorId || null,
  resolutionNotes: alarm.resolutionNotes || '',
  isResolved: alarm.status === 'Resolved',
})

// Map API Consultation response to frontend format
export const mapConsultationFromAPI = (apiConsultation) => {
  const patientName = [apiConsultation.firstName, apiConsultation.lastName].filter(Boolean).join(' ') || 'Pacient necunoscut'

  return {
    id: `c${apiConsultation.consultationId}`,
    consultationId: apiConsultation.consultationId,
    patientId: apiConsultation.patientId || '',
    patientName,
    type: apiConsultation.presentationReason || 'Consultație medicală',
    date: apiConsultation.consultationDate?.split('T')[0] || new Date().toISOString().split('T')[0],
    time: apiConsultation.consultationDate?.split('T')[1]?.slice(0, 5) || '09:00',
    mode: 'In-Person',
    priority: 'Routine',
    physician: apiConsultation.doctorName || 'Necunoscut',
    doctorName: apiConsultation.doctorName || '',
    // Consultatii has no status column; consultations are always shown as finalized.
    status: 'Finalizata',
    presentationReason: apiConsultation.presentationReason || '',
    symptoms: apiConsultation.symptoms || '',
    diagnosisCode: apiConsultation.diagnosisCode || apiConsultation.Diagnostic_Cod_ICD9 || '',
    diagnosticText: apiConsultation.diagnosticText || '',
    referrals: apiConsultation.referrals || '',
    generatedPrescriptions: apiConsultation.generatedPrescriptions || '',
    notes: apiConsultation.notes || '',
    doctorId: apiConsultation.doctorId || null,
  }
}

export const mapConsultationToAPI = (consultation) => ({
  patientId: consultation.patientId ? parseInt(consultation.patientId.replace('p', '')) : null,
  doctorId: consultation.doctorId ? parseInt(consultation.doctorId.replace('d', '')) : null,
  consultationDate: consultation.consultationDate,
  presentationReason: consultation.presentationReason || '',
  symptoms: consultation.symptoms || '',
  diagnosisCode: consultation.diagnosisCode || '',
  diagnosticText: consultation.diagnosticText || '',
  referrals: consultation.referrals || '',
  generatedPrescriptions: consultation.generatedPrescriptions || '',
  notes: consultation.notes || '',
})

// Map API Device response to frontend format
export const mapDeviceFromAPI = (apiDevice) => {
  return {
    id: `d${apiDevice.deviceId}`,
    deviceId: apiDevice.deviceId,
    patientId: `p${apiDevice.patientId}`,
    patientName: 'Unknown Patient',
    room: '---',
    type: 'IoT Device',
    model: apiDevice.firmwareVersion ? `ESP32 v${apiDevice.firmwareVersion}` : 'ESP32',
    status: 'Online',
    battery: 75,
    lastReading: apiDevice.installationDate || new Date().toISOString(),
    lastValue: '---',
    sampleRate: 30,
    bluetoothMacAddress: apiDevice.bluetoothMacAddress || '',
    installationDate: apiDevice.installationDate || '',
    firmwareVersion: apiDevice.firmwareVersion || '',
  }
}

export const mapDeviceToAPI = (device) => ({
  patientId: device.patientId ? parseInt(device.patientId.replace('p', '')) : null,
  bluetoothMacAddress: device.bluetoothMacAddress || '',
  installationDate: device.installationDate || new Date().toISOString().split('T')[0],
  firmwareVersion: device.firmwareVersion || '',
})

// Map API SensorMeasurement response to frontend format
export const mapSensorMeasurementFromAPI = (apiMeasurement) => ({
  id: `m${apiMeasurement.measurementId}`,
  measurementId: apiMeasurement.measurementId,
  sensorId: apiMeasurement.sensorId,
  value: apiMeasurement.value || 0,
  timestamp: apiMeasurement.measurementDateTime || new Date().toISOString(),
})

export const mapSensorMeasurementToAPI = (measurement) => ({
  sensorId: measurement.sensorId || null,
  value: measurement.value || 0,
})

/**
 * Groups PatientMeasurementDto[] by sensor type into chart-ready series:
 *   { [sensorType]: { unit, thresholds, data: [{ time, label, value }] } }
 */
export const groupMeasurementsBySensor = (measurements = []) => {
  const groups = {}
  for (const m of measurements) {
    const type = m.sensorType || `Senzor ${m.sensorId}`
    if (!groups[type]) {
      groups[type] = {
        unit: m.measurementUnit || '',
        thresholds: {
          lowAlarm: m.lowerAlarmThreshold ?? null,
          lowWarn: m.lowerWarningThreshold ?? null,
          highWarn: m.upperWarningThreshold ?? null,
          highAlarm: m.upperAlarmThreshold ?? null,
        },
        data: [],
      }
    }
    const ts = m.measurementDateTime ? new Date(m.measurementDateTime) : null
    groups[type].data.push({
      time: ts
        ? ts.toLocaleString('ro-RO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
        : '',
      ts: ts ? ts.getTime() : 0,
      value: m.value != null ? Number(m.value) : null,
    })
  }
  return groups
}

// Merge a small batch of freshly-polled measurements into already-loaded sensor
// groups, so periodic refreshes only append new points instead of re-fetching the
// whole window. Points are deduped by timestamp; anything older than minTs (the
// rolling window's lower bound) is dropped so the chart doesn't grow unbounded.
export const mergeSensorGroups = (prev = {}, incoming = [], minTs = null) => {
  const next = { ...prev }
  const fresh = groupMeasurementsBySensor(incoming)
  for (const [type, g] of Object.entries(fresh)) {
    const base = next[type] ?? { ...g, data: [] }
    const byTs = new Map(base.data.map(d => [d.ts, d]))
    for (const d of g.data) byTs.set(d.ts, d)
    let data = [...byTs.values()].sort((a, b) => a.ts - b.ts)
    if (minTs != null) data = data.filter(d => d.ts >= minTs)
    next[type] = { ...base, thresholds: g.thresholds, unit: g.unit, data }
  }
  return next
}

// Map API SensorConfig response to frontend format
export const mapSensorConfigFromAPI = (apiConfig) => {
  return {
    id: `s${apiConfig.sensorId}`,
    sensorId: apiConfig.sensorId,
    deviceId: apiConfig.deviceId,
    patientId: apiConfig.patientId,
    name: apiConfig.name || apiConfig.sensorType || 'Necunoscut',
    type: apiConfig.sensorType || 'Necunoscut',
    status: apiConfig.active ? 'Online' : 'Offline',
    sensorType: apiConfig.sensorType || '',
    measurementUnit: apiConfig.measurementUnit || '',
    samplingPeriodSeconds: apiConfig.samplingPeriodSeconds || 600,
    sampleRate: apiConfig.samplingPeriodSeconds || 600,
    scaleFactor: apiConfig.scaleFactor || 1,
    lowerAlarmThreshold: apiConfig.lowerAlarmThreshold,
    lowerWarningThreshold: apiConfig.lowerWarningThreshold,
    upperWarningThreshold: apiConfig.upperWarningThreshold,
    upperAlarmThreshold: apiConfig.upperAlarmThreshold,
    thresholdMin: apiConfig.lowerAlarmThreshold || 0,
    thresholdMax: apiConfig.upperAlarmThreshold || 100,
    active: apiConfig.active,
    patientName: apiConfig.patientName || 'Necunoscut',
    room: '---',
    location: `Device ${apiConfig.deviceId}`,
    model: apiConfig.sensorType || 'Senzor necunoscut',
    lastValue: apiConfig.lastValue != null
      ? `${Number(apiConfig.lastValue)}${apiConfig.measurementUnit ? ` ${apiConfig.measurementUnit}` : ''}`
      : '---',
    lastReadingDateTime: apiConfig.lastReadingDateTime || null,
    unit: apiConfig.measurementUnit || '',
    orderNumber: apiConfig.orderNumber,
    persistenceSeconds: apiConfig.persistenceSeconds ?? null,
    activityGraceSeconds: apiConfig.activityGraceSeconds ?? null,
  }
}

export const mapSensorConfigToAPI = (config) => ({
  deviceId: config.deviceId || null,
  orderNumber: config.orderNumber || 1,
  sensorType: config.sensorType || '',
  measurementUnit: config.measurementUnit || '',
  samplingPeriodSeconds: config.samplingPeriodSeconds || 600,
  scaleFactor: config.scaleFactor || 1,
  lowerAlarmThreshold: config.lowerAlarmThreshold,
  lowerWarningThreshold: config.lowerWarningThreshold,
  upperWarningThreshold: config.upperWarningThreshold,
  upperAlarmThreshold: config.upperAlarmThreshold,
  active: config.active ?? true,
  persistenceSeconds: config.persistenceSeconds,
  activityGraceSeconds: config.activityGraceSeconds,
})

// Map API Recommendation response to frontend format
export const mapRecommendationFromAPI = (apiRec) => {
  const patientName = [apiRec.firstName, apiRec.lastName].filter(Boolean).join(' ') || 'Pacient necunoscut'

  return {
    id: `r${apiRec.recommendationId}`,
    recommendationId: apiRec.recommendationId,
    patientId: `p${apiRec.patientId}` || '',
    patientName,
    type: apiRec.activityType || 'Activitate',
    duration: apiRec.dailyDurationMinutes || 30,
    startDate: apiRec.startDate || new Date().toISOString().split('T')[0],
    endDate: apiRec.stopDate || new Date().toISOString().split('T')[0],
    description: apiRec.description || '',
    doctorId: apiRec.doctorId,
    activityType: apiRec.activityType || '',
    dailyDurationMinutes: apiRec.dailyDurationMinutes || 0,
  }
}

export const mapRecommendationToAPI = (rec) => ({
  patientId: rec.patientId ? parseInt(rec.patientId.replace('p', '')) : null,
  doctorId: rec.doctorId ? parseInt(rec.doctorId.replace('d', '')) : null,
  activityType: rec.activityType || rec.type || '',
  dailyDurationMinutes: rec.dailyDurationMinutes || rec.duration || 0,
  description: rec.description || '',
  startDate: rec.startDate || new Date().toISOString().split('T')[0],
  stopDate: rec.endDate || new Date().toISOString().split('T')[0],
})

// Map API Role response to frontend format
export const mapRoleFromAPI = (apiRole) => ({
  id: `r${apiRole.roleId}`,
  roleId: apiRole.roleId,
  name: apiRole.roleName || '',
  roleName: apiRole.roleName || '',
})

export const mapRoleToAPI = (role) => ({
  roleName: role.name || role.roleName || '',
})

// Map API UserRole response to frontend format
export const mapUserRoleFromAPI = (apiUserRole) => ({
  userId: apiUserRole.userId,
  roleId: apiUserRole.roleId,
})

export const mapUserRoleToAPI = (userRole) => ({
  userId: userRole.userId,
  roleId: userRole.roleId,
})

// Map API AuditLog response to frontend format
export const mapAuditLogFromAPI = (apiLog) => ({
  id: `l${apiLog.logId}`,
  logId: apiLog.logId,
  userId: apiLog.userId,
  action: apiLog.action || '',
  table: apiLog.affectedTable || '',
  timestamp: apiLog.logDateTime || new Date().toISOString(),
  sourceIp: apiLog.sourceIp || '',
})

export const mapAuditLogToAPI = (log) => ({
  userId: log.userId || null,
  action: log.action || '',
  affectedTable: log.table || '',
  sourceIp: log.sourceIp || '',
})

// Map API HL7Message response to frontend format
export const mapHL7MessageFromAPI = (apiMsg) => ({
  id: `h${apiMsg.messageId}`,
  messageId: apiMsg.messageId,
  patientId: `p${apiMsg.patientId}` || '',
  direction: apiMsg.direction || 'IN',
  content: apiMsg.content || '',
  timestamp: apiMsg.transferDate || new Date().toISOString(),
})

export const mapHL7MessageToAPI = (msg) => ({
  patientId: msg.patientId ? parseInt(msg.patientId.replace('p', '')) : null,
  direction: msg.direction || 'IN',
  content: msg.content || '',
})
