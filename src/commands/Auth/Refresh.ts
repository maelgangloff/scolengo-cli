import { createCommand } from 'commander'
import { getCredentials } from '../../store'
import chalk from 'chalk'
import { Skolengo, TokenSet } from 'scolengo-api'
import { onTokenRefreshSilent } from '../../functions/onTokenRefresh'

async function refresh ({ uid }: { uid: string | undefined }): Promise<void> {
  const credentials = getCredentials(uid)

  const oidClient = await Skolengo.getOIDClient(credentials.credentials.school)
  const newTokenSet = await oidClient.refresh(new TokenSet(credentials.credentials.tokenSet))
  onTokenRefreshSilent(newTokenSet)
  const claims = newTokenSet.claims()
  console.log(chalk.gray(`UID : ${claims.sub}`))
  console.log(chalk.greenBright(`Le jeton a correctement été renouvellé ! Ce nouveau jeton expire le : ${new Date(claims.exp * 1e3).toISOString()}`))
}

export const RefreshCommand = createCommand('refresh')
  .description("forcer le renouvellement de l'access token")
  .option('-u, --uid <user_uid>', "identifiant unique de l'utilisateur courant")
  .action(refresh)
