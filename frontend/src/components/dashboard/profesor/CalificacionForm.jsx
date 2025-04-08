import { useState, useEffect } from 'react';
import { FaSave, FaTimes } from 'react-icons/fa';

const CalificacionForm = ({ 
  calificacion, 
  profesorID, 
  annoEscolarID, 
  gradoID, 
  seccionID, 
  materiaID,
  evaluaciones,
  estudiantes,
  onSubmit, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    valor: '',
    observaciones: '',
    evaluacionID: '',
    estudianteID: '',
    fecha: new Date().toISOString().split('T')[0]
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Si estamos editando, cargar los datos de la calificación
    if (calificacion) {
      setFormData({
        valor: calificacion.valor || '',
        observaciones: calificacion.observaciones || '',
        evaluacionID: calificacion.evaluacionID || '',
        estudianteID: calificacion.estudianteID || '',
        fecha: calificacion.fecha ? new Date(calificacion.fecha).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      });
    } else {
      // Si es una nueva calificación, resetear el formulario
      setFormData({
        valor: '',
        observaciones: '',
        evaluacionID: '',
        estudianteID: '',
        fecha: new Date().toISOString().split('T')[0]
      });
    }
  }, [calificacion]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar campos requeridos
    if (!formData.valor || !formData.evaluacionID || !formData.estudianteID) {
      setError('Por favor, complete todos los campos requeridos.');
      return;
    }
    
    // Validar que la calificación sea un número entre 0 y 20
    const valor = parseFloat(formData.valor);
    if (isNaN(valor) || valor < 0 || valor > 20) {
      setError('La calificación debe ser un número entre 0 y 20.');
      return;
    }
    
    // Enviar datos al componente padre
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {calificacion ? 'Editar Calificación' : 'Nueva Calificación'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500"
          >
            <FaTimes />
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estudiante <span className="text-red-500">*</span>
              </label>
              <select
                name="estudianteID"
                value={formData.estudianteID}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
                disabled={loading || !!calificacion}
              >
                <option value="">Seleccione un estudiante</option>
                {estudiantes.map((estudiante) => (
                  <option key={estudiante.id} value={estudiante.id}>
                    {estudiante.nombre} {estudiante.apellido} - {estudiante.cedula}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Evaluación <span className="text-red-500">*</span>
              </label>
              <select
                name="evaluacionID"
                value={formData.evaluacionID}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
                disabled={loading || !!calificacion}
              >
                <option value="">Seleccione una evaluación</option>
                {evaluaciones
                  .filter(ev => !materiaID || ev.materiaID === materiaID)
                  .map((evaluacion) => (
                    <option key={evaluacion.id} value={evaluacion.id}>
                      {evaluacion.titulo} - {evaluacion.tipo}
                    </option>
                  ))
                }
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Calificación (0-20) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="valor"
                min="0"
                max="20"
                step="0.1"
                value={formData.valor}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha
              </label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones
              </label>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              ></textarea>
            </div>
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
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={loading}
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
                  <FaSave className="mr-2" /> {calificacion ? 'Actualizar' : 'Guardar'}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CalificacionForm;
