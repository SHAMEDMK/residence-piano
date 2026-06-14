# Audit complet - Résidence Piano

Date de l'audit : 14 juin 2026

## Résumé exécutif

L'application est fonctionnelle et le build de production passe. Les principales fonctionnalités sont en place : cotisations, dépenses, annonces, contacts, calendrier, mode sombre, accès syndic par mot de passe et opérations Firestore en temps réel.

Points bloquants ou importants détectés :

- Critique : la protection syndic est uniquement côté client. Le mot de passe est présent dans le bundle et/ou dans `localStorage`; il peut être contourné via la console si les règles Firestore ne bloquent pas les écritures.
- Important : `npm run lint` échoue sur deux erreurs `react-hooks/set-state-in-effect` dans `AjoutAnnonce.jsx` et `AjoutDepense.jsx`.
- Important : `src/App.css`, `src/assets/react.svg` et `src/assets/vite.svg` semblent être des restes du template Vite et sont orphelins.
- Important : le bundle JS dépasse 500 kB après minification; Vite émet un avertissement de performance.

Résultats outillés :

- `npm run build` : OK.
- `npm run lint` : échec avec 2 erreurs.
- Diagnostics IDE lus via Cursor : aucune erreur signalée au moment de l'audit.

## 1. Revue des fichiers

### `src/components/`

#### `Accueil.jsx`

- Rôle : page d'accueil, cartes de synthèse : caisse, échéance, dernière dépense, rappel cotisations, prochaine intervention.
- Utilisation : utilisé par `App.jsx`.
- Code mort/imports inutilisés : aucun import inutilisé détecté.
- Remarques : plusieurs petits composants d'icônes internes sont utilisés localement.

#### `AjoutAnnonce.jsx`

- Rôle : formulaire d'ajout/modification d'annonce, écrit dans Firestore via `addDoc` ou `updateDoc`.
- Utilisation : utilisé par `App.jsx` sur la page Annonces, uniquement en accès syndic.
- Code mort/imports inutilisés : aucun import inutilisé évident.
- Problème : `useEffect` appelle `setFormValues` synchroniquement quand `editingAnnonce` change. ESLint React Hooks le signale comme erreur.

#### `AjoutDepense.jsx`

- Rôle : formulaire d'ajout/modification de dépense, gestion catégorie, date, justificatif et Firestore.
- Utilisation : utilisé par `App.jsx` sur la page Dépenses, uniquement en accès syndic.
- Code mort/imports inutilisés : aucun import inutilisé évident.
- Problème : `useEffect` appelle `setFormValues` et `setFileName` synchroniquement quand `editingDepense` change. ESLint React Hooks le signale comme erreur.

#### `Calendrier.jsx`

- Rôle : page calendrier, liste les interventions, permet ajout/modification/suppression en accès syndic.
- Utilisation : utilisé par `App.jsx`.
- Code mort/imports inutilisés : aucun import inutilisé évident.
- Remarques : utilise `addDoc`, `updateDoc`, `deleteDoc` correctement.

#### `Contacts.jsx`

- Rôle : page Contacts, affiche cartes résidents avec téléphone, email et statut cotisations.
- Utilisation : utilisé par `App.jsx`.
- Code mort/imports inutilisés : aucun import inutilisé évident.
- Remarques : statut cotisations calculé avec les utilitaires partagés.

#### `Footer.jsx`

- Rôle : pied de page discret.
- Utilisation : utilisé par `App.jsx`.
- Code mort/imports inutilisés : aucun.

#### `Header.jsx`

- Rôle : navigation principale, accès syndic par mot de passe, toggle thème sombre/clair.
- Utilisation : utilisé par `App.jsx`.
- Code mort/imports inutilisés : aucun import inutilisé évident.
- Remarques : navigation utilisable en flex-wrap sur mobile, mais pas de menu hamburger.

#### `JournalDepenses.jsx`

- Rôle : journal des dépenses, totaux financiers, filtre par catégorie, édition/suppression en accès syndic.
- Utilisation : utilisé par `App.jsx`.
- Code mort/imports inutilisés : l'export nommé `MONTANT_COTISATION` en fin de fichier semble inutile; il n'est pas importé ailleurs.
- Remarques : suppression Firestore via `deleteDoc` correctement intégrée.

#### `MurAnnonces.jsx`

- Rôle : mur d'annonces, affichage, édition et suppression en accès syndic.
- Utilisation : utilisé par `App.jsx`.
- Code mort/imports inutilisés : aucun import inutilisé évident.
- Remarques : suppression Firestore via `deleteDoc` correctement intégrée.

#### `ParametresSyndic.jsx`

- Rôle : formulaire de changement du mot de passe syndic local.
- Utilisation : utilisé par `App.jsx`, visible uniquement quand `isSyndic` est actif.
- Code mort/imports inutilisés : aucun.
- Remarques : le stockage local du mot de passe n'est pas une vraie sécurité applicative.

