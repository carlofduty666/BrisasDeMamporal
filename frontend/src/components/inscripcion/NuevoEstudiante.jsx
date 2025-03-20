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
      setDocumentos({
        ...documentos,
        [documentoId]: file
      });
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
      // Validar que todos los documentos requeridos estén adjuntos
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
      
      // Agregar documentos
      Object.keys(documentos).forEach(docId => {
        formDataObj.append(`documento_${docId}`, documentos[docId]);
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
            {step === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="cedula" className="block text-sm font-medium text-gray-700">
                      Cédula o Documento de Identidad
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="cedula"
                        id="cedula"
                        value={formData.cedula}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="nombres" className="block text-sm font-medium text-gray-700">
                      Nombres
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="nombres"
                        id="nombres"
                        value={formData.nombres}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700">
                      Apellidos
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="apellidos"
                        id="apellidos"
                        value={formData.apellidos}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="fechaNacimiento" className="block text-sm font-medium text-gray-700">
                      Fecha de Nacimiento
                    </label>
                    <div className="mt-1">
                      <input
                        type="date"
                        name="fechaNacimiento"
                        id="fechaNacimiento"
                        value={formData.fechaNacimiento}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="lugarNacimiento" className="block text-sm font-medium text-gray-700">
                      Lugar de Nacimiento
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="lugarNacimiento"
                        id="lugarNacimiento"
                        value={formData.lugarNacimiento}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="genero" className="block text-sm font-medium text-gray-700">
                      Género
                    </label>
                    <div className="mt-1">
                      <select
                        id="genero"
                        name="genero"
                        value={formData.genero}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="">Seleccionar</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">
                      Dirección
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="direccion"
                        name="direccion"
                        rows="3"
                        value={formData.direccion}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      ></textarea>
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="grado" className="block text-sm font-medium text-gray-700">
                      Grado a Cursar
                    </label>
                    <div className="mt-1">
                      <select
                        id="grado"
                        name="grado"
                        value={formData.grado}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="">Seleccionar</option>
                        {Object.entries(cuposDisponibles).map(([grado, cupos]) => (
                          <option key={grado} value={grado} disabled={cupos <= 0}>
                            {grado} {cupos <= 0 ? '(Sin cupos)' : `(${cupos} cupos)`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700">
                      Observaciones
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="observaciones"
                        name="observaciones"
                        rows="3"
                        value={formData.observaciones}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
                <div className="space-y-6">
                    <p className="text-sm text-gray-500">
                        Documentos requeridos para {formData.grado.includes("Representante") ? "el representante" : "el estudiante"}:
                    </p>

                    <div className="space-y-4">
                        {documentosRequeridos.map((doc) => (
                            <div key={doc.id} className="border border-gray-200 p-4 rounded-md">
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
                                    <div className="ml-4 flex-shrink-0">
                                        <input
                                            type="file"
                                            id={`documento_${doc.id}`}
                                            onChange={(e) => handleFileChange(e, doc.id)}
                                            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                        />
                                    </div>
                                </div>
                                {documentos[doc.id] && (
                                    <p className="text-xs text-green-600 mt-2">
                                        Archivo seleccionado: {documentos[doc.id].name}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

{step === 3 && (
              <div className="space-y-6">
                <p className="text-sm text-gray-500">
                  Por favor, revise la información antes de enviar la solicitud de inscripción.
                </p>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Datos del Estudiante</h3>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Cédula</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formData.cedula}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Nombres</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formData.nombres}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Apellidos</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formData.apellidos}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Fecha de Nacimiento</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formData.fechaNacimiento}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Lugar de Nacimiento</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formData.lugarNacimiento}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Género</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formData.genero}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Dirección</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formData.direccion}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Grado a Cursar</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formData.grado}</dd>
                    </div>
                  </dl>

                  <h3 className="text-lg font-medium text-gray-900 mt-6 mb-4">Documentos Adjuntos</h3>
                  <ul className="divide-y divide-gray-200">
                    {documentosRequeridos.map((documento) => (
                      <li key={documento.id} className="py-3 flex justify-between text-sm">
                        <p className="text-gray-500">{documento.nombre}</p>
                        {documentos[documento.id] ? (
                          <p className="text-green-600">Adjunto</p>
                        ) : (
                          <p className="text-red-500">No adjunto</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Importante</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          Al enviar esta solicitud, usted confirma que toda la información proporcionada es verídica y que los documentos adjuntos son auténticos. La inscripción está sujeta a revisión y aprobación por parte de la institución.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
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
                {loading ? 'Procesando...' : 'Enviar Solicitud'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NuevoEstudiante;