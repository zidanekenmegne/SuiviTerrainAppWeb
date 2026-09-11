import styles from '../../styles/pages/CartePage.module.css';

/**
 * Légende des catégories de la carte
 * - Affiche toutes les catégories avec leur couleur
 * - Cliquable pour filtrer les points
 * - Bouton "Tous" pour réinitialiser
 * - Affiche les statistiques (nombre de points)
 */
const CarteLegend = ({ 
  categories, 
  selectedCategory, 
  onCategoryChange,
  stats 
}) => {
  // ==========================================================
  // RENDU
  // ==========================================================
  return (
    <div className={styles.legend}>
      {/* En-tête de la légende */}
      <div className={styles.legendTitle}>
        <i className="bi bi-palette" aria-hidden="true"></i> 
        Catégories
        {stats && (
          <span className={styles.legendStats}>
            {stats.filtered}/{stats.total}
          </span>
        )}
      </div>

      {/* Liste des catégories */}
      <div className={styles.legendItems}>
        {/* Bouton "Tous" */}
        <button
          className={`${styles.legendItem} ${selectedCategory === 'Toutes' ? styles.active : ''}`}
          onClick={() => onCategoryChange('Toutes')}
          title="Afficher toutes les catégories"
        >
          <span 
            className={styles.legendColor} 
            style={{ backgroundColor: '#6c757d' }}
          ></span>
          <span className={styles.legendLabel}>Tous</span>
        </button>

        {/* Catégories depuis l'API */}
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`${styles.legendItem} ${selectedCategory === cat.nom ? styles.active : ''}`}
            onClick={() => onCategoryChange(cat.nom)}
            title={`Afficher uniquement : ${cat.nom}`}
          >
            <span 
              className={styles.legendColor} 
              style={{ backgroundColor: cat.couleur || '#8B0000' }}
            ></span>
            <span className={styles.legendLabel}>{cat.nom}</span>
            {cat.nombre_points !== undefined && (
              <span className={styles.legendCount}>{cat.nombre_points}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CarteLegend;