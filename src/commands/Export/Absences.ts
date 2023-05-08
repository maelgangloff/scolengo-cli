import { createCommand, Option } from 'commander'
import { getCredentials } from '../../store'
import { Skolengo } from 'scolengo-api'
import { onTokenRefreshSilent, onTokenRefreshVerbose } from '../../functions/onTokenRefresh'
import chalk from 'chalk'
import { writeFileSync } from 'fs'

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

  const user = await Skolengo.fromConfigObject(credentials.credentials, filePath !== undefined ? onTokenRefreshVerbose : onTokenRefreshSilent)
  const absencesFiles = (await user.getAbsenceFiles(studentId, limit !== undefined ? parseInt(limit, 10) : undefined, 0, {
    fields: {
      absenceFileState: 'creationDateTime,absenceStartDateTime,absenceEndDateTime,absenceType,absenceFileStatus,absenceReason,absenceRecurrence',
      absenceReason: 'code,longLabel'
    }
  })).sort((a, b) => new Date(a.currentState.creationDateTime).getTime() - new Date(b.currentState.creationDateTime).getTime())
  if (filePath !== undefined) {
    console.log(chalk.gray(`UID : ${credentials.userId}`))
    console.log(chalk.gray(`Student UID : ${studentId}`))

    switch (ext) {
      case 'csv':
        writeFileSync(filePath, absencesFiles.toCSV(), { encoding: 'utf-8' })
        break
      case 'json':
        writeFileSync(filePath, JSON.stringify(absencesFiles, null, 2), { encoding: 'utf-8' })
        break
    }
    console.log(chalk.greenBright(`Le fichier a bien été sauvegardé. Il comporte ${absencesFiles.length} absences.`))
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
  .option('-n, --limit <event_number>', "nombre maximum d'absences à télécharger", '100')
  .addOption(new Option('-e, --ext <file_format>', 'format des donnés').default('csv').choices(['csv', 'json']))
  .argument('[output-file]', 'chemin vers le fichier à sauvegarder')
  .action(absences)
