import { useState, useEffect } from 'react';
import apiClient from '../../api/client';

const PointsList = () => {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/points');
        // Les données sont dans response.data.data.points
        setPoints(response.data.data.points || []);
        setError(null);
      } catch (err) {
        setError(err.message || 'Erreur lors du chargement des points de vente');
        console.error('Erreur API:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPoints();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p>Chargement des points de vente...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        ❌ {error}
      </div>
    );
  }

  return (
    <div className="container">
      <h2 className="mb-4">📋 Points de vente</h2>
      
      {points.length === 0 ? (
        <div className="alert alert-info">Aucun point de vente trouvé.</div>
      ) : (
        <div className="row">
          {points.map((point) => (
            <div key={point.id} className="col-md-4 mb-3">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{point.nom}</h5>
                  <p className="card-text">
                    <small className="text-muted">
                      {point.adresse || 'Adresse non renseignée'}
                    </small>
                  </p>
                  {point.categorie && (
                    <span 
                      className="badge" 
                      style={{ backgroundColor: point.couleur || '#0d6efd' }}
                    >
                      {point.categorie}
                    </span>
                  )}
                  <div className="mt-2">
                    <a href={`/points/${point.id}`} className="btn btn-sm btn-outline-primary">
                      Voir détails
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PointsList;