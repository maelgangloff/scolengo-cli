import { createCommand } from 'commander'
import { getCredentials } from '../../store'
import { Skolengo } from 'scolengo-api'
import chalk from 'chalk'
import { createWriteStream } from 'fs'
import { onTokenRefreshSilent, onTokenRefreshVerbose } from '../../functions/onTokenRefresh'
import { attachmentsToZip } from '../../functions'
import JSZip from 'jszip'

interface CommandOpts {
  uid: string | undefined
  student: string | undefined
  limit: string | undefined
}

async function notes (filePath: string, {
  uid,
  student,
  limit
}: CommandOpts): Promise<void> {
  const credentials = getCredentials(uid)
  const studentId = student ?? credentials.userId

  const user = await Skolengo.fromConfigObject(credentials.credentials, filePath !== undefined ? onTokenRefreshVerbose : onTokenRefreshSilent)
  const bulletins = await user.getPeriodicReportsFiles(studentId, limit !== undefined ? parseInt(limit, 10) : undefined)

  if (filePath !== undefined) {
    console.log(chalk.gray(`UID : ${credentials.userId}`))
    console.log(chalk.gray(`Student UID : ${studentId}`))

    if (bulletins.length === 0) throw new Error('Aucun bulletin n\'est disponible.')

    const zip = await attachmentsToZip(user, new JSZip(), bulletins)

    zip.generateNodeStream({
      type: 'nodebuffer',
      streamFiles: true
    }).pipe(createWriteStream(filePath))

    console.log(chalk.greenBright(`✔ Le fichier a bien été sauvegardé. Il comporte ${bulletins.length} bulletins.`))
    return
  }

  console.log(JSON.stringify(bulletins, null, 2))
}

export const BulletinsCommand = createCommand('bulletins')
  .description('Exporter les bulletins périodiques dans un zip au format PDF')
  .option('-u, --uid <user_uid>', 'identifiant unique de l\'utilisateur courant')
  .option('-s, --student <student_uid>', 'identifiant unique de l\'étudiant à considérer')
  .option('-n, --limit <event_number>', 'nombre maximum de bulletins à télécharger', '100')
  .argument('[output-file]', 'chemin vers le fichier à sauvegarder')
  .action(notes)
