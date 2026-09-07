import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import styles from '../../styles/pages/RegisterPage.module.css';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'agent'
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.nom || !formData.email || !formData.password) {
      showToast('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast('Les mots de passe ne correspondent pas', 'error');
      return;
    }

    if (formData.password.length < 6) {
      showToast('Le mot de passe doit contenir au moins 6 caractères', 'error');
      return;
    }

    setLoading(true);
    
    try {
      const result = await register({
        nom: formData.nom,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      
      if (result.success) {
        showToast('Inscription réussie ! Vous pouvez maintenant vous connecter.');
        navigate('/login');
      } else {
        showToast(result.message || 'Erreur lors de l\'inscription', 'error');
      }
    } catch (error) {
      showToast('Erreur lors de l\'inscription', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerCard}>
        <div className={styles.registerHeader}>
          <h1>
            <span>Suivi</span>
            <span className={styles.brandGold}>Terrain</span>
          </h1>
          <p>Créez votre compte</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.registerForm}>
          {/* Nom */}
          <div className={styles.formGroup}>
            <label htmlFor="nom" className={styles.formLabel}>
              <i className="bi bi-person" aria-hidden="true"></i>
              Nom complet
            </label>
            <input
              type="text"
              id="nom"
              className={styles.formInput}
              placeholder="Votre nom"
              value={formData.nom}
              onChange={handleChange}
              disabled={loading}
              required
              autoFocus
            />
          </div>

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
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          {/* Rôle */}
          <div className={styles.formGroup}>
            <label htmlFor="role" className={styles.formLabel}>
              <i className="bi bi-badge" aria-hidden="true"></i>
              Rôle
            </label>
            <select
              id="role"
              className={styles.formInput}
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="agent">Agent commercial</option>
              <option value="admin">Administrateur</option>
            </select>
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
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                required
                minLength={6}
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
            <small className={styles.formHelp}>
              Minimum 6 caractères
            </small>
          </div>

          {/* Confirmation mot de passe */}
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.formLabel}>
              <i className="bi bi-check-circle" aria-hidden="true"></i>
              Confirmer le mot de passe
            </label>
            <div className={styles.passwordWrapper}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                className={styles.formInput}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                required
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Masquer' : 'Afficher'}
              >
                <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
              </button>
            </div>
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
                Inscription en cours...
              </>
            ) : (
              <>
                <i className="bi bi-person-plus" aria-hidden="true"></i>
                Créer mon compte
              </>
            )}
          </button>

          {/* Lien connexion */}
          <p className={styles.loginLink}>
            Déjà un compte ?{' '}
            <Link to="/login" className={styles.link}>
              Se connecter
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;