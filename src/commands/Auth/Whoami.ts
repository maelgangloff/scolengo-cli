import { createCommand } from 'commander'
import { getCredentials } from '../../store'
import chalk from 'chalk'
import { Skolengo } from 'scolengo-api'
import { onTokenRefresh } from '../../functions/onTokenRefresh'

async function whoami ({ uid }: { uid: string | undefined }): Promise<void> {
  const credentials = getCredentials(uid)

  const user = await Skolengo.fromConfigObject(credentials.credentials, onTokenRefresh)
  const userInfo = await user.getUserInfo()

  console.log(chalk.gray(`UID : ${userInfo.id}`))
  console.log(chalk.greenBright(`Correctement authentifié en tant que ${userInfo.firstName} ${userInfo.lastName} !`))
}

export const WhoamiCommand = createCommand('whoami')
  .description("Vérifier si l'utilisateur courant est correctement authentifié")
  .option('-u, --uid <user_uid>', "Identifiant unique de l'utilisateur courant")
  .action(whoami)
