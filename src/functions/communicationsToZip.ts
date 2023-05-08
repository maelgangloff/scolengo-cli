import JSZip from 'jszip'
import { participationToMIME } from './participationToMIME'
import { Communication, Participation } from 'scolengo-api/types/models/Messaging'

const escapeFileName = (name: string): string => name.replace(/[^a-z0-9]/gi, '_')
export function communicationsToZip (communications: Array<{ communication: Communication, participations: Participation[] }>): JSZip {
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
      zip.file(fileName, content, { date: new Date(participations[i].dateTime) })
    }
  }
  return zip
}