#### `ResumeCotisations.jsx`

- Rôle : résumé mensuel des cotisations.
- Utilisation : utilisé par `TableauCotisations.jsx`.
- Code mort/imports inutilisés : aucun.

#### `TableauCotisations.jsx`

- Rôle : tableau principal des cotisations, historique résident, édition contact résident, mise à jour des statuts.
- Utilisation : utilisé par `App.jsx`.
- Code mort/imports inutilisés : aucun import inutilisé évident.
- Remarques : composant devenu volumineux; il serait utile d'extraire la modale résident dans un composant séparé.

### `src/hooks/`

#### `useAnnonces.js`

- Rôle : écoute temps réel de la collection `annonces`.
- Utilisation : utilisé par `App.jsx`.
- Temps réel : oui, utilise `onSnapshot`.
- États : expose `annonces`, `loading`, `error`.
- Code mort/imports inutilisés : aucun.

#### `useCotisations.js`

- Rôle : écoute temps réel de la collection `cotisations` sur les années de la période.
- Utilisation : utilisé par `App.jsx` et `TableauCotisations.jsx`.
- Temps réel : oui, utilise `onSnapshot`.
- États : expose `cotisations`, `loading`, `error`.
- Code mort/imports inutilisés : aucun.
- Remarque : la requête `where('annee', 'in', annees)` est correcte tant que la liste d'années reste courte.

#### `useDepenses.js`

- Rôle : écoute temps réel de la collection `depenses`, normalise la catégorie.
- Utilisation : utilisé par `App.jsx`.
- Temps réel : oui, utilise `onSnapshot`.
- États : expose `depenses`, `loading`, `error`.
- Code mort/imports inutilisés : aucun.

#### `useInterventions.js`

- Rôle : écoute temps réel de la collection `interventions`, triée par date.
- Utilisation : utilisé par `App.jsx`.
- Temps réel : oui, utilise `onSnapshot`.
- États : expose `interventions`, `loading`, `error`.
- Code mort/imports inutilisés : aucun.

#### `useResidents.js`

- Rôle : écoute temps réel de la collection `residents`, normalise `telephone` et `email`.
- Utilisation : utilisé par `Accueil.jsx`, `Contacts.jsx`, `TableauCotisations.jsx`.
- Temps réel : oui, utilise `onSnapshot`.
- États : expose `residents`, `loading`, `error`.
- Code mort/imports inutilisés : aucun.

#### `useSyndicMode.js`

- Rôle : accès au contexte global syndic/thème.
- Utilisation : utilisé par `App.jsx`, `Header.jsx`, `Calendrier.jsx`, `TableauCotisations.jsx`.
- Code mort/imports inutilisés : aucun.

### `src/utils/`

#### `finance.js`

- Rôle : constantes métier, mot de passe syndic local, formatage montants, logique cotisations, calculs financiers.
- Utilisation : utilisé largement par composants et hooks.
- Code mort/imports inutilisés :
  - `getCurrentCotisationYear()` semble exportée mais non appelée.
  - le reste des exports principaux est utilisé.
- Remarque sécurité : `SYNDIC_PASSWORD` est visible côté client; ce n'est pas une protection forte.

### `src/data/`

#### `seedResidents.js`

- Rôle : initialise/migre les 9 résidents Firestore, ajoute `telephone` et `email` si absents.
- Utilisation : appelé dans `App.jsx` au démarrage.
- Code mort/imports inutilisés : aucun.
- Remarque : `getDocs(residentsRef)` lit toute la collection au démarrage. Acceptable pour 9 résidents; à revoir si la collection grandit.

### Fichiers hors périmètre demandé mais observés

#### `src/firebase.js`

- Rôle : initialise Firebase et exporte `db`.
- Utilisation : utilisé par hooks et composants Firestore.
- Vérification : `export const db = getFirestore(app)` est présent.

#### `src/App.css`

- Statut : orphelin probable.
- Détail : contient encore des styles du template Vite (`.hero`, `.counter`, `#next-steps`) et n'est pas importé.
- Recommandation : supprimer.

#### `src/assets/react.svg` et `src/assets/vite.svg`

- Statut : orphelins probables.
- Détail : aucun import détecté.
- Recommandation : supprimer.

## 2. Vérification Firebase

### Hooks temps réel

Tous les hooks demandés utilisent bien `onSnapshot` :

- `useResidents.js`
- `useCotisations.js`
- `useDepenses.js`
- `useAnnonces.js`
- `useInterventions.js`

### Écritures Firestore

Écritures observées :

- `addDoc` :
  - `AjoutAnnonce.jsx`
  - `AjoutDepense.jsx`
  - `Calendrier.jsx`
