import { useMemo, useState } from "react";
import {
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  CalendarDays,
  X,
} from "lucide-react";
import { useAuth } from "../../store/useAuthStore";
import { useCongesStore } from "../../store/useCongesStore";
import { typesConges } from "../../services/mockConges";
import Badge from "../../components/common/Badge/Badge";
import Button from "../../components/common/Button/Button";
import Pagination from "../../components/common/Pagination/Pagination";
import "./CongesPage.css";

const PAR_PAGE = 10;

const statutConfig = {
  en_attente: { label: "En attente", status: "warning" },
  validee: { label: "Validé", status: "success" },
  refusee: { label: "Refusé", status: "danger" },
};

function CongesPage() {
  const { role, user } = useAuth();
  const { demandes, ajouterDemande, validerDemande, refuserDemande } =
    useCongesStore();
  const [filtreStatut, setFiltreStatut] = useState("all");

  const canValidate = role === "admin_rh" || role === "manager";

  const [modalDemande, setModalDemande] = useState(false);
  const [nouvelleDemande, setNouvelleDemande] = useState({
    type: typesConges[0],
    dateDebut: "",
    dateFin: "",
    motif: "",
  });
  const [erreurDemande, setErreurDemande] = useState("");

  // Salarié ne voit que ses propres demandes, admin_rh/manager voient tout (mock global pour l'instant)
  const demandesVisibles = useMemo(() => {
    if (role === "salarie") {
      return demandes.filter((d) => d.employeNom === user?.name);
    }
    return demandes;
  }, [demandes, role, user]);

  const demandesFiltrees = useMemo(() => {
    if (filtreStatut === "all") return demandesVisibles;
    return demandesVisibles.filter((d) => d.statut === filtreStatut);
  }, [demandesVisibles, filtreStatut]);

  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(demandesFiltrees.length / PAR_PAGE));
  const [filtrePrecedent, setFiltrePrecedent] = useState(filtreStatut);
  if (filtreStatut !== filtrePrecedent) {
    setFiltrePrecedent(filtreStatut);
    setPage(1);
  } else if (page > totalPages) {
    setPage(totalPages);
  }
  const demandesAffichees = demandesFiltrees.slice(
    (page - 1) * PAR_PAGE,
    page * PAR_PAGE,
  );

  const stats = useMemo(() => {
    const enAttente = demandesVisibles.filter(
      (d) => d.statut === "en_attente",
    ).length;
    const validees = demandesVisibles.filter(
      (d) => d.statut === "validee",
    ).length;
    const refusees = demandesVisibles.filter(
      (d) => d.statut === "refusee",
    ).length;
    return { total: demandesVisibles.length, enAttente, validees, refusees };
  }, [demandesVisibles]);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const handleValider = (id) => {
    validerDemande(id);
  };

  const handleRefuser = (id) => {
    refuserDemande(id);
  };

  const ouvrirModalDemande = () => {
    setNouvelleDemande({
      type: typesConges[0],
      dateDebut: "",
      dateFin: "",
      motif: "",
    });
    setErreurDemande("");
    setModalDemande(true);
  };

  const fermerModalDemande = () => {
    setModalDemande(false);
  };

  const handleSoumettreDemande = (e) => {
    e.preventDefault();

    if (!nouvelleDemande.dateDebut || !nouvelleDemande.dateFin) {
      setErreurDemande("Merci de renseigner les dates de début et de fin.");
      return;
    }

    const debut = new Date(nouvelleDemande.dateDebut);
    const fin = new Date(nouvelleDemande.dateFin);

    if (fin < debut) {
      setErreurDemande("La date de fin doit être après la date de début.");
      return;
    }

    const jours =
      Math.round((fin - debut) / (1000 * 60 * 60 * 24)) + 1;

    const demandeCreee = {
      id: demandes.length + 1,
      employeNom: user?.name,
      type: nouvelleDemande.type,
      dateDebut: nouvelleDemande.dateDebut,
      dateFin: nouvelleDemande.dateFin,
      jours,
      statut: "en_attente",
      motif: nouvelleDemande.motif.trim(),
    };

    ajouterDemande(demandeCreee);
    fermerModalDemande();
  };

  return (
    <div className="conges-page">
      <div className="conges-header">
        <div>
          <h1>Congés & Absences</h1>
          <p className="conges-subtitle">
            {role === "salarie"
              ? "Suivez vos demandes de congés"
              : "Gérez les demandes de l'équipe"}
          </p>
        </div>
        {role === "salarie" && (
          <Button variant="primary" onClick={ouvrirModalDemande}>
            <Plus
              size={16}
              style={{ marginRight: "8px", verticalAlign: "-2px" }}
            />
            Nouvelle demande
          </Button>
        )}
      </div>

      <div className="conges-stats">
        <div className="stat-card">
          <div className="stat-icon stat-icon-primary">
            <CalendarDays size={20} />
          </div>
          <div>
            <p className="stat-value">{stats.total}</p>
            <p className="stat-label">Total demandes</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-warning">
            <Clock size={20} />
          </div>
          <div>
            <p className="stat-value">{stats.enAttente}</p>
            <p className="stat-label">En attente</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-success">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="stat-value">{stats.validees}</p>
            <p className="stat-label">Validées</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-danger">
            <XCircle size={20} />
          </div>
          <div>
            <p className="stat-value">{stats.refusees}</p>
            <p className="stat-label">Refusées</p>
          </div>
        </div>
      </div>

      <div className="conges-toolbar">
        <select
          className="conges-filter"
          value={filtreStatut}
          onChange={(e) => setFiltreStatut(e.target.value)}
        >
          <option value="all">Tous les statuts</option>
          <option value="en_attente">En attente</option>
          <option value="validee">Validé</option>
          <option value="refusee">Refusé</option>
        </select>
      </div>

      <div className="conges-table-wrapper">
        <table className="conges-table">
          <thead>
            <tr>
              {role !== "salarie" && <th>Employé</th>}
              <th>Type</th>
              <th>Période</th>
              <th>Jours</th>
              <th>Motif</th>
              <th>Statut</th>
              {canValidate && <th></th>}
            </tr>
          </thead>
          <tbody>
            {demandesAffichees.map((demande) => (
              <tr key={demande.id}>
                {role !== "salarie" && <td>{demande.employeNom}</td>}
                <td>{demande.type}</td>
                <td>
                  {formatDate(demande.dateDebut)} →{" "}
                  {formatDate(demande.dateFin)}
                </td>
                <td>{demande.jours} j</td>
                <td className="conges-motif">{demande.motif}</td>
                <td>
                  <Badge status={statutConfig[demande.statut].status}>
                    {statutConfig[demande.statut].label}
                  </Badge>
                </td>
                {canValidate && (
                  <td className="conges-actions">
                    {demande.statut === "en_attente" ? (
                      <>
                        <button
                          className="conges-action-valider"
                          onClick={() => handleValider(demande.id)}
                        >
                          Valider
                        </button>
                        <button
                          className="conges-action-refuser"
                          onClick={() => handleRefuser(demande.id)}
                        >
                          Refuser
                        </button>
                      </>
                    ) : (
                      <span className="conges-action-done">—</span>
                    )}
                  </td>
                )}
              </tr>
            ))}

            {demandesFiltrees.length === 0 && (
              <tr>
                <td colSpan={canValidate ? 7 : 6} className="conges-empty">
                  Aucune demande trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {/* Modal nouvelle demande de congé (salarié) */}
      {modalDemande && (
        <div className="modal-overlay" onClick={fermerModalDemande}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nouvelle demande de congé</h2>
              <button className="modal-close" onClick={fermerModalDemande}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSoumettreDemande} className="modal-form">
              <div className="form-group">
                <label htmlFor="type">Type de congé *</label>
                <select
                  id="type"
                  value={nouvelleDemande.type}
                  onChange={(e) =>
                    setNouvelleDemande({
                      ...nouvelleDemande,
                      type: e.target.value,
                    })
                  }
                >
                  {typesConges.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dateDebut">Date de début *</label>
                  <input
                    id="dateDebut"
                    type="date"
                    value={nouvelleDemande.dateDebut}
                    onChange={(e) =>
                      setNouvelleDemande({
                        ...nouvelleDemande,
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
                    value={nouvelleDemande.dateFin}
                    onChange={(e) =>
                      setNouvelleDemande({
                        ...nouvelleDemande,
                        dateFin: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="motif">Motif</label>
                <textarea
                  id="motif"
                  rows={3}
                  value={nouvelleDemande.motif}
                  onChange={(e) =>
                    setNouvelleDemande({
                      ...nouvelleDemande,
                      motif: e.target.value,
                    })
                  }
                  placeholder="Ex: Congés d'été en famille"
                />
              </div>

              {erreurDemande && <p className="modal-error">{erreurDemande}</p>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={fermerModalDemande}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-submit">
                  Envoyer la demande
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CongesPage;
