import { createCommand, Option } from 'commander'
import chalk from 'chalk'
import { writeFileSync } from 'fs'
import {
  getCredentials,
  getEvaluation,
  getSkolengoClient,
  logger,
  periodsToCSV
} from '../../functions'

interface CommandOpts {
  uid: string | undefined
  student: string | undefined
  limit: string | undefined
  ext: 'csv' | 'json'
}

async function notes (filePath: string, {
  uid,
  student,
  limit,
  ext
}: CommandOpts): Promise<void> {
  const credentials = getCredentials(uid)
  const studentId = student ?? credentials.userId

  const Logger = logger()

  const user = await getSkolengoClient(credentials.credentials)
  const periods = await getEvaluation(user, studentId, limit)

  if (filePath !== undefined) {
    Logger.info(chalk.gray(`UID : ${credentials.userId}`))
    Logger.info(chalk.gray(`Student UID : ${studentId}`))

    switch (ext) {
      case 'csv':
        writeFileSync(filePath, periodsToCSV(periods), { encoding: 'utf-8' })
        break
      case 'json':
        writeFileSync(filePath, JSON.stringify(periods, null, 2), { encoding: 'utf-8' })
        break
    }
    Logger.info(chalk.greenBright(`✔ Le fichier a bien été sauvegardé. Il comporte ${periods.length} périodes de notation pour ${periods.reduce((acc, p) => acc + p.matieres.reduce((acc, m) => acc + m.evaluations.length, 0), 0)} évaluations.`))
    return
  }

  switch (ext) {
    case 'csv':
      console.log(periodsToCSV(periods))
      break
    case 'json':
      console.log(JSON.stringify(periods, null, 2))
      break
  }
}

export const NotesCommand = createCommand('notes')
  .description('Exporter le relevé de notes')
  .option('-u, --uid <user_uid>', 'identifiant unique de l\'utilisateur courant')
  .option('-s, --student <student_uid>', 'identifiant unique de l\'étudiant à considérer')
  .option('-n, --limit <event_number>', 'nombre maximum de notes à télécharger', '100')
  .addOption(new Option('-e, --ext <file_format>', 'format des donnés').default('csv').choices(['csv', 'json']))
  .argument('[output-file]', 'chemin vers le fichier à sauvegarder')
  .action(notes)
