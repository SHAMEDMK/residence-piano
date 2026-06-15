# Résidence Piano

Application React/Vite de gestion de syndic pour la Résidence Piano.

## Séparation Firebase local / production

L'application utilise des variables d'environnement Vite pour choisir le projet
Firebase.

- En production, Vercel utilise ses variables d'environnement et pointe vers le
  projet Firebase `residence-piano`.
- En local, créez un fichier `.env.local` avec les identifiants d'un projet
  Firebase de test/dev. Ce fichier est ignoré par Git et ne doit pas être
  partagé.

### Configurer le local

1. Créez un second projet Firebase, par exemple `residence-piano-dev`.
2. Activez Firestore dans ce projet.
3. Copiez `.env.example` vers `.env.local`.
4. Remplacez les valeurs par la configuration Firebase du projet dev.
5. Relancez `npm run dev`.

Tant que `.env.local` n'existe pas, le serveur local ne doit pas écrire dans la
base de production.

### Configurer Vercel

Dans Vercel, ajoutez les mêmes variables dans `Project Settings` >
`Environment Variables`, avec les valeurs du projet Firebase production. Les
variables doivent être disponibles pour l'environnement `Production`.

Le fichier `.env.production` peut rester sur votre ordinateur comme mémo local,
mais il est ignoré par Git et ne doit pas être poussé.

### Variables attendues

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Commandes

```bash
npm run dev
npm run build
```
