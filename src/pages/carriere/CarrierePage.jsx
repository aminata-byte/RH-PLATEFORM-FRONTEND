import { useMemo, useState } from "react";
import {
  TrendingUp,
  Award,
  Compass,
  Clock,
  X,
} from "lucide-react";
import { useAuth } from "../../store/useAuthStore";
import { useCarriereStore } from "../../store/useCarriereStore";
import { useEmployesStore } from "../../store/useEmployesStore";
import { typesEvenement } from "../../services/mockCarriere";
import { departements } from "../../services/mockEmployes";
import Badge from "../../components/common/Badge/Badge";
import Pagination from "../../components/common/Pagination/Pagination";
import "./CarrierePage.css";

const PAR_PAGE = 10;

const typeEvenementBadge = {
  Promotion: "success",
  Mutation: "default",
  "Changement de poste": "default",
  "Augmentation salariale": "success",
};

const statutSouhaitConfig = {
  en_attente: { label: "En attente", status: "warning" },
  examine: { label: "En cours d'examen", status: "default" },
  planifie: { label: "Planifié", status: "default" },
  realise: { label: "Réalisé", status: "success" },
  refuse: { label: "Refusé", status: "danger" },
};

function CarrierePage() {
  const { role, user } = useAuth();

  const {
    historique,
    souhaits,
    ajouterEvenement,
    ajouterSouhait,
    modifierStatutSouhait,
  } = useCarriereStore();
  const mockEmployes = useEmployesStore((s) => s.employes);

  const [souhaitSelectionneId, setSouhaitSelectionneId] = useState(null);

  const [modalEvenement, setModalEvenement] = useState(false);
  const [nouvelEvenement, setNouvelEvenement] = useState({
    employeEmail: mockEmployes[0]?.email ?? "",
    type: typesEvenement[0],
    ancienPoste: "",
    nouveauPoste: "",
    departement: departements[0],
    commentaire: "",
  });
  const [erreurEvenement, setErreurEvenement] = useState("");

  const [modalSouhait, setModalSouhait] = useState(false);
  const [nouveauSouhait, setNouveauSouhait] = useState({
    posteSouhaite: "",
    mobiliteGeographique: false,
    commentaire: "",
  });
  const [erreurSouhait, setErreurSouhait] = useState("");

  const canGerer = role === "admin_rh";
  const vuePersonnelle = role === "manager" || role === "salarie";

  const historiqueVisible = useMemo(() => {
    if (vuePersonnelle) {
      return historique.filter((h) => h.employeEmail === user?.email);
    }
    return historique;
  }, [historique, vuePersonnelle, user]);

  const souhaitsVisibles = useMemo(() => {
    if (vuePersonnelle) {
      return souhaits.filter((s) => s.employeEmail === user?.email);
    }
    return souhaits;
  }, [souhaits, vuePersonnelle, user]);

  const souhaitSelectionne = useMemo(
    () => souhaits.find((s) => s.id === souhaitSelectionneId) ?? null,
    [souhaits, souhaitSelectionneId],
  );

  const stats = useMemo(() => {
    const anneeActuelle = new Date().getFullYear();
    const totalEvenements = historiqueVisible.length;
    const promotions = historiqueVisible.filter(
      (h) =>
        h.type === "Promotion" &&
        new Date(h.date).getFullYear() === anneeActuelle,
    ).length;
    const enAttente = souhaitsVisibles.filter(
      (s) => s.statut === "en_attente",
    ).length;
    const mobilites = souhaitsVisibles.filter(
      (s) => s.mobiliteGeographique,
    ).length;
    return { totalEvenements, promotions, enAttente, mobilites };
  }, [historiqueVisible, souhaitsVisibles]);

  const [pageHistorique, setPageHistorique] = useState(1);
  const totalPagesHistorique = Math.max(1, Math.ceil(historiqueVisible.length / PAR_PAGE));
  if (pageHistorique > totalPagesHistorique) setPageHistorique(totalPagesHistorique);
  const historiqueAffiche = historiqueVisible.slice(
    (pageHistorique - 1) * PAR_PAGE,
    pageHistorique * PAR_PAGE,
  );

  const [pageSouhaits, setPageSouhaits] = useState(1);
  const totalPagesSouhaits = Math.max(1, Math.ceil(souhaitsVisibles.length / PAR_PAGE));
  if (pageSouhaits > totalPagesSouhaits) setPageSouhaits(totalPagesSouhaits);
  const souhaitsAffiches = souhaitsVisibles.slice(
    (pageSouhaits - 1) * PAR_PAGE,
    pageSouhaits * PAR_PAGE,
  );

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  // --- Historique (admin_rh) ---
  const ouvrirModalEvenement = () => {
    setNouvelEvenement({
      employeEmail: mockEmployes[0]?.email ?? "",
      type: typesEvenement[0],
      ancienPoste: "",
      nouveauPoste: "",
      departement: departements[0],
      commentaire: "",
    });
    setErreurEvenement("");
    setModalEvenement(true);
  };

  const fermerModalEvenement = () => {
    setModalEvenement(false);
  };

  const handleAjouterEvenement = (e) => {
    e.preventDefault();

    if (!nouvelEvenement.nouveauPoste.trim()) {
      setErreurEvenement("Merci de préciser le nouveau poste.");
      return;
    }

    const employe = mockEmployes.find(
      (emp) => emp.email === nouvelEvenement.employeEmail,
    );

    const evenementCree = {
      id: historique.length + 1,
      employeNom: employe?.nom ?? "",
      employeEmail: employe?.email ?? "",
      type: nouvelEvenement.type,
      ancienPoste: nouvelEvenement.ancienPoste.trim() || employe?.poste || "",
      nouveauPoste: nouvelEvenement.nouveauPoste.trim(),
      departement: nouvelEvenement.departement,
      date: new Date().toISOString().slice(0, 10),
      commentaire: nouvelEvenement.commentaire.trim(),
    };

    ajouterEvenement(evenementCree);
    fermerModalEvenement();
  };

  // --- Souhaits d'évolution (salarié) ---
  const ouvrirModalSouhait = () => {
    setNouveauSouhait({
      posteSouhaite: "",
      mobiliteGeographique: false,
      commentaire: "",
    });
    setErreurSouhait("");
    setModalSouhait(true);
  };

  const fermerModalSouhait = () => {
    setModalSouhait(false);
  };

  const handleSoumettreSouhait = (e) => {
    e.preventDefault();

    if (nouveauSouhait.posteSouhaite.trim().length < 3) {
      setErreurSouhait("Merci de préciser le poste souhaité.");
      return;
    }

    const souhaitCree = {
      id: souhaits.length + 1,
      employeNom: user?.name,
      employeEmail: user?.email,
      posteSouhaite: nouveauSouhait.posteSouhaite.trim(),
      mobiliteGeographique: nouveauSouhait.mobiliteGeographique,
      commentaire: nouveauSouhait.commentaire.trim(),
      dateSoumission: new Date().toISOString().slice(0, 10),
      statut: "en_attente",
    };

    ajouterSouhait(souhaitCree);
    fermerModalSouhait();
  };

  // --- Gestion souhaits (admin_rh) ---
  const ouvrirDetailSouhait = (souhait) => {
    setSouhaitSelectionneId(souhait.id);
  };

  const fermerDetailSouhait = () => {
    setSouhaitSelectionneId(null);
  };

  const handleExaminerSouhait = (id) => {
    modifierStatutSouhait(id, "examine");
  };

  const handlePlanifierSouhait = (id) => {
    modifierStatutSouhait(id, "planifie");
  };

  const handleRealiserSouhait = (id) => {
    modifierStatutSouhait(id, "realise");
  };

  const handleRefuserSouhait = (id) => {
    modifierStatutSouhait(id, "refuse");
  };

  return (
    <div className="carriere-page">
      <div className="carriere-header">
        <div>
          <h1>Carrière</h1>
          <p className="carriere-subtitle">
            {vuePersonnelle
              ? "Suivez votre parcours et exprimez vos souhaits d'évolution"
              : "Suivez le parcours et les souhaits d'évolution de l'équipe"}
          </p>
        </div>
        <div className="carriere-header-actions">
          {vuePersonnelle && (
            <button className="btn-publier" onClick={ouvrirModalSouhait}>
              + Exprimer un souhait
            </button>
          )}
          {canGerer && (
            <button
              className="btn-publier btn-publier-outline"
              onClick={ouvrirModalEvenement}
            >
              + Ajouter un événement
            </button>
          )}
        </div>
      </div>

      <div className="carriere-stats">
        <div className="stat-card">
          <div className="stat-icon stat-icon-primary">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="stat-value">{stats.totalEvenements}</p>
            <p className="stat-label">
              {vuePersonnelle ? "Mon historique" : "Événements"}
            </p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-success">
            <Award size={20} />
          </div>
          <div>
            <p className="stat-value">{stats.promotions}</p>
            <p className="stat-label">Promotions cette année</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-warning">
            <Clock size={20} />
          </div>
          <div>
            <p className="stat-value">{stats.enAttente}</p>
            <p className="stat-label">Souhaits en attente</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-secondary">
            <Compass size={20} />
          </div>
          <div>
            <p className="stat-value">{stats.mobilites}</p>
            <p className="stat-label">Ouverts à la mobilité</p>
          </div>
        </div>
      </div>

      {/* Historique de carrière */}
      <h2 className="carriere-section-title">Historique de carrière</h2>
      <div className="carriere-table-wrapper">
        <table className="carriere-table">
          <thead>
            <tr>
              {!vuePersonnelle && <th>Employé</th>}
              <th>Type</th>
              <th>Évolution</th>
              <th>Département</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {historiqueAffiche.map((evenement) => (
              <tr key={evenement.id}>
                {!vuePersonnelle && <td>{evenement.employeNom}</td>}
                <td>
                  <Badge status={typeEvenementBadge[evenement.type]}>
                    {evenement.type}
                  </Badge>
                </td>
                <td>
                  {evenement.ancienPoste !== evenement.nouveauPoste ? (
                    <>
                      {evenement.ancienPoste} → {evenement.nouveauPoste}
                    </>
                  ) : (
                    evenement.nouveauPoste
                  )}
                </td>
                <td>{evenement.departement}</td>
                <td>{formatDate(evenement.date)}</td>
              </tr>
            ))}

            {historiqueVisible.length === 0 && (
              <tr>
                <td
                  colSpan={vuePersonnelle ? 4 : 5}
                  className="carriere-empty"
                >
                  Aucun événement de carrière pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={pageHistorique}
        totalPages={totalPagesHistorique}
        onChange={setPageHistorique}
      />

      {/* Souhaits d'évolution */}
      <h2 className="carriere-section-title">
        {vuePersonnelle ? "Mes souhaits d'évolution" : "Souhaits d'évolution"}
      </h2>
      <div className="carriere-table-wrapper">
        <table className="carriere-table">
          <thead>
            <tr>
              {!vuePersonnelle && <th>Employé</th>}
              <th>Poste souhaité</th>
              <th>Mobilité</th>
              <th>Date</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {souhaitsAffiches.map((souhait) => (
              <tr
                key={souhait.id}
                className={canGerer ? "row-clickable" : undefined}
                onClick={
                  canGerer ? () => ouvrirDetailSouhait(souhait) : undefined
                }
              >
                {!vuePersonnelle && <td>{souhait.employeNom}</td>}
                <td>{souhait.posteSouhaite}</td>
                <td>
                  <Badge status={souhait.mobiliteGeographique ? "success" : "default"}>
                    {souhait.mobiliteGeographique ? "Oui" : "Non"}
                  </Badge>
                </td>
                <td>{formatDate(souhait.dateSoumission)}</td>
                <td>
                  <Badge status={statutSouhaitConfig[souhait.statut].status}>
                    {statutSouhaitConfig[souhait.statut].label}
                  </Badge>
                </td>
              </tr>
            ))}

            {souhaitsVisibles.length === 0 && (
              <tr>
                <td colSpan={vuePersonnelle ? 4 : 5} className="carriere-empty">
                  Aucun souhait d'évolution pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={pageSouhaits}
        totalPages={totalPagesSouhaits}
        onChange={setPageSouhaits}
      />

      {/* Modal ajout événement (admin_rh) */}
      {modalEvenement && (
        <div className="modal-overlay" onClick={fermerModalEvenement}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Ajouter un événement de carrière</h2>
              <button className="modal-close" onClick={fermerModalEvenement}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAjouterEvenement} className="modal-form">
              <div className="form-group">
                <label htmlFor="employe">Employé *</label>
                <select
                  id="employe"
                  value={nouvelEvenement.employeEmail}
                  onChange={(e) =>
                    setNouvelEvenement({
                      ...nouvelEvenement,
                      employeEmail: e.target.value,
                    })
                  }
                >
                  {mockEmployes.map((employe) => (
                    <option key={employe.email} value={employe.email}>
                      {employe.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="type">Type d'événement *</label>
                <select
                  id="type"
                  value={nouvelEvenement.type}
                  onChange={(e) =>
                    setNouvelEvenement({
                      ...nouvelEvenement,
                      type: e.target.value,
                    })
                  }
                >
                  {typesEvenement.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="ancienPoste">Ancien poste</label>
                  <input
                    id="ancienPoste"
                    type="text"
                    value={nouvelEvenement.ancienPoste}
                    onChange={(e) =>
                      setNouvelEvenement({
                        ...nouvelEvenement,
                        ancienPoste: e.target.value,
                      })
                    }
                    placeholder="Ex: Développeuse Junior"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="nouveauPoste">Nouveau poste *</label>
                  <input
                    id="nouveauPoste"
                    type="text"
                    value={nouvelEvenement.nouveauPoste}
                    onChange={(e) =>
                      setNouvelEvenement({
                        ...nouvelEvenement,
                        nouveauPoste: e.target.value,
                      })
                    }
                    placeholder="Ex: Développeuse Frontend"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="departement">Département *</label>
                <select
                  id="departement"
                  value={nouvelEvenement.departement}
                  onChange={(e) =>
                    setNouvelEvenement({
                      ...nouvelEvenement,
                      departement: e.target.value,
                    })
                  }
                >
                  {departements.map((departement) => (
                    <option key={departement}>{departement}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="commentaire">Commentaire</label>
                <textarea
                  id="commentaire"
                  rows={3}
                  value={nouvelEvenement.commentaire}
                  onChange={(e) =>
                    setNouvelEvenement({
                      ...nouvelEvenement,
                      commentaire: e.target.value,
                    })
                  }
                  placeholder="Contexte de l'évolution..."
                />
              </div>

              {erreurEvenement && (
                <p className="modal-error">{erreurEvenement}</p>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={fermerModalEvenement}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-submit">
                  Ajouter l'événement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal souhait d'évolution (salarié) */}
      {modalSouhait && (
        <div className="modal-overlay" onClick={fermerModalSouhait}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Exprimer un souhait d'évolution</h2>
              <button className="modal-close" onClick={fermerModalSouhait}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSoumettreSouhait} className="modal-form">
              <div className="form-group">
                <label htmlFor="posteSouhaite">Poste souhaité *</label>
                <input
                  id="posteSouhaite"
                  type="text"
                  value={nouveauSouhait.posteSouhaite}
                  onChange={(e) =>
                    setNouveauSouhait({
                      ...nouveauSouhait,
                      posteSouhaite: e.target.value,
                    })
                  }
                  placeholder="Ex: Lead Développeuse Frontend"
                />
              </div>

              <div className="form-group form-group-checkbox">
                <label htmlFor="mobilite">
                  <input
                    id="mobilite"
                    type="checkbox"
                    checked={nouveauSouhait.mobiliteGeographique}
                    onChange={(e) =>
                      setNouveauSouhait({
                        ...nouveauSouhait,
                        mobiliteGeographique: e.target.checked,
                      })
                    }
                  />
                  Ouvert(e) à la mobilité géographique
                </label>
              </div>

              <div className="form-group">
                <label htmlFor="commentaireSouhait">
                  Commentaire (optionnel)
                </label>
                <textarea
                  id="commentaireSouhait"
                  rows={3}
                  value={nouveauSouhait.commentaire}
                  onChange={(e) =>
                    setNouveauSouhait({
                      ...nouveauSouhait,
                      commentaire: e.target.value,
                    })
                  }
                  placeholder="Explique ton projet d'évolution..."
                />
              </div>

              {erreurSouhait && <p className="modal-error">{erreurSouhait}</p>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={fermerModalSouhait}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-submit">
                  Envoyer mon souhait
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal détail souhait (admin_rh) */}
      {souhaitSelectionne && (
        <div className="modal-overlay" onClick={fermerDetailSouhait}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{souhaitSelectionne.employeNom}</h2>
              <button className="modal-close" onClick={fermerDetailSouhait}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-form">
              <div className="detail-row">
                <span className="detail-label">Poste souhaité</span>
                <span className="detail-value">
                  {souhaitSelectionne.posteSouhaite}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Mobilité géographique</span>
                <span className="detail-value">
                  {souhaitSelectionne.mobiliteGeographique ? "Oui" : "Non"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date de soumission</span>
                <span className="detail-value">
                  {formatDate(souhaitSelectionne.dateSoumission)}
                </span>
              </div>
              {souhaitSelectionne.commentaire && (
                <p className="carriere-commentaire">
                  {souhaitSelectionne.commentaire}
                </p>
              )}
              <div className="detail-row">
                <span className="detail-label">Statut</span>
                <Badge
                  status={statutSouhaitConfig[souhaitSelectionne.statut].status}
                >
                  {statutSouhaitConfig[souhaitSelectionne.statut].label}
                </Badge>
              </div>

              {souhaitSelectionne.statut !== "realise" &&
                souhaitSelectionne.statut !== "refuse" && (
                  <div className="modal-actions detail-actions">
                    {souhaitSelectionne.statut === "en_attente" && (
                      <button
                        type="button"
                        className="btn-action-entretien"
                        onClick={() =>
                          handleExaminerSouhait(souhaitSelectionne.id)
                        }
                      >
                        Passer à l'examen
                      </button>
                    )}
                    {souhaitSelectionne.statut === "examine" && (
                      <button
                        type="button"
                        className="btn-action-entretien"
                        onClick={() =>
                          handlePlanifierSouhait(souhaitSelectionne.id)
                        }
                      >
                        Marquer planifié
                      </button>
                    )}
                    {souhaitSelectionne.statut === "planifie" && (
                      <button
                        type="button"
                        className="btn-action-accepter"
                        onClick={() =>
                          handleRealiserSouhait(souhaitSelectionne.id)
                        }
                      >
                        Marquer réalisé
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn-action-refuser"
                      onClick={() =>
                        handleRefuserSouhait(souhaitSelectionne.id)
                      }
                    >
                      Refuser
                    </button>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CarrierePage;
