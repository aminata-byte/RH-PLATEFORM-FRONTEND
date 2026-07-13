import { useMemo, useState } from "react";
import {
  Briefcase,
  FileText,
  Clock,
  CheckCircle2,
  X,
  Upload,
} from "lucide-react";
import { useAuth } from "../../store/useAuthStore";
import { useRecrutementStore } from "../../store/useRecrutementStore";
import Badge from "../../components/common/Badge/Badge";
import "./RecrutementPage.css";

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
  const { role, user } = useAuth();

  const {
    offres,
    candidatures,
    ajouterOffre,
    toggleStatutOffre,
    ajouterCandidature,
    modifierStatutCandidature,
  } = useRecrutementStore();

  // Modal candidature
  const [offreSelectionnee, setOffreSelectionnee] = useState(null);
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [cvFichier, setCvFichier] = useState(null);
  const [lettreFichier, setLettreFichier] = useState(null);
  const [erreurForm, setErreurForm] = useState("");

  // Modal détail candidature (admin_rh / manager)
  const [candidatureSelectionneeId, setCandidatureSelectionneeId] = useState(null);

  // Modal publication
  const [modalPublication, setModalPublication] = useState(false);
  const [nouvelleOffre, setNouvelleOffre] = useState({
    titre: "",
    departement: "Technique",
    type: "CDI",
    localisation: "Dakar",
  });
  const [erreurOffre, setErreurOffre] = useState("");

  const isCandidat = role === "candidat";
  const canPublier = role === "admin_rh";

  const offresVisibles = useMemo(() => {
    if (isCandidat) {
      return offres.filter((o) => o.statut === "ouverte");
    }
    return offres;
  }, [isCandidat, offres]);

  const candidaturesVisibles = useMemo(() => {
    if (isCandidat) {
      return candidatures.filter((c) => c.candidatEmail === user?.email);
    }
    return candidatures;
  }, [candidatures, isCandidat, user]);

  const candidatureSelectionnee = useMemo(
    () => candidatures.find((c) => c.id === candidatureSelectionneeId) ?? null,
    [candidatures, candidatureSelectionneeId],
  );

  const stats = useMemo(() => {
    const ouvertes = offresVisibles.filter(
      (o) => o.statut === "ouverte",
    ).length;
    const total = candidaturesVisibles.length;
    const enCours = candidaturesVisibles.filter(
      (c) => c.statut === "recue" || c.statut === "en_entretien",
    ).length;
    const acceptees = candidaturesVisibles.filter(
      (c) => c.statut === "acceptee",
    ).length;
    return { ouvertes, total, enCours, acceptees };
  }, [offresVisibles, candidaturesVisibles]);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const dejaCandidate = (offreId) =>
    candidatures.some(
      (c) => c.offreId === offreId && c.candidatEmail === user?.email,
    );

  // --- Candidature ---
  const ouvrirModal = (offre) => {
    setOffreSelectionnee(offre);
    const [prenomInitial = "", ...resteNom] = (user?.name ?? "").split(" ");
    setPrenom(prenomInitial);
    setNom(resteNom.join(" "));
    setCvFichier(null);
    setLettreFichier(null);
    setErreurForm("");
  };

  const fermerModal = () => {
    setOffreSelectionnee(null);
  };

  const ouvrirDetailCandidature = (candidature) => {
    setCandidatureSelectionneeId(candidature.id);
  };

  const fermerDetailCandidature = () => {
    setCandidatureSelectionneeId(null);
  };

  const handleVoirFichier = (fichier) => {
    if (fichier instanceof File) {
      window.open(URL.createObjectURL(fichier), "_blank");
    }
  };

  const handlePasserEntretien = (id) => {
    modifierStatutCandidature(id, "en_entretien");
  };

  const handleAccepterCandidature = (id) => {
    modifierStatutCandidature(id, "acceptee");
  };

  const handleRefuserCandidature = (id) => {
    modifierStatutCandidature(id, "refusee");
  };

  const handleCvChange = (e) => {
    const fichier = e.target.files[0];
    if (fichier) setCvFichier(fichier);
  };

  const handleLettreChange = (e) => {
    const fichier = e.target.files[0];
    if (fichier) setLettreFichier(fichier);
  };

  const handleSoumettreCandidature = (e) => {
    e.preventDefault();

    if (!prenom.trim() || !nom.trim()) {
      setErreurForm("Merci de renseigner votre prénom et votre nom.");
      return;
    }
    if (!cvFichier) {
      setErreurForm("Merci de joindre votre CV.");
      return;
    }
    if (!lettreFichier) {
      setErreurForm("Merci de joindre votre lettre de motivation.");
      return;
    }

    const nouvelleCandidature = {
      id: candidatures.length + 1,
      offreId: offreSelectionnee.id,
      offreTitre: offreSelectionnee.titre,
      candidatNom: `${prenom.trim()} ${nom.trim()}`,
      candidatEmail: user?.email,
      dateCandidature: new Date().toISOString().slice(0, 10),
      statut: "recue",
      cvNom: cvFichier.name,
      lettreNom: lettreFichier.name,
      cvFile: cvFichier,
      lettreFile: lettreFichier,
    };

    ajouterCandidature(nouvelleCandidature);
    fermerModal();
  };

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
          <p className="recrutement-subtitle">
            {isCandidat
              ? "Découvrez nos offres et suivez vos candidatures"
              : "Gérez les offres et candidatures"}
          </p>
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
            <p className="stat-label">
              {isCandidat ? "Mes candidatures" : "Candidatures reçues"}
            </p>
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
        <h2 className="recrutement-section-title">
          Offres {isCandidat ? "disponibles" : "publiées"}
        </h2>
        {canPublier && (
          <button className="btn-publier" onClick={ouvrirModalPublication}>
            + Publier une offre
          </button>
        )}
      </div>

      <div className="offres-grid">
        {offresVisibles.map((offre) => (
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

            {isCandidat && (
              <button
                className="offre-postuler"
                disabled={dejaCandidate(offre.id)}
                onClick={() => ouvrirModal(offre)}
              >
                {dejaCandidate(offre.id) ? "Déjà postulé" : "Postuler"}
              </button>
            )}

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

        {offresVisibles.length === 0 && (
          <p className="recrutement-empty">
            Aucune offre disponible pour le moment.
          </p>
        )}
      </div>

      {/* Candidatures */}
      <h2 className="recrutement-section-title">
        {isCandidat ? "Mes candidatures" : "Candidatures reçues"}
      </h2>
      <div className="recrutement-table-wrapper">
        <table className="recrutement-table">
          <thead>
            <tr>
              {!isCandidat && <th>Candidat</th>}
              <th>Offre</th>
              <th>Date</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {candidaturesVisibles.map((candidature) => (
              <tr
                key={candidature.id}
                className={!isCandidat ? "row-clickable" : undefined}
                onClick={
                  !isCandidat
                    ? () => ouvrirDetailCandidature(candidature)
                    : undefined
                }
              >
                {!isCandidat && <td>{candidature.candidatNom}</td>}
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

            {candidaturesVisibles.length === 0 && (
              <tr>
                <td
                  colSpan={isCandidat ? 3 : 4}
                  className="recrutement-empty-cell"
                >
                  Aucune candidature pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de candidature */}
      {offreSelectionnee && (
        <div className="modal-overlay" onClick={fermerModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Postuler — {offreSelectionnee.titre}</h2>
              <button className="modal-close" onClick={fermerModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSoumettreCandidature} className="modal-form">
              <div className="form-group">
                <label htmlFor="prenom">Prénom *</label>
                <input
                  id="prenom"
                  type="text"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  placeholder="Ex: Ibrahima"
                />
              </div>

              <div className="form-group">
                <label htmlFor="nom">Nom *</label>
                <input
                  id="nom"
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Ex: Ba"
                />
              </div>

              <div className="form-group">
                <label htmlFor="cv">CV (PDF) *</label>
                <label className="file-upload">
                  <Upload size={16} />
                  <span>
                    {cvFichier ? cvFichier.name : "Choisir un fichier"}
                  </span>
                  <input
                    id="cv"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleCvChange}
                    hidden
                  />
                </label>
              </div>

              <div className="form-group">
                <label htmlFor="lettre">Lettre de motivation (PDF) *</label>
                <label className="file-upload">
                  <Upload size={16} />
                  <span>
                    {lettreFichier ? lettreFichier.name : "Choisir un fichier"}
                  </span>
                  <input
                    id="lettre"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleLettreChange}
                    hidden
                  />
                </label>
              </div>

              {erreurForm && <p className="modal-error">{erreurForm}</p>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={fermerModal}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-submit">
                  Envoyer ma candidature
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal détail candidature (admin_rh / manager) */}
      {candidatureSelectionnee && (
        <div className="modal-overlay" onClick={fermerDetailCandidature}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{candidatureSelectionnee.candidatNom}</h2>
              <button className="modal-close" onClick={fermerDetailCandidature}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-form">
              <div className="detail-row">
                <span className="detail-label">Offre</span>
                <span className="detail-value">
                  {candidatureSelectionnee.offreTitre}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date de candidature</span>
                <span className="detail-value">
                  {formatDate(candidatureSelectionnee.dateCandidature)}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Statut</span>
                <Badge
                  status={
                    statutCandidatureConfig[candidatureSelectionnee.statut]
                      .status
                  }
                >
                  {statutCandidatureConfig[candidatureSelectionnee.statut].label}
                </Badge>
              </div>

              <div className="detail-files">
                <button
                  type="button"
                  className="detail-file-link"
                  disabled={!candidatureSelectionnee.cvFile}
                  onClick={() =>
                    handleVoirFichier(candidatureSelectionnee.cvFile)
                  }
                >
                  <FileText size={16} />
                  {candidatureSelectionnee.cvNom}
                </button>
                <button
                  type="button"
                  className="detail-file-link"
                  disabled={!candidatureSelectionnee.lettreFile}
                  onClick={() =>
                    handleVoirFichier(candidatureSelectionnee.lettreFile)
                  }
                >
                  <FileText size={16} />
                  {candidatureSelectionnee.lettreNom}
                </button>
              </div>

              {canPublier && candidatureSelectionnee.statut !== "acceptee" && (
                <div className="modal-actions detail-actions">
                  {candidatureSelectionnee.statut === "recue" && (
                    <button
                      type="button"
                      className="btn-action-entretien"
                      onClick={() =>
                        handlePasserEntretien(candidatureSelectionnee.id)
                      }
                    >
                      Passer en entretien
                    </button>
                  )}
                  {candidatureSelectionnee.statut !== "refusee" && (
                    <button
                      type="button"
                      className="btn-action-accepter"
                      onClick={() =>
                        handleAccepterCandidature(candidatureSelectionnee.id)
                      }
                    >
                      Accepter
                    </button>
                  )}
                  {candidatureSelectionnee.statut !== "refusee" && (
                    <button
                      type="button"
                      className="btn-action-refuser"
                      onClick={() =>
                        handleRefuserCandidature(candidatureSelectionnee.id)
                      }
                    >
                      Refuser
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
