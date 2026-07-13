import { useMemo, useState } from "react";
import { CheckCheck } from "lucide-react";
import { useNotifications } from "../../store/useNotificationsStore";
import "./NotificationsPage.css";

const typeLabels = {
  info: "Info",
  success: "Succès",
  warning: "Attention",
};

function NotificationsPage() {
  const { notificationsUtilisateur, marquerCommeLu, toutMarquerCommeLu } =
    useNotifications();
  const [typeFiltre, setTypeFiltre] = useState("all");
  const [statutFiltre, setStatutFiltre] = useState("all");

  const notificationsTriees = useMemo(
    () =>
      [...notificationsUtilisateur].sort(
        (a, b) => new Date(b.date) - new Date(a.date),
      ),
    [notificationsUtilisateur],
  );

  const notificationsFiltrees = useMemo(() => {
    return notificationsTriees.filter((n) => {
      const matchType = typeFiltre === "all" || n.type === typeFiltre;
      const matchStatut =
        statutFiltre === "all" ||
        (statutFiltre === "non_lu" && !n.lu) ||
        (statutFiltre === "lu" && n.lu);
      return matchType && matchStatut;
    });
  }, [notificationsTriees, typeFiltre, statutFiltre]);

  const nonLues = notificationsUtilisateur.filter((n) => !n.lu).length;

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div>
          <h1>Notifications</h1>
          <p className="notifications-subtitle">
            {nonLues > 0
              ? `${nonLues} notification(s) non lue(s)`
              : "Tout est à jour"}
          </p>
        </div>
        {nonLues > 0 && (
          <button className="btn-publier" onClick={toutMarquerCommeLu}>
            <CheckCheck
              size={16}
              style={{ marginRight: "8px", verticalAlign: "-2px" }}
            />
            Tout marquer comme lu
          </button>
        )}
      </div>

      <div className="notifications-toolbar">
        <select
          className="notifications-filter"
          value={statutFiltre}
          onChange={(e) => setStatutFiltre(e.target.value)}
        >
          <option value="all">Toutes</option>
          <option value="non_lu">Non lues</option>
          <option value="lu">Lues</option>
        </select>

        <select
          className="notifications-filter"
          value={typeFiltre}
          onChange={(e) => setTypeFiltre(e.target.value)}
        >
          <option value="all">Tous les types</option>
          {Object.entries(typeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="notifications-list">
        {notificationsFiltrees.map((notif) => (
          <button
            key={notif.id}
            className={`notification-card${notif.lu ? "" : " notification-card-non-lu"}`}
            onClick={() => marquerCommeLu(notif.id)}
          >
            <span className={`notif-dot notif-dot-${notif.type}`} />
            <span className="notification-card-body">
              <span className="notification-card-top">
                <span className="notification-card-titre">{notif.titre}</span>
                <span className="notification-card-date">
                  {formatDate(notif.date)}
                </span>
              </span>
              <span className="notification-card-message">
                {notif.message}
              </span>
            </span>
          </button>
        ))}

        {notificationsFiltrees.length === 0 && (
          <p className="notifications-empty">Aucune notification.</p>
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;
