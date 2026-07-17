import { useMemo, useState } from "react";
import {
  Search,
  UserPlus,
  Users,
  UserCheck,
  UserMinus,
  Building2,
  X,
} from "lucide-react";
import { useAuth } from "../../store/useAuthStore";
import { useEmployesStore } from "../../store/useEmployesStore";
import { departements, typesContrat } from "../../services/mockEmployes";
import Badge from "../../components/common/Badge/Badge";
import Button from "../../components/common/Button/Button";
import Pagination from "../../components/common/Pagination/Pagination";
import "./EmployesPage.css";

const PAR_PAGE = 10;

const statutConfig = {
  actif: { label: "Actif", status: "success" },
  conge: { label: "En congé", status: "warning" },
  inactif: { label: "Inactif", status: "danger" },
};

const roleLabels = {
  admin_rh: "Admin RH",
  manager: "Manager",
  salarie: "Salarié",
};

const contratBadge = {
  CDI: "success",
  CDD: "warning",
  Stage: "default",
  Alternance: "default",
};

const employeVide = {
  nom: "",
  email: "",
  poste: "",
  departement: departements[0],
  dateEmbauche: new Date().toISOString().slice(0, 10),
  statut: "actif",
  role: "salarie",
  typeContrat: typesContrat[0],
  dateFinContrat: "",
};

const joursRestants = (dateFinContrat) => {
  if (!dateFinContrat) return null;
  const maintenant = new Date();
  maintenant.setHours(0, 0, 0, 0);
  const fin = new Date(dateFinContrat);
  return Math.round((fin - maintenant) / (1000 * 60 * 60 * 24));
};

const urgenceFinContrat = (jours) => {
  if (jours === null) return "default";
  if (jours <= 15) return "danger";
  if (jours <= 30) return "warning";
  return "success";
};

const dureeContrat = (dateEmbauche, dateFinContrat) => {
  if (!dateFinContrat) return "Indéterminée";
  const jours = Math.round(
    (new Date(dateFinContrat) - new Date(dateEmbauche)) /
      (1000 * 60 * 60 * 24),
  );
  if (jours >= 60) return `${Math.round(jours / 30)} mois`;
  return `${jours} jours`;
};

