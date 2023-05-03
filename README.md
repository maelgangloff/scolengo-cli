# scolengo-cli
(EN COURS DE DEVELOPPEMENT)

Une application console non-officielle permettant d'exporter ses données provenant de l'API Skolengo.

Cet utilitaire utilise la librairie [scolengo-api](https://github.com/maelgangloff/scolengo-api) pour télécharger ses propres données depuis le serveur API.

## Usage
```
  ____            _                           ____ _     ___ 
 / ___|  ___ ___ | | ___ _ __   __ _  ___    / ___| |   |_ _|
 \___ \ / __/ _ \| |/ _ \ '_ \ / _` |/ _ \  | |   | |    | | 
  ___) | (_| (_) | |  __/ | | | (_| | (_) | | |___| |___ | | 
 |____/ \___\___/|_|\___|_| |_|\__, |\___/   \____|_____|___|
                               |___/                         
Usage: scolengo [options]

Export your data from Skolengo API

Options:
  -V, --version  output the version number
  -h, --help     display help for command
```

## Remarques importantes
 - Il est clairement mentionné que cette librairie est n'est pas officielle.
 - Ce module n'est pas une contrefaçon car il n'existe pas de module similaire édité officiellement.
 - Les utilisateurs ne peuvent accéder qu'à leurs propres données. Ils sont soumis au même processus d'authentification que celui implémenté dans l'application.
 - Les données des utilisateurs ne sont pas davantage exposées puisqu'un utilisateur ne peut accéder qu'à ses propres données. Personne n'a le contrôle sur cette limitation qui est inhérente au fonctionnement de l'API des serveurs de Skolengo.
 - Cette librairie ne se suffit pas à elle-même pour fonctionner. Il est nécessaire de l'importer dans un projet et l'utilisateur final est le seul responsable de son code et des éventuelles conséquences.
 - Tout utilisateur de cette librairie a *a priori* lu l'entièreté du fichier de licence GPLv3 disponible publiquement [LICENSE](https://github.com/maelgangloff/scolengo-cli/blob/master/LICENSE) ainsi que de ce présent fichier de présentation.
 - Tout utilisateur de cette librairie a *a priori* lu l'entièreté du code de ce projet avant toute utilisation.
 - Eu égard l'ensemble de ces remarques, les contributeurs et *a fortiori* l'auteur du projet ne peuvent être tenus responsables de tout dommage potentiel.
