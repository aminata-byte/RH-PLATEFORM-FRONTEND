import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Target,
  Briefcase,
  GraduationCap,
  FileText,
  TrendingUp,
  User,
  FileBarChart,
} from "lucide-react";
import { useAuth } from "../../../store/useAuthStore";
import "./Sidebar.css";

const menuItems = [
  {
    label: "Tableau de bord",
    path: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin_rh", "manager"],
  },
  {
    label: "Employés",
    path: "/employes",
    icon: Users,
    roles: ["admin_rh", "manager"],
  },
  {
    label: "Congés & Absences",
    path: "/conges",
    icon: CalendarDays,
    roles: ["admin_rh", "manager", "salarie"],
  },
  {
    label: "Performance",
    path: "/performance",
    icon: Target,
    roles: ["admin_rh", "manager", "salarie"],
  },
  {
    label: "Recrutement",
    path: "/recrutement",
    icon: Briefcase,
    roles: ["admin_rh", "manager"],
  },
  {
    label: "Formation",
    path: "/formation",
    icon: GraduationCap,
    roles: ["admin_rh", "manager", "salarie"],
  },
  {
    label: "Documents RH",
    path: "/documents",
    icon: FileText,
    roles: ["admin_rh", "manager", "salarie"],
  },
  {
    label: "Carrière",
    path: "/carriere",
    icon: TrendingUp,
    roles: ["admin_rh", "manager", "salarie"],
  },
  {
    label: "Portail salarié",
    path: "/portail",
    icon: User,
    roles: ["salarie"],
  },
  {
    label: "Rapports",
    path: "/rapports",
    icon: FileBarChart,
    roles: ["admin_rh"],
  },
];

function Sidebar({ reduit = false }) {
  const { role } = useAuth();
  const visibleItems = menuItems.filter((item) => item.roles.includes(role));

  return (
    <aside className={`sidebar${reduit ? " sidebar-reduit" : ""}`}>
      <div className="sidebar-logo">
        <span className="sidebar-logo-text">RH Platform</span>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {visibleItems.map(({ label, path, icon: Icon }) => (
            <li key={path}>
              <NavLink
                to={path}
                title={reduit ? label : undefined}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
