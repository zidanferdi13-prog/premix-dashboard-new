const pool = require('../config/db')

async function insertTransaction(payload) {
  const items = Array.isArray(payload) ? payload : [payload]
  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()

    const inserted = []
    for (const item of items) {
      const [result] = await conn.execute(
        `INSERT INTO premix_temp_detail_transaction
              (transaction_id, premix_temp_detail_id, t_mo_id, product_nrm, qty, sequence, createdate, isactive)
            VALUES (UUID(), ?, ?, ?, ?, ?, NOW(), 1)`,
        [item.premix_temp_detail_id, item.t_mo_id, item.product_nrm, item.qty, item.sequence ?? 0]
      )
      inserted.push({ insertId: result.insertId, ...item })
    }
    await conn.commit()
    return inserted
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}

async function getTransactions() {
  // ── Tulis query SELECT kamu di sini ────────────────────────────
  // Contoh:
  // const [rows] = await pool.execute(
  //   `SELECT * FROM t_transaction_plant ORDER BY created_at DESC`
  // )
  // return rows
  // ─────────────────────────────────────────────────────────────

  return [] // placeholder
}

module.exports = {
  insertTransaction,
  getTransactions
}

