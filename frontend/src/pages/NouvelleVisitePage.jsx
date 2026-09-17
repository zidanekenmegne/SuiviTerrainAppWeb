import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNouvelleVisite } from '../hooks/useNouvelleVisite';
import { useToast } from '../contexts/ToastContext';
import VisiteFormNouveau from '../components/visites/VisiteFormNouveau';
import styles from '../styles/pages/NouvelleVisitePage.module.css';

/**
 * Page de création d'une nouvelle visite
 */
const NouvelleVisitePage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const {
    pointsVente,
    agents,
    loading,
    error,
    createVisite,
    refresh
  } = useNouvelleVisite();

  const [submitting, setSubmitting] = useState(false);

  // ==========================================================
  // HANDLERS
  // ==========================================================
  const handleSubmit = async (data) => {
    setSubmitting(true);
    try {
      const result = await createVisite(data);

      if (result.success) {
        showToast('Visite créée avec succès');
        navigate('/visites');
        return { success: true };
      } else {
        showToast(result.message, 'error');
        return { success: false, message: result.message };
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Voulez-vous annuler la création de cette visite ?')) {
      navigate('/visites');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  // ==========================================================
  // RENDU : CHARGEMENT
  // ==========================================================
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3 text-muted">Chargement du formulaire...</p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDU : ERREUR
  // ==========================================================
  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle" aria-hidden="true"></i>
          <strong className="ms-2">Erreur :</strong> {error}
          <button 
            className="btn btn-outline-danger btn-sm ms-3"
            onClick={refresh}
          >
            <i className="bi bi-arrow-clockwise" aria-hidden="true"></i> Réessayer
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDU : SUCCÈS
  // ==========================================================
  return (
    <div className={styles.formContainer}>

      {/* En-tête PC */}
      <div className={styles.headerPC}>
        <h1>
          <i className="bi bi-plus-circle" aria-hidden="true"></i> Nouvelle visite
        </h1>
      </div>

      {/* En-tête Mobile */}
      <div className={styles.headerMobile}>
        <button 
          className={styles.backButton} 
          onClick={handleBack}
          aria-label="Retour"
        >
          <i className="bi bi-arrow-left" aria-hidden="true"></i>
        </button>
        <span className={styles.pageTitle}>Nouvelle visite</span>
        <button 
          className={styles.cancelButton}
          onClick={handleCancel}
          aria-label="Annuler"
        >
          <i className="bi bi-x-circle" aria-hidden="true"></i>
        </button>
      </div>

      {/* Formulaire */}
      <VisiteFormNouveau
        pointsVente={pointsVente}
        agents={agents}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitting={submitting}
      />

    </div>
  );
};

export default NouvelleVisitePage;