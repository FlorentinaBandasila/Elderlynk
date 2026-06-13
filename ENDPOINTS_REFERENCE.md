# Complete API Endpoints Reference

## Base URL
```
http://localhost:5000/api
https://localhost:5443/api
```

---

## Patients Endpoints
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/patients` | Get all patients | - |
| GET | `/patients/{id}` | Get patient by ID | - |
| POST | `/patients` | Create new patient | `{ cnp, age, adresa_Strada, adresa_Oras, adresa_Judet, profesie, loc_Munca, id_Medic_Familie }` |
| PUT | `/patients/{id}` | Update patient | Same as POST |
| DELETE | `/patients/{id}` | Delete patient | - |

**Example Request (POST):**
```json
{
  "cnp": "1950123456789",
  "age": 74,
  "adresa_Strada": "Main Street 123",
  "adresa_Oras": "Bucharest",
  "adresa_Judet": "Ilfov",
  "profesie": "Retired",
  "loc_Munca": null,
  "id_Medic_Familie": 1
}
```

---

## Alarms Endpoints
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/alarms` | Get all alarms | - |
| GET | `/alarms/{id}` | Get alarm by ID | - |
| POST | `/alarms` | Create alarm | `{ sensorId, patientId, alarmType, message }` |
| PUT | `/alarms/{id}` | Update alarm | `{ sensorId, patientId, alarmType, message, resolutionDate, supervisorId, resolutionNotes, isResolved }` |
| DELETE | `/alarms/{id}` | Delete alarm | - |

**Example Request (POST):**
```json
{
  "sensorId": 1,
  "patientId": 1,
  "alarmType": "SpO2 Critical Low",
  "message": "Patient SpO2 dropped below 90%"
}
```

---

## Consultations Endpoints
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/consultations` | Get all consultations | - |
| GET | `/consultations/{id}` | Get consultation by ID | - |
| POST | `/consultations` | Create consultation | `{ patientId, doctorId, presentationReason, symptoms, diagnosisCode, notes }` |
| PUT | `/consultations/{id}` | Update consultation | Same as POST |
| DELETE | `/consultations/{id}` | Delete consultation | - |

**Example Request (POST):**
```json
{
  "patientId": 1,
  "doctorId": 1,
  "presentationReason": "Follow-up on CHF exacerbation",
  "symptoms": "Shortness of breath, fatigue",
  "diagnosisCode": "I50.9",
  "notes": "Adjusted diuretics, ordered echo"
}
```

---

## Devices Endpoints
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/devices` | Get all devices | - |
| GET | `/devices/{id}` | Get device by ID | - |
| POST | `/devices` | Create device | `{ patientId, bluetoothMacAddress, installationDate, firmwareVersion }` |
| PUT | `/devices/{id}` | Update device | Same as POST |
| DELETE | `/devices/{id}` | Delete device | - |

**Example Request (POST):**
```json
{
  "patientId": 1,
  "bluetoothMacAddress": "00:1A:7D:DA:71:13",
  "installationDate": "2026-05-01",
  "firmwareVersion": "1.2.3"
}
```

---

## Sensor Measurements Endpoints
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/sensormeasurements` | Get all measurements | - |
| GET | `/sensormeasurements/{id}` | Get measurement by ID | - |
| POST | `/sensormeasurements` | Create measurement | `{ sensorId, value }` |
| PUT | `/sensormeasurements/{id}` | Update measurement | Same as POST |
| DELETE | `/sensormeasurements/{id}` | Delete measurement | - |

**Example Request (POST):**
```json
{
  "sensorId": 1,
  "value": 98.5
}
```

---

## Sensor Configuration Endpoints
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/sensorconfigs` | Get all configs | - |
| GET | `/sensorconfigs/{id}` | Get config by ID | - |
| POST | `/sensorconfigs` | Create config | `{ deviceId, orderNumber, sensorType, measurementUnit, samplingPeriodSeconds, scaleFactor, lowerAlarmThreshold, lowerWarningThreshold, upperWarningThreshold, upperAlarmThreshold, active }` |
| PUT | `/sensorconfigs/{id}` | Update config | Same as POST |
| DELETE | `/sensorconfigs/{id}` | Delete config | - |

**Example Request (POST):**
```json
{
  "deviceId": 1,
  "orderNumber": 1,
  "sensorType": "Heart Rate Monitor",
  "measurementUnit": "bpm",
  "samplingPeriodSeconds": 30,
  "scaleFactor": 1.0,
  "lowerAlarmThreshold": 50,
  "lowerWarningThreshold": 60,
  "upperWarningThreshold": 100,
  "upperAlarmThreshold": 120,
  "active": true
}
```

---

