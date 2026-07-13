import { create } from "zustand";
import { mockUsers } from "../services/mockUsers";
// import api from '../services/api' // à réactiver quand le backend Laravel sera prêt

const REGISTERED_USERS_KEY = "registeredUsers";
const PASSWORD_OVERRIDES_KEY = "passwordOverrides";

const lireStockage = (cle, defaut) => {
  const valeur = localStorage.getItem(cle);
  return valeur ? JSON.parse(valeur) : defaut;
};

export const useAuthStore = create((set, get) => ({
  user: lireStockage("user", null),
  registeredUsers: lireStockage(REGISTERED_USERS_KEY, []),
  passwordOverrides: lireStockage(PASSWORD_OVERRIDES_KEY, {}),
  loading: false,

  // --- MOCK : à remplacer par l'appel API Laravel plus tard ---
  login: (email, password) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        const { registeredUsers, passwordOverrides } = get();
        const tousLesComptes = [...mockUsers, ...registeredUsers];
        const found = tousLesComptes.find((u) => u.email === email);
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

  // --- MOCK : auto-inscription réservée aux candidats ---
  // Employés/managers restent créés par le RH (voir EmployesPage), pas d'auto-inscription pour ces rôles.
  register: (name, email, password) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        const { registeredUsers } = get();
        const tousLesComptes = [...mockUsers, ...registeredUsers];
        if (tousLesComptes.some((u) => u.email === email)) {
          reject(new Error("Un compte existe déjà avec cet email."));
          return;
        }

        const nouveauCompte = {
          id: Date.now(),
          name,
          email,
          password,
          role: "candidat",
        };

        const misAJour = [...registeredUsers, nouveauCompte];
        localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(misAJour));
        localStorage.setItem("token", "mock-token");
        localStorage.setItem("user", JSON.stringify(nouveauCompte));
        set({ registeredUsers: misAJour, user: nouveauCompte });
        resolve(nouveauCompte);
      }, 500);
    }),

  // --- MOCK : réinitialisation de mot de passe, sans envoi d'email réel ---
  // Le vrai flux (lien signé envoyé par email) viendra avec le backend Laravel.
  compteExiste: (email) => {
    const { registeredUsers } = get();
    return [...mockUsers, ...registeredUsers].some((u) => u.email === email);
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
