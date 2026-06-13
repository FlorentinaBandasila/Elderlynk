namespace Elderlynk.Models
{
    public class CreateDeviceDto
    {
        public int? PatientId { get; set; }
        public string? BluetoothMacAddress { get; set; }
        public DateTime? InstallationDate { get; set; }
        public string? FirmwareVersion { get; set; }
    }
}