- `setDoc` :
  - `TableauCotisations.jsx` pour les cotisations
  - `TableauCotisations.jsx` pour les résidents
  - `seedResidents.js` via batch
- `updateDoc` :
  - `AjoutAnnonce.jsx`
  - `AjoutDepense.jsx`
  - `Calendrier.jsx`
- `deleteDoc` :
  - `MurAnnonces.jsx`
  - `JournalDepenses.jsx`
  - `Calendrier.jsx`

Les imports correspondent aux usages.

### Firebase config

`src/firebase.js` exporte bien `db`.

Attention : la config Firebase côté client est publique par nature. La vraie sécurité doit être assurée par Firebase Auth et les règles Firestore.

## 3. Gestion d'erreurs

### Hooks

Tous les hooks Firestore exposent `loading` et `error`.

### Composants avec affichage loading/error

- `TableauCotisations.jsx` : loading/error OK.
- `JournalDepenses.jsx` : loading/error OK, plus erreurs d'actions.
- `Calendrier.jsx` : loading/error OK, plus erreurs d'actions.
- `Contacts.jsx` : loading/error OK.
- `App.jsx` page Annonces : loading/error OK.
- `Accueil.jsx` : affiche erreur/chargement pour caisse, dépenses, rappel, interventions.
- `AjoutAnnonce.jsx`, `AjoutDepense.jsx`, `ParametresSyndic.jsx` : erreurs de formulaire affichées.

### Améliorations proposées

- Ajouter des toasts centralisés au lieu de messages locaux dispersés.
- Nettoyer les timers `setTimeout` dans les composants avec messages temporaires pour éviter les mises à jour après démontage.
- Harmoniser les messages d'erreur Firestore pour l'utilisateur final; actuellement certains messages techniques peuvent être affichés.

## 4. Responsive design mobile

### Points positifs

- L'accueil utilise `md:grid-cols-2` puis `xl:grid-cols-5`; les cartes passent en colonne sur mobile.
- Les pages Dépenses, Annonces et Calendrier utilisent des grilles qui deviennent une colonne sur mobile.
- Le tableau des cotisations est dans `overflow-x-auto`, donc lisible via scroll horizontal.
- Les modales utilisent `fixed inset-0`, `overflow-y-auto`, `px-4`, `py-8`, ce qui est adapté aux petits écrans.
- Les formulaires utilisent des champs pleine largeur.

### Points à surveiller

- Header : la navigation est en `flex-wrap`, mais avec 6 entrées elle peut devenir chargée sur mobile. Un menu hamburger serait préférable.
- Certains boutons icônes sont petits (`px-3 py-2`) et peuvent être inférieurs à 44x44 px. À améliorer pour accessibilité tactile.
- Les tableaux Dépenses et Cotisations ont du scroll horizontal; c'est acceptable, mais une vue carte mobile serait plus confortable.
- La modale résident de `TableauCotisations.jsx` est dense sur mobile; elle reste scrollable, mais pourrait être séparée en sections accordéon.

## 5. Accessibilité

### Points positifs

- Les boutons icônes d'édition/suppression ont des `aria-label` :
  - annonces
  - dépenses
  - interventions
  - cotisations
- Les modales principales utilisent `aria-modal` et `aria-labelledby`.
- Les pastilles de cotisations ont des `aria-label` contenant résident, mois et statut.
- Les icônes purement décoratives dans les cartes utilisent `aria-hidden`.

### Points à améliorer

- Les emojis visibles dans les boutons (`✏️`, `🗑️`, `🔒`, `🔓`, `☀️`, `🌙`) sont pratiques mais pas idéaux; ils devraient être accompagnés de texte visible ou d'une icône SVG plus contrôlée.
- Le contraste de certains textes colorés sur fonds très clairs semble correct, mais le mode sombre repose sur des surcharges CSS globales; certaines pastilles claires peuvent être moins harmonieuses.
- Les badges colorés devraient conserver un texte explicite, ce qui est déjà le cas pour catégories/interventions.
- Ajouter une gestion de focus plus robuste dans les modales : focus trap et fermeture via `Escape`.

## 6. Performance

### Points positifs

- Les imports Firebase sont modulaires (`firebase/firestore` avec fonctions nommées), pas d'import global de tout Firebase.
- `useCotisations` évite de recréer les années par défaut à chaque render grâce à `defaultCotisationYears`.

### Points à améliorer

- `npm run build` émet un avertissement : chunk JS supérieur à 500 kB.
- Plusieurs calculs sont refaits à chaque render :
  - tri/filtrage dépenses dans `JournalDepenses.jsx`
  - calculs de statuts dans `TableauCotisations.jsx`
  - calcul contacts et accueil
