import { createCommand, Option } from 'commander'
import { getCredentials } from '../../store'
import { Skolengo } from 'scolengo-api'
import chalk from 'chalk'
import { writeFileSync } from 'fs'
import { onTokenRefreshSilent, onTokenRefreshVerbose } from '../../functions/onTokenRefreshSilent'
import { Lesson } from 'scolengo-api/types/models/Calendar'

interface CommandOpts {
  uid: string | undefined
  student: string | undefined
  limit: string | undefined
  from: string
  to: string
  ext: 'ics' | 'json'
}

const getDateFromISO = (date: Date): string => new Date(date).toISOString().split('T')[0]

async function calendar (filePath: string, { uid, student, from, to, limit, ext }: CommandOpts): Promise<void> {
  const credentials = getCredentials(uid)
  if (filePath !== undefined) {
    const user = await Skolengo.fromConfigObject(credentials.credentials, onTokenRefreshVerbose)
    const agenda = await user.getAgenda(student ?? credentials.userId, getDateFromISO(new Date(from)), getDateFromISO(new Date(to)), limit !== undefined ? parseInt(limit, 10) : undefined)
    const ics = agenda.toICalendar()
    console.log(chalk.gray(`UID : ${credentials.userId}`))

    switch (ext) {
      case 'ics':
        writeFileSync(filePath, ics, { encoding: 'utf-8' })
        console.log(chalk.greenBright(`Le fichier a bien été sauvegardé. Il comporte ${(ics.match(/BEGIN:VEVENT/g) ?? []).length} évènements.`))
        break
      case 'json':
        writeFileSync(filePath, JSON.stringify(agenda, null, 2), { encoding: 'utf-8' })
        console.log(chalk.greenBright(`Le fichier a bien été sauvegardé. Il comporte ${agenda.reduce((acc: Lesson[], j) => [...acc, ...j.lessons], []).length} évènements.`))
        break
    }
    return
  }
  const user = await Skolengo.fromConfigObject(credentials.credentials, onTokenRefreshSilent)
  const agenda = await user.getAgenda(student ?? credentials.userId, getDateFromISO(new Date(from)), getDateFromISO(new Date(to)), limit !== undefined ? parseInt(limit, 10) : undefined)
  const ics = agenda.toICalendar()

  switch (ext) {
    case 'ics':
      console.log(ics)
      break
    case 'json':
      console.log(JSON.stringify(agenda, null, 2))
      break
  }
}

export const CalendarCommand = createCommand('calendar')
  .description("Exporter l'agenda au format iCalendar (text/calendar)")
  .option('-u, --uid <user_uid>', "identifiant unique de l'utilisateur courant")
  .option('-s, --student <student_uid>', "identifiant unique de l'étudiant à considérer")
  .option('-n, --limit <event_number>', "nombre maximum d'évènements à télécharger", '100')
  .addOption(new Option('-e, --ext <file_format>', 'format des donnés (ics|json)').default('ics').choices(['ics', 'json']))
  .requiredOption('-f, --from <from_date>', 'date de début YYYY-MM-DD')
  .requiredOption('-t, --to <to_date>', 'date de fin YYYY-MM-DD')
  .argument('[output-file]', 'chemin vers le fichier à sauvegarder')
  .action(calendar)
