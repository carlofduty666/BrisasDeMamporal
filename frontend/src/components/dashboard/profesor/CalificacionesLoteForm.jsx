import { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaCheck } from 'react-icons/fa';

const CalificacionesLoteForm = ({ 
  evaluacion, 
  estudiantes, 
  calificacionesExistentes,
  onSubmit, 
  onCancel 
}) => {
  const [calificaciones, setCalificaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [allValid, setAllValid] = useState(true);

  useEffect(() => {
    // Inicializar el array de calificaciones con los estudiantes
    const initialCalificaciones = estudiantes.map(estudiante => {
      // Buscar si ya existe una calificación para este estudiante y evaluación
      const calificacionExistente = calificacionesExistentes.find(
        c => c.estudianteID === estudiante.id
      );
      
      return {
        id: calificacionExistente?.id || null,
        estudianteID: estudiante.id,
        evaluacionID: evaluacion.id,
        valor: calificacionExistente?.valor || '',
        observaciones: calificacionExistente?.observaciones || '',
        fecha: new Date().toISOString().split('T')[0],
        nombreEstudiante: `${estudiante.nombre} ${estudiante.apellido}`,
        cedulaEstudiante: estudiante.cedula,
        isValid: calificacionExistente ? true : false
      };
    });
    
    setCalificaciones(initialCalificaciones);
  }, [estudiantes, evaluacion, calificacionesExistentes]);

  useEffect(() => {
    // Verificar si todas las calificaciones son válidas
    const valid = calificaciones.every(cal => cal.isValid);
    setAllValid(valid);
  }, [calificaciones]);

  const handleCalificacionChange = (index, value) => {
    const updatedCalificaciones = [...calificaciones];
    
    // Validar que sea un número entre 0 y 20
    const numValue = parseFloat(value);
    const isValid = !isNaN(numValue) && numValue >= 0 && numValue <= 20;
    
    updatedCalificaciones[index] = {
      ...updatedCalificaciones[index],
      valor: value,
      isValid
    };
    
    setCalificaciones(updatedCalificaciones);
  };

  const handleObservacionesChange = (index, value) => {
    const updatedCalificaciones = [...calificaciones];
    updatedCalificaciones[index] = {
      ...updatedCalificaciones[index],
      observaciones: value
    };
    
    setCalificaciones(updatedCalificaciones);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Verificar que todas las calificaciones sean válidas
    if (!allValid) {
      setError('Por favor, corrija las calificaciones inválidas antes de guardar.');
      return;
    }
    
    // Enviar solo las calificaciones que tienen valor
    const calificacionesConValor = calificaciones.filter(cal => cal.valor !== '');
    
    // Enviar datos al componente padre
    onSubmit(calificacionesConValor);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Calificar: {evaluacion.titulo}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500"
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="mb-4 bg-gray-50 p-3 rounded-md">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Tipo:</span> {evaluacion.tipo}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-medium">Fecha:</span> {new Date(evaluacion.fecha).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-medium">Porcentaje:</span> {evaluacion.porcentaje}%
          </p>
          {evaluacion.descripcion && (
            <p className="text-sm text-gray-700 mt-2">
              <span className="font-medium">Descripción:</span> {evaluacion.descripcion}
            </p>
          )}
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estudiante
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cédula
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Calificación (0-20)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Observaciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {calificaciones.map((calificacion, index) => (
                  <tr key={calificacion.estudianteID}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {calificacion.nombreEstudiante}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {calificacion.cedulaEstudiante}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <input
                          type="number"
                          min="0"
                          max="20"
                          step="0.1"
                          value={calificacion.valor}
                          onChange={(e) => handleCalificacionChange(index, e.target.value)}
                          className={`w-20 px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                            calificacion.valor && !calificacion.isValid ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {calificacion.valor && calificacion.isValid && (
                          <FaCheck className="ml-2 text-green-500" />
                        )}
                      </div>
                      {calificacion.valor && !calificacion.isValid && (
                        <p className="text-xs text-red-500 mt-1">
                          Debe ser entre 0 y 20
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={calificacion.observaciones}
                        onChange={(e) => handleObservacionesChange(index, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Opcional"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                allValid ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-300 cursor-not-allowed'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              disabled={!allValid || loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </span>
              ) : (
                <span className="flex items-center">
                  <FaSave className="mr-2" /> Guardar Calificaciones
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CalificacionesLoteForm;
