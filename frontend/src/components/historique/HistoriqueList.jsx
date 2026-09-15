import HistoriqueItem from './HistoriqueItem';
import styles from '../../styles/pages/HistoriquePage.module.css';

/**
 * Liste de l'historique
 */
const HistoriqueList = ({ visites, onVisitClick }) => {
  if (visites.length === 0) return null;

  return (
    <div className={styles.historiqueList}>
      {visites.map((visite) => (
        <HistoriqueItem
          key={visite.id}
          visite={visite}
          onClick={() => onVisitClick(visite.id)}
        />
      ))}
    </div>
  );
};

export default HistoriqueList;