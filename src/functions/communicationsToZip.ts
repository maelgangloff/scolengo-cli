import JSZip from 'jszip'
import { participationToMIME } from './participationToMIME'
import { Communication, Participation } from 'scolengo-api/types/models/Messaging'
import { Skolengo } from 'scolengo-api'
import cliProgress from 'cli-progress'
import chalk from 'chalk'

const escapeFileName = (name: string): string => name.replace(/[^a-z0-9]/gi, '_')
export async function communicationsToZip (user: Skolengo, zip: JSZip, communications: Array<{ communication: Communication, participations: Participation[] }>, withAttachments: boolean = true): Promise<JSZip> {
  const statusBar = new cliProgress.SingleBar({ clearOnComplete: true, format: `[${chalk.greenBright('{bar}')}] {percentage}% | ETA: {eta}s | {value}/{total} {communication}` }, cliProgress.Presets.rect)

  statusBar.start(communications.length, 0)
  for (const communication of communications) {
    const subject = communication.communication.subject
    const communicationId = communication.communication.id
    const participations = communication.participations
    statusBar.increment({ communication: subject })

    for (let i = 0; i < participations.length; i++) {
      const {
        sender,
        id
      } = participations[i]
      const senderName = ((sender?.person) != null) ? `${sender.person.firstName} ${sender.person.lastName}` : sender?.technicalUser?.label
      const fileName = `${communicationId}-${id}-${escapeFileName(senderName ?? 'Inconnu')}-${escapeFileName(subject)}.eml`
      const contentMIME = await participationToMIME(user, participations[i], subject, i !== 0 ? participations[0].id : undefined, withAttachments)
      zip.file(fileName, contentMIME, { date: new Date(participations[i].dateTime) })
    }
  }
  statusBar.stop()
  return zip
}
