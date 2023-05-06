import { createCommand, Option } from 'commander'
import { getCredentials } from '../../store'
import { Skolengo } from 'scolengo-api'
import chalk from 'chalk'
import { writeFileSync } from 'fs'
import { onTokenRefreshSilent, onTokenRefreshVerbose } from '../../functions/onTokenRefresh'

interface CommandOpts {
  uid: string | undefined
  student: string | undefined
  limit: string | undefined
  folder: string | undefined
  ext: 'csv' | 'json'
}

async function notes (filePath: string, {
  uid,
  student,
  limit,
  ext,
  folder
}: CommandOpts): Promise<void> {
  const credentials = getCredentials(uid)
  const studentId = student ?? credentials.userId

  const user = await Skolengo.fromConfigObject(credentials.credentials, filePath !== undefined ? onTokenRefreshVerbose : onTokenRefreshSilent)
  const evaluationSettings = await user.getEvaluationSettings(studentId, 100)
  if (evaluationSettings.length === 0) throw new Error('Aucun service d\'évaluation n\'a été trouvé.')
  if (!evaluationSettings[0].evaluationsDetailsAvailable) throw new Error('Le détail des notes n\'est pas disponible.')
  const periods = await Promise.all(evaluationSettings[0].periods.map(async period => ({
    ...period,
    matieres: await user.getEvaluation(studentId, period.id, limit !== undefined ? parseInt(limit, 10) : undefined)
  })))

  const CSV_HEADERS = 'period,subject,dateTime,coefficient,scale,mark\n'
  const csv = CSV_HEADERS + periods.map(p =>
    p.matieres.map(m =>
      m.evaluations.map(e =>
        [p.label, m.subject.label, e.dateTime, Math.round(e.coefficient * 100) / 100, e.scale, e.evaluationResult.mark ?? e.evaluationResult.nonEvaluationReason]
      )
    )).flat(2)
    .map(e => e.join(','))
    .join('\n')

  if (filePath !== undefined) {
    console.log(chalk.gray(`UID : ${credentials.userId}`))
    console.log(chalk.gray(`Student UID : ${studentId}`))

    switch (ext) {
      case 'csv':
        writeFileSync(filePath, csv, { encoding: 'utf-8' })
        break
      case 'json':
        writeFileSync(filePath, JSON.stringify(periods, null, 2), { encoding: 'utf-8' })
        break
    }
    console.log(chalk.greenBright(`Le fichier a bien été sauvegardé. Il comporte ${periods.length} périodes de notation pour ${periods.reduce((acc, p) => acc + p.matieres.reduce((acc, m) => acc + m.evaluations.length, 0), 0)} évaluations.`))
    return
  }

  switch (ext) {
    case 'csv':
      console.log(csv)
      break
    case 'json':
      console.log(JSON.stringify(periods, null, 2))
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
