import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';
import NavbarMobile from '../common/NavbarMobile';
import BottomNav from '../common/BottomNav';
import Footer from '../common/Footer';
import { ToastProvider } from '../../contexts/ToastContext';

/**
 * Layout principal de l'application
 * - Navbar PC (visible sur >768px)
 * - Header mobile (visible sur <768px)
 * - Contenu dynamique (Outlet)
 * - BottomNav mobile (visible sur <768px)
 * - Footer PC (visible sur >768px)
 */
const Layout = () => {
  return (
    <ToastProvider>
      <div className="d-flex flex-column min-vh-100">
        {/* Navigation PC */}
        <Navbar />
        
        {/* Navigation Mobile (header) */}
        <NavbarMobile />

        {/* Contenu principal */}
        <main className="flex-grow-1" style={{ backgroundColor: '#FFF8F0' }}>
          <Outlet />
        </main>

        {/* Footer PC */}
        <Footer />

        {/* Bottom Navigation Mobile */}
        <BottomNav />
      </div>
    </ToastProvider>
  );
};

export default Layout;