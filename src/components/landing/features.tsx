const SPECS = [
  ["Plan automatique", "La dette est répartie sur les créneaux restants du mois. Si une séance devient déraisonnable, l’app le signale et propose d’ajouter un créneau."],
  ["Saisie en cinq secondes", "Un bouton, ou la touche N. On voit l’impact en minutes avant de valider, et chaque ajout s’annule depuis le toast."],
  ["Calendrier", "Séances honorées, manquées, bonus, écarts : tout le mois se lit d’un coup d’œil, chaque jour s’ouvre en détail."],
  ["Progression", "XP, sept niveaux, séries et onze badges. Des confettis quand la dette tombe à zéro, et c’est tout."],
  ["Local, vraiment", "Aucun serveur, aucun compte, aucun traceur. Les données restent dans le localStorage du navigateur."],
  ["Accessible", "Dialogues natifs, navigation au clavier, graphiques doublés d’un tableau, animations coupées si le système le demande."],
];

export function Features() {
  return (
    <section id="dans-la-boite" className="scroll-mt-8 pb-28 sm:pb-36">
      <div className="led-matrix hairline border-y">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-end gap-8 px-5 py-14 sm:px-6 lg:grid-cols-[1fr_20rem] lg:py-20">
          <p className="font-pixel text-[clamp(4.5rem,17vw,12rem)] leading-[0.85] tracking-tight text-fg" aria-hidden>
            01:12:<span className="text-volt">48</span>
          </p>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Le chrono</h2>
            <p className="mt-3 text-fg-muted">
              Plein écran, lisible à deux mètres. L’anneau passe de l’ambre au vert à l’instant où tu commences à rembourser. Il
              survit au rechargement et se réduit en pastille pendant que tu navigues.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-20 grid max-w-6xl grid-cols-1 gap-8 px-5 sm:px-6 md:grid-cols-[14rem_1fr]">
        <h2 className="text-sm font-medium text-fg-subtle">Aussi dans la boîte</h2>
        <dl className="hairline grid grid-cols-1 border-t sm:grid-cols-2">
          {SPECS.map(([term, desc], i) => (
            <div key={term} className={`hairline border-b py-7 sm:pr-10 ${i % 2 === 1 ? "sm:border-l sm:pl-10" : ""}`}>
              <dt className="text-lg font-semibold tracking-tight">{term}</dt>
              <dd className="mt-2 text-fg-muted">{desc}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
