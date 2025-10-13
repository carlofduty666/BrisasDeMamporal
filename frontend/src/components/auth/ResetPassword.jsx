import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { resetPassword } from '../../services/auth.service';
import { FaEnvelope, FaKey, FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState('');

  useEffect(() => {
    // Si viene de la página de recuperación, obtener el email
    if (location.state?.email) {
      setFormData(prev => ({ ...prev, email: location.state.email }));
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validar que las contraseñas coincidan
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      const response = await resetPassword(
        formData.email,
        formData.code,
        formData.newPassword
      );
      
      setSuccess(response.message);
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Contraseña restablecida correctamente. Ahora puedes iniciar sesión.' } 
        });
      }, 3000);
    } catch (err) {
      setError(err.message || 'Error al restablecer la contraseña');
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
            Restablecer Contraseña
          </h2>
          <p className="text-center text-slate-300 text-sm sm:text-base">
            Ingresa el código que recibiste por correo y tu nueva contraseña.
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
                  {success}
                </div>
              </div>
            )}
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Campo de Email */}
              <div className="transform transition-all duration-300 hover:translate-x-1">
                <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-slate-200 mb-2">
                  Correo Electrónico
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
                    value={formData.email}
                    onChange={handleChange}
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

              {/* Campo de Código de Recuperación */}
              <div className="transform transition-all duration-300 hover:translate-x-1">
                <label htmlFor="code" className="block text-xs sm:text-sm font-semibold text-slate-200 mb-2">
                  Código de Recuperación
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaKey className={`w-5 h-5 transition-colors duration-300 ${
                      focusedInput === 'code' ? 'text-slate-300' : 'text-slate-400'
                    }`} />
                  </div>
                  <input
                    id="code"
                    name="code"
                    type="text"
                    required
                    value={formData.code}
                    onChange={handleChange}
                    onFocus={() => setFocusedInput('code')}
                    onBlur={() => setFocusedInput('')}
                    placeholder="Ingrese el código recibido"
                    className="appearance-none block w-full pl-12 pr-4 py-3 bg-white/10 border-2 border-slate-600/50 rounded-xl text-white placeholder-slate-400 
                    focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-400 
                    hover:border-slate-500 hover:bg-white/15
                    transition-all duration-300 backdrop-blur-sm shadow-lg"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-slate-500/0 via-slate-400/10 to-slate-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Campo de Nueva Contraseña */}
              <div className="transform transition-all duration-300 hover:translate-x-1">
                <label htmlFor="newPassword" className="block text-xs sm:text-sm font-semibold text-slate-200 mb-2">
                  Nueva Contraseña
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaLock className={`w-5 h-5 transition-colors duration-300 ${
                      focusedInput === 'newPassword' ? 'text-slate-300' : 'text-slate-400'
                    }`} />
                  </div>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.newPassword}
                    onChange={handleChange}
                    onFocus={() => setFocusedInput('newPassword')}
                    onBlur={() => setFocusedInput('')}
                    placeholder="••••••••"
                    className="appearance-none block w-full pl-12 pr-12 py-3 bg-white/10 border-2 border-slate-600/50 rounded-xl text-white placeholder-slate-400 
                    focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-400 
                    hover:border-slate-500 hover:bg-white/15
                    transition-all duration-300 backdrop-blur-sm shadow-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-200 transition-colors duration-300 focus:outline-none"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="w-5 h-5" />
                    ) : (
                      <FaEye className="w-5 h-5" />
                    )}
                  </button>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-slate-500/0 via-slate-400/10 to-slate-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Campo de Confirmar Contraseña */}
              <div className="transform transition-all duration-300 hover:translate-x-1">
                <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-semibold text-slate-200 mb-2">
                  Confirmar Contraseña
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaLock className={`w-5 h-5 transition-colors duration-300 ${
                      focusedInput === 'confirmPassword' ? 'text-slate-300' : 'text-slate-400'
                    }`} />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onFocus={() => setFocusedInput('confirmPassword')}
                    onBlur={() => setFocusedInput('')}
                    placeholder="••••••••"
                    className="appearance-none block w-full pl-12 pr-12 py-3 bg-white/10 border-2 border-slate-600/50 rounded-xl text-white placeholder-slate-400 
                    focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-400 
                    hover:border-slate-500 hover:bg-white/15
                    transition-all duration-300 backdrop-blur-sm shadow-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-200 transition-colors duration-300 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash className="w-5 h-5" />
                    ) : (
                      <FaEye className="w-5 h-5" />
                    )}
                  </button>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-slate-500/0 via-slate-400/10 to-slate-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Botón de Restablecer Contraseña */}
              <div className="pt-2">
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
                        Procesando...
                      </>
                    ) : (
                      <>
                        Restablecer Contraseña
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>

            {/* Divisor */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-600/50"></div>
                </div>
                <div className="relative flex justify-center text-xs sm:text-sm">
                  <span className="px-4 bg-transparent text-slate-400 font-medium">
                    ¿Recordaste tu contraseña?
                  </span>
                </div>
              </div>

              {/* Botón Volver a Iniciar Sesión */}
              <div className="mt-5">
                <button
                  onClick={() => navigate('/login')}
                  className="group w-full inline-flex justify-center items-center py-3 px-4 border-2 border-slate-600/50 rounded-xl shadow-lg bg-white/5 backdrop-blur-sm text-sm sm:text-base font-medium text-slate-300 
                  hover:bg-white/10 hover:border-slate-500 hover:text-white
                  transform hover:scale-[1.02] active:scale-[0.98]
                  transition-all duration-300"
                >
                  <FaArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                  Volver a Iniciar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;