import { createCommand } from 'commander'
import { clearCredentials } from '../../store'
import chalk from 'chalk'
import { logger } from '../../functions/Logger'

async function clear (): Promise<void> {
  clearCredentials()
  logger(chalk.greenBright("Tous les jetons ont été supprimés. Il sera nécessaire de s'authentifier à nouveau pour les prochaines commandes."))
}

export const ClearCommand = createCommand('clear')
  .description('supprimer toute la configuration de scolengo-cli')
  .action(clear)
