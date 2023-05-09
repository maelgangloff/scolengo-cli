import { Communication, Folder, Participation } from 'scolengo-api/types/models/Messaging'
import { Skolengo } from 'scolengo-api'

export async function getCommunications (user: Skolengo, folder: Folder, limit?: string): Promise<Array<{ communication: Communication, participations: Participation[] }>> {
  let offset = 0
  const boiteReception: Communication[] = await user.getCommunicationsFolder(folder.id, 100, offset)

  let n = boiteReception.length
  while (n !== 0 && (limit !== undefined ? parseInt(limit, 10) >= n : true)) {
    const newCommunications = await user.getCommunicationsFolder(folder.id, 100, offset, { include: '' })
    n = newCommunications.length
    offset += n
    boiteReception.push(...newCommunications)
  }

  return await Promise.all(boiteReception.filter((value: Communication, index: number, self: Communication[]) =>
    index === self.findIndex((t: Communication) => t.id === value.id)).map(async (c: Communication) => ({
    communication: c,
    participations: await user.getCommunicationParticipations(c.id)
  })))
}
