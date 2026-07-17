import { useEffect, useRef, useState } from "react";
import { Bell, LogOut, CheckCheck, Menu } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../store/useAuthStore";
import { useNotifications } from "../../../store/useNotificationsStore";
import "./Navbar.css";

const roleLabels = {
  admin_rh: "Admin RH",
  manager: "Manager",
  salarie: "Salarié",
};

const APERCU_MAX = 5;

function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const {
    notificationsUtilisateur,
    nonLues,
    marquerCommeLu,
    toutMarquerCommeLu,
  } = useNotifications();
  const [ouvert, setOuvert] = useState(false);
  const panneauRef = useRef(null);

  useEffect(() => {
    const handleClicExterieur = (e) => {
      if (panneauRef.current && !panneauRef.current.contains(e.target)) {
        setOuvert(false);
      }
    };
    document.addEventListener("mousedown", handleClicExterieur);
    return () => document.removeEventListener("mousedown", handleClicExterieur);
  }, []);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          className="icon-btn navbar-menu-btn"
          onClick={onToggleSidebar}
          title="Réduire / agrandir le menu"
        >
          <Menu size={20} />
        </button>
        <div className="navbar-brand">RH Platform</div>
      </div>
      <div className="navbar-actions">
        <div className="notif-wrapper" ref={panneauRef}>
          <button
            className="icon-btn"
            onClick={() => setOuvert((prev) => !prev)}
            title="Notifications"
          >
            <Bell size={20} />
            {nonLues > 0 && <span className="notif-badge">{nonLues}</span>}
          </button>

          {ouvert && (
            <div className="notif-panel">
              <div className="notif-panel-header">
                <span>Notifications</span>
                {nonLues > 0 && (
                  <button
                    className="notif-tout-lu"
                    onClick={toutMarquerCommeLu}
                  >
                    <CheckCheck size={14} />
                    Tout marquer comme lu
                  </button>
                )}
              </div>

              <div className="notif-list">
                {notificationsUtilisateur.length === 0 && (
                  <p className="notif-empty">Aucune notification.</p>
                )}
                {notificationsUtilisateur.slice(0, APERCU_MAX).map((notif) => (
                  <button
                    key={notif.id}
                    className={`notif-item${notif.lu ? "" : " notif-item-non-lu"}`}
                    onClick={() => marquerCommeLu(notif.id)}
                  >
                    <span className={`notif-dot notif-dot-${notif.type}`} />
                    <span className="notif-item-body">
                      <span className="notif-item-titre">{notif.titre}</span>
                      <span className="notif-item-message">
                        {notif.message}
                      </span>
                      <span className="notif-item-date">
                        {formatDate(notif.date)}
                      </span>
                    </span>
                  </button>
                ))}
              </div>

              <Link
                to="/notifications"
                className="notif-voir-tout"
                onClick={() => setOuvert(false)}
              >
                Voir toutes les notifications
              </Link>
            </div>
          )}
        </div>

        <div className="navbar-user">
          <span className="user-name">{user?.name ?? "Utilisateur"}</span>
          <span className="user-role">{roleLabels[user?.role] ?? ""}</span>
        </div>
        <button className="icon-btn" onClick={handleLogout} title="Se déconnecter">
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}

export default Navbar;
