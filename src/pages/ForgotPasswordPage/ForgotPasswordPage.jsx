import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../store/useAuthStore";
import Button from "../../components/common/Button/Button";
import "./ForgotPasswordPage.css";

function ForgotPasswordPage() {
  const [etape, setEtape] = useState(1);
  const [email, setEmail] = useState("");
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [succes, setSucces] = useState(false);

  const { resetPassword, compteExiste } = useAuth();
  const navigate = useNavigate();

  const handleValiderEmail = (e) => {
    e.preventDefault();
    setError("");

    if (!compteExiste(email)) {
      setError("Aucun compte associé à cet email.");
      return;
    }

    setEtape(2);
  };

  const handleReinitialiser = async (e) => {
    e.preventDefault();
    setError("");

    if (nouveauMotDePasse.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (nouveauMotDePasse !== confirmation) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, nouveauMotDePasse);
      setSucces(true);
    } catch (err) {
      setError(err.message || "Impossible de réinitialiser le mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  if (succes) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h1 className="login-title">RH Platform</h1>
          <p className="login-subtitle">Mot de passe mis à jour</p>
          <p className="forgot-success">
            Votre mot de passe a bien été réinitialisé. Vous pouvez maintenant
            vous connecter avec votre nouveau mot de passe.
          </p>
          <Button variant="primary" onClick={() => navigate("/login")}>
            Retour à la connexion
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">RH Platform</h1>
        <p className="login-subtitle">
          {etape === 1
            ? "Retrouvez l'accès à votre compte"
            : "Choisissez un nouveau mot de passe"}
        </p>

        {etape === 1 ? (
          <form onSubmit={handleValiderEmail} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@entreprise.com"
                required
              />
            </div>

            {error && <p className="login-error">{error}</p>}

            <Button type="submit" variant="primary">
              Continuer
            </Button>
          </form>
        ) : (
          <form onSubmit={handleReinitialiser} className="login-form">
            <div className="form-group">
              <label htmlFor="nouveauMotDePasse">Nouveau mot de passe</label>
              <input
                id="nouveauMotDePasse"
                type="password"
                value={nouveauMotDePasse}
                onChange={(e) => setNouveauMotDePasse(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmation">Confirmer le mot de passe</label>
              <input
                id="confirmation"
                type="password"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && <p className="login-error">{error}</p>}

            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
            </Button>
          </form>
        )}

        <p className="login-footer">
          <Link to="/login">Retour à la connexion</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
