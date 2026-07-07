const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawn } = require('child_process')
const { SerialPort } = require('serialport')
const { extractReceiptLines } = require('./receiptHtml.service')

function wrapLine(line, columns) {
  const chunks = []
  let remaining = line

  while (remaining.length > columns) {
    chunks.push(remaining.slice(0, columns))
    remaining = remaining.slice(columns)
  }

  if (remaining.length) chunks.push(remaining)
  return chunks
}

function buildReceiptText(lines, columns = 32) {
  return lines
    .flatMap((line) => wrapLine(line, columns))
    .join('\n')
}

function buildEscPosPayload(receiptText) {
  return Buffer.concat([
    Buffer.from([0x1b, 0x40]),
    Buffer.from(receiptText, 'ascii'),
    Buffer.from('\n\n\n', 'ascii'),
    Buffer.from([0x1d, 0x56, 0x00])
  ])
}

function safeUnlink(filePath) {
  try {
    if (filePath) fs.unlinkSync(filePath)
  } catch (error) {}
}

function buildWindowsRawPrintScript() {
  return `param(
  [Parameter(Mandatory = $true)][string]$PrinterName,
  [Parameter(Mandatory = $true)][string]$PayloadPath
)

$ErrorActionPreference = 'Stop'

Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;

public class RawPrinterHelper
{
  [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi)]
  public struct DOCINFOA
  {
    [MarshalAs(UnmanagedType.LPStr)] public string pDocName;
    [MarshalAs(UnmanagedType.LPStr)] public string pOutputFile;
    [MarshalAs(UnmanagedType.LPStr)] public string pDataType;
  }

  [DllImport("winspool.drv", SetLastError = true, CharSet = CharSet.Ansi)]
  public static extern bool OpenPrinter(string pPrinterName, out IntPtr phPrinter, IntPtr pDefault);

  [DllImport("winspool.drv", SetLastError = true)]
  public static extern bool ClosePrinter(IntPtr hPrinter);

  [DllImport("winspool.drv", SetLastError = true, CharSet = CharSet.Ansi)]
  public static extern bool StartDocPrinter(IntPtr hPrinter, Int32 level, ref DOCINFOA di);

  [DllImport("winspool.drv", SetLastError = true)]
  public static extern bool EndDocPrinter(IntPtr hPrinter);

  [DllImport("winspool.drv", SetLastError = true)]
  public static extern bool StartPagePrinter(IntPtr hPrinter);

  [DllImport("winspool.drv", SetLastError = true)]
  public static extern bool EndPagePrinter(IntPtr hPrinter);

  [DllImport("winspool.drv", SetLastError = true)]
  public static extern bool WritePrinter(IntPtr hPrinter, byte[] pBytes, Int32 dwCount, out Int32 dwWritten);
}
"@

$bytes = [System.IO.File]::ReadAllBytes($PayloadPath)
$hPrinter = [IntPtr]::Zero

if (-not [RawPrinterHelper]::OpenPrinter($PrinterName, [ref]$hPrinter, [IntPtr]::Zero)) {
  $err = [Runtime.InteropServices.Marshal]::GetLastWin32Error()
  throw "OpenPrinter failed for '$PrinterName' (Win32 error $err)"
}

try {
  $docInfo = New-Object RawPrinterHelper+DOCINFOA
  $docInfo.pDocName = 'Premix Receipt'
  $docInfo.pOutputFile = $null
  $docInfo.pDataType = 'RAW'

  if (-not [RawPrinterHelper]::StartDocPrinter($hPrinter, 1, [ref]$docInfo)) {
    $err = [Runtime.InteropServices.Marshal]::GetLastWin32Error()
    throw "StartDocPrinter failed for '$PrinterName' (Win32 error $err)"
  }

  try {
    if (-not [RawPrinterHelper]::StartPagePrinter($hPrinter)) {
      $err = [Runtime.InteropServices.Marshal]::GetLastWin32Error()
      throw "StartPagePrinter failed for '$PrinterName' (Win32 error $err)"
    }

    try {
      [int]$written = 0
      if (-not [RawPrinterHelper]::WritePrinter($hPrinter, $bytes, $bytes.Length, [ref]$written)) {
        $err = [Runtime.InteropServices.Marshal]::GetLastWin32Error()
        throw "WritePrinter failed for '$PrinterName' (Win32 error $err)"
      }

      if ($written -ne $bytes.Length) {
        throw "WritePrinter wrote $written of $($bytes.Length) bytes"
      }
    } finally {
      [void][RawPrinterHelper]::EndPagePrinter($hPrinter)
    }
  } finally {
    [void][RawPrinterHelper]::EndDocPrinter($hPrinter)
  }
} finally {
  [void][RawPrinterHelper]::ClosePrinter($hPrinter)
}

Write-Output "OK wrote $($bytes.Length) bytes to $PrinterName"
`
}

