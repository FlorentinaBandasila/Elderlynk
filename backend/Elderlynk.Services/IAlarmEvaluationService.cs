namespace Elderlynk.Services
{
    public interface IAlarmEvaluationService
    {
        /// <summary>
        /// Evaluates a sensor's most recent readings against its thresholds, applying the
        /// Annex 3 persistence-duration and post-activity-grace conditions. Raises (and
        /// persists) an alarm/warning when the conditions are met.
        /// </summary>
        Task<AlarmEvaluationResult> EvaluateSensorAsync(
            int sensorId, DateTimeOffset? activityStart, CancellationToken cancellationToken = default);
    }
}
