import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowRight, FaHome } from 'react-icons/fa';

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        formData
      );
      
      // Guardar el token en localStorage
      localStorage.setItem('token', response.data.token);

      // Guarda la informacion del usuario en localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Redirigir según el tipo de usuario
      const userData = response.data.user;
      if (userData.tipo === 'representante') {
        navigate('/dashboard/representante');
      } else if (userData.tipo === 'adminWeb' || userData.tipo === 'owner' || userData.tipo === 'administrativo') {
        navigate('/admin/dashboard');
      } else if (userData.tipo === 'profesor') {
        navigate('/profesor/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      setError(err.response?.data?.message || 'Error al iniciar sesión. Verifique sus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col justify-center py-4 sm:py-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-slate-700/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-slate-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-slate-700/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 max-h-full overflow-y-auto">
        {/* Header con animación */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-down">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="bg-gradient-to-br from-slate-700 to-slate-800 p-2 sm:p-3 rounded-2xl shadow-2xl border border-slate-600/50 backdrop-blur-md transform hover:scale-105 transition-all duration-300">
              <img 
                src="/img/1.colegioLogo.png" 
                alt="Logo U.E.P. Brisas de Mamporal" 
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain"
              />
            </div>
          </div>
          <h2 className="text-center text-xl sm:text-2xl md:text-3xl font-extrabold text-white mb-1 drop-shadow-lg">
            Brisas En Línea
          </h2>
          <p className="text-center text-slate-300 text-xs sm:text-sm md:text-base">
            Inicia sesión para continuar
          </p>
          <p className="mt-2 sm:mt-3 text-center text-xs sm:text-sm text-slate-400">
            ¿No tienes una cuenta?{' '}
            <Link 
              to="/register" 
              className="font-semibold text-slate-300 hover:text-white transition-colors duration-300 underline decoration-slate-500 hover:decoration-white"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>

        {/* Formulario con animación */}
        <div className="mt-3 sm:mt-4 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up">
          <div className="bg-white/10 backdrop-blur-xl py-5 sm:py-6 px-4 sm:px-8 md:px-10 shadow-2xl sm:rounded-3xl border border-white/20">
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
            
            <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit}>
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
                  {/* Efecto de brillo en hover */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-slate-500/0 via-slate-400/10 to-slate-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Campo de Contraseña */}
              <div className="transform transition-all duration-300 hover:translate-x-1">
                <label htmlFor="password" className="block text-xs sm:text-sm font-semibold text-slate-200 mb-2">
                  Contraseña
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaLock className={`w-5 h-5 transition-colors duration-300 ${
                      focusedInput === 'password' ? 'text-slate-300' : 'text-slate-400'
                    }`} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput('')}
                    placeholder="••••••••"
                    className="appearance-none block w-full pl-12 pr-12 py-3 bg-white/10 border-2 border-slate-600/50 rounded-xl text-white placeholder-slate-400 
                    focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-400 
                    hover:border-slate-500 hover:bg-white/15
                    transition-all duration-300 backdrop-blur-sm shadow-lg"
                  />
                  {/* Botón para mostrar/ocultar contraseña */}
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
                  {/* Efecto de brillo en hover */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-slate-500/0 via-slate-400/10 to-slate-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Recordarme y Olvidó contraseña */}
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center group">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-3 w-3 sm:h-4 sm:w-4 text-slate-600 focus:ring-slate-500 border-slate-500 rounded bg-white/10 transition-all duration-300 cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-slate-300 group-hover:text-white transition-colors duration-300 cursor-pointer">
                    Recordarme
                  </label>
                </div>

                <div>
                  <a href="/recuperar-password" className="font-medium text-slate-300 hover:text-white transition-colors duration-300 underline decoration-slate-500 hover:decoration-white">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              </div>

              {/* Botón de Iniciar Sesión */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center items-center py-2.5 sm:py-3 px-4 border-2 border-transparent rounded-xl text-sm sm:text-base font-semibold text-white 
                  bg-gradient-to-r from-slate-700 to-slate-800 
                  hover:from-slate-600 hover:to-slate-700 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 
                  disabled:from-slate-800 disabled:to-slate-900 disabled:cursor-not-allowed disabled:opacity-50
                  transform hover:scale-[1.02] active:scale-[0.98]
                  transition-all duration-300 shadow-xl hover:shadow-2xl overflow-hidden"
                >
                  {/* Efecto de brillo animado */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  <span className="relative flex items-center">
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Iniciando sesión...
                      </>
                    ) : (
                      <>
                        Iniciar Sesión
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>

            {/* Divisor */}
            <div className="mt-5 sm:mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-600/50"></div>
                </div>
                <div className="relative flex justify-center text-xs sm:text-sm">
                  <span className="px-4 bg-transparent text-slate-400 font-medium">
                    O continuar con
                  </span>
                </div>
              </div>

              {/* Botón Volver al Inicio */}
              <div className="mt-4 sm:mt-5">
                <Link
                  to="/"
                  className="group w-full inline-flex justify-center items-center py-2.5 sm:py-3 px-4 border-2 border-slate-600/50 rounded-xl shadow-lg bg-white/5 backdrop-blur-sm text-sm sm:text-base font-medium text-slate-300 
                  hover:bg-white/10 hover:border-slate-500 hover:text-white
                  transform hover:scale-[1.02] active:scale-[0.98]
                  transition-all duration-300"
                >
                  <FaHome className="mr-2 w-5 h-5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                  Volver al Inicio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos de animación personalizados */}
      <style>{`
        @keyframes fade-in-down {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-5px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(5px);
          }
        }
        
        .animate-fade-in-down {
          animation: fade-in-down 0.6s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out 0.2s both;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default LoginForm;
