# User stories — DebtTracker

> Cahier des charges fonctionnel de la refonte. Chaque story a des critères d'acceptation
> vérifiables ; elles ont guidé l'architecture, les écrans et les tests.

## Personas

| Persona | Contexte | Ce qu'il attend |
|---|---|---|
| **Léo, 27 ans — le gourmand sportif** | Va à la salle 2-3 fois par semaine, craque régulièrement sur un burger après le travail. | Déculpabiliser intelligemment : savoir *exactement* combien de minutes « rembourser » et quand. |
| **Sarah, recruteuse / visiteuse du portfolio** | Arrive depuis un lien, a 2 minutes, souvent sur mobile. | Comprendre le concept en 10 secondes, voir une app vivante sans créer de compte, juger la qualité du travail. |

## Règle métier de référence

- **1 € dépensé en fast-food = N minutes de dette** (N = taux de conversion, 1 par défaut).
- Une séance rembourse uniquement les minutes **au-delà de la durée standard** (60 min par défaut) :
  la séance standard est « due » de toute façon, seul l'effort supplémentaire compte.
- La dette ne descend jamais sous 0 : le sport ne se met pas « en réserve » pour excuser les excès futurs.
- Le plan répartit la dette restante sur les **séances planifiées restantes du mois** (à partir d'aujourd'hui).

---

## Épopée 0 — Vitrine

| ID | Story | Critères d'acceptation |
|---|---|---|
| V-1 | En tant que visiteuse, je veux comprendre le concept en un coup d'œil. | La landing affiche une accroche, une démonstration chiffrée (ex. burger 14 € → 14 min) et 3 étapes. |
| V-2 | En tant que visiteuse, je veux essayer l'app sans compte ni installation. | Un CTA « Lancer la démo » ouvre l'app avec un jeu de données réaliste, généré relativement à la date du jour. |
| V-3 | En tant que visiteuse, je veux savoir que c'est un projet vitrine. | Un bandeau persistant « Mode démo · données stockées dans ce navigateur » est visible dans l'app ; la landing le mentionne dans une section dédiée. |
| V-4 | En tant que visiteuse, je veux pouvoir tout remettre à zéro. | Réglages → « Recharger la démo » et « Partir de zéro », chacun avec confirmation. |
| V-5 | En tant que recruteuse, je veux voir la démarche derrière le projet. | Section « Coulisses » : stack, choix UX, lien vers le code source et vers ces user stories. |
| V-6 | En tant que visiteuse sur mobile, je veux une expérience native. | Navigation par barre d'onglets en bas + bouton d'action central ; aucune barre de défilement horizontale à 360 px. |

## Épopée 1 — Onboarding

| ID | Story | Critères d'acceptation |
|---|---|---|
| O-1 | En tant que nouvel utilisateur, je veux comprendre la règle avant de commencer. | Premier lancement → onboarding en étapes, avec indicateur de progression et possibilité de revenir en arrière. |
| O-2 | En tant que visiteuse pressée, je veux sauter la configuration. | Le premier écran propose « Explorer avec des données démo » (recommandé) ou « Configurer mon profil ». |
| O-3 | En tant qu'utilisateur, je veux choisir mon taux de conversion et ma durée standard. | Curseurs avec aperçu en direct (« un menu à 12 € = 18 min »). |
| O-4 | En tant qu'utilisateur, je veux définir mes jours d'entraînement. | Sélection des jours + heure ; au moins un jour requis pour continuer. |
| O-5 | En tant qu'utilisateur, je veux pouvoir revoir l'onboarding. | Réglages → « Revoir l'introduction ». |

## Épopée 2 — Suivre sa dette

| ID | Story | Critères d'acceptation |
|---|---|---|
| D-1 | En tant qu'utilisateur, je veux voir ma dette actuelle immédiatement. | Chiffre héros en minutes sur le tableau de bord, avec l'évolution sur 7 jours. |
| D-2 | En tant qu'utilisateur, je veux savoir combien faire à ma prochaine séance. | Carte « Prochaine séance » : date, heure, durée recommandée = standard + part de la dette. |
| D-3 | En tant qu'utilisateur, je veux être prévenu si le plan est irréaliste. | Si aucune séance planifiée ne reste ce mois-ci, ou si la séance recommandée dépasse 2× la standard, un conseil l'indique. |
| D-4 | En tant qu'utilisateur, je veux voir l'évolution de ma dette. | Graphique en aire sur 30 jours avec info-bulle au survol / focus. |
| D-5 | En tant qu'utilisateur sans dette, je veux être félicité. | État « Dette soldée » avec message positif ; confettis au moment où la dette passe à 0. |

