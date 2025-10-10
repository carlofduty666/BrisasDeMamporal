import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  FaArrowLeft, 
  FaUpload, 
  FaSave, 
  FaUserPlus, 
  FaChalkboardTeacher,
  FaCheckCircle,
  FaExclamationCircle,
  FaFileAlt,
  FaTimes,
  FaSpinner,
  FaIdCard,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaVenusMars,
  FaGlobeAmericas,
  FaGraduationCap,
  FaStickyNote
} from 'react-icons/fa';
import AdminLayout from '../layout/AdminLayout';

const ProfesorForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [documentosRequeridos, setDocumentosRequeridos] = useState([]);
  const [loadingDocumentos, setLoadingDocumentos] = useState(false);
  const [errorDocumentos, setErrorDocumentos] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [subiendoDocumento, setSubiendoDocumento] = useState(false);
  const [profesorCreado, setProfesorCreado] = useState(null);
  const [mostrarFormularioProfesor, setMostrarFormularioProfesor] = useState(true);
  
  const fileInputRef = useRef(null);
  const formRef = useRef(null);
  
  // Estado para el formulario
  const [formData, setFormData] = useState({
    cedula: '',
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    direccion: '',
    fechaNacimiento: '',
    genero: '',
    lugarNacimiento: '',
    profesion: '',
    observaciones: ''
  });
  
  // Cargar datos si estamos editando
  useEffect(() => {
    if (isEditing) {
      const fetchProfesor = async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem('token');
          
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas/${id}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          
          // Verificar que sea un profesor
          if (response.data.tipo !== 'profesor') {
            setError('La persona seleccionada no es un profesor');
            setLoading(false);
            return;
          }
          
          setFormData({
            cedula: response.data.cedula || '',
            nombre: response.data.nombre || '',
            apellido: response.data.apellido || '',
            telefono: response.data.telefono || '',
            email: response.data.email || '',
            direccion: response.data.direccion || '',
            fechaNacimiento: response.data.fechaNacimiento || '',
            genero: response.data.genero || '',
            lugarNacimiento: response.data.lugarNacimiento || '',
            profesion: response.data.profesion || '',
            observaciones: response.data.observaciones || ''
          });
          
          // Si estamos editando, ya tenemos un profesor creado
          setProfesorCreado(response.data);
          setLoading(false);
        } catch (err) {
          console.error('Error al cargar datos del profesor:', err);
          setError('Error al cargar los datos del profesor. Por favor, intente nuevamente.');
          setLoading(false);
        }
      };
      
      fetchProfesor();
    }
  }, [id, isEditing]);
  
  // Cargar documentos requeridos
  useEffect(() => {
    const cargarDocumentosRequeridos = async () => {
      try {
        setLoadingDocumentos(true);
        setErrorDocumentos('');
        
        const token = localStorage.getItem('token');
        const personaID = isEditing ? id : (profesorCreado ? profesorCreado.id : '0');
        
        console.log(`Cargando documentos para profesor con ID: ${personaID}`);
        
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/verificar/${personaID}/profesor`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        console.log('Documentos requeridos recibidos:', response.data);
        
        setDocumentosRequeridos(response.data.documentosRequeridos);
        setLoadingDocumentos(false);
      } catch (err) {
        console.error('Error al cargar documentos requeridos:', err);
        if (err.response && err.response.data) {
          console.error("Detalles del error:", err.response.data);
        }
        setErrorDocumentos('No se pudieron cargar los documentos requeridos. Por favor, intente nuevamente.');
        setLoadingDocumentos(false);
      }
    };
    
    if (isEditing || profesorCreado) {
      cargarDocumentosRequeridos();
    }
  }, [id, isEditing, profesorCreado]);
  
  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar campos obligatorios
    if (!formData.cedula || !formData.nombre || !formData.apellido || !formData.telefono || !formData.email || !formData.direccion) {
      setError('Por favor, complete todos los campos obligatorios.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      
      // Crear un objeto simple para enviar los datos (no FormData)
      const dataToSend = {
        ...formData,
        tipo: 'profesor'
      };
      
      console.log('Enviando datos del profesor:', dataToSend);
      
      let response;
      
      if (isEditing) {
        // Actualizar profesor existente
        response = await axios.put(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas/${id}`,
          dataToSend,
          { 
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            } 
          }
        );
        
        setSuccess('Profesor actualizado correctamente');
        setProfesorCreado(response.data);
        
        // Ocultar formulario de profesor y mostrar solo documentos
        setMostrarFormularioProfesor(false);
      } else {
        // Crear nuevo profesor
        response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas`,
          dataToSend,
          { 
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            } 
          }
        );
        
        setSuccess('Profesor creado correctamente. Ahora puede subir los documentos.');
        setProfesorCreado(response.data);
        
        // Ocultar formulario de profesor y mostrar solo documentos
        setMostrarFormularioProfesor(false);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error al guardar profesor:', err);
      if (err.response && err.response.data) {
        console.error("Detalles del error:", err.response.data);
      }
      setError(err.response?.data?.message || 'Error al procesar la solicitud. Por favor, intente nuevamente.');
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
  
  const handleOpenUploadModal = (tipoDocumento) => {
    setDocumentoSeleccionado(tipoDocumento);
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
      formData.append('personaID', isEditing ? id : profesorCreado.id);
      
      // Asegurarse de que el tipoDocumento coincida con el ENUM
      const tipoDoc = documentoSeleccionado.id;
      console.log('Tipo de documento a subir:', tipoDoc);
      formData.append('tipoDocumento', tipoDoc);
      
      formData.append('descripcion', `Documento ${documentoSeleccionado.nombre} del profesor`);
      
      // Verificar si ya existe un documento de este tipo para esta persona
      try {
        const personaID = isEditing ? id : profesorCreado.id;
        const checkResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/persona/${personaID}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        console.log('Documentos existentes:', checkResponse.data);
        
        const documentoExistente = checkResponse.data.find(
          doc => doc.tipoDocumento === tipoDoc
        );
        
        let response;
        
        if (documentoExistente) {
          // Si existe, actualizar en lugar de crear
          console.log(`Actualizando documento existente ID: ${documentoExistente.id}`);
          response = await axios.put(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/${documentoExistente.id}`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
              }
            }
          );
        } else {
          // Si no existe, crear nuevo
          console.log('Creando nuevo documento con datos:', {
            personaID,
            tipoDocumento: tipoDoc,
            descripcion: `Documento ${documentoSeleccionado.nombre} del profesor`
          });
          
          response = await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/upload`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
              }
            }
          );
        }
        
        console.log('Respuesta del servidor:', response.data);
        
        // Actualizar lista de documentos requeridos
        const updateResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/verificar/${isEditing ? id : profesorCreado.id}/profesor`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        setDocumentosRequeridos(updateResponse.data.documentosRequeridos);
        
        // Cerrar modal
        handleCloseModal();
        
        setSuccess('Documento subido correctamente');
        
        // Ocultar mensaje de éxito después de 3 segundos
        setTimeout(() => {
          setSuccess('');
        }, 3000);
        
      } catch (checkError) {
        console.error("Error al verificar o actualizar documentos:", checkError);
        if (checkError.response && checkError.response.data) {
          console.error("Detalles del error:", checkError.response.data);
        }
        setError("Error al procesar el documento. Por favor, intente nuevamente.");
      }
    } catch (err) {
      console.error('Error al subir documento:', err);
      if (err.response && err.response.data) {
        console.error("Detalles del error:", err.response.data);
      }
      setError(err.response?.data?.message || 'Error al subir el documento. Por favor, intente nuevamente.');
    } finally {
      setSubiendoDocumento(false);
    }
  };

  // Función para finalizar y volver a la lista
  const handleFinish = () => {
    navigate('/admin/profesores');
  };
  
  if (loading && isEditing && !profesorCreado) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-pulse"></div>
          </div>
          <p className="mt-4 text-emerald-600 font-medium">Cargando datos del profesor...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-emerald-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Hero Section */}
        <div className="relative overflow-hidden bg-emerald-800 shadow-2xl rounded-2xl mb-8">
          <div className="absolute inset-0 bg-black/10"></div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-700/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-emerald-700/10 rounded-full blur-2xl"></div>
          
          <div className="relative px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-emerald-500/20 rounded-xl backdrop-blur-sm border border-emerald-400/30">
                  <FaChalkboardTeacher className="w-8 h-8 text-emerald-200" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">
                    {isEditing ? 'Editar Profesor' : 'Registrar Nuevo Profesor'}
                  </h1>
                  <p className="text-emerald-200">
                    {isEditing ? 'Actualiza la información del profesor' : 'Complete los datos del nuevo profesor'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => navigate('/admin/profesores')}
                className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-md text-white font-semibold rounded-xl border border-white/30 hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <FaArrowLeft className="mr-2" /> Volver
              </button>
            </div>
          </div>
        </div>
        
        {/* Mensajes de error o éxito */}
        {error && (
          <div className="mb-6 animate-fade-in-down">
            <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl shadow-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaExclamationCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
                <button
                  onClick={() => setError('')}
                  className="ml-auto flex-shrink-0 text-red-400 hover:text-red-600 transition-colors duration-200"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
        
        {success && (
          <div className="mb-6 animate-fade-in-down">
            <div className="bg-emerald-50 border-l-4 border-emerald-500 rounded-r-xl shadow-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaCheckCircle className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-emerald-800">{success}</p>
                </div>
                <button
                  onClick={() => setSuccess('')}
                  className="ml-auto flex-shrink-0 text-emerald-400 hover:text-emerald-600 transition-colors duration-200"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Formulario de datos del profesor - Solo visible si no se ha creado o estamos editando */}
        {mostrarFormularioProfesor && (
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden mb-8 transform transition-all duration-300 hover:shadow-2xl">
            <div className="bg-emerald-600 px-6 py-5">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <FaUserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Información del Profesor
                  </h3>
                  <p className="text-emerald-100 text-sm">
                    Los campos marcados con <span className="text-red-300">*</span> son obligatorios
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <form ref={formRef} onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Cédula */}
                  <div className="group">
                    <label htmlFor="cedula" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <FaIdCard className="mr-2 text-emerald-600" />
                      Cédula/Documento <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="cedula"
                      id="cedula"
                      value={formData.cedula}
                      onChange={handleChange}
                      placeholder="Ej: V-12345678"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 hover:border-emerald-400"
                      required
                    />
                  </div>
                  
                  {/* Nombre */}
                  <div className="group">
                    <label htmlFor="nombre" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <FaUser className="mr-2 text-emerald-600" />
                      Nombre <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      id="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Ingrese el nombre"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 hover:border-emerald-400"
                      required
                    />
                  </div>
                  
                  {/* Apellido */}
                  <div className="group">
                    <label htmlFor="apellido" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <FaUser className="mr-2 text-emerald-600" />
                      Apellido <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="apellido"
                      id="apellido"
                      value={formData.apellido}
                      onChange={handleChange}
                      placeholder="Ingrese el apellido"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 hover:border-emerald-400"
                      required
                    />
                  </div>
                  
                  {/* Teléfono */}
                  <div className="group">
                    <label htmlFor="telefono" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <FaPhone className="mr-2 text-emerald-600" />
                      Teléfono <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      id="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="Ej: 0412-1234567"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 hover:border-emerald-400"
                      required
                    />
                  </div>
                  
                  {/* Email */}
                  <div className="group">
                    <label htmlFor="email" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <FaEnvelope className="mr-2 text-emerald-600" />
                      Email <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="ejemplo@correo.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 hover:border-emerald-400"
                      required
                    />
                  </div>
                  
                  {/* Fecha de Nacimiento */}
                  <div className="group">
                    <label htmlFor="fechaNacimiento" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <FaCalendarAlt className="mr-2 text-emerald-600" />
                      Fecha de Nacimiento
                    </label>
                    <input
                      type="date"
                      name="fechaNacimiento"
                      id="fechaNacimiento"
                      value={formData.fechaNacimiento}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 hover:border-emerald-400"
                    />
                  </div>
                  
                  {/* Género */}
                  <div className="group">
                    <label htmlFor="genero" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <FaVenusMars className="mr-2 text-emerald-600" />
                      Género
                    </label>
                    <select
                      id="genero"
                      name="genero"
                      value={formData.genero}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 hover:border-emerald-400"
                    >
                      <option value="">Seleccione el género</option>
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                    </select>
                  </div>
                  
                  {/* Lugar de Nacimiento */}
                  <div className="group">
                    <label htmlFor="lugarNacimiento" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <FaGlobeAmericas className="mr-2 text-emerald-600" />
                      Lugar de Nacimiento
                    </label>
                    <input
                      type="text"
                      name="lugarNacimiento"
                      id="lugarNacimiento"
                      value={formData.lugarNacimiento}
                      onChange={handleChange}
                      placeholder="Ciudad, Estado, País"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 hover:border-emerald-400"
                    />
                  </div>
                  
                  {/* Profesión */}
                  <div className="group">
                    <label htmlFor="profesion" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <FaGraduationCap className="mr-2 text-emerald-600" />
                      Profesión
                    </label>
                    <input
                      type="text"
                      name="profesion"
                      id="profesion"
                      value={formData.profesion}
                      onChange={handleChange}
                      placeholder="Ej: Licenciado en Educación"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 hover:border-emerald-400"
                    />
                  </div>
                  
                  {/* Dirección - Full width */}
                  <div className="group sm:col-span-2 lg:col-span-3">
                    <label htmlFor="direccion" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <FaMapMarkerAlt className="mr-2 text-emerald-600" />
                      Dirección <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="direccion"
                      id="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                      placeholder="Ingrese la dirección completa de residencia"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 hover:border-emerald-400"
                      required
                    />
                  </div>
                  
                  {/* Observaciones - Full width */}
                  <div className="group sm:col-span-2 lg:col-span-3">
                    <label htmlFor="observaciones" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <FaStickyNote className="mr-2 text-emerald-600" />
                      Observaciones
                    </label>
                    <textarea
                      id="observaciones"
                      name="observaciones"
                      rows="4"
                      value={formData.observaciones}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 hover:border-emerald-400 resize-none"
                      placeholder="Información adicional sobre el profesor (especialidades, experiencia, horarios disponibles, etc.)"
                    ></textarea>
                  </div>
                </div>
                
                {/* Botones de acción */}
                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/profesores')}
                    className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 transform hover:scale-105"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <FaSpinner className="animate-spin mr-2" />
                        Guardando...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <FaSave className="mr-2" /> 
                        {isEditing ? 'Actualizar Profesor' : 'Guardar Profesor'}
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Sección de documentos (solo visible después de crear el profesor) */}
        {(isEditing || profesorCreado) && (
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
            <div className="bg-emerald-600 px-6 py-5">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <FaFileAlt className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Documentos del Profesor
                  </h3>
                  <p className="text-emerald-100 text-sm">
                    Gestiona los documentos requeridos
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {loadingDocumentos ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600"></div>
                    <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-pulse"></div>
                  </div>
                  <p className="mt-4 text-emerald-600 font-medium">Cargando documentos...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {documentosRequeridos.map((doc) => (
                      <div 
                        key={doc.id} 
                        className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                          doc.subido 
                            ? 'border-emerald-300 bg-emerald-50' 
                            : 'border-amber-300 bg-amber-50'
                        }`}
                      >
                        {/* Badge de estado */}
                        <div className={`absolute top-3 right-3 z-10`}>
                          <span className={`px-3 py-1 inline-flex items-center text-xs font-bold rounded-full shadow-lg ${
                            doc.subido 
                              ? 'bg-emerald-500 text-white' 
                              : 'bg-amber-500 text-white'
                          }`}>
                            {doc.subido ? (
                              <>
                                <FaCheckCircle className="mr-1" /> Subido
                              </>
                            ) : (
                              <>
                                <FaExclamationCircle className="mr-1" /> Pendiente
                              </>
                            )}
                          </span>
                        </div>
                        
                        <div className="p-6">
                          <div className="flex items-start space-x-3 mb-4">
                            <div className={`p-3 rounded-xl ${
                              doc.subido ? 'bg-emerald-200' : 'bg-amber-200'
                            }`}>
                              <FaFileAlt className={`w-6 h-6 ${
                                doc.subido ? 'text-emerald-700' : 'text-amber-700'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-base font-bold text-gray-900 mb-1">
                                {doc.nombre}
                                {doc.obligatorio && <span className="text-red-500 ml-1">*</span>}
                              </h4>
                              <p className="text-xs text-gray-600">
                                {doc.obligatorio ? 'Documento obligatorio' : 'Documento opcional'}
                              </p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleOpenUploadModal(doc)}
                            className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center ${
                              doc.subido
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                : 'bg-amber-600 text-white hover:bg-amber-700'
                            }`}
                          >
                            <FaUpload className="mr-2" /> 
                            {doc.subido ? 'Actualizar' : 'Subir Documento'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {errorDocumentos && (
                    <div className="mt-6 bg-red-50 border-l-4 border-red-500 rounded-r-xl shadow-lg p-4">
                      <div className="flex items-center">
                        <FaExclamationCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                        <p className="ml-3 text-sm font-medium text-red-800">{errorDocumentos}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Botón para finalizar */}
                  <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                    <button
                      type="button"
                      onClick={handleFinish}
                      className="px-8 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center"
                    >
                      <FaCheckCircle className="mr-2" />
                      Finalizar y Volver a la Lista
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        
        {/* Modal para subir documentos */}
        {showModal && (
          <div className="fixed z-50 inset-0 overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              {/* Overlay */}
              <div 
                className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity backdrop-blur-sm"
                onClick={handleCloseModal}
              ></div>
              
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              {/* Modal */}
              <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full animate-scale-in">
                {/* Header */}
                <div className="bg-emerald-600 px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <FaUpload className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white">
                        {documentoSeleccionado?.subido ? 'Actualizar Documento' : 'Subir Documento'}
                      </h3>
                    </div>
                    <button
                      onClick={handleCloseModal}
                      className="text-white/80 hover:text-white transition-colors duration-200"
                    >
                      <FaTimes className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {/* Body */}
                <div className="bg-white px-6 py-6">
                  <div className="mb-6">
                    <div className="flex items-center space-x-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                      <FaFileAlt className="w-6 h-6 text-emerald-600" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {documentoSeleccionado?.nombre}
                          {documentoSeleccionado?.obligatorio && <span className="text-red-500 ml-1">*</span>}
                        </p>
                        <p className="text-xs text-gray-600">
                          {documentoSeleccionado?.obligatorio ? 'Documento obligatorio' : 'Documento opcional'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Seleccione un archivo
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-600
                          file:mr-4 file:py-3 file:px-6
                          file:rounded-xl file:border-0
                          file:text-sm file:font-semibold
                          file:bg-emerald-50 file:text-emerald-700
                          hover:file:bg-emerald-100
                          file:transition-all file:duration-200
                          file:cursor-pointer
                          cursor-pointer
                          border-2 border-dashed border-gray-300 rounded-xl
                          hover:border-emerald-400
                          transition-all duration-200
                          p-4"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      />
                    </div>
                    {archivoSeleccionado && (
                      <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                        <p className="text-sm text-emerald-700 font-medium flex items-center">
                          <FaCheckCircle className="mr-2" />
                          Archivo seleccionado: {archivoSeleccionado.name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleUploadDocument}
                    disabled={subiendoDocumento || !archivoSeleccionado}
                    className="px-8 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {subiendoDocumento ? (
                      <span className="flex items-center">
                        <FaSpinner className="animate-spin mr-2" />
                        Subiendo...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <FaUpload className="mr-2" />
                        Subir Documento
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfesorForm;