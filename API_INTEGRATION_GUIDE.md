# API Integration Guide - Elderlynk

## Overview
This document outlines the complete API integration between the backend (.NET) and frontend (React) for the Elderlynk telecare platform.

## Backend Endpoints (All Implemented)

### 1. **Patients API**
- `GET /api/patients` - Get all patients
- `GET /api/patients/{id}` - Get patient by ID
- `POST /api/patients` - Create new patient
- `PUT /api/patients/{id}` - Update patient
- `DELETE /api/patients/{id}` - Delete patient

### 2. **Alarms API**
- `GET /api/alarms` - Get all alarms
- `GET /api/alarms/{id}` - Get alarm by ID
- `POST /api/alarms` - Create new alarm
- `PUT /api/alarms/{id}` - Update alarm
- `DELETE /api/alarms/{id}` - Delete alarm

### 3. **Consultations API**
- `GET /api/consultations` - Get all consultations
- `GET /api/consultations/{id}` - Get consultation by ID
- `POST /api/consultations` - Create new consultation
- `PUT /api/consultations/{id}` - Update consultation
- `DELETE /api/consultations/{id}` - Delete consultation

### 4. **Devices (IoT) API**
- `GET /api/devices` - Get all devices
- `GET /api/devices/{id}` - Get device by ID
- `POST /api/devices` - Create new device
- `PUT /api/devices/{id}` - Update device
- `DELETE /api/devices/{id}` - Delete device

### 5. **Sensor Measurements API**
- `GET /api/sensormeasurements` - Get all measurements
- `GET /api/sensormeasurements/{id}` - Get measurement by ID
- `POST /api/sensormeasurements` - Create measurement
- `PUT /api/sensormeasurements/{id}` - Update measurement
- `DELETE /api/sensormeasurements/{id}` - Delete measurement

### 6. **Sensor Configuration API**
- `GET /api/sensorconfigs` - Get all sensor configs
- `GET /api/sensorconfigs/{id}` - Get config by ID
- `POST /api/sensorconfigs` - Create sensor config
- `PUT /api/sensorconfigs/{id}` - Update config
- `DELETE /api/sensorconfigs/{id}` - Delete config

### 7. **Recommendations API**
- `GET /api/recommendations` - Get all recommendations
- `GET /api/recommendations/{id}` - Get recommendation by ID
- `POST /api/recommendations` - Create recommendation
- `PUT /api/recommendations/{id}` - Update recommendation
- `DELETE /api/recommendations/{id}` - Delete recommendation

### 8. **Roles API**
- `GET /api/roles` - Get all roles
- `GET /api/roles/{id}` - Get role by ID
- `POST /api/roles` - Create role
- `PUT /api/roles/{id}` - Update role
- `DELETE /api/roles/{id}` - Delete role

### 9. **User Roles API**
- `GET /api/userroles` - Get all user roles
- `GET /api/userroles/{userId}/{roleId}` - Get user role
- `POST /api/userroles` - Assign role to user
- `PUT /api/userroles/{userId}/{roleId}` - Update user role
- `DELETE /api/userroles/{userId}/{roleId}` - Remove user role

### 10. **Audit Logs API**
- `GET /api/auditlogs` - Get all audit logs
- `GET /api/auditlogs/{id}` - Get log by ID
- `POST /api/auditlogs` - Create audit log
- `PUT /api/auditlogs/{id}` - Update log
- `DELETE /api/auditlogs/{id}` - Delete log

### 11. **HL7 Messages API**
- `GET /api/hl7messages` - Get all HL7 messages
- `GET /api/hl7messages/{id}` - Get message by ID
- `POST /api/hl7messages` - Create HL7 message
- `PUT /api/hl7messages/{id}` - Update message
- `DELETE /api/hl7messages/{id}` - Delete message

### 12. **Doctors API** *(New)*
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/{id}` - Get doctor by ID
- `POST /api/doctors` - Create doctor
- `PUT /api/doctors/{id}` - Update doctor
- `DELETE /api/doctors/{id}` - Delete doctor

### 13. **Supervisors API** *(New)*
- `GET /api/supervisors` - Get all supervisors
- `GET /api/supervisors/{id}` - Get supervisor by ID
- `POST /api/supervisors` - Create supervisor
- `PUT /api/supervisors/{id}` - Update supervisor
- `DELETE /api/supervisors/{id}` - Delete supervisor

---

## Frontend Integration

### Frontend Pages Connected
1. **Dashboard** - Displays patient stats, alarms, and system status
2. **Patients** - Lists all patients with filtering and CRUD operations
3. **Live Alarms** - Real-time alarm monitoring with status updates
4. **Consultations** - Consultation schedule management
5. **Sensor Config** - IoT device configuration (ready for implementation)

### Frontend Services

#### API Service (`src/services/api.js`)
Central service for all HTTP requests to backend endpoints.

```javascript
// Example usage
import { patientAPI } from '@/services/api'

