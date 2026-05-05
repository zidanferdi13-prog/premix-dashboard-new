const express = require('express')
const cors = require('cors')
const config = require('./config/env')
const { registerRoutes } = require('./routes')

const app = express()

app.use(cors())
app.use(express.json())

registerRoutes(app, config)

app.use((req, res) => {
  return res.status(404).json({
    ok: false,
    message: 'Route not found',
    path: req.path
  })
})

app.use((error, req, res, next) => {
  console.error('[SERVER_ERROR]', error)
  return res.status(500).json({
    ok: false,
    message: 'Internal server error'
  })
})

app.listen(config.port, config.host, () => {
  console.log(`[premix-backend-express] running at http://${config.host}:${config.port}`)
})
