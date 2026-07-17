import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { pdf } from "@react-pdf/renderer";
import { ArrowLeft, FileText, X } from "lucide-react";
import { useAuth } from "../../store/useAuthStore";
import { useRecrutementStore } from "../../store/useRecrutementStore";
import Badge from "../../components/common/Badge/Badge";
import CandidaturePieceJointePDF from "../../pdf/CandidaturePieceJointePDF";
import "./RecrutementPage.css";
import "../../styles/detail-page.css";

const statutCandidatureConfig = {
  recue: { label: "Reçue", status: "default" },
  en_entretien: { label: "En entretien", status: "warning" },
  acceptee: { label: "Acceptée", status: "success" },
  refusee: { label: "Refusée", status: "danger" },
};

function CandidatureDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const { candidatures, modifierStatutCandidature } = useRecrutementStore();

  const canPublier = role === "admin_rh";

  const candidature = useMemo(
    () => candidatures.find((c) => c.id === Number(id)),
    [candidatures, id],
  );

  const [apercu, setApercu] = useState(null); // { titre, url }
  const [chargementApercu, setChargementApercu] = useState(null); // "cv" | "lettre" | null

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const ouvrirApercu = async (type) => {
    const fichier = type === "cv" ? candidature.cvFile : candidature.lettreFile;
    const titre =
      type === "cv"
        ? `CV — ${candidature.candidatNom}`
        : `Lettre de motivation — ${candidature.candidatNom}`;

    if (apercu) URL.revokeObjectURL(apercu.url);

    if (fichier instanceof File) {
      setApercu({ titre, url: URL.createObjectURL(fichier) });
      return;
    }

    setChargementApercu(type);
    const blob = await pdf(
      <CandidaturePieceJointePDF
        titre={titre}
        candidatNom={candidature.candidatNom}
        offreTitre={candidature.offreTitre}
        dateEdition={formatDate(candidature.dateCandidature)}
      />,
    ).toBlob();
    setApercu({ titre, url: URL.createObjectURL(blob) });
    setChargementApercu(null);
  };

  const fermerApercu = () => {
    if (apercu) URL.revokeObjectURL(apercu.url);
    setApercu(null);
  };

  const retour = () => {
    if (apercu) URL.revokeObjectURL(apercu.url);
    navigate("/recrutement");
  };

  if (!candidature) {
    return (
      <div className="detail-page">
        <button className="detail-page-back" onClick={retour}>
          <ArrowLeft size={16} />
          Retour au recrutement
        </button>
        <p className="detail-page-not-found">Candidature introuvable.</p>
      </div>
    );
  }

  return (
    <div className="detail-page">
      <button className="detail-page-back" onClick={retour}>
        <ArrowLeft size={16} />
        Retour au recrutement
      </button>

      <div className="detail-page-card">
        <h1>{candidature.candidatNom}</h1>

        <div className="detail-page-form">
          <div className="detail-row">
            <span className="detail-label">Offre</span>
            <span className="detail-value">{candidature.offreTitre}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Date de candidature</span>
            <span className="detail-value">
              {formatDate(candidature.dateCandidature)}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Statut</span>
            <Badge status={statutCandidatureConfig[candidature.statut].status}>
              {statutCandidatureConfig[candidature.statut].label}
            </Badge>
          </div>

          <div className="detail-files">
            <button
              type="button"
              className="detail-file-link"
              disabled={chargementApercu === "cv"}
              onClick={() => ouvrirApercu("cv")}
            >
              <FileText size={16} />
              {chargementApercu === "cv" ? "Génération de l'aperçu..." : candidature.cvNom}
            </button>
            <button
              type="button"
              className="detail-file-link"
              disabled={chargementApercu === "lettre"}
              onClick={() => ouvrirApercu("lettre")}
            >
              <FileText size={16} />
              {chargementApercu === "lettre"
                ? "Génération de l'aperçu..."
                : candidature.lettreNom}
            </button>
          </div>

          {apercu && (
            <div className="apercu-panel">
              <div className="apercu-panel-header">
                <span>{apercu.titre}</span>
                <button type="button" className="modal-close" onClick={fermerApercu}>
                  <X size={18} />
                </button>
              </div>
              <iframe className="apercu-frame" src={apercu.url} title={apercu.titre} />
            </div>
          )}

          {canPublier && candidature.statut !== "acceptee" && (
            <div className="modal-actions detail-actions">
              {candidature.statut === "recue" && (
                <button
                  type="button"
                  className="btn-action-entretien"
                  onClick={() =>
                    modifierStatutCandidature(candidature.id, "en_entretien")
                  }
                >
                  Passer en entretien
                </button>
              )}
              {candidature.statut !== "refusee" && (
                <button
                  type="button"
                  className="btn-action-accepter"
                  onClick={() =>
                    modifierStatutCandidature(candidature.id, "acceptee")
                  }
                >
                  Accepter
                </button>
              )}
              {candidature.statut !== "refusee" && (
                <button
                  type="button"
                  className="btn-action-refuser"
                  onClick={() =>
                    modifierStatutCandidature(candidature.id, "refusee")
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
  );
}

export default CandidatureDetailPage;
