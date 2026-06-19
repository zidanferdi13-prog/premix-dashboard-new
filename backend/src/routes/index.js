const { healthController } = require('../controllers/health.controller')
const { printController } = require('../controllers/print.controller')
const {
  addTransactionPlantController,
  listTransactionPlantController
} = require('../controllers/transaction.controller')

function registerRoutes(app, config) {
  app.get('/health', (req, res) => healthController(req, res, config))

  app.get('/api', (req, res) => {
    return res.status(200).json({
      ok: true,
      message: 'Backend express aktif',
      availableRoutes: [
        '/health',
        '/api',
        '/print',
        '/timbangan/addTransactionPlant',
        '/timbangan/transactions'
      ]
    })
  })

  app.post('/print', printController)
  app.post('/timbangan/addTransactionPlant', addTransactionPlantController)
  app.get('/timbangan/transactions', listTransactionPlantController)
}

module.exports = { registerRoutes }
