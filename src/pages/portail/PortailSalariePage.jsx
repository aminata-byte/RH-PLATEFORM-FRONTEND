import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Target,
  GraduationCap,
  FileText,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../../store/useAuthStore";
import { useCongesStore } from "../../store/useCongesStore";
import { usePerformanceStore } from "../../store/usePerformanceStore";
import { useFormationStore } from "../../store/useFormationStore";
import { useDocumentsStore } from "../../store/useDocumentsStore";
import { useCarriereStore } from "../../store/useCarriereStore";
import "./PortailSalariePage.css";

function PortailSalariePage() {
  const { user } = useAuth();

  const demandes = useCongesStore((s) => s.demandes);
  const objectifs = usePerformanceStore((s) => s.objectifs);
  const inscriptions = useFormationStore((s) => s.inscriptions);
  const documents = useDocumentsStore((s) => s.documents);
  const souhaits = useCarriereStore((s) => s.souhaits);

  const congesUtilisateur = useMemo(
    () => demandes.filter((c) => c.employeNom === user?.name),
    [demandes, user],
  );

  const objectifsUtilisateur = useMemo(
    () => objectifs.filter((o) => o.employeNom === user?.name),
    [objectifs, user],
  );

  const inscriptionsUtilisateur = useMemo(
    () => inscriptions.filter((i) => i.employeEmail === user?.email),
    [inscriptions, user],
  );

  const documentsUtilisateur = useMemo(
    () => documents.filter((d) => d.employeEmail === user?.email),
    [documents, user],
  );

  const souhaitsUtilisateur = useMemo(
    () => souhaits.filter((s) => s.employeEmail === user?.email),
    [souhaits, user],
  );

  const congesEnAttente = congesUtilisateur.filter(
    (c) => c.statut === "en_attente",
  ).length;

  const objectifsEnCours = objectifsUtilisateur.filter(
    (o) => o.statut === "en_cours",
  ).length;

  const formationsEnCours = inscriptionsUtilisateur.filter(
    (i) => i.statut === "en_attente" || i.statut === "confirmee",
  ).length;

  const prochainObjectif = useMemo(() => {
    const enCours = objectifsUtilisateur
      .filter((o) => o.statut === "en_cours")
      .sort((a, b) => new Date(a.echeance) - new Date(b.echeance));
    return enCours[0] ?? null;
  }, [objectifsUtilisateur]);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const prenom = user?.name?.split(" ")[0] ?? "";

  return (
    <div className="portail-page">
      <div className="portail-header">
        <h1>Bonjour {prenom}</h1>
        <p className="portail-subtitle">
          Voici un aperçu de votre espace personnel
        </p>
      </div>

      <div className="portail-stats">
        <div className="stat-card">
          <div className="stat-icon stat-icon-warning">
            <CalendarDays size={20} />
          </div>
          <div>
            <p className="stat-value">{congesEnAttente}</p>
            <p className="stat-label">Congés en attente</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-primary">
            <Target size={20} />
          </div>
          <div>
            <p className="stat-value">{objectifsEnCours}</p>
            <p className="stat-label">Objectifs en cours</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-secondary">
            <GraduationCap size={20} />
          </div>
          <div>
            <p className="stat-value">{formationsEnCours}</p>
            <p className="stat-label">Formations en cours</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-success">
            <FileText size={20} />
          </div>
          <div>
            <p className="stat-value">{documentsUtilisateur.length}</p>
            <p className="stat-label">Documents disponibles</p>
          </div>
        </div>
      </div>

      {prochainObjectif && (
        <div className="portail-highlight">
          <div className="portail-highlight-icon">
            <Target size={18} />
          </div>
          <div>
            <p className="portail-highlight-titre">
              Prochaine échéance : {prochainObjectif.titre}
            </p>
            <p className="portail-highlight-detail">
              {prochainObjectif.progression}% complété · Échéance le{" "}
              {formatDate(prochainObjectif.echeance)}
            </p>
          </div>
        </div>
      )}

      <h2 className="portail-section-title">Mon espace</h2>
      <div className="portail-cards">
        <Link to="/conges" className="portail-card">
          <div className="portail-card-icon">
            <CalendarDays size={22} />
          </div>
          <div className="portail-card-body">
            <p className="portail-card-titre">Congés & Absences</p>
            <p className="portail-card-detail">
              {congesEnAttente > 0
                ? `${congesEnAttente} demande(s) en attente`
                : "Aucune demande en attente"}
            </p>
          </div>
          <ArrowRight size={18} className="portail-card-arrow" />
        </Link>

        <Link to="/performance" className="portail-card">
          <div className="portail-card-icon">
            <Target size={22} />
          </div>
          <div className="portail-card-body">
            <p className="portail-card-titre">Performance</p>
            <p className="portail-card-detail">
              {objectifsEnCours > 0
                ? `${objectifsEnCours} objectif(s) en cours`
                : "Aucun objectif en cours"}
            </p>
          </div>
          <ArrowRight size={18} className="portail-card-arrow" />
        </Link>

        <Link to="/formation" className="portail-card">
          <div className="portail-card-icon">
            <GraduationCap size={22} />
          </div>
          <div className="portail-card-body">
            <p className="portail-card-titre">Formation</p>
            <p className="portail-card-detail">
              {formationsEnCours > 0
                ? `${formationsEnCours} formation(s) en cours`
                : "Découvrez le catalogue"}
            </p>
          </div>
          <ArrowRight size={18} className="portail-card-arrow" />
        </Link>

        <Link to="/documents" className="portail-card">
          <div className="portail-card-icon">
            <FileText size={22} />
          </div>
          <div className="portail-card-body">
            <p className="portail-card-titre">Documents RH</p>
            <p className="portail-card-detail">
              {documentsUtilisateur.length} document(s) disponible(s)
            </p>
          </div>
          <ArrowRight size={18} className="portail-card-arrow" />
        </Link>

        <Link to="/carriere" className="portail-card">
          <div className="portail-card-icon">
            <TrendingUp size={22} />
          </div>
          <div className="portail-card-body">
            <p className="portail-card-titre">Carrière</p>
            <p className="portail-card-detail">
              {souhaitsUtilisateur.length > 0
                ? `${souhaitsUtilisateur.length} souhait(s) soumis`
                : "Exprimez un souhait d'évolution"}
            </p>
          </div>
          <ArrowRight size={18} className="portail-card-arrow" />
        </Link>
      </div>
    </div>
  );
}

export default PortailSalariePage;