## Épopée 3 — Saisir des données

| ID | Story | Critères d'acceptation |
|---|---|---|
| S-1 | En tant qu'utilisateur, je veux déclarer une dépense en moins de 5 secondes. | Bouton « + » accessible partout → feuille de saisie ; catégories en un tap (burger, pizza, tacos…), montant autofocus, date par défaut aujourd'hui. |
| S-2 | En tant qu'utilisateur, je veux voir l'impact avant de valider. | Aperçu en direct : « +14 min de dette ». |
| S-3 | En tant qu'utilisateur, je veux enregistrer une séance manuellement. | Durée pré-remplie avec la recommandation, choix de l'activité, aperçu « rembourse 12 min ». |
| S-4 | En tant qu'utilisateur, je veux chronométrer ma séance. | Chrono plein écran avec anneau de progression vers l'objectif ; survit à un rechargement de page ; « Terminer » crée la séance. |
| S-5 | En tant qu'utilisateur, je veux corriger ou supprimer une entrée. | Depuis l'historique ou le calendrier : édition dans la même feuille ; suppression avec toast « Annuler ». |
| S-6 | En tant qu'utilisateur, je veux des saisies valides. | Montants > 0 et ≤ 500 €, durées entre 1 et 600 min, dates non futures ; messages d'erreur explicites. |

## Épopée 4 — Calendrier & historique

| ID | Story | Critères d'acceptation |
|---|---|---|
| C-1 | En tant qu'utilisateur, je veux voir mon mois d'un coup d'œil. | Grille mensuelle : jours planifiés, séances faites, séances manquées, dépenses. Légende visible. |
| C-2 | En tant qu'utilisateur, je veux le détail d'un jour. | Tap sur un jour → détail des entrées + actions « Ajouter une séance / une dépense » pour ce jour. |
| C-3 | En tant qu'utilisateur, je veux naviguer entre les mois. | Flèches mois précédent / suivant + « Aujourd'hui » ; résumé du mois (dépensé, remboursé). |
| H-1 | En tant qu'utilisateur, je veux retrouver une entrée. | Historique groupé par jour, filtres Tout / Dépenses / Séances, recherche texte. |

## Épopée 5 — Motivation (gamification)

| ID | Story | Critères d'acceptation |
|---|---|---|
| G-1 | En tant qu'utilisateur, je veux sentir ma progression. | XP (1 par minute de sport, ×2 pour les minutes de remboursement) et niveaux nommés avec barre de progression. |
| G-2 | En tant qu'utilisateur, je veux être récompensé de ma régularité. | Série = nombre de séances planifiées honorées consécutivement ; affichée sur le tableau de bord. |
| G-3 | En tant qu'utilisateur, je veux des objectifs à débloquer. | Grille de badges (verrouillés / débloqués) avec condition affichée ; toast à chaque déblocage. |

## Épopée 6 — Réglages & données

| ID | Story | Critères d'acceptation |
|---|---|---|
| R-1 | En tant qu'utilisateur, je veux ajuster mes paramètres. | Prénom, taux, durée standard, planning hebdo ; recalcul instantané de toute l'app. |
| R-2 | En tant qu'utilisateur, je veux que mes données persistent. | Sauvegarde automatique dans le `localStorage` ; aucune donnée ne quitte le navigateur. |

## Épopée 7 — Qualité

| ID | Story | Critères d'acceptation |
|---|---|---|
| Q-1 | En tant qu'utilisateur au clavier ou lecteur d'écran, je veux utiliser l'app. | Focus visibles, libellés ARIA, dialogues avec piège de focus et fermeture par Échap, contrastes AA. |
| Q-2 | En tant qu'utilisateur sensible aux animations, je veux du calme. | `prefers-reduced-motion` respecté (animations et confettis désactivés). |
| Q-3 | En tant qu'utilisateur, je veux des dates justes. | Toutes les dates sont calculées en heure locale (correction du bug de décalage UTC de la version précédente). |
| Q-4 | En tant que développeur, je veux une logique fiable. | Moteur de calcul pur, couvert par des tests unitaires (Vitest). |
