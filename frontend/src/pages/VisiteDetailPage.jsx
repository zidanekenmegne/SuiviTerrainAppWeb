import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVisiteDetail } from '../hooks/useVisiteDetail';
import { useToast } from '../contexts/ToastContext';
import VisiteInfoCard from '../components/visites/VisiteInfoCard';
import VisiteEditModal from '../components/visites/VisiteEditModal';
import VisiteStatusBar from '../components/visites/VisiteStatusBar';
import styles from '../styles/pages/VisiteDetailPage.module.css';

/**
 * Page Détail d'une visite
 * - Affiche les informations complètes
 * - Permet la modification et la suppression
 * - Permet le changement de statut
 */
const VisiteDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const {
    visite,
    loading,
    error,
    updateVisite,
    updateStatut,
    deleteVisite,
    refresh
  } = useVisiteDetail(id);

  // ==========================================================
  // ÉTATS LOCAUX
  // ==========================================================
  const [showEditModal, setShowEditModal] = useState(false);

  // ==========================================================
  // HANDLERS
  // ==========================================================

  /**
   * Enregistrer les modifications
   */
  const handleSave = async (data) => {
    const result = await updateVisite(data);
    
    if (result.success) {
      showToast('Visite modifiée avec succès');
      setShowEditModal(false);
      return { success: true };
    } else {
      showToast(result.message, 'error');
      return { success: false, message: result.message };
    }
  };

  /**
   * Changer le statut
   */
  const handleStatutChange = async (newStatut) => {
    const result = await updateStatut(newStatut);
    
    if (result.success) {
      showToast('Statut mis à jour');
    } else {
      showToast(result.message, 'error');
    }
  };

  /**
   * Supprimer la visite
   */
  const handleDelete = async () => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette visite ? Cette action est irréversible.')) {
      return;
    }

    const result = await deleteVisite();
    
    if (result.success) {
      showToast('Visite supprimée avec succès');
      navigate('/visites');
    } else {
      showToast(result.message, 'error');
    }
  };

  /**
   * Retour
   */
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
          <p className="mt-3 text-muted">Chargement de la visite...</p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDU : ERREUR
  // ==========================================================
  if (error || !visite) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle" aria-hidden="true"></i>
          <strong className="ms-2">Erreur :</strong> {error || 'Visite introuvable'}
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
    <div className={styles.detailContainer}>

      {/* En-tête PC */}
      <div className={styles.headerPC}>
        <h1>
          <i className="bi bi-calendar-check" aria-hidden="true"></i> Détail de la visite
        </h1>
        <span className={`${styles.statut} ${styles[visite.statut]}`}>
          {getStatutLabel(visite.statut)}
        </span>
      </div>

      {/* En-tête Mobile */}
      <div className={styles.headerMobile}>
        <button className={styles.backButton} onClick={handleBack}>
          <i className="bi bi-arrow-left" aria-hidden="true"></i>
        </button>
        <span className={styles.pageTitle}>Détail de la visite</span>
        <div className={styles.mobileActions}>
          <button 
            className={styles.actionBtn}
            onClick={() => setShowEditModal(true)}
            title="Modifier"
          >
            <i className="bi bi-pencil" aria-hidden="true"></i>
          </button>
          <button 
            className={styles.actionBtn}
            onClick={handleDelete}
            title="Supprimer"
          >
            <i className="bi bi-trash" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      {/* Carte d'informations */}
      <VisiteInfoCard visite={visite} />

      {/* Boutons d'action PC */}
      <div className={styles.actionsPC}>
        <button 
          className={styles.btnSecondary}
          onClick={handleBack}
        >
          <i className="bi bi-arrow-left" aria-hidden="true"></i> Retour
        </button>
        <button 
          className={styles.btnSecondary}
          onClick={() => setShowEditModal(true)}
        >
          <i className="bi bi-pencil" aria-hidden="true"></i> Modifier
        </button>
        <button 
          className={styles.btnDanger}
          onClick={handleDelete}
        >
          <i className="bi bi-trash" aria-hidden="true"></i> Supprimer
        </button>
      </div>

      {/* Barre de statut (mobile) */}
      <VisiteStatusBar 
        currentStatut={visite.statut}
        onStatutChange={handleStatutChange}
      />

      {/* Modale de modification */}
      <VisiteEditModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        visite={visite}
        onSave={handleSave}
      />

    </div>
  );
};

/**
 * Retourne le libellé du statut
 */
function getStatutLabel(statut) {
  const labels = {
    'realisee': 'Réalisée',
    'planifie': 'Planifiée',
    'retard': 'En retard',
    'encours': 'En cours'
  };
  return labels[statut] || statut;
}

export default VisiteDetailPage;