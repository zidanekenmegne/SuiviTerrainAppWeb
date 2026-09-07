import RegisterForm from '../components/auth/RegisterForm';

/**
 * Page d'inscription
 */
const RegisterPage = () => {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#FFF8F0' }}>
      <RegisterForm />
    </div>
  );
};

export default RegisterPage;