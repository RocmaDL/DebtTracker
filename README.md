# DebtTracker Mobile (FastFood Edition)

Application mobile React Native pour suivre sa consommation de Fast Food sous forme de "dette" à rembourser par du sport.
L'application intègre des fonctionnalités sociales (groupes), un calendrier synchronisé et des notifications.

## Fonctionnalités Principales

*   **Suivi de Dette :**
    *   Ajoutez une dépense (Fast Food) -> Crée une dette (Minutes de sport).
    *   Ajoutez une séance de sport -> Rembourse la dette.
*   **Tableau de Bord :** Graphiques d'évolution, statistiques mensuelles, historique.
*   **Calendrier :** Vue mensuelle des séances, synchronisation avec Google/Apple Calendar.
*   **Notifications :** Rappels hebdomadaires basés sur votre emploi du temps sportif.
*   **Social (Groupes) :**
    *   Créez des groupes (Amis, Famille, Couple).
    *   Partagez automatiquement vos "craquages" et vos séances avec vos groupes.
    *   Code d'invitation unique pour rejoindre un groupe.
*   **Authentification :** Connexion via Email/Mot de passe (Firebase).

## Prérequis

*   Node.js & npm/yarn
*   Expo CLI (`npm install -g expo-cli`)
*   Compte Firebase (pour le backend)

## Installation

1.  **Cloner le projet**
    ```bash
    git clone <votre-repo>
    cd debt-tracker-mobile
    ```

2.  **Installer les dépendances**
    ```bash
    npm install
    ```

3.  **Configuration Firebase**
    *   Créez un projet sur [Firebase Console](https://console.firebase.google.com/).
    *   Activez **Authentication** (Email/Password).
    *   Activez **Firestore Database** (Mode test pour commencer).
    *   Récupérez votre configuration web (API Key, Project ID, etc.).
    *   Ouvrez `src/config/firebase.ts` et remplacez les valeurs par les vôtres :
        ```typescript
        const firebaseConfig = {
          apiKey: "VOTRE_API_KEY",
          authDomain: "...",
          projectId: "...",
          storageBucket: "...",
          messagingSenderId: "...",
          appId: "..."
        };
        ```

## Lancer l'application

```bash
# Lancer Expo Go (QR Code pour mobile)
npm start

# Lancer sur émulateur Android
npm run android

# Lancer sur simulateur iOS (Mac uniquement)
npm run ios
```

## Structure du Projet

*   `src/components` : Composants UI réutilisables (Boutons, Cartes, etc.).
*   `src/context` : Gestion d'état global (Auth, App Data).
*   `src/screens` : Écrans de l'application (Dashboard, Calendar, Groups, Auth).
*   `src/navigation` : Configuration de la navigation (Stacks, Tabs).
*   `src/services` : Logique métier et appels API (Firebase, Notifications).
*   `src/hooks` : Hooks personnalisés (Calendar Sync).

## Technologies

*   **Framework :** React Native (Expo SDK 50)
*   **Langage :** TypeScript
*   **Style :** NativeWind (Tailwind CSS)
*   **Backend :** Firebase (Auth, Firestore)
*   **Graphiques :** react-native-gifted-charts
*   **Icônes :** lucide-react-native
