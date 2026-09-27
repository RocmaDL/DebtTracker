"use client";

import { toast } from "sonner";
import { celebrate } from "@/lib/celebrate";
import { balanceAt, buildTimeline } from "@/lib/engine";
import { today } from "@/lib/dates";
import { useApp } from "@/lib/store";
import type { Entry } from "@/lib/types";

/** Enregistrement / suppression d'entrées avec retours visuels (toasts, confettis, annulation). */
export function useEntryActions() {
  const addEntry = useApp((s) => s.addEntry);
  const updateEntry = useApp((s) => s.updateEntry);
  const removeEntry = useApp((s) => s.removeEntry);

  const debtWith = (entries: Entry[]) => {
    const { settings } = useApp.getState();
    const d = today();
    return balanceAt(buildTimeline(entries, settings, d), d);
  };

  const save = (entry: Entry, { isEdit = false } = {}) => {
    const before = debtWith(useApp.getState().entries);
    if (isEdit) updateEntry(entry);
    else addEntry(entry);
    const after = debtWith(useApp.getState().entries);

    if (before > 0 && after === 0) {
      celebrate();
      toast.success("Dette soldée !", { description: "Ardoise propre. Profite, tu l'as mérité." });
      return;
    }
    if (isEdit) {
      toast.success("Modification enregistrée");
      return;
    }
    if (entry.kind === "expense") {
      toast("Dépense ajoutée", {
        description: `+${after - before} min de dette · total ${after} min`,
        action: { label: "Annuler", onClick: () => removeEntry(entry.id) },
      });
    } else {
      const repaid = before - after;
      toast.success("Séance enregistrée", {
        description: repaid > 0 ? `−${repaid} min remboursées · reste ${after} min` : `+${entry.duration} XP · séance standard`,
        action: { label: "Annuler", onClick: () => removeEntry(entry.id) },
      });
    }
  };

  const remove = (id: string) => {
    const removed = removeEntry(id);
    if (!removed) return;
    toast(removed.kind === "expense" ? "Dépense supprimée" : "Séance supprimée", {
      action: { label: "Annuler", onClick: () => addEntry(removed) },
    });
  };

  return { save, remove };
}
