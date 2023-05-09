import { createCommand } from 'commander'
import inquirer from 'inquirer'
import JSZip from 'jszip'
import { createWriteStream } from 'fs'
import chalk from 'chalk'
import { Skolengo } from 'scolengo-api'
import {
  attachmentsToZip,
  communicationsToZip,
  getAbsencesFiles,
  getCommunications,
  getCredentials,
  getDateFromISO,
  getEvaluation,
  logger,
  onTokenRefreshVerbose,
  periodsToCSV
} from '../../functions'

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

async function backup (filePath: string, {
  uid,
  student,
  attachments
}: CommandOpts): Promise<void> {
  const credentials = getCredentials(uid)

  const user = await Skolengo.fromConfigObject(credentials.credentials, onTokenRefreshVerbose)
  const userInfo = await user.getUserInfo()
  if (student !== undefined && userInfo.students !== undefined && userInfo.students.find(s => s.id) === undefined) throw new Error('Vous ne disposez a priori pas des droits requis pour effectuer les requêtes concernant l\'UID de l\'étudiant renseigné.')
  const studentId = student ?? credentials.userId

  const permissions = userInfo.permissions?.map(p => p.permittedOperations).flat(2)

  logger(chalk.gray(`UID : ${credentials.userId}`))
  logger(chalk.gray(`Student UID : ${studentId}`))

  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'exportList',
      message: 'Choix des données à exporter',
      validate (input: ExportableData[], answers?: any): boolean {
        if (input.length > 0) return true
        throw new Error('Veuillez effectuer un choix non vide.')
      },
      choices: [
        {
          name: 'Absences',
          value: ExportableData.ABSENCES,
          disabled: permissions !== undefined && !permissions.includes('READ_ABSENCE_FILES')
        },
        {
          name: 'Bulletins PDF',
          value: ExportableData.BULLETINS,
          disabled: permissions !== undefined && !permissions.includes('READ_EVALUATIONS')
        },
        {
          name: 'Agenda',
          value: ExportableData.CALENDAR,
          disabled: permissions !== undefined && !permissions.includes('READ_LESSONS')
        },
        {
          name: 'Relevé de notes',
          value: ExportableData.NOTES,
          disabled: permissions !== undefined && !permissions.includes('READ_EVALUATIONS')
        },
        {
          name: 'Courriels de la messagerie interne',
          value: ExportableData.MAIL,
          disabled: permissions !== undefined && !permissions.includes('READ_MESSAGES')
        }
      ].map(c => ({
        ...c,
        checked: true
      }))
    }
  ])

  const zip = new JSZip()

  for (const exportableData of answers.exportList as ExportableData[]) {
    try {
      if (exportableData === ExportableData.ABSENCES) {
        const absences = await getAbsencesFiles(user, studentId)
        const folder = zip.folder('absences') as JSZip
        folder.file('absences.csv', absences.toCSV())
        folder.file('absences.json', JSON.stringify(absences, null, 2))
      } else if (exportableData === ExportableData.BULLETINS) {
        const folder = zip.folder('bulletins') as JSZip
        const bulletins = await user.getPeriodicReportsFiles(studentId, 100)
        await attachmentsToZip(user, folder, bulletins)
      } else if (exportableData === ExportableData.CALENDAR) {
        const folder = zip.folder('calendar') as JSZip
        const agenda = await user.getAgenda(studentId, getDateFromISO(new Date()), getDateFromISO(new Date(Date.now() + 90 * 24 * 60 * 60 * 1e3)))
        folder.file('calendar.ics', agenda.toICalendar())
        folder.file('calendar.json', JSON.stringify(agenda, null, 2))
      } else if (exportableData === ExportableData.NOTES) {
        const folder = zip.folder('notes') as JSZip
        const notes = await getEvaluation(user, studentId)
        folder.file('notes.csv', periodsToCSV(notes))
        folder.file('notes.json', JSON.stringify(notes, null, 2))
      } else if (exportableData === ExportableData.MAIL) {
        const mailSettings = await user.getUsersMailSettings(credentials.userId)
        for (const mailFolder of mailSettings.folders) {
          const folder = (zip.folder('mail') as JSZip).folder(mailFolder.type) as JSZip
          const communications = await getCommunications(user, mailFolder)
          await communicationsToZip(user, folder.folder('eml') as JSZip, communications, attachments)
          folder.file('communications.json', JSON.stringify(communications, null, 2))
          logger(chalk.green(`✔ MAIL > ${mailFolder.type} (${mailFolder.name})`))
        }
      }
      if (exportableData !== ExportableData.MAIL) logger(chalk.green('✔ ' + ExportableData[exportableData]))
    } catch (e) {
      const err = e as Error
      console.error(chalk.redBright(`✘ ${err.name} : ${err.message}`))
    }
  }

  zip.generateNodeStream({
    type: 'nodebuffer',
    streamFiles: true
  }).pipe(createWriteStream(filePath))

  logger(chalk.greenBright('✔ Le fichier zip a bien été sauvegardé.'))
}

export const BackupCommand = createCommand('backup')
  .description('export intéractif des données')
  .option('-u, --uid <user_uid>', 'identifiant unique de l\'utilisateur courant')
  .option('-s, --student <student_uid>', 'identifiant unique de l\'étudiant à considérer')
  .argument('<output-file>', 'chemin vers le fichier à sauvegarder')
  .option('-A, --no-attachments', 'ne pas télécharger les pièces jointes des communications')
  .action(backup)
