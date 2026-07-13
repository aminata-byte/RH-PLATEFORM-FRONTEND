import { create } from "zustand";
import { mockOffres, mockCandidatures } from "../services/mockRecrutement";

export const useRecrutementStore = create((set) => ({
  offres: mockOffres,
  candidatures: mockCandidatures,

  ajouterOffre: (offre) =>
    set((state) => ({ offres: [offre, ...state.offres] })),

  toggleStatutOffre: (id) =>
    set((state) => ({
      offres: state.offres.map((o) =>
        o.id === id
          ? { ...o, statut: o.statut === "ouverte" ? "fermee" : "ouverte" }
          : o,
      ),
    })),

  ajouterCandidature: (candidature) =>
    set((state) => ({ candidatures: [...state.candidatures, candidature] })),

  modifierStatutCandidature: (id, statut) =>
    set((state) => ({
      candidatures: state.candidatures.map((c) =>
        c.id === id ? { ...c, statut } : c,
      ),
    })),
}));
