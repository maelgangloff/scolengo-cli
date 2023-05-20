# scolengo-cli
<p align="center">
  <img src="https://github.com/The-Rabbit-Team/.github/blob/master/banners/scolengo-cli.png?raw=true" />
</p>

Une application console non-officielle permettant d'exporter ses données provenant de l'API Skolengo.
Cet utilitaire utilise la librairie [scolengo-api](https://github.com/maelgangloff/scolengo-api) pour permettre le téléchargement de vos propres données depuis le serveur API.

![Interactive CLI](docs/interactive.gif)

## Remarques importantes

 - Il est clairement mentionné que cette librairie est n'est pas officielle.
 - Ce module n'est pas une contrefaçon car il n'existe pas de module similaire édité officiellement.
 - Les utilisateurs ne peuvent accéder qu'à leurs propres données. Ils sont soumis au même processus d'authentification que celui implémenté dans l'application.
 - Les données des utilisateurs ne sont pas davantage exposées puisqu'un utilisateur ne peut accéder qu'à ses propres données. Personne n'a le contrôle sur cette limitation qui est inhérente au fonctionnement de l'API des serveurs de Skolengo.
 - Cette librairie ne se suffit pas à elle-même pour fonctionner. Il est nécessaire de l'importer dans un projet et l'utilisateur final est le seul responsable de son code et des éventuelles conséquences.
 - Tout utilisateur de cette librairie a *a priori* lu l'entièreté du fichier de licence GPLv3 disponible publiquement [LICENSE](https://github.com/maelgangloff/scolengo-cli/blob/master/LICENSE) ainsi que de ce présent fichier de présentation.
 - Tout utilisateur de cette librairie a *a priori* lu l'entièreté du code de ce projet avant toute utilisation.
 - Eu égard l'ensemble de ces remarques, les contributeurs et *a fortiori* l'auteur du projet ne peuvent être tenus responsables de tout dommage potentiel.


## Installation et mise à jour

```shell
npm i -g scolengo-cli
```

## Usage
### Commandes principales
```
                _                                   _ _ 
  ___  ___ ___ | | ___ _ __   __ _  ___         ___| (_)
 / __|/ __/ _ \| |/ _ \ '_ \ / _` |/ _ \ _____ / __| | |
 \__ \ (_| (_) | |  __/ | | | (_| | (_) |_____| (__| | |
 |___/\___\___/|_|\___|_| |_|\__, |\___/       \___|_|_|
                             |___/                      

Avertissement : Cet utilitaire n'est pas édité par Skolengo et n'est en aucun cas lié à cette marque.
Il s'agit d'une application non-officielle, Open Source et distribué sous licence GNU GPLv3.
Le dépôt git est accessible en suivant ce lien : https://github.com/maelgangloff/scolengo-cli

Usage: scolengo [options] [command]

Exporter mes données accessibles depuis l'API Skolengo

Options:
  -V, --version   output the version number
  -h, --help      display help for command

Commands:
  auth            gérer l'authentification
  export          exporter des données
  help [command]  display help for command

```

### Authentification
```
Usage: scolengo auth [options] [command]

Gérer l'authentification

Options:
  -h, --help         display help for command

Commands:
  login <file>       se connecter à partir d'un fichier de configuration obtenu avec https://github.com/maelgangloff/scolengo-token
  logout [options]   se déconnecter et révoquer le refresh token
  clear              supprimer toute la configuration de scolengo-cli
  whoami [options]   vérifier si l'utilisateur courant est correctement authentifié
  refresh [options]  forcer le renouvellement de l'access token
  help [command]     display help for command
```

### Exporter des données
#### Calendar
```
Usage: scolengo export calendar [options] [output-file]

Exporter l'agenda au format iCalendar (text/calendar)

Arguments:
  output-file                  chemin vers le fichier à sauvegarder

Options:
  -u, --uid <user_uid>         identifiant unique de l'utilisateur courant
  -s, --student <student_uid>  identifiant unique de l'étudiant à considérer
  -n, --limit <event_number>   nombre maximum d'évènements à télécharger (default: "100")
  -e, --ext <file_format>      format des donnés (choices: "ics", "json", default: "ics")
  -f, --from <from_date>       date de début YYYY-MM-DD
  -t, --to <to_date>           date de fin YYYY-MM-DD
  -h, --help                   display help for command
```

#### Mail
```
Usage: scolengo export mail [options] [output-file]

Exporter les courriels internes dans un zip au format MIME

Arguments:
  output-file                 chemin vers le fichier à sauvegarder

Options:
  -u, --uid <user_uid>        identifiant unique de l'utilisateur courant
  -n, --limit <event_number>  nombre maximum de communications à télécharger (default: "100")
  -f, --folder <folder_id>    dossier à considérer (choices: "INBOX", "SENT", "DRAFTS", "MODERATION", "TRASH", "PERSONAL", default: "INBOX")
  -e, --ext <file_format>     format des donnés (choices: "eml", "json", default: "eml")
  -h, --help                  display help for command
```

#### Notes
```
Usage: scolengo export notes [options] [output-file]

Exporter le relevé de notes

Arguments:
  output-file                  chemin vers le fichier à sauvegarder

Options:
  -u, --uid <user_uid>         identifiant unique de l'utilisateur courant
  -s, --student <student_uid>  identifiant unique de l'étudiant à considérer
  -n, --limit <event_number>   nombre maximum de notes à télécharger (default: "100")
  -e, --ext <file_format>      format des donnés (choices: "csv", "json", default: "csv")
  -h, --help                   display help for command
```

#### Bulletins
```
Usage: scolengo export bulletins [options] [output-file]

Exporter les bulletins périodiques dans un zip au format PDF

Arguments:
  output-file                  chemin vers le fichier à sauvegarder

Options:
  -u, --uid <user_uid>         identifiant unique de l'utilisateur courant
  -s, --student <student_uid>  identifiant unique de l'étudiant à considérer
  -n, --limit <event_number>   nombre maximum de communications à télécharger (default: "100")
  -h, --help                   display help for command
```

#### Absences
```
Usage: scolengo export absences [options] [output-file]

Exporter les absences

Arguments:
  output-file                  chemin vers le fichier à sauvegarder

Options:
  -u, --uid <user_uid>         identifiant unique de l'utilisateur courant
  -s, --student <student_uid>  identifiant unique de l'étudiant à considérer
  -n, --limit <event_number>   nombre maximum d'absences à télécharger (default: "100")
  -e, --ext <file_format>      format des donnés (choices: "csv", "json", default: "csv")
  -h, --help                   display help for command
```
