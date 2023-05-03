import { createCommand } from 'commander'
import { LoginCommand } from './Login'

export const AuthCommand = createCommand('auth')
  .description("Gestion de l'authentification")
  .addCommand(LoginCommand)
