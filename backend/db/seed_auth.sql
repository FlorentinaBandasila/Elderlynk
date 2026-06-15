/* ============================================================================
   CareLink / Elderlynk – Authentication seed script
   ----------------------------------------------------------------------------
   Creates the role lookup values and one account per role so you can log in
   immediately after wiring up JWT auth.

   Schema note: a staff account's role is stored directly on Utilizatori.ID_Rol
   (FK -> Roluri.ID_Rol). Patients authenticate against Pacienti.

   Passwords (BCrypt-hashed below – never store plaintext):
     admin@carelink.local      / Admin123!     (ID_Rol 1 – Admin)
     medic@carelink.local      / Medic123!     (ID_Rol 2 – Medic)
     pacient@carelink.local    / Pacient123!   (Pacienti – Pacient)

   Run it once against the sqldb-cardio database (SSMS / Azure Data Studio).
   It is safe to re-run: every insert is guarded by an existence check.
   ============================================================================ */

SET NOCOUNT ON;

/* ---------- 1) Roluri lookup (fixed ids 1..4) ------------------------------ */
/* If Roluri.ID_Rol is an IDENTITY column, uncomment the IDENTITY_INSERT lines. */
-- SET IDENTITY_INSERT dbo.Roluri ON;
IF NOT EXISTS (SELECT 1 FROM dbo.Roluri WHERE ID_Rol = 1)
    INSERT INTO dbo.Roluri (ID_Rol, Nume_Rol) VALUES (1, N'Admin');
IF NOT EXISTS (SELECT 1 FROM dbo.Roluri WHERE ID_Rol = 2)
    INSERT INTO dbo.Roluri (ID_Rol, Nume_Rol) VALUES (2, N'Medic');
IF NOT EXISTS (SELECT 1 FROM dbo.Roluri WHERE ID_Rol = 3)
    INSERT INTO dbo.Roluri (ID_Rol, Nume_Rol) VALUES (3, N'Supraveghetor');
IF NOT EXISTS (SELECT 1 FROM dbo.Roluri WHERE ID_Rol = 4)
    INSERT INTO dbo.Roluri (ID_Rol, Nume_Rol) VALUES (4, N'Pacient');
-- SET IDENTITY_INSERT dbo.Roluri OFF;

/* ---------- 2) Admin (Utilizatori, ID_Rol = 1) ----------------------------- */
IF NOT EXISTS (SELECT 1 FROM dbo.Utilizatori WHERE Email = N'admin@carelink.local')
    INSERT INTO dbo.Utilizatori (ID_Rol, Email, Parola_Hash, Nume, Prenume, Telefon, Data_Creare, Activ)
    VALUES (1, N'admin@carelink.local',
            N'$2a$11$T6bvCuzaHotmDzjvJ3qnBuAFeeLlAEzyXd6INlxtfdO7n3gmsNX7q', -- Admin123!
            N'Admin', N'CareLink', NULL, SYSDATETIMEOFFSET(), 1);

/* ---------- 3) Medic (Utilizatori, ID_Rol = 2) ----------------------------- */
IF NOT EXISTS (SELECT 1 FROM dbo.Utilizatori WHERE Email = N'medic@carelink.local')
    INSERT INTO dbo.Utilizatori (ID_Rol, Email, Parola_Hash, Nume, Prenume, Telefon, Data_Creare, Activ)
    VALUES (2, N'medic@carelink.local',
            N'$2a$11$VsBv1DMItvk/yfdyY.HjXev20u/SNy/8a3R3ZlvrBBHJs66abkndy', -- Medic123!
            N'Ionescu', N'Maria', NULL, SYSDATETIMEOFFSET(), 1);

/* ---------- 4) Patient (Pacienti) ------------------------------------------ */
/* Patients authenticate against Pacienti (Email + Parola_Hash). */
IF NOT EXISTS (SELECT 1 FROM dbo.Pacienti WHERE Email = N'pacient@carelink.local')
    INSERT INTO dbo.Pacienti (Nume, Prenume, CNP, Email, Parola_Hash, Activ, Data_Adaugare)
    VALUES (N'Popescu', N'Andrei',
            N'1900101221144',
            N'pacient@carelink.local',
            N'$2a$11$NWF9VQ9diBFzc86Vw1I68uH03uji8SBMT8OYmiczoboKdwo90HU5y', -- Pacient123!
            1, SYSDATETIME());

SET NOCOUNT OFF;

/* Verify */
SELECT u.ID_Utilizator, u.Email, u.ID_Rol, r.Nume_Rol
FROM dbo.Utilizatori u
LEFT JOIN dbo.Roluri r ON r.ID_Rol = u.ID_Rol
WHERE u.Email IN (N'admin@carelink.local', N'medic@carelink.local');
SELECT ID_Pacient, Email FROM dbo.Pacienti WHERE Email = N'pacient@carelink.local';
