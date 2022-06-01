const express = require('express')
const router = express.Router()

const packageJson = require('../package.json')

const response = {
  name: packageJson.name,
  version: packageJson.version
}

router.get('/ping', (req, res) => {
  res.status(200).json(response)
})

router.get('/healthz', (req, res) => {
  res.status(200).json(response)
})

module.exports = router
