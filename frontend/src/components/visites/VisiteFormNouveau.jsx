import { useState } from 'react';
import styles from '../../styles/pages/NouvelleVisitePage.module.css';

/**
 * Formulaire de création d'une nouvelle visite
 */
const VisiteFormNouveau = ({ 
  pointsVente, 
  agents, 
  onSubmit, 
  onCancel,
  submitting 
}) => {
  // ==========================================================
  // ÉTATS
  // ==========================================================
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],  // Aujourd'hui
    heure: getCurrentTime(),
    pointVenteId: '',
    agentId: '',
    description: ''
  });
  const [errors, setErrors] = useState({});

  // ==========================================================
  // UTILITAIRES
  // ==========================================================
  function getCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

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

    if (!formData.pointVenteId) {
      newErrors.pointVenteId = 'Veuillez sélectionner un point de vente';
    }
    if (!formData.date) {
      newErrors.date = 'Veuillez sélectionner une date';
    }
    if (!formData.heure) {
      newErrors.heure = 'Veuillez sélectionner une heure';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      // Scroll vers le premier champ en erreur
      const firstError = document.querySelector(`.${styles.invalid}`);
      if (firstError) {
        firstError.focus();
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    await onSubmit({
      date: formData.date,
      heure: formData.heure,
      pointVenteId: formData.pointVenteId,
      agentId: formData.agentId,
      description: formData.description,
      statut: 'planifiee'
    });
  };

  // ==========================================================
  // RENDU
  // ==========================================================
  return (
    <form onSubmit={handleSubmit} className={styles.formCard} noValidate>

      {/* Point de vente */}
      <div className={styles.formGroup}>
        <label htmlFor="pointVenteId" className={styles.formLabel}>
          Point de vente <span className="text-danger">*</span>
        </label>
        <select
          id="pointVenteId"
          className={`${styles.formControl} ${errors.pointVenteId ? styles.invalid : ''}`}
          value={formData.pointVenteId}
          onChange={handleChange}
          disabled={submitting}
        >
          <option value="">Sélectionnez un point de vente</option>
          {pointsVente.map(p => (
            <option key={p.id} value={p.id}>
              {p.nom} — {p.adresse}
            </option>
          ))}
        </select>
        {errors.pointVenteId && (
          <div className={styles.errorMessage}>{errors.pointVenteId}</div>
        )}
      </div>

      {/* Agent */}
      <div className={styles.formGroup}>
        <label htmlFor="agentId" className={styles.formLabel}>
          Agent responsable
        </label>
        <select
          id="agentId"
          className={styles.formControl}
          value={formData.agentId}
          onChange={handleChange}
          disabled={submitting || agents.length === 0}
        >
          <option value="">
            {agents.length === 0 ? 'Aucun agent disponible' : 'Sélectionnez un agent'}
          </option>
          {agents.map(a => (
            <option key={a.id} value={a.id}>
              {a.nom} ({a.email})
            </option>
          ))}
        </select>
        <small className={styles.formHelp}>
          Si aucun agent n'est sélectionné, la visite vous sera assignée
        </small>
      </div>

      {/* Date et Heure */}
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="date" className={styles.formLabel}>
            Date <span className="text-danger">*</span>
          </label>
          <input
            type="date"
            id="date"
            className={`${styles.formControl} ${errors.date ? styles.invalid : ''}`}
            value={formData.date}
            onChange={handleChange}
            disabled={submitting}
          />
          {errors.date && (
            <div className={styles.errorMessage}>{errors.date}</div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="heure" className={styles.formLabel}>
            Heure <span className="text-danger">*</span>
          </label>
          <input
            type="time"
            id="heure"
            className={`${styles.formControl} ${errors.heure ? styles.invalid : ''}`}
            value={formData.heure}
            onChange={handleChange}
            disabled={submitting}
          />
          {errors.heure && (
            <div className={styles.errorMessage}>{errors.heure}</div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className={styles.formGroup}>
        <label htmlFor="description" className={styles.formLabel}>
          Description
        </label>
        <textarea
          id="description"
          className={styles.formControl}
          placeholder="Décrivez l'objectif de la visite..."
          value={formData.description}
          onChange={handleChange}
          rows={4}
          disabled={submitting}
        />
      </div>

      {/* Boutons */}
      <div className={styles.formActions}>
        <button
          type="button"
          className={styles.btnCancel}
          onClick={onCancel}
          disabled={submitting}
        >
          Annuler
        </button>
        <button
          type="submit"
          className={styles.btnSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Enregistrement...
            </>
          ) : (
            <>
              <i className="bi bi-check-lg" aria-hidden="true"></i> Enregistrer
            </>
          )}
        </button>
      </div>

    </form>
  );
};

export default VisiteFormNouveau;