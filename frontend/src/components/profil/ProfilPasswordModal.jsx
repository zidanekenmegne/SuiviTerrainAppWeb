import { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, InputGroup } from 'react-bootstrap';

/**
 * Modale de changement de mot de passe
 */
const ProfilPasswordModal = ({ show, onHide, onChangePassword }) => {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [errors, setErrors] = useState({});

  // Réinitialiser le formulaire à l'ouverture
  useEffect(() => {
    if (show) {
      setFormData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      setErrors({});
      setShowPasswords({ current: false, new: false, confirm: false });
    }
  }, [show]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const togglePassword = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.current_password) {
      newErrors.current_password = 'Le mot de passe actuel est obligatoire';
    }

    if (!formData.new_password) {
      newErrors.new_password = 'Le nouveau mot de passe est obligatoire';
    } else if (formData.new_password.length < 6) {
      newErrors.new_password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await onChangePassword(
        formData.current_password,
        formData.new_password
      );

      if (result.success) {
        // Réinitialiser après succès
        setFormData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
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
            <i className="bi bi-shield-lock" aria-hidden="true"></i> Changer le mot de passe
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {/* Mot de passe actuel */}
          <Form.Group className="mb-3" controlId="current_password">
            <Form.Label className="fw-semibold">
              Mot de passe actuel <span className="text-danger">*</span>
            </Form.Label>
            <InputGroup>
              <Form.Control
                type={showPasswords.current ? 'text' : 'password'}
                placeholder="Entrez votre mot de passe actuel"
                value={formData.current_password}
                onChange={handleChange}
                isInvalid={!!errors.current_password}
                disabled={loading}
                autoFocus
              />
              <Button
                variant="outline-secondary"
                onClick={() => togglePassword('current')}
                tabIndex="-1"
              >
                <i className={`bi ${showPasswords.current ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </Button>
              <Form.Control.Feedback type="invalid">
                {errors.current_password}
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>

          {/* Nouveau mot de passe */}
          <Form.Group className="mb-3" controlId="new_password">
            <Form.Label className="fw-semibold">
              Nouveau mot de passe <span className="text-danger">*</span>
            </Form.Label>
            <InputGroup>
              <Form.Control
                type={showPasswords.new ? 'text' : 'password'}
                placeholder="Entrez votre nouveau mot de passe"
                value={formData.new_password}
                onChange={handleChange}
                isInvalid={!!errors.new_password}
                disabled={loading}
              />
              <Button
                variant="outline-secondary"
                onClick={() => togglePassword('new')}
                tabIndex="-1"
              >
                <i className={`bi ${showPasswords.new ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </Button>
              <Form.Control.Feedback type="invalid">
                {errors.new_password}
              </Form.Control.Feedback>
            </InputGroup>
            <Form.Text className="text-muted">
              Minimum 6 caractères
            </Form.Text>
          </Form.Group>

          {/* Confirmation */}
          <Form.Group className="mb-3" controlId="confirm_password">
            <Form.Label className="fw-semibold">
              Confirmer le mot de passe <span className="text-danger">*</span>
            </Form.Label>
            <InputGroup>
              <Form.Control
                type={showPasswords.confirm ? 'text' : 'password'}
                placeholder="Confirmez votre nouveau mot de passe"
                value={formData.confirm_password}
                onChange={handleChange}
                isInvalid={!!errors.confirm_password}
                disabled={loading}
              />
              <Button
                variant="outline-secondary"
                onClick={() => togglePassword('confirm')}
                tabIndex="-1"
              >
                <i className={`bi ${showPasswords.confirm ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </Button>
              <Form.Control.Feedback type="invalid">
                {errors.confirm_password}
              </Form.Control.Feedback>
            </InputGroup>
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
                Modification...
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

export default ProfilPasswordModal;