import { Attachment } from 'scolengo-api/types/models/School'
import JSZip from 'jszip'
import { ReadStream } from 'fs'
import { Skolengo } from 'scolengo-api'
import cliProgress from 'cli-progress'
import chalk from 'chalk'

export async function attachmentsToZip (user: Skolengo, zip: JSZip, attachments: Attachment[]): Promise<JSZip> {
  const statusBar = new cliProgress.SingleBar({ clearOnComplete: true, format: `[${chalk.greenBright('{bar}')}] {percentage}% | ETA: {eta}s | {value}/{total} {filename}` }, cliProgress.Presets.rect)
  statusBar.start(attachments.length, 0)
  for (const attachment of attachments) {
    statusBar.increment({ filename: attachment.name })
    zip.file(attachment.name ?? `${attachment.id}.pdf`, (await user.downloadAttachment(attachment)) as ReadStream)
  }
  statusBar.stop()
  return zip
}
