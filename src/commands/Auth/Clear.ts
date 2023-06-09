import { createCommand } from 'commander'
import chalk from 'chalk'
import { clearCredentials, logger } from '../../SkolengoUser'

async function clear (): Promise<void> {
  clearCredentials()
  logger().warn(chalk.yellowBright("Tous les jetons ont été supprimés. Il sera nécessaire de s'authentifier à nouveau pour les prochaines commandes."))
}

export const ClearCommand = createCommand('clear')
  .description('supprimer toute la configuration de scolengo-cli')
  .action(clear)
