import { FaTimes } from 'react-icons/fa';

const ModalEstadisticas = ({ isOpen, onClose, estadisticas }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto animate-scaleIn transition-all duration-300 ease-in-out">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Estadísticas Completas</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen General</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{estadisticas.estadisticasGenerales.totalEvaluaciones}</p>
                <p className="text-sm text-gray-600">Total Evaluaciones</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{estadisticas.estadisticasGenerales.totalCalificaciones}</p>
                <p className="text-sm text-gray-600">Total Calificaciones</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{estadisticas.estadisticasGenerales.promedioGeneral}</p>
                <p className="text-sm text-gray-600">Promedio General</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{estadisticas.estadisticasGenerales.evaluacionesPendientes}</p>
                <p className="text-sm text-gray-600">Pendientes</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Estadísticas por Materia</h3>
            {estadisticas.estadisticasPorMateria.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay datos de materias disponibles</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Materia
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Evaluaciones
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Calificaciones
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Promedio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pendientes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {estadisticas.estadisticasPorMateria.map((materia) => (
                      <tr key={materia.materiaID}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {materia.asignatura}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {materia.totalEvaluaciones}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {materia.totalCalificaciones}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`font-medium ${
                            materia.promedioMateria >= 14 ? 'text-green-600' :
                            materia.promedioMateria >= 10 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {materia.promedioMateria}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {materia.evaluacionesPendientes}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalEstadisticas;