function EmployesPage() {
  const { role } = useAuth();
  const { employes, ajouterEmploye, modifierEmploye, supprimerEmploye } =
    useEmployesStore();
  const [search, setSearch] = useState("");
  const [departementFiltre, setDepartementFiltre] = useState("all");
  const [contratFiltre, setContratFiltre] = useState("all");

  const [modalAjout, setModalAjout] = useState(false);
  const [employeEnEditionId, setEmployeEnEditionId] = useState(null);
  const [nouvelEmploye, setNouvelEmploye] = useState(employeVide);
  const [erreurEmploye, setErreurEmploye] = useState("");
  const [employeASupprimer, setEmployeASupprimer] = useState(null);
  const [employeDetailId, setEmployeDetailId] = useState(null);

  const canManage = role === "admin_rh";

  const employeDetail = useMemo(
    () => employes.find((emp) => emp.id === employeDetailId) ?? null,
    [employes, employeDetailId],
  );

  const stats = useMemo(() => {
    const total = employes.length;
    const actifs = employes.filter((e) => e.statut === "actif").length;
    const enConge = employes.filter((e) => e.statut === "conge").length;
    const nbDepartements = new Set(employes.map((e) => e.departement)).size;
    return { total, actifs, enConge, nbDepartements };
  }, [employes]);

  const employesFiltres = useMemo(() => {
    return employes.filter((employe) => {
      const matchSearch =
        employe.nom.toLowerCase().includes(search.toLowerCase()) ||
        employe.email.toLowerCase().includes(search.toLowerCase()) ||
        employe.poste.toLowerCase().includes(search.toLowerCase());
      const matchDepartement =
        departementFiltre === "all" || employe.departement === departementFiltre;
      const matchContrat =
        contratFiltre === "all" || employe.typeContrat === contratFiltre;
      return matchSearch && matchDepartement && matchContrat;
    });
  }, [employes, search, departementFiltre, contratFiltre]);

  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(employesFiltres.length / PAR_PAGE));

  // Revient à la page 1 si la recherche/les filtres changent le résultat,
  // et se recale si la page courante dépasse le nouveau nombre de pages
  // (ex. suppression du dernier employé d'une page).
  const [filtresPrecedents, setFiltresPrecedents] = useState(
    `${search}|${departementFiltre}|${contratFiltre}`,
  );
  const filtresActuels = `${search}|${departementFiltre}|${contratFiltre}`;
  if (filtresActuels !== filtresPrecedents) {
    setFiltresPrecedents(filtresActuels);
    setPage(1);
  } else if (page > totalPages) {
    setPage(totalPages);
  }

  const employesAffiches = employesFiltres.slice(
    (page - 1) * PAR_PAGE,
    page * PAR_PAGE,
  );

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const ouvrirModalAjout = () => {
    setEmployeEnEditionId(null);
    setNouvelEmploye(employeVide);
    setErreurEmploye("");
    setModalAjout(true);
  };

  const ouvrirModalModification = (employe) => {
    setEmployeEnEditionId(employe.id);
    setNouvelEmploye({
      nom: employe.nom,
      email: employe.email,
      poste: employe.poste,
      departement: employe.departement,
      dateEmbauche: employe.dateEmbauche,
      statut: employe.statut,
      role: employe.role,
      typeContrat: employe.typeContrat ?? typesContrat[0],
      dateFinContrat: employe.dateFinContrat ?? "",
    });
    setErreurEmploye("");
    setModalAjout(true);
  };

  const fermerModalAjout = () => {
    setModalAjout(false);
  };

  const handleSoumettreEmploye = (e) => {
    e.preventDefault();

    if (nouvelEmploye.nom.trim().length < 3) {
      setErreurEmploye("Merci de renseigner le nom complet.");
      return;
    }
    if (!nouvelEmploye.email.trim().includes("@")) {
      setErreurEmploye("Merci de renseigner un email valide.");
      return;
    }
    if (!nouvelEmploye.poste.trim()) {
      setErreurEmploye("Merci de renseigner le poste.");
      return;
    }
    if (
      employes.some(
        (emp) =>
          emp.email === nouvelEmploye.email.trim() &&
          emp.id !== employeEnEditionId,
      )
    ) {
      setErreurEmploye("Un employé avec cet email existe déjà.");
      return;
    }
    if (nouvelEmploye.typeContrat !== "CDI" && !nouvelEmploye.dateFinContrat) {
      setErreurEmploye("Merci de renseigner la date de fin de contrat.");
      return;
    }

    const dateFinContrat =
      nouvelEmploye.typeContrat === "CDI" ? null : nouvelEmploye.dateFinContrat;

    if (employeEnEditionId) {
      modifierEmploye(employeEnEditionId, {
        nom: nouvelEmploye.nom.trim(),
        email: nouvelEmploye.email.trim(),
        poste: nouvelEmploye.poste.trim(),
        departement: nouvelEmploye.departement,
        dateEmbauche: nouvelEmploye.dateEmbauche,
        statut: nouvelEmploye.statut,
        role: nouvelEmploye.role,
        typeContrat: nouvelEmploye.typeContrat,
        dateFinContrat,
      });
    } else {
      const employeCree = {
        id: employes.length
          ? Math.max(...employes.map((emp) => emp.id)) + 1
          : 1,
        nom: nouvelEmploye.nom.trim(),
        email: nouvelEmploye.email.trim(),
        poste: nouvelEmploye.poste.trim(),
        departement: nouvelEmploye.departement,
        dateEmbauche: nouvelEmploye.dateEmbauche,
        statut: nouvelEmploye.statut,
        role: nouvelEmploye.role,
        typeContrat: nouvelEmploye.typeContrat,
        dateFinContrat,
      };
      ajouterEmploye(employeCree);
    }

    fermerModalAjout();
  };

  const ouvrirDetail = (employe) => {
    setEmployeDetailId(employe.id);
  };

  const fermerDetail = () => {
    setEmployeDetailId(null);
  };

  const handleCloturerContrat = (id) => {
    modifierEmploye(id, { statut: "inactif" });
  };

  const ouvrirConfirmationSuppression = (employe) => {
    setEmployeASupprimer(employe);
  };

  const fermerConfirmationSuppression = () => {
    setEmployeASupprimer(null);
  };

  const handleConfirmerSuppression = () => {
    supprimerEmploye(employeASupprimer.id);
    fermerConfirmationSuppression();
  };

  return (
    <div className="employes-page">
      <div className="employes-header">
        <div>
          <h1>Employés</h1>
          <p className="employes-subtitle">Gérez les collaborateurs de l'entreprise</p>
        </div>
        {canManage && (
          <Button variant="primary" onClick={ouvrirModalAjout}>
            <UserPlus size={16} style={{ marginRight: "8px", verticalAlign: "-2px" }} />
            Ajouter un employé
          </Button>
        )}
      </div>

      <div className="employes-stats">
        <div className="stat-card">
          <div className="stat-icon stat-icon-primary">
            <Users size={20} />
          </div>
          <div>
            <p className="stat-value">{stats.total}</p>
            <p className="stat-label">Total employés</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-success">
            <UserCheck size={20} />
          </div>
          <div>
            <p className="stat-value">{stats.actifs}</p>
            <p className="stat-label">Actifs</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-warning">
            <UserMinus size={20} />
          </div>
          <div>
            <p className="stat-value">{stats.enConge}</p>
            <p className="stat-label">En congé</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-secondary">
            <Building2 size={20} />
          </div>
          <div>
            <p className="stat-value">{stats.nbDepartements}</p>
            <p className="stat-label">Départements</p>
          </div>
        </div>
      </div>

      <div className="employes-toolbar">
        <div className="employes-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Rechercher un employé..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="employes-filter"
          value={departementFiltre}
          onChange={(e) => setDepartementFiltre(e.target.value)}
        >
          <option value="all">Tous les départements</option>
          {departements.map((dep) => (
            <option key={dep} value={dep}>
              {dep}
            </option>
          ))}
        </select>

        <select
          className="employes-filter"
          value={contratFiltre}
          onChange={(e) => setContratFiltre(e.target.value)}
        >
          <option value="all">Tous les contrats</option>
          {typesContrat.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="employes-table-wrapper">
        <table className="employes-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Poste</th>
              <th>Département</th>
              <th>Contrat</th>
              <th>Statut</th>
              {canManage && <th></th>}
            </tr>
          </thead>
          <tbody>
            {employesAffiches.map((employe) => (
              <tr
                key={employe.id}
                className="row-clickable"
                onClick={() => ouvrirDetail(employe)}
              >
                <td>
                  <div className="employe-nom">
                    <span className="employe-avatar">
                      {employe.nom
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </span>
                    <div>
                      <p className="employe-name">{employe.nom}</p>
                      <p className="employe-email">{employe.email}</p>
                    </div>
                  </div>
                </td>
                <td>{employe.poste}</td>
                <td>{employe.departement}</td>
                <td>
                  <Badge status={contratBadge[employe.typeContrat] ?? "default"}>
                    {employe.typeContrat}
                  </Badge>
                </td>
                <td>
                  <Badge status={statutConfig[employe.statut].status}>
                    {statutConfig[employe.statut].label}
                  </Badge>
                </td>
                {canManage && (
                  <td
                    className="employes-actions-cell"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="employe-action"
                      onClick={() => ouvrirModalModification(employe)}
                    >
                      Modifier
                    </button>
                    <button
                      className="employe-action employe-action-danger"
                      onClick={() => ouvrirConfirmationSuppression(employe)}
                    >
                      Supprimer
                    </button>
                  </td>
                )}
              </tr>
            ))}

            {employesFiltres.length === 0 && (
              <tr>
                <td colSpan={canManage ? 6 : 5} className="employes-empty">
                  Aucun employé ne correspond à votre recherche.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {/* Modal détail employé */}
      {employeDetail && (
        <div className="modal-overlay" onClick={fermerDetail}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{employeDetail.nom}</h2>
              <button className="modal-close" onClick={fermerDetail}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-form">
              <div className="detail-row">
                <span className="detail-label">Email</span>
                <span className="detail-value">{employeDetail.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Poste</span>
                <span className="detail-value">{employeDetail.poste}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Département</span>
                <span className="detail-value">
                  {employeDetail.departement}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Rôle</span>
                <span className="detail-value">
                  {roleLabels[employeDetail.role]}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Type de contrat</span>
                <Badge
                  status={contratBadge[employeDetail.typeContrat] ?? "default"}
                >
                  {employeDetail.typeContrat}
                </Badge>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date d'embauche</span>
                <span className="detail-value">
                  {formatDate(employeDetail.dateEmbauche)}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date de fin de contrat</span>
                <span className="detail-value">
                  {employeDetail.dateFinContrat
                    ? formatDate(employeDetail.dateFinContrat)
                    : "Indéterminée (CDI)"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Durée du contrat</span>
                <span className="detail-value">
                  {dureeContrat(
                    employeDetail.dateEmbauche,
                    employeDetail.dateFinContrat,
                  )}
                </span>
              </div>
              {employeDetail.dateFinContrat && (
                <div className="detail-row">
                  <span className="detail-label">Temps restant</span>
                  <Badge
                    status={urgenceFinContrat(
                      joursRestants(employeDetail.dateFinContrat),
                    )}
                  >
                    {joursRestants(employeDetail.dateFinContrat) >= 0
                      ? `${joursRestants(employeDetail.dateFinContrat)} jours`
                      : "Expiré"}
                  </Badge>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">Statut</span>
                <Badge status={statutConfig[employeDetail.statut].status}>
                  {statutConfig[employeDetail.statut].label}
                </Badge>
              </div>

              {canManage &&
                employeDetail.typeContrat !== "CDI" &&
                employeDetail.statut !== "inactif" && (
                  <div className="modal-actions detail-actions">
                    <button
                      type="button"
                      className="btn-action-refuser"
                      onClick={() => handleCloturerContrat(employeDetail.id)}
                    >
                      Clôturer le contrat
                    </button>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Modal ajout employé */}
      {modalAjout && (
        <div className="modal-overlay" onClick={fermerModalAjout}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {employeEnEditionId ? "Modifier l'employé" : "Ajouter un employé"}
              </h2>
              <button className="modal-close" onClick={fermerModalAjout}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSoumettreEmploye} className="modal-form">
              <div className="form-group">
                <label htmlFor="nom">Nom complet *</label>
                <input
                  id="nom"
                  type="text"
                  value={nouvelEmploye.nom}
                  onChange={(e) =>
                    setNouvelEmploye({ ...nouvelEmploye, nom: e.target.value })
                  }
                  placeholder="Ex: Awa Sarr"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  id="email"
                  type="email"
                  value={nouvelEmploye.email}
                  onChange={(e) =>
                    setNouvelEmploye({
                      ...nouvelEmploye,
                      email: e.target.value,
                    })
                  }
                  placeholder="Ex: awa.sarr@rh.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="poste">Poste *</label>
                <input
                  id="poste"
                  type="text"
                  value={nouvelEmploye.poste}
                  onChange={(e) =>
                    setNouvelEmploye({
                      ...nouvelEmploye,
                      poste: e.target.value,
                    })
                  }
                  placeholder="Ex: Développeuse Frontend"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="departement">Département *</label>
                  <select
                    id="departement"
                    value={nouvelEmploye.departement}
                    onChange={(e) =>
                      setNouvelEmploye({
                        ...nouvelEmploye,
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
                  <label htmlFor="role">Rôle *</label>
                  <select
                    id="role"
                    value={nouvelEmploye.role}
                    onChange={(e) =>
                      setNouvelEmploye({
                        ...nouvelEmploye,
                        role: e.target.value,
                      })
                    }
                  >
                    {Object.entries(roleLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="typeContrat">Type de contrat *</label>
                  <select
                    id="typeContrat"
                    value={nouvelEmploye.typeContrat}
                    onChange={(e) =>
                      setNouvelEmploye({
                        ...nouvelEmploye,
                        typeContrat: e.target.value,
                      })
                    }
                  >
                    {typesContrat.map((type) => (
                      <option key={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="dateEmbauche">Date d'embauche *</label>
                  <input
                    id="dateEmbauche"
                    type="date"
                    value={nouvelEmploye.dateEmbauche}
                    onChange={(e) =>
                      setNouvelEmploye({
                        ...nouvelEmploye,
                        dateEmbauche: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {nouvelEmploye.typeContrat !== "CDI" && (
                <div className="form-group">
                  <label htmlFor="dateFinContrat">
                    Date de fin de contrat *
                  </label>
                  <input
                    id="dateFinContrat"
                    type="date"
                    value={nouvelEmploye.dateFinContrat}
                    onChange={(e) =>
                      setNouvelEmploye({
                        ...nouvelEmploye,
                        dateFinContrat: e.target.value,
                      })
                    }
                  />
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="statut">Statut *</label>
                  <select
                    id="statut"
                    value={nouvelEmploye.statut}
                    onChange={(e) =>
                      setNouvelEmploye({
                        ...nouvelEmploye,
                        statut: e.target.value,
                      })
                    }
                  >
                    {Object.entries(statutConfig).map(([value, config]) => (
                      <option key={value} value={value}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {erreurEmploye && <p className="modal-error">{erreurEmploye}</p>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={fermerModalAjout}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-submit">
                  {employeEnEditionId
                    ? "Enregistrer les modifications"
                    : "Ajouter l'employé"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation suppression employé */}
      {employeASupprimer && (
        <div className="modal-overlay" onClick={fermerConfirmationSuppression}>
          <div
            className="modal-content modal-content-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Supprimer l'employé</h2>
              <button
                className="modal-close"
                onClick={fermerConfirmationSuppression}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-form">
              <p>
                Es-tu sûr(e) de vouloir supprimer{" "}
                <strong>{employeASupprimer.nom}</strong> ? Cette action est
                irréversible.
              </p>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={fermerConfirmationSuppression}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  className="btn-submit btn-submit-danger"
                  onClick={handleConfirmerSuppression}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployesPage;
