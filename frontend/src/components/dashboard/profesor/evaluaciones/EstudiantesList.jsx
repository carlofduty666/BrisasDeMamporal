import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaEye, FaFileAlt } from 'react-icons/fa';

const EstudiantesList = ({ profesorID, annoEscolarID, gradoID, seccionID, materiaID }) => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEstudiantes, setFilteredEstudiantes] = useState([]);

  useEffect(() => {
    if (profesorID && annoEscolarID && gradoID && seccionID) {
      fetchEstudiantes();
    }
  }, [profesorID, annoEscolarID, gradoID, seccionID]);

  useEffect(() => {
    // Filtrar estudiantes cuando cambia el término de búsqueda
    if (searchTerm.trim() === '') {
      setFilteredEstudiantes(estudiantes);
    } else {
      const filtered = estudiantes.filter(
        estudiante => 
          estudiante.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          estudiante.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
          estudiante.cedula.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEstudiantes(filtered);
    }
  }, [searchTerm, estudiantes]);

  const fetchEstudiantes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/estudiantes/grado/${gradoID}/seccion/${seccionID}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
          params: { annoEscolarID }
        }
      );
      
      setEstudiantes(response.data);
      setFilteredEstudiantes(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error al cargar estudiantes:', err);
      setError('Error al cargar estudiantes. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };

  const handleVerEstudiante = (estudianteID) => {
    window.open(`/admin/estudiantes/${estudianteID}`, '_blank');
  };

  const handleVerCalificaciones = (estudianteID) => {
    window.open(`/profesor/calificaciones/estudiante/${estudianteID}?materiaID=${materiaID}`, '_blank');
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Estudiantes</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {!gradoID || !seccionID ? (
        <div className="bg-yellow-50 p-4 rounded-md">
          <p className="text-yellow-700">
            Seleccione un grado y sección para ver la lista de estudiantes.
          </p>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre, apellido o cédula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          
          {filteredEstudiantes.length === 0 ? (
            <div className="bg-yellow-50 p-4 rounded-md">
              <p className="text-yellow-700">
                No se encontraron estudiantes con los criterios de búsqueda.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cédula
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Género
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEstudiantes.map((estudiante) => (
                    <tr key={estudiante.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {estudiante.nombre} {estudiante.apellido}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {estudiante.cedula}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {estudiante.genero ? estudiante.genero.charAt(0).toUpperCase() + estudiante.genero.slice(1) : 'No especificado'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleVerEstudiante(estudiante.id)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Ver detalles"
                          >
                            <FaEye />
                          </button>
                          
                          {materiaID && (
                            <button
                              onClick={() => handleVerCalificaciones(estudiante.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Ver calificaciones"
                            >
                              <FaFileAlt />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EstudiantesList;