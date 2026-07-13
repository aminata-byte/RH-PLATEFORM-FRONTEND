import { create } from "zustand";
import {
  mockHistoriqueCarriere,
  mockSouhaitsEvolution,
} from "../services/mockCarriere";

export const useCarriereStore = create((set) => ({
  historique: mockHistoriqueCarriere,
  souhaits: mockSouhaitsEvolution,

  ajouterEvenement: (evenement) =>
    set((state) => ({ historique: [evenement, ...state.historique] })),

  ajouterSouhait: (souhait) =>
    set((state) => ({ souhaits: [souhait, ...state.souhaits] })),

  modifierStatutSouhait: (id, statut) =>
    set((state) => ({
      souhaits: state.souhaits.map((s) =>
        s.id === id ? { ...s, statut } : s,
      ),
    })),
}));
