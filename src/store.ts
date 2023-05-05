import Conf from 'conf'
import { AuthConfig } from 'scolengo-api/types/models/Common/Auth'

export interface StoredCredentials {
  userId: string
  credentials: AuthConfig
}

const store = new Conf({ encryptionKey: 'U2hhcjNkIFNlY3JlVCBzY29sZW5nby1jbGk=' }) // Il ne s'agit pas d'une protection car le secret est public. C'est juste de l'offuscation du fichier de config local.

export function setCredentials (skolengoCredentials: AuthConfig, userId: string): void {
  store.set(`credentials.${userId}`, { userId, credentials: skolengoCredentials })
  store.set('lastUserId', userId)
}

export function getCredentials (userId?: string): StoredCredentials {
  if (userId !== undefined) {
    const credentials = store.get(`credentials.${userId}`, null)
    if (credentials === null) throw new Error(`Impossible de trouver les jetons de ${userId}, veuillez vous authentifier à nouveau.`)
    store.set('lastUserId', userId)

    return credentials as StoredCredentials
  }
  const lastUserId = store.get('lastUserId', null) as string | null
  if (lastUserId === null) throw new Error("Impossible de déterminer l'identifiant à considérer, veuillez le spécifier.")

  const credentials = store.get(`credentials.${lastUserId}`, null)
  if (credentials === null) throw new Error(`Impossible de trouver les jetons de ${lastUserId}, veuillez vous authentifier à nouveau.`)

  return credentials as StoredCredentials
}

export function deleteCredentials (userId: string): void {
  const lastUserId = store.get('lastUserId', null) as string | null
  if (lastUserId === userId) {
    store.set('lastUserId', null)
  }
  store.delete(`credentials.${userId}`)
}

export function clearCredentials (): void {
  store.clear()
}
