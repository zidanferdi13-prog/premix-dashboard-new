const path = require('path')
const fs = require('fs')

function loadDotEnv() {
  const envPath = path.resolve(process.cwd(), '.env')
  if (!fs.existsSync(envPath)) return

  const lines = fs.readFileSync(envPath, 'utf-8').split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const eqIndex = trimmed.indexOf('=')
    if (eqIndex < 0) continue

    const key = trimmed.slice(0, eqIndex).trim()
    const value = trimmed.slice(eqIndex + 1).trim()

    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

loadDotEnv()

const config = {
  port: Number(process.env.PORT || 3001),
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host:       process.env.DB_HOST     || 'localhost',
    port:       Number(process.env.DB_PORT || 3306),
    user:       process.env.DB_USER     || 'root',
    password:   process.env.DB_PASSWORD || '',
    database:   process.env.DB_NAME     || 'amanerve',
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_POOL_LIMIT || 10),
    queueLimit: 0
  }
}

module.exports = config
