import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    display_name: '',
    country_code: 'AR'
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.username || formData.username.length < 3) {
      newErrors.username = 'Username debe tener al menos 3 caracteres';
    }
    
    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'Contraseña debe tener al menos 8 caracteres';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    
    const { confirmPassword, ...registerData } = formData;
    await register(registerData);
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Crear Cuenta</h2>
          <p className="text-gray-600 mt-2">Únete a la comunidad de Sabelo</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
              placeholder="tu@email.com"
            />

            <Input
              label="Username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
              required
              placeholder="usuario123"
              helperText="3-50 caracteres, solo letras y números"
            />

            <Input
              label="Nombre para mostrar"
              type="text"
              name="display_name"
              value={formData.display_name}
              onChange={handleChange}
              placeholder="Tu Nombre"
              helperText="Opcional"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                País
              </label>
              <select
                name="country_code"
                value={formData.country_code}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="AR">Argentina</option>
                <option value="MX">México</option>
                <option value="ES">España</option>
                <option value="CO">Colombia</option>
                <option value="CL">Chile</option>
                <option value="PE">Perú</option>
                <option value="VE">Venezuela</option>
                <option value="UY">Uruguay</option>
              </select>
            </div>

            <Input
              label="Contraseña"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
              placeholder="••••••••"
            />

            <Input
              label="Confirmar Contraseña"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
              placeholder="••••••••"
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}