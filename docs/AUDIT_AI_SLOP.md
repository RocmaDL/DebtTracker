# Audit « AI slop » — DebtTracker

> Objectif : que le site ait une signature artistique propre, et ne ressemble pas à une page
> générée par défaut par une IA. Audit réalisé sur la V2 (refonte Next.js), puis appliqué.

## 1. C'est quoi, l'AI slop en web design ?

Le terme désigne les interfaces **génériques, interchangeables et sans point de vue** que
produisent les outils d'IA quand on ne leur impose aucune direction : techniquement propres,
mais identiques à des milliers d'autres pages. Les modèles convergent vers les mêmes
réflexes parce qu'ils reproduisent la « moyenne » des templates SaaS qu'ils ont vus.

Les marqueurs les plus cités :

| Famille | Marqueurs typiques |
|---|---|
| **Couleur** | Dégradé violet → bleu, orbes floues qui flottent derrière le hero, texte en dégradé, halos lumineux (*glow*) sur fond sombre, dark mode par réflexe, noir/blanc purs. |
| **Typographie** | Inter (ou Poppins) partout, une seule famille pour les titres et le texte, surtitres en capitales espacées au-dessus de chaque section, un mot en italique dans le titre. |
| **Composition** | Hero centré plein écran avec badge au-dessus du H1, rangée « 1 · 2 · 3 », trois cartes identiques (icône + titre + deux lignes), grille bento par défaut, nav « logo à gauche / liens au centre / CTA à droite », footer à 4 colonnes, tout centré, même padding partout. |
| **Matière** | Glassmorphism décoratif, coins très arrondis, cartes imbriquées, fausses interfaces flottantes dans le hero, emojis utilisés comme icônes, icônes Lucide/Heroicons partout. |
| **Mouvement** | Fondu au scroll sur chaque section, `hover:scale` sur chaque carte, easing élastique, dégradés animés. |
| **Rédaction** | Tirets cadratins (—) partout, formules creuses, chiffres inventés (« 10× plus rapide »), toasts de célébration pour chaque action. |

La parade n'est pas de « faire plus joli » mais de **faire des choix** : une ancre visuelle
mémorable par section, une typographie affirmée, une composition asymétrique, des éléments
dessinés pour ce produit précis, du mouvement orchestré plutôt que saupoudré.

