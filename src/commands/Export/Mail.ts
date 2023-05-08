import { createCommand, Option } from 'commander'
import { getCredentials } from '../../store'
import { Skolengo } from 'scolengo-api'
import chalk from 'chalk'
import { createWriteStream, writeFileSync } from 'fs'
import { onTokenRefreshSilent, onTokenRefreshVerbose } from '../../functions/onTokenRefresh'
import { Communication } from 'scolengo-api/types/models/Messaging'
import { communicationsToZip } from '../../functions/communicationsToZip'

interface CommandOpts {
  uid: string | undefined
  limit: string | undefined
  folder: string | undefined
  ext: 'eml' | 'json'
  attachments: boolean
}

async function mail (filePath: string, {
  uid,
  limit,
  ext,
  folder,
  attachments
}: CommandOpts): Promise<void> {
  const credentials = getCredentials(uid)
  const user = await Skolengo.fromConfigObject(credentials.credentials, filePath !== undefined ? onTokenRefreshVerbose : onTokenRefreshSilent)
  const mailSettings = await user.getUsersMailSettings(credentials.userId)
  const inboxFolder = mailSettings.folders.find(f => f.type === folder)

  if (inboxFolder === undefined) throw new Error('Impossible de trouver la boîte de réception du courriel.')

  let offset = 0
  const boiteReception: Communication[] = await user.getCommunicationsFolder(inboxFolder.id, 100, offset)

  let n = boiteReception.length
  while (n !== 0 && (limit !== undefined ? parseInt(limit, 10) >= n : true)) {
    const newCommunications = await user.getCommunicationsFolder(inboxFolder.id, 100, offset)
    n = newCommunications.length
    offset += n
    boiteReception.push(...newCommunications)
  }

  const communications = await Promise.all(boiteReception.filter((value: Communication, index: number, self: Communication[]) =>
    index === self.findIndex((t: Communication) => t.id === value.id)).map(async (c: Communication) => ({
    communication: c,
    participations: await user.getCommunicationParticipations(c.id)
  })))

  if (filePath !== undefined) {
    console.log(chalk.gray(`UID : ${credentials.userId}`))

    switch (ext) {
      case 'eml':
        (await communicationsToZip(user, communications, attachments)).generateNodeStream({
          type: 'nodebuffer',
          streamFiles: true
        }).pipe(createWriteStream(filePath))
        break
      case 'json':
        writeFileSync(filePath, JSON.stringify(communications, null, 2), { encoding: 'utf-8' })
        break
    }
    console.log(chalk.greenBright(`Le fichier a bien été sauvegardé. Il comporte ${communications.length} communications et ${communications.reduce((acc, c) => acc + c.participations.length, 0)} participations associées.`))
    return
  }
  console.log(JSON.stringify(communications, null, 2))
}

export const MailCommand = createCommand('mail')
  .description('Exporter les courriels internes dans un zip au format MIME')
  .option('-u, --uid <user_uid>', 'identifiant unique de l\'utilisateur courant')
  .option('-n, --limit <event_number>', 'nombre maximum de communications à télécharger (par tranche de 100)')
  .addOption(new Option('-f, --folder <folder_id>', 'dossier à considérer').default('INBOX').choices(['INBOX', 'SENT', 'DRAFTS', 'MODERATION', 'TRASH', 'PERSONAL']))
  .addOption(new Option('-e, --ext <file_format>', 'format des donnés').default('eml').choices(['eml', 'json']))
  .option('-A, --no-attachments', 'ne pas télécharger les pièces jointes')
  .argument('[output-file]', 'chemin vers le fichier à sauvegarder')
  .action(mail)
