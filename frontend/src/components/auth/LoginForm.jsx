import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import styles from '../../styles/pages/LoginPage.module.css';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      showToast('Veuillez remplir tous les champs', 'error');
      return;
    }

    setLoading(true);
    
    try {
      const result = await login(email, password);
      
      if (result.success) {
        showToast('Connexion réussie ! Bienvenue ' + result.user.nom);
        navigate('/');
      } else {
        showToast(result.message || 'Erreur de connexion', 'error');
      }
    } catch (error) {
      showToast('Erreur lors de la connexion', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <h1>
            <span>Suivi</span>
            <span className={styles.brandGold}>Terrain</span>
          </h1>
          <p>Connectez-vous à votre compte</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          {/* Email */}
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>
              <i className="bi bi-envelope" aria-hidden="true"></i>
              Email
            </label>
            <input
              type="email"
              id="email"
              className={styles.formInput}
              placeholder="exemple@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoFocus
              required
            />
          </div>

          {/* Mot de passe */}
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.formLabel}>
              <i className="bi bi-lock" aria-hidden="true"></i>
              Mot de passe
            </label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className={styles.formInput}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
              </button>
            </div>
          </div>

          {/* Options */}
          <div className={styles.formOptions}>
            <label className={styles.rememberMe}>
              <input type="checkbox" />
              <span>Se souvenir de moi</span>
            </label>
            <Link to="/forgot-password" className={styles.forgotPassword}>
              Mot de passe oublié ?
            </Link>
          </div>

          {/* Bouton */}
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Connexion en cours...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right" aria-hidden="true"></i>
                Se connecter
              </>
            )}
          </button>

          {/* Inscription */}
          <p className={styles.registerLink}>
            Pas encore de compte ?{' '}
            <Link to="/register" className={styles.link}>
              Créer un compte
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;