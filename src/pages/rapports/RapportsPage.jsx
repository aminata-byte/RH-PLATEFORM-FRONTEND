import { useMemo } from "react";
import { pdf } from "@react-pdf/renderer";
import {
  Users,
  CalendarDays,
  Target,
  Briefcase,
  Download,
} from "lucide-react";
import RapportPDF from "../../pdf/RapportPDF";
import { departements } from "../../services/mockEmployes";
import { typesDocument } from "../../services/mockDocuments";
import { useEmployesStore } from "../../store/useEmployesStore";
import { useCongesStore } from "../../store/useCongesStore";
import { usePerformanceStore } from "../../store/usePerformanceStore";
import { useRecrutementStore } from "../../store/useRecrutementStore";
import { useFormationStore } from "../../store/useFormationStore";
import { useDocumentsStore } from "../../store/useDocumentsStore";
import { useCarriereStore } from "../../store/useCarriereStore";
import "./RapportsPage.css";

const statutCongesLabels = {
  en_attente: "En attente",
  validee: "Validé",
  refusee: "Refusé",
};

const statutCandidatureLabels = {
  recue: "Reçue",
  en_entretien: "En entretien",
  acceptee: "Acceptée",
  refusee: "Refusée",
};

const statutInscriptionLabels = {
  en_attente: "En attente",
  confirmee: "Confirmée",
  terminee: "Terminée",
  annulee: "Annulée",
};

const statutSouhaitLabels = {
  en_attente: "En attente",
  examine: "En cours d'examen",
  planifie: "Planifié",
  realise: "Réalisé",
  refuse: "Refusé",
};

const statutColor = {
  en_attente: "accent",
  validee: "secondary",
  refusee: "danger",
  recue: "muted",
  en_entretien: "accent",
  acceptee: "secondary",
  confirmee: "muted",
  terminee: "secondary",
  annulee: "danger",
  examine: "muted",
  planifie: "primary",
  realise: "secondary",
  refuse: "danger",
};

const compterPar = (liste, cle) => {
  const compte = {};
  liste.forEach((item) => {
    compte[item[cle]] = (compte[item[cle]] || 0) + 1;
  });
  return compte;
};

