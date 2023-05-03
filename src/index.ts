#!/usr/bin/env node
import { Command } from 'commander'
import figlet from 'figlet'
import updateNotifier from 'update-notifier'
import chalk from 'chalk'
import * as pkg from '../package.json'
import { AuthCommand } from './commands/Auth'

updateNotifier({ pkg }).notify({
  message: `Mise à jour disponible :
${chalk.dim('{currentVersion}') + chalk.reset(' → ') + chalk.green('{latestVersion}')}
Lancer ${chalk.cyan('npm i -g scolengo-cli')} pour mettre à jour`
})

const program = new Command('scolengo')

program
  .version(pkg.version)
  .addHelpText('beforeAll', figlet.textSync(pkg.name) + '\n')
  .addHelpText('before', chalk.yellowBright(`Avertissement : Cet utilitaire n'est pas édité par Skolengo et n'est en aucun cas lié à cette marque.
Il s'agit d'une application non-officielle, Open Source et distribué sous licence GNU GPLv3.
Pour plus d'informations, le dépôt git est accessible en suivant ce lien : https://github.com/maelgangloff/scolengo-cli
`))
  .description("Exporter mes données accessibles depuis l'API Skolengo")
  .addCommand(AuthCommand)
  .parseAsync().catch((e: Error) => {
    if (e.message !== undefined) console.error(chalk.redBright(e.message))
    process.exit(1)
  })
