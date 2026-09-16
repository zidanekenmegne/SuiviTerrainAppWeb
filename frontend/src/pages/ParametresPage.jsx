import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import ParametresSection from '../components/parametres/ParametresSection';
import ParametresItem from '../components/parametres/ParametresItem';
import ParametresToggle from '../components/parametres/ParametresToggle';
import ProfilPasswordModal from '../components/profil/ProfilPasswordModal';
import apiClient from '../api/client';
import styles from '../styles/pages/ParametresPage.module.css';

/**
 * Page Paramètres
 * - Compte (profil, sécurité)
 * - Préférences (notifications, hors ligne, langue)
 * - Autres (à propos, déconnexion)
 */
const ParametresPage = () => {
  const { logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // ==========================================================
  // ÉTATS
  // ==========================================================
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [preferences, setPreferences] = useState({
    notifications: true,
    offline: false
  });

  // ==========================================================
  // CHARGEMENT DES PRÉFÉRENCES (localStorage)
  // ==========================================================
  useEffect(() => {
    const saved = localStorage.getItem('preferences');
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (e) {
        console.error('Erreur parsing preferences:', e);
      }
    }
  }, []);

  // ==========================================================
  // HANDLERS
  // ==========================================================

  /**
   * Change une préférence et la sauvegarde
   */
  const handleToggle = (key) => {
    const newPrefs = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPrefs);
    localStorage.setItem('preferences', JSON.stringify(newPrefs));

    const labels = {
      notifications: newPrefs.notifications ? 'activées' : 'désactivées',
      offline: newPrefs.offline ? 'activé' : 'désactivé'
    };
    const prefix = key === 'notifications' ? 'Notifications ' : 'Mode hors ligne ';
    showToast(prefix + labels[key]);
  };

  /**
   * Changement de mot de passe
   */
  const handleChangePassword = async (currentPwd, newPwd) => {
    try {
      const response = await apiClient.put('/auth/password', {
        current_password: currentPwd,
        new_password: newPwd
      });
      
      showToast('Mot de passe modifié avec succès');
      setShowPasswordModal(false);
      return { success: true, message: response.data?.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors du changement de mot de passe';
      showToast(message, 'error');
      return { success: false, message };
    }
  };

  /**
   * À propos de l'application
   */
  const handleAbout = () => {
    window.alert('SuiviTerrain v2.1.0\nDéveloppé pour un suivi professionnel');
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
  // RENDU
  // ==========================================================
  return (
    <div className={styles.parametresContainer}>

      {/* En-tête PC */}
      <div className={styles.headerPC}>
        <h1>
          <i className="bi bi-gear" aria-hidden="true"></i> Paramètres
        </h1>
      </div>

      {/* ========== SECTION COMPTE ========== */}
      <ParametresSection title="Compte" icon="bi bi-person">
        <ParametresItem
          icon="bi bi-person"
          iconColor="rouge"
          title="Informations personnelles"
          subtitle="Nom, email, téléphone, zone d'intervention"
          onClick={() => navigate('/profil')}
        />

        <ParametresItem
          icon="bi bi-shield-lock"
          iconColor="bleu"
          title="Sécurité"
          subtitle="Changer votre mot de passe"
          onClick={() => setShowPasswordModal(true)}
        />
      </ParametresSection>

      {/* ========== SECTION PRÉFÉRENCES ========== */}
      <ParametresSection title="Préférences" icon="bi bi-sliders2">
        <ParametresItem
          icon="bi bi-bell"
          iconColor="orange"
          title="Notifications"
          subtitle="Recevoir des alertes et rappels"
          right={
            <ParametresToggle
              checked={preferences.notifications}
              onChange={() => handleToggle('notifications')}
            />
          }
        />

        <ParametresItem
          icon="bi bi-wifi"
          iconColor="gris"
          title="Mode hors ligne"
          subtitle="Synchroniser les données en arrière-plan"
          right={
            <ParametresToggle
              checked={preferences.offline}
              onChange={() => handleToggle('offline')}
            />
          }
        />

        <ParametresItem
          icon="bi bi-globe"
          iconColor="vert"
          title="Langue"
          subtitle="Changer la langue de l'application"
          value="Français"
          onClick={() => showToast('Changement de langue à venir')}
        />
      </ParametresSection>

      {/* ========== SECTION AUTRES ========== */}
      <ParametresSection title="Autres" icon="bi bi-three-dots">
        <ParametresItem
          icon="bi bi-info-circle"
          iconColor="bleu"
          title="À propos de l'application"
          subtitle="Version 2.1.0"
          onClick={handleAbout}
        />

        <ParametresItem
          icon="bi bi-box-arrow-right"
          iconColor="rouge-clair"
          title="Déconnexion"
          subtitle="Se déconnecter de l'application"
          danger
          onClick={handleLogout}
        />
      </ParametresSection>

      {/* Modale changement de mot de passe (réutilisée du Profil) */}
      <ProfilPasswordModal
        show={showPasswordModal}
        onHide={() => setShowPasswordModal(false)}
        onChangePassword={handleChangePassword}
      />

    </div>
  );
};

export default ParametresPage;