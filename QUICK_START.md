# Elderlynk API Integration - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- .NET 10.0
- SQL Server (or configured database)
- Visual Studio Code / Visual Studio

### Setup Instructions

#### 1. Backend Setup
```bash
cd backend
# Install dependencies (if needed)
dotnet restore

# Run database migrations
dotnet ef database update

# Start the backend server
dotnet run
# Backend runs at: http://localhost:5000 or https://localhost:5443
```

#### 2. Frontend Setup
```bash
cd frontend
# Install dependencies
npm install

# Start development server
npm run dev
# Frontend runs at: http://localhost:5173
```

---

## 📡 Using the API in Frontend Components

### Example 1: Fetch All Patients
```javascript
import { patientAPI } from '@/services/api'
import { mapPatientFromAPI } from '@/services/mappers'

// In your component
const [patients, setPatients] = useState([])

useEffect(() => {
  const fetchPatients = async () => {
    try {
      const data = await patientAPI.getAll()
      const mapped = data.map(mapPatientFromAPI)
      setPatients(mapped)
    } catch (error) {
      console.error('Error:', error)
    }
  }
  fetchPatients()
}, [])
```

### Example 2: Create a New Patient
```javascript
const handleCreatePatient = async (formData) => {
  try {
    const response = await patientAPI.create({
      cnp: formData.cnp,
      age: formData.age,
      adresa_Strada: formData.street,
      adresa_Oras: formData.city,
      adresa_Judet: formData.county,
      profesie: formData.profession,
      loc_Munca: formData.workplace,
    })
    
    const newPatient = mapPatientFromAPI(response)
    setPatients(prev => [...prev, newPatient])
  } catch (error) {
    alert('Error creating patient')
  }
}
```

### Example 3: Update an Alarm Status
```javascript
const updateAlarmStatus = async (alarmId, isResolved) => {
  try {
    await alarmAPI.update(alarmId, {
      isResolved: isResolved,
      resolutionDate: isResolved ? new Date().toISOString() : null
    })
    
    // Update local state
    setAlarms(prev => prev.map(a => 
      a.alarmId === alarmId ? { ...a, isResolved } : a
    ))
  } catch (error) {
    console.error('Error updating alarm:', error)
  }
}
```

### Example 4: Create a Consultation
```javascript
const handleCreateConsultation = async (consultationData) => {
  try {
    const response = await consultationAPI.create({
      patientId: parseInt(consultationData.patientId),
      doctorId: consultationData.doctorId,
      presentationReason: consultationData.reason,
      symptoms: consultationData.symptoms,
      diagnosisCode: consultationData.diagnosis,
      notes: consultationData.notes,
    })
    
    const newConsult = mapConsultationFromAPI(response)
    setConsultations(prev => [...prev, newConsult])
  } catch (error) {
    console.error('Error:', error)
  }
}
```

---

## 🔄 Available API Services

### patientAPI
```javascript
await patientAPI.getAll()           // Get all patients
await patientAPI.getById(id)        // Get patient by ID
await patientAPI.create(data)       // Create patient
await patientAPI.update(id, data)   // Update patient
await patientAPI.delete(id)         // Delete patient
```

### alarmAPI
```javascript
await alarmAPI.getAll()
await alarmAPI.getById(id)
await alarmAPI.create(data)
await alarmAPI.update(id, data)
await alarmAPI.delete(id)
```

### consultationAPI
```javascript
await consultationAPI.getAll()
await consultationAPI.getById(id)
await consultationAPI.create(data)
await consultationAPI.update(id, data)
await consultationAPI.delete(id)
```

### deviceAPI, sensorConfigAPI, sensorMeasurementAPI, recommendationAPI, roleAPI, userRoleAPI, auditLogAPI, hl7MessageAPI, doctorAPI, supervisorAPI
All follow the same pattern as above.

---

## 🔧 Data Transformation Examples

### Patient
```javascript
// API Response
{
  "patientId": 1,
  "cnp": "1234567890123",
  "age": 65,
  "adresa_Strada": "Main Street",
  "adresa_Oras": "Bucharest",
  "adresa_Judet": "Ilfov"
}

// After mapping
{
  "id": "p1",
  "patientId": 1,
  "name": "Patient 1",
  "cnp": "1234567890123",
  "age": 65,
  "room": "Ilfov",
  "street": "Main Street",
  "city": "Bucharest",
  "county": "Ilfov"
  // ... more fields
}
```

