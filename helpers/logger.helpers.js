const winston = require('winston')
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.simple(),
        winston.format.errors({ stack: true })
      )
    })
  ]
})

module.exports = {
  logger
}
