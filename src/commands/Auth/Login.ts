import { createCommand } from 'commander'
import fs from 'node:fs'
import { AuthConfig } from 'scolengo-api/types/models/Common/Auth'
import chalk from 'chalk'
import { logger, setCredentials, SkolengoUser } from '../../SkolengoUser'

async function login (filePath: string): Promise<void> {
  if (!fs.existsSync(filePath)) throw new Error("Ce fichier n'existe pas.")

  const data: AuthConfig = JSON.parse(fs.readFileSync(filePath).toString())
  if (data.school === undefined || data.tokenSet === undefined) throw new Error("Vérifier l'intégrité du fichier d'authentification.")

  const user = await SkolengoUser.getSkolengoUser(data)
  const userInfo = await user.getUserInfo()
  setCredentials(data, userInfo.id)
  const Logger = logger()
  Logger.warn(chalk.yellowBright('Veuillez supprimer le fichier de configuration importé car il ne pourra bientôt plus être utilisé.'))
  Logger.info(chalk.greenBright(`✔ Félicitations, vous êtes authentifié en tant que ${userInfo.firstName} ${userInfo.lastName} !`))
}

export const LoginCommand = createCommand('login')
  .description("se connecter à partir d'un fichier de configuration obtenu avec https://github.com/maelgangloff/scolengo-token")
  .argument('<file>', 'le fichier contenant les jetons')
  .action(login)
