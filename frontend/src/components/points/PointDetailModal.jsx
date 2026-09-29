import { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Badge } from 'react-bootstrap';
import apiClient from '../../api/client';
import { useToast } from '../../contexts/ToastContext';

/**
 * Modale de détail d'un point de vente
 * - Affichage en lecture seule
 * - Bouton "Modifier" → délègue au parent (ouvre PointFormModal)
 * - Bouton "Supprimer" → confirmation interne, puis suppression
 */
const PointDetailModal = ({ show, onHide, pointId, onDeleted, onEdit }) => {
  const [point, setPoint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { showToast } = useToast();

  // ==========================================================
  // CHARGEMENT DES DONNÉES
  // ==========================================================
  useEffect(() => {
    if (show && pointId) {
      fetchPointDetail();
      setShowDeleteConfirm(false);
    }
  }, [show, pointId]);

  const fetchPointDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/points/${pointId}`);
      setPoint(response.data?.data);
    } catch (err) {
      console.error('Erreur chargement détail:', err);
      setError(err.response?.data?.message || 'Impossible de charger les détails');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // ACTIONS
  // ==========================================================
  const handleEdit = () => {
    if (onEdit && point) {
      onEdit(point);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      await apiClient.delete(`/points/${pointId}`);
      showToast('Point de vente supprimé avec succès');
      setShowDeleteConfirm(false);
      if (onDeleted) onDeleted();
    } catch (err) {
      console.error('Erreur suppression:', err);
      showToast(err.response?.data?.message || 'Erreur lors de la suppression', 'error');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getCategorieColor = (nom) => {
    const colors = {
      'Alimentation': '#28a745',
      'Restauration': '#f39c12',
      'Carburant': '#3498db',
      'Pharmacie': '#27ae60',
      'Télécom': '#9b59b6',
      'Services': '#007bff',
      'Vetement': '#ffc107',
      'Electronique': '#dc3545',
      'Immobilier': '#6f42c1',
      'Automobile': '#fd7e14'
    };
    return colors[nom] || '#6c757d';
  };

  // ==========================================================
  // RENDU
  // ==========================================================
  return (
    <>
      <Modal
        show={show}
        onHide={onHide}
        centered
        size="lg"
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-shop" aria-hidden="true"></i>{' '}
            {loading ? 'Chargement...' : point?.nom || 'Détail du point de vente'}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {loading && !point ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="danger" />
              <p className="mt-2 text-muted">Chargement des détails...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger">
              <i className="bi bi-exclamation-triangle" aria-hidden="true"></i>
              {error}
              <Button
                variant="outline-danger"
                size="sm"
                className="ms-3"
                onClick={fetchPointDetail}
              >
                Réessayer
              </Button>
            </div>
          ) : point ? (
            <>
              {/* Photo */}
              <div className="text-center mb-4">
                <img
                  src={point.photo || 'data:image/svg+xml,' + encodeURIComponent(
                    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f0ece6"/><text x="100" y="120" text-anchor="middle" font-family="sans-serif" font-size="60" fill="#6c757d">🏪</text></svg>'
                  )}
                  alt={point.nom}
                  className="rounded-3"
                  style={{ width: '150px', height: '150px', objectFit: 'cover', border: '2px solid #f0ece6' }}
                />
              </div>

              {/* Informations */}
              <div className="row g-3">
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                    <span className="fw-semibold text-muted">Nom</span>
                    <span className="fw-semibold">{point.nom}</span>
                  </div>
                </div>

                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                    <span className="fw-semibold text-muted">Adresse</span>
                    <span className="text-end">{point.adresse || 'Non renseignée'}</span>
                  </div>
                </div>

                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                    <span className="fw-semibold text-muted">Contact</span>
                    <span>{point.telephone || 'Non renseigné'}</span>
                  </div>
                </div>

                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                    <span className="fw-semibold text-muted">Catégorie</span>
                    <Badge style={{ backgroundColor: getCategorieColor(point.categorie) }}>
                      {point.categorie || 'Non catégorisé'}
                    </Badge>
                  </div>
                </div>

                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                    <span className="fw-semibold text-muted">Coordonnées GPS</span>
                    <span className="text-muted small">
                      {point.latitude && point.longitude
                        ? `${point.latitude}, ${point.longitude}`
                        : 'Non géocodé'}
                    </span>
                  </div>
                </div>

                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-semibold text-muted">Créé le</span>
                    <span className="text-muted small">
                      {point.date_creation
                        ? new Date(point.date_creation).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Non renseigné'}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide}>
            <i className="bi bi-arrow-left" aria-hidden="true"></i> Retour
          </Button>
          <Button
            variant="danger"
            onClick={handleEdit}
            disabled={loading || !point}
            style={{ backgroundColor: '#8B0000', borderColor: '#8B0000' }}
          >
            <i className="bi bi-pencil" aria-hidden="true"></i> Modifier
          </Button>
          <Button
            variant="outline-danger"
            onClick={handleDeleteClick}
            disabled={deleting || !point}
          >
            <i className="bi bi-trash" aria-hidden="true"></i> Supprimer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modale de confirmation de suppression */}
      <Modal
        show={showDeleteConfirm}
        onHide={handleDeleteCancel}
        centered
        size="sm"
        backdrop="static"
      >
        <Modal.Header closeButton style={{ backgroundColor: '#8B0000', color: 'white' }}>
          <Modal.Title>
            <i className="bi bi-exclamation-triangle" aria-hidden="true"></i> Confirmation
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-0">
            Voulez-vous vraiment supprimer le point de vente <strong>{point?.nom}</strong> ?
          </p>
          <p className="text-danger small mt-2 mb-0">
            <i className="bi bi-info-circle" aria-hidden="true"></i> Cette action est irréversible.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleDeleteCancel} disabled={deleting}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm} disabled={deleting}>
            {deleting ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Suppression...
              </>
            ) : (
              <>
                <i className="bi bi-trash" aria-hidden="true"></i> Supprimer
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PointDetailModal;