import { useState, useRef } from 'react';
import styles from '../../styles/pages/ProfilPage.module.css';

/**
 * En-tête du profil (avatar cliquable + nom + rôle)
 * L'avatar peut être cliqué pour changer la photo (aperçu local uniquement)
 */
const ProfilHeader = ({ profil }) => {
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  // ==========================================================
  // GESTION DE L'UPLOAD DE PHOTO
  // ==========================================================
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image (PNG, JPEG, GIF, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 5 Mo');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // ==========================================================
  // RENDU
  // ==========================================================
  const roleLabel = profil?.role === 'admin' ? 'Administrateur' : 'Agent';

  return (
    <div className={styles.profileHeader}>
      {/* Avatar */}
      <div className={styles.avatarWrapper} onClick={handleAvatarClick}>
        <div className={styles.avatar}>
          {avatarPreview ? (
            <img src={avatarPreview} alt="Photo de profil" />
          ) : (
            <i className="bi bi-person-fill" aria-hidden="true"></i>
          )}
        </div>
        <div 
          className={styles.avatarBadge} 
          aria-label="Modifier la photo de profil"
          title="Modifier la photo"
        >
          <i className="bi bi-camera" aria-hidden="true"></i>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/gif, image/webp"
          onChange={handleFileChange}
          style={{ display: 'none' }}
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