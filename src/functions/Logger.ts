import dotenv from 'dotenv'

dotenv.config()

let _quiet: boolean = false

export function setQuiet (quiet: boolean): boolean {
  _quiet = quiet
  return quiet
}

export function logger (...message: any[]): void {
  if (process.env.SCOLENGO_CLI_SILENT === undefined && !_quiet) console.warn(...message) // -> stderr logging
}
