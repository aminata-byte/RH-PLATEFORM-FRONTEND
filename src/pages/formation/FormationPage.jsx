import { useMemo, useState } from "react";
import {
  GraduationCap,
  Users,
  Clock,
  CheckCircle2,
  X,
} from "lucide-react";
import { useAuth } from "../../store/useAuthStore";
import { useFormationStore } from "../../store/useFormationStore";
import { categoriesFormation } from "../../services/mockFormations";
import Badge from "../../components/common/Badge/Badge";
import Pagination from "../../components/common/Pagination/Pagination";
import "./FormationPage.css";

const PAR_PAGE = 9;

const statutInscriptionConfig = {
  en_attente: { label: "En attente", status: "warning" },
  confirmee: { label: "Confirmée", status: "default" },
  terminee: { label: "Terminée", status: "success" },
  annulee: { label: "Annulée", status: "danger" },
};

const statutFormationConfig = {
  ouverte: { label: "Ouverte", status: "success" },
  fermee: { label: "Fermée", status: "default" },
};

function FormationPage() {
  const { role, user } = useAuth();

  const {
    formations,
    inscriptions,
    ajouterFormation,
    toggleStatutFormation,
    ajouterInscription,
    modifierStatutInscription,
  } = useFormationStore();

  const [inscriptionSelectionneeId, setInscriptionSelectionneeId] =
    useState(null);

  // Modal inscription (salarié)
  const [formationSelectionnee, setFormationSelectionnee] = useState(null);
  const [messageInscription, setMessageInscription] = useState("");

  const [modalPublication, setModalPublication] = useState(false);
  const [nouvelleFormation, setNouvelleFormation] = useState({
    titre: "",
    categorie: "Technique",
    formateur: "",
    dateDebut: "",
    dateFin: "",
    placesTotal: 10,
  });
  const [erreurFormation, setErreurFormation] = useState("");

  const isSalarie = role === "salarie";
  const canGerer = role === "admin_rh";

  const inscriptionsVisibles = useMemo(() => {
    if (isSalarie) {
      return inscriptions.filter((i) => i.employeEmail === user?.email);
    }
    return inscriptions;
  }, [inscriptions, isSalarie, user]);

  const inscriptionSelectionnee = useMemo(
    () =>
      inscriptions.find((i) => i.id === inscriptionSelectionneeId) ?? null,
    [inscriptions, inscriptionSelectionneeId],
  );

  const formationDeLInscription = useMemo(
    () =>
      inscriptionSelectionnee
        ? formations.find((f) => f.id === inscriptionSelectionnee.formationId)
        : null,
    [formations, inscriptionSelectionnee],
  );

  const stats = useMemo(() => {
    const disponibles = formations.filter(
      (f) => f.statut === "ouverte",
    ).length;
    const total = inscriptionsVisibles.length;
    const enCours = inscriptionsVisibles.filter(
      (i) => i.statut === "en_attente" || i.statut === "confirmee",
    ).length;
    const terminees = inscriptionsVisibles.filter(
      (i) => i.statut === "terminee",
    ).length;
    return { disponibles, total, enCours, terminees };
  }, [formations, inscriptionsVisibles]);

  const [pageFormations, setPageFormations] = useState(1);
  const totalPagesFormations = Math.max(1, Math.ceil(formations.length / PAR_PAGE));
  if (pageFormations > totalPagesFormations) setPageFormations(totalPagesFormations);
  const formationsAffichees = formations.slice(
    (pageFormations - 1) * PAR_PAGE,
    pageFormations * PAR_PAGE,
  );

  const [pageInscriptions, setPageInscriptions] = useState(1);
  const totalPagesInscriptions = Math.max(1, Math.ceil(inscriptionsVisibles.length / PAR_PAGE));
  if (pageInscriptions > totalPagesInscriptions) setPageInscriptions(totalPagesInscriptions);
  const inscriptionsAffichees = inscriptionsVisibles.slice(
    (pageInscriptions - 1) * PAR_PAGE,
    pageInscriptions * PAR_PAGE,
  );

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const dejaInscrit = (formationId) =>
    inscriptions.some(
      (i) =>
        i.formationId === formationId &&
        i.employeEmail === user?.email &&
        i.statut !== "annulee",
    );

  // --- Inscription (salarié) ---
  const ouvrirModalInscription = (formation) => {
    setFormationSelectionnee(formation);
    setMessageInscription("");
  };

  const fermerModalInscription = () => {
    setFormationSelectionnee(null);
  };

  const handleSInscrire = (e) => {
    e.preventDefault();

    const nouvelleInscription = {
      id: inscriptions.length + 1,
      formationId: formationSelectionnee.id,
      formationTitre: formationSelectionnee.titre,
      employeNom: user?.name,
      employeEmail: user?.email,
      dateInscription: new Date().toISOString().slice(0, 10),
      statut: "en_attente",
      message: messageInscription.trim() || undefined,
    };
    ajouterInscription(nouvelleInscription);
    fermerModalInscription();
  };

  // --- Gestion inscriptions (admin_rh) ---
  const ouvrirDetailInscription = (inscription) => {
    setInscriptionSelectionneeId(inscription.id);
  };

  const fermerDetailInscription = () => {
    setInscriptionSelectionneeId(null);
  };

  const handleConfirmerInscription = (id) => {
    modifierStatutInscription(id, "confirmee");
  };

  const handleTerminerInscription = (id) => {
    modifierStatutInscription(id, "terminee");
  };

  const handleAnnulerInscription = (id) => {
    modifierStatutInscription(id, "annulee");
  };

  // --- Publication formation (admin_rh) ---
  const ouvrirModalPublication = () => {
    setNouvelleFormation({
      titre: "",
      categorie: "Technique",
      formateur: "",
      dateDebut: "",
      dateFin: "",
      placesTotal: 10,
    });
    setErreurFormation("");
    setModalPublication(true);
  };

  const fermerModalPublication = () => {
    setModalPublication(false);
  };

  const handlePublierFormation = (e) => {
    e.preventDefault();

    if (nouvelleFormation.titre.trim().length < 5) {
      setErreurFormation(
        "Le titre de la formation doit contenir au moins 5 caractères.",
      );
      return;
    }
    if (!nouvelleFormation.dateDebut || !nouvelleFormation.dateFin) {
      setErreurFormation("Merci de renseigner les dates de la formation.");
      return;
    }

    const formationCreee = {
      id: formations.length + 1,
      titre: nouvelleFormation.titre,
      categorie: nouvelleFormation.categorie,
      formateur: nouvelleFormation.formateur,
      dateDebut: nouvelleFormation.dateDebut,
      dateFin: nouvelleFormation.dateFin,
      placesTotal: Number(nouvelleFormation.placesTotal) || 0,
      statut: "ouverte",
    };

    ajouterFormation(formationCreee);
    fermerModalPublication();
  };

  const handleToggleStatutFormation = (formationId) => {
    toggleStatutFormation(formationId);
  };

  return (
    <div className="formation-page">
      <div className="formation-header">
        <div>
          <h1>Formation</h1>
          <p className="formation-subtitle">
            {isSalarie
              ? "Découvrez le catalogue et suivez vos formations"
              : "Gérez le catalogue et les inscriptions de l'équipe"}
          </p>
        </div>
      </div>

      <div className="formation-stats">
        <div className="stat-card">
          <div className="stat-icon stat-icon-primary">
            <GraduationCap size={20} />
          </div>
          <div>
            <p className="stat-value">{stats.disponibles}</p>
            <p className="stat-label">Formations disponibles</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-secondary">
            <Users size={20} />
          </div>
          <div>
            <p className="stat-value">{stats.total}</p>
            <p className="stat-label">
              {isSalarie ? "Mes inscriptions" : "Inscriptions"}
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
            <p className="stat-value">{stats.terminees}</p>
            <p className="stat-label">Terminées</p>
          </div>
        </div>
      </div>

      {/* Catalogue */}
      <div className="formation-section-header">
        <h2 className="formation-section-title">Catalogue des formations</h2>
        {canGerer && (
          <button className="btn-publier" onClick={ouvrirModalPublication}>
            + Publier une formation
          </button>
        )}
      </div>

      <div className="formations-grid">
        {formationsAffichees.map((formation) => (
          <div className="formation-card" key={formation.id}>
            <div className="formation-top">
              <p className="formation-titre">{formation.titre}</p>
              <Badge status={statutFormationConfig[formation.statut].status}>
                {statutFormationConfig[formation.statut].label}
              </Badge>
            </div>
            <p className="formation-meta">
              {formation.categorie} · {formation.formateur}
            </p>
            <p className="formation-date">
              Du {formatDate(formation.dateDebut)} au{" "}
              {formatDate(formation.dateFin)} · {formation.placesTotal} places
            </p>

            {isSalarie && (
              <button
                className="formation-sinscrire"
                disabled={
                  dejaInscrit(formation.id) || formation.statut !== "ouverte"
                }
                onClick={() => ouvrirModalInscription(formation)}
              >
                {dejaInscrit(formation.id) ? "Déjà inscrit" : "S'inscrire"}
              </button>
            )}

            {canGerer && (
              <button
                className="formation-toggle-statut"
                onClick={() => handleToggleStatutFormation(formation.id)}
              >
                {formation.statut === "ouverte"
                  ? "Clôturer la formation"
                  : "Rouvrir la formation"}
              </button>
            )}
          </div>
        ))}
      </div>

      <Pagination
        page={pageFormations}
        totalPages={totalPagesFormations}
        onChange={setPageFormations}
      />

      {/* Inscriptions */}
      <h2 className="formation-section-title">
        {isSalarie ? "Mes inscriptions" : "Inscriptions de l'équipe"}
      </h2>
      <div className="formation-table-wrapper">
        <table className="formation-table">
          <thead>
            <tr>
              {!isSalarie && <th>Employé</th>}
              <th>Formation</th>
              <th>Date d'inscription</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {inscriptionsAffichees.map((inscription) => (
              <tr
                key={inscription.id}
                className="row-clickable"
                onClick={() => ouvrirDetailInscription(inscription)}
              >
                {!isSalarie && <td>{inscription.employeNom}</td>}
                <td>{inscription.formationTitre}</td>
                <td>{formatDate(inscription.dateInscription)}</td>
                <td>
                  <Badge
                    status={statutInscriptionConfig[inscription.statut].status}
                  >
                    {statutInscriptionConfig[inscription.statut].label}
                  </Badge>
                </td>
              </tr>
            ))}

            {inscriptionsVisibles.length === 0 && (
              <tr>
                <td
                  colSpan={isSalarie ? 3 : 4}
                  className="formation-empty-cell"
                >
                  Aucune inscription pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={pageInscriptions}
        totalPages={totalPagesInscriptions}
        onChange={setPageInscriptions}
      />

      {/* Modal détail inscription (admin_rh / manager) */}
      {inscriptionSelectionnee && (
        <div className="modal-overlay" onClick={fermerDetailInscription}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{inscriptionSelectionnee.employeNom}</h2>
              <button
                className="modal-close"
                onClick={fermerDetailInscription}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-form">
              <div className="detail-row">
                <span className="detail-label">Formation</span>
                <span className="detail-value">
                  {inscriptionSelectionnee.formationTitre}
                </span>
              </div>
              {formationDeLInscription && (
                <>
                  <div className="detail-row">
                    <span className="detail-label">Catégorie</span>
                    <span className="detail-value">
                      {formationDeLInscription.categorie}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Formateur</span>
                    <span className="detail-value">
                      {formationDeLInscription.formateur}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Durée de la formation</span>
                    <span className="detail-value">
                      Du {formatDate(formationDeLInscription.dateDebut)} au{" "}
                      {formatDate(formationDeLInscription.dateFin)}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Places</span>
                    <span className="detail-value">
                      {formationDeLInscription.placesTotal}
                    </span>
                  </div>
                </>
              )}
              <div className="detail-row">
                <span className="detail-label">Date d'inscription</span>
                <span className="detail-value">
                  {formatDate(inscriptionSelectionnee.dateInscription)}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Statut</span>
                <Badge
                  status={
                    statutInscriptionConfig[inscriptionSelectionnee.statut]
                      .status
                  }
                >
                  {statutInscriptionConfig[inscriptionSelectionnee.statut].label}
                </Badge>
              </div>

              {inscriptionSelectionnee.message && (
                <div className="detail-row detail-row-message">
                  <span className="detail-label">Message</span>
                  <span className="detail-value">
                    {inscriptionSelectionnee.message}
                  </span>
                </div>
              )}

              {canGerer && inscriptionSelectionnee.statut !== "terminee" && (
                <div className="modal-actions detail-actions">
                  {inscriptionSelectionnee.statut === "en_attente" && (
                    <button
                      type="button"
                      className="btn-action-entretien"
                      onClick={() =>
                        handleConfirmerInscription(inscriptionSelectionnee.id)
                      }
                    >
                      Confirmer
                    </button>
                  )}
                  {inscriptionSelectionnee.statut === "confirmee" && (
                    <button
                      type="button"
                      className="btn-action-accepter"
                      onClick={() =>
                        handleTerminerInscription(inscriptionSelectionnee.id)
                      }
                    >
                      Marquer terminée
                    </button>
                  )}
                  {inscriptionSelectionnee.statut !== "annulee" && (
                    <button
                      type="button"
                      className="btn-action-refuser"
                      onClick={() =>
                        handleAnnulerInscription(inscriptionSelectionnee.id)
                      }
                    >
                      Annuler
                    </button>
                  )}
                </div>
              )}

              {isSalarie && inscriptionSelectionnee.statut === "en_attente" && (
                <div className="modal-actions detail-actions">
                  <button
                    type="button"
                    className="btn-action-refuser"
                    onClick={() =>
                      handleAnnulerInscription(inscriptionSelectionnee.id)
                    }
                  >
                    Annuler mon inscription
                  </button>
                </div>
              )}

              {isSalarie && inscriptionSelectionnee.statut === "confirmee" && (
                <p className="formation-info-confirmee">
                  Inscription confirmée par le RH — contactez le service RH
                  pour l'annuler.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal inscription (salarié) */}
      {formationSelectionnee && (
        <div className="modal-overlay" onClick={fermerModalInscription}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>S'inscrire — {formationSelectionnee.titre}</h2>
              <button className="modal-close" onClick={fermerModalInscription}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSInscrire} className="modal-form">
              <div className="detail-row">
                <span className="detail-label">Catégorie</span>
                <span className="detail-value">
                  {formationSelectionnee.categorie}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Formateur</span>
                <span className="detail-value">
                  {formationSelectionnee.formateur}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Dates</span>
                <span className="detail-value">
                  {formatDate(formationSelectionnee.dateDebut)} →{" "}
                  {formatDate(formationSelectionnee.dateFin)}
                </span>
              </div>

              <div className="form-group">
                <label htmlFor="message">Message (optionnel)</label>
                <textarea
                  id="message"
                  rows={3}
                  value={messageInscription}
                  onChange={(e) => setMessageInscription(e.target.value)}
                  placeholder="Ex: motivation, contraintes de planning..."
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={fermerModalInscription}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-submit">
                  Confirmer mon inscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal publication formation */}
      {modalPublication && (
        <div className="modal-overlay" onClick={fermerModalPublication}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Publier une nouvelle formation</h2>
              <button
                className="modal-close"
                onClick={fermerModalPublication}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePublierFormation} className="modal-form">
              <div className="form-group">
                <label htmlFor="titre">Titre de la formation *</label>
                <input
                  id="titre"
                  type="text"
                  value={nouvelleFormation.titre}
                  onChange={(e) =>
                    setNouvelleFormation({
                      ...nouvelleFormation,
                      titre: e.target.value,
                    })
                  }
                  placeholder="Ex: React avancé & Performance"
                />
              </div>

              <div className="form-group">
                <label htmlFor="categorie">Catégorie *</label>
                <select
                  id="categorie"
                  value={nouvelleFormation.categorie}
                  onChange={(e) =>
                    setNouvelleFormation({
                      ...nouvelleFormation,
                      categorie: e.target.value,
                    })
                  }
                >
                  {categoriesFormation.map((categorie) => (
                    <option key={categorie}>{categorie}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="formateur">Formateur *</label>
                <input
                  id="formateur"
                  type="text"
                  value={nouvelleFormation.formateur}
                  onChange={(e) =>
                    setNouvelleFormation({
                      ...nouvelleFormation,
                      formateur: e.target.value,
                    })
                  }
                  placeholder="Ex: Awa Sarr"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dateDebut">Date de début *</label>
                  <input
                    id="dateDebut"
                    type="date"
                    value={nouvelleFormation.dateDebut}
                    onChange={(e) =>
                      setNouvelleFormation({
                        ...nouvelleFormation,
                        dateDebut: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="dateFin">Date de fin *</label>
                  <input
                    id="dateFin"
                    type="date"
                    value={nouvelleFormation.dateFin}
                    onChange={(e) =>
                      setNouvelleFormation({
                        ...nouvelleFormation,
                        dateFin: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="placesTotal">Places disponibles *</label>
                <input
                  id="placesTotal"
                  type="number"
                  min="1"
                  value={nouvelleFormation.placesTotal}
                  onChange={(e) =>
                    setNouvelleFormation({
                      ...nouvelleFormation,
                      placesTotal: e.target.value,
                    })
                  }
                />
              </div>

              {erreurFormation && (
                <p className="modal-error">{erreurFormation}</p>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={fermerModalPublication}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-submit">
                  Publier la formation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FormationPage;
