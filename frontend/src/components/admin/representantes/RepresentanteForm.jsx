import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaUpload, FaSave, FaUserPlus, FaCheck, FaEdit } from 'react-icons/fa';
import AdminLayout from '../layout/AdminLayout';

const RepresentanteForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = !!id;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [documentosRequeridos, setDocumentosRequeridos] = useState([]);
  const [documentosEstudiante, setDocumentosEstudiante] = useState([]);
  const [loadingDocumentos, setLoadingDocumentos] = useState(false);
  const [errorDocumentos, setErrorDocumentos] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [subiendoDocumento, setSubiendoDocumento] = useState(false);
  const [representanteCreado, setRepresentanteCreado] = useState(null);
  const [estudianteCreado, setEstudianteCreado] = useState(null);
  const [inscripcionId, setInscripcionId] = useState(null);
  const [showEstudianteForm, setShowEstudianteForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Representante, 2: Estudiante, 3: Documentos, 4: Confirmación
  const [grados, setGrados] = useState([]);
  const [annoEscolar, setAnnoEscolar] = useState(null);
  const [cuposDisponibles, setCuposDisponibles] = useState({});
  const [nivelSeleccionado, setNivelSeleccionado] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [inscripcionCompletada, setInscripcionCompletada] = useState(false);
  
  const fileInputRef = useRef(null);
  const formRef = useRef(null);
  
  // Estado para el formulario del representante
  const [formData, setFormData] = useState({
    cedula: '',
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    direccion: '',
    profesion: '',
    observaciones: ''
  });
  
  // Estado para el formulario del estudiante
  const [estudianteData, setEstudianteData] = useState({
    cedula: '',
    nombre: '',
    apellido: '',
    fechaNacimiento: '',
    lugarNacimiento: '',
    genero: '',
    direccion: '',
    observaciones: '',
    gradoID: '',
  });
  
  // Cargar datos iniciales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Obtener año escolar activo
        const annoResponse = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/anno-escolar/actual`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setAnnoEscolar(annoResponse.data);
        
        // Obtener cupos disponibles
        const cuposResponse = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/inscripciones/cupos-disponibles`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setCuposDisponibles(cuposResponse.data.cuposDisponibles);
        
        // Obtener lista de grados
        const gradosResponse = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setGrados(gradosResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar datos iniciales:', err);
        setError('Error al cargar datos iniciales. Por favor, recargue la página.');
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);
  
  // Cargar datos del representante si estamos editando
  useEffect(() => {
    if (isEditing) {
      const fetchRepresentante = async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem('token');
          
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas/tipo/representante/${id}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          
          setFormData({
            cedula: response.data.cedula || '',
            nombre: response.data.nombre || '',
            apellido: response.data.apellido || '',
            telefono: response.data.telefono || '',
            email: response.data.email || '',
            direccion: response.data.direccion || '',
            profesion: response.data.profesion || '',
            observaciones: response.data.observaciones || ''
          });
          
          setRepresentanteCreado(response.data);
          setLoading(false);
        } catch (err) {
          console.error('Error al cargar datos del representante:', err);
          setError('Error al cargar los datos del representante. Por favor, intente nuevamente.');
          setLoading(false);
        }
      };
      
      fetchRepresentante();
    }
  }, [id, isEditing]);
  
  // Cargar documentos requeridos para el representante
  useEffect(() => {
    const cargarDocumentosRequeridos = async () => {
      try {
        setLoadingDocumentos(true);
        setErrorDocumentos('');
        
        const token = localStorage.getItem('token');
        const personaID = isEditing ? id : (representanteCreado ? representanteCreado.id : '0');
        
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/verificar/${personaID}/representante`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        setDocumentosRequeridos(response.data.documentosRequeridos);
        setLoadingDocumentos(false);
      } catch (err) {
        console.error('Error al cargar documentos requeridos:', err);
        setErrorDocumentos('No se pudieron cargar los documentos requeridos. Por favor, intente nuevamente.');
        setLoadingDocumentos(false);
      }
    };
    
    if (isEditing || representanteCreado) {
      cargarDocumentosRequeridos();
    }
  }, [id, isEditing, representanteCreado]);
  
  // Cargar documentos requeridos para el estudiante
  useEffect(() => {
    const cargarDocumentosEstudiante = async () => {
      try {
        setLoadingDocumentos(true);
        
        const token = localStorage.getItem('token');
        const personaID = estudianteCreado ? estudianteCreado.id : '0';
        
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/verificar/${personaID}/estudiante`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        setDocumentosEstudiante(response.data.documentosRequeridos);
        setLoadingDocumentos(false);
      } catch (err) {
        console.error('Error al cargar documentos del estudiante:', err);
        setErrorDocumentos('No se pudieron cargar los documentos del estudiante. Por favor, intente nuevamente.');
        setLoadingDocumentos(false);
      }
    };
    
    if (estudianteCreado) {
      cargarDocumentosEstudiante();
    }
  }, [estudianteCreado]);
  
  // Efecto para cargar grados cuando cambia el nivel seleccionado
  useEffect(() => {
    const cargarGrados = async () => {

      try {
        const token = localStorage.getItem('token');
        // Obtener grados
        let url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados`;
        if (nivelSeleccionado) {
          url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados/nivel/${nivelSeleccionado}`;
        }
        
        const response = await axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } });
        setGrados(response.data);
        
        // Calcular cupos disponibles con valores predeterminados
        const cuposObj = {};
        for (const grado of response.data) {
          cuposObj[grado.id] = 30; // Valor por defecto
        }
        
        // Intentar obtener cupos reales
        try {
          const token = localStorage.getItem('token');
          const cuposResponse = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/cupos/resumen`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          if (cuposResponse.data && cuposResponse.data.resumenCupos) {
            cuposResponse.data.resumenCupos.forEach(cupo => {
              cuposObj[cupo.gradoID] = cupo.totalDisponibles;
            });
          }
        } catch (error) {
          console.warn("No se pudieron obtener los cupos exactos, usando valores predeterminados");
        }
        
        setCuposDisponibles(cuposObj);
      } catch (error) {
        console.error('Error al cargar los grados:', error);
        setError('No se pudieron cargar los grados. Por favor, intente nuevamente.');
      }
    };
    
    cargarGrados();
  }, [nivelSeleccionado]);
  
  // Manejar cambios en el formulario del representante
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Manejar cambios en el formulario del estudiante
  const handleEstudianteChange = (e) => {
    const { name, value } = e.target;
    setEstudianteData({
      ...estudianteData,
      [name]: value
    });
  };
  
  // Manejar envío del formulario del representante
  const handleSubmitRepresentante = async (e) => {
    e.preventDefault();
    
    // Validar campos obligatorios
    if (!formData.cedula || !formData.nombre || !formData.apellido || !formData.telefono || !formData.email || !formData.direccion) {
      setError('Por favor, complete todos los campos obligatorios del representante.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      
      let response;
      
      if (isEditing) {
        // Actualizar representante existente
        response = await axios.put(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas/${id}`,
          {
            ...formData,
            tipo: 'representante'
          },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        setSuccess('Representante actualizado correctamente');
        setRepresentanteCreado(response.data);
      } else {
        // Crear nuevo representante
        response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas`,
          {
            ...formData,
            tipo: 'representante'
          },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        setSuccess('Representante creado correctamente. Ahora puede registrar al estudiante.');
        setRepresentanteCreado(response.data);
      }
      
      // Avanzar al siguiente paso
      setCurrentStep(2);
      setShowEstudianteForm(true);
      setLoading(false);
    } catch (err) {
      console.error('Error al guardar representante:', err);
      setError(err.response?.data?.message || 'Error al procesar la solicitud. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };
  
  // Manejar envío del formulario del estudiante
  const handleSubmitEstudiante = async (e) => {
    e.preventDefault();
  
    console.log('Datos del estudiante a enviar:', estudianteData);
    
    // Validar campos obligatorios
    if (!estudianteData.cedula || !estudianteData.nombre || !estudianteData.apellido || 
        !estudianteData.fechaNacimiento || !estudianteData.direccion || !estudianteData.gradoID) {
      setError('Por favor, complete todos los campos obligatorios del estudiante.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      
      // Crear un FormData para enviar los datos
      const formDataToSend = new FormData();
      
      // Añadir datos del estudiante directamente (sin prefijo)
      Object.entries(estudianteData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formDataToSend.append(key, value);
        }
      });
      
      // Añadir ID del representante con prefijo rep_
      formDataToSend.append('rep_id', representanteCreado.id);
      
      // Añadir año escolar
      formDataToSend.append('annoEscolarID', annoEscolar.id);
      formDataToSend.append('documentosCompletos', 'false');
      
      // Imprimir el FormData para depuración
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
      
      // Enviar datos al servidor
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/inscripciones/nuevo-estudiante`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setEstudianteCreado(response.data.estudiante);
      setInscripcionId(response.data.inscripcionId);
      setSuccess('Estudiante registrado correctamente. Ahora puede subir los documentos.');
      
      // Avanzar al siguiente paso
      setCurrentStep(3);
      setLoading(false);
    } catch (err) {
      console.error('Error al registrar estudiante:', err);
      setError(err.response?.data?.message || 'Error al procesar la inscripción. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };
  
  
  // Funciones para manejar documentos
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setArchivoSeleccionado(e.target.files[0]);
    } else {
      setArchivoSeleccionado(null);
    }
  };
  
  const handleOpenUploadModal = (tipoDocumento, tipoPersona = 'representante') => {
    setDocumentoSeleccionado({...tipoDocumento, tipoPersona});
    setShowModal(true);
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    setDocumentoSeleccionado(null);
    setArchivoSeleccionado(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleUploadDocument = async () => {
    if (!archivoSeleccionado) {
      setError('Por favor, seleccione un archivo para subir');
      return;
    }
    
    try {
      setSubiendoDocumento(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('documento', archivoSeleccionado);
      
      // Determinar a qué persona pertenece el documento
      const personaID = documentoSeleccionado.tipoPersona === 'estudiante' 
        ? estudianteCreado.id 
        : (isEditing ? id : representanteCreado.id);
      
      formData.append('personaID', personaID);
      formData.append('tipoDocumento', documentoSeleccionado.id);
      formData.append('descripcion', `Documento ${documentoSeleccionado.nombre} de ${documentoSeleccionado.tipoPersona}`);
      
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Actualizar lista de documentos según el tipo de persona
      if (documentoSeleccionado.tipoPersona === 'estudiante') {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/verificar/${estudianteCreado.id}/estudiante`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setDocumentosEstudiante(response.data.documentosRequeridos);
      } else {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/verificar/${isEditing ? id : representanteCreado.id}/representante`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setDocumentosRequeridos(response.data.documentosRequeridos);
      }
      
      // Cerrar modal
      handleCloseModal();
      
      setSuccess('Documento subido correctamente');
      
      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
    } catch (err) {
      console.error('Error al subir documento:', err);
      setError(err.response?.data?.message || 'Error al subir el documento. Por favor, intente nuevamente.');
    } finally {
      setSubiendoDocumento(false);
    }
  };
  
  // Función para mostrar la pantalla de confirmación
  const handleShowConfirmation = () => {
    // Verificar si todos los documentos obligatorios están subidos
    const docsRepresentanteFaltantes = documentosRequeridos.filter(doc => doc.obligatorio && !doc.subido);
    const docsEstudianteFaltantes = documentosEstudiante.filter(doc => doc.obligatorio && !doc.subido);
    
    if (docsRepresentanteFaltantes.length > 0 || docsEstudianteFaltantes.length > 0) {
      if (!confirm('Faltan documentos obligatorios por subir. ¿Desea continuar de todas formas?')) {
        return;
      }
    }
    
    setShowConfirmation(true);
    setCurrentStep(4);
  };
  
  // Función para completar la inscripción
  const handleCompletarInscripcion = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      
      // Actualizar el estado de documentosCompletos en la inscripción
      await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/inscripciones/${inscripcionId}/update-estado`,
        { documentosCompletos: true },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setInscripcionCompletada(true);
      setSuccess('Inscripción completada exitosamente');
      
      // Redirigir al comprobante después de 2 segundos
      setTimeout(() => {
        navigate(`/inscripcion/comprobante/${inscripcionId}`);
      }, 2000);
      
    } catch (err) {
      console.error('Error al completar inscripción:', err);
      setError(err.response?.data?.message || 'Error al finalizar el proceso. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };
  
  // Función para editar datos del representante
  const handleEditRepresentante = () => {
    setCurrentStep(1);
    setShowConfirmation(false);
  };
  
  // Función para editar datos del estudiante
  const handleEditEstudiante = () => {
    setCurrentStep(2);
    setShowConfirmation(false);
  };
  
  // Función para volver a la sección de documentos
  const handleEditDocumentos = () => {
    setCurrentStep(3);
    setShowConfirmation(false);
  };
  
  return (
     
      <div className="container mx-auto px-4 py-8">
        {/* Botón de regreso */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/representantes')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FaArrowLeft className="mr-2" /> Volver a la lista
          </button>
        </div>
        
        {/* Indicador de pasos */}
        <div className="mb-6 bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="w-full flex items-center">
                <div className={`flex items-center justify-center h-8 w-8 rounded-full ${currentStep >= 1 ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                  <span className="text-white text-sm font-medium">1</span>
                </div>
                <div className={`h-1 flex-1 mx-2 ${currentStep >= 2 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                <div className={`flex items-center justify-center h-8 w-8 rounded-full ${currentStep >= 2 ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                  <span className="text-white text-sm font-medium">2</span>
                </div>
                <div className={`h-1 flex-1 mx-2 ${currentStep >= 3 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                <div className={`flex items-center justify-center h-8 w-8 rounded-full ${currentStep >= 3 ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                  <span className="text-white text-sm font-medium">3</span>
                </div>
                <div className={`h-1 flex-1 mx-2 ${currentStep >= 4 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                <div className={`flex items-center justify-center h-8 w-8 rounded-full ${currentStep >= 4 ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                  <span className="text-white text-sm font-medium">4</span>
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>Representante</span>
              <span>Estudiante</span>
              <span>Documentos</span>
              <span>Confirmación</span>
            </div>
          </div>
        </div>
        
        {/* Mensajes de error o éxito */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Paso 1: Formulario del Representante */}
        {currentStep === 1 && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {isEditing ? 'Editar Representante' : 'Registrar Nuevo Representante'}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Complete la información del representante.
              </p>
            </div>
            
            <div className="border-t border-gray-200">
              <form ref={formRef} onSubmit={handleSubmitRepresentante} className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="cedula" className="block text-sm font-medium text-gray-700">
                      Cédula/Documento <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="cedula"
                        id="cedula"
                        value={formData.cedula}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="nombre"
                        id="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">
                      Apellido <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="apellido"
                        id="apellido"
                        value={formData.apellido}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
                      Teléfono <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="tel"
                        name="telefono"
                        id="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="profesion" className="block text-sm font-medium text-gray-700">
                      Profesión
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="profesion"
                        id="profesion"
                        value={formData.profesion}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-6">
                    <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">
                      Dirección <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="direccion"
                        id="direccion"
                        value={formData.direccion}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        required
                      />
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
                
                <div className="pt-5 mt-6 border-t border-gray-200">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => navigate('/admin/representantes')}
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
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
                          <FaSave className="mr-2" /> {representanteCreado ? 'Actualizar' : 'Continuar'}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Paso 2: Formulario del Estudiante */}
        {currentStep === 2 && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Registrar Estudiante
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Complete la información del estudiante.
              </p>
            </div>
            
            <div className="border-t border-gray-200">
              <form onSubmit={handleSubmitEstudiante} className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="cedula" className="block text-sm font-medium text-gray-700">
                      Cédula/Documento <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="cedula"
                        id="estudiante_cedula"
                        value={estudianteData.cedula}
                        onChange={handleEstudianteChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="nombre"
                        id="estudiante_nombre"
                        value={estudianteData.nombre}
                        onChange={handleEstudianteChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">
                      Apellido <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="apellido"
                        id="estudiante_apellido"
                        value={estudianteData.apellido}
                        onChange={handleEstudianteChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="fechaNacimiento" className="block text-sm font-medium text-gray-700">
                      Fecha de Nacimiento <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="date"
                        name="fechaNacimiento"
                        id="fechaNacimiento"
                        value={estudianteData.fechaNacimiento}
                        onChange={handleEstudianteChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        required
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
                        value={estudianteData.lugarNacimiento}
                        onChange={handleEstudianteChange}
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
                        value={estudianteData.genero}
                        onChange={handleEstudianteChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="">Seleccione</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="sm:col-span-6">
                    <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">
                      Dirección <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="direccion"
                        id="estudiante_direccion"
                        value={estudianteData.direccion}
                        onChange={handleEstudianteChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-6">
                    <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700">
                      Observaciones
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="estudiante_observaciones"
                        name="observaciones"
                        rows="3"
                        value={estudianteData.observaciones}
                        onChange={handleEstudianteChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      ></textarea>
                    </div>
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="nivel" className="block text-sm font-medium text-gray-700">
                      Nivel
                    </label>
                    <div className="mt-1">
                      <select
                        id="nivel"
                        name="nivel"
                        value={nivelSeleccionado}
                        onChange={(e) => setNivelSeleccionado(e.target.value)}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="">Seleccione un nivel</option>
                        <option value="Primaria">Primaria</option>
                        <option value="Secundaria">Secundaria</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="gradoID" className="block text-sm font-medium text-gray-700">
                      Grado <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <select
                        id="gradoID"
                        name="gradoID"
                        value={estudianteData.gradoID}
                        onChange={handleEstudianteChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        required
                      >
                        <option value="">Seleccione un grado</option>
                        {grados.map(grado => (
                          <option 
                            key={grado.id} 
                            value={grado.id}
                            disabled={!cuposDisponibles[grado.id] || cuposDisponibles[grado.id] <= 0}
                          >
                            {grado.nombre_grado} {cuposDisponibles[grado.id] ? `(${cuposDisponibles[grado.id]} cupos)` : '(Sin cupos)'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="annoEscolar" className="block text-sm font-medium text-gray-700">
                      Año Escolar
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="annoEscolar"
                        value={annoEscolar ? annoEscolar.periodo : 'Cargando...'}
                        className="bg-gray-100 shadow-sm block w-full sm:text-sm border-gray-300 rounded-md"
                        disabled
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-5 mt-6 border-t border-gray-200">
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Volver
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
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
                          <FaUserPlus className="mr-2" /> Registrar Estudiante
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Paso 3: Documentos */}
        {currentStep === 3 && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Documentos Requeridos
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Suba los documentos requeridos para completar la inscripción.
              </p>
            </div>
            
            <div className="border-t border-gray-200">
              {loadingDocumentos ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : (
                <div className="px-4 py-5 sm:p-6">
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-900 mb-3">Documentos del Representante</h4>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {documentosRequeridos.map((doc) => (
                        <div key={doc.id} className="border rounded-lg overflow-hidden">
                          <div className={`p-4 ${doc.subido ? 'bg-green-50' : 'bg-gray-50'}`}>
                            <div className="flex justify-between items-start">
                              <h4 className="text-sm font-medium text-gray-900">
                                {doc.nombre} {doc.obligatorio && <span className="text-red-500">*</span>}
                              </h4>
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${doc.subido ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {doc.subido ? 'Subido' : 'Pendiente'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <button
                              onClick={() => handleOpenUploadModal(doc, 'representante')}
                              className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              <FaUpload className="mr-2" /> {doc.subido ? 'Actualizar' : 'Subir'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-8 mb-6">
                    <h4 className="text-md font-medium text-gray-900 mb-3">Documentos del Estudiante</h4>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {documentosEstudiante.map((doc) => (
                        <div key={doc.id} className="border rounded-lg overflow-hidden">
                          <div className={`p-4 ${doc.subido ? 'bg-green-50' : 'bg-gray-50'}`}>
                            <div className="flex justify-between items-start">
                              <h4 className="text-sm font-medium text-gray-900">
                                {doc.nombre} {doc.obligatorio && <span className="text-red-500">*</span>}
                              </h4>
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${doc.subido ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {doc.subido ? 'Subido' : 'Pendiente'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <button
                              onClick={() => handleOpenUploadModal(doc, 'estudiante')}
                              className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              <FaUpload className="mr-2" /> {doc.subido ? 'Actualizar' : 'Subir'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {errorDocumentos && (
                    <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">{errorDocumentos}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-5 mt-6 border-t border-gray-200">
                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Volver
                      </button>
                      <button
                        type="button"
                        onClick={handleShowConfirmation}
                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Continuar a Confirmación
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Paso 4: Confirmación */}
        {currentStep === 4 && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Confirmar Inscripción
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Revise la información antes de completar la inscripción.
              </p>
            </div>
            
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-md font-medium text-gray-900">Datos del Representante</h4>
                    <button
                      onClick={handleEditRepresentante}
                      className="text-indigo-600 hover:text-indigo-900 text-sm flex items-center"
                    >
                      <FaEdit className="mr-1" /> Editar
                    </button>
                  </div>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Cédula/Documento</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formData.cedula}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Nombre Completo</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formData.nombre} {formData.apellido}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formData.telefono}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formData.email}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Profesión</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formData.profesion || 'No especificada'}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Dirección</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formData.direccion}</dd>
                    </div>
                  </dl>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-md font-medium text-gray-900">Datos del Estudiante</h4>
                    <button
                      onClick={handleEditEstudiante}
                      className="text-indigo-600 hover:text-indigo-900 text-sm flex items-center"
                    >
                      <FaEdit className="mr-1" /> Editar
                    </button>
                  </div>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Cédula/Documento</dt>
                      <dd className="mt-1 text-sm text-gray-900">{estudianteData.cedula}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Nombre Completo</dt>
                      <dd className="mt-1 text-sm text-gray-900">{estudianteData.nombre} {estudianteData.apellido}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Fecha de Nacimiento</dt>
                      <dd className="mt-1 text-sm text-gray-900">{estudianteData.fechaNacimiento}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Género</dt>
                      <dd className="mt-1 text-sm text-gray-900">{estudianteData.genero === 'M' ? 'Masculino' : estudianteData.genero === 'F' ? 'Femenino' : 'No especificado'}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Dirección</dt>
                      <dd className="mt-1 text-sm text-gray-900">{estudianteData.direccion}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Grado</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {grados.find(g => g.id == estudianteData.gradoID)?.nombre_grado || 'No seleccionado'}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Año Escolar</dt>
                      <dd className="mt-1 text-sm text-gray-900">{annoEscolar?.periodo || 'No disponible'}</dd>
                    </div>
                  </dl>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-md font-medium text-gray-900">Estado de Documentos</h4>
                    <button
                      onClick={handleEditDocumentos}
                      className="text-indigo-600 hover:text-indigo-900 text-sm flex items-center"
                    >
                      <FaEdit className="mr-1" /> Gestionar
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Representante:</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {documentosRequeridos.map(doc => (
                          <li key={doc.id} className="flex items-center">
                            {doc.subido ? (
                              <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="h-4 w-4 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            )}
                            {doc.nombre} {doc.obligatorio && <span className="text-red-500 ml-1">*</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Estudiante:</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {documentosEstudiante.map(doc => (
                          <li key={doc.id} className="flex items-center">
                            {doc.subido ? (
                              <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="h-4 w-4 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            )}
                            {doc.nombre} {doc.obligatorio && <span className="text-red-500 ml-1">*</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-indigo-700">
                        Al completar la inscripción, se generará un comprobante que podrá descargar o imprimir.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-5 mt-6 border-t border-gray-200">
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Volver
                    </button>
                    <button
                      type="button"
                      onClick={handleCompletarInscripcion}
                      disabled={loading || inscripcionCompletada}
                      className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Procesando...
                        </span>
                      ) : inscripcionCompletada ? (
                        "Inscripción Completada"
                      ) : (
                        "Completar Inscripción"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Modal para subir documentos */}
        {showModal && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        {documentoSeleccionado?.subido ? 'Actualizar documento' : 'Subir documento'}
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          {documentoSeleccionado?.nombre} {documentoSeleccionado?.obligatorio && <span className="text-red-500">*</span>}
                          <span className="block mt-1">
                            Tipo: {documentoSeleccionado?.tipoPersona === 'estudiante' ? 'Documento del estudiante' : 'Documento del representante'}
                          </span>
                        </p>
                        
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700">
                            Seleccione un archivo
                          </label>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="mt-1 block w-full text-sm text-gray-500
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-full file:border-0
                              file:text-sm file:font-semibold
                              file:bg-indigo-50 file:text-indigo-700
                              hover:file:bg-indigo-100"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={handleUploadDocument}
                    disabled={subiendoDocumento || !archivoSeleccionado}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {subiendoDocumento ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Subiendo...
                      </span>
                    ) : (
                      'Subir'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
     
  );
};

export default RepresentanteForm;
