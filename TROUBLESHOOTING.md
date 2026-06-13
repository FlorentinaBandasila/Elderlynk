# Troubleshooting Guide - 500 Errors Fix

## Problem: Getting 500 Internal Server Error on API Calls

### Root Cause
The backend was configured to use an Azure SQL Server which may not be available or have incorrect credentials. This causes a database connection error, resulting in 500 errors.

---

## ✅ Solution: Use Local SQL Server

### Step 1: Verify SQL Server Installation

Check if you have LocalDB installed:
```bash
# Open PowerShell and run:
sqllocaldb info mssqllocaldb
```

If you don't have LocalDB, install **SQL Server Express** from Microsoft.

### Step 2: Backend Configuration (DONE)
The `appsettings.json` has been updated to use local database:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=ElderlynkDb;Trusted_Connection=true;MultipleActiveResultSets=true;"
}
```

### Step 3: Create Database with Migrations

Run these commands in the backend directory:

```bash
cd backend

# Create database and apply migrations
dotnet ef database update

# Expected output:
# Build started...
# Build succeeded.
# Done. Successful database update.
```

**If you get an error about migrations:**
```bash
# Add a new migration
dotnet ef migrations add InitialCreate

# Then apply it
dotnet ef database update
```

### Step 4: Frontend API URL (DONE)
The frontend API service has been updated to use the correct port:
```javascript
const API_BASE = 'https://localhost:7154/api'
```

---

## Running the Application

### Terminal 1: Start Backend
```bash
cd backend
dotnet run

# You should see:
# Now listening on: https://localhost:7154
# Now listening on: http://localhost:5000
# Application started. Press Ctrl+C to shut down.
```

**Note the port!** If it's different from 7154, update the frontend API URL.

### Terminal 2: Start Frontend
```bash
cd frontend
npm run dev

# You should see:
# ➜  Local:   http://localhost:5173/
```

---

## Testing the Connection

### In Browser DevTools (F12)

1. Open http://localhost:5173
2. Go to **Network** tab
3. Perform an action (e.g., view patients)
4. Look for API calls to `https://localhost:7154/api/...`
5. Check the response status (should be 200, not 500)

### Using cURL

```bash
# Test if API is responding
curl https://localhost:7154/api/patients

# If you get SSL error, use:
curl -k https://localhost:7154/api/patients
```

### Check Backend Logs

The backend console will show detailed error messages:
```
info: Microsoft.EntityFrameworkCore.Database.Command[20101]
      Executed DbCommand (5ms) [Parameters=[], CommandType='Text', CommandText='
      SELECT TOP(1) [p].[ID_Pacient], [p].[CNP], ...']
```

---

## Common Issues & Solutions

### Issue 1: "Cannot connect to database"
**Solution:**
```bash
# Start LocalDB instance
sqllocaldb start mssqllocaldb

# Then run migrations again
dotnet ef database update
```

### Issue 2: "The SSL certificate is invalid"
**Solution:** Add `-k` flag to cURL or use `http://localhost:5000` instead

### Issue 3: "Migrations pending"
**Solution:**
```bash
cd backend
dotnet ef database update
```

### Issue 4: "Database already exists"
**Solution:** Delete the database and recreate it:
```bash
cd backend
dotnet ef database drop
dotnet ef database update
```

### Issue 5: CORS error in browser
**Solution:** The backend CORS is already configured for:
- http://localhost:5173
- https://localhost:5173

If still getting CORS errors, restart both backend and frontend.

### Issue 6: "500 error still appearing"
**Solution:** Check backend console for specific error message:
1. Look at the detailed error in terminal where backend is running
2. It usually shows the actual issue (database, entity mapping, etc.)
3. Share the error message for debugging

---

## Verify Database Setup

### Check if Database Exists
```bash
# In SQL Server Management Studio or:
sqllocaldb info mssqllocaldb

# Connect to LocalDB:
# Server: (localdb)\mssqllocaldb
# Authentication: Windows Authentication
```

### Check Migrations Applied
```bash
cd backend
dotnet ef migrations list

# Should show:
# 20260510000000_InitialCreate (Applied)
```

---

## Network Verification Checklist

- [ ] Backend running on https://localhost:7154
- [ ] Frontend running on http://localhost:5173
- [ ] Database created: ElderlynkDb
- [ ] Migrations applied successfully
- [ ] No CORS errors in browser console
- [ ] API calls returning 200 status codes
- [ ] Data showing in frontend pages

---

## If Still Getting 500 Errors

1. **Stop the backend** (Ctrl+C)
2. **Check the error message** in the terminal
3. **Common causes:**
   - `DbContext not found` → Check DI registration
   - `Column not found` → Run migrations
   - `Connection timeout` → Check database server
   - `Entity mapping issue` → Check AppDbContext configuration

4. **Enable detailed logging:**
   ```json
   // In appsettings.json, set:
   "Logging": {
     "LogLevel": {
       "Default": "Debug",
       "Microsoft.EntityFrameworkCore": "Debug"
     }
   }
   ```

5. **Restart everything:**
   ```bash
   # Terminal 1 (Backend)
   dotnet run
   
   # Terminal 2 (Frontend)
   npm run dev
   ```

---

## Database Port Issues

If you're getting connection refused errors:

### Check Default Port
```bash
sqllocaldb info mssqllocaldb
```

### Use TCP Connection Instead
```json
"DefaultConnection": "Server=localhost,1433;Database=ElderlynkDb;User Id=sa;Password=YourPassword;Encrypt=false;"
```

---

## Reset Everything (Nuclear Option)

If nothing works:

```bash
# Backend
cd backend
dotnet clean
dotnet ef database drop --force
dotnet build
dotnet ef database update

# Frontend
cd frontend
rm -r node_modules
npm install
```

Then restart both servers.

---

## Success Indicators

✅ Backend console shows:
```
Now listening on: https://localhost:7154
Application started.
```

✅ Frontend shows no errors in console (F12)

✅ API calls show in Network tab with 200-201 status

✅ Data displays on pages (Dashboard, Patients, etc.)

✅ Can create/update records successfully

---

## Getting Help

If you're still getting 500 errors:

1. Share the **exact error message** from backend console
2. Confirm database is created: `sqllocaldb info mssqllocaldb`
3. Check **Network tab** in browser DevTools for response body
4. Verify both servers are running on correct ports

The error message in the backend console will tell you exactly what's wrong!
