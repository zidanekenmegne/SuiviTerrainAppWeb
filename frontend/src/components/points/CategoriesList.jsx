import { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { useToast } from '../../contexts/ToastContext';
import styles from '../../styles/pages/PointsPage.module.css';

const CategoriesList = ({ onOpenEdit, onAddCategory, onDeleted }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

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

  const handleDeleteClick = (cat) => {
    setCategoryToDelete(cat);
    setShowConfirmDelete(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    try {
      setDeleting(true);
      await apiClient.delete(`/categories/${categoryToDelete.id}`);
      showToast(`Catégorie "${categoryToDelete.nom}" supprimée`);
      setShowConfirmDelete(false);
      setCategoryToDelete(null);
      fetchCategories();
      if (onDeleted) onDeleted();
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur lors de la suppression', 'error');
    } finally {
      setDeleting(false);
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
              <th style={{ textAlign: 'center' }}>Actions</th>
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
                  <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <button
                      className={styles.btnDetail}
                      onClick={() => onOpenEdit(cat)}
                      style={{ marginRight: '0.5rem' }}
                      title="Modifier"
                    >
                      <i className="bi bi-pencil" aria-hidden="true"></i> Modifier
                    </button>
                    <button
                      className={styles.btnDetail}
                      onClick={() => handleDeleteClick(cat)}
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none'
                      }}
                      title="Supprimer"
                    >
                      <i className="bi bi-trash" aria-hidden="true"></i> Supprimer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modale de confirmation de suppression */}
      {showConfirmDelete && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={() => !deleting && setShowConfirmDelete(false)}
        >
          <div
            style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              maxWidth: '400px',
              width: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h5 style={{ color: '#8B0000', marginBottom: '1rem' }}>
              <i className="bi bi-exclamation-triangle"></i> Confirmation
            </h5>
            <p>
              Voulez-vous vraiment supprimer la catégorie <strong>{categoryToDelete?.nom}</strong> ?
            </p>
            {categoryToDelete?.nombre_points > 0 && (
              <p style={{ color: '#dc3545', fontSize: '0.9rem' }}>
                ⚠️ Cette catégorie contient {categoryToDelete.nombre_points} point(s) de vente.
                La suppression sera refusée.
              </p>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowConfirmDelete(false)}
                disabled={deleting}
              >
                Annuler
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesList;