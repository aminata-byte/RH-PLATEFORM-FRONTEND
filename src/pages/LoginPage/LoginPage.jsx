import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../store/useAuthStore";
import Button from "../../components/common/Button/Button";
import "./LoginPage.css";

const roleRedirect = {
  admin_rh: "/dashboard",
  manager: "/dashboard",
  salarie: "/portail",
  candidat: "/recrutement",
};

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(email, password);
      navigate(roleRedirect[user.role] || "/");
    } catch (err) {
      setError("Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">RH Platform</h1>
        <p className="login-subtitle">Connectez-vous à votre espace</p>

        <form onSubmit={handleSubmit} className="login-form">
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

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <Link to="/mot-de-passe-oublie" className="login-forgot-link">
              Mot de passe oublié ?
            </Link>
          </div>

          {error && <p className="login-error">{error}</p>}

          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </Button>
        </form>

        <p className="login-footer">
          Vous êtes candidat ?{" "}
          <Link to="/inscription">Créez votre compte</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
