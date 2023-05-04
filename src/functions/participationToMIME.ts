import { createMimeMessage } from 'mimetext'
import { Participation } from 'scolengo-api/types/models/Messaging'

export function participationToMIME (participation: Participation, subject: string, inReplyToCommunicationId?: string): string {
  const sender = participation.sender
  const msg = createMimeMessage()
  msg.setSender({
    name: (((sender?.person) != null) ? `${sender.person.firstName} ${sender.person.lastName}` : sender?.technicalUser?.label) ?? 'Inconnu',
    addr: ''
  })
  msg.setRecipient({
    name: 'Moi',
    addr: ''
  })
  msg.setHeader('Date', ((new Date(participation.dateTime)).toUTCString()).replace(/GMT|UTC/gi, '+0000'))
  msg.setHeader('Message-ID', `<${participation.id}@skolengo>`)
  if (inReplyToCommunicationId !== undefined && inReplyToCommunicationId !== null) msg.setHeader('In-Reply-To', `<${inReplyToCommunicationId}@skolengo>`)
  msg.setSubject(subject)
  msg.addMessage({
    contentType: 'text/html',
    data: participation.content
  })
  return msg.asRaw()
}
