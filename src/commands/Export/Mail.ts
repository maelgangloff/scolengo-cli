import { createCommand, Option } from 'commander'
import { getCredentials } from '../../store'
import { Skolengo } from 'scolengo-api'
import chalk from 'chalk'
import { createWriteStream, writeFileSync } from 'fs'
import { onTokenRefreshSilent, onTokenRefreshVerbose } from '../../functions/onTokenRefresh'
import { Communication } from 'scolengo-api/types/models/Messaging'
import JSZip from 'jszip'
import { participationToMIME } from '../../functions/participationToMIME'

interface CommandOpts {
  uid: string | undefined
  limit: string | undefined
  folder: string | undefined
  ext: 'eml' | 'json'
}

const escapeFileName = (name: string): string => name.replace(/[^a-z0-9]/gi, '_')

async function mail (filePath: string, {
  uid,
  limit,
  ext,
  folder
}: CommandOpts): Promise<void> {
  const credentials = getCredentials(uid)
  const user = await Skolengo.fromConfigObject(credentials.credentials, filePath !== undefined ? onTokenRefreshVerbose : onTokenRefreshSilent)
  const mailSettings = await user.getUsersMailSettings(credentials.userId)
  const inboxFolder = mailSettings.folders.find(f => f.type === folder)

  if (inboxFolder === undefined) throw new Error('Impossible de touver la boîte de réception du courriel.')
  const inbox = await user.getCommunicationsFolder(inboxFolder.id, limit !== undefined ? parseInt(limit, 10) : undefined)
  const communications = await Promise.all(inbox.map(async (c: Communication) => ({
    communication: c,
    participations: await user.getCommunicationParticipations(c.id)
  })))

  if (filePath !== undefined) {
    console.log(chalk.gray(`UID : ${credentials.userId}`))

    if (ext === 'eml') {
      const zip = new JSZip()
      for (const communication of communications) {
        const subject = communication.communication.subject
        const communicationId = communication.communication.id
        const participations = communication.participations

        for (let i = 0; i < participations.length; i++) {
          const {
            sender,
            attachments,
            id
          } = participations[i]
          const senderName = ((sender?.person) != null) ? `${sender.person.firstName} ${sender.person.lastName}` : sender?.technicalUser?.label
          const fileName = `${communicationId}-${id}-${escapeFileName(senderName ?? 'Inconnu')}-${escapeFileName(subject)}.eml`
          const contentMIME = participationToMIME(participations[i], subject, i !== 0 ? participations[0].id : undefined)
          const content = attachments.length > 0 ? contentMIME + `<br>__________<br>Pièces jointes :<br>${attachments.map(a => `  - ${a.name ?? 'Inconnu'} (${a.mimeTypeLabel ?? 'Inconnu'}) : <a href="${a.url}">${a.url}</a>`).join('<br>')}` : contentMIME
          zip.file(fileName, content)
        }
      }
      zip.generateNodeStream({
        type: 'nodebuffer',
        streamFiles: true
      }).pipe(createWriteStream(filePath))
    } else if (ext === 'json') {
      writeFileSync(filePath, JSON.stringify(communications, null, 2), { encoding: 'utf-8' })
    }
    console.log(chalk.greenBright(`Le fichier a bien été sauvegardé. Il comporte ${communications.length} communications.`))
    return
  }
  console.log(JSON.stringify(communications, null, 2))
}

export const MailCommand = createCommand('mail')
  .description('Exporter les courriels internes dans un zip au format MIME')
  .option('-u, --uid <user_uid>', 'identifiant unique de l\'utilisateur courant')
  .option('-n, --limit <event_number>', 'nombre maximum de communications à télécharger', '100')
  .addOption(new Option('-f, --folder <folder_id>', 'dossier à considérer').default('INBOX').choices(['INBOX', 'SENT', 'DRAFTS', 'MODERATION', 'TRASH', 'PERSONAL']))
  .addOption(new Option('-e, --ext <file_format>', 'format des donnés').default('eml').choices(['eml', 'json']))
  .argument('[output-file]', 'chemin vers le fichier à sauvegarder')
  .action(mail)
