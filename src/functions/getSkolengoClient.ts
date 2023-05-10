import axios from 'axios'
import { logger, onTokenRefresh } from '.'
import { Skolengo } from 'scolengo-api'
import { AuthConfig } from 'scolengo-api/types/models/Common/Auth'
import { ClientRequest } from 'http'

export async function getSkolengoClient (credentials: AuthConfig): Promise<Skolengo> {
  const Logger = logger()

  const httpClient = axios.create()
  httpClient.interceptors.response.use(res => {
    const { host, path, method } = res.request as ClientRequest
    Logger.log({ level: 'verbose', message: `${method} ${res.status}:${res.statusText} https://${(host ?? '') + (path ?? '')}` })
    return res
  })

  return await Skolengo.fromConfigObject(credentials, onTokenRefresh, httpClient)
}
