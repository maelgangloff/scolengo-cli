import { createCommand } from 'commander'
import { userIdOption } from '../Options'
import { clearCredentials } from '../../store'
import chalk from 'chalk'

async function clear (): Promise<void> {
  clearCredentials()
  console.log(chalk.greenBright("Toutes les données d'authentification ont été supprimées. Il sera nécessaire de s'authentifier à nouveau pour les prochaines commandes."))
}

export const ClearCommand = createCommand('clear')
  .addOption(userIdOption)
  .action(clear)
