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
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          apiClient.defaults.headers.Authorization = `Bearer ${storedToken}`;
        } catch (error) {
          console.error('Erreur lors de la restauration de la session:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Fonction de connexion
    const login = async (email, password) => {
    try {
        const response = await apiClient.post('/auth/login', { email, mdp: password });
        console.log('Réponse API login:', response.data); // ← Pour déboguer
        
        // Vérifier si la réponse a le format attendu
        if (!response.data || !response.data.data) {
        throw new Error('Format de réponse API invalide');
        }
        
        const { token, user } = response.data.data;
        
        if (!token || !user) {
        throw new Error('Token ou utilisateur manquant');
        }
        
        // Sauvegarder dans localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Mettre à jour les états
        setToken(token);
        setUser(user);
        apiClient.defaults.headers.Authorization = `Bearer ${token}`;
        
        return { success: true, user };
    } catch (error) {
        console.error('Erreur de connexion détaillée:', error.response?.data || error.message);
        return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur lors de la connexion' 
        };
    }
    };

  // Fonction de déconnexion
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    delete apiClient.defaults.headers.Authorization;
  };

  // Fonction d'inscription
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

  const isAuthenticated = !!user && !!token;

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