## Recommendations Endpoints
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/recommendations` | Get all recommendations | - |
| GET | `/recommendations/{id}` | Get recommendation by ID | - |
| POST | `/recommendations` | Create recommendation | `{ patientId, doctorId, activityType, dailyDurationMinutes, description, startDate, stopDate }` |
| PUT | `/recommendations/{id}` | Update recommendation | Same as POST |
| DELETE | `/recommendations/{id}` | Delete recommendation | - |

**Example Request (POST):**
```json
{
  "patientId": 1,
  "doctorId": 1,
  "activityType": "Walking",
  "dailyDurationMinutes": 30,
  "description": "Daily walking exercise for cardio health",
  "startDate": "2026-05-01",
  "stopDate": "2026-08-01"
}
```

---

## Roles Endpoints
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/roles` | Get all roles | - |
| GET | `/roles/{id}` | Get role by ID | - |
| POST | `/roles` | Create role | `{ roleName }` |
| PUT | `/roles/{id}` | Update role | `{ roleName }` |
| DELETE | `/roles/{id}` | Delete role | - |

**Example Request (POST):**
```json
{
  "roleName": "Doctor"
}
```

---

## User Roles Endpoints
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/userroles` | Get all user roles | - |
| GET | `/userroles/{userId}/{roleId}` | Get user role | - |
| POST | `/userroles` | Assign role to user | `{ userId, roleId }` |
| PUT | `/userroles/{userId}/{roleId}` | Update user role | `{ userId, roleId }` |
| DELETE | `/userroles/{userId}/{roleId}` | Remove user role | - |

**Example Request (POST):**
```json
{
  "userId": 1,
  "roleId": 1
}
```

---

## Audit Logs Endpoints
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/auditlogs` | Get all audit logs | - |
| GET | `/auditlogs/{id}` | Get log by ID | - |
| POST | `/auditlogs` | Create audit log | `{ userId, action, affectedTable, sourceIp }` |
| PUT | `/auditlogs/{id}` | Update log | Same as POST |
| DELETE | `/auditlogs/{id}` | Delete log | - |

**Example Request (POST):**
```json
{
  "userId": 1,
  "action": "Created",
  "affectedTable": "Pacienti",
  "sourceIp": "192.168.1.100"
}
```

---

## HL7 Messages Endpoints
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/hl7messages` | Get all messages | - |
| GET | `/hl7messages/{id}` | Get message by ID | - |
| POST | `/hl7messages` | Create message | `{ patientId, direction, content }` |
| PUT | `/hl7messages/{id}` | Update message | Same as POST |
| DELETE | `/hl7messages/{id}` | Delete message | - |

**Example Request (POST):**
```json
{
  "patientId": 1,
  "direction": "IN",
  "content": "<?xml version=\"1.0\"?><hl7Message>...</hl7Message>"
}
```

---

## Doctors Endpoints
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/doctors` | Get all doctors | - |
| GET | `/doctors/{id}` | Get doctor by ID | - |
| POST | `/doctors` | Create doctor | `{ email, firstName, lastName, phone, specialty }` |
| PUT | `/doctors/{id}` | Update doctor | `{ email, firstName, lastName, phone, specialty, active }` |
| DELETE | `/doctors/{id}` | Delete doctor | - |

**Example Request (POST):**
```json
{
  "email": "sarah.chen@hospital.com",
  "firstName": "Sarah",
  "lastName": "Chen",
  "phone": "+1-555-123-4567",
  "specialty": "Cardiology"
}
```

---

## Supervisors Endpoints
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/supervisors` | Get all supervisors | - |
| GET | `/supervisors/{id}` | Get supervisor by ID | - |
| POST | `/supervisors` | Create supervisor | `{ email, firstName, lastName, phone, department }` |
| PUT | `/supervisors/{id}` | Update supervisor | `{ email, firstName, lastName, phone, department, active }` |
| DELETE | `/supervisors/{id}` | Delete supervisor | - |

**Example Request (POST):**
```json
{
  "email": "john.doe@hospital.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1-555-987-6543",
  "department": "ICU"
}
```

---

## Users Endpoints
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/users` | Get all users | - |
| GET | `/users/{id}` | Get user by ID | - |
| POST | `/users` | Create user | `{ email, password, firstName, lastName, phone }` |
| PUT | `/users/{id}` | Update user | `{ firstName, lastName, phone, active }` |
| DELETE | `/users/{id}` | Delete user | - |

**Example Request (POST):**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1-555-123-4567"
}
```

---

## HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET, PUT |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid request data |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Server error |

---

## Error Response Format

```json
{
  "error": "Error message here",
  "statusCode": 400
}
```

---

## Pagination (Future Enhancement)

When pagination is implemented, add:
```
?page=1&pageSize=10
```

Example:
```
GET /api/patients?page=1&pageSize=20
```

---

## Filtering (Future Enhancement)

When filtering is implemented:
```
?status=Active&risk=Critical
```

---

## Sorting (Future Enhancement)

When sorting is implemented:
```
?sortBy=age&sortOrder=asc
```

---

## Total Endpoints: 70+

- Patients: 5
- Alarms: 5
- Consultations: 5
- Devices: 5
- Sensor Measurements: 5
- Sensor Config: 5
- Recommendations: 5
- Roles: 5
- User Roles: 5
- Audit Logs: 5
- HL7 Messages: 5
- Doctors: 5
- Supervisors: 5
- Users: 5

**All endpoints are fully functional and tested!**
