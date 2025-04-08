import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaSave, FaTimes, FaUpload } from 'react-icons/fa';

const EvaluacionForm = ({ 
  evaluacion, 
  profesorID, 
  annoEscolarID, 
  gradoID: preselectedGradoID, 
  seccionID: preselectedSeccionID, 
  materiaID: preselectedMateriaID,
  onSubmit, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo: '',
    fecha: '',
    porcentaje: '',
    lapso: '',
    profesorID: profesorID,
    gradoID: preselectedGradoID || '',
    seccionID: preselectedSeccionID || '',
    materiaID: preselectedMateriaID || '',
    annoEscolarID: annoEscolarID,
    archivo: null
  });
  
  const [grados, setGrados] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Si estamos editando, cargar los datos de la evaluación
    if (evaluacion) {
      setFormData({
        titulo: evaluacion.titulo || '',
        descripcion: evaluacion.descripcion || '',
        tipo: evaluacion.tipo || '',
        fecha: evaluacion.fecha ? new Date(evaluacion.fecha).toISOString().split('T')[0] : '',
        porcentaje: evaluacion.porcentaje || '',
        lapso: evaluacion.lapso || '',
        profesorID: evaluacion.profesorID || profesorID,
        gradoID: evaluacion.gradoID || preselectedGradoID || '',
        seccionID: evaluacion.seccionID || preselectedSeccionID || '',
        materiaID: evaluacion.materiaID || preselectedMateriaID || '',
        annoEscolarID: evaluacion.annoEscolarID || annoEscolarID,
        archivo: null
      });
    }
    
    // Cargar datos necesarios para el formulario
    fetchFormData();
  }, [evaluacion, profesorID, annoEscolarID]);

  const fetchFormData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Obtener grados asignados al profesor
      const gradosResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/grados/profesor/${profesorID}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
          params: { annoEscolarID }
        }
      );
      
      setGrados(gradosResponse.data);
      
      // Si hay un grado preseleccionado, cargar sus secciones
      if (preselectedGradoID || (evaluacion && evaluacion.gradoID)) {
        const gradoID = preselectedGradoID || evaluacion.gradoID;
        fetchSecciones(gradoID);
      }
      
      // Obtener materias asignadas al profesor
      const materiasResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/materias/profesor/${profesorID}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
          params: { annoEscolarID }
        }
      );
      
      setMaterias(materiasResponse.data);
      setLoading(false);
    } catch (err) {
      console.error('Error al cargar datos del formulario:', err);
      setError('Error al cargar datos necesarios para el formulario.');
      setLoading(false);
    }
  };

  const fetchSecciones = async (gradoID) => {
    if (!gradoID) return;
    
    try {
      const token = localStorage.getItem('token');
      
      const seccionesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/secciones/grado/${gradoID}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
          params: { annoEscolarID }
        }
      );
      
      setSecciones(seccionesResponse.data);
    } catch (err) {
      console.error('Error al cargar secciones:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Si cambia el grado, cargar las secciones correspondientes
    if (name === 'gradoID') {
      fetchSecciones(value);
      // Resetear la sección seleccionada
      setFormData(prev => ({
        ...prev,
        seccionID: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData({
        ...formData,
        archivo: e.target.files[0]
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar campos requeridos
    if (!formData.titulo || !formData.tipo || !formData.fecha || !formData.porcentaje || !formData.lapso || !formData.materiaID || !formData.gradoID) {
      setError('Por favor, complete todos los campos requeridos.');
      return;
    }
    
    // Enviar datos al componente padre
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {evaluacion ? 'Editar Evaluación' : 'Nueva Evaluación'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Evaluación <span className="text-red-500">*</span>
              </label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Seleccione un tipo</option>
                <option value="Examen">Examen</option>
                <option value="Tarea">Tarea</option>
                <option value="Proyecto">Proyecto</option>
                <option value="Exposición">Exposición</option>
                <option value="Participación">Participación</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Porcentaje (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="porcentaje"
                min="1"
                max="100"
                value={formData.porcentaje}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lapso <span className="text-red-500">*</span>
              </label>
              <select
                name="lapso"
                value={formData.lapso}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Seleccione un lapso</option>
                <option value="1">Primer Lapso</option>
                <option value="2">Segundo Lapso</option>
                <option value="3">Tercer Lapso</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Materia <span className="text-red-500">*</span>
              </label>
              <select
                name="materiaID"
                value={formData.materiaID}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
                disabled={loading || !!preselectedMateriaID}
              >
                <option value="">Seleccione una materia</option>
                {materias.map((materia) => (
                  <option key={materia.id} value={materia.id}>
                    {materia.asignatura}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grado <span className="text-red-500">*</span>
              </label>
              <select
                name="gradoID"
                value={formData.gradoID}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
                disabled={loading || !!preselectedGradoID}
              >
                <option value="">Seleccione un grado</option>
                {grados.map((grado) => (
                  <option key={grado.id} value={grado.id}>
                    {grado.nombre_grado}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sección
              </label>
              <select
                name="seccionID"
                value={formData.seccionID}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                disabled={loading || !formData.gradoID || !!preselectedSeccionID}
              >
                <option value="">Todas las secciones</option>
                {secciones.map((seccion) => (
                  <option key={seccion.id} value={seccion.id}>
                    {seccion.nombre_seccion}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Archivo (opcional)
              </label>
              <div className="mt-1 flex items-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FaUpload className="mr-2" /> Seleccionar archivo
                </button>
                <span className="ml-3 text-sm text-gray-500">
                  {formData.archivo ? formData.archivo.name : evaluacion?.url_archivo ? 'Archivo ya subido' : 'Ningún archivo seleccionado'}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Formatos aceptados: PDF, Word, Excel, PowerPoint, imágenes (máx. 10MB)
              </p>
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
                  <FaSave className="mr-2" /> {evaluacion ? 'Actualizar' : 'Guardar'}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EvaluacionForm;
