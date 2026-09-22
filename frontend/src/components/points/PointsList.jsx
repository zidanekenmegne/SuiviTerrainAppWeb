import { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import styles from '../../styles/pages/PointsPage.module.css';

const PointsList = ({ onOpenDetail, onOpenEdit, onAddPoint }) => {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchPoints();
  }, [searchTerm]);

  const fetchPoints = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/points', {
        params: { search: searchTerm }
      });
      const data = response.data?.data;
      setPoints(data?.points || []);
      setTotal(data?.pagination?.total || 0);
      setError(null);
    } catch (err) {
      setError(err.message || 'Erreur de chargement');
      console.error('Erreur API:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategorieColor = (nom) => {
    const colors = {
      'Alimentation': '#28a745',
      'Services': '#007bff',
      'Vetement': '#ffc107',
      'Electronique': '#dc3545',
      'Immobilier': '#6f42c1',
      'Automobile': '#fd7e14'
    };
    return colors[nom] || '#6c757d';
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p className="mt-2">Chargement des points de vente...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        ❌ {error}
        <button className="btn btn-sm btn-outline-danger ms-3" onClick={fetchPoints}>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* En-tête avec recherche */}
      <div className={styles.pointsHeader}>
        <div className={styles.searchBar}>
          <div className={styles.searchBox}>
            <i className="bi bi-search" aria-hidden="true"></i>
            <input
              id="searchPointInput"
              type="text"
              placeholder="Rechercher un point de vente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Rechercher un point de vente"
            />
            <span className={styles.searchShortcut}>Ctrl+K</span>
          </div>
        </div>
        <button className={styles.btnAjouter} onClick={onAddPoint}>
          <i className="bi bi-plus-circle" aria-hidden="true"></i> Ajouter
        </button>
      </div>

      {/* Tableau */}
      <div className={styles.tableResponsive}>
        <table className={styles.tableCustom} id="pointsTable">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Catégorie</th>
              <th className={styles.colContact}>Contact</th>
              <th className={styles.colAdresse}>Adresse</th>
              <th style={{ textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {points.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem 0', color: '#6c757d' }}>
                  <i className="bi bi-inbox" style={{ display: 'block', fontSize: '2rem', marginBottom: '0.5rem' }}></i>
                  Aucun point de vente trouvé
                </td>
              </tr>
            ) : (
              points.map((point) => (
                <tr key={point.id}>
                  <td><strong>{point.nom}</strong></td>
                  <td>
                    <span
                      className={styles.categoriePastille}
                      style={{ backgroundColor: getCategorieColor(point.categorie) }}
                    ></span>
                    {point.categorie || 'Non catégorisé'}
                  </td>
                  <td className={styles.colContact}>{point.telephone || 'Non renseigné'}</td>
                  <td className={styles.colAdresse}>{point.adresse || 'Non renseignée'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className={styles.btnDetail}
                      onClick={() => onOpenDetail(point.id)}
                    >
                      Détail
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Nombre de résultats */}
      {points.length > 0 && (
        <div className={styles.tableFooter}>
          <span>{total} point{total > 1 ? 's' : ''} de vente</span>
        </div>
      )}
    </div>
  );
};

export default PointsList;