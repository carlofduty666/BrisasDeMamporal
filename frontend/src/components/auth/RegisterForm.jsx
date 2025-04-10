import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const RegisterForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determinar el tipo de registro basado en la URL
  const isProfesorRegister = location.pathname === '/registro-profesor';
  
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
  const [profesorEncontrado, setProfesorEncontrado] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [paso, setPaso] = useState(isProfesorRegister ? 1 : 2); // Paso 1: Verificar cédula, Paso 2: Completar registro

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Función para buscar al profesor por cédula (solo para registro de profesores)
  const buscarProfesor = async () => {
    if (!formData.cedula) {
      setError('Por favor, ingrese su número de cédula');
      return;
    }

    try {
      setBuscando(true);
      setError('');
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/personas/verificar-profesor/${formData.cedula}`
      );
      
      if (response.data.existe && !response.data.yaRegistrado) {
        setProfesorEncontrado(response.data.profesor);
        // Pre-llenar el email si está disponible
        if (response.data.profesor.email) {
          setFormData({
            ...formData,
            email: response.data.profesor.email,
            nombre: response.data.profesor.nombre,
            apellido: response.data.profesor.apellido
          });
        }
        setPaso(2); // Avanzar al paso de completar registro
      } else if (response.data.yaRegistrado) {
        setError('Este profesor ya tiene una cuenta registrada. Por favor, inicie sesión o recupere su contraseña.');
      } else {
        setError('No se encontró un profesor registrado con esta cédula. Por favor, contacte a la administración.');
      }
    } catch (err) {
      console.error('Error al verificar profesor:', err);
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
      
      if (isProfesorRegister) {
        // Registro de profesor (vinculando a persona existente)
        if (!profesorEncontrado) {
          setError('Debe verificar su cédula primero');
          setLoading(false);
          return;
        }
        
        response = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/register-profesor`,
          {
            personaID: profesorEncontrado.id,
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
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isProfesorRegister ? 'Registro de Profesor' : 'Registro de Representante'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          ¿Ya tiene una cuenta?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Inicie sesión aquí
          </Link>
        </p>
        {!isProfesorRegister && (
          <p className="mt-2 text-center text-sm text-gray-600">
            ¿Es Profesor?{' '}
            <Link to="/registro-profesor" className="font-medium text-indigo-600 hover:text-indigo-500">
              Regístrese aquí
            </Link>
          </p>
        )}
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
              Registro exitoso. Redirigiendo a la página de verificación...
            </div>
          )}
          
          {/* Paso 1: Verificar cédula (solo para profesores) */}
          {isProfesorRegister && paso === 1 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Verificar Identidad</h3>
              <div className="flex items-end space-x-4">
                <div className="flex-grow">
                  <label htmlFor="cedula" className="block text-sm font-medium text-gray-700">
                    Cédula/Documento
                  </label>
                  <div className="mt-1">
                    <input
                      id="cedula"
                      name="cedula"
                      type="text"
                      required
                      value={formData.cedula}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={buscarProfesor}
                  disabled={buscando || !formData.cedula}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                >
                  {buscando ? 'Verificando...' : 'Verificar'}
                </button>
              </div>
            </div>
          )}
          
          {/* Paso 2: Formulario de registro */}
          {paso === 2 && (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Mostrar información del profesor encontrado (solo para profesores) */}
              {isProfesorRegister && profesorEncontrado && (
                <div className="bg-green-50 p-4 rounded-md mb-4">
                  <p className="text-green-700">
                    Profesor verificado: <strong>{profesorEncontrado.nombre} {profesorEncontrado.apellido}</strong>
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    Complete los siguientes datos para crear su cuenta.
                  </p>
                </div>
              )}

              {/* Campos de nombre y apellido (solo para representantes) */}
              {!isProfesorRegister && (
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                      Nombres
                    </label>
                    <div className="mt-1">
                      <input
                        id="nombre"
                        name="nombre"
                        type="text"
                        required
                        value={formData.nombre}
                        onChange={handleChange}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">
                      Apellidos
                    </label>
                    <div className="mt-1">
                      <input
                        id="apellido"
                        name="apellido"
                        type="text"
                        required
                        value={formData.apellido}
                        onChange={handleChange}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Campo de cédula (solo para representantes) */}
              {!isProfesorRegister && (
                <div>
                  <label htmlFor="cedula" className="block text-sm font-medium text-gray-700">
                    Cédula/Documento
                  </label>
                  <div className="mt-1">
                    <input
                      id="cedula"
                      name="cedula"
                      type="text"
                      required
                      value={formData.cedula}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Email (para ambos) */}
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
                    value={formData.email}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    readOnly={isProfesorRegister && profesorEncontrado?.email}
                  />
                </div>
              </div>

              {/* Campos adicionales solo para representantes */}
              {!isProfesorRegister && (
                <>
                  <div>
                    <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
                      Teléfono
                    </label>
                    <div className="mt-1">
                      <input
                        id="telefono"
                        name="telefono"
                        type="tel"
                        required
                        value={formData.telefono}
                        onChange={handleChange}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">
                      Dirección
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="direccion"
                        name="direccion"
                        rows="2"
                        required
                        value={formData.direccion}
                        onChange={handleChange}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      ></textarea>
                    </div>
                  </div>
                </>
              )}

              {/* Contraseña y confirmación (para ambos) */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmar Contraseña
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Procesando...' : 'Registrarse'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  O continuar con
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <Link
                to="/"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;