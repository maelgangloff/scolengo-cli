#!/usr/bin/env node
import { Command } from 'commander'
import figlet from 'figlet'
import updateNotifier from 'update-notifier'
import chalk from 'chalk'
import * as pkg from '../package.json'
import { AuthCommand } from './commands/Auth'
import { ExportCommand } from './commands/Export'
import { BackupCommand } from './commands/Backup'
import { setQuiet } from './functions/Logger'

updateNotifier({ pkg }).notify({
  message: `Mise à jour disponible :
${chalk.dim('{currentVersion}') + chalk.reset(' → ') + chalk.green('{latestVersion}')}
Lancer ${chalk.cyan('npm i -g scolengo-cli')} pour mettre à jour`
})

const program = new Command('scolengo')

program
  .version(pkg.version)
  .addHelpText('before', figlet.textSync(pkg.name) + '\n')
  .addHelpText('before', chalk.yellowBright(`Avertissement : Cet utilitaire n'est pas édité par Skolengo et n'est en aucun cas lié à cette marque.
Il s'agit d'une application non-officielle, Open Source et distribué sous licence GNU GPLv3.
Le dépôt git est accessible en suivant ce lien : https://github.com/maelgangloff/scolengo-cli
`))
  .description("Exporter mes données accessibles depuis l'API Skolengo")
  .addCommand(AuthCommand)
  .addCommand(ExportCommand)
  .addCommand(BackupCommand)
  .option('-q, --quiet', 'mode silencieux', false)
  .hook('preSubcommand', (main: Command) => {
    if (main.opts().quiet === true) setQuiet(true)
  })
  .parseAsync().catch((e: Error) => {
    console.error(chalk.redBright(`✘ ${e.name} : ${e.message}`))
    process.exit(1)
  })
