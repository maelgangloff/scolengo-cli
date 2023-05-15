import { createCommand, Option } from 'commander'
import chalk from 'chalk'
import { writeFileSync } from 'fs'
import { getCredentials, logger, SkolengoUser } from '../../SkolengoUser'

interface CommandOpts {
  uid: string | undefined
  student: string | undefined
  limit: string | undefined
  ext: 'csv' | 'json'
}

async function absences (filePath: string, {
  uid,
  student,
  limit,
  ext
}: CommandOpts): Promise<void> {
  const credentials = getCredentials(uid)
  const studentId = student ?? credentials.userId

  const user = await SkolengoUser.getSkolengoUser(credentials.credentials)
  const absencesFiles = await user.getAbsencesFiles(studentId, limit)

  if (filePath !== undefined) {
    const Logger = logger()
    Logger.info(chalk.gray(`UID : ${credentials.userId}`))
    Logger.info(chalk.gray(`Student UID : ${studentId}`))

    switch (ext) {
      case 'csv':
        writeFileSync(filePath, absencesFiles.toCSV(), { encoding: 'utf-8' })
        break
      case 'json':
        writeFileSync(filePath, JSON.stringify(absencesFiles, null, 2), { encoding: 'utf-8' })
        break
    }
    Logger.info(chalk.greenBright(`✔ Le fichier a bien été sauvegardé. Il comporte ${absencesFiles.length} absences.`))
    return
  }

  switch (ext) {
    case 'csv':
      console.log(absencesFiles.toCSV())
      break
    case 'json':
      console.log(JSON.stringify(absencesFiles, null, 2))
      break
  }
}

export const AbsencesCommand = createCommand('absences')
  .description('Exporter les absences')
  .option('-u, --uid <user_uid>', 'identifiant unique de l\'utilisateur courant')
  .option('-s, --student <student_uid>', 'identifiant unique de l\'étudiant à considérer')
  .option('-n, --limit <event_number>', 'nombre maximum d\'absences à télécharger', '100')
  .addOption(new Option('-e, --ext <file_format>', 'format des donnés').default('csv').choices(['csv', 'json']))
  .argument('[output-file]', 'chemin vers le fichier à sauvegarder')
  .action(absences)
