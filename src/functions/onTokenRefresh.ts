import { TokenSet } from 'scolengo-api'
import { getCredentials, setCredentials, StoredCredentials } from '../store'
import chalk from 'chalk'

export function onTokenRefreshSilent (tokenSet: TokenSet, userId?: string): StoredCredentials {
  const credentials = getCredentials(userId)
  credentials.credentials.tokenSet = tokenSet
  setCredentials(credentials.credentials, credentials.userId)
  return credentials
}

export function onTokenRefreshVerbose (tokenSet: TokenSet, userId?: string): void {
  const credentials = onTokenRefreshSilent(tokenSet, userId)
  console.log(chalk.yellowBright(`Le jeton de ${credentials.userId} a été rafraichi automatiquement.`))
}
