import { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import styles from '../../styles/pages/ProfilPage.module.css';

/**
 * Modale de modification du profil
 */
const ProfilEditModal = ({ show, onHide, profil, onSave }) => {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    zone_intervention: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Pré-remplir le formulaire à l'ouverture
  useEffect(() => {
    if (show && profil) {
      setFormData({
        nom: profil.nom || '',
        email: profil.email || '',
        zone_intervention: profil.zone_intervention || ''
      });
      setErrors({});
    }
  }, [show, profil]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est obligatoire';
    } else if (formData.nom.trim().length < 2) {
      newErrors.nom = 'Le nom doit contenir au moins 2 caractères';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est obligatoire';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await onSave({
        nom: formData.nom.trim(),
        email: formData.email.trim(),
        zone_intervention: formData.zone_intervention.trim() || null
      });

      if (result.success) {
        // La modale est fermée par le parent
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" keyboard={!loading}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-person" aria-hidden="true"></i> Modifier le profil
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {/* Nom */}
          <Form.Group className="mb-3" controlId="nom">
            <Form.Label className="fw-semibold">
              Nom complet <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Votre nom complet"
              value={formData.nom}
              onChange={handleChange}
              isInvalid={!!errors.nom}
              disabled={loading}
              autoFocus
            />
            <Form.Control.Feedback type="invalid">
              {errors.nom}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Email */}
          <Form.Group className="mb-3" controlId="email">
            <Form.Label className="fw-semibold">
              Email <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="email"
              placeholder="exemple@email.com"
              value={formData.email}
              onChange={handleChange}
              isInvalid={!!errors.email}
              disabled={loading}
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Zone d'intervention */}
          <Form.Group className="mb-3" controlId="zone_intervention">
            <Form.Label className="fw-semibold">Zone d'intervention</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ex: Douala, Cameroun"
              value={formData.zone_intervention}
              onChange={handleChange}
              disabled={loading}
            />
            <Form.Text className="text-muted">
              Votre zone géographique principale d'activité
            </Form.Text>
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

export default ProfilEditModal;