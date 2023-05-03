import { createCommand } from 'commander'
import { LoginCommand } from './Login'
import { LogoutCommand } from './Logout'
import { ClearCommand } from './Clear'

export const AuthCommand = createCommand('auth')
  .description("Gestion de l'authentification")
  .addCommand(LoginCommand)
  .addCommand(LogoutCommand)
  .addCommand(ClearCommand)
