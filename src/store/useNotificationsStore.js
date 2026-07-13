import { useMemo } from "react";
import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import { mockNotifications } from "../services/mockNotifications";

export const useNotificationsStore = create((set) => ({
  notifications: mockNotifications,

  marquerCommeLu: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, lu: true } : n,
      ),
    })),

  toutMarquerCommeLu: (email) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.destinataireEmail === email ? { ...n, lu: true } : n,
      ),
    })),
}));

export function useNotifications() {
  const user = useAuthStore((s) => s.user);
  const notifications = useNotificationsStore((s) => s.notifications);
  const marquerCommeLuRaw = useNotificationsStore((s) => s.marquerCommeLu);
  const toutMarquerCommeLuRaw = useNotificationsStore(
    (s) => s.toutMarquerCommeLu,
  );

  const notificationsUtilisateur = useMemo(
    () => notifications.filter((n) => n.destinataireEmail === user?.email),
    [notifications, user],
  );

  const nonLues = notificationsUtilisateur.filter((n) => !n.lu).length;

  return {
    notificationsUtilisateur,
    nonLues,
    marquerCommeLu: marquerCommeLuRaw,
    toutMarquerCommeLu: () => toutMarquerCommeLuRaw(user?.email),
  };
}
