# AGENTS.md

## Objectif du projet

Construire et faire evoluer une application locale de dropshipping en gardant trois priorites :

- simplicite
- lisibilite
- modularite

Le projet doit rester facile a comprendre pour un debutant et simple a lancer sur Mac et Windows.

## Conventions du projet

- Utiliser Next.js App Router
- Utiliser TypeScript strict
- Garder Tailwind CSS pour le style
- Privilegier des composants UI simples plutot que des dependances lourdes
- Separer clairement UI, logique metier, donnees demo et types
- Garder un mode local qui fonctionne sans API externe

## Structure des dossiers

- `app/` : pages de l'application
- `components/` : composants de presentation, layout et petits blocs reutilisables
- `data/` : donnees mockees et valeurs par defaut
- `lib/` : calculs, generateurs, scoring et helpers
- `types/` : types partages
- `public/` : assets statiques si necessaire

## Regles de style

- Utiliser des noms de fichiers explicites
- Utiliser des noms de variables clairs et lisibles
- Garder les composants assez courts quand c'est possible
- Mettre la logique metier dans `lib/`, pas dans les pages
- Ajouter des commentaires seulement si le bloc n'est pas evident
- Privilegier ASCII dans les fichiers source
- Eviter les dependances non indispensables

## Comment ajouter un nouveau module

1. Ajouter les types necessaires dans `types/index.ts`
2. Ajouter les donnees de demonstration dans `data/demo-data.ts` si utile
3. Creer la logique metier dans un fichier dedie sous `lib/`
4. Creer la page sous `app/<nouveau-module>/page.tsx`
5. Ajouter l'entree de navigation dans `lib/navigation.ts`
6. Reutiliser les composants partages de `components/` avant d'en creer de nouveaux
7. Verifier que le module reste utilisable sans API externe

## Comment modifier un module sans casser le reste

- Verifier d'abord le type partage utilise par le module
- Modifier ensuite la logique metier correspondante
- Adapter enfin la page et l'affichage
- Si un exemple de demonstration depend de ce module, le mettre a jour dans `data/demo-data.ts`
- Eviter les changements globaux si un petit helper local suffit

## Compatibilite Mac et Windows

- Ne pas coder de chemins absolus
- Ne pas supposer un shell particulier dans le code applicatif
- Garder des scripts npm simples
- Eviter les commandes ou outils reserves a un seul OS
- Si une documentation contient une commande shell, fournir si possible la variante Mac et Windows

## Regle de priorite

Toujours privilegier :

- la simplicite avant l'abstraction
- la lisibilite avant l'optimisation prematuree
- la modularite avant la duplication complexe
- les fonctions pures et reutilisables pour les calculs

## Bonnes pratiques pour ce projet

- Une page = interface utilisateur du module
- Un fichier `lib/` = logique principale du module
- `data/demo-data.ts` = exemples de depart
- `types/index.ts` = schema commun
- `components/` = presentation reutilisable

## Evolutions futures recommandees

- Ajouter un dossier `services/` pour de futures integrations externes
- Ajouter un stockage local ou une base simple si vous voulez sauver des sessions
- Ajouter des tests TypeScript ou unitaires une fois Node.js installe sur la machine
