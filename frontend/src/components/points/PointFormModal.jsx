import { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import apiClient from '../../api/client';
import { useToast } from '../../contexts/ToastContext';

/**
 * Modale d'ajout / modification d'un point de vente
 * - Ajout : point = null
 * - Modification : point = { id, nom, adresse, telephone, categorie_id }
 */
const PointFormModal = ({ show, onHide, point, onSaved }) => {
  // ==========================================================
  // ÉTATS
  // ==========================================================
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    telephone: '',
    categorie_id: ''
  });
  const [errors, setErrors] = useState({});
  const { showToast } = useToast();

  // ==========================================================
  // CHARGEMENT DES CATÉGORIES
  // ==========================================================
  useEffect(() => {
    if (show) {
      fetchCategories();
      if (point) {
        // Mode modification : pré-remplir le formulaire
        setFormData({
          nom: point.nom || '',
          adresse: point.adresse || '',
          telephone: point.telephone || '',
          categorie_id: point.categorie_id || point.id_cat || ''
        });
      } else {
        // Mode ajout : réinitialiser
        setFormData({
          nom: '',
          adresse: '',
          telephone: '',
          categorie_id: ''
        });
      }
      setErrors({});
    }
  }, [show, point]);

  // ==========================================================
  // FONCTIONS
  // ==========================================================
  
  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/categories');
      setCategories(response.data?.data || []);
    } catch (err) {
      console.error('Erreur chargement catégories:', err);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    // Effacer l'erreur du champ modifié
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est obligatoire';
    }
    if (!formData.adresse.trim()) {
      newErrors.adresse = 'L\'adresse est obligatoire';
    }
    if (formData.telephone && !/^(\+237|0)?[67][0-9]{8}$/.test(formData.telephone.replace(/\s/g, ''))) {
      newErrors.telephone = 'Numéro invalide (ex: 699999999 ou +237699999999)';
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
      // Préparer les données pour l'API
      const payload = {
        nom: formData.nom.trim(),
        adresse: formData.adresse.trim(),
        telephone: formData.telephone.trim() || null,
        categorie_id: formData.categorie_id ? parseInt(formData.categorie_id) : null
      };

      if (point) {
        // Mode modification
        await apiClient.put(`/points/${point.id}`, payload);
        showToast('Point de vente modifié avec succès');
      } else {
        // Mode ajout
        await apiClient.post('/points', payload);
        showToast('Point de vente ajouté avec succès');
      }

      onSaved();
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      const message = err.response?.data?.message || 'Erreur lors de l\'enregistrement';
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
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
      keyboard={false}
    >
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-shop" aria-hidden="true"></i>
            {point ? 'Modifier le point de vente' : 'Ajouter un point de vente'}
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
              placeholder="Entrez le nom du point de vente"
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

          {/* Adresse */}
          <Form.Group className="mb-3" controlId="adresse">
            <Form.Label className="fw-semibold">
              Adresse <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Entrez l'adresse complète"
              value={formData.adresse}
              onChange={handleChange}
              isInvalid={!!errors.adresse}
              disabled={loading}
            />
            <Form.Control.Feedback type="invalid">
              {errors.adresse}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              L'adresse sera géocodée automatiquement pour la carte
            </Form.Text>
          </Form.Group>

          {/* Contact */}
          <Form.Group className="mb-3" controlId="telephone">
            <Form.Label className="fw-semibold">Contact</Form.Label>
            <Form.Control
              type="tel"
              placeholder="Ex: 699999999"
              value={formData.telephone}
              onChange={handleChange}
              isInvalid={!!errors.telephone}
              disabled={loading}
            />
            <Form.Control.Feedback type="invalid">
              {errors.telephone}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Format: 6 ou 7 puis 8 chiffres (ex: 699999999)
            </Form.Text>
          </Form.Group>

          {/* Catégorie */}
          <Form.Group className="mb-3" controlId="categorie_id">
            <Form.Label className="fw-semibold">Catégorie</Form.Label>
            <Form.Select
              value={formData.categorie_id}
              onChange={handleChange}
              disabled={loading || categories.length === 0}
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nom} ({cat.nombre_points || 0} points)
                </option>
              ))}
            </Form.Select>
            {categories.length === 0 && (
              <Form.Text className="text-warning">
                <i className="bi bi-info-circle" aria-hidden="true"></i>
                Aucune catégorie disponible. Créez-en d'abord.
              </Form.Text>
            )}
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
                <i className="bi bi-check-lg" aria-hidden="true"></i>
                {point ? ' Modifier' : ' Ajouter'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default PointFormModal;