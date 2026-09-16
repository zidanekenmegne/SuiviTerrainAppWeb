import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';
import NavbarMobile from '../common/NavbarMobile';
import BottomNav from '../common/BottomNav';
import Footer from '../common/Footer';
import styles from '../../styles/components/Layout.module.css';

/**
 * Layout principal de l'application
 * - Navbar PC
 * - Navbar Mobile (header)
 * - Contenu dynamique (Outlet)
 * - BottomNav Mobile
 * - Footer PC
 */
const Layout = () => {
  return (
    <div className={styles.layoutWrapper}>
      {/* Navigation PC */}
      <Navbar />

      {/* Navigation Mobile (header) */}
      <NavbarMobile />

      {/* Contenu principal */}
      <main className={styles.mainContent}>
        <Outlet />
      </main>

      {/* Footer PC */}
      <Footer />

      {/* Bottom Navigation Mobile */}
      <BottomNav />
    </div>
  );
};

export default Layout;