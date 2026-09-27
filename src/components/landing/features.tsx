import { DrawnRow, LiveClock } from "./motion";

const SPECS = [
  ["Plan automatique", "La dette est répartie sur les créneaux restants du mois. Si une séance devient déraisonnable, l’app le signale et propose d’ajouter un créneau."],
  ["Saisie en cinq secondes", "Un bouton, et c’est noté. On voit l’impact en minutes avant de valider, et chaque ajout peut être annulé."],
  ["L’ardoise", "Une case par jour, un coup d’œil pour tout le trimestre : le vert s’intensifie avec l’effort, l’orange trahit les écarts."],
  ["Progression", "Sept niveaux, des séries et onze badges à débloquer. Des confettis quand la dette tombe à zéro, et c’est tout."],
  ["Rien ne sort de chez toi", "Pas de compte, pas d’inscription, aucun traceur. Tes données restent sur ton appareil."],
  ["Pour tout le monde", "Utilisable au clavier, lisible par les lecteurs d’écran, et les animations se calment si ton appareil le demande."],
];

export function Features() {
  return (
    <section id="dans-la-boite" className="scroll-mt-8 pb-28 sm:pb-36">
      <div className="led-matrix hairline border-y">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-end gap-8 px-5 py-14 sm:px-6 lg:grid-cols-[1fr_20rem] lg:py-20">
          <LiveClock className="text-[clamp(4rem,15vw,11rem)] text-fg" />
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Le chrono</h2>
            <p className="mt-3 text-fg-muted">
              Plein écran, lisible à deux mètres. L’anneau passe de l’ambre au vert à l’instant où tu commences à rembourser, et il
              continue de tourner même si tu quittes la page.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-20 grid max-w-6xl grid-cols-1 gap-8 px-5 sm:px-6 md:grid-cols-[14rem_1fr]">
        <h2 className="text-sm font-medium text-fg-subtle">Aussi dans la boîte</h2>
        <ul className="hairline grid grid-cols-1 border-t sm:grid-cols-2">
          {SPECS.map(([term, desc], i) => (
            <DrawnRow key={term} index={i % 2} className={`py-7 sm:pr-10 ${i % 2 === 1 ? "sm:border-l sm:border-white/[0.07] sm:pl-10" : ""}`}>
              <h3 className="text-lg font-semibold tracking-tight">{term}</h3>
              <p className="mt-2 text-fg-muted">{desc}</p>
            </DrawnRow>
          ))}
        </ul>
      </div>
    </section>
  );
}
