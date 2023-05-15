import { Skolengo, TokenSet } from 'scolengo-api'
import JSZip from 'jszip'
import { Attachment } from 'scolengo-api/types/models/School'
import cliProgress from 'cli-progress'
import chalk from 'chalk'
import { ReadStream } from 'fs'
import { Communication, Folder, Participation } from 'scolengo-api/types/models/Messaging'
import { AbsenceFilesResponse } from 'scolengo-api/types/models/SchoolLife'
import { Period } from 'scolengo-api/types/models/Results/EvaluationSettings'
import { Evaluation } from 'scolengo-api/types/models/Results'
import { AuthConfig } from 'scolengo-api/types/models/Common/Auth'
import { logger } from './Logger'
import axios from 'axios'
import { ClientRequest } from 'http'
import { createMimeMessage } from 'mimetext'
import { getCredentials, setCredentials } from './store'
import { Client } from 'openid-client'
import { School } from 'scolengo-api/types/models/School/School'
import { SkolengoConfig } from 'scolengo-api/types/models/Common/SkolengoConfig'
import { Stream } from 'stream'

async function streamToBuffer (stream: Stream): Promise<Buffer> {
  return await new Promise<Buffer>((resolve, reject) => {
    const _buf = Array<any>()

    stream.on('data', chunk => _buf.push(chunk))
    stream.on('end', () => resolve(Buffer.concat(_buf)))
    stream.on('error', err => reject(err))
  })
}

const escapeFileName = (name: string): string => name.replace(/[^a-z0-9]/gi, '_')
export const getDateFromISO = (date: Date): string => new Date(date).toISOString().split('T')[0]

export class SkolengoUser extends Skolengo {
  public constructor (oidClient: Client, school: School, tokenSet: TokenSet, config?: Partial<SkolengoConfig>) {
    super(oidClient, school, tokenSet, config)
  }

  public static async getSkolengoUser (credentials: AuthConfig): Promise<SkolengoUser> {
    const Logger = logger()

    const httpClient = axios.create()
    httpClient.interceptors.response.use(res => {
      const { host, path, method } = res.request as ClientRequest
      Logger.log({ level: 'verbose', message: `${method} ${res.status}:${res.statusText} https://${(host ?? '') + (path ?? '')}` })
      return res
    })

    return new SkolengoUser(await Skolengo.getOIDClient(credentials.school), credentials.school, new TokenSet(credentials.tokenSet), { httpClient, onTokenRefresh: SkolengoUser.onTokenRefresh, handlePronoteError: true })
  }

  public async attachmentsToZip (zip: JSZip, attachments: Attachment[]): Promise<JSZip> {
    const statusBar = new cliProgress.SingleBar({ clearOnComplete: true, format: `[${chalk.greenBright('{bar}')}] {percentage}% | ETA: {eta}s | {value}/{total} {filename}` }, cliProgress.Presets.rect)
    statusBar.start(attachments.length, 0)
    for (const attachment of attachments) {
      statusBar.increment({ filename: attachment.name })
      zip.file(attachment.name ?? `${attachment.id}.pdf`, (await this.downloadAttachment(attachment)) as ReadStream)
    }
    statusBar.stop()
    return zip
  }

  public async communicationsToZip (zip: JSZip, communications: Array<{ communication: Communication, participations: Participation[] }>, withAttachments: boolean = true): Promise<JSZip> {
    const statusBar = new cliProgress.SingleBar({ clearOnComplete: true, format: `${chalk.greenBright('{bar}')} {percentage}% | ETA: {eta}s | {value}/{total} {title}` }, cliProgress.Presets.rect)

    statusBar.start(communications.reduce((acc, c) => acc + c.participations.length, 0), 0)
    for (const communication of communications) {
      const subject = communication.communication.subject
      const communicationId = communication.communication.id
      const { participations } = communication

      for (let i = 0; i < participations.length; i++) {
        const {
          sender,
          id
        } = participations[i]
        statusBar.increment({ title: subject })
        const senderName = ((sender?.person) != null) ? `${sender.person.firstName} ${sender.person.lastName}` : sender?.technicalUser?.label
        const fileName = `${communicationId}-${id}-${escapeFileName(senderName ?? 'Inconnu')}-${escapeFileName(subject)}.eml`
        const contentMIME = await this.participationToMIME(participations[i], subject, i !== 0 ? participations[0].id : undefined, withAttachments)
        zip.file(fileName, contentMIME, { date: new Date(participations[i].dateTime) })
      }
    }
    statusBar.stop()
    return zip
  }

