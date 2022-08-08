const winston = require('winston')
const { format } = winston

const envConstants = require('../constants/env.constants')

const logFormat = format.printf(
  (info) =>
    `${info.timestamp} ${info.level}: ${
      typeof info.message === 'object'
        ? JSON.stringify(info.message)
        : info.message
    }`
)

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: envConstants.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.simple(),
        winston.format.errors({ stack: true }),
        logFormat
      )
    })
  ]
})

module.exports = {
  logger
}
