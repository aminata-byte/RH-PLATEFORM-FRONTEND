import { create } from "zustand";
import { mockFormations, mockInscriptions } from "../services/mockFormations";

export const useFormationStore = create((set) => ({
  formations: mockFormations,
  inscriptions: mockInscriptions,

  ajouterFormation: (formation) =>
    set((state) => ({ formations: [formation, ...state.formations] })),

  toggleStatutFormation: (id) =>
    set((state) => ({
      formations: state.formations.map((f) =>
        f.id === id
          ? { ...f, statut: f.statut === "ouverte" ? "fermee" : "ouverte" }
          : f,
      ),
    })),

  ajouterInscription: (inscription) =>
    set((state) => ({ inscriptions: [...state.inscriptions, inscription] })),

  modifierStatutInscription: (id, statut) =>
    set((state) => ({
      inscriptions: state.inscriptions.map((i) =>
        i.id === id ? { ...i, statut } : i,
      ),
    })),
}));
