import dotenv from 'dotenv'
import winston from 'winston'

dotenv.config()

let _logLevel: string = 'info'

export function setLogLevel (logLevel: string): string {
  _logLevel = logLevel
  return logLevel
}

export function logger (): winston.Logger {
  const logger = winston.createLogger({
    level: process.env.SCOLENGO_CLI_SILENT === undefined ? _logLevel : 'error',
    format: winston.format.json(),
    transports: [
      new winston.transports.Console({
        format: winston.format.simple(),
        stderrLevels: ['error', 'info', 'http']
      })
    ]
  })
  return logger
}
