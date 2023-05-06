import { createCommand } from 'commander'
import { CalendarCommand } from './Calendar'
import { MailCommand } from './Mail'
import { NotesCommand } from './Notes'

export const ExportCommand = createCommand('export')
  .description('exporter des données')
  .addCommand(CalendarCommand)
  .addCommand(MailCommand)
  .addCommand(NotesCommand)
