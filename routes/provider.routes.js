const express = require('express')
const router = express.Router()

const readController = require('../controllers/read.provider.controller')
const createController = require('../controllers/create.provider.controller')

router.use('/', readController)
router.use('/', createController)

module.exports = router
