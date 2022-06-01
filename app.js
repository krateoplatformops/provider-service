const express = require('express')
const helmet = require('helmet')
const cors = require('cors')({ origin: true, credentials: true })
const responseTime = require('response-time')

const app = express()
app.use(helmet())
app.use(cors)
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(responseTime({ suffix: false, digits: 0 }))

/* Middlewares */
const callLoggerMiddleware = require('./middlewares/call-logger.middleware')
const errorLoggerMiddleware = require('./middlewares/error-logger.middleware')

app.use(callLoggerMiddleware)

/* Routes */
const statusRoutes = require('./routes/status.routes')
const providerRoutes = require('./routes/provider.routes')

app.use('/', statusRoutes)
app.use('/', providerRoutes)

app.use(errorLoggerMiddleware)

module.exports = app
