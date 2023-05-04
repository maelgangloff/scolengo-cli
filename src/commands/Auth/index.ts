import { createCommand } from 'commander'
import { LoginCommand } from './Login'
import { LogoutCommand } from './Logout'
import { ClearCommand } from './Clear'
import { WhoamiCommand } from './Whoami'
import { RefreshCommand } from './Refresh'

export const AuthCommand = createCommand('auth')
  .description("Gérer l'authentification")
  .addCommand(LoginCommand)
  .addCommand(LogoutCommand)
  .addCommand(ClearCommand)
  .addCommand(WhoamiCommand)
  .addCommand(RefreshCommand)
