import { createCommand } from 'commander'
import fs from 'node:fs'
import { Skolengo } from 'scolengo-api'
import { AuthConfig } from 'scolengo-api/types/models/Common/Auth'
import { setCredentials } from '../../store'
import chalk from 'chalk'

async function login (filePath: string): Promise<void> {
  if (!fs.existsSync(filePath)) throw new Error("Ce fichier n'existe pas.")

  const data: AuthConfig = JSON.parse(fs.readFileSync(filePath).toString())
  if (data.school === undefined || data.tokenSet === undefined) throw new Error("Vérifier l'intégrité du fichier d'authentification.")

  const user = await Skolengo.fromConfigObject(data)
  const userInfo = await user.getUserInfo()
  setCredentials(data, userInfo.id)
  console.log(chalk.yellowBright('Veuillez supprimer le fichier de configuration importé car il ne pourra bientôt plus être utilisé.'))
  console.log(chalk.greenBright(`Félicitations, vous êtes authentifié en tant que ${userInfo.firstName} ${userInfo.lastName} !`))
}

export const LoginCommand = createCommand('login')
  .argument('<file>', 'Le fichier contenant les jetons')
  .action(login)
