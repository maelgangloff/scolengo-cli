import { createCommand } from 'commander'
import { clearCredentials } from '../../store'
import chalk from 'chalk'

async function clear (): Promise<void> {
  clearCredentials()
  console.log(chalk.greenBright("Tous les jetons ont été supprimés. Il sera nécessaire de s'authentifier à nouveau pour les prochaines commandes."))
}

export const ClearCommand = createCommand('clear')
  .action(clear)
