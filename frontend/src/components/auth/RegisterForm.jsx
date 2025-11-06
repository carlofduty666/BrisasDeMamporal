import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaIdCard, FaEnvelope, FaPhone, FaMapMarkerAlt, FaLock, FaEye, FaEyeSlash, FaUserTie, FaHome, FaCheckCircle, FaSearch } from 'react-icons/fa';

const RegisterForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determinar el tipo de registro basado en la URL
  const isProfesorRegister = location.pathname === '/registro-profesor';
  const isEmpleadoAdminRegister = location.pathname === '/registro-empleado-admin';
  const isPersonalRegister = isProfesorRegister || isEmpleadoAdminRegister;
  
  // Determinar el tipo de personal y textos según la ruta
  const tipoPersonal = isProfesorRegister ? 'profesor' : isEmpleadoAdminRegister ? 'administrativo' : null;
  const getTitulo = () => {
    if (isProfesorRegister) return 'Registro de Profesor';
    if (isEmpleadoAdminRegister) return 'Registro de Personal Administrativo';
    return 'Registro de Representante';
  };
  const getIconoTitulo = () => {
    if (isProfesorRegister || isEmpleadoAdminRegister) return <FaUserTie className="w-6 h-6 sm:w-8 sm:h-8" />;
    return <FaUser className="w-6 h-6 sm:w-8 sm:h-8" />;
  };
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
    email: '',
    telefono: '',
    direccion: '',
    password: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [personalEncontrado, setPersonalEncontrado] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [paso, setPaso] = useState(isPersonalRegister ? 1 : 2); // Paso 1: Verificar cédula, Paso 2: Completar registro
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Función para buscar personal por cédula (profesor, empleado administrativo, etc)
  const buscarPersonal = async () => {
    if (!formData.cedula) {
      setError('Por favor, ingrese su número de cédula');
      return;
    }

    try {
      setBuscando(true);
      setError('');
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/personas/verificar-personal/${tipoPersonal}/${formData.cedula}`
      );
      
      if (response.data.existe && !response.data.yaRegistrado) {
        setPersonalEncontrado(response.data.persona);
        // Pre-llenar el email si está disponible
        if (response.data.persona.email) {
          setFormData({
            ...formData,
            email: response.data.persona.email,
            nombre: response.data.persona.nombre,
            apellido: response.data.persona.apellido
          });
        }
        setPaso(2); // Avanzar al paso de completar registro
      } else if (response.data.yaRegistrado) {
        setError(`Este ${tipoPersonal} ya tiene una cuenta registrada. Por favor, inicie sesión o recupere su contraseña.`);
      } else {
        setError(`No se encontró ${tipoPersonal} registrado con esta cédula. Por favor, contacte a la administración.`);
      }
    } catch (err) {
      console.error('Error al verificar personal:', err);
      setError(err.response?.data?.message || 'Error al verificar. Por favor, intente nuevamente.');
    } finally {
      setBuscando(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      let response;
      
      if (isPersonalRegister) {
        // Registro de personal (profesor, empleado administrativo, etc - vinculando a persona existente)
        if (!personalEncontrado) {
          setError(`Debe verificar su cédula primero`);
          setLoading(false);
          return;
        }
        
        // Determinar el endpoint según el tipo
        const endpoint = isProfesorRegister 
          ? '/auth/register-profesor'
          : '/auth/register-empleado-admin';
        
        response = await axios.post(
          `${import.meta.env.VITE_API_URL}${endpoint}`,
          {
            personaID: personalEncontrado.id,
            email: formData.email,
            password: formData.password
          }
        );
      } else {
        // Registro de representante (normal)
        response = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/register`,
          {
            ...formData,
            tipo: 'representante' // Tipo fijo para representantes
          }
        );
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/verificacion-email', { state: { email: formData.email } });
      }, 2000);
    } catch (err) {
      console.error('Error al registrar:', err);
      setError(err.response?.data?.message || 'Error al registrar. Por favor, intente nuevamente.');
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
      <div className="relative z-10 max-h-full overflow-y-auto">
        {/* Header con animación */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-down">
          <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-2 drop-shadow-lg">
            <span className="flex items-center justify-center gap-2">
              {getIconoTitulo()}
              {getTitulo()}
            </span>
          </h2>
          <p className="text-center text-slate-300 text-sm sm:text-base">
            ¿Ya tiene una cuenta?{' '}
            <Link 
              to="/login" 
              className="font-semibold text-slate-300 hover:text-white transition-colors duration-300 underline decoration-slate-500 hover:decoration-white"
            >
              Inicie sesión aquí
            </Link>
          </p>
          {!isPersonalRegister && (
            <p className="mt-2 text-center text-xs sm:text-sm text-slate-400">
              ¿Es Profesor?{' '}
              <Link 
                to="/registro-profesor" 
                className="font-semibold text-slate-300 hover:text-white transition-colors duration-300 underline decoration-slate-500 hover:decoration-white"
              >
                Regístrese aquí
              </Link>
            </p>
          )}
          {!isPersonalRegister && (
            <p className="mt-1 text-center text-xs sm:text-sm text-slate-400">
              ¿Es Personal Administrativo?{' '}
              <Link 
                to="/registro-empleado-admin" 
                className="font-semibold text-slate-300 hover:text-white transition-colors duration-300 underline decoration-slate-500 hover:decoration-white"
              >
                Regístrese aquí
              </Link>
            </p>
          )}
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
                  Registro exitoso. Redirigiendo a la página de verificación...
                </div>
              </div>
            )}
            
            {/* Paso 1: Verificar cédula (solo para personal) */}
            {isPersonalRegister && paso === 1 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FaSearch className="w-5 h-5" />
                  Verificar Identidad
                </h3>
                <div className="flex flex-col sm:flex-row items-end space-y-3 sm:space-y-0 sm:space-x-3">
                  <div className="flex-grow w-full">
                    <label htmlFor="cedula" className="block text-xs sm:text-sm font-semibold text-slate-200 mb-2">
                      Cédula/Documento
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaIdCard className={`w-5 h-5 transition-colors duration-300 ${
                          focusedInput === 'cedula' ? 'text-slate-300' : 'text-slate-400'
                        }`} />
                      </div>
                      <input
                        id="cedula"
                        name="cedula"
                        type="text"
                        required
                        value={formData.cedula}
                        onChange={handleChange}
                        onFocus={() => setFocusedInput('cedula')}
                        onBlur={() => setFocusedInput('')}
                        placeholder="Ingrese su cédula"
                        className="appearance-none block w-full pl-12 pr-4 py-3 bg-white/10 border-2 border-slate-600/50 rounded-xl text-white placeholder-slate-400 
                        focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-400 
                        hover:border-slate-500 hover:bg-white/15
                        transition-all duration-300 backdrop-blur-sm shadow-lg"
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-slate-500/0 via-slate-400/10 to-slate-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={buscarPersonal}
                    disabled={buscando || !formData.cedula}
                    className="group relative w-full sm:w-auto flex justify-center items-center py-3 px-6 border-2 border-transparent rounded-xl text-sm font-semibold text-white 
                    bg-gradient-to-r from-slate-700 to-slate-800 
                    hover:from-slate-600 hover:to-slate-700 
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 
                    disabled:from-slate-800 disabled:to-slate-900 disabled:cursor-not-allowed disabled:opacity-50
                    transform hover:scale-[1.02] active:scale-[0.98]
                    transition-all duration-300 shadow-xl hover:shadow-2xl overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <span className="relative flex items-center gap-2">
                      {buscando ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Verificando...
                        </>
                      ) : (
                        <>
                          <FaSearch className="w-4 h-4" />
                          Verificar
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </div>
            )}
            
            {/* Paso 2: Formulario de registro */}
            {paso === 2 && (
              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Mostrar información del personal encontrado (para personal) */}
                {isPersonalRegister && personalEncontrado && (
                  <div className="bg-green-500/20 backdrop-blur-md border border-green-500/50 p-4 rounded-xl mb-4">
                    <p className="text-green-100 flex items-center gap-2">
                      <FaCheckCircle className="w-5 h-5" />
                      <span>
                        {isProfesorRegister ? 'Profesor' : 'Personal Administrativo'} verificado: <strong>{personalEncontrado.nombre} {personalEncontrado.apellido}</strong>
                      </span>
                    </p>
                    <p className="text-sm text-green-200 mt-1">
                      Complete los siguientes datos para crear su cuenta.
                    </p>
                  </div>
                )}

                {/* Campos de nombre y apellido (solo para representantes) */}
                {!isPersonalRegister && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="transform transition-all duration-300 hover:translate-x-1">
                      <label htmlFor="nombre" className="block text-xs sm:text-sm font-semibold text-slate-200 mb-2">
                        Nombres
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FaUser className={`w-5 h-5 transition-colors duration-300 ${
                            focusedInput === 'nombre' ? 'text-slate-300' : 'text-slate-400'
                          }`} />
                        </div>
                        <input
                          id="nombre"
                          name="nombre"
                          type="text"
                          required
                          value={formData.nombre}
                          onChange={handleChange}
                          onFocus={() => setFocusedInput('nombre')}
                          onBlur={() => setFocusedInput('')}
                          placeholder="Juan"
                          className="appearance-none block w-full pl-12 pr-4 py-3 bg-white/10 border-2 border-slate-600/50 rounded-xl text-white placeholder-slate-400 
                          focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-400 
                          hover:border-slate-500 hover:bg-white/15
                          transition-all duration-300 backdrop-blur-sm shadow-lg"
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-slate-500/0 via-slate-400/10 to-slate-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    </div>

                    <div className="transform transition-all duration-300 hover:translate-x-1">
                      <label htmlFor="apellido" className="block text-xs sm:text-sm font-semibold text-slate-200 mb-2">
                        Apellidos
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FaUser className={`w-5 h-5 transition-colors duration-300 ${
                            focusedInput === 'apellido' ? 'text-slate-300' : 'text-slate-400'
                          }`} />
                        </div>
                        <input
                          id="apellido"
                          name="apellido"
                          type="text"
                          required
                          value={formData.apellido}
                          onChange={handleChange}
                          onFocus={() => setFocusedInput('apellido')}
                          onBlur={() => setFocusedInput('')}
                          placeholder="Pérez"
                          className="appearance-none block w-full pl-12 pr-4 py-3 bg-white/10 border-2 border-slate-600/50 rounded-xl text-white placeholder-slate-400 
                          focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-400 
                          hover:border-slate-500 hover:bg-white/15
                          transition-all duration-300 backdrop-blur-sm shadow-lg"
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-slate-500/0 via-slate-400/10 to-slate-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Campo de cédula (solo para representantes) */}
                {!isPersonalRegister && (
                  <div className="transform transition-all duration-300 hover:translate-x-1">
                    <label htmlFor="cedula" className="block text-xs sm:text-sm font-semibold text-slate-200 mb-2">
                      Cédula/Documento
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaIdCard className={`w-5 h-5 transition-colors duration-300 ${
                          focusedInput === 'cedula' ? 'text-slate-300' : 'text-slate-400'
                        }`} />
                      </div>
                      <input
                        id="cedula"
                        name="cedula"
                        type="text"
                        required
                        value={formData.cedula}
                        onChange={handleChange}
                        onFocus={() => setFocusedInput('cedula')}
                        onBlur={() => setFocusedInput('')}
                        placeholder="V-12345678"
                        className="appearance-none block w-full pl-12 pr-4 py-3 bg-white/10 border-2 border-slate-600/50 rounded-xl text-white placeholder-slate-400 
                        focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-400 
                        hover:border-slate-500 hover:bg-white/15
                        transition-all duration-300 backdrop-blur-sm shadow-lg"
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-slate-500/0 via-slate-400/10 to-slate-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>
                )}

                {/* Email (para ambos) */}
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
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedInput('email')}
                      onBlur={() => setFocusedInput('')}
                      placeholder="tu@email.com"
                      readOnly={isPersonalRegister && personalEncontrado?.email}
                      className="appearance-none block w-full pl-12 pr-4 py-3 bg-white/10 border-2 border-slate-600/50 rounded-xl text-white placeholder-slate-400 
                      focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-400 
                      hover:border-slate-500 hover:bg-white/15
                      transition-all duration-300 backdrop-blur-sm shadow-lg read-only:opacity-70 read-only:cursor-not-allowed"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-slate-500/0 via-slate-400/10 to-slate-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>

                {/* Campos adicionales solo para representantes */}
                {!isPersonalRegister && (
                  <>
                    <div className="transform transition-all duration-300 hover:translate-x-1">
                      <label htmlFor="telefono" className="block text-xs sm:text-sm font-semibold text-slate-200 mb-2">
                        Teléfono
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FaPhone className={`w-5 h-5 transition-colors duration-300 ${
                            focusedInput === 'telefono' ? 'text-slate-300' : 'text-slate-400'
                          }`} />
                        </div>
                        <input
                          id="telefono"
                          name="telefono"
                          type="tel"
                          required
                          value={formData.telefono}
                          onChange={handleChange}
                          onFocus={() => setFocusedInput('telefono')}
                          onBlur={() => setFocusedInput('')}
                          placeholder="0412-1234567"
                          className="appearance-none block w-full pl-12 pr-4 py-3 bg-white/10 border-2 border-slate-600/50 rounded-xl text-white placeholder-slate-400 
                          focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-400 
                          hover:border-slate-500 hover:bg-white/15
                          transition-all duration-300 backdrop-blur-sm shadow-lg"
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-slate-500/0 via-slate-400/10 to-slate-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    </div>

                    <div className="transform transition-all duration-300 hover:translate-x-1">
                      <label htmlFor="direccion" className="block text-xs sm:text-sm font-semibold text-slate-200 mb-2">
                        Dirección
                      </label>
                      <div className="relative group">
                        <div className="absolute top-3 left-0 pl-4 flex items-start pointer-events-none">
                          <FaMapMarkerAlt className={`w-5 h-5 transition-colors duration-300 ${
                            focusedInput === 'direccion' ? 'text-slate-300' : 'text-slate-400'
                          }`} />
                        </div>
                        <textarea
                          id="direccion"
                          name="direccion"
                          rows="2"
                          required
                          value={formData.direccion}
                          onChange={handleChange}
                          onFocus={() => setFocusedInput('direccion')}
                          onBlur={() => setFocusedInput('')}
                          placeholder="Ingrese su dirección completa"
                          className="appearance-none block w-full pl-12 pr-4 py-3 bg-white/10 border-2 border-slate-600/50 rounded-xl text-white placeholder-slate-400 
                          focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-400 
                          hover:border-slate-500 hover:bg-white/15
                          transition-all duration-300 backdrop-blur-sm shadow-lg resize-none"
                        ></textarea>
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-slate-500/0 via-slate-400/10 to-slate-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    </div>
                  </>
                )}

                {/* Contraseña y confirmación (para ambos) */}
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
                      autoComplete="new-password"
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

                {/* Botón de Registro */}
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
                          Registrarse
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </form>
            )}

            {/* Divisor */}
            <div className="mt-6">
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
              <div className="mt-5">
                <Link
                  to="/"
                  className="group w-full inline-flex justify-center items-center py-3 px-4 border-2 border-slate-600/50 rounded-xl shadow-lg bg-white/5 backdrop-blur-sm text-sm sm:text-base font-medium text-slate-300 
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
    </div>
  );
};

export default RegisterForm;