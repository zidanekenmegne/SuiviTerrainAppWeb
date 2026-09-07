import LoginForm from '../components/auth/LoginForm';

/**
 * Page de connexion
 * - Redirige vers / si déjà connecté
 * - Gérée par ProtectedRoute ou redirection dans AuthContext
 */
const LoginPage = () => {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#FFF8F0' }}>
      <LoginForm />
    </div>
  );
};

export default LoginPage;