import { Communication, Folder, Participation } from 'scolengo-api/types/models/Messaging'
import { Skolengo } from 'scolengo-api'
import cliProgress from 'cli-progress'
import chalk from 'chalk'

export async function getCommunications (user: Skolengo, folder: Folder, limit?: string): Promise<Array<{ communication: Communication, participations: Participation[] }>> {
  let offset = 0
  const boiteReception: Communication[] = await user.getCommunicationsFolder(folder.id, 100, offset)

  let n = boiteReception.length
  while (n !== 0 && (limit !== undefined ? parseInt(limit, 10) >= n : true)) {
    const newCommunications = await user.getCommunicationsFolder(folder.id, 100, offset)
    n = newCommunications.length
    offset += n
    boiteReception.push(...newCommunications)
  }
  const uniqueCommunications = boiteReception.filter((value: Communication, index: number, self: Communication[]) => index === self.findIndex((t: Communication) => t.id === value.id))

  const statusBar = new cliProgress.SingleBar({ clearOnComplete: true, format: `[${chalk.greenBright('{bar}')}] {percentage}% | ETA: {eta}s | {value}/{total} {title}` }, cliProgress.Presets.rect)
  statusBar.start(uniqueCommunications.length, 0)

  const result = await Promise.all(uniqueCommunications.map(async (c: Communication) => {
    statusBar.increment({ title: c.subject })
    return {
      communication: c,
      participations: await user.getCommunicationParticipations(c.id)
    }
  }))
  statusBar.stop()
  return result
}
