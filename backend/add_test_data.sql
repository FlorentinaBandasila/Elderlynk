-- Insert test user
INSERT INTO Utilizatori (Email, Parola_Hash, Nume, Prenume, Telefon, Data_Creare, Activ)
VALUES ('testuser@example.com', 'hash123', 'Test', 'User', '+40721123456', SYSDATETIMEOFFSET(), 1)

DECLARE @UserId INT = @@IDENTITY

-- Insert test patient
INSERT INTO Pacienti (ID_Utilizator, CNP, Varsta, Adresa_Strada, Adresa_Oras, Adresa_Judet, Profesie, Loc_Munca)
VALUES (@UserId, '1850312167890', 73, '123 Main Street', 'Bucharest', 'Bucharest', 'Retired Teacher', 'N/A')

-- Insert test alarm
DECLARE @PatientId INT = @@IDENTITY

INSERT INTO Alarme_evenimente (ID_Senzor, ID_Pacient, Tip_Alarma, Mesaj, Data_Declansare, Status_Rezolvat)
VALUES (NULL, @PatientId, 'Heart Rate', 'High heart rate detected', SYSDATETIMEOFFSET(), 0)

-- Insert test role
INSERT INTO Roluri (Nume_Rol)
VALUES ('Doctor'), ('Supervisor'), ('Patient')

DECLARE @DoctorRoleId INT = @@IDENTITY - 2

-- Assign doctor role to test user
INSERT INTO Utilizatori_Roluri (ID_Utilizator, ID_Rol)
VALUES (@UserId, @DoctorRoleId)

SELECT 'Test data inserted successfully' AS [Status]
