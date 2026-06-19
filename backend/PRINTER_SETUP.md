# POS 58mm Printer Setup COM9

## Konfigurasi `.env`

```env
PRINTER_PORT=COM9
PRINTER_BAUD_RATE=9600
RECEIPT_COLUMNS=32
PRINTER_DEBUG=false
```

## Troubleshooting GetCommState Error 1

### Gejala
```
[PRINTER_OPEN_ERROR] Open (GetCommState): Unknown error code 1
```

### Solusi

#### 1. Pastikan Printer ON dan Connected
- Centang bahwa printer 58mm sudah **ON**
- Kabel USB/Serial **terhubung dengan benar** ke komputer
- Printer memiliki power dan sudah siap

#### 2. Verifikasi COM9 di Device Manager
1. Buka `Device Manager` (devmgmt.msc)
2. Buka `Ports (COM & LPT)`
3. Cari **COM9 - Serial Port** atau **POS-58**
4. Jika ada **warning/error**, klik kanan → **Update Driver**

#### 3. Periksakan Port Availability
Jalankan di PowerShell:
```powershell
[System.IO.Ports.SerialPort]::GetPortNames()
```
Pastikan `COM9` ada di list.

#### 4. Stop Print Spooler (jika konflik)
```powershell
Stop-Service -Name Spooler -Force
```

#### 5. Testing Mode - Enable Debug
Gunakan debug mode untuk development/testing:
```env
PRINTER_DEBUG=true
```

Dengan mode ini, printer akan simulate tanpa actually send ke hardware.

#### 6. Check Baud Rate
Standar printer thermal adalah **9600 baud**. Verifikasi:
- Di Device Manager, Properties COM9
- Check baud rate setting di printer

#### 7. Reinstall/Update Driver
- Di Device Manager, klik kanan COM9
- **Uninstall device**
- **Scan for hardware changes** (printer harus ON dan connected)
- Update driver jika perlu

## Testing

### Test dengan Debug Mode
```bash
$env:PRINTER_DEBUG='true'
npm run dev
```

Response akan:
```
[PRINTER_DEBUG] Would send 37 bytes to COM9
```

### Test dengan Hardware Aktual
```bash
$env:PRINTER_DEBUG='false'
npm run dev
```

Kirim POST request:
```powershell
Invoke-WebRequest -Uri "http://localhost:3002/print" `
  -Method Post `
  -ContentType "text/html" `
  -UseBasicParsing `
  -Body "<html><body><div>TEST</div></body></html>"
```

Response sukses:
```json
{"ok": true, "message": "Print job sent"}
```

## Jika Masih Error

1. **Check printer compatibility** - Pastikan printer mendukung ESC/POS protocol
2. **Try different COM port** - Jika printer listed di port lain, update `.env`
3. **Check USB driver** - Download latest driver dari manufacturer
4. **Hardware issue** - Test printer dengan software lain (Pos58Manager, ZebraDesigner, dll)
5. **Ask support** - Hubungi manufacturer printer untuk Windows 11 COM port issue

## Reference

- Printer Model: POS-58 11.3.0.1 (dari screenshot)
- Protocol: ESC/POS
- Port: COM9 (Serial)
- Baud Rate: 9600
- Paper Width: 58mm (~32 characters)