- Ajouter `useMemo` pour les listes triées/filtrées et les totaux pourrait réduire les recalculs.
- Ajouter `useCallback` pour certains handlers transmis aux enfants peut aider, mais ce n'est pas critique à la taille actuelle.
- Fractionner certaines pages en imports dynamiques (`React.lazy`) réduirait le bundle initial.

## 7. Sécurité

### État actuel

- Le mode syndic est contrôlé par `isSyndic` dans un contexte React.
- L'accès syndic est activé par un mot de passe côté client.
- Le mot de passe par défaut est exporté dans `finance.js`.
- Le mot de passe personnalisé est stocké dans `localStorage`.

### Conclusion sécurité

La protection syndic n'est pas robuste. Elle peut être contournée par un utilisateur technique :

- le mot de passe par défaut est visible dans le code livré au navigateur;
- `localStorage` est lisible/modifiable depuis la console;
- `isSyndic` est une barrière UI, pas une barrière serveur;
- si les règles Firestore autorisent les écritures, un utilisateur peut potentiellement appeler Firestore directement depuis la console.

### Recommandations sécurité

- Critique : mettre en place Firebase Authentication.
- Critique : protéger les collections Firestore par règles de sécurité serveur.
- Important : limiter les écritures aux utilisateurs authentifiés avec rôle syndic.
- Important : ne pas stocker de mot de passe applicatif dans `localStorage`.
- Important : déplacer la gestion d'administration vers des permissions Firebase, pas vers un contexte React.

## 8. Bugs potentiels

### Critiques

1. Sécurité Firestore non garantie côté serveur.
   - Risque : modification/suppression de données par contournement UI.
   - Correctif : Firebase Auth + règles Firestore strictes.

### Importants

1. `npm run lint` échoue.
   - Fichiers : `AjoutAnnonce.jsx`, `AjoutDepense.jsx`.
   - Cause : `setState` synchrones dans `useEffect`.
   - Correctif : dériver l'état initial avec une clé de remount, ou déplacer la synchronisation dans une logique de sélection explicite, ou ajuster le pattern d'édition.

2. Fichiers orphelins du template Vite.
   - Fichiers : `src/App.css`, `src/assets/react.svg`, `src/assets/vite.svg`.
   - Correctif : supprimer ces fichiers.

3. Mot de passe syndic local non synchronisé.
   - Risque : changer le mot de passe sur un navigateur ne le change pas pour les autres appareils.
   - Correctif : remplacer par Firebase Auth.

4. `showSuccessMessage()` utilise `setTimeout` sans cleanup.
   - Risque : setState après démontage.
   - Correctif : stocker le timer dans `useRef` et le nettoyer dans `useEffect` cleanup.

5. Date des annonces stockée comme `Date` côté Firestore.
   - Firestore convertit généralement en Timestamp, mais il faut vérifier la cohérence avec les règles et les écritures existantes.
   - Correctif : utiliser explicitement `Timestamp.fromDate(...)` pour homogénéiser.

### Cosmétiques / maintenabilité

1. `TableauCotisations.jsx` est trop volumineux.
   - Correctif : extraire `ResidentHistoryModal`, `StatusPill`, `ResidentEditForm`.

2. `Calendrier.jsx`, `AjoutAnnonce.jsx`, `AjoutDepense.jsx` dupliquent les patterns CRUD.
   - Correctif : extraire des helpers de formulaire/toast/confirmation.

3. Le Header mobile peut devenir encombré.
   - Correctif : menu hamburger sous `md`.

4. Export inutile dans `JournalDepenses.jsx`.
   - Correctif : supprimer `export { MONTANT_COTISATION }`.

## 9. Recommandations priorisées

### Critique

1. Mettre en place Firebase Auth et règles Firestore.
2. Remplacer le mot de passe local par une vraie authentification administrateur.

### Important

1. Corriger les 2 erreurs ESLint `react-hooks/set-state-in-effect`.
2. Supprimer les fichiers orphelins `App.css`, `react.svg`, `vite.svg`.
3. Ajouter un cleanup aux timers des messages temporaires.
4. Ajouter un menu mobile dans le Header.
5. Réduire le bundle avec du code splitting.

### Cosmétique

1. Remplacer les emojis d'action par des SVG ou boutons avec texte visible.
2. Extraire les gros composants en sous-composants.
3. Uniformiser les messages d'erreur et de succès.
4. Améliorer l'affichage mobile des tableaux avec une vue cartes.

## 10. Conclusion

L'application est globalement cohérente et couvre les workflows attendus d'une résidence : cotisations, dépenses, annonces, contacts et calendrier. Le build passe et l'architecture React/Firebase est fonctionnelle.

Les deux principaux sujets à traiter avant de considérer l'application comme robuste en production sont :

1. la sécurité : remplacer la protection client par Firebase Auth + règles Firestore;
2. la qualité outillée : corriger les erreurs ESLint actuellement présentes.

