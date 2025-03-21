import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const NuevoEstudiante = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    cedula: '',
    nombre: '',
    apellido: '',
    fechaNacimiento: '',
    lugarNacimiento: '',
    genero: '',
    direccion: '',
    gradoID: '',
    observaciones: '',
  });
  const [documentos, setDocumentos] = useState({});
  const [documentosRequeridos, setDocumentosRequeridos] = useState([]);
  const [grados, setGrados] = useState([]);
  const [cuposResumen, setCuposResumen] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Datos personales, 2: Documentos, 3: Confirmación

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener grados
        const gradosResponse = await axios.get(`${import.meta.env.VITE_API_URL}/grados`);
        setGrados(gradosResponse.data);
        
        // Obtener resumen de cupos
        const cuposResponse = await axios.get(`${import.meta.env.VITE_API_URL}/cupos/resumen`);
        setCuposResumen(cuposResponse.data.resumenCupos);
        
        // Obtener documentos requeridos para estudiantes
        const docsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/documentos/requeridos/estudiante`);
        setDocumentosRequeridos(docsResponse.data.documentosRequeridos || []);
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar datos iniciales:', err);
        setError('Error al cargar datos. Por favor, intente nuevamente.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      setDocumentos({
        ...documentos,
        [name]: files[0]
      });
    }
  };

  const handleNextStep = () => {
    // Validación para el paso 1
    if (step === 1) {
      const requiredFields = ['cedula', 'nombre', 'apellido', 'fechaNacimiento', 'genero', 'direccion', 'gradoID'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        setError('Por favor, complete todos los campos obligatorios.');
        return;
      }
      
      // Verificar si hay cupos disponibles en el grado seleccionado
      const gradoSeleccionado = cuposResumen.find(cupo => cupo.gradoID === parseInt(formData.gradoID));
      if (gradoSeleccionado && gradoSeleccionado.totalDisponibles <= 0) {
        setError('No hay cupos disponibles en el grado seleccionado.');
        return;
      }
    }
    
    // Validación para el paso 2
    if (step === 2) {
      // Verificar documentos obligatorios
      const documentosObligatorios = documentosRequeridos.filter(doc => doc.obligatorio);
      const missingDocs = documentosObligatorios.filter(doc => !documentos[`documento_${doc.tipo}`]);
      
      if (missingDocs.length > 0) {
        setError(`Faltan documentos obligatorios: ${missingDocs.map(doc => doc.nombre).join(', ')}`);
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
    try {
      setLoading(true);
      setError('');
      
      // Crear FormData para enviar archivos
      const formDataToSend = new FormData();
      
      // Agregar datos del estudiante
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      // Agregar representante (obtenido del token)
      const token = localStorage.getItem('token');
      const representanteID = JSON.parse(atob(token.split('.')[1])).id;
      formDataToSend.append('representanteID', representanteID);
      
      // Agregar documentos
      Object.keys(documentos).forEach(key => {
        formDataToSend.append(key, documentos[key]);
      });
      
      // Enviar solicitud
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/inscripcion/nuevo-estudiante`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Redireccionar al comprobante de inscripción
      navigate(`/inscripcion/comprobante/${response.data.inscripcionId}`);
    } catch (err) {
      console.error('Error al enviar formulario:', err);
      setError(err.response?.data?.message || 'Error al procesar la inscripción. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-center">Inscripción de Nuevo Estudiante</h1>
              <div className="flex items-center justify-center mt-4">
                {[1, 2, 3].map((stepNumber) => (
                  <div key={stepNumber} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step === stepNumber ? 'bg-indigo-600 text-white' : 
                      step > stepNumber ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'
                    }`}>
                      {step > stepNumber ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      ) : (
                        stepNumber
                      )}
                    </div>
                    {stepNumber < 3 && (
                      <div className={`h-1 w-12 ${step > stepNumber ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span className={step >= 1 ? 'text-indigo-600 font-medium' : ''}>Datos Personales</span>
                <span className={step >= 2 ? 'text-indigo-600 font-medium' : ''}>Documentos</span>
                <span className={step >= 3 ? 'text-indigo-600 font-medium' : ''}>Confirmación</span>
              </div>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            {/* Paso 1: Datos Personales */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cédula/Documento</label>
                    <input
                      type="text"
                      name="cedula"
                      value={formData.cedula}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombres</label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Apellidos</label>
                    <input
                      type="text"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                    <input
                      type="date"
                      name="fechaNacimiento"
                      value={formData.fechaNacimiento}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Lugar de Nacimiento</label>
                    <input
                      type="text"
                      name="lugarNacimiento"
                      value={formData.lugarNacimiento}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Género</label>
                    <select
                      name="genero"
                      value={formData.genero}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="">Seleccione...</option>
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dirección</label>
                  <textarea
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    rows="2"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Grado a Cursar</label>
                  <select
                    name="gradoID"
                    value={formData.gradoID}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Seleccione un grado...</option>
                    {grados.map(grado => {
                      const cupoInfo = cuposResumen.find(cupo => cupo.gradoID === grado.id);
                      const disponibles = cupoInfo ? cupoInfo.totalDisponibles : 0;
                      const sinCupo = disponibles <= 0;
                      
                      return (
                        <option 
                          key={grado.id} 
                          value={grado.id}
                          disabled={sinCupo}
                        >
                          {grado.nombre_grado} {sinCupo ? '(Sin cupos)' : `(${disponibles} cupos disponibles)`}
                        </option>
                      );
                    })}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Observaciones</label>
                  <textarea
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleChange}
                    rows="2"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  ></textarea>
                </div>
              </div>
            )}

            {/* Paso 2: Documentos */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 mb-4">
                  Por favor, suba los documentos requeridos para completar la inscripción.
                  Los documentos marcados con * son obligatorios.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documentosRequeridos.map((doc) => (
                    <div key={doc.tipo} className="border rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {doc.nombre} {doc.obligatorio && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="file"
                        name={`documento_${doc.tipo}`}
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-indigo-50 file:text-indigo-700
                          hover:file:bg-indigo-100"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      {doc.descripcion && (
                        <p className="mt-1 text-xs text-gray-500">{doc.descripcion}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Paso 3: Confirmación */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Resumen de la Inscripción</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Datos del Estudiante</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-600">Cédula:</div>
                    <div>{formData.cedula}</div>
                    
                    <div className="text-gray-600">Nombre completo:</div>
                    <div>{formData.nombre} {formData.apellido}</div>
                    
                    <div className="text-gray-600">Fecha de nacimiento:</div>
                    <div>{new Date(formData.fechaNacimiento).toLocaleDateString()}</div>
                    
                    <div className="text-gray-600">Género:</div>
                    <div>{formData.genero === 'M' ? 'Masculino' : 'Femenino'}</div>
                    
                    <div className="text-gray-600">Grado a cursar:</div>
                    <div>
                      {grados.find(g => g.id === parseInt(formData.gradoID))?.nombre_grado || ''}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Documentos Cargados</h4>
                  <ul className="list-disc list-inside text-sm">
                    {Object.keys(documentos).map(key => {
                      const docTipo = key.replace('documento_', '');
                      const docInfo = documentosRequeridos.find(d => d.tipo === docTipo);
                      return (
                        <li key={key} className="text-gray-600">
                          {docInfo?.nombre || docTipo}: {documentos[key].name}
                        </li>
                      );
                    })}
                  </ul>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>Importante:</strong> Al confirmar la inscripción, acepta que los datos proporcionados son correctos.
                    La inscripción quedará en estado pendiente hasta que sea revisada por la administración.
                  </p>
                </div>
              </div>
            )}
            
            <div className="mt-8 flex justify-between">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Anterior
                </button>
              )}
              
              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="ml-auto py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="ml-auto py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Procesando...' : 'Confirmar Inscripción'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NuevoEstudiante;

