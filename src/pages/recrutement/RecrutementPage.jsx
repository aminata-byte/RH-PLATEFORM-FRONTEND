import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, FileText, Clock, CheckCircle2, X } from "lucide-react";
import { useAuth } from "../../store/useAuthStore";
import { useRecrutementStore } from "../../store/useRecrutementStore";
import Badge from "../../components/common/Badge/Badge";
import Pagination from "../../components/common/Pagination/Pagination";
import "./RecrutementPage.css";

const PAR_PAGE = 9;

const statutOffreConfig = {
  ouverte: { label: "Ouverte", status: "success" },
  fermee: { label: "Fermée", status: "default" },
};

const statutCandidatureConfig = {
  recue: { label: "Reçue", status: "default" },
  en_entretien: { label: "En entretien", status: "warning" },
  acceptee: { label: "Acceptée", status: "success" },
  refusee: { label: "Refusée", status: "danger" },
};

function RecrutementPage() {
  const { role } = useAuth();
  const navigate = useNavigate();

  const { offres, candidatures, ajouterOffre, toggleStatutOffre } =
    useRecrutementStore();

  // Modal publication
  const [modalPublication, setModalPublication] = useState(false);
  const [nouvelleOffre, setNouvelleOffre] = useState({
    titre: "",
    departement: "Technique",
    type: "CDI",
    localisation: "Dakar",
  });
  const [erreurOffre, setErreurOffre] = useState("");

  const canPublier = role === "admin_rh";

  const [pageOffres, setPageOffres] = useState(1);
  const totalPagesOffres = Math.max(1, Math.ceil(offres.length / PAR_PAGE));
  if (pageOffres > totalPagesOffres) setPageOffres(totalPagesOffres);
  const offresAffichees = offres.slice(
    (pageOffres - 1) * PAR_PAGE,
    pageOffres * PAR_PAGE,
  );

  const [pageCandidatures, setPageCandidatures] = useState(1);
  const totalPagesCandidatures = Math.max(1, Math.ceil(candidatures.length / PAR_PAGE));
  if (pageCandidatures > totalPagesCandidatures) setPageCandidatures(totalPagesCandidatures);
  const candidaturesAffichees = candidatures.slice(
    (pageCandidatures - 1) * PAR_PAGE,
    pageCandidatures * PAR_PAGE,
  );

  const stats = useMemo(() => {
    const ouvertes = offres.filter((o) => o.statut === "ouverte").length;
    const total = candidatures.length;
    const enCours = candidatures.filter(
      (c) => c.statut === "recue" || c.statut === "en_entretien",
    ).length;
    const acceptees = candidatures.filter((c) => c.statut === "acceptee").length;
    return { ouvertes, total, enCours, acceptees };
  }, [offres, candidatures]);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  // --- Publication d'offre ---
  const ouvrirModalPublication = () => {
    setNouvelleOffre({
      titre: "",
      departement: "Technique",
      type: "CDI",
      localisation: "Dakar",
    });
    setErreurOffre("");
    setModalPublication(true);
  };

  const fermerModalPublication = () => {
    setModalPublication(false);
  };

  const handlePublierOffre = (e) => {
    e.preventDefault();

    if (nouvelleOffre.titre.trim().length < 5) {
      setErreurOffre("Le titre du poste doit contenir au moins 5 caractères.");
      return;
    }

    const offreCreee = {
      id: offres.length + 1,
      titre: nouvelleOffre.titre,
      departement: nouvelleOffre.departement,
      type: nouvelleOffre.type,
      localisation: nouvelleOffre.localisation,
      statut: "ouverte",
      datePublication: new Date().toISOString().slice(0, 10),
    };

    ajouterOffre(offreCreee);
    fermerModalPublication();
  };

  const handleFermerOffre = (offreId) => {
    toggleStatutOffre(offreId);
  };

  return (
    <div className="recrutement-page">
      <div className="recrutement-header">
        <div>
          <h1>Recrutement</h1>
          <p className="recrutement-subtitle">Gérez les offres et candidatures</p>
        </div>
      </div>

      <div className="recrutement-stats">
        <div className="stat-card">
          <div className="stat-icon stat-icon-primary">
            <Briefcase size={20} />
          </div>
          <div>
            <p className="stat-value">{stats.ouvertes}</p>
            <p className="stat-label">Offres ouvertes</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-secondary">
            <FileText size={20} />
          </div>
          <div>
            <p className="stat-value">{stats.total}</p>
            <p className="stat-label">Candidatures reçues</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-warning">
            <Clock size={20} />
          </div>
          <div>
            <p className="stat-value">{stats.enCours}</p>
            <p className="stat-label">En cours</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-success">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="stat-value">{stats.acceptees}</p>
            <p className="stat-label">Acceptées</p>
          </div>
        </div>
      </div>

      {/* Offres */}
      <div className="recrutement-section-header">
        <h2 className="recrutement-section-title">Offres publiées</h2>
        {canPublier && (
          <button className="btn-publier" onClick={ouvrirModalPublication}>
            + Publier une offre
          </button>
        )}
      </div>

      <div className="offres-grid">
        {offresAffichees.map((offre) => (
          <div className="offre-card" key={offre.id}>
            <div className="offre-top">
              <p className="offre-titre">{offre.titre}</p>
              <Badge status={statutOffreConfig[offre.statut].status}>
                {statutOffreConfig[offre.statut].label}
              </Badge>
            </div>
            <p className="offre-meta">
              {offre.departement} · {offre.type} · {offre.localisation}
            </p>
            <p className="offre-date">
              Publiée le {formatDate(offre.datePublication)}
            </p>

            {canPublier && (
              <button
                className="offre-toggle-statut"
                onClick={() => handleFermerOffre(offre.id)}
              >
                {offre.statut === "ouverte"
                  ? "Clôturer l'offre"
                  : "Rouvrir l'offre"}
              </button>
            )}
          </div>
        ))}

        {offres.length === 0 && (
          <p className="recrutement-empty">
            Aucune offre publiée pour le moment.
          </p>
        )}
      </div>

      <Pagination
        page={pageOffres}
        totalPages={totalPagesOffres}
        onChange={setPageOffres}
      />

      {/* Candidatures */}
      <h2 className="recrutement-section-title">Candidatures reçues</h2>
      <div className="recrutement-table-wrapper">
        <table className="recrutement-table">
          <thead>
            <tr>
              <th>Candidat</th>
              <th>Offre</th>
              <th>Date</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {candidaturesAffichees.map((candidature) => (
              <tr
                key={candidature.id}
                className="row-clickable"
                onClick={() =>
                  navigate(`/recrutement/candidatures/${candidature.id}`)
                }
              >
                <td>{candidature.candidatNom}</td>
                <td>{candidature.offreTitre}</td>
                <td>{formatDate(candidature.dateCandidature)}</td>
                <td>
                  <Badge
                    status={statutCandidatureConfig[candidature.statut].status}
                  >
                    {statutCandidatureConfig[candidature.statut].label}
                  </Badge>
                </td>
              </tr>
            ))}

            {candidatures.length === 0 && (
              <tr>
                <td colSpan={4} className="recrutement-empty-cell">
                  Aucune candidature pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={pageCandidatures}
        totalPages={totalPagesCandidatures}
        onChange={setPageCandidatures}
      />

      {/* Modal de publication d'offre */}
      {modalPublication && (
        <div className="modal-overlay" onClick={fermerModalPublication}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Publier une nouvelle offre</h2>
              <button className="modal-close" onClick={fermerModalPublication}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePublierOffre} className="modal-form">
              <div className="form-group">
                <label htmlFor="titre">Titre du poste *</label>
                <input
                  id="titre"
                  type="text"
                  value={nouvelleOffre.titre}
                  onChange={(e) =>
                    setNouvelleOffre({
                      ...nouvelleOffre,
                      titre: e.target.value,
                    })
                  }
                  placeholder="Ex: Développeur Fullstack React/Laravel"
                />
              </div>

              <div className="form-group">
                <label htmlFor="departement">Département *</label>
                <select
                  id="departement"
                  value={nouvelleOffre.departement}
                  onChange={(e) =>
                    setNouvelleOffre({
                      ...nouvelleOffre,
                      departement: e.target.value,
                    })
                  }
                >
                  <option>Ressources Humaines</option>
                  <option>Technique</option>
                  <option>Commercial</option>
                  <option>Finance</option>
                  <option>Marketing</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="type">Type de contrat *</label>
                <select
                  id="type"
                  value={nouvelleOffre.type}
                  onChange={(e) =>
                    setNouvelleOffre({ ...nouvelleOffre, type: e.target.value })
                  }
                >
                  <option>CDI</option>
                  <option>CDD</option>
                  <option>Stage</option>
                  <option>Alternance</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="localisation">Localisation *</label>
                <input
                  id="localisation"
                  type="text"
                  value={nouvelleOffre.localisation}
                  onChange={(e) =>
                    setNouvelleOffre({
                      ...nouvelleOffre,
                      localisation: e.target.value,
                    })
                  }
                  placeholder="Ex: Dakar"
                />
              </div>

              {erreurOffre && <p className="modal-error">{erreurOffre}</p>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={fermerModalPublication}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-submit">
                  Publier l'offre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecrutementPage;