function writeToWindowsPrinter(payload, printerName, isDebugMode = false) {
  return new Promise((resolve, reject) => {
    if (isDebugMode) {
      console.log(`[PRINTER_WINDOWS_DEBUG] Would send ${payload.length} bytes to ${printerName}`)
      return resolve()
    }

    if (process.platform !== 'win32') {
      return reject(new Error('Windows printer mode requires Windows'))
    }

    const tempDir = os.tmpdir()
    const baseName = `premix-receipt-${process.pid}-${Date.now()}`
    const payloadPath = path.join(tempDir, `${baseName}.bin`)
    const scriptPath = path.join(tempDir, `${baseName}.ps1`)

    try {
      fs.writeFileSync(payloadPath, payload)
      fs.writeFileSync(scriptPath, buildWindowsRawPrintScript(), 'utf8')
    } catch (error) {
      safeUnlink(payloadPath)
      safeUnlink(scriptPath)
      return reject(error)
    }

    const child = spawn('powershell.exe', [
      '-NoProfile',
      '-ExecutionPolicy',
      'Bypass',
      '-File',
      scriptPath,
      '-PrinterName',
      printerName,
      '-PayloadPath',
      payloadPath
    ], {
      windowsHide: true
    })

    let stdout = ''
    let stderr = ''

    const timeout = setTimeout(() => {
      child.kill()
      safeUnlink(payloadPath)
      safeUnlink(scriptPath)
      reject(new Error(`Windows printer timeout for ${printerName}`))
    }, 15000)

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString()
    })

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })

    child.on('error', (error) => {
      clearTimeout(timeout)
      safeUnlink(payloadPath)
      safeUnlink(scriptPath)
      reject(error)
    })

    child.on('close', (code) => {
      clearTimeout(timeout)
      safeUnlink(payloadPath)
      safeUnlink(scriptPath)

      if (code !== 0) {
        const message = (stderr || stdout || `PowerShell exited with code ${code}`).trim()
        console.error('[PRINTER_WINDOWS_ERROR]', message)
        return reject(new Error(message))
      }

      console.log('[PRINTER_WINDOWS_SEND] Sent payload successfully')
      if (stdout.trim()) console.log('[PRINTER_WINDOWS_OUTPUT]', stdout.trim())
      resolve()
    })
  })
}

function writeToSerialPort(payload, printerPort, baudRate, isDebugMode = false, retryCount = 0) {
  return new Promise((resolve, reject) => {
    if (isDebugMode) {
      console.log(`[PRINTER_DEBUG] Would send ${payload.length} bytes to ${printerPort}`)
      return resolve()
    }

    let isPortClosed = false

    const port = new SerialPort({
      path: printerPort,
      baudRate,
      autoOpen: false,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      flowControl: false,
      rtscts: false
    })

    port.on('error', (err) => {
      console.error('[PRINTER_PORT_ERROR]', err.message)
      if (!isPortClosed) {
        isPortClosed = true
        port.removeAllListeners()
        try {
          port.close()
        } catch (e) {}
      }
      reject(err)
    })

    const openTimeout = setTimeout(() => {
      console.error('[PRINTER_TIMEOUT] Port open timeout')
      if (!isPortClosed) {
        isPortClosed = true
        port.removeAllListeners()
        try {
          port.close()
        } catch (e) {}
      }
      reject(new Error('Port open timeout'))
    }, 5000)

    port.open((openError) => {
      clearTimeout(openTimeout)

      if (openError) {
        isPortClosed = true
        console.error('[PRINTER_OPEN_ERROR]', openError.message)

        if (retryCount < 2 && openError.message && openError.message.includes('GetCommState')) {
          console.log(`[PRINTER_RETRY] Attempt ${retryCount + 1} failed, retrying in 2s...`)
          setTimeout(() => {
            writeToSerialPort(payload, printerPort, baudRate, isDebugMode, retryCount + 1)
              .then(resolve)
              .catch(reject)
          }, 2000)
          return
        }

        return reject(openError)
      }

      port.write(payload, (writeError) => {
        if (writeError) {
          isPortClosed = true
          console.error('[PRINTER_WRITE_ERROR]', writeError.message)
          port.close()
          return reject(writeError)
        }

        console.log('[PRINTER_SEND] Sent payload successfully')

        port.drain((drainError) => {
          if (!isPortClosed) {
            isPortClosed = true
            port.close((closeError) => {
              if (drainError) reject(drainError)
              else if (closeError) reject(closeError)
              else resolve()
            })
          }
        })
      })
    })
  })
}

async function printReceiptHtml(html, options = {}) {
  const mode = String(options.mode || process.env.PRINTER_MODE || 'windows').toLowerCase()
  const printerName = options.printerName || process.env.PRINTER_NAME || 'POS104'
  const printerPort = options.printerPort || process.env.PRINTER_PORT || 'COM5'
  const baudRate = Number(options.baudRate || process.env.PRINTER_BAUD_RATE || 9600)
  const columns = Number(options.columns || process.env.RECEIPT_COLUMNS || 32)
  const isDebugMode = options.debug || process.env.PRINTER_DEBUG === 'true'

  console.log('[PRINTER_SERVICE] Print request', {
    mode,
    port: printerPort,
    printerName,
    baudRate,
    columns,
    debugMode: isDebugMode
  })

  const lines = extractReceiptLines(html)
  const receiptText = buildReceiptText(lines, columns)
  const payload = buildEscPosPayload(receiptText)

  console.log('[PRINTER_SERVICE] Receipt text lines:', lines.length)
  console.log('[PRINTER_SERVICE] Payload size:', payload.length, 'bytes')

  if (mode === 'windows') {
    await writeToWindowsPrinter(payload, printerName, isDebugMode)
    return
  }

  if (mode === 'serial') {
    await writeToSerialPort(payload, printerPort, baudRate, isDebugMode)
    return
  }

  throw new Error(`Unsupported printer mode: ${mode}`)
}

module.exports = {
  buildReceiptText,
  buildEscPosPayload,
  buildWindowsRawPrintScript,
  printReceiptHtml,
  writeToWindowsPrinter
}
