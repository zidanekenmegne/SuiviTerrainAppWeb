import UtilisateurRow from './UtilisateurRow';
import styles from '../../styles/pages/UtilisateursPage.module.css';

/**
 * Liste des utilisateurs avec recherche et tri
 */
const UtilisateursList = ({
  utilisateurs,
  searchTerm,
  onSearchChange,
  sortColumn,
  sortAsc,
  onSort,
  onToggleRole,
  onToggleActif,
  onDelete,
  onAddClick
}) => {
  /**
   * Rendu de l'icône de tri
   */
  const renderSortIcon = (column) => {
    if (sortColumn !== column) {
      return <i className="bi bi-arrow-down-up" aria-hidden="true" style={{ opacity: 0.3 }}></i>;
    }
    return sortAsc 
      ? <i className="bi bi-arrow-up" aria-hidden="true"></i>
      : <i className="bi bi-arrow-down" aria-hidden="true"></i>;
  };

  return (
    <>
      {/* Recherche + Bouton Ajouter */}
      <div className={styles.searchRow}>
        <div className={styles.searchBox}>
          <i className="bi bi-search" aria-hidden="true"></i>
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Rechercher un utilisateur"
          />
        </div>
        <button className={styles.btnAjouter} onClick={onAddClick}>
          <i className="bi bi-person-plus" aria-hidden="true"></i> Ajouter
        </button>
      </div>

      {/* Tableau */}
      <div className={styles.tableResponsive}>
        <table className={styles.tableCustom}>
          <thead>
            <tr>
              <th onClick={() => onSort('nom')}>
                Nom {renderSortIcon('nom')}
              </th>
              <th onClick={() => onSort('email')}>
                Email {renderSortIcon('email')}
              </th>
              <th onClick={() => onSort('role')}>
                Rôle {renderSortIcon('role')}
              </th>
              <th onClick={() => onSort('statut')}>
                Statut {renderSortIcon('statut')}
              </th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {utilisateurs.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem 0', color: '#6c757d' }}>
                  <i 
                    className="bi bi-inbox" 
                    style={{ display: 'block', fontSize: '2rem', marginBottom: '0.5rem' }}
                  ></i>
                  Aucun utilisateur trouvé
                </td>
              </tr>
            ) : (
              utilisateurs.map((user) => (
                <UtilisateurRow
                  key={user.id}
                  user={user}
                  onToggleRole={onToggleRole}
                  onToggleActif={onToggleActif}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Compteur */}
      {utilisateurs.length > 0 && (
        <div className={styles.tableFooter}>
          {utilisateurs.length} utilisateur{utilisateurs.length > 1 ? 's' : ''}
        </div>
      )}
    </>
  );
};

export default UtilisateursList;