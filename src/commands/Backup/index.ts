import { createCommand } from 'commander'
import inquirer from 'inquirer'
import JSZip from 'jszip'
import { createWriteStream } from 'fs'
import chalk from 'chalk'
import { getCredentials } from '../../store'
import { Skolengo } from 'scolengo-api'
import { onTokenRefreshVerbose } from '../../functions/onTokenRefresh'
import { getAbsencesFiles } from '../../functions/getAbsencesFiles'
import { attachmentsToZip } from '../../functions/attachmentsToZip'
import { getEvaluation } from '../../functions/getEvaluation'
import { periodsToCSV } from '../../functions/periodsToCSV'
import { getCommunications } from '../../functions/getCommunications'
import { communicationsToZip } from '../../functions/communicationsToZip'

enum ExportableData {
  ABSENCES,
  BULLETINS,
  CALENDAR,
  MAIL,
  NOTES
}

interface CommandOpts {
  uid: string | undefined
  student: string | undefined
  attachments: boolean
}

const getDateFromISO = (date: Date): string => new Date(date).toISOString().split('T')[0]

async function backup (filePath: string, {
  uid,
  student,
  attachments
}: CommandOpts): Promise<void> {
  const credentials = getCredentials(uid)
  const studentId = student ?? credentials.userId

  const user = await Skolengo.fromConfigObject(credentials.credentials, onTokenRefreshVerbose)
  const userInfo = await user.getUserInfo()
  const permissions = userInfo.permissions?.map(p => p.permittedOperations).flat(2)

  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'exportList',
      message: 'Choix des données à exporter',
      choices: [
        {
          name: 'Absences',
          value: ExportableData.ABSENCES,
          disabled: permissions !== undefined && !permissions.includes('READ_ABSENCE_FILES')
        },
        {
          name: 'Bulletins PDF',
          value: ExportableData.BULLETINS
        },
        {
          name: 'Agenda',
          value: ExportableData.CALENDAR,
          disabled: permissions !== undefined && !permissions.includes('READ_LESSONS')
        },
        {
          name: 'Courriels de la boîte de réception',
          value: ExportableData.MAIL,
          disabled: permissions !== undefined && !permissions.includes('READ_MESSAGES')
        },
        {
          name: 'Relevé de notes',
          value: ExportableData.NOTES,
          disabled: permissions !== undefined && !permissions.includes('READ_EVALUATIONS')
        }
      ].map(c => ({
        ...c,
        checked: true
      }))
    }
  ])

  const zip = new JSZip()

  for (const exportableData of answers.exportList as ExportableData[]) {
    if (exportableData === ExportableData.ABSENCES) {
      const absences = await getAbsencesFiles(user, studentId)
      const folder = zip.folder('absences') as JSZip
      folder.file('absences.csv', absences.toCSV())
      folder.file('absences.json', JSON.stringify(absences, null, 2))
      console.log(chalk.green('✔ Absences'))
    } else if (exportableData === ExportableData.BULLETINS) {
      const folder = zip.folder('bulletins') as JSZip
      const bulletins = await user.getPeriodicReportsFiles(studentId, 100)
      await attachmentsToZip(user, folder, bulletins)
      console.log(chalk.green('✔ Bulletins'))
    } else if (exportableData === ExportableData.CALENDAR) {
      const folder = zip.folder('calendar') as JSZip
      const agenda = await user.getAgenda(studentId, getDateFromISO(new Date()), getDateFromISO(new Date(Date.now() + 90 * 24 * 60 * 60 * 1e3)))
      folder.file('calendar.ics', agenda.toICalendar())
      folder.file('calendar.json', JSON.stringify(agenda, null, 2))
      console.log(chalk.green('✔ Calendar'))
    } else if (exportableData === ExportableData.NOTES) {
      const folder = zip.folder('notes') as JSZip
      const notes = await getEvaluation(user, studentId)
      folder.file('notes.csv', periodsToCSV(notes))
      folder.file('notes.json', JSON.stringify(notes, null, 2))
      console.log(chalk.green('✔ Notes'))
    } else if (exportableData === ExportableData.MAIL) {
      const folder = zip.folder('mail') as JSZip
      const mailSettings = await user.getUsersMailSettings(credentials.userId)
      const inboxFolder = mailSettings.folders.find(f => f.type === 'INBOX')
      if (inboxFolder === undefined) throw new Error('Impossible de trouver la boîte de réception du courriel')

      const communications = await getCommunications(user, inboxFolder)
      await communicationsToZip(user, folder.folder('eml') as JSZip, communications, attachments)
      folder.file('communications.json', JSON.stringify(communications, null, 2))
      console.log(chalk.green('✔ Mail'))
    }
  }

  zip.generateNodeStream({
    type: 'nodebuffer',
    streamFiles: true
  }).pipe(createWriteStream(filePath))

  console.log(chalk.greenBright('✔ Le fichier zip a bien été sauvegardé.'))
}

export const BackupCommand = createCommand('backup')
  .description('export intéractif des données')
  .option('-u, --uid <user_uid>', 'identifiant unique de l\'utilisateur courant')
  .option('-s, --student <student_uid>', 'identifiant unique de l\'étudiant à considérer')
  .argument('<output-file>', 'chemin vers le fichier à sauvegarder')
  .option('-A, --no-attachments', 'ne pas télécharger les pièces jointes des communications')
  .action(backup)
