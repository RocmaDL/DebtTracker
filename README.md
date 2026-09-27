<div align="center">

# ⚡ DebtTracker

**Chaque burger se paie. En minutes.**

Une app qui convertit tes écarts fast-food en *dette de sport*, puis la répartit sur tes prochaines séances.

`Projet vitrine` · Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · 100 % front

</div>

---

## Le concept

| | Règle |
|---|---|
| 🍔 **Tu craques** | 1 € dépensé = *N* minutes de dette (taux réglable, 1 min/€ par défaut). |
| 🏋️ **Tu t'entraînes** | Seules les minutes **au-delà de ta durée standard** remboursent la dette. |
| 📅 **L'app planifie** | La dette restante est répartie sur les séances planifiées restantes du mois. |

La dette ne descend jamais sous zéro : le sport ne se « stocke » pas pour excuser les excès futurs.

## Un projet vitrine

- **Aucun backend, aucun compte** : l'état est géré par Zustand et persisté dans le `localStorage`.
- **Démo vivante** : un jeu de 9 semaines de données fictives est généré *relativement à la date du jour*, pour que l'app paraisse toujours active.
- Un bandeau permanent rappelle que les données sont fictives et locales. Réglages → *Recharger la démo* / *Partir de zéro*.

## Fonctionnalités

- **Landing page** : hero animé, bandeau défilant façon tableau de stade, simulateur interactif, coulisses du projet.
- **Onboarding** : explorer la démo en un clic, ou configurer taux, séance type et planning en 3 étapes.
- **Tableau de bord** : dette actuelle, évolution sur 30 jours, prochaine séance recommandée, série, niveau.
- **Saisie express** : bouton `+` (ou touche `N`), aperçu de l'impact avant validation, annulation par toast.
- **Chrono plein écran** : anneau de progression, survit au rechargement, réductible en pastille.
- **Calendrier** : séances honorées, manquées, bonus, planifiées et écarts, avec le détail de chaque jour.
- **Historique** : recherche, filtres, édition et suppression.
- **Progression** : XP, 7 niveaux, séries, 11 badges, graphiques hebdomadaires, dépenses par catégorie.
- **Accessibilité** : dialogues natifs (piège de focus, Échap), libellés ARIA, tableau alternatif aux graphiques, `prefers-reduced-motion` respecté.

## Direction artistique — « Night session »

Noir profond, un vert **volt** `#D4FF3A` pour l'effort, un orange **ember** `#FF5B3A` pour la dette.
Geist Sans pour lire, Geist Mono pour les libellés techniques, **Geist Pixel** pour l'esprit tableau d'affichage de stade (logo, chrono, numéros).
Grain photographique discret, halos lumineux, micro-animations Motion.

## Architecture

```
src/
├─ app/                  # Routes (App Router)
│  ├─ page.tsx           # Landing
│  ├─ app/               # L'application : /app, /calendrier, /historique, /progression, /reglages
│  └─ opengraph-image.tsx
├─ lib/                  # Cœur métier — fonctions pures, sans React
│  ├─ engine.ts          # Solde, planning, calendrier, agrégats
│  ├─ gamification.ts    # XP, niveaux, séries, badges
│  ├─ demo.ts            # Générateur de démo déterministe
│  ├─ dates.ts           # Dates en heure locale (jamais d'UTC implicite)
│  └─ store.ts           # Zustand + persistance localStorage
├─ hooks/                # useDerived, useHydrated, useToday…
└─ components/
   ├─ app/               # Vues, feuilles modales, chrono, onboarding
   ├─ charts/            # Graphiques SVG sur mesure
   ├─ landing/           # Sections de la landing
   └─ ui/                # Primitives du design system
```

Les calculs (solde, plan, séries, badges) sont des **fonctions pures testées** ; l'interface se contente de les afficher via un unique hook mémoïsé `useDerived()`.

📄 Le cahier des charges complet est dans [`docs/USER_STORIES.md`](docs/USER_STORIES.md) : 35 user stories avec leurs critères d'acceptation.

## Démarrer

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # tests unitaires (Vitest)
npm run lint
npm run build
```

## Déployer sur Vercel

Importer le dépôt sur [vercel.com/new](https://vercel.com/new) : Next.js est détecté automatiquement, aucune variable d'environnement n'est requise.
En option, `NEXT_PUBLIC_SITE_URL` définit l'URL canonique utilisée pour les images Open Graph (par défaut, l'URL de production Vercel est utilisée).

---

<sub>Conçu et développé par **Rocma Dimba-Lau**. Données fictives, stockage local, aucun tracking.</sub>
