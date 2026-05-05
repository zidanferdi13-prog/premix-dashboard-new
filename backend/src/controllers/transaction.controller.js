const {
  insertTransaction,
  getTransactions
} = require('../services/transaction.service')

async function addTransactionPlantController(req, res) {
  const payload = req.body

  if (!payload || (Array.isArray(payload) && payload.length === 0)) {
    return res.status(400).json({
      ok: false,
      message: 'Payload transaksi kosong'
    })
  }

  try {
    const inserted = await insertTransaction(payload)
    console.log('[ADD_TRANSACTION_PLANT]', { total: inserted.length, sample: inserted[0] })
    return res.status(201).json({
      ok: true,
      message: 'Transaksi berhasil disimpan',
      total: inserted.length,
      data: inserted
    })
  } catch (err) {
    console.error('[ADD_TRANSACTION_PLANT_ERROR]', err)
    return res.status(500).json({ ok: false, message: 'Gagal menyimpan transaksi' })
  }
}

async function listTransactionPlantController(req, res) {
  try {
    const rows = await getTransactions()
    return res.status(200).json({ ok: true, total: rows.length, data: rows })
  } catch (err) {
    console.error('[LIST_TRANSACTION_ERROR]', err)
    return res.status(500).json({ ok: false, message: 'Gagal mengambil data transaksi' })
  }
}

module.exports = {
  addTransactionPlantController,
  listTransactionPlantController
}
