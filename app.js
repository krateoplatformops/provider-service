const express = require('express')
const cors = require('cors')({ origin: true, credentials: true })
const responseTime = require('response-time')
const k8sHelpers = require('./service-library/helpers/k8s.helpers')
k8sHelpers.init()

const app = express()
app.use(cors)
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(responseTime({ suffix: false, digits: 0 }))

/* Middlewares */
const callLoggerMiddleware = require('./service-library/middlewares/call-logger.middleware')
const listMiddleware = require('./service-library/middlewares/list.middleware')
const errorLoggerMiddleware = require('./service-library/middlewares/error-logger.middleware')

app.use(callLoggerMiddleware)
app.use(listMiddleware)

/* Routes */
const statusRoutes = require('./routes/status.routes')
const providerRoutes = require('./routes/provider.routes')

app.use('/', statusRoutes)
app.use('/', providerRoutes)

app.use(errorLoggerMiddleware)

module.exports = app
