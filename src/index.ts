#!/usr/bin/env node
import { Command } from 'commander'
import figlet from 'figlet'

const program = new Command('scolengo')

program
  .version('0.1.0')
  .addHelpText('beforeAll', figlet.textSync('Scolengo CLI'))
  .addHelpText('before', `Cet utilitaire n'est pas édité par Skolengo ou Kosmos Education.
Il s'agit d'une application non-officielle, Open Source et distribué sous licence GNU GPLv3.
Pour plus d'informations, le dépôt git est accessible en suivant ce lien : https://github.com/maelgangloff/scolengo-cli
`)
  .description("Exporter ses données accessibles depuis l'API Skolengo")
  .parse(process.argv)
