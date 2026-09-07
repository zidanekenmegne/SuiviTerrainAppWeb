import { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import apiClient from '../../api/client';
import { useToast } from '../../contexts/ToastContext';

/**
 * Modale d'ajout / modification d'une catégorie
 * - Ajout : category = null
 * - Modification : category = { id, nom, couleur }
 */
const CategoryFormModal = ({ show, onHide, category, onSaved }) => {
  // ==========================================================
  // ÉTATS
  // ==========================================================
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    couleur: '#28a745'
  });
  const [errors, setErrors] = useState({});
  const { showToast } = useToast();

  // ==========================================================
  // EFFETS
  // ==========================================================
  useEffect(() => {
    if (show) {
      if (category) {
        // Mode modification
        setFormData({
          nom: category.nom || '',
          couleur: category.couleur || '#28a745'
        });
      } else {
        // Mode ajout
        setFormData({
          nom: '',
          couleur: '#28a745'
        });
      }
      setErrors({});
    }
  }, [show, category]);

  // ==========================================================
  // FONCTIONS
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
    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom de la catégorie est obligatoire';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      showToast('Veuillez corriger les erreurs du formulaire', 'error');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        nom: formData.nom.trim(),
        couleur: formData.couleur
      };

      if (category) {
        // Mode modification
        await apiClient.put(`/categories/${category.id}`, payload);
        showToast('Catégorie modifiée avec succès');
      } else {
        // Mode ajout
        await apiClient.post('/categories', payload);
        showToast('Catégorie ajoutée avec succès');
      }

      onSaved();
    } catch (err) {
      console.error('Erreur sauvegarde catégorie:', err);
      const message = err.response?.data?.message || 'Erreur lors de l\'enregistrement';
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // RENDU
  // ==========================================================
  
  const couleurOptions = [
    { value: '#28a745', label: 'Vert' },
    { value: '#007bff', label: 'Bleu' },
    { value: '#ffc107', label: 'Jaune' },
    { value: '#dc3545', label: 'Rouge' },
    { value: '#6f42c1', label: 'Violet' },
    { value: '#fd7e14', label: 'Orange' },
    { value: '#20c997', label: 'Turquoise' },
    { value: '#e83e8c', label: 'Rose' },
    { value: '#6c757d', label: 'Gris' },
    { value: '#343a40', label: 'Noir' }
  ];

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      backdrop="static"
      keyboard={false}
    >
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-tags" aria-hidden="true"></i>
            {category ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {/* Nom */}
          <Form.Group className="mb-3" controlId="nom">
            <Form.Label className="fw-semibold">
              Nom <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Ex: Alimentation, Services, Électronique..."
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

          {/* Couleur */}
          <Form.Group className="mb-3" controlId="couleur">
            <Form.Label className="fw-semibold">Couleur</Form.Label>
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <Form.Select
                value={formData.couleur}
                onChange={handleChange}
                disabled={loading}
                style={{ maxWidth: '200px' }}
              >
                {couleurOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Form.Select>
              <div
                className="rounded-circle border"
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: formData.couleur,
                  border: '2px solid #e0dcd6',
                  cursor: 'pointer'
                }}
                onClick={() => document.getElementById('couleurPicker').click()}
              />
              <input
                type="color"
                id="couleurPicker"
                className="d-none"
                value={formData.couleur}
                onChange={handleChange}
                disabled={loading}
              />
              <span className="text-muted small">{formData.couleur}</span>
            </div>
            <Form.Text className="text-muted">
              Cliquez sur le cercle ou utilisez le sélecteur pour choisir une couleur
            </Form.Text>
          </Form.Group>

          {/* Aperçu */}
          <div className="p-3 bg-light rounded-3">
            <p className="mb-0 fw-semibold">Aperçu</p>
            <div className="d-flex align-items-center gap-3 mt-2">
              <span
                className="badge"
                style={{
                  backgroundColor: formData.couleur,
                  padding: '0.5rem 1rem',
                  fontSize: '0.9rem'
                }}
              >
                {formData.nom || 'Nom de la catégorie'}
              </span>
              <span className="text-muted small">
                Badge avec la couleur sélectionnée
              </span>
            </div>
          </div>
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
                <i className="bi bi-check-lg" aria-hidden="true"></i>
                {category ? ' Modifier' : ' Ajouter'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CategoryFormModal;