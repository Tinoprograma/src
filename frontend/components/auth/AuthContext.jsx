import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Función auxiliar para guardar el usuario en localStorage
  const storeUserInLocalStorage = (user) => {
    // Almacenar un subconjunto de datos del usuario incluyendo el 'role'
    const userToStore = {
      id: user.id,
      email: user.email,
      username: user.username,
      display_name: user.display_name, // Opcional, si existe
      role: user.role // 
    };
    localStorage.setItem('user', JSON.stringify(userToStore));
  };
    
  // Verificar si hay token al cargar
  useEffect(() => {
    const token = localStorage.getItem('token');
    // Adicionalmente, cargar el usuario de localStorage si existe
    const storedUser = localStorage.getItem('user');

    if (token) {
      // Verificar token con el backend
      api.get('/auth/me')
        .then(response => {
          // Usar los datos frescos del backend
          setUser(response.data.user); 
          setIsAuthenticated(true);
          // Opcional: Re-almacenar para asegurar que el 'user' en localStorage esté actualizado
          storeUserInLocalStorage(response.data.user);
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user'); // Limpiar también el user si el token falla
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (storedUser) {
        // Limpiar 'user' si no hay 'token', para evitar inconsistencias
        localStorage.removeItem('user');
        setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      // Cuando hagas login
      storeUserInLocalStorage(user); // ← Agregado para guardar el objeto 'user' simplificado con 'role'
      
      setUser(user);
      setIsAuthenticated(true);
      
      toast.success(`¡Bienvenido de vuelta, ${user.display_name || user.username}!`);
      navigate('/');
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al iniciar sesión';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      // Agregado también en register para consistencia
      storeUserInLocalStorage(user); // ← Agregado para guardar el objeto 'user' simplificado con 'role'
      
      setUser(user);
      setIsAuthenticated(true);
      
      toast.success(`¡Bienvenido a Sabelo, ${user.display_name || user.username}!`);
      navigate('/');
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al registrarse';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // ← Limpiar también el 'user' al cerrar sesión
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Sesión cerrada');
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};