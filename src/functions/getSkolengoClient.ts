import axios from 'axios'
import { logger, onTokenRefresh } from '.'
import { Skolengo } from 'scolengo-api'
import { AuthConfig } from 'scolengo-api/types/models/Common/Auth'

export async function getSkolengoClient (credentials: AuthConfig): Promise<Skolengo> {
  const Logger = logger()

  const httpClient = axios.create()
  httpClient.interceptors.response.use(res => {
    const { config } = res
    Logger.http(`(${res.statusText}) ${config.method?.toUpperCase() ?? ''} ${config.baseURL ?? ''}${config.url ?? ''}`)
    return res
  })

  return await Skolengo.fromConfigObject(credentials, onTokenRefresh, httpClient)
}
