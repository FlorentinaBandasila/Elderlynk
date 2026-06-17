-- ============================================================================
-- Creates the missing Recomandari (activity recommendations) table.
-- The Recommendation entity maps to this table, but it was absent from the
-- database (only Recomandari_Medicale existed), causing 500s on the
-- /recommendations endpoints. Additive and safe; guarded by IF NOT EXISTS.
-- ============================================================================

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Recomandari')
BEGIN
    CREATE TABLE dbo.Recomandari (
        ID_Recomandare        INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        ID_Pacient            INT NULL,
        ID_Medic              INT NULL,
        Tip_Activitate        NVARCHAR(50) NULL,
        Durata_Zilnica_Minute INT NULL,
        Descriere             NVARCHAR(MAX) NULL,
        Data_Start            DATE NULL,
        Data_Stop             DATE NULL
    );
END
GO
