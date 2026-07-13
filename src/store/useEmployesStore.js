import { create } from "zustand";
import { mockEmployes } from "../services/mockEmployes";

export const useEmployesStore = create((set) => ({
  employes: mockEmployes,

  ajouterEmploye: (employe) =>
    set((state) => ({ employes: [employe, ...state.employes] })),

  modifierEmploye: (id, champs) =>
    set((state) => ({
      employes: state.employes.map((e) =>
        e.id === id ? { ...e, ...champs } : e,
      ),
    })),

  supprimerEmploye: (id) =>
    set((state) => ({
      employes: state.employes.filter((e) => e.id !== id),
    })),
}));
