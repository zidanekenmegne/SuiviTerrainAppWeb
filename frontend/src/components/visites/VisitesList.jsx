import VisiteCard from './VisiteCard';
import styles from '../../styles/pages/VisitesPage.module.css';

/**
 * Liste des visites
 */
const VisitesList = ({ visites, onVisitClick }) => {
  if (visites.length === 0) {
    return null;
  }

  return (
    <section className={styles.visitesList} aria-label="Liste des visites">
      {visites.map((visite) => (
        <VisiteCard
          key={visite.id}
          visite={visite}
          onClick={() => onVisitClick(visite.id)}
        />
      ))}
    </section>
  );
};

export default VisitesList;