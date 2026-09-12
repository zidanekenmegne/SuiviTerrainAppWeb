import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProfil } from '../hooks/useProfil';
import { useToast } from '../contexts/ToastContext';
import ProfilHeader from '../components/profil/ProfilHeader';
import ProfilStats from '../components/profil/ProfilStats';
import ProfilInfos from '../components/profil/ProfilInfos';
import ProfilActions from '../components/profil/ProfilActions';
import ProfilEditModal from '../components/profil/ProfilEditModal';
import ProfilPasswordModal from '../components/profil/ProfilPasswordModal';
import styles from '../styles/pages/ProfilPage.module.css';

/**
 * Page Profil utilisateur
 * - Affichage des infos + statistiques
 * - Modification du profil
 * - Changement de mot de passe
 * - Déconnexion
 */
const ProfilPage = () => {
  // ==========================================================
  // HOOKS
  // ==========================================================
  const { profil, stats, loading, error, updateProfil, changePassword, refresh } = useProfil();
  const { logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // ==========================================================
  // ÉTATS LOCAUX (modales)
  // ==========================================================
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // ==========================================================
  // HANDLERS
  // ==========================================================

  /**
   * Enregistrer les modifications du profil
   */
  const handleSaveProfil = async (data) => {
    const result = await updateProfil(data);
    
    if (result.success) {
      showToast('Profil modifié avec succès');
      setShowEditModal(false);
      return { success: true };
    } else {
      showToast(result.message, 'error');
      return { success: false, message: result.message };
    }
  };

  /**
   * Changer le mot de passe
   */
  const handleChangePassword = async (currentPwd, newPwd) => {
    const result = await changePassword(currentPwd, newPwd);
    
    if (result.success) {
      showToast('Mot de passe modifié avec succès');
      setShowPasswordModal(false);
      return { success: true };
    } else {
      showToast(result.message, 'error');
      return { success: false, message: result.message };
    }
  };

  /**
   * Déconnexion
   */
  const handleLogout = () => {
    if (!window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) return;
    
    logout();
    navigate('/login');
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
          <p className="mt-3 text-muted">Chargement du profil...</p>
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
    <div className={styles.profilContainer}>

      {/* En-tête du profil (avatar + nom + rôle) */}
      <ProfilHeader profil={profil} />

      {/* Statistiques */}
      <ProfilStats stats={stats} />

      {/* Informations personnelles */}
      <ProfilInfos profil={profil} />

      {/* Actions */}
      <ProfilActions
        onEdit={() => setShowEditModal(true)}
        onChangePassword={() => setShowPasswordModal(true)}
        onLogout={handleLogout}
      />

      {/* Modale de modification du profil */}
      <ProfilEditModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        profil={profil}
        onSave={handleSaveProfil}
      />

      {/* Modale de changement de mot de passe */}
      <ProfilPasswordModal
        show={showPasswordModal}
        onHide={() => setShowPasswordModal(false)}
        onChangePassword={handleChangePassword}
      />

    </div>
  );
};

export default ProfilPage;