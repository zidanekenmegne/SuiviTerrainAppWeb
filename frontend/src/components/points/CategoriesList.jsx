import { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import styles from '../../styles/pages/PointsPage.module.css';

const CategoriesList = ({ onOpenEdit, onAddCategory }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/categories');
      setCategories(response.data?.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Erreur de chargement');
      console.error('Erreur API:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p className="mt-2">Chargement des catégories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        ❌ {error}
        <button className="btn btn-sm btn-outline-danger ms-3" onClick={fetchCategories}>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.pointsHeader}>
        <div className={styles.searchBar}>
          <div className={styles.searchBox}>
            <i className="bi bi-tags" aria-hidden="true"></i>
            <span style={{ color: '#6c757d', fontSize: '0.85rem' }}>
              {categories.length} catégorie{categories.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <button className={styles.btnAjouter} onClick={onAddCategory}>
          <i className="bi bi-plus-circle" aria-hidden="true"></i> Ajouter
        </button>
      </div>

      <div className={styles.tableResponsive}>
        <table className={styles.tableCustom} id="categoriesTable">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Couleur</th>
              <th>Nombre de points</th>
              <th style={{ textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem 0', color: '#6c757d' }}>
                  <i className="bi bi-tags" style={{ display: 'block', fontSize: '2rem', marginBottom: '0.5rem' }}></i>
                  Aucune catégorie créée
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id}>
                  <td><strong>{cat.nom}</strong></td>
                  <td>
                    <span
                      className={styles.categoriePastille}
                      style={{ backgroundColor: cat.couleur || '#6c757d' }}
                    ></span>
                  </td>
                  <td>{cat.nombre_points || 0}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className={styles.btnDetail}
                      onClick={() => onOpenEdit(cat)}
                    >
                      Modifier
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ✅ EXPORT PAR DÉFAUT (correction)
export default CategoriesList;