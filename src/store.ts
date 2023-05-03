import Conf from 'conf'
import { AuthConfig } from 'scolengo-api/types/models/Common/Auth'

interface StoredCredentials {
  userId: string
  credentials: AuthConfig
}

const store = new Conf({ encryptionKey: 'U2hhcjNkIFNlY3JlVCBzY29sZW5nby1jbGk=' }) // Il ne s'agit pas d'une protection car le secret est public. C'est juste de l'offuscation du fichier de config local.

export function setCredentials (credentials: AuthConfig, userId: string): void {
  store.set(`credentials.${userId}`, { userId, credentials })
  store.set('lastUserId', userId)
}

export function getCredentials (userId?: string): StoredCredentials {
  if (userId !== undefined) {
    const credentials = store.get(`credentials.${userId}`, null)
    if (credentials === null) throw new Error('Impossible de trouver vos jetons, veuillez vous authentifier à nouveau.')
    return credentials as StoredCredentials
  }
  const lastUserId = store.get('lastUserId', null) as string | null
  if (lastUserId === null) throw new Error('Impossible de déterminer le dernier identifiant utilisé, veuillez le spécifier à nouveau.')

  const credentials = store.get(`credentials.${lastUserId}`, null)
  if (credentials === null) throw new Error('Impossible de trouver vos jetons, veuillez vous authentifier à nouveau.')

  return credentials as StoredCredentials
}

export function deleteCredentials (userId: string): void {
  store.delete(`credentials.${userId}`)
}

export function clearCredentials (): void {
  store.clear()
}
