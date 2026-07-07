const { printReceiptHtml } = require('../services/thermalPrinter.service')

async function printController(req, res, deps = {}) {
  console.log('[PRINT_CONTROLLER] Received print request')
  const print = deps.printReceiptHtml || printReceiptHtml
  const html = typeof req.body === 'string' ? req.body.trim() : ''

  if (!html) {
    return res.status(400).json({
      ok: false,
      message: 'HTML receipt body is required'
    })
  }

  try {
    await print(html)
    return res.status(200).json({
      ok: true,
      message: 'Print job sent'
    })
  } catch (error) {
    console.error('[PRINT_ERROR]', error.message || error)
    console.error('[PRINT_ERROR_DETAILS]', {
      code: error.code,
      errno: error.errno,
      syscall: error.syscall,
      printerPort: process.env.PRINTER_PORT
    })

    const printerName = process.env.PRINTER_NAME || 'POS104'
    const printerPort = process.env.PRINTER_PORT || 'COM5'
    let message = 'Failed to print receipt'

    if (error.message?.includes('OpenPrinter failed')) {
      message = `Windows printer ${printerName} not found or unavailable. Check printer name and Print Spooler.`
    } else if (error.message?.includes('StartDocPrinter') || error.message?.includes('WritePrinter')) {
      message = `Windows printer ${printerName} failed to receive RAW print job. Check printer queue and driver.`
    } else if (error.message?.includes('Windows printer timeout')) {
      message = `Windows printer ${printerName} timeout. Check printer queue and Print Spooler.`
    } else if (error.message?.includes('Windows printer mode requires Windows')) {
      message = 'Windows printer mode requires running backend on Windows.'
    } else if (error.message?.includes('Unsupported printer mode')) {
      message = error.message
    } else if (error.message && error.message.includes('GetCommState')) {
      message = `COM port error: ${printerPort} may be in use or disconnected. Check printer connection.`
    } else if (error.code === 'ERR_OPENING_NON_EXISTENT_SERIAL_PORT' || error.errno === 1 || error.message?.includes('ENOENT')) {
      message = `Printer port ${printerPort} not found. Enable debug mode: PRINTER_DEBUG=true`
    } else if (error.message?.includes('timeout')) {
      message = `Printer port timeout. Check if ${printerPort} is accessible.`
    }

    return res.status(500).json({
      ok: false,
      message,
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

module.exports = { printController }
