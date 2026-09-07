import { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Badge } from 'react-bootstrap';
import apiClient from '../../api/client';
import { useToast } from '../../contexts/ToastContext';

/**
 * Modale de détail d'un point de vente
 * - Affiche toutes les informations
 * - Permet la modification et la suppression
 */
const PointDetailModal = ({ show, onHide, pointId, onDeleted, onEdit }) => {
  // ==========================================================
  // ÉTATS
  // ==========================================================
  const [point, setPoint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [categories, setCategories] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  // ==========================================================
  // CHARGEMENT DES DONNÉES
  // ==========================================================
  useEffect(() => {
    if (show && pointId) {
      fetchPointDetail();
      fetchCategories();
    }
  }, [show, pointId]);

  const fetchPointDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/points/${pointId}`);
      const data = response.data?.data;
      setPoint(data);
      setEditData({
        nom: data.nom || '',
        adresse: data.adresse || '',
        telephone: data.telephone || '',
        categorie_id: data.categorie_id || ''
      });
    } catch (err) {
      console.error('Erreur chargement détail:', err);
      setError(err.response?.data?.message || 'Impossible de charger les détails');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/categories');
      setCategories(response.data?.data || []);
    } catch (err) {
      console.error('Erreur chargement catégories:', err);
    }
  };

  // ==========================================================
  // FONCTIONS
  // ==========================================================
  
  const handleEditToggle = () => {
    if (isEditing) {
      // Annuler : restaurer les données originales
      setEditData({
        nom: point.nom || '',
        adresse: point.adresse || '',
        telephone: point.telephone || '',
        categorie_id: point.categorie_id || ''
      });
    }
    setIsEditing(!isEditing);
  };

  const handleEditChange = (e) => {
    const { id, value } = e.target;
    setEditData(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await apiClient.put(`/points/${pointId}`, {
        nom: editData.nom.trim(),
        adresse: editData.adresse.trim(),
        telephone: editData.telephone.trim() || null,
        categorie_id: editData.categorie_id ? parseInt(editData.categorie_id) : null
      });
      
      showToast('Point de vente modifié avec succès');
      setIsEditing(false);
      // Recharger les données
      await fetchPointDetail();
      // Notifier le parent
      if (onEdit) onEdit({ ...point, ...editData });
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      showToast(err.response?.data?.message || 'Erreur lors de la modification', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce point de vente ? Cette action est irréversible.')) {
      return;
    }

    try {
      setDeleting(true);
      await apiClient.delete(`/points/${pointId}`);
      showToast('Point de vente supprimé avec succès');
      if (onDeleted) onDeleted();
    } catch (err) {
      console.error('Erreur suppression:', err);
      showToast(err.response?.data?.message || 'Erreur lors de la suppression', 'error');
      setDeleting(false);
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

  // ==========================================================
  // RENDU
  // ==========================================================
  
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      backdrop="static"
      keyboard={!isEditing}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-shop" aria-hidden="true"></i>
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
              <div className="position-relative d-inline-block">
                <img
                  src={point.photo || 'data:image/svg+xml,' + encodeURIComponent(
                    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f0ece6"/><text x="100" y="110" text-anchor="middle" font-family="sans-serif" font-size="40" fill="#6c757d">🏪</text></svg>'
                  )}
                  alt={point.nom}
                  className="rounded-3"
                  style={{ width: '150px', height: '150px', objectFit: 'cover', border: '2px solid #f0ece6' }}
                />
                {isEditing && (
                  <div
                    className="position-absolute bottom-0 end-0 bg-danger text-white rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: '36px', height: '36px', cursor: 'pointer', border: '3px solid white' }}
                    onClick={() => document.getElementById('photoInputDetail').click()}
                  >
                    <i className="bi bi-camera" aria-hidden="true"></i>
                  </div>
                )}
                <input type="file" id="photoInputDetail" className="d-none" accept="image/*" />
              </div>
            </div>

            {/* Informations */}
            <div className="row g-3">
              {/* Nom */}
              <div className="col-12">
                <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                  <span className="fw-semibold text-muted">Nom</span>
                  {isEditing ? (
                    <input
                      type="text"
                      id="nom"
                      className="form-control form-control-sm w-50"
                      value={editData.nom}
                      onChange={handleEditChange}
                    />
                  ) : (
                    <span className="fw-semibold">{point.nom}</span>
                  )}
                </div>
              </div>

              {/* Adresse */}
              <div className="col-12">
                <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                  <span className="fw-semibold text-muted">Adresse</span>
                  {isEditing ? (
                    <input
                      type="text"
                      id="adresse"
                      className="form-control form-control-sm w-50"
                      value={editData.adresse}
                      onChange={handleEditChange}
                    />
                  ) : (
                    <span>{point.adresse || 'Non renseignée'}</span>
                  )}
                </div>
              </div>

              {/* Contact */}
              <div className="col-12">
                <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                  <span className="fw-semibold text-muted">Contact</span>
                  {isEditing ? (
                    <input
                      type="tel"
                      id="telephone"
                      className="form-control form-control-sm w-50"
                      value={editData.telephone || ''}
                      onChange={handleEditChange}
                    />
                  ) : (
                    <span>{point.telephone || 'Non renseigné'}</span>
                  )}
                </div>
              </div>

              {/* Catégorie */}
              <div className="col-12">
                <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                  <span className="fw-semibold text-muted">Catégorie</span>
                  {isEditing ? (
                    <select
                      id="categorie_id"
                      className="form-select form-select-sm w-50"
                      value={editData.categorie_id || ''}
                      onChange={handleEditChange}
                    >
                      <option value="">Sélectionner</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nom}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Badge
                      bg="secondary"
                      style={{ backgroundColor: getCategorieColor(point.categorie) }}
                    >
                      {point.categorie || 'Non catégorisé'}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Coordonnées GPS */}
              <div className="col-12">
                <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                  <span className="fw-semibold text-muted">Coordonnées GPS</span>
                  <span className="text-muted small">
                    {point.latitude && point.longitude 
                      ? `${point.latitude}, ${point.longitude}`
                      : 'Non géocodé'
                    }
                  </span>
                </div>
              </div>

              {/* Date de création */}
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
                      : 'Non renseigné'
                    }
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </Modal.Body>

      <Modal.Footer>
        {!isEditing ? (
          <>
            <Button variant="outline-secondary" onClick={onHide}>
              <i className="bi bi-arrow-left" aria-hidden="true"></i> Retour
            </Button>
            <Button
              variant="danger"
              onClick={handleEditToggle}
              style={{ backgroundColor: '#8B0000', borderColor: '#8B0000' }}
            >
              <i className="bi bi-pencil" aria-hidden="true"></i> Modifier
            </Button>
            <Button
              variant="outline-danger"
              onClick={handleDelete}
              disabled={deleting}
            >
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
          </>
        ) : (
          <>
            <Button variant="outline-secondary" onClick={handleEditToggle} disabled={loading}>
              <i className="bi bi-x-circle" aria-hidden="true"></i> Annuler
            </Button>
            <Button
              variant="danger"
              onClick={handleSave}
              disabled={loading}
              style={{ backgroundColor: '#28a745', borderColor: '#28a745' }}
            >
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg" aria-hidden="true"></i> Enregistrer
                </>
              )}
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default PointDetailModal;