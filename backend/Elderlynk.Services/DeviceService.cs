using Elderlynk.Models;
using Microsoft.EntityFrameworkCore;

namespace Elderlynk.Services
{
    public class DeviceService : IDeviceService
    {
        private readonly DbContext _context;

        public DeviceService(DbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<DeviceResponseDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var devices = await _context.Set<Device>()
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            return devices.Select(d => new DeviceResponseDto
            {
                DeviceId = d.DeviceId,
                PatientId = d.PatientId,
                BluetoothMacAddress = d.BluetoothMacAddress,
                InstallationDate = d.InstallationDate,
                FirmwareVersion = d.FirmwareVersion
            });
        }

        public async Task<DeviceResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var device = await _context.Set<Device>()
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.DeviceId == id, cancellationToken);

            if (device == null)
                return null;

            return new DeviceResponseDto
            {
                DeviceId = device.DeviceId,
                PatientId = device.PatientId,
                BluetoothMacAddress = device.BluetoothMacAddress,
                InstallationDate = device.InstallationDate,
                FirmwareVersion = device.FirmwareVersion
            };
        }

        public async Task<DeviceResponseDto> CreateAsync(CreateDeviceDto dto, CancellationToken cancellationToken = default)
        {
            var device = new Device
            {
                PatientId = dto.PatientId,
                BluetoothMacAddress = dto.BluetoothMacAddress,
                InstallationDate = dto.InstallationDate ?? DateTime.Now,
                FirmwareVersion = dto.FirmwareVersion
            };

            _context.Set<Device>().Add(device);
            await _context.SaveChangesAsync(cancellationToken);

            return new DeviceResponseDto
            {
                DeviceId = device.DeviceId,
                PatientId = device.PatientId,
                BluetoothMacAddress = device.BluetoothMacAddress,
                InstallationDate = device.InstallationDate,
                FirmwareVersion = device.FirmwareVersion
            };
        }

        public async Task UpdateAsync(int id, UpdateDeviceDto dto, CancellationToken cancellationToken = default)
        {
            var device = await _context.Set<Device>()
                .FirstOrDefaultAsync(d => d.DeviceId == id, cancellationToken);

            if (device == null)
                throw new KeyNotFoundException($"Device with ID {id} not found.");

            if (dto.PatientId.HasValue)
                device.PatientId = dto.PatientId;
            if (dto.BluetoothMacAddress != null)
                device.BluetoothMacAddress = dto.BluetoothMacAddress;
            if (dto.InstallationDate.HasValue)
                device.InstallationDate = dto.InstallationDate;
            if (dto.FirmwareVersion != null)
                device.FirmwareVersion = dto.FirmwareVersion;

            _context.Set<Device>().Update(device);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var device = await _context.Set<Device>()
                .FirstOrDefaultAsync(d => d.DeviceId == id, cancellationToken);

            if (device == null)
                throw new KeyNotFoundException($"Device with ID {id} not found.");

            _context.Set<Device>().Remove(device);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
