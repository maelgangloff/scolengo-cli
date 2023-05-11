import { TokenSet } from 'scolengo-api'
import { getCredentials, setCredentials } from './store'
import chalk from 'chalk'
import { logger } from './Logger'

export function onTokenRefresh (tokenSet: TokenSet, userId?: string): void {
  const credentials = getCredentials(userId)
  credentials.credentials.tokenSet = tokenSet
  setCredentials(credentials.credentials, credentials.userId)
  logger().warn(chalk.yellowBright(`Le jeton de ${credentials.userId} a été rafraichi automatiquement.`))
}
