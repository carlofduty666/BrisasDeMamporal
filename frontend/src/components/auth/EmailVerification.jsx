import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaEnvelope, FaKey, FaCheckCircle, FaArrowLeft, FaRedo } from 'react-icons/fa';

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
  const [focusedInput, setFocusedInput] = useState('');

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col justify-center py-6 sm:py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-slate-700/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-slate-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-slate-700/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Logo discreto en esquina superior izquierda */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 animate-fade-in-down">
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="bg-gradient-to-br from-slate-700 to-slate-800 p-1.5 sm:p-2 rounded-xl shadow-lg border border-slate-600/50 backdrop-blur-md transform group-hover:scale-105 transition-all duration-300">
            <img 
              src="/img/1.colegioLogo.png" 
              alt="Logo U.E.P. Brisas de Mamporal" 
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
            />
          </div>
          <span className="hidden sm:block text-slate-300 text-sm font-semibold group-hover:text-white transition-colors duration-300">
            Brisas de Mamporal
          </span>
        </Link>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10">
        {/* Header con animación */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-down">
          <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-2 drop-shadow-lg">
            Verificación de Correo
          </h2>
          <p className="text-center text-slate-300 text-sm sm:text-base">
            Por favor, ingrese el código de verificación enviado a su correo electrónico.
          </p>
        </div>

        {/* Formulario con animación */}
        <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up">
          <div className="bg-white/10 backdrop-blur-xl py-6 sm:py-8 px-4 sm:px-8 md:px-10 shadow-2xl sm:rounded-3xl border border-white/20">
            {error && (
              <div className="mb-4 bg-red-500/20 backdrop-blur-md border border-red-500/50 text-red-100 px-4 py-3 rounded-xl animate-shake shadow-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}
            
            {success && (
              <div className="mb-4 bg-green-500/20 backdrop-blur-md border border-green-500/50 text-green-100 px-4 py-3 rounded-xl shadow-lg">
                <div className="flex items-center">
                  <FaCheckCircle className="w-5 h-5 mr-2" />
                  {success === true ? 'Verificación exitosa. Redirigiendo al inicio de sesión...' : success}
                </div>
              </div>
            )}
            
            <form className="space-y-5" onSubmit={handleVerify}>
              {/* Campo de Email */}
              <div className="transform transition-all duration-300 hover:translate-x-1">
                <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-slate-200 mb-2">
                  Correo electrónico
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaEnvelope className={`w-5 h-5 transition-colors duration-300 ${
                      focusedInput === 'email' ? 'text-slate-300' : 'text-slate-400'
                    }`} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput('')}
                    placeholder="tu@email.com"
                    className="appearance-none block w-full pl-12 pr-4 py-3 bg-white/10 border-2 border-slate-600/50 rounded-xl text-white placeholder-slate-400 
                    focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-400 
                    hover:border-slate-500 hover:bg-white/15
                    transition-all duration-300 backdrop-blur-sm shadow-lg"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-slate-500/0 via-slate-400/10 to-slate-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Campo de Código de Verificación */}
              <div className="transform transition-all duration-300 hover:translate-x-1">
                <label htmlFor="verificationCode" className="block text-xs sm:text-sm font-semibold text-slate-200 mb-2">
                  Código de Verificación
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaKey className={`w-5 h-5 transition-colors duration-300 ${
                      focusedInput === 'verificationCode' ? 'text-slate-300' : 'text-slate-400'
                    }`} />
                  </div>
                  <input
                    id="verificationCode"
                    name="verificationCode"
                    type="text"
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    onFocus={() => setFocusedInput('verificationCode')}
                    onBlur={() => setFocusedInput('')}
                    placeholder="Ingrese el código de 6 dígitos"
                    className="appearance-none block w-full pl-12 pr-4 py-3 bg-white/10 border-2 border-slate-600/50 rounded-xl text-white placeholder-slate-400 
                    focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-400 
                    hover:border-slate-500 hover:bg-white/15
                    transition-all duration-300 backdrop-blur-sm shadow-lg"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-slate-500/0 via-slate-400/10 to-slate-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Botón de Verificar */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center items-center py-3 px-4 border-2 border-transparent rounded-xl text-sm sm:text-base font-semibold text-white 
                  bg-gradient-to-r from-slate-700 to-slate-800 
                  hover:from-slate-600 hover:to-slate-700 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 
                  disabled:from-slate-800 disabled:to-slate-900 disabled:cursor-not-allowed disabled:opacity-50
                  transform hover:scale-[1.02] active:scale-[0.98]
                  transition-all duration-300 shadow-xl hover:shadow-2xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  <span className="relative flex items-center">
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verificando...
                      </>
                    ) : (
                      <>
                        Verificar
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>

            {/* Opciones adicionales */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendDisabled || loading}
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-300 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FaRedo className="w-4 h-4" />
                {resendDisabled ? `Reenviar código (${countdown}s)` : 'Reenviar código'}
              </button>
              
              <Link 
                to="/login" 
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-300 flex items-center gap-2"
              >
                <FaArrowLeft className="w-4 h-4" />
                Volver al inicio de sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;