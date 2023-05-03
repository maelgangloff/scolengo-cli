import { createCommand } from 'commander'
import { CalendarCommand } from './Calendar'

export const ExportCommand = createCommand('export')
  .description('Export des données')
  .addCommand(CalendarCommand)
