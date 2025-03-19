import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RepresentanteDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cuposDisponibles, setCuposDisponibles] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener información del usuario desde localStorage
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);

        // Obtener estudiantes representados
        const token = localStorage.getItem('token');
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        const estudiantesResponse = await axios.get('/api/representante/estudiantes', config);
        setEstudiantes(estudiantesResponse.data);

        // Obtener cupos disponibles por grado
        const cuposResponse = await axios.get('/api/inscripcion/cupos-disponibles', config);
        setCuposDisponibles(cuposResponse.data);
      } catch (err) {
        setError('Error al cargar los datos. Por favor, inténtelo de nuevo.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleInscribirEstudiante = () => {
    navigate('/inscripcion/nuevo-estudiante');
  };

  const handleVerDetallesEstudiante = (estudianteId) => {
    navigate(`/estudiante/${estudianteId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Cargando...</span>
          </div>
          <p className="mt-2">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-indigo-600">Brisas De Mamporal</h1>
              </div>
            </div>
            <div className="flex items-center">
              <div className="ml-3 relative">
                <div className="flex items-center">
                  <span className="mr-3 text-gray-700">{user?.nombres} {user?.apellidos}</span>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">
              Panel de Representante
            </h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <div className="px-4 py-6 sm:px-0">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6">
                  <h2 className="text-lg leading-6 font-medium text-gray-900">
                    Cupos Disponibles
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Información de cupos disponibles por grado para el período actual.
                  </p>
                </div>
                <div className="border-t border-gray-200">
                  <dl>
                    {Object.entries(cuposDisponibles).map(([grado, cupos]) => (
                      <div key={grado} className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                          {grado}
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {cupos} cupos disponibles
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                  <div>
                    <h2 className="text-lg leading-6 font-medium text-gray-900">
                      Estudiantes Representados
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Lista de estudiantes bajo su representación.
                    </p>
                  </div>
                  <button
                    onClick={handleInscribirEstudiante}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Inscribir Nuevo Estudiante
                  </button>
                </div>
                <div className="border-t border-gray-200">
                  {estudiantes.length === 0 ? (
                    <div className="px-4 py-5 text-center text-gray-500">
                      No tiene estudiantes registrados. Puede inscribir un nuevo estudiante haciendo clic en el botón "Inscribir Nuevo Estudiante".
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {estudiantes.map((estudiante) => (
                        <li key={estudiante.id} className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">
                                  {estudiante.nombres} {estudiante.apellidos}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Grado: {estudiante.grado} | Estado: {estudiante.estadoInscripcion}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleVerDetallesEstudiante(estudiante.id)}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                              Ver Detalles
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RepresentanteDashboard;
