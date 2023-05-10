import dotenv from 'dotenv'
import { format, transports, createLogger, Logger } from 'winston'

dotenv.config()

let _logLevel: string = 'info'

export function setLogLevel (logLevel: string): void {
  _logLevel = logLevel
}

export function logger (): Logger {
  return createLogger({
    level: process.env.SCOLENGO_CLI_SILENT === undefined ? _logLevel : 'error',
    transports: [
      new transports.Console({
        eol: '\n',
        format: format.cli(),
        stderrLevels: ['error', 'info', 'verbose']
      })
    ]
  })
}