  public async getAbsencesFiles (studentId: string, limit?: string): Promise<AbsenceFilesResponse> {
    return (await this.getAbsenceFiles(studentId, limit !== undefined ? parseInt(limit, 10) : undefined, 0, {
      fields: {
        absenceFileState: 'creationDateTime,absenceStartDateTime,absenceEndDateTime,absenceType,absenceFileStatus,absenceReason,absenceRecurrence',
        absenceReason: 'code,longLabel'
      }
    })).sort((a, b) => new Date(a.currentState.creationDateTime).getTime() - new Date(b.currentState.creationDateTime).getTime())
  }

  public async getCommunications (folder: Folder, limit?: string): Promise<Array<{ communication: Communication, participations: Participation[] }>> {
    let offset = 0
    const boiteReception: Communication[] = await this.getCommunicationsFolder(folder.id, 100, offset)

    let n = boiteReception.length
    while (n !== 0 && (limit !== undefined ? parseInt(limit, 10) >= n : true)) {
      const newCommunications = await this.getCommunicationsFolder(folder.id, 100, offset, { include: '' })
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
        participations: await this.getCommunicationParticipations(c.id)
      }
    }))
    statusBar.stop()
    return result
  }

  public async getEvaluationPeriods (studentId: string, limit?: string): Promise<Array<Period & { matieres: Evaluation[] }>> {
    const evaluationSettings = await this.getEvaluationSettings(studentId, 100)
    if (evaluationSettings.length === 0) throw new Error('Aucun service d\'évaluation n\'a été trouvé.')
    if (!evaluationSettings[0].evaluationsDetailsAvailable) throw new Error('Le détail des notes n\'est pas disponible.')
    return await Promise.all(evaluationSettings[0].periods.map(async (period: Period) => ({
      ...period,
      matieres: await this.getEvaluation(studentId, period.id, limit !== undefined ? parseInt(limit, 10) : undefined)
    })))
  }

  public async participationToMIME (participation: Participation, subject: string, inReplyToCommunicationId?: string, withAttachments = true): Promise<string> {
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
        try {
          const data = (await this.downloadAttachment(attachment)) as ReadStream

          msg.addAttachment({
            contentType: attachment.mimeType,
            filename: attachment.name,
            inline: false,
            encoding: 'base64',
            data: (await streamToBuffer(data)).toString('base64')
          })
        } catch (e) {
          const err = e as Error
          console.error(chalk.redBright(`✘ ${err.name} : ${err.message}`))
        }
      }
    }
    return msg.asRaw()
  }

  public static periodsToCSV (periods: Array<Period & { matieres: Evaluation[] }>): string {
    const CSV_HEADERS = 'period,subject,dateTime,coefficient,scale,mark\n'
    return CSV_HEADERS + periods.map(p =>
      p.matieres.map(m =>
        m.evaluations.map(e =>
          [p.label, m.subject.label, e.dateTime, Math.round(e.coefficient * 100) / 100, e.scale, e.evaluationResult.mark ?? e.evaluationResult.nonEvaluationReason]
        )
      )).flat(2)
      .map(e => e.join(','))
      .join('\n')
  }

  public static onTokenRefresh (tokenSet: TokenSet, userId?: string): void {
    const credentials = getCredentials(userId)
    credentials.credentials.tokenSet = tokenSet
    setCredentials(credentials.credentials, credentials.userId)
    logger().warn(chalk.yellowBright(`Le jeton de ${credentials.userId} a été rafraichi automatiquement.`))
  }
}

export * from './Logger'
export * from './store'
