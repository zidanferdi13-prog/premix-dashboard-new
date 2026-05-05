function healthController(req, res, config) {
  return res.status(200).json({
    ok: true,
    service: 'premix-backend-express',
    env: config.nodeEnv,
    time: new Date().toISOString()
  })
}

module.exports = { healthController }
