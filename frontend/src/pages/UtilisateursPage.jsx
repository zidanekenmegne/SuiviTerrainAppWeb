import { useState } from 'react';
import { useUtilisateurs } from '../hooks/useUtilisateurs';
import { useToast } from '../contexts/ToastContext';
import UtilisateurTabs from '../components/utilisateurs/UtilisateurTabs';
import UtilisateursList from '../components/utilisateurs/UtilisateursList';
import UtilisateurForm from '../components/utilisateurs/UtilisateurForm';
import styles from '../styles/pages/UtilisateursPage.module.css';

/**
 * Page de gestion des utilisateurs
 * - Onglet 1 : Liste des utilisateurs
 * - Onglet 2 : Ajouter un utilisateur
 */
const UtilisateursPage = () => {
  const [activeTab, setActiveTab] = useState('liste');
  const { showToast } = useToast();

  const {
    utilisateurs,
    stats,
    searchTerm,
    sortColumn,
    sortAsc,
    loading,
    error,
    createUtilisateur,
    updateUtilisateur,
    deleteUtilisateur,
    toggleRole,
    toggleActif,
    handleSearchChange,
    handleSort,
    refresh
  } = useUtilisateurs();

  // ==========================================================
  // HANDLERS
  // ==========================================================

  const handleCreate = async (userData) => {
    const result = await createUtilisateur(userData);
    
    if (result.success) {
      showToast('Utilisateur créé avec succès');
      setActiveTab('liste');
      return { success: true };
    } else {
      showToast(result.message, 'error');
      return { success: false, message: result.message };
    }
  };

  const handleToggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'agent' : 'admin';
    const roleLabel = newRole === 'admin' ? 'Administrateur' : 'Agent';
    
    if (!window.confirm(`Passer ${user.nom} en ${roleLabel} ?`)) return;

    const result = await toggleRole(user);
    
    if (result.success) {
      showToast(`${user.nom} est maintenant ${roleLabel}`);
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleToggleActif = async (user) => {
    const action = user.actif ? 'désactiver' : 'activer';
    
    if (!window.confirm(`Voulez-vous ${action} ${user.nom} ?`)) return;

    const result = await toggleActif(user);
    
    if (result.success) {
      showToast(`${user.nom} ${user.actif ? 'désactivé' : 'activé'}`);
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer ${user.nom} ? Cette action est irréversible.`)) {
      return;
    }

    const result = await deleteUtilisateur(user.id);
    
    if (result.success) {
      showToast(`${user.nom} a été supprimé`);
    } else {
      showToast(result.message, 'error');
    }
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
          <p className="mt-3 text-muted">Chargement des utilisateurs...</p>
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
    <div className={styles.utilisateursContainer}>

      {/* En-tête PC */}
      <div className={styles.headerPC}>
        <h1>
          <i className="bi bi-people" aria-hidden="true"></i> Gestion des utilisateurs
          <span className={styles.stats}>
            {stats.total} au total • {stats.admins} admin(s) • {stats.agents} agent(s)
          </span>
        </h1>
      </div>

      {/* Onglets */}
      <UtilisateurTabs 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        stats={stats}
      />

      {/* Panneau 1 : Liste */}
      {activeTab === 'liste' && (
        <UtilisateursList
          utilisateurs={utilisateurs}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          sortColumn={sortColumn}
          sortAsc={sortAsc}
          onSort={handleSort}
          onToggleRole={handleToggleRole}
          onToggleActif={handleToggleActif}
          onDelete={handleDelete}
          onAddClick={() => setActiveTab('ajout')}
        />
      )}

      {/* Panneau 2 : Ajout */}
      {activeTab === 'ajout' && (
        <UtilisateurForm
          onSubmit={handleCreate}
          onCancel={() => setActiveTab('liste')}
        />
      )}

    </div>
  );
};

export default UtilisateursPage;