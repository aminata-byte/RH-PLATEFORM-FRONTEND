import { useMemo, useState } from "react";
import {
  FileText,
  Receipt,
  FileSignature,
  Search,
  Download,
  Upload,
  X,
} from "lucide-react";
import { useAuth } from "../../store/useAuthStore";
import { useDocumentsStore } from "../../store/useDocumentsStore";
import { useEmployesStore } from "../../store/useEmployesStore";
import { typesDocument } from "../../services/mockDocuments";
import Badge from "../../components/common/Badge/Badge";
import "./DocumentsPage.css";

const typeBadgeStatus = {
  "Bulletin de paie": "success",
  "Contrat de travail": "default",
  "Attestation de travail": "warning",
  "Attestation de salaire": "warning",
  Autre: "default",
};

const dateCompleteActuelle = () =>
  new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const titrePourType = (type) => `${type} — ${dateCompleteActuelle()}`;

function DocumentsPage() {
  const { role, user } = useAuth();

  const { documents, ajouterDocument } = useDocumentsStore();
  const employesInternes = useEmployesStore((s) => s.employes);
  const [search, setSearch] = useState("");
  const [typeFiltre, setTypeFiltre] = useState("all");
  const [employeFiltre, setEmployeFiltre] = useState("all");

  const [modalAjout, setModalAjout] = useState(false);
  const [nouveauDocument, setNouveauDocument] = useState({
    employeEmail: employesInternes[0]?.email ?? "",
    type: typesDocument[0],
    titre: "",
  });
  const [fichier, setFichier] = useState(null);
  const [erreurDocument, setErreurDocument] = useState("");

  const canGerer = role === "admin_rh";
  // Manager et salarié n'ont accès qu'à leurs propres documents ;
  // seul admin_rh voit et gère les documents de tous les employés.
  const vuePersonnelle = role === "manager" || role === "salarie";

  const documentsVisibles = useMemo(() => {
    if (vuePersonnelle) {
      return documents.filter((d) => d.employeEmail === user?.email);
    }
    return documents;
  }, [documents, vuePersonnelle, user]);

  const documentsFiltres = useMemo(() => {
    return documentsVisibles.filter((doc) => {
      const matchSearch =
        doc.titre.toLowerCase().includes(search.toLowerCase()) ||
        doc.employeNom.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFiltre === "all" || doc.type === typeFiltre;
      const matchEmploye =
        employeFiltre === "all" || doc.employeEmail === employeFiltre;
      return matchSearch && matchType && matchEmploye;
    });
  }, [documentsVisibles, search, typeFiltre, employeFiltre]);

  const stats = useMemo(() => {
    const total = documentsVisibles.length;
    const bulletins = documentsVisibles.filter(
      (d) => d.type === "Bulletin de paie",
    ).length;
    const contrats = documentsVisibles.filter(
      (d) => d.type === "Contrat de travail",
    ).length;
    const maintenant = new Date();
    const ceMois = documentsVisibles.filter((d) => {
      const date = new Date(d.dateAjout);
      return (
        date.getMonth() === maintenant.getMonth() &&
        date.getFullYear() === maintenant.getFullYear()
      );
    }).length;
    return { total, bulletins, contrats, ceMois };
  }, [documentsVisibles]);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const handleTelecharger = (doc) => {
    let url;
    let nomFichier = doc.fichierNom;

    if (doc.fichierFile instanceof File) {
      url = URL.createObjectURL(doc.fichierFile);
    } else {
      const contenu = [
        `Document : ${doc.titre}`,
        `Employé : ${doc.employeNom}`,
        `Type : ${doc.type}`,
        `Ajouté le : ${formatDate(doc.dateAjout)}`,
        "",
        "(Fichier de démonstration — à remplacer par le vrai document une fois le backend connecté.)",
      ].join("\n");
      const blob = new Blob([contenu], { type: "text/plain;charset=utf-8" });
      url = URL.createObjectURL(blob);
      nomFichier = nomFichier.replace(/\.[^.]+$/, "") + ".txt";
    }

    const lien = document.createElement("a");
    lien.href = url;
    lien.download = nomFichier;
    lien.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // --- Ajout document (admin_rh) ---
  const [roleFiltreModal, setRoleFiltreModal] = useState(null);

  const employesOptionsModal = roleFiltreModal
    ? employesInternes.filter((e) => e.role === roleFiltreModal)
    : employesInternes;

  const ouvrirModalAjout = (role = null) => {
    setRoleFiltreModal(role);
    const options = role
      ? employesInternes.filter((e) => e.role === role)
      : employesInternes;
    setNouveauDocument({
      employeEmail: options[0]?.email ?? "",
      type: typesDocument[0],
      titre: titrePourType(typesDocument[0]),
    });
    setFichier(null);
    setErreurDocument("");
    setModalAjout(true);
  };

  const fermerModalAjout = () => {
    setModalAjout(false);
  };

  const handleFichierChange = (e) => {
    const f = e.target.files[0];
    if (f) setFichier(f);
  };

  const handleAjouterDocument = (e) => {
    e.preventDefault();

    if (nouveauDocument.titre.trim().length < 3) {
      setErreurDocument("Merci de donner un titre au document.");
      return;
    }
    if (!fichier) {
      setErreurDocument("Merci de joindre un fichier.");
      return;
    }

    const employe = employesInternes.find(
      (u) => u.email === nouveauDocument.employeEmail,
    );

    const documentCree = {
      id: documents.length + 1,
      employeNom: employe?.nom ?? "",
      employeEmail: employe?.email ?? "",
      type: nouveauDocument.type,
      titre: nouveauDocument.titre.trim(),
      dateAjout: new Date().toISOString().slice(0, 10),
      fichierNom: fichier.name,
      fichierFile: fichier,
    };

    ajouterDocument(documentCree);
    fermerModalAjout();
  };

  return (
    <div className="documents-page">
      <div className="documents-header">
        <div>
          <h1>Documents RH</h1>
          <p className="documents-subtitle">
            {vuePersonnelle
              ? "Retrouvez vos bulletins de paie, contrats et attestations"
              : "Gérez les documents des employés"}
          </p>
        </div>
        {canGerer && (
          <div className="documents-header-actions">
            <button
              className="btn-publier"
              onClick={() => ouvrirModalAjout("salarie")}
            >
              + Ajouter un document employé
            </button>
            <button
              className="btn-publier btn-publier-outline"
              onClick={() => ouvrirModalAjout("manager")}
            >
              + Ajouter document manager
            </button>
          </div>
        )}
      </div>

      <div className="documents-stats">
        <div className="stat-card">
          <div className="stat-icon stat-icon-primary">
            <FileText size={20} />
          </div>
          <div>
            <p className="stat-value">{stats.total}</p>
            <p className="stat-label">
              {vuePersonnelle ? "Mes documents" : "Total documents"}
            </p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-success">
            <Receipt size={20} />
          </div>
          <div>
            <p className="stat-value">{stats.bulletins}</p>
            <p className="stat-label">Bulletins de paie</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-secondary">
            <FileSignature size={20} />
          </div>
          <div>
            <p className="stat-value">{stats.contrats}</p>
            <p className="stat-label">Contrats</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-warning">
            <Upload size={20} />
          </div>
          <div>
            <p className="stat-value">{stats.ceMois}</p>
            <p className="stat-label">Ajoutés ce mois-ci</p>
          </div>
        </div>
      </div>

      <div className="documents-toolbar">
        <div className="documents-search">
          <Search size={18} />
          <input
            type="text"
            placeholder={
              vuePersonnelle
                ? "Rechercher un document..."
                : "Rechercher un document ou un employé..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="documents-filter"
          value={typeFiltre}
          onChange={(e) => setTypeFiltre(e.target.value)}
        >
          <option value="all">Tous les types</option>
          {typesDocument.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        {!vuePersonnelle && (
          <select
            className="documents-filter"
            value={employeFiltre}
            onChange={(e) => setEmployeFiltre(e.target.value)}
          >
            <option value="all">Tous les employés</option>
            {employesInternes.map((employe) => (
              <option key={employe.email} value={employe.email}>
                {employe.nom}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="documents-table-wrapper">
        <table className="documents-table">
          <thead>
            <tr>
              <th>Document</th>
              {!vuePersonnelle && <th>Employé</th>}
              <th>Type</th>
              <th>Date d'ajout</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {documentsFiltres.map((doc) => (
              <tr key={doc.id}>
                <td>
                  <div className="document-titre">
                    <FileText size={16} />
                    <span>{doc.titre}</span>
                  </div>
                </td>
                {!vuePersonnelle && <td>{doc.employeNom}</td>}
                <td>
                  <Badge status={typeBadgeStatus[doc.type]}>{doc.type}</Badge>
                </td>
                <td>{formatDate(doc.dateAjout)}</td>
                <td>
                  <button
                    className="document-telecharger"
                    onClick={() => handleTelecharger(doc)}
                  >
                    <Download size={14} />
                    Télécharger
                  </button>
                </td>
              </tr>
            ))}

            {documentsFiltres.length === 0 && (
              <tr>
                <td
                  colSpan={vuePersonnelle ? 4 : 5}
                  className="documents-empty"
                >
                  Aucun document trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal ajout document */}
      {modalAjout && (
        <div className="modal-overlay" onClick={fermerModalAjout}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {roleFiltreModal === "manager"
                  ? "Ajouter un document — Manager"
                  : "Ajouter un document — Employé"}
              </h2>
              <button className="modal-close" onClick={fermerModalAjout}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAjouterDocument} className="modal-form">
              <div className="form-group">
                <label htmlFor="employe">Employé *</label>
                <select
                  id="employe"
                  value={nouveauDocument.employeEmail}
                  onChange={(e) =>
                    setNouveauDocument({
                      ...nouveauDocument,
                      employeEmail: e.target.value,
                    })
                  }
                >
                  {employesOptionsModal.map((employe) => (
                    <option key={employe.email} value={employe.email}>
                      {employe.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="type">Type de document *</label>
                <select
                  id="type"
                  value={nouveauDocument.type}
                  onChange={(e) =>
                    setNouveauDocument({
                      ...nouveauDocument,
                      type: e.target.value,
                      titre: titrePourType(e.target.value),
                    })
                  }
                >
                  {typesDocument.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="titre">Titre *</label>
                <input
                  id="titre"
                  type="text"
                  value={nouveauDocument.titre}
                  onChange={(e) =>
                    setNouveauDocument({
                      ...nouveauDocument,
                      titre: e.target.value,
                    })
                  }
                  placeholder="Ex: Bulletin de paie — Juillet 2026"
                />
              </div>

              <div className="form-group">
                <label htmlFor="fichier">Fichier *</label>
                <label className="file-upload">
                  <Upload size={16} />
                  <span>{fichier ? fichier.name : "Choisir un fichier"}</span>
                  <input
                    id="fichier"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFichierChange}
                    hidden
                  />
                </label>
              </div>

              {erreurDocument && (
                <p className="modal-error">{erreurDocument}</p>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={fermerModalAjout}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-submit">
                  Ajouter le document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentsPage;
