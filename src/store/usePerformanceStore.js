import { create } from "zustand";
import { mockObjectifs, mockEvaluations } from "../services/mockPerformance";

export const usePerformanceStore = create((set) => ({
  objectifs: mockObjectifs,
  evaluations: mockEvaluations,

  ajouterObjectif: (objectif) =>
    set((state) => ({ objectifs: [objectif, ...state.objectifs] })),

  ajouterEvaluation: (evaluation) =>
    set((state) => ({ evaluations: [evaluation, ...state.evaluations] })),
}));
