import { createCommand } from 'commander'
import chalk from 'chalk'
import { getCredentials, getSkolengoClient, logger } from '../../functions'

async function whoami ({ uid }: { uid: string | undefined }): Promise<void> {
  const credentials = getCredentials(uid)

  const user = await getSkolengoClient(credentials.credentials)
  const userInfo = await user.getUserInfo()
  const Logger = logger()
  Logger.info(chalk.gray(`UID : ${userInfo.id}`))
  Logger.info(chalk.greenBright(`✔ Correctement authentifié en tant que ${userInfo.firstName} ${userInfo.lastName} !`))
}

export const WhoamiCommand = createCommand('whoami')
  .description("vérifier si l'utilisateur courant est correctement authentifié")
  .option('-u, --uid <user_uid>', "identifiant unique de l'utilisateur courant")
  .action(whoami)
