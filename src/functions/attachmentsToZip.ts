import { Attachment } from 'scolengo-api/types/models/School'
import JSZip from 'jszip'
import { ReadStream } from 'fs'
import { Skolengo } from 'scolengo-api'

export async function attachmentsToZip (user: Skolengo, attachments: Attachment[]): Promise<JSZip> {
  const zip = new JSZip()
  for (const attachment of attachments) {
    zip.file(attachment.name ?? `${attachment.id}.pdf`, (await user.downloadAttachment(attachment)) as ReadStream)
  }
  return zip
}
