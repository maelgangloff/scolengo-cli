import { createMimeMessage } from 'mimetext'
import { Participation } from 'scolengo-api/types/models/Messaging'
import { Skolengo } from 'scolengo-api'
import { ReadStream } from 'fs'
import { Stream } from 'stream'

async function stream2buffer (stream: Stream): Promise<Buffer> {
  return await new Promise < Buffer >((resolve, reject) => {
    const _buf = Array < any >()

    stream.on('data', chunk => _buf.push(chunk))
    stream.on('end', () => resolve(Buffer.concat(_buf)))
    stream.on('error', err => reject(err))
  })
}

export async function participationToMIME (user: Skolengo, participation: Participation, subject: string, inReplyToCommunicationId?: string, withAttachments = true): Promise<string> {
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
  if (withAttachments) {
    for (const attachment of participation.attachments) {
      const data = (await user.downloadAttachment(attachment)) as ReadStream

      msg.addAttachment({
        contentType: attachment.mimeType,
        filename: attachment.name,
        inline: false,
        encoding: 'base64',
        data: (await stream2buffer(data)).toString('base64')
      })
    }
  }
  return msg.asRaw()
}
