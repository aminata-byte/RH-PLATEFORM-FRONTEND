import { create } from "zustand";
import { mockConges } from "../services/mockConges";

export const useCongesStore = create((set) => ({
  demandes: mockConges,

  ajouterDemande: (demande) =>
    set((state) => ({ demandes: [demande, ...state.demandes] })),

  validerDemande: (id) =>
    set((state) => ({
      demandes: state.demandes.map((d) =>
        d.id === id ? { ...d, statut: "validee" } : d,
      ),
    })),

  refuserDemande: (id) =>
    set((state) => ({
      demandes: state.demandes.map((d) =>
        d.id === id ? { ...d, statut: "refusee" } : d,
      ),
    })),
}));
