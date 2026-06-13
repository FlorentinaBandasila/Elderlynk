namespace Elderlynk.Models
{
    public class DeviceResponseDto
    {
        public int DeviceId { get; set; }
        public int? PatientId { get; set; }
        public string? BluetoothMacAddress { get; set; }
        public DateTime? InstallationDate { get; set; }
        public string? FirmwareVersion { get; set; }
    }
}
