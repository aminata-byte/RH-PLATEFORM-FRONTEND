import { useMemo, useState } from "react";
import { Target, Star, TrendingUp, CheckCircle2, X } from "lucide-react";
import { useAuth } from "../../store/useAuthStore";
import { usePerformanceStore } from "../../store/usePerformanceStore";
import { useEmployesStore } from "../../store/useEmployesStore";
import Badge from "../../components/common/Badge/Badge";
import Pagination from "../../components/common/Pagination/Pagination";
import "./PerformancePage.css";

const PAR_PAGE = 10;

const statutConfig = {
  en_cours: { label: "En cours", status: "warning" },
  atteint: { label: "Atteint", status: "success" },
  non_atteint: { label: "Non atteint", status: "danger" },
};

function PerformancePage() {
  const { role, user } = useAuth();
  const [tab, setTab] = useState("objectifs");
  const { objectifs, evaluations, ajouterObjectif, ajouterEvaluation } =
    usePerformanceStore();
  const employes = useEmployesStore((s) => s.employes);
  const salariesEquipe = useMemo(
    () => employes.filter((e) => e.role === "salarie"),
    [employes],
  );

  const canGererPerformance = role === "manager";

  const [modalObjectif, setModalObjectif] = useState(false);
  const [nouvelObjectif, setNouvelObjectif] = useState({
    employeNom: salariesEquipe[0]?.nom ?? "",
    titre: "",
    echeance: "",
  });
  const [erreurObjectif, setErreurObjectif] = useState("");

  const [modalEvaluation, setModalEvaluation] = useState(false);
  const [nouvelleEvaluation, setNouvelleEvaluation] = useState({
    employeNom: salariesEquipe[0]?.nom ?? "",
    note: 3,
    commentaire: "",
  });
  const [erreurEvaluation, setErreurEvaluation] = useState("");

  const objectifsVisibles = useMemo(() => {
    if (role === "salarie") {
      return objectifs.filter((o) => o.employeNom === user?.name);
    }
    return objectifs;
  }, [objectifs, role, user]);

  const evaluationsVisibles = useMemo(() => {
    if (role === "salarie") {
      return evaluations.filter((e) => e.employeNom === user?.name);
    }
    return evaluations;
  }, [evaluations, role, user]);

  const stats = useMemo(() => {
    const enCours = objectifsVisibles.filter(
      (o) => o.statut === "en_cours",
    ).length;
    const atteints = objectifsVisibles.filter(
      (o) => o.statut === "atteint",
    ).length;
    const moyenneNote =
      evaluationsVisibles.length > 0
        ? (
            evaluationsVisibles.reduce((sum, e) => sum + e.note, 0) /
            evaluationsVisibles.length
          ).toFixed(1)
        : "—";
    return { total: objectifsVisibles.length, enCours, atteints, moyenneNote };
  }, [objectifsVisibles, evaluationsVisibles]);

  const [pageObjectifs, setPageObjectifs] = useState(1);
  const totalPagesObjectifs = Math.max(1, Math.ceil(objectifsVisibles.length / PAR_PAGE));
  if (pageObjectifs > totalPagesObjectifs) setPageObjectifs(totalPagesObjectifs);
  const objectifsAffiches = objectifsVisibles.slice(
    (pageObjectifs - 1) * PAR_PAGE,
    pageObjectifs * PAR_PAGE,
  );

  const [pageEvaluations, setPageEvaluations] = useState(1);
  const totalPagesEvaluations = Math.max(1, Math.ceil(evaluationsVisibles.length / PAR_PAGE));
  if (pageEvaluations > totalPagesEvaluations) setPageEvaluations(totalPagesEvaluations);
  const evaluationsAffichees = evaluationsVisibles.slice(
    (pageEvaluations - 1) * PAR_PAGE,
    pageEvaluations * PAR_PAGE,
  );

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const ouvrirModalObjectif = () => {
    setNouvelObjectif({
      employeNom: salariesEquipe[0]?.nom ?? "",
      titre: "",
      echeance: "",
    });
    setErreurObjectif("");
    setModalObjectif(true);
  };

  const fermerModalObjectif = () => {
    setModalObjectif(false);
  };

  const handleAjouterObjectif = (e) => {
    e.preventDefault();

    if (nouvelObjectif.titre.trim().length < 5) {
      setErreurObjectif("Merci de préciser l'objectif (5 caractères min).");
      return;
    }
    if (!nouvelObjectif.echeance) {
      setErreurObjectif("Merci de renseigner une échéance.");
      return;
    }

    const objectifCree = {
      id: objectifs.length + 1,
      employeNom: nouvelObjectif.employeNom,
      titre: nouvelObjectif.titre.trim(),
      progression: 0,
      statut: "en_cours",
      echeance: nouvelObjectif.echeance,
    };

    ajouterObjectif(objectifCree);
    fermerModalObjectif();
  };

  const ouvrirModalEvaluation = () => {
    setNouvelleEvaluation({
      employeNom: salariesEquipe[0]?.nom ?? "",
      note: 3,
      commentaire: "",
    });
    setErreurEvaluation("");
    setModalEvaluation(true);
  };

  const fermerModalEvaluation = () => {
    setModalEvaluation(false);
  };

  const handleAjouterEvaluation = (e) => {
    e.preventDefault();

    if (nouvelleEvaluation.commentaire.trim().length < 5) {
      setErreurEvaluation("Merci de laisser un commentaire (5 caractères min).");
      return;
    }

    const evaluationCreee = {
      id: evaluations.length + 1,
      employeNom: nouvelleEvaluation.employeNom,
      date: new Date().toISOString().slice(0, 10),
      note: Number(nouvelleEvaluation.note),
      commentaire: nouvelleEvaluation.commentaire.trim(),
      evaluateur: user?.name,
    };

    ajouterEvaluation(evaluationCreee);
    fermerModalEvaluation();
  };

  return (
    <div className="performance-page">
      <div className="performance-header">
        <div>
          <h1>Performance & Objectifs</h1>
          <p className="performance-subtitle">
            {role === "salarie"
              ? "Suivez vos objectifs et évaluations"
              : "Suivez la performance de l'équipe"}
          </p>
        </div>
        {canGererPerformance && tab === "objectifs" && (
          <button className="btn-publier" onClick={ouvrirModalObjectif}>
            + Ajouter un objectif
          </button>
        )}
        {canGererPerformance && tab === "evaluations" && (
          <button className="btn-publier" onClick={ouvrirModalEvaluation}>
            + Ajouter une évaluation
          </button>
        )}
      </div>

      <div className="performance-stats">
        <div className="stat-card">
          <div className="stat-icon stat-icon-primary">
            <Target size={20} />
          </div>
          <div>
            <p className="stat-value">{stats.total}</p>
            <p className="stat-label">Objectifs</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-warning">
            <TrendingUp size={20} />
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
            <p className="stat-value">{stats.atteints}</p>
            <p className="stat-label">Atteints</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-secondary">
            <Star size={20} />
          </div>
          <div>
            <p className="stat-value">{stats.moyenneNote}/5</p>
            <p className="stat-label">Note moyenne</p>
          </div>
        </div>
      </div>

      <div className="performance-tabs">
        <button
          className={tab === "objectifs" ? "tab active" : "tab"}
          onClick={() => setTab("objectifs")}
        >
          Objectifs
        </button>
        <button
          className={tab === "evaluations" ? "tab active" : "tab"}
          onClick={() => setTab("evaluations")}
        >
          Évaluations
        </button>
      </div>

      {tab === "objectifs" && (
        <div className="performance-list">
          {objectifsAffiches.map((objectif) => (
            <div className="objectif-card" key={objectif.id}>
              <div className="objectif-top">
                <div>
                  {role !== "salarie" && (
                    <p className="objectif-employe">{objectif.employeNom}</p>
                  )}
                  <p className="objectif-titre">{objectif.titre}</p>
                </div>
                <Badge status={statutConfig[objectif.statut].status}>
                  {statutConfig[objectif.statut].label}
                </Badge>
              </div>
              <div className="objectif-progress-bar">
                <div
                  className="objectif-progress-fill"
                  style={{ width: `${objectif.progression}%` }}
                />
              </div>
              <div className="objectif-bottom">
                <span>{objectif.progression}% complété</span>
                <span>Échéance : {formatDate(objectif.echeance)}</span>
              </div>
            </div>
          ))}

          {objectifsVisibles.length === 0 && (
            <p className="performance-empty">Aucun objectif pour le moment.</p>
          )}

          <Pagination
            page={pageObjectifs}
            totalPages={totalPagesObjectifs}
            onChange={setPageObjectifs}
          />
        </div>
      )}

      {tab === "evaluations" && (
        <div className="performance-list">
          {evaluationsAffichees.map((evaluation) => (
            <div className="evaluation-card" key={evaluation.id}>
              <div className="evaluation-top">
                <div>
                  {role !== "salarie" && (
                    <p className="objectif-employe">{evaluation.employeNom}</p>
                  )}
                  <p className="evaluation-date">
                    {formatDate(evaluation.date)} — par {evaluation.evaluateur}
                  </p>
                </div>
                <div className="evaluation-note">
                  <Star
                    size={16}
                    fill="var(--color-accent)"
                    color="var(--color-accent)"
                  />
                  <span>{evaluation.note}/5</span>
                </div>
              </div>
              <p className="evaluation-commentaire">{evaluation.commentaire}</p>
            </div>
          ))}

          {evaluationsVisibles.length === 0 && (
            <p className="performance-empty">
              Aucune évaluation pour le moment.
            </p>
          )}

          <Pagination
            page={pageEvaluations}
            totalPages={totalPagesEvaluations}
            onChange={setPageEvaluations}
          />
        </div>
      )}

      {/* Modal ajout objectif (manager) */}
      {modalObjectif && (
        <div className="modal-overlay" onClick={fermerModalObjectif}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Ajouter un objectif</h2>
              <button className="modal-close" onClick={fermerModalObjectif}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAjouterObjectif} className="modal-form">
              <div className="form-group">
                <label htmlFor="employeNom">Employé *</label>
                <select
                  id="employeNom"
                  value={nouvelObjectif.employeNom}
                  onChange={(e) =>
                    setNouvelObjectif({
                      ...nouvelObjectif,
                      employeNom: e.target.value,
                    })
                  }
                >
                  {salariesEquipe.map((employe) => (
                    <option key={employe.email} value={employe.nom}>
                      {employe.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="titre">Objectif *</label>
                <input
                  id="titre"
                  type="text"
                  value={nouvelObjectif.titre}
                  onChange={(e) =>
                    setNouvelObjectif({
                      ...nouvelObjectif,
                      titre: e.target.value,
                    })
                  }
                  placeholder="Ex: Livrer le module de reporting"
                />
              </div>

              <div className="form-group">
                <label htmlFor="echeance">Échéance *</label>
                <input
                  id="echeance"
                  type="date"
                  value={nouvelObjectif.echeance}
                  onChange={(e) =>
                    setNouvelObjectif({
                      ...nouvelObjectif,
                      echeance: e.target.value,
                    })
                  }
                />
              </div>

              {erreurObjectif && (
                <p className="modal-error">{erreurObjectif}</p>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={fermerModalObjectif}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-submit">
                  Ajouter l'objectif
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal ajout évaluation (manager) */}
      {modalEvaluation && (
        <div className="modal-overlay" onClick={fermerModalEvaluation}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Ajouter une évaluation</h2>
              <button className="modal-close" onClick={fermerModalEvaluation}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAjouterEvaluation} className="modal-form">
              <div className="form-group">
                <label htmlFor="employeEvaluation">Employé *</label>
                <select
                  id="employeEvaluation"
                  value={nouvelleEvaluation.employeNom}
                  onChange={(e) =>
                    setNouvelleEvaluation({
                      ...nouvelleEvaluation,
                      employeNom: e.target.value,
                    })
                  }
                >
                  {salariesEquipe.map((employe) => (
                    <option key={employe.email} value={employe.nom}>
                      {employe.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="note">Note (sur 5) *</label>
                <input
                  id="note"
                  type="number"
                  min="1"
                  max="5"
                  step="0.5"
                  value={nouvelleEvaluation.note}
                  onChange={(e) =>
                    setNouvelleEvaluation({
                      ...nouvelleEvaluation,
                      note: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="commentaire">Commentaire *</label>
                <textarea
                  id="commentaire"
                  rows={3}
                  value={nouvelleEvaluation.commentaire}
                  onChange={(e) =>
                    setNouvelleEvaluation({
                      ...nouvelleEvaluation,
                      commentaire: e.target.value,
                    })
                  }
                  placeholder="Ex: Excellent travail sur le sprint, très autonome."
                />
              </div>

              {erreurEvaluation && (
                <p className="modal-error">{erreurEvaluation}</p>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={fermerModalEvaluation}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-submit">
                  Ajouter l'évaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PerformancePage;
