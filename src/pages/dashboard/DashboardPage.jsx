import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  CalendarDays,
  Target,
  Briefcase,
  GraduationCap,
  FileText,
  TrendingUp,
  FileBarChart,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../../store/useAuthStore";
import { useEmployesStore } from "../../store/useEmployesStore";
import { useCongesStore } from "../../store/useCongesStore";
import { usePerformanceStore } from "../../store/usePerformanceStore";
import { useRecrutementStore } from "../../store/useRecrutementStore";
import { useFormationStore } from "../../store/useFormationStore";
import { useDocumentsStore } from "../../store/useDocumentsStore";
import ProgressRing from "../../components/common/ProgressRing/ProgressRing";
import "./DashboardPage.css";

function DashboardPage() {
  const { role, user } = useAuth();
  const isAdmin = role === "admin_rh";

  const mockEmployes = useEmployesStore((s) => s.employes);
  const mockConges = useCongesStore((s) => s.demandes);
  const mockObjectifs = usePerformanceStore((s) => s.objectifs);
  const mockCandidatures = useRecrutementStore((s) => s.candidatures);
  const mockFormations = useFormationStore((s) => s.formations);
  const mockInscriptions = useFormationStore((s) => s.inscriptions);
  const mockDocuments = useDocumentsStore((s) => s.documents);

  const congesEnAttente = useMemo(
    () => mockConges.filter((c) => c.statut === "en_attente").length,
    [mockConges],
  );

  const objectifsEnCours = useMemo(
    () => mockObjectifs.filter((o) => o.statut === "en_cours").length,
    [mockObjectifs],
  );

  const employesActifs = useMemo(
    () => mockEmployes.filter((e) => e.statut === "actif").length,
    [mockEmployes],
  );

  const candidaturesEnCours = useMemo(
    () =>
      mockCandidatures.filter(
        (c) => c.statut === "recue" || c.statut === "en_entretien",
      ).length,
    [mockCandidatures],
  );

  const formationsOuvertes = useMemo(
    () => mockFormations.filter((f) => f.statut === "ouverte").length,
    [mockFormations],
  );

  const formationsEnCours = useMemo(
    () =>
      mockInscriptions.filter(
        (i) => i.statut === "en_attente" || i.statut === "confirmee",
      ).length,
    [mockInscriptions],
  );

  const mesDocuments = useMemo(
    () => mockDocuments.filter((d) => d.employeEmail === user?.email).length,
    [mockDocuments, user],
  );

  const objectifsAtteints = useMemo(
    () => mockObjectifs.filter((o) => o.statut === "atteint").length,
    [mockObjectifs],
  );

  const resume = isAdmin
    ? {
        titre: "Employés actifs",
        pourcentage: mockEmployes.length
          ? (employesActifs / mockEmployes.length) * 100
          : 0,
        details: [
          { label: "Total employés", value: mockEmployes.length },
          { label: "Actifs", value: employesActifs },
          { label: "En congé", value: congesEnAttente },
        ],
      }
    : {
        titre: "Objectifs atteints",
        pourcentage: mockObjectifs.length
          ? (objectifsAtteints / mockObjectifs.length) * 100
          : 0,
        details: [
          { label: "Total objectifs", value: mockObjectifs.length },
          { label: "Atteints", value: objectifsAtteints },
          { label: "En cours", value: objectifsEnCours },
        ],
      };

  const prenom = user?.name?.split(" ")[0] ?? "";

  const kpis = isAdmin
    ? [
        {
          label: "Employés actifs",
          value: `${employesActifs}/${mockEmployes.length}`,
          icon: Users,
          color: "primary",
        },
        {
          label: "Congés en attente",
          value: congesEnAttente,
          icon: CalendarDays,
          color: "warning",
        },
        {
          label: "Candidatures en cours",
          value: candidaturesEnCours,
          icon: Briefcase,
          color: "secondary",
        },
        {
          label: "Formations ouvertes",
          value: formationsOuvertes,
          icon: GraduationCap,
          color: "success",
        },
      ]
    : [
        {
          label: "Congés en attente (équipe)",
          value: congesEnAttente,
          icon: CalendarDays,
          color: "warning",
        },
        {
          label: "Objectifs en cours (équipe)",
          value: objectifsEnCours,
          icon: Target,
          color: "primary",
        },
        {
          label: "Formations en cours (équipe)",
          value: formationsEnCours,
          icon: GraduationCap,
          color: "secondary",
        },
        {
          label: "Mes documents",
          value: mesDocuments,
          icon: FileText,
          color: "success",
        },
      ];

  const cartes = [
    {
      to: "/employes",
      icon: Users,
      titre: "Employés",
      detail: `${employesActifs} employé(s) actif(s)`,
      roles: ["admin_rh", "manager"],
    },
    {
      to: "/conges",
      icon: CalendarDays,
      titre: "Congés & Absences",
      detail:
        congesEnAttente > 0
          ? `${congesEnAttente} demande(s) à traiter`
          : "Aucune demande en attente",
      roles: ["admin_rh", "manager"],
    },
    {
      to: "/performance",
      icon: Target,
      titre: "Performance",
      detail: `${objectifsEnCours} objectif(s) en cours`,
      roles: ["admin_rh", "manager"],
    },
    {
      to: "/recrutement",
      icon: Briefcase,
      titre: "Recrutement",
      detail: `${candidaturesEnCours} candidature(s) en cours`,
      roles: ["admin_rh", "manager"],
    },
    {
      to: "/formation",
      icon: GraduationCap,
      titre: "Formation",
      detail: `${formationsOuvertes} formation(s) ouverte(s)`,
      roles: ["admin_rh", "manager"],
    },
    {
      to: "/documents",
      icon: FileText,
      titre: "Documents RH",
      detail: `${mesDocuments} document(s) personnel(s)`,
      roles: ["admin_rh", "manager"],
    },
    {
      to: "/carriere",
      icon: TrendingUp,
      titre: "Carrière",
      detail: "Historique et souhaits d'évolution",
      roles: ["admin_rh", "manager"],
    },
    {
      to: "/rapports",
      icon: FileBarChart,
      titre: "Rapports",
      detail: "Vue d'ensemble et export",
      roles: ["admin_rh"],
    },
  ].filter((carte) => carte.roles.includes(role));

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Bonjour {prenom}</h1>
        <p className="dashboard-subtitle">
          {isAdmin
            ? "Vue d'ensemble de l'activité RH de l'entreprise"
            : "Vue d'ensemble de l'activité de votre équipe"}
        </p>
      </div>

      <div className="dashboard-body">
        <div className="dashboard-main">
          <div className="dashboard-stats">
            {kpis.map(({ label, value, icon: Icon, color }) => (
              <div className="stat-card" key={label}>
                <div className={`stat-icon stat-icon-${color}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="stat-value">{value}</p>
                  <p className="stat-label">{label}</p>
                </div>
              </div>
            ))}
          </div>

          <h2 className="dashboard-section-title">Accès rapide</h2>
          <div className="dashboard-cards">
            {cartes.map(({ to, icon: Icon, titre, detail }) => (
              <Link to={to} className="dashboard-card" key={to}>
                <div className="dashboard-card-icon">
                  <Icon size={22} />
                </div>
                <div className="dashboard-card-body">
                  <p className="dashboard-card-titre">{titre}</p>
                  <p className="dashboard-card-detail">{detail}</p>
                </div>
                <ArrowRight size={18} className="dashboard-card-arrow" />
              </Link>
            ))}
          </div>
        </div>

        <aside className="dashboard-summary">
          <p className="dashboard-summary-title">Résumé</p>
          <ProgressRing percentage={resume.pourcentage} label={resume.titre} />
          <div className="dashboard-summary-details">
            {resume.details.map(({ label, value }) => (
              <div className="dashboard-summary-row" key={label}>
                <span className="dashboard-summary-row-label">{label}</span>
                <span className="dashboard-summary-row-value">{value}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default DashboardPage;
