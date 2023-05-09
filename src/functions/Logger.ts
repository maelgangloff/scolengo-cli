import dotenv from 'dotenv'

dotenv.config()

export function silentMode (): boolean {
  return process.env.SCOLENGO_CLI_SILENT !== undefined
}

export function logger (...message: any[]): void {
  if (!silentMode()) console.log(...message)
}