### Alarm
```javascript
// API Response
{
  "alarmId": 5,
  "patientId": 1,
  "alarmType": "SpO2 Critical Low",
  "message": "SpO2 dropped below critical threshold",
  "triggerDate": "2026-05-06T08:47:00",
  "isResolved": false
}

// After mapping
{
  "id": "a5",
  "alarmId": 5,
  "patientId": "p1",
  "type": "SpO2 Critical Low",
  "message": "SpO2 dropped below critical threshold",
  "severity": "High",
  "status": "Active",
  "timestamp": "2026-05-06T08:47:00"
  // ... more fields
}
```

---

## ⚠️ Error Handling

All components have built-in error handling:

```javascript
try {
  const data = await apiService.getAll()
  setData(data)
} catch (error) {
  console.error('Error:', error)
  // Fallback to mock data
  setData(mockData)
  // Or show error message
  showErrorMessage('Failed to fetch data')
}
```

---

## 🧪 Testing the APIs

### Using Browser DevTools
1. Open http://localhost:5173
2. Go to Network tab
3. Perform actions (fetch, create, update, delete)
4. Watch API calls to `http://localhost:5000/api/*`

### Using Postman
1. Create a new request
2. Set URL: `http://localhost:5000/api/patients`
3. Set method: GET, POST, PUT, or DELETE
4. Add JSON body for POST/PUT requests
5. Send and check response

### Using cURL
```bash
# Get all patients
curl http://localhost:5000/api/patients

# Create patient
curl -X POST http://localhost:5000/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "cnp": "1234567890123",
    "age": 65,
    "adresa_Strada": "Main St",
    "adresa_Oras": "Bucharest",
    "adresa_Judet": "Ilfov"
  }'
```

---

## 📝 Database Schema

### Patient Fields
- patientId (int, PK)
- cnp (char(13), required)
- age (int, nullable)
- adresa_Strada (nvarchar(100), nullable)
- adresa_Oras (nvarchar(50), nullable)
- adresa_Judet (nvarchar(50), nullable)
- profesie (nvarchar(50), nullable)
- loc_Munca (nvarchar(50), nullable)
- id_Medic_Familie (int, FK, nullable)

### Alarm Fields
- alarmId (int, PK)
- patientId (int, FK, nullable)
- sensorId (int, FK, nullable)
- alarmType (nvarchar(20), nullable)
- message (nvarchar, nullable)
- triggerDate (datetime, nullable)
- resolutionDate (datetime, nullable)
- supervisorId (int, FK, nullable)
- resolutionNotes (nvarchar, nullable)
- isResolved (bit, nullable)

### Consultation Fields
- consultationId (int, PK)
- patientId (int, FK, nullable)
- doctorId (int, FK, nullable)
- consultationDate (datetime, nullable)
- presentationReason (nvarchar, nullable)
- symptoms (nvarchar, nullable)
- diagnosisCode (nvarchar(10), nullable)
- notes (nvarchar, nullable)

---

## 🚨 Common Issues & Solutions

### CORS Error
**Problem**: "Access to XMLHttpRequest blocked by CORS policy"
**Solution**: Backend CORS is configured for http://localhost:5173. Ensure:
- Frontend running on http://localhost:5173
- Backend running on http://localhost:5000
- Check Program.cs CORS configuration

### 404 Not Found
**Problem**: API endpoint returns 404
**Solution**: 
- Verify endpoint URL matches controller name
- Check if service is registered in DI container
- Ensure controller action exists

### 500 Internal Server Error
**Problem**: API returns 500 error
**Solution**:
- Check backend logs for error details
- Verify database connection
- Ensure all migrations are applied: `dotnet ef database update`

### Data Not Updating
**Problem**: Changes in UI don't reflect in database
**Solution**:
- Check if API call is actually being made (Network tab)
- Verify request payload is correct
- Check if backend validation is failing
- Review error message from API response

---

## 📊 Performance Tips

1. **Pagination**: For large datasets, implement pagination
2. **Caching**: Cache frequently accessed data
3. **Debouncing**: Debounce search inputs to reduce API calls
4. **Error Recovery**: Implement retry logic with exponential backoff
5. **Lazy Loading**: Load data only when needed

---

## 🔒 Security Notes

- Currently no authentication/authorization (for development)
- Production should implement JWT tokens
- Validate all user inputs on both client and server
- Use HTTPS in production
- Implement rate limiting
- Add CSRF tokens if needed

---

## 📚 Additional Resources

- See `API_INTEGRATION_GUIDE.md` for detailed endpoint documentation
- Check `src/services/api.js` for complete API service implementation
- Check `src/services/mappers.js` for data transformation logic
- Backend services in `Elderlynk.Services/` folder

---

**Ready to develop!** 🎉
