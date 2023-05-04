import { createCommand } from 'commander'
import { CalendarCommand } from './Calendar'

export const ExportCommand = createCommand('export')
  .description('exporter des données')
  .addCommand(CalendarCommand)