Sources : [TeneX Studio — 8 signes](https://tenex.studio/en/blog/ai-slop-ui-8-signes/) ·
[925 Studios — guide](https://www.925studios.co/blog/ai-slop-web-design-guide) ·
[925 Studios — polices et dégradés](https://www.925studios.co/blog/ai-slop-design-tells) ·
[Developers Digest — 16 patterns](https://www.developersdigest.tech/blog/ai-design-slop-and-how-to-spot-it) ·
[Hallmark — anti-patterns](https://github.com/Nutlope/hallmark/blob/main/skills/hallmark/references/anti-patterns.md) ·
[no-slop-ui](https://github.com/LeoStehlik/no-slop-ui) ·
[Impeccable — Slop](https://impeccable.style/slop/) ·
[prg.sh — Why your AI keeps building the same purple gradient website](https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website)

## 2. Ce que la V2 faisait déjà bien

- Pas de violet, pas d'Inter : palette volt / ember propre au concept, famille Geist + **Geist Pixel**.
- Graphiques SVG faits main, avec info-bulles, lecture clavier et tableau alternatif.
- Grain photographique en SVG plutôt que des blobs « aurora ».
- Chiffres tabulaires dans les tableaux, focus visibles, `prefers-reduced-motion` respecté.
- Contenu réel et spécifique (règle métier, simulateur fonctionnel), pas de témoignages ni de faux logos clients.

## 3. Constats

Relevé automatique dans `src/` avant correction, puis revue visuelle page par page.

| # | Marqueur | Où | Gravité | Décision |
|---|---|---|---|---|
| 1 | **Texte en dégradé animé** (« en minutes. ») | `hero.tsx`, `.text-gradient-volt` | Critique | Supprimé → encre pleine, l'accent vient de la couleur et du graissage. |
| 2 | **Orbes floues décoratives** (9 occurrences `blur-3xl` / `blur-[120px]`) | hero, cartes du dashboard, niveau, onboarding, chrono, CTA final | Critique | Toutes supprimées. La profondeur vient des surfaces (`ink-850` → `ink-800`), pas de halos. |
| 3 | **Fausses interfaces flottantes** dans le hero | `hero-visual.tsx` | Critique | Remplacées par un **tableau d'affichage LED** qui joue le calcul (dépenses → dette → séance → solde 00:00). Une seule ancre, typographique, propre au produit. |
| 4 | **Badge au-dessus du H1** (« VITRINE · Projet portfolio ») | hero | Majeur | Supprimé ; la mention vitrine passe dans une ligne de signature sous les CTA. |
| 5 | **Nav « IA »** : capsule flottante en verre, logo / liens / CTA | `site-nav.tsx` | Majeur | Barre plate, non collante, liens regroupés à droite, filet fin. Plus de flou. |
| 6 | **Rangée 01 · 02 · 03** en trois cartes identiques | `concept.tsx` | Critique | Remplacée par une **phrase-équation éditoriale** en très grand corps, pictogrammes intégrés dans le texte. |
| 7 | **Grille bento de cartes icône + titre + 2 lignes** | `features.tsx` | Critique | Remplacée par une **fiche technique** en lignes séparées par des filets, avec une seule pièce forte (le chrono géant). |
| 8 | **Surtitres en capitales espacées** sur chaque section et chaque carte (41 occurrences) | `.eyebrow` global | Majeur | Supprimés sur la landing ; dans l'app, restylés en libellés discrets en casse normale. |
| 9 | **Fondu au scroll sur tout** (14 `<Reveal>`) | landing | Majeur | Supprimé. Une seule entrée orchestrée : l'animation du tableau LED. |
| 10 | **Emojis comme icônes** (catégories, activités, états vides, notes) | ~12 fichiers | Majeur | Remplacés par un **jeu de 13 pictogrammes pixel art dessinés à la main** (`pixel-icon.tsx`), cohérents avec Geist Pixel. |
| 11 | **Halos lumineux sur les boutons et marqueurs** (13 ombres `0 0 Npx`) | boutons, FAB, calendrier, anneaux | Majeur | Supprimés. Boutons à plat ; l'état actif se lit par la couleur. |
| 12 | **Coins très arrondis** (`rounded-2xl` × 27, cartes à 20 px) | partout | Mineur | Rayon réduit d'un cran (cartes 12 px, boutons 10 px) : plus « équipement de sport », moins « app générique ». |
| 13 | **Glassmorphism décoratif** (`backdrop-blur` × 9) | nav, toasts, info-bulles | Mineur | Conservé uniquement pour les barres collantes de l'app (fonctionnel : le contenu défile dessous). |
| 14 | **`hover:-translate-y` / `group-hover:scale`** | cartes concept, actions rapides | Mineur | Supprimés. |
| 15 | **Tirets cadratins** dans les textes (9) | titres, bandeau, métadonnées | Mineur | Remplacés par « · », deux-points ou une reformulation. |
| 16 | **Apostrophes droites** (`'`) dans un texte français | toute l'interface | Mineur | Apostrophes typographiques (’) et espaces fines insécables avant ? et !. |
| 17 | **Chiffre inventé** (« Prêt en 5 secondes ») | hero | Mineur | Supprimé. |
| 18 | **Toasts de célébration** pour des actions visibles (« Modification enregistrée », « Démo rechargée ») | actions | Mineur | Supprimés. Restent les toasts utiles : annulation, impact en minutes, dette soldée. |
| 19 | **`transition-all`** (3) | barres de progression | Mineur | Propriétés explicites. |
| 20 | **Même padding sur toutes les sections** | landing | Mineur | Rythme vertical varié selon le poids de chaque section. |
| 21 | **CTA final centré sur halo radial** | `footer.tsx` | Majeur | Composition alignée à gauche, très grand corps, sans halo. |
| 22 | **Dark mode permanent** | global | — | **Assumé** : c'est la DA choisie (« Night session », ambiance stade en nocturne). On évite le noir pur (`#050607`, légèrement teinté). |
| 23 | **Icônes Lucide** | app | — | **Conservées pour l'interface fonctionnelle** (navigation, actions), comme Linear ou Raycast. Retirées de la landing, où elles servaient de décor. |

## 4. Direction artistique retenue : « Tableau d'affichage »

Une seule idée, poussée partout : **le stade la nuit**. Le fast-food et le sport se lisent
comme des scores. Concrètement :

- **Le tableau LED** du hero : grille de points, chiffres Geist Pixel, lignes qui s'allument
  une à une, solde qui descend jusqu'à `00:00`. C'est l'ancre visuelle du site.
- **Pictogrammes pixel art** sur une grille 12 × 12, une seule couleur : ils partagent la
  voix de Geist Pixel et remplacent tous les emojis.
- **Typographie éditoriale** : très grands corps, compositions asymétriques, l'équation du
  concept écrite comme une phrase plutôt que découpée en cartes.
- **Couleur disciplinée** : volt = effort, ember = dette, rien d'autre ne crie. Pas de
  dégradé, pas de halo.
- **Mouvement orchestré** : une entrée par page, pas d'animation gratuite au survol.
