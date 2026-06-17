namespace Elderlynk.Models
{
    /// <summary>A labelled value, used for chart series in reports.</summary>
    public class ReportPoint
    {
        public string Label { get; set; } = "";
        public decimal Value { get; set; }
    }

    /// <summary>
    /// Aggregate statistics for the reporting dashboard, scoped to the data the
    /// requesting user is allowed to see.
    /// </summary>
    public class ReportOverviewDto
    {
        public int TotalPatients { get; set; }
        public int ActiveAlarms { get; set; }
        public int ResolvedAlarms { get; set; }
        public int TotalConsultations { get; set; }
        public int TotalMeasurements { get; set; }

        public List<ReportPoint> AlarmsByType { get; set; } = new();
        public List<ReportPoint> AlarmsByMonth { get; set; } = new();
        public List<ReportPoint> ConsultationsByMonth { get; set; } = new();
        public List<ReportPoint> TopDiagnoses { get; set; } = new();
        public List<ReportPoint> AvgMeasurementBySensorType { get; set; } = new();
    }
}
