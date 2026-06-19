# Backend Express Node.js

## Jalankan

1. Copy `.env.example` ke `.env`.
2. Install dependency:
   - `npm install`
3. Run dev mode:
   - `npm run dev`

## Endpoint awal (Express)

- `GET /health`
- `GET /api`
- `POST /print`

## Print struk POS 58mm

### Current Status
- ✅ Backend API endpoint ready (`POST /print`)
- ✅ HTML receipt extraction service ready
- ✅ 58mm thermal printer formatting ready
- ⚠️  Hardware connection needs setup (see PRINTER_SETUP.md)

### Quick Start

#### Development Mode (Testing tanpa printer)
```powershell
# .env sudah terconfig debug mode
npm run dev
```

Endpoint akan simulate print tanpa hardware:
```
[PRINTER_DEBUG] Would send 28 bytes to COM9
```

#### Test endpoint
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:3002/print" `
  -Method Post `
  -ContentType "text/html" `
  -UseBasicParsing `
  -Body "<html><body><div>TEST</div></body></html>"

$response.Content | ConvertFrom-Json
```

Success response:
```json
{"ok": true, "message": "Print job sent"}
```

### Hardware Setup

Untuk production dengan printer nyata:

1. **Baca** [PRINTER_SETUP.md](./PRINTER_SETUP.md) untuk troubleshooting
2. **Pastikan printer** ON dan terhubung ke COM9
3. **Update .env**
   ```env
   PRINTER_DEBUG=false
   PRINTER_PORT=COM9
   PRINTER_BAUD_RATE=9600
   ```
4. **Jalankan**
   ```powershell
   npm run dev
   ```

### Konfigurasi Environment

```env
PORT=3002                    # Backend port
HOST=0.0.0.0               # Server host
PRINTER_PORT=COM9          # Serial port (COM9 untuk POS-58)
PRINTER_BAUD_RATE=9600     # Standar thermal printer
RECEIPT_COLUMNS=32         # 58mm paper (~32 chars)
PRINTER_DEBUG=true         # true = simulate, false = actual print
```

### Test API

```powershell
# Test health
curl http://localhost:3002/health

# Test routes
curl http://localhost:3002/api

# Test print (dengan HTML)
$html = @"
<html><body>
  <div>****STRUK****</div>
  <div>MO-0001</div>
  <div>TOTAL: Rp 50.000</div>
</body></html>
"@

Invoke-WebRequest -Uri "http://localhost:3002/print" `
  -Method Post `
  -ContentType "text/html" `
  -UseBasicParsing `
  -Body $html
```

### Run tests

```powershell
npm test
```
