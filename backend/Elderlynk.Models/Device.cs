using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Elderlynk.Models
{
    [Table("Dispozitive_ESP32")]
    public class Device
    {
        [Key]
        [Column("ID_Dispozitiv")]
        public int DeviceId { get; set; }

        [Column("ID_Pacient")]
        public int? PatientId { get; set; }

        [Column("MAC_Address_BT")]
        [MaxLength(17)]
        public string? BluetoothMacAddress { get; set; }

        [Column("Data_Instalare")]
        public DateTime? InstallationDate { get; set; }

        [Column("Versiune_Firmware")]
        [MaxLength(20)]
        public string? FirmwareVersion { get; set; }
    }
}
