import { create } from "zustand";
import { mockUsers } from "../services/mockUsers";
// import api from '../services/api' // à réactiver quand le backend Laravel sera prêt

const PASSWORD_OVERRIDES_KEY = "passwordOverrides";

const lireStockage = (cle, defaut) => {
  const valeur = localStorage.getItem(cle);
  return valeur ? JSON.parse(valeur) : defaut;
};

export const useAuthStore = create((set, get) => ({
  user: lireStockage("user", null),
  passwordOverrides: lireStockage(PASSWORD_OVERRIDES_KEY, {}),
  loading: false,

  // --- MOCK : à remplacer par l'appel API Laravel plus tard ---
  // Réservé aux comptes internes (admin RH, manager, salarié) — les candidats
  // n'ont pas de compte, ils postulent directement depuis la page publique.
  login: (email, password) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        const { passwordOverrides } = get();
        const found = mockUsers.find((u) => u.email === email);
        const motDePasseEffectif = found
          ? (passwordOverrides[email] ?? found.password)
          : null;

        if (found && motDePasseEffectif === password) {
          localStorage.setItem("token", "mock-token");
          localStorage.setItem("user", JSON.stringify(found));
          set({ user: found });
          resolve(found);
        } else {
          reject(new Error("Identifiants invalides"));
        }
      }, 500); // simule la latence réseau
    }),

  // --- MOCK : réinitialisation de mot de passe, sans envoi d'email réel ---
  // Le vrai flux (lien signé envoyé par email) viendra avec le backend Laravel.
  compteExiste: (email) => {
    return mockUsers.some((u) => u.email === email);
  },

  resetPassword: (email, nouveauMotDePasse) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!get().compteExiste(email)) {
          reject(new Error("Aucun compte associé à cet email."));
          return;
        }

        const misAJour = {
          ...get().passwordOverrides,
          [email]: nouveauMotDePasse,
        };
        localStorage.setItem(PASSWORD_OVERRIDES_KEY, JSON.stringify(misAJour));
        set({ passwordOverrides: misAJour });
        resolve();
      }, 500);
    }),

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null });
    return Promise.resolve();
  },
}));

export function useAuth() {
  const store = useAuthStore();
  return { ...store, role: store.user?.role };
}
