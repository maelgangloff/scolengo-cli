#!/usr/bin/env node
import { Command, Option } from 'commander'
import updateNotifier from 'update-notifier'
import chalk from 'chalk'
import * as pkg from '../package.json'
import { AuthCommand } from './commands/Auth'
import { ExportCommand } from './commands/Export'
import { BackupCommand } from './commands/Backup'
import { logger, setLogLevel } from './SkolengoUser'

updateNotifier({ pkg }).notify({
  message: `Mise à jour disponible :
${chalk.dim('{currentVersion}') + chalk.reset(' → ') + chalk.green('{latestVersion}')}
Lancer ${chalk.cyan('npm i -g scolengo-cli')} pour mettre à jour`
})

const program = new Command('scolengo')

program
  .version(pkg.version)
  .addHelpText('before', `                _                                   _ _ 
  ___  ___ ___ | | ___ _ __   __ _  ___         ___| (_)
 / __|/ __/ _ \\| |/ _ \\ '_ \\ / _\` |/ _ \\ _____ / __| | |
 \\__ \\ (_| (_) | |  __/ | | | (_| | (_) |_____| (__| | |
 |___/\\___\\___/|_|\\___|_| |_|\\__, |\\___/       \\___|_|_|
                             |___/                      
`)
  .addHelpText('before', chalk.yellowBright(`Avertissement : Cet utilitaire n'est pas édité par Skolengo et n'est en aucun cas lié à cette marque.
Il s'agit d'une application non-officielle, Open Source et distribué sous licence GNU GPLv3.
Le dépôt git est accessible en suivant ce lien : https://github.com/maelgangloff/scolengo-cli
`))
  .description("Exporter mes données accessibles depuis l'API Skolengo")
  .addCommand(AuthCommand)
  .addCommand(ExportCommand)
  .addCommand(BackupCommand)
  .addOption(new Option('-l, --logLevel [verbose|info|error]', 'niveau de log').default('info').choices(['verbose', 'info', 'error']))
  .hook('preSubcommand', (main: Command) => {
    const opts = main.opts()
    setLogLevel(opts.logLevel)
  })
  .parseAsync().catch((e: Error) => {
    logger().error((`✘ ${e.name} : ${e.message}`))
    process.exit(1)
  })
