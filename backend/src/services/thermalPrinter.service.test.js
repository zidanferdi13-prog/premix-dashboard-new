const test = require('node:test')
const assert = require('node:assert/strict')

const {
  buildEscPosPayload,
  buildWindowsRawPrintScript,
  printReceiptHtml,
  writeToWindowsPrinter
} = require('./thermalPrinter.service')

test('buildWindowsRawPrintScript contains RAW winspool calls', () => {
  const script = buildWindowsRawPrintScript()

  assert.match(script, /OpenPrinter/)
  assert.match(script, /StartDocPrinter/)
  assert.match(script, /WritePrinter/)
  assert.match(script, /RAW/)
})

test('writeToWindowsPrinter debug mode does not require hardware', async () => {
  const payload = buildEscPosPayload('TEST RECEIPT')

  await writeToWindowsPrinter(payload, 'POS104', true)
})

test('printReceiptHtml defaults to windows mode and supports debug without opening serial port', async () => {
  const oldMode = process.env.PRINTER_MODE
  const oldName = process.env.PRINTER_NAME
  const oldDebug = process.env.PRINTER_DEBUG

  process.env.PRINTER_MODE = 'windows'
  process.env.PRINTER_NAME = 'POS104'
  process.env.PRINTER_DEBUG = 'true'

  try {
    await printReceiptHtml('<html><body><div>TEST</div></body></html>')
  } finally {
    if (oldMode === undefined) delete process.env.PRINTER_MODE
    else process.env.PRINTER_MODE = oldMode

    if (oldName === undefined) delete process.env.PRINTER_NAME
    else process.env.PRINTER_NAME = oldName

    if (oldDebug === undefined) delete process.env.PRINTER_DEBUG
    else process.env.PRINTER_DEBUG = oldDebug
  }
})
