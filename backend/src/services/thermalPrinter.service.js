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

    // Error handler
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
        
        // Retry jika error GetCommState
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
  const printerPort = options.printerPort || process.env.PRINTER_PORT || 'COM9'
  const baudRate = Number(options.baudRate || process.env.PRINTER_BAUD_RATE || 9600)
  const columns = Number(options.columns || process.env.RECEIPT_COLUMNS || 32)
  const isDebugMode = options.debug || process.env.PRINTER_DEBUG === 'true'

  console.log('[PRINTER_SERVICE] Print request', {
    port: printerPort,
    baudRate,
    columns,
    debugMode: isDebugMode
  })

  const lines = extractReceiptLines(html)
  const receiptText = buildReceiptText(lines, columns)
  const payload = buildEscPosPayload(receiptText)

  console.log('[PRINTER_SERVICE] Receipt text lines:', lines.length)
  console.log('[PRINTER_SERVICE] Payload size:', payload.length, 'bytes')

  await writeToSerialPort(payload, printerPort, baudRate, isDebugMode)
}

module.exports = {
  buildReceiptText,
  buildEscPosPayload,
  printReceiptHtml
}
