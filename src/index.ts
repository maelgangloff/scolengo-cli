#!/usr/bin/env node
import { Command } from 'commander'
import figlet from 'figlet'

console.log(figlet.textSync('Scolengo CLI'))

const program = new Command('scolengo')

program
  .version('0.1.0')
  .description('Export your data from Skolengo API')
  .parse(process.argv)
