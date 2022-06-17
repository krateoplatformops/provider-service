const express = require('express')
const router = express.Router()

const readController = require('../controllers/read.provider.controller')
const createController = require('../controllers/create.provider.controller')
const deleteController = require('../controllers/delete.provider.controller')

router.use('/', createController)
router.use('/', readController)
router.use('/', deleteController)

module.exports = router
