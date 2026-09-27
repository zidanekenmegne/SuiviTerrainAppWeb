import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // ==========================================================
  // INITIALISATION : restaurer la session au chargement
  // ==========================================================
  useEffect(() => {
    const initAuth = () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
          apiClient.defaults.headers.Authorization = `Bearer ${storedToken}`;
        } catch (error) {
          console.error('Erreur restauration session:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  // ==========================================================
  // CONNEXION
  // ==========================================================
  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        mdp: password
      });

      if (!response.data || !response.data.data) {
        throw new Error('Format de réponse API invalide');
      }

      const { token: newToken, user: newUser } = response.data.data;

      if (!newToken || !newUser) {
        throw new Error('Token ou utilisateur manquant');
      }

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));

      setToken(newToken);
      setUser(newUser);
      apiClient.defaults.headers.Authorization = `Bearer ${newToken}`;

      console.log('✅ Connexion réussie :', newUser.nom);

      return { success: true, user: newUser };

    } catch (error) {
      console.error('❌ Erreur de connexion:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la connexion'
      };
    }
  };

  // ==========================================================
  // DÉCONNEXION
  // ==========================================================
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    delete apiClient.defaults.headers.Authorization;
  };

  // ==========================================================
  // INSCRIPTION
  // ==========================================================
  const register = async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de l\'inscription'
      };
    }
  };

  // ==========================================================
  // ÉTAT D'AUTHENTIFICATION
  // ==========================================================
  const isAuthenticated = Boolean(user && token);

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};