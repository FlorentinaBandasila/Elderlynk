-- ============================================================================
-- Annex 3 alarm-rule columns for Senzori_Configurare
-- Adds the persistence-duration and post-activity-grace conditions used by the
-- alarm evaluation service. Safe to run multiple times (guarded by IF NOT EXISTS).
-- ============================================================================

IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('dbo.Senzori_Configurare') AND name = 'Durata_Persistenta_Sec'
)
BEGIN
    ALTER TABLE dbo.Senzori_Configurare ADD Durata_Persistenta_Sec INT NULL;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('dbo.Senzori_Configurare') AND name = 'Intarziere_Post_Activitate_Sec'
)
BEGIN
    ALTER TABLE dbo.Senzori_Configurare ADD Intarziere_Post_Activitate_Sec INT NULL;
END
GO
