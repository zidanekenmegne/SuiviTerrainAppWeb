import { useState, useRef } from 'react';
import styles from '../../styles/pages/ProfilPage.module.css';

/**
 * En-tête du profil avec upload de photo fonctionnel
 */
const ProfilHeader = ({ profil, onUploadPhoto }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleAvatarClick = () => {
    if (uploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation côté client
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image (PNG, JPEG, GIF, WEBP)');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 5 Mo');
      e.target.value = '';
      return;
    }

    // Upload via l'API
    setUploading(true);
    try {
      await onUploadPhoto(file);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const roleLabel = profil?.role === 'admin' ? 'Administrateur' : 'Agent';
  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

  return (
    <div className={styles.profileHeader}>
      {/* Avatar */}
      <div 
        className={styles.avatarWrapper} 
        onClick={handleAvatarClick}
        style={{ opacity: uploading ? 0.6 : 1 }}
      >
        <div className={styles.avatar}>
          {profil?.photo ? (
            <img 
              src={`${API_URL}${profil.photo}`} 
              alt="Photo de profil"
              onError={(e) => {
                // Si l'image ne charge pas, afficher l'icône par défaut
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<i class="bi bi-person-fill"></i>';
              }}
            />
          ) : (
            <i className="bi bi-person-fill" aria-hidden="true"></i>
          )}
        </div>
        <div 
          className={styles.avatarBadge} 
          aria-label="Modifier la photo de profil"
          title="Modifier la photo"
        >
          {uploading ? (
            <span className="spinner-border spinner-border-sm" role="status"></span>
          ) : (
            <i className="bi bi-camera" aria-hidden="true"></i>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/gif, image/webp"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          disabled={uploading}
        />
      </div>

      {/* Nom */}
      <h2 className={styles.profileName}>
        {profil?.nom || 'Utilisateur'}
      </h2>

      {/* Rôle */}
      <span className={`${styles.profileRole} ${profil?.role === 'admin' ? styles.admin : ''}`}>
        {roleLabel}
      </span>
    </div>
  );
};

export default ProfilHeader;