import { useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, MapPin, Upload, X } from "lucide-react";
import { useRecrutementStore } from "../../store/useRecrutementStore";
import Badge from "../../components/common/Badge/Badge";
import { entreprise } from "../../pdf/entreprise";
import "./OffresPubliquesPage.css";

const formulaireVide = { prenom: "", nom: "", email: "" };

function OffresPubliquesPage() {
  const { offres, candidatures, ajouterCandidature } = useRecrutementStore();

  const offresOuvertes = offres.filter((o) => o.statut === "ouverte");

  const [offreSelectionnee, setOffreSelectionnee] = useState(null);
  const [formulaire, setFormulaire] = useState(formulaireVide);
  const [cvFichier, setCvFichier] = useState(null);
  const [lettreFichier, setLettreFichier] = useState(null);
  const [erreur, setErreur] = useState("");
  const [envoyee, setEnvoyee] = useState(false);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const ouvrirCandidature = (offre) => {
    setOffreSelectionnee(offre);
    setFormulaire(formulaireVide);
    setCvFichier(null);
    setLettreFichier(null);
    setErreur("");
    setEnvoyee(false);
  };

  const fermerModal = () => {
    setOffreSelectionnee(null);
  };

  const handleCvChange = (e) => {
    const fichier = e.target.files[0];
    if (fichier) setCvFichier(fichier);
  };

  const handleLettreChange = (e) => {
    const fichier = e.target.files[0];
    if (fichier) setLettreFichier(fichier);
  };

  const handleSoumettre = (e) => {
    e.preventDefault();

    if (!formulaire.prenom.trim() || !formulaire.nom.trim()) {
      setErreur("Merci de renseigner votre prénom et votre nom.");
      return;
    }
    if (!formulaire.email.trim().includes("@")) {
      setErreur("Merci de renseigner un email valide.");
      return;
    }
    if (!cvFichier) {
      setErreur("Merci de joindre votre CV.");
      return;
    }
    if (!lettreFichier) {
      setErreur("Merci de joindre votre lettre de motivation.");
      return;
    }

    const emailNormalise = formulaire.email.trim().toLowerCase();
    const dejaCandidate = candidatures.some(
      (c) =>
        c.offreId === offreSelectionnee.id &&
        c.candidatEmail.toLowerCase() === emailNormalise,
    );
    if (dejaCandidate) {
      setErreur("Vous avez déjà postulé à cette offre avec cet email.");
      return;
    }

    ajouterCandidature({
      id: candidatures.length + 1,
      offreId: offreSelectionnee.id,
      offreTitre: offreSelectionnee.titre,
      candidatNom: `${formulaire.prenom.trim()} ${formulaire.nom.trim()}`,
      candidatEmail: formulaire.email.trim(),
      dateCandidature: new Date().toISOString().slice(0, 10),
      statut: "recue",
      cvNom: cvFichier.name,
      lettreNom: lettreFichier.name,
      cvFile: cvFichier,
      lettreFile: lettreFichier,
    });

    setEnvoyee(true);
  };

  return (
    <div className="offres-publiques-page">
      <header className="offres-publiques-header">
        <div className="offres-publiques-brand">RH Platform</div>
        <Link to="/login" className="offres-publiques-espace-rh">
          Espace RH
        </Link>
      </header>

      <div className="offres-publiques-hero">
        <div className="offres-publiques-hero-inner">
          <span className="offres-publiques-eyebrow">Carrières chez {entreprise.nom}</span>
          <h1>Construisons l'avenir ensemble</h1>
          <p>
            Découvrez nos postes ouverts et postulez directement en ligne — aucun
            compte n'est nécessaire.
          </p>
          <span className="offres-publiques-compteur">
            {offresOuvertes.length} poste{offresOuvertes.length > 1 ? "s" : ""} ouvert
            {offresOuvertes.length > 1 ? "s" : ""} actuellement
          </span>
        </div>
      </div>

      <div className="offres-publiques-grid">
        {offresOuvertes.map((offre) => (
          <div className="offre-publique-card" key={offre.id}>
            <div className="offre-publique-icone">
              <Briefcase size={20} />
            </div>
            <div className="offre-publique-top">
              <p className="offre-publique-titre">{offre.titre}</p>
              <Badge status="success">Ouverte</Badge>
            </div>
            <p className="offre-publique-meta">
              <Briefcase size={14} />
              {offre.departement} · {offre.type}
            </p>
            <p className="offre-publique-meta">
              <MapPin size={14} />
              {offre.localisation}
            </p>
            <p className="offre-publique-date">
              Publiée le {formatDate(offre.datePublication)}
            </p>
            <button
              className="offre-publique-postuler"
              onClick={() => ouvrirCandidature(offre)}
            >
              Postuler
            </button>
          </div>
        ))}

        {offresOuvertes.length === 0 && (
          <p className="offres-publiques-empty">
            Aucune offre ouverte pour le moment. Revenez bientôt !
          </p>
        )}
      </div>

      <footer className="offres-publiques-footer">
        <p>{entreprise.nom}</p>
        <p>
          {entreprise.adresse} — {entreprise.ville}
        </p>
        <p className="offres-publiques-footer-plateforme">
          Recrutement propulsé par RH Platform
        </p>
      </footer>

      {offreSelectionnee && (
        <div className="modal-overlay" onClick={fermerModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {envoyee ? "Candidature envoyée" : `Postuler — ${offreSelectionnee.titre}`}
              </h2>
              <button className="modal-close" onClick={fermerModal}>
                <X size={20} />
              </button>
            </div>

            {envoyee ? (
              <div className="modal-form">
                <p>
                  Merci {formulaire.prenom} ! Votre candidature pour le poste «{" "}
                  {offreSelectionnee.titre} » a bien été envoyée. Nous reviendrons
                  vers vous par email.
                </p>
                <div className="modal-actions">
                  <button type="button" className="btn-submit" onClick={fermerModal}>
                    Fermer
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSoumettre} className="modal-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="prenom">Prénom *</label>
                    <input
                      id="prenom"
                      type="text"
                      value={formulaire.prenom}
                      onChange={(e) =>
                        setFormulaire({ ...formulaire, prenom: e.target.value })
                      }
                      placeholder="Ex: Ibrahima"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="nom">Nom *</label>
                    <input
                      id="nom"
                      type="text"
                      value={formulaire.nom}
                      onChange={(e) =>
                        setFormulaire({ ...formulaire, nom: e.target.value })
                      }
                      placeholder="Ex: Ba"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    id="email"
                    type="email"
                    value={formulaire.email}
                    onChange={(e) =>
                      setFormulaire({ ...formulaire, email: e.target.value })
                    }
                    placeholder="vous@email.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cv">CV (PDF) *</label>
                  <label className="file-upload">
                    <Upload size={16} />
                    <span>{cvFichier ? cvFichier.name : "Choisir un fichier"}</span>
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

                {erreur && <p className="modal-error">{erreur}</p>}

                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={fermerModal}>
                    Annuler
                  </button>
                  <button type="submit" className="btn-submit">
                    Envoyer ma candidature
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default OffresPubliquesPage;
