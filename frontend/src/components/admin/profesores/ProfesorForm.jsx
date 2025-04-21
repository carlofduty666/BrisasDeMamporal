import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaUpload, FaSave, FaUserPlus } from 'react-icons/fa';
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
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas/tipo/profesor/${id}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          
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
  
  return (
     
      <div className="container mx-auto px-4 py-8">
        {/* Botón de regreso */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/profesores')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FaArrowLeft className="mr-2" /> Volver a la lista
          </button>
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
        
        {/* Formulario de datos del profesor - Solo visible si no se ha creado o estamos editando */}
        {mostrarFormularioProfesor && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {isEditing ? 'Editar Profesor' : 'Registrar Nuevo Profesor'}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Complete la información del profesor.
              </p>
            </div>
            
            <div className="border-t border-gray-200">
              <form ref={formRef} onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
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
                        <option value="">Seleccione</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                      </select>
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
                      onClick={() => navigate('/admin/profesores')}
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
                          <FaSave className="mr-2" /> Guardar
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
        
         {/* Sección de documentos (solo visible después de crear el profesor) */}
         {(isEditing || profesorCreado) && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Documentos del Profesor
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Documentos requeridos para el profesor.
              </p>
            </div>
            
            <div className="border-t border-gray-200">
              {loadingDocumentos ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : (
                <div className="px-4 py-5 sm:p-6">
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
                            onClick={() => handleOpenUploadModal(doc)}
                            className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            <FaUpload className="mr-2" /> {doc.subido ? 'Actualizar' : 'Subir'}
                          </button>
                        </div>
                      </div>
                    ))}
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
                  
                  {/* Botón para finalizar */}
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={handleFinish}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Finalizar y Volver a la Lista
                    </button>
                  </div>
                </div>
              )}
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

export default ProfesorForm;
