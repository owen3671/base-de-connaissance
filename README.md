# Atlas Personnel

Application web de base de connaissances personnelle, mobile-first, construite avec Next.js App Router, TypeScript, Tailwind CSS et Supabase.

## Ce que fait l'application

- dashboard avec compteurs, dernieres fiches, categories, notes importantes et fiches a revoir
- ajout rapide de fiche optimise mobile
- recherche avec filtres par categorie, importance et statut
- fiche detaillee avec sections lisibles, tags, mini quiz et suggestions de fiches proches
- page revision avec progression simple
- login / signup Supabase
- mode local de secours si Supabase n'est pas configure
- PWA installable avec manifest, icones et service worker leger

## Lancer le projet

1. Installer les dependances

```bash
npm install
```

2. Creer le fichier `.env.local` a partir de `.env.example`

```bash
cp .env.example .env.local
```

Sur Windows, vous pouvez aussi dupliquer le fichier manuellement dans l'explorateur.

3. Renseigner vos cles Supabase dans `.env.local`

4. Demarrer en local

```bash
npm run dev
```

Puis ouvrir [http://localhost:3000](http://localhost:3000).

## Configuration Supabase

1. Creer un projet Supabase
2. Ouvrir le SQL Editor
3. Coller le contenu de `supabase/schema.sql`
4. Recuperer l'URL du projet et la cle anon publique
5. Les placer dans `.env.local`
6. Dans `Authentication > URL Configuration`, definir :
   - `Site URL` = votre URL Vercel de production
   - `Redirect URLs` = votre URL Vercel avec `/auth/callback` et `/auth/confirm`
   - en local, vous pouvez aussi ajouter `http://localhost:3000/auth/callback`

Quand Supabase n'est pas configure, l'application reste utilisable en mode local avec des donnees de demonstration stockees dans le navigateur.

## Structure

- `app/` : pages, layout global, routes PWA
- `components/` : shell, formulaires, cartes et blocs UI reutilisables
- `data/` : donnees de demonstration
- `lib/` : constantes, filtres, logique de revision, stockage local, config Supabase
- `supabase/` : schema SQL de depart
- `types/` : types partages

## Notes produit

- mobile-first avec bottom navigation et floating action button
- design minimal et sobre
- compatible Mac et Windows
- architecture simple pour brancher de l'IA plus tard