// Fetch all patients
const patients = await patientAPI.getAll()

// Create new patient
const newPatient = await patientAPI.create({
  cnp: '1234567890123',
  age: 65,
  adresa_Strada: 'Main Street',
  adresa_Oras: 'Bucharest',
  adresa_Judet: 'Ilfov'
})
```

#### Data Mappers (`src/services/mappers.js`)
Transforms API responses to frontend format for compatibility.

```javascript
// Example usage
import { mapPatientFromAPI } from '@/services/mappers'

const apiPatient = { patientId: 1, cnp: '123...', age: 65 }
const uiPatient = mapPatientFromAPI(apiPatient)
```

---

## Data Mapping Reference

### Patient Mapping
**API (Database)** → **Frontend**
- `patientId` → `id` (with 'p' prefix)
- `cnp` → `cnp`
- `age` → `age`
- `adresa_Strada` → `street`
- `adresa_Oras` → `city`
- `adresa_Judet` → `county`
- `profesie` → `profession`
- `loc_Munca` → `workplace`
- `id_Medic_Familie` → `familyDoctorId`

### Alarm Mapping
**API (Database)** → **Frontend**
- `alarmId` → `id` (with 'a' prefix)
- `alarmType` → `type`
- `triggerDate` → `timestamp`
- `isResolved` → `status` (boolean)
- `message` → `message`

### Consultation Mapping
**API (Database)** → **Frontend**
- `consultationId` → `id` (with 'c' prefix)
- `consultationDate` → `date` & `time`
- `patientId` → `patientId`
- `doctorId` → `doctorId`
- `notes` → `notes`

---

## Configuration

### Backend Configuration
- **Base URL**: `http://localhost:5000` or `https://localhost:5443` (HTTPS)
- **Database**: SQL Server (configured in `appsettings.json`)
- **Port**: 5000 (HTTP) / 5443 (HTTPS)

### Frontend Configuration
- **API Base URL**: `http://localhost:5000/api` (in `src/services/api.js`)
- **CORS**: Configured for `http://localhost:5173` and `https://localhost:5173`
- **Dev Server Port**: 5173

---

## Testing the Integration

### 1. Start Backend
```bash
cd backend
dotnet run
# Should run on https://localhost:5443 or http://localhost:5000
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
# Should run on http://localhost:5173
```

### 3. Test API Endpoints

**Using cURL:**
```bash
# Get all patients
curl https://localhost:5443/api/patients

# Create a patient
curl -X POST https://localhost:5443/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "cnp": "1234567890123",
    "age": 65,
    "adresa_Strada": "Main St",
    "adresa_Oras": "Bucharest",
    "adresa_Judet": "Ilfov"
  }'
```

**Using Postman:**
1. Import the endpoints from the API list above
2. Set base URL to `https://localhost:5443/api`
3. Test each endpoint

### 4. Frontend Testing Checklist

- [ ] Dashboard loads and displays data from API
- [ ] Patients page shows fetched patients
- [ ] Create patient form sends data to backend
- [ ] Alarms are fetched and displayed
- [ ] Can acknowledge/resolve alarms
- [ ] Consultations are fetched and displayed
- [ ] Can create new consultations

---

## Database Schema Notes

The backend expects the following database tables:
- `Pacienti` (Patients)
- `Utilizatori` (Users)
- `Alarme_Evenimente` (Alarms)
- `Consultatii` (Consultations)
- `Dispozitive_ESP32` (IoT Devices)
- `Masuratori_Senzori` (Sensor Measurements)
- `Senzori_Configurare` (Sensor Configuration)
- `Recomandari` (Recommendations)
- `Roluri` (Roles)
- `Log_Audit` (Audit Logs)
- `Mesaje_HL7_Audit` (HL7 Messages)
- `Utilizatori_Roluri` (User Roles)
- `Medici` (Doctors) - New
- `Supraveghetori` (Supervisors) - New

Run migrations to ensure all tables exist:
```bash
dotnet ef database update
```

---

## Error Handling

All API calls include error handling:

```javascript
try {
  const data = await patientAPI.getAll()
  // Process data
} catch (error) {
  console.error('Error:', error)
  // Fallback to mock data or show error message
}
```

Most components fallback to mock data if API calls fail, ensuring the app remains functional during development.

---

## Future Enhancements

1. **WebSocket Integration**: Real-time alarm notifications
2. **Authentication**: JWT token-based auth for API endpoints
3. **Pagination**: Implement pagination for large datasets
4. **Filtering**: Server-side filtering for better performance
5. **Export**: Data export to CSV/PDF
6. **Advanced Scheduling**: Appointment scheduling system

---

## Developer Notes

- All DTOs use nullable types for optional fields
- Services use `DbSet<T>` for database operations
- Frontend uses async/await for all API calls
- Data mappers ensure clean separation of API and UI models
- All endpoints return proper HTTP status codes (200, 201, 204, 404, 500)