function RepartitionBarres({ items }) {
  const max = Math.max(...items.map((i) => i.valeur), 1);
  return (
    <div className="rapport-barres">
      {items.map((item) => (
        <div className="rapport-bar-row" key={item.label}>
          <div className="rapport-bar-label">
            <span>{item.label}</span>
            <span className="rapport-bar-valeur">{item.valeur}</span>
          </div>
          <div className="rapport-bar-track">
            <div
              className={`rapport-bar-fill rapport-bar-${item.couleur ?? "primary"}`}
              style={{
                width: `${Math.max((item.valeur / max) * 100, item.valeur > 0 ? 4 : 0)}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function RapportsPage() {
  const mockEmployes = useEmployesStore((s) => s.employes);
  const mockConges = useCongesStore((s) => s.demandes);
  const mockObjectifs = usePerformanceStore((s) => s.objectifs);
  const mockEvaluations = usePerformanceStore((s) => s.evaluations);
  const mockCandidatures = useRecrutementStore((s) => s.candidatures);
  const mockInscriptions = useFormationStore((s) => s.inscriptions);
  const mockDocuments = useDocumentsStore((s) => s.documents);
  const mockSouhaitsEvolution = useCarriereStore((s) => s.souhaits);

  const kpis = useMemo(() => {
    const employesActifs = mockEmployes.filter(
      (e) => e.statut === "actif",
    ).length;
    const congesEnAttente = mockConges.filter(
      (c) => c.statut === "en_attente",
    ).length;
    const objectifsAtteints = mockObjectifs.filter(
      (o) => o.statut === "atteint",
    ).length;
    const candidaturesEnCours = mockCandidatures.filter(
      (c) => c.statut === "recue" || c.statut === "en_entretien",
    ).length;
    return {
      employesActifs,
      totalEmployes: mockEmployes.length,
      congesEnAttente,
      objectifsAtteints,
      totalObjectifs: mockObjectifs.length,
      candidaturesEnCours,
    };
  }, [mockEmployes, mockConges, mockObjectifs, mockCandidatures]);

  const repartitionDepartements = useMemo(
    () =>
      departements.map((dep) => ({
        label: dep,
        valeur: mockEmployes.filter((e) => e.departement === dep).length,
        couleur: "primary",
      })),
    [mockEmployes],
  );

  const repartitionConges = useMemo(() => {
    const compte = compterPar(mockConges, "statut");
    return Object.keys(statutCongesLabels).map((statut) => ({
      label: statutCongesLabels[statut],
      valeur: compte[statut] || 0,
      couleur: statutColor[statut],
    }));
  }, [mockConges]);

  const repartitionCandidatures = useMemo(() => {
    const compte = compterPar(mockCandidatures, "statut");
    return Object.keys(statutCandidatureLabels).map((statut) => ({
      label: statutCandidatureLabels[statut],
      valeur: compte[statut] || 0,
      couleur: statutColor[statut],
    }));
  }, [mockCandidatures]);

  const repartitionInscriptions = useMemo(() => {
    const compte = compterPar(mockInscriptions, "statut");
    return Object.keys(statutInscriptionLabels).map((statut) => ({
      label: statutInscriptionLabels[statut],
      valeur: compte[statut] || 0,
      couleur: statutColor[statut],
    }));
  }, [mockInscriptions]);

  const repartitionDocuments = useMemo(() => {
    const compte = compterPar(mockDocuments, "type");
    return typesDocument.map((type) => ({
      label: type,
      valeur: compte[type] || 0,
      couleur: "primary",
    }));
  }, [mockDocuments]);

  const repartitionSouhaits = useMemo(() => {
    const compte = compterPar(mockSouhaitsEvolution, "statut");
    return Object.keys(statutSouhaitLabels).map((statut) => ({
      label: statutSouhaitLabels[statut],
      valeur: compte[statut] || 0,
      couleur: statutColor[statut],
    }));
  }, [mockSouhaitsEvolution]);

  const noteMoyenne =
    mockEvaluations.length > 0
      ? (
          mockEvaluations.reduce((sum, e) => sum + e.note, 0) /
          mockEvaluations.length
        ).toFixed(1)
      : "—";

  // Assemble les répartitions déjà calculées en sections tabulaires pour le PDF.
  // Le même schéma (titre + colonnes + lignes) peut être réutilisé pour générer
  // un rapport dédié à un seul module (congés seuls, recrutement seul...) en ne
  // passant qu'une section — c'est le patron à dupliquer pour les autres exports.
  const versSection = (titre, items) => ({
    titre,
    colonnes: ["Catégorie", "Nombre"],
    lignes: items.map((i) => [i.label, String(i.valeur)]),
  });

  const handleExporter = async () => {
    const blob = await pdf(
      <RapportPDF
        titre="Rapport RH — Vue d'ensemble"
        kpis={[
          { label: "Employés actifs", valeur: `${kpis.employesActifs}/${kpis.totalEmployes}` },
          { label: "Congés en attente", valeur: kpis.congesEnAttente },
          { label: "Objectifs atteints", valeur: `${kpis.objectifsAtteints}/${kpis.totalObjectifs}` },
          { label: "Candidatures en cours", valeur: kpis.candidaturesEnCours },
          { label: "Note perf. moyenne", valeur: `${noteMoyenne}/5` },
        ]}
        sections={[
          versSection("Employés par département", repartitionDepartements),
          versSection("Congés par statut", repartitionConges),
          versSection("Candidatures par statut", repartitionCandidatures),
          versSection("Documents par type", repartitionDocuments),
        ]}
      />,
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const lien = document.createElement("a");
    lien.href = url;
    lien.download = `rapport-rh-${new Date().toISOString().slice(0, 10)}.pdf`;
    lien.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="rapports-page">
      <div className="rapports-header">
        <div>
          <h1>Rapports</h1>
          <p className="rapports-subtitle">
            Vue d'ensemble de l'activité RH de l'entreprise
          </p>
        </div>
        <button className="btn-publier" onClick={handleExporter}>
          <Download size={16} style={{ marginRight: "8px", verticalAlign: "-2px" }} />
          Exporter le rapport
        </button>
      </div>

      <div className="rapports-kpis">
        <div className="stat-card">
          <div className="stat-icon stat-icon-primary">
            <Users size={20} />
          </div>
          <div>
            <p className="stat-value">
              {kpis.employesActifs}/{kpis.totalEmployes}
            </p>
            <p className="stat-label">Employés actifs</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-warning">
            <CalendarDays size={20} />
          </div>
          <div>
            <p className="stat-value">{kpis.congesEnAttente}</p>
            <p className="stat-label">Congés en attente</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-success">
            <Target size={20} />
          </div>
          <div>
            <p className="stat-value">
              {kpis.objectifsAtteints}/{kpis.totalObjectifs}
            </p>
            <p className="stat-label">Objectifs atteints</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-secondary">
            <Briefcase size={20} />
          </div>
          <div>
            <p className="stat-value">{kpis.candidaturesEnCours}</p>
            <p className="stat-label">Candidatures en cours</p>
          </div>
        </div>
      </div>

      <div className="rapports-grid">
        <div className="rapport-card">
          <h2 className="rapport-card-title">Employés par département</h2>
          <RepartitionBarres items={repartitionDepartements} />
        </div>

        <div className="rapport-card">
          <h2 className="rapport-card-title">Congés par statut</h2>
          <RepartitionBarres items={repartitionConges} />
        </div>

        <div className="rapport-card">
          <h2 className="rapport-card-title">Candidatures par statut</h2>
          <RepartitionBarres items={repartitionCandidatures} />
        </div>

        <div className="rapport-card">
          <h2 className="rapport-card-title">Inscriptions formation par statut</h2>
          <RepartitionBarres items={repartitionInscriptions} />
        </div>

        <div className="rapport-card">
          <h2 className="rapport-card-title">Documents par type</h2>
          <RepartitionBarres items={repartitionDocuments} />
        </div>

        <div className="rapport-card">
          <h2 className="rapport-card-title">Souhaits d'évolution par statut</h2>
          <RepartitionBarres items={repartitionSouhaits} />
        </div>
      </div>
    </div>
  );
}

export default RapportsPage;
