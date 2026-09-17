import { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import apiClient from '../../api/client';

/**
 * Modale de modification d'une visite
 */
const VisiteEditModal = ({ show, onHide, visite, onSave }) => {
  const [formData, setFormData] = useState({
    titre: '',
    datePrevue: '',
    heurePrevue: '',
    pointVenteId: '',
    statut: 'planifie',
    compteRendu: ''
  });
  const [pointsVente, setPointsVente] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // ==========================================================
  // CHARGEMENT INITIAL
  // ==========================================================
  useEffect(() => {
    if (show && visite) {
      setFormData({
        titre: visite.titre || '',
        datePrevue: visite.datePrevue || '',
        heurePrevue: visite.heurePrevue || '08:00',
        pointVenteId: visite.pointVente?.id || '',
        statut: visite.statut || 'planifie',
        compteRendu: visite.compteRendu || ''
      });
      setErrors({});
      fetchPointsVente();
    }
  }, [show, visite]);

  const fetchPointsVente = async () => {
    try {
      const response = await apiClient.get('/points', { params: { limit: 200 } });
      setPointsVente(response.data?.data?.points || []);
    } catch (err) {
      console.error('Erreur chargement points:', err);
    }
  };

  // ==========================================================
  // HANDLERS
  // ==========================================================
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.datePrevue) {
      newErrors.datePrevue = 'La date est obligatoire';
    }
    if (!formData.heurePrevue) {
      newErrors.heurePrevue = 'L\'heure est obligatoire';
    }
    if (!formData.pointVenteId) {
      newErrors.pointVenteId = 'Le point de vente est obligatoire';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await onSave({
        datePrevue: formData.datePrevue,
        heurePrevue: formData.heurePrevue,
        pointVenteId: parseInt(formData.pointVenteId),
        statut: formData.statut,
        compteRendu: formData.compteRendu.trim() || null
      });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // RENDU
  // ==========================================================
  return (
    <Modal show={show} onHide={onHide} centered size="lg" backdrop="static" keyboard={!loading}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-calendar-check" aria-hidden="true"></i> Modifier la visite
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {/* Titre (lecture seule) */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Titre</Form.Label>
            <Form.Control
              type="text"
              value={formData.titre}
              disabled
              readOnly
            />
            <Form.Text className="text-muted">
              Le titre est défini automatiquement à partir du point de vente
            </Form.Text>
          </Form.Group>

          {/* Point de vente */}
          <Form.Group className="mb-3" controlId="pointVenteId">
            <Form.Label className="fw-semibold">
              Point de vente <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              value={formData.pointVenteId}
              onChange={handleChange}
              isInvalid={!!errors.pointVenteId}
              disabled={loading}
            >
              <option value="">-- Sélectionner --</option>
              {pointsVente.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nom} — {p.adresse}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.pointVenteId}
            </Form.Control.Feedback>
          </Form.Group>

          <div className="row">
            {/* Date */}
            <div className="col-6">
              <Form.Group className="mb-3" controlId="datePrevue">
                <Form.Label className="fw-semibold">
                  Date <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="date"
                  value={formData.datePrevue}
                  onChange={handleChange}
                  isInvalid={!!errors.datePrevue}
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.datePrevue}
                </Form.Control.Feedback>
              </Form.Group>
            </div>

            {/* Heure */}
            <div className="col-6">
              <Form.Group className="mb-3" controlId="heurePrevue">
                <Form.Label className="fw-semibold">
                  Heure <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="time"
                  value={formData.heurePrevue}
                  onChange={handleChange}
                  isInvalid={!!errors.heurePrevue}
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.heurePrevue}
                </Form.Control.Feedback>
              </Form.Group>
            </div>
          </div>

          {/* Statut */}
          <Form.Group className="mb-3" controlId="statut">
            <Form.Label className="fw-semibold">Statut</Form.Label>
            <Form.Select
              value={formData.statut}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="planifie">Planifiée</option>
              <option value="encours">En cours</option>
              <option value="realisee">Réalisée</option>
              <option value="retard">En retard</option>
            </Form.Select>
          </Form.Group>

          {/* Compte rendu */}
          <Form.Group className="mb-3" controlId="compteRendu">
            <Form.Label className="fw-semibold">Compte rendu</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Notes, observations, résultats de la visite..."
              value={formData.compteRendu}
              onChange={handleChange}
              disabled={loading}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide} disabled={loading}>
            <i className="bi bi-x-circle" aria-hidden="true"></i> Annuler
          </Button>
          <Button
            type="submit"
            variant="danger"
            disabled={loading}
            style={{ backgroundColor: '#8B0000', borderColor: '#8B0000' }}
          >
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Enregistrement...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg" aria-hidden="true"></i> Enregistrer
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default VisiteEditModal;