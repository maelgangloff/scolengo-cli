import { TokenSet } from 'scolengo-api'
import { getCredentials, setCredentials } from '../store'
import chalk from 'chalk'

export function onTokenRefresh (tokenSet: TokenSet, userId?: string): void {
  const credentials = getCredentials(userId)
  credentials.credentials.tokenSet = tokenSet
  setCredentials(credentials.credentials, credentials.userId)
  console.log(chalk.yellowBright(`Le jeton de ${credentials.userId} a été rafraichi automatiquement. Si la requête échoue, réessayer dans quelques secondes.`))
}
