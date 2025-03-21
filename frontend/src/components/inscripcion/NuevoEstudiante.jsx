import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const NuevoEstudiante = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    cedula: '',
    nombres: '',
    apellidos: '',
    fechaNacimiento: '',
    lugarNacimiento: '',
    genero: '',
    direccion: '',
    grado: '',
    observaciones: '',
  });
  const [documentos, setDocumentos] = useState({});
  const [documentosRequeridos, setDocumentosRequeridos] = useState([]);
  const [cuposDisponibles, setCuposDisponibles] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Datos personales, 2: Documentos, 3: Confirmación

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Obtener documentos requeridos para estudiantes
        const docsResponse = await axios.get(
          '/documentos/verificar/0/estudiante', 
          config
        );
        setDocumentosRequeridos(docsResponse.data.documentosRequeridos || []);

        // Obtener cupos disponibles
        const cuposResponse = await axios.get('/inscripcion/cupos-disponibles', config);
        setCuposDisponibles(cuposResponse.data || {});

      } catch (err) {
        setError('Error al cargar documentos requeridos');
        setDocumentosRequeridos([]);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e, documentoId) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setError(`Tipo de archivo no permitido para ${documentoId}. Solo se permiten PDF, JPEG, JPG y PNG.`);
        e.target.value = null; // Limpiar el input
        return;
      }
      
      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError(`El archivo ${file.name} excede el tamaño máximo permitido (10MB).`);
        e.target.value = null; // Limpiar el input
        return;
      }
      
      setDocumentos({
        ...documentos,
        [documentoId]: file
      });
      
      // Limpiar mensaje de error si existe
      if (error) setError('');
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      // Validar datos personales
      if (!formData.cedula || !formData.nombres || !formData.apellidos || 
          !formData.fechaNacimiento || !formData.genero || !formData.grado) {
        setError('Por favor, complete todos los campos obligatorios.');
        return;
      }
      
      // Verificar si hay cupo disponible
      if (cuposDisponibles[formData.grado] <= 0) {
        setError(`No hay cupos disponibles para ${formData.grado}. Por favor, seleccione otro grado.`);
        return;
      }
    }
    
    if (step === 2) {
      // Validar que todos los documentos obligatorios estén adjuntos
      const documentosFaltantes = documentosRequeridos
        .filter(doc => doc.obligatorio)
        .filter(doc => !documentos[doc.id]);
      
      if (documentosFaltantes.length > 0) {
        setError(`Faltan documentos obligatorios: ${documentosFaltantes.map(doc => doc.nombre).join(', ')}`);
        return;
      }
    }
    
    setError('');
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      // Crear FormData para enviar archivos
      const formDataObj = new FormData();
      
      // Agregar datos del estudiante
      Object.keys(formData).forEach(key => {
        formDataObj.append(key, formData[key]);
      });
      
      // Agregar documentos - Usar el valor del ENUM como clave
      Object.keys(documentos).forEach(docId => {
        // Buscar el documento en documentosRequeridos para obtener su id real (valor del ENUM)
        const docInfo = documentosRequeridos.find(doc => doc.id === docId);
        if (docInfo) {
          formDataObj.append(`documento_${docInfo.id}`, documentos[docId]);
        }
      });

      // Enviar solicitud de inscripción
      const response = await axios.post('/inscripcion/nuevo-estudiante', formDataObj, config);
      
      // Redireccionar a la página de comprobante
      navigate(`/inscripcion/comprobante/${response.data.inscripcionId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al procesar la inscripción. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">
              Inscripción de Nuevo Estudiante
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {step === 1 && 'Paso 1: Información Personal'}
              {step === 2 && 'Paso 2: Documentos Requeridos'}
              {step === 3 && 'Paso 3: Confirmación de Datos'}
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mx-4 mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            {/* Paso 1: Información Personal - Sin cambios */}
            {step === 1 && (
              <div className="space-y-6">
                {/* Contenido existente del paso 1 */}
                {/* ... */}
              </div>
            )}

            {/* Paso 2: Documentos Requeridos - Mejorado */}
            {step === 2 && (
              <div className="space-y-6">
                <p className="text-sm text-gray-500 mb-4">
                  Por favor, adjunte los siguientes documentos requeridos para completar la inscripción:
                </p>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {documentosRequeridos.map((doc) => (
                    <div key={doc.id} className="border border-gray-200 p-4 rounded-md">
                      <div className="flex flex-col space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">
                              {doc.nombre} 
                              {doc.obligatorio && <span className="text-red-500 ml-1">*</span>}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              {doc.descripcion || (doc.obligatorio ? 'Documento obligatorio' : 'Documento opcional')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <label 
                            htmlFor={`documento_${doc.id}`}
                            className={`relative cursor-pointer bg-white rounded-md font-medium 
                              ${documentos[doc.id] ? 'text-indigo-600' : 'text-indigo-500'} 
                              hover:text-indigo-700 focus-within:outline-none focus-within:ring-2 
                              focus-within:ring-offset-2 focus-within:ring-indigo-500`}
                          >
                            <div className="flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                              <div className="space-y-1 text-center">
                                <svg
                                  className="mx-auto h-12 w-12 text-gray-400"
                                  stroke="currentColor"
                                  fill="none"
                                  viewBox="0 0 48 48"
                                  aria-hidden="true"
                                >
                                  <path
                                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                <div className="flex text-sm text-gray-600">
                                  <span>{documentos[doc.id] ? 'Cambiar archivo' : 'Subir archivo'}</span>
                                  <input
                                    id={`documento_${doc.id}`}
                                    name={`documento_${doc.id}`}
                                    type="file"
                                    className="sr-only"
                                    onChange={(e) => handleFileChange(e, doc.id)}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                  />
                                </div>
                                <p className="text-xs text-gray-500">PDF, JPG, JPEG, PNG hasta 10MB</p>
                              </div>
                            </div>
                          </label>
                        </div>
                        
                        {documentos[doc.id] && (
                          <div className="mt-2 flex items-center text-sm text-green-600">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Archivo seleccionado: {documentos[doc.id].name}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Paso 3: Confirmación - Sin cambios */}
            {step === 3 && (
              <div className="space-y-6">
                {/* Contenido existente del paso 3 */}
                {/* ... */}
              </div>
            )}
          </div>

          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
              >
                Anterior
              </button>
            )}
            
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Siguiente
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </>
                ) : (
                  'Completar Inscripción'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NuevoEstudiante;