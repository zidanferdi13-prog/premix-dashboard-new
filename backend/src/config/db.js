const mysql = require('mysql2/promise')
const config = require('../config/env')

const pool = mysql.createPool(config.db)

pool.getConnection()
  .then((conn) => {
    console.log('[DB] MySQL connected')
    conn.release()
  })
  .catch((err) => {
    console.error('[DB] MySQL connection failed:', err.message)
  })

module.exports = pool
