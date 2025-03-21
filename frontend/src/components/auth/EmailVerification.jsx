import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const EmailVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // Obtener el email del estado de la navegación
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  useEffect(() => {
    // Contador para habilitar el reenvío de código
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [countdown, resendDisabled]);

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Por favor, ingrese su correo electrónico');
      return;
    }
    
    if (!verificationCode) {
      setError('Por favor, ingrese el código de verificación');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/verify-email`,
        { email, verificationCode }
      );
      
      setSuccess(true);
      
      // Redirigir al login después de un breve retraso
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Error al verificar el correo:', err);
      setError(err.response?.data?.message || 'Error al verificar el código. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError('Por favor, ingrese su correo electrónico');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setResendDisabled(true);
      setCountdown(60); // Deshabilitar por 60 segundos
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/resend-verification`,
        { email }
      );
      
      setError('');
      // Mostrar mensaje de éxito temporal
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error al reenviar el código:', err);
      setError(err.response?.data?.message || 'Error al reenviar el código. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verificación de Correo Electrónico
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Por favor, ingrese el código de verificación enviado a su correo electrónico.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {success === true ? 'Verificación exitosa. Redirigiendo al inicio de sesión...' : success}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleVerify}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
                Código de Verificación
              </label>
              <div className="mt-1">
                <input
                  id="verificationCode"
                  name="verificationCode"
                  type="text"
                  required
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Ingrese el código de 6 dígitos"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Verificando...' : 'Verificar'}
              </button>
            </div>
          </form>

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendDisabled || loading}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {resendDisabled ? `Reenviar código (${countdown}s)` : 'Reenviar código'}
            </button>
            
            <Link to="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
