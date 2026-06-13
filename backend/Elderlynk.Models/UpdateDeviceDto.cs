namespace Elderlynk.Models
{
    public class UpdateDeviceDto
    {
        public int? PatientId { get; set; }
        public string? BluetoothMacAddress { get; set; }
        public DateTime? InstallationDate { get; set; }
        public string? FirmwareVersion { get; set; }
    }
}
