import { useState, useEffect } from 'react';
import PointsList from '../components/points/PointsList';
import CategoriesList from '../components/points/CategoriesList';
import PointFormModal from '../components/points/PointFormModal';
import PointDetailModal from '../components/points/PointDetailModal';
import CategoryFormModal from '../components/points/CategoryFormModal';
import { useToast } from '../contexts/ToastContext';
import styles from '../styles/pages/PointsPage.module.css';

/**
 * Page principale de gestion des points de vente
 * - Affichage en onglets : Points / Catégories
 * - Gestion des modales (ajout, modification, détail, catégorie)
 */
const PointsPage = () => {
  // ==========================================================
  // ÉTATS
  // ==========================================================
  
  // Onglet actif : 'points' ou 'categories'
  const [activeTab, setActiveTab] = useState('points');
  
  // Modales
  const [showPointForm, setShowPointForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  
  // Données sélectionnées
  const [selectedPointId, setSelectedPointId] = useState(null);
  const [editingPoint, setEditingPoint] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  
  // Rafraîchissement
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Toast
  const { showToast } = useToast();

  // ==========================================================
  // FONCTIONS
  // ==========================================================
  
  /**
   * Rafraîchit les données après une modification
   */
  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  /**
   * Ouvre la modale de détail d'un point
   */
  const handleOpenDetail = (id) => {
    setSelectedPointId(id);
    setShowDetailModal(true);
  };

  /**
   * Ouvre la modale d'ajout d'un point
   */
  const handleOpenAddPoint = () => {
    setEditingPoint(null);
    setShowPointForm(true);
  };

  /**
   * Ouvre la modale de modification d'un point
   */
  const handleOpenEditPoint = (point) => {
    setEditingPoint(point);
    setShowPointForm(true);
  };

  /**
   * Ouvre la modale d'ajout d'une catégorie
   */
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setShowCategoryForm(true);
  };

  /**
   * Ouvre la modale de modification d'une catégorie
   */
  const handleOpenEditCategory = (category) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  /**
   * Callback après sauvegarde d'un point
   */
  const handlePointSaved = () => {
    setShowPointForm(false);
    setEditingPoint(null);
    refreshData();
    showToast('Point de vente enregistré avec succès');
  };

  /**
   * Callback après sauvegarde d'une catégorie
   */
  const handleCategorySaved = () => {
    setShowCategoryForm(false);
    setEditingCategory(null);
    refreshData();
    showToast('Catégorie enregistrée avec succès');
  };

  /**
   * Callback après suppression d'un point
   */
  const handlePointDeleted = () => {
    setShowDetailModal(false);
    setSelectedPointId(null);
    refreshData();
    showToast('Point de vente supprimé');
  };

  /**
   * Callback après modification depuis la modale détail
   */
  const handleEditFromDetail = (point) => {
    setShowDetailModal(false);
    setSelectedPointId(null);
    handleOpenEditPoint(point);
  };

  // ==========================================================
  // EFFETS
  // ==========================================================
  
  /**
   * Raccourci clavier Ctrl+K pour la recherche
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('searchPointInput');
        if (searchInput) {
          searchInput.focus();
        }
      }
      // Échap pour fermer les modales
      if (e.key === 'Escape') {
        if (showPointForm) setShowPointForm(false);
        if (showDetailModal) setShowDetailModal(false);
        if (showCategoryForm) setShowCategoryForm(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showPointForm, showDetailModal, showCategoryForm]);

  // ==========================================================
  // RENDU
  // ==========================================================
  
  return (
    <div className={styles.pointsContainer}>
      
      {/* ======== EN-TÊTE PC ======== */}
      <div className={styles.headerPC}>
        <h1>
          <i className="bi bi-shop" aria-hidden="true"></i> Points de vente
        </h1>
      </div>

      {/* ======== ONGLETS ======== */}
      <div className={styles.tabsContainer} role="tablist">
        <button
          className={`${styles.tabBtn} ${activeTab === 'points' ? styles.active : ''}`}
          onClick={() => setActiveTab('points')}
          role="tab"
          aria-selected={activeTab === 'points'}
          aria-controls="tab-points"
        >
          <i className="bi bi-shop" aria-hidden="true"></i> Points de vente
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'categories' ? styles.active : ''}`}
          onClick={() => setActiveTab('categories')}
          role="tab"
          aria-selected={activeTab === 'categories'}
          aria-controls="tab-categories"
        >
          <i className="bi bi-tags" aria-hidden="true"></i> Catégories
        </button>
      </div>

      {/* ======== PANNEAU POINTS ======== */}
      <div
        className={`${styles.tabPanel} ${activeTab === 'points' ? styles.active : ''}`}
        id="tab-points"
        role="tabpanel"
      >
        <PointsList
          key={`points-${refreshKey}`}
          onOpenDetail={handleOpenDetail}
          onOpenEdit={handleOpenEditPoint}
          onAddPoint={handleOpenAddPoint}
        />
      </div>

      {/* ======== PANNEAU CATÉGORIES ======== */}
      <div
        className={`${styles.tabPanel} ${activeTab === 'categories' ? styles.active : ''}`}
        id="tab-categories"
        role="tabpanel"
      >
        <CategoriesList
          key={`categories-${refreshKey}`}
          onOpenEdit={handleOpenEditCategory}
          onAddCategory={handleOpenAddCategory}
        />
      </div>

      {/* ======== MODALES ======== */}
      
      {/* Modale Ajout/Modification Point */}
      <PointFormModal
        show={showPointForm}
        onHide={() => {
          setShowPointForm(false);
          setEditingPoint(null);
        }}
        point={editingPoint}
        onSaved={handlePointSaved}
      />

      {/* Modale Détail Point */}
      <PointDetailModal
        show={showDetailModal}
        onHide={() => {
          setShowDetailModal(false);
          setSelectedPointId(null);
        }}
        pointId={selectedPointId}
        onDeleted={handlePointDeleted}
        onEdit={handleEditFromDetail}
      />

      {/* Modale Ajout/Modification Catégorie */}
      <CategoryFormModal
        show={showCategoryForm}
        onHide={() => {
          setShowCategoryForm(false);
          setEditingCategory(null);
        }}
        category={editingCategory}
        onSaved={handleCategorySaved}
      />

    </div>
  );
};

export default PointsPage;