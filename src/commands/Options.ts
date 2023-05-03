import { Option } from 'commander'

export const userIdOption = new Option('-u, --uid <user_uid>', "Identifiant unique de l'utilisateur courant")
export const studentIdOption = new Option('-s, --student <student_uid>', "Identifiant unique de l'étudiant courant")
