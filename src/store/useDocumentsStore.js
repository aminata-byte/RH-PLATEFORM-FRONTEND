import { create } from "zustand";
import { mockDocuments } from "../services/mockDocuments";

export const useDocumentsStore = create((set) => ({
  documents: mockDocuments,

  ajouterDocument: (document) =>
    set((state) => ({ documents: [document, ...state.documents] })),
}));
