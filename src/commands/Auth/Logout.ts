import { createCommand } from 'commander'
import { deleteCredentials, getCredentials } from '../../store'
import { Skolengo } from 'scolengo-api'
import chalk from 'chalk'

async function logout ({ uid }: { uid: string | undefined }): Promise<void> {
  const credentials = getCredentials(uid)
  const oidClient = await Skolengo.getOIDClient(credentials.credentials.school)
  await oidClient.revoke(credentials.credentials.tokenSet.refresh_token as string)
  deleteCredentials(credentials.userId)
  console.log(chalk.gray(`UID : ${credentials.userId}`))
  console.log(chalk.greenBright('La session de l\'utilisateur a bien été supprimée et le refresh token a été révoqué auprès du SSO.'))
}

export const LogoutCommand = createCommand('logout')
  .option('-u, --uid <user_uid>', "Identifiant unique de l'utilisateur courant")
  .action(logout)
