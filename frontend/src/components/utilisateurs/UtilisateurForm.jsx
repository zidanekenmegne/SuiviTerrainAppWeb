import { useState } from 'react';
import styles from '../../styles/pages/UtilisateursPage.module.css';

/**
 * Formulaire d'ajout d'un utilisateur
 */
const UtilisateurForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    password: '',
    role: 'agent',
    zone_intervention: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // ==========================================================
  // HANDLERS
  // ==========================================================
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est obligatoire';
    } else if (formData.nom.trim().length < 2) {
      newErrors.nom = 'Le nom doit contenir au moins 2 caractères';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est obligatoire';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est obligatoire';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      const result = await onSubmit({
        nom: formData.nom.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        zone_intervention: formData.zone_intervention.trim() || null
      });

      if (result.success) {
        setFormData({
          nom: '',
          email: '',
          password: '',
          role: 'agent',
          zone_intervention: ''
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // RENDU
  // ==========================================================
  return (
    <div className={styles.formContainer}>
      <div className={styles.formTitle}>
        <i className="bi bi-person-plus" aria-hidden="true"></i> 
        Nouvel utilisateur
      </div>

      <form onSubmit={handleSubmit}>
        {/* Nom */}
        <div className={styles.formGroup}>
          <label htmlFor="nom" className={styles.formLabel}>
            Nom complet <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            id="nom"
            className={`${styles.formControl} ${errors.nom ? styles.invalid : ''}`}
            placeholder="Entrez le nom complet"
            value={formData.nom}
            onChange={handleChange}
            disabled={loading}
            autoFocus
          />
          {errors.nom && <div className={styles.errorMessage}>{errors.nom}</div>}
        </div>

        {/* Email */}
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.formLabel}>
            Email <span className="text-danger">*</span>
          </label>
          <input
            type="email"
            id="email"
            className={`${styles.formControl} ${errors.email ? styles.invalid : ''}`}
            placeholder="exemple@email.com"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.email && <div className={styles.errorMessage}>{errors.email}</div>}
        </div>

        {/* Mot de passe */}
        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.formLabel}>
            Mot de passe <span className="text-danger">*</span>
          </label>
          <div className={styles.passwordWrapper}>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              className={`${styles.formControl} ${errors.password ? styles.invalid : ''}`}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowPassword(!showPassword)}
              tabIndex="-1"
            >
              <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
            </button>
          </div>
          {errors.password && <div className={styles.errorMessage}>{errors.password}</div>}
          <small className={styles.formHelp}>Minimum 6 caractères</small>
        </div>

        {/* Rôle */}
        <div className={styles.formGroup}>
          <label htmlFor="role" className={styles.formLabel}>Rôle</label>
          <select
            id="role"
            className={styles.formControl}
            value={formData.role}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="agent">Agent commercial</option>
            <option value="admin">Administrateur</option>
          </select>
        </div>

        {/* Zone d'intervention */}
        <div className={styles.formGroup}>
          <label htmlFor="zone_intervention" className={styles.formLabel}>
            Zone d'intervention
          </label>
          <input
            type="text"
            id="zone_intervention"
            className={styles.formControl}
            placeholder="Ex: Douala, Cameroun"
            value={formData.zone_intervention}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        {/* Boutons */}
        <div className={styles.buttonGroup}>
          <button
            type="button"
            className={styles.btnCancel}
            onClick={onCancel}
            disabled={loading}
          >
            Annuler
          </button>
          <button
            type="submit"
            className={styles.btnSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Création...
              </>
            ) : (
              <>
                <i className="bi bi-plus-circle" aria-hidden="true"></i> Ajouter
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UtilisateurForm;