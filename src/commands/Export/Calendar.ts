import { createCommand } from 'commander'
import { getCredentials } from '../../store'
import { Skolengo } from 'scolengo-api'
import chalk from 'chalk'
import { writeFileSync } from 'fs'
import { onTokenRefresh } from '../../functions/onTokenRefresh'

interface CommandOpts {
  uid: string | undefined
  student: string | undefined
  limit: string | undefined
  from: string
  to: string
}

const getDateFromISO = (date: Date): string => new Date(date).toISOString().split('T')[0]

async function calendar (filePath: string, { uid, student, from, to, limit }: CommandOpts): Promise<void> {
  const credentials = getCredentials(uid)
  const user = await Skolengo.fromConfigObject(credentials.credentials, onTokenRefresh)

  const agenda = await user.getAgenda(student ?? credentials.userId, getDateFromISO(new Date(from)), getDateFromISO(new Date(to)), limit !== undefined ? parseInt(limit, 10) : undefined)
  const ics = agenda.toICalendar()
  if (filePath !== undefined) {
    console.log(chalk.gray(`UID : ${credentials.userId}`))
    writeFileSync(filePath, ics, { encoding: 'utf-8' })
    console.log(chalk.greenBright(`Le fichier a bien été sauvegardé. Il comporte ${(ics.match(/BEGIN:VEVENT/g) ?? []).length} évènements.`))
    return
  }
  console.log(ics)
}

export const CalendarCommand = createCommand('calendar')
  .description("Exporter l'agenda au format iCalendar (text/calendar)")
  .option('-u, --uid <user_uid>', "Identifiant unique de l'utilisateur courant")
  .option('-s, --student <student_uid>', "Identifiant unique de l'étudiant à considérer")
  .option('-n, --limit <event_number>', "Nombre maximum d'évènements à télécharger", '100')
  .requiredOption('-f, --from <from_date>', 'Date de début YYYY-MM-DD')
  .requiredOption('-t, --to <to_date>', 'Date de fin YYYY-MM-DD')
  .argument('[output-file]', 'Chemin vers le fichier à sauvegarder')
  .action(calendar)
