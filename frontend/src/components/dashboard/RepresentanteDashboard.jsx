import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const RepresentanteDashboard = () => {
  const [representante, setRepresentante] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);
  const [cuposResumen, setCuposResumen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const userData = JSON.parse(atob(token.split('.')[1]));
        
        // Obtener datos del representante
        const representanteResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/personas/${userData.personaID}`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        setRepresentante(representanteResponse.data);
        localStorage.setItem('representanteData', JSON.stringify(representanteResponse.data));
        
        // Obtener estudiantes del representante
        const estudiantesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/personas/representante/${userData.personaID}/estudiantes`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        setEstudiantes(estudiantesResponse.data);
        
        // Obtener inscripciones del representante
        const inscripcionesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/inscripciones/representante/${userData.personaID}`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        setInscripciones(inscripcionesResponse.data);
        
        // Obtener resumen de cupos
        const cuposResponse = await axios.get(`${import.meta.env.VITE_API_URL}/cupos/resumen`);
        setCuposResumen(cuposResponse.data.resumenCupos);
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar datos. Por favor, intente nuevamente.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard del Representante</h1>
            <div className="flex items-center">
              <span className="text-gray-600 mr-4">{representante?.nombre} {representante?.apellido}</span>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/login';
                }}
                className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Sección de Estudiantes */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Mis Estudiantes</h2>
                <Link
                  to="/inscripcion/nuevo-estudiante"
                  className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors"
                >
                  Inscribir Nuevo Estudiante
                </Link>
              </div>
              
              {estudiantes.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">No tiene estudiantes registrados.</p>
                  <p className="text-gray-500 mt-2">Haga clic en "Inscribir Nuevo Estudiante" para comenzar.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cédula</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {estudiantes.map((estudiante) => (
                        <tr key={estudiante.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {estudiante.nombre} {estudiante.apellido}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{estudiante.cedula}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {estudiante.grado?.nombre_grado || 'No asignado'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link to={`/estudiante/${estudiante.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                              Ver Detalles
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

                    {/* Sección de Inscripciones */}
                    <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Inscripciones Recientes</h2>
              
              {inscripciones.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">No tiene inscripciones registradas.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estudiante</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {inscripciones.map((inscripcion) => (
                        <tr key={inscripcion.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {inscripcion.estudiante.nombre} {inscripcion.estudiante.apellido}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                            {inscripcion.grado?.nombre_grado} - {inscripcion.seccion?.nombre_seccion || 'Sin sección'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              inscripcion.estado === 'aprobada' ? 'bg-green-100 text-green-800' :
                              inscripcion.estado === 'rechazada' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {inscripcion.estado.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link to={`/inscripcion/comprobante/${inscripcion.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                              Ver Comprobante
                            </Link>
                            {!inscripcion.pagado && (
                              <Link to={`/pagos/inscripcion/${inscripcion.id}`} className="text-green-600 hover:text-green-900">
                                Pagar
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          
          {/* Sección de Cupos Disponibles */}
          <div className="bg-white overflow-hidden shadow rounded-lg lg:col-span-2">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Cupos Disponibles</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacidad Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cupos Ocupados</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cupos Disponibles</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ocupación</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cuposResumen.map((cupo) => (
                      <tr key={cupo.gradoID}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{cupo.nombre_grado}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{cupo.totalCapacidad}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{cupo.totalOcupados}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{cupo.totalDisponibles}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${
                                cupo.porcentajeOcupacion > 90 ? 'bg-red-600' :
                                cupo.porcentajeOcupacion > 70 ? 'bg-yellow-600' :
                                'bg-green-600'
                              }`}
                              style={{ width: `${cupo.porcentajeOcupacion}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{cupo.porcentajeOcupacion}%</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RepresentanteDashboard;
