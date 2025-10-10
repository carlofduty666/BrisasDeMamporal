import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaEdit, 
  FaTrash, 
  FaArrowLeft, 
  FaFileAlt, 
  FaUserTie, 
  FaTimes,
  FaCalendarAlt,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaIdCard,
  FaFileDownload,
  FaUpload,
  FaCheckCircle,
  FaEye,
  FaSpinner,
  FaDownload,
  FaExclamationCircle,
  FaStickyNote,
  FaUser,
  FaBriefcase,
  FaVenusMars,
  FaGlobeAmericas,
  FaUserCog
} from 'react-icons/fa';
import { formatearFecha, formatearCedula } from '../../../utils/formatters';

const EmpleadoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Estados principales
  const [empleado, setEmpleado] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('info');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Estados para documentos
  const [showModal, setShowModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [documentoPreview, setDocumentoPreview] = useState(null);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [subiendoDocumento, setSubiendoDocumento] = useState(false);
  const [descargandoTodos, setDescargandoTodos] = useState(false);
  const [documentosRequeridos, setDocumentosRequeridos] = useState([]);
  const fileInputRef = useRef(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (!token) {
          navigate('/login');
          return;
        }

        const config = { headers: { 'Authorization': `Bearer ${token}` } };
        
        // Obtener datos del empleado
        const empleadoResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas/${id}`,
          config
        );
        
        if (empleadoResponse.data.tipo !== 'administrativo' && empleadoResponse.data.tipo !== 'obrero') {
          throw new Error('La persona seleccionada no es un empleado');
        }
        
        setEmpleado(empleadoResponse.data);
        
        // Obtener documentos del empleado
        const documentosResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/persona/${id}`,
          config
        );
        setDocumentos(Array.isArray(documentosResponse.data) ? documentosResponse.data : []);

        // Obtener documentos requeridos para el tipo de empleado
        try {
          const tipoEmpleado = empleadoResponse.data.tipo || 'administrativo';
          const documentosRequeridosResponse = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/verificar/${id}/${tipoEmpleado}`,
            config
          );
          setDocumentosRequeridos(documentosRequeridosResponse.data.documentosRequeridos || []);
        } catch (documentosRequeridosError) {
          console.error('Error al obtener documentos requeridos:', documentosRequeridosError.response?.data || documentosRequeridosError.message);
          setDocumentosRequeridos([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar datos del empleado:', err);
        setError(err.response?.data?.message || 'Error al cargar los datos del empleado. Por favor, intente nuevamente.');
        setLoading(false);
        
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };
    
    fetchData();
  }, [id, token, navigate]);
  
  const handleDelete = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas/${id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      navigate('/admin/empleados', { 
        state: { message: 'Empleado eliminado correctamente' } 
      });
    } catch (err) {
      console.error('Error al eliminar empleado:', err);
      setError('Error al eliminar el empleado. Por favor, intente nuevamente.');
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
      
      const formData = new FormData();
      formData.append('documento', archivoSeleccionado);
      formData.append('personaID', id);
      
      const tipoDoc = documentoSeleccionado.id;
      formData.append('tipoDocumento', tipoDoc);
      formData.append('descripcion', `Documento ${documentoSeleccionado.nombre} del empleado`);
      
      // Verificar si ya existe un documento de este tipo
      const checkResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/persona/${id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      const documentoExistente = checkResponse.data.find(
        doc => doc.tipoDocumento === tipoDoc
      );
      
      let response;
      
      if (documentoExistente) {
        // Actualizar documento existente
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
        // Crear nuevo documento
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
      
      // Actualizar lista de documentos
      const documentosResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/persona/${id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setDocumentos(Array.isArray(documentosResponse.data) ? documentosResponse.data : []);
      
      // Actualizar documentos requeridos
      const tipoEmpleado = empleado?.tipo || 'administrativo';
      const updateResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/verificar/${id}/${tipoEmpleado}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setDocumentosRequeridos(updateResponse.data.documentosRequeridos);
      
      handleCloseModal();
      setSuccessMessage('Documento subido correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err) {
      console.error('Error al subir documento:', err);
      setError(err.response?.data?.message || 'Error al subir el documento. Por favor, intente nuevamente.');
    } finally {
      setSubiendoDocumento(false);
    }
  };

  const handleVistaPrevia = (documento) => {
    setDocumentoPreview(documento);
    setShowPreviewModal(true);
  };

  const handleDescargarDocumento = async (documentoId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/download/${documentoId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers['content-disposition'];
      let fileName = 'documento';
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (fileNameMatch && fileNameMatch.length === 2) {
          fileName = fileNameMatch[1];
        }
      }
      
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setSuccessMessage('Documento descargado correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error al descargar documento:', err);
      setError('Error al descargar el documento');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDescargarTodos = async () => {
    try {
      setDescargandoTodos(true);
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/download-all/${id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `documentos_empleado_${empleado?.cedula || id}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setSuccessMessage('Documentos descargados correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error al descargar documentos:', err);
      setError('Error al descargar los documentos');
      setTimeout(() => setError(''), 3000);
    } finally {
      setDescargandoTodos(false);
    }
  };

  const handleEliminarDocumento = async (documentoId) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este documento?')) {
      return;
    }
    
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/${documentoId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // Actualizar lista de documentos
      const documentosResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/persona/${id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setDocumentos(Array.isArray(documentosResponse.data) ? documentosResponse.data : []);
      
      // Actualizar documentos requeridos
      const tipoEmpleado = empleado?.tipo || 'administrativo';
      const updateResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/verificar/${id}/${tipoEmpleado}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setDocumentosRequeridos(updateResponse.data.documentosRequeridos);
      
      setSuccessMessage('Documento eliminado correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error al eliminar documento:', err);
      setError('Error al eliminar el documento');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-200 border-t-amber-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-amber-500/10 animate-pulse"></div>
          </div>
          <p className="mt-4 text-amber-600 font-medium">Cargando datos del empleado...</p>
        </div>
      </div>
    );
  }

  if (error && !empleado) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
            <FaExclamationCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Error</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button
            onClick={() => navigate('/admin/empleados')}
            className="w-full bg-amber-600 text-white py-3 px-4 rounded-xl hover:bg-amber-700 transition-colors duration-200 font-semibold"
          >
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="container mx-auto px-4 py-8">
        {/* Botón de volver */}
        <Link
          to="/admin/empleados"
          className="inline-flex items-center text-amber-600 hover:text-amber-700 mb-6 transition-colors duration-200 font-medium"
        >
          <FaArrowLeft className="w-4 h-4 mr-2" />
          Volver a la lista
        </Link>

        {/* Mensajes de error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg shadow-sm animate-fade-in-down">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaExclamationCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Header Hero Section */}
        <div className="relative overflow-hidden bg-amber-800 shadow-2xl rounded-2xl mb-8">
          <div className="absolute inset-0 bg-black/10"></div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-amber-700/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-amber-700/10 rounded-full blur-2xl"></div>
          
          <div className="relative px-6 py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-3xl">
                      {empleado?.nombre?.charAt(0)}{empleado?.apellido?.charAt(0)}
                    </span>
                  </div>
                </div>
                
                {/* Información básica */}
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-white mb-2">
                    {empleado?.nombre} {empleado?.apellido}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-amber-200">
                    <div className="flex items-center">
                      <FaIdCard className="w-4 h-4 mr-2" />
                      <span>C.I: V - {formatearCedula(empleado?.cedula)}</span>
                    </div>
                    <div className="flex items-center">
                      <FaUserCog className="w-4 h-4 mr-2" />
                      <span className="capitalize">{empleado?.tipo}</span>
                    </div>
                  </div>
                  
                  {/* Stats rápidas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-amber-200 text-xs font-medium">Documentos</p>
                          <p className="text-xl font-bold text-white">{documentos.length}</p>
                        </div>
                        <FaFileAlt className="w-6 h-6 text-amber-300" />
                      </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-amber-200 text-xs font-medium">Completados</p>
                          <p className="text-xl font-bold text-white">
                            {documentosRequeridos.filter(doc => doc.subido).length}/{documentosRequeridos.length}
                          </p>
                        </div>
                        <FaCheckCircle className="w-6 h-6 text-amber-300" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Botones de acción */}
              <div className="mt-8 lg:mt-0 lg:ml-8 flex flex-col space-y-3">
                <Link
                  to={`/admin/empleados/editar/${id}`}
                  className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-md text-white font-semibold rounded-xl border border-white/30 hover:bg-white/30 transition-all duration-300 shadow-lg"
                >
                  <FaEdit className="w-4 h-4 mr-2" />
                  Editar Empleado
                </Link>
                
                <button
                  onClick={handleDescargarTodos}
                  disabled={descargandoTodos || documentos.length === 0}
                  className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-md text-white font-semibold rounded-xl border border-white/30 hover:bg-white/30 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {descargandoTodos ? (
                    <>
                      <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
                      Descargando...
                    </>
                  ) : (
                    <>
                      <FaDownload className="w-4 h-4 mr-2" />
                      Exportar Datos
                    </>
                  )}
                </button>
                
                {!confirmDelete ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="inline-flex items-center px-6 py-3 bg-red-500/80 backdrop-blur-md text-white font-semibold rounded-xl border border-red-400/30 hover:bg-red-500/90 transition-all duration-300 shadow-lg"
                  >
                    <FaTrash className="w-4 h-4 mr-2" />
                    Eliminar
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleDelete}
                      className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="inline-flex items-center px-4 py-2 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors duration-200"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mensajes de éxito */}
        {successMessage && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 p-4 mb-6 rounded-r-lg shadow-sm animate-fade-in-down">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaCheckCircle className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{successMessage}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Pestañas modernas */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex flex-wrap -mb-px px-6">
              <button
                className={`${
                  activeTab === 'info'
                    ? 'border-amber-500 text-amber-600 bg-amber-50'
                    : 'border-transparent text-gray-500 hover:text-amber-600 hover:border-amber-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-semibold text-sm rounded-t-lg transition-all duration-200 flex items-center`}
                onClick={() => setActiveTab('info')}
              >
                <FaUser className="w-4 h-4 mr-2" />
                Información Personal
              </button>
              <button
                className={`${
                  activeTab === 'documentos'
                    ? 'border-amber-500 text-amber-600 bg-amber-50'
                    : 'border-transparent text-gray-500 hover:text-amber-600 hover:border-amber-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-semibold text-sm rounded-t-lg transition-all duration-200 flex items-center`}
                onClick={() => setActiveTab('documentos')}
              >
                <FaFileAlt className="w-4 h-4 mr-2" />
                Documentos ({documentos.length})
              </button>
            </nav>
          </div>
          
          {/* Contenido de las pestañas */}
          <div className="p-6">
            {/* Información Personal */}
            {activeTab === 'info' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Información básica */}
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-amber-800 mb-4 flex items-center">
                      <FaIdCard className="w-5 h-5 mr-2" />
                      Información Básica
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="w-32 text-sm font-medium text-amber-700">Cédula:</div>
                        <div className="text-sm text-gray-900 font-semibold">V - {formatearCedula(empleado.cedula)}</div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-32 text-sm font-medium text-amber-700">Nombre:</div>
                        <div className="text-sm text-gray-900">{empleado.nombre} {empleado.apellido}</div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-32 text-sm font-medium text-amber-700">Tipo:</div>
                        <div className="text-sm text-gray-900 capitalize">{empleado.tipo}</div>
                      </div>
                      {empleado.genero && (
                        <div className="flex items-center">
                          <div className="w-32 text-sm font-medium text-amber-700">Género:</div>
                          <div className="text-sm text-gray-900">{empleado.genero === 'M' ? 'Masculino' : 'Femenino'}</div>
                        </div>
                      )}
                      {empleado.fechaNacimiento && (
                        <div className="flex items-center">
                          <div className="w-32 text-sm font-medium text-amber-700">Nacimiento:</div>
                          <div className="text-sm text-gray-900">{formatearFecha(empleado.fechaNacimiento)}</div>
                        </div>
                      )}
                      {empleado.lugarNacimiento && (
                        <div className="flex items-center">
                          <div className="w-32 text-sm font-medium text-amber-700">Lugar:</div>
                          <div className="text-sm text-gray-900">{empleado.lugarNacimiento}</div>
                        </div>
                      )}
                      {empleado.profesion && (
                        <div className="flex items-center">
                          <div className="w-32 text-sm font-medium text-amber-700">Profesión:</div>
                          <div className="text-sm text-gray-900">{empleado.profesion}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Información de contacto */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                      <FaPhone className="w-5 h-5 mr-2" />
                      Contacto
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="w-24 text-sm font-medium text-blue-700">Teléfono:</div>
                        <div className="text-sm text-gray-900">{empleado.telefono}</div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-24 text-sm font-medium text-blue-700">Email:</div>
                        <div className="text-sm text-gray-900">{empleado.email}</div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-24 text-sm font-medium text-blue-700">Dirección:</div>
                        <div className="text-sm text-gray-900 flex-1">{empleado.direccion}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Observaciones */}
                {empleado.observaciones && (
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                      <FaStickyNote className="w-5 h-5 mr-2" />
                      Observaciones
                    </h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{empleado.observaciones}</p>
                  </div>
                )}
              </div>
            )}

            {/* Documentos */}
            {activeTab === 'documentos' && (
              <div className="space-y-6">
                {documentosRequeridos.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 mb-4">
                      <FaFileAlt className="h-8 w-8 text-amber-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Cargando documentos...</h3>
                    <p className="text-gray-500">Obteniendo información de documentos requeridos.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {documentosRequeridos.map((doc) => {
                      const documentoSubido = documentos.find(d => d.tipoDocumento === doc.id || d.tipoDocumento === doc.nombre);
                      const estaSubido = !!documentoSubido || !!doc.subido;
                      
                      return (
                        <div 
                          key={doc.id} 
                          className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                            estaSubido 
                              ? 'border-emerald-300 bg-emerald-50' 
                              : 'border-amber-300 bg-amber-50'
                          }`}
                        >
                          {/* Badge de estado */}
                          <div className="absolute top-3 right-3 z-10">
                            <span className={`px-3 py-1 inline-flex items-center text-xs font-bold rounded-full shadow-lg transition-all duration-200 ${
                              estaSubido 
                                ? 'bg-emerald-500 text-white' 
                                : 'bg-amber-500 text-white'
                            }`}>
                              {estaSubido ? (
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
                              <div className={`p-3 rounded-xl transition-all duration-200 ${
                                estaSubido ? 'bg-emerald-200' : 'bg-amber-200'
                              }`}>
                                <FaFileAlt className={`w-6 h-6 ${
                                  estaSubido ? 'text-emerald-700' : 'text-amber-700'
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

                            {/* Información del documento si está subido */}
                            {documentoSubido && (
                              <div className="mb-3 p-3 bg-white rounded-lg border border-gray-200">
                                <p className="text-xs text-gray-600 mb-1">
                                  <strong>Archivo:</strong> {documentoSubido.nombre_archivo || 'Sin nombre'}
                                </p>
                                {documentoSubido.descripcion && (
                                  <p className="text-xs text-gray-600 mb-1">
                                    <strong>Descripción:</strong> {documentoSubido.descripcion}
                                  </p>
                                )}
                                <p className="text-xs text-gray-500">
                                  Subido: {formatearFecha(documentoSubido.createdAt)}
                                </p>
                              </div>
                            )}
                            
                            {/* Botones de acción */}
                            <div className="flex flex-col space-y-2">
                              {estaSubido ? (
                                <>
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleVistaPrevia(documentoSubido)}
                                      className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-blue-200 transition-colors flex items-center justify-center"
                                    >
                                      <FaEye className="mr-1" /> Vista Previa
                                    </button>
                                    <button
                                      onClick={() => handleDescargarDocumento(documentoSubido.id)}
                                      className="flex-1 bg-emerald-100 text-emerald-700 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-emerald-200 transition-colors flex items-center justify-center"
                                    >
                                      <FaFileDownload className="mr-1" /> Descargar
                                    </button>
                                  </div>
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => {
                                        setDocumentoSeleccionado(doc);
                                        setShowModal(true);
                                      }}
                                      className="flex-1 bg-amber-600 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-amber-700 transition-colors flex items-center justify-center"
                                    >
                                      <FaUpload className="mr-1" /> Actualizar
                                    </button>
                                    <button
                                      onClick={() => handleEliminarDocumento(documentoSubido.id)}
                                      className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-red-200 transition-colors"
                                    >
                                      <FaTrash />
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <button
                                  onClick={() => {
                                    setDocumentoSeleccionado(doc);
                                    setShowModal(true);
                                  }}
                                  className="w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center bg-amber-600 text-white hover:bg-amber-700"
                                >
                                  <FaUpload className="mr-2" /> 
                                  Subir Documento
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

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
              <div className="bg-amber-600 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg transition-all duration-300 hover:bg-white/30">
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
                  <div className="flex items-center space-x-3 p-4 bg-amber-50 rounded-xl border border-amber-200 transition-all duration-200 hover:border-amber-300">
                    <FaFileAlt className="w-6 h-6 text-amber-600" />
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
                        file:bg-amber-50 file:text-amber-700
                        hover:file:bg-amber-100
                        file:transition-all file:duration-200
                        file:cursor-pointer
                        cursor-pointer
                        border-2 border-dashed border-gray-300 rounded-xl
                        hover:border-amber-400
                        transition-all duration-200
                        p-4"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                  </div>
                  {archivoSeleccionado && (
                    <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200 transition-all duration-200">
                      <p className="text-sm text-amber-700 font-medium flex items-center">
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
                  className="px-8 py-3 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
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

      {/* Modal de vista previa */}
      {showPreviewModal && documentoPreview && (
        <div className="fixed z-50 inset-0 overflow-y-auto animate-fade-in">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity backdrop-blur-sm"
              onClick={() => setShowPreviewModal(false)}
            ></div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            {/* Modal */}
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full animate-scale-in">
              {/* Header */}
              <div className="bg-amber-600 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <FaEye className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        Vista Previa del Documento
                      </h3>
                      <p className="text-amber-100 text-sm">
                        {documentoPreview.nombre_archivo || 'Sin nombre'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPreviewModal(false)}
                    className="text-white/80 hover:text-white transition-colors duration-200"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Body */}
              <div className="bg-white px-6 py-6">
                <div className="bg-gray-100 rounded-xl p-8 min-h-[400px] flex items-center justify-center">
                  {documentoPreview.ruta_archivo && documentoPreview.ruta_archivo.toLowerCase().endsWith('.pdf') ? (
                    <iframe
                      src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${documentoPreview.ruta_archivo}`}
                      className="w-full h-[600px] rounded-lg"
                      title="Vista previa del documento"
                    />
                  ) : documentoPreview.ruta_archivo && (documentoPreview.ruta_archivo.toLowerCase().endsWith('.jpg') || 
                      documentoPreview.ruta_archivo.toLowerCase().endsWith('.jpeg') || 
                      documentoPreview.ruta_archivo.toLowerCase().endsWith('.png')) ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${documentoPreview.ruta_archivo}`}
                      alt="Vista previa"
                      className="max-w-full max-h-[600px] rounded-lg shadow-lg"
                    />
                  ) : (
                    <div className="text-center">
                      <FaFileAlt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        No se puede mostrar una vista previa de este tipo de archivo.
                      </p>
                      <button
                        onClick={() => handleDescargarDocumento(documentoPreview.id)}
                        className="mt-4 px-6 py-3 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition-colors duration-200 inline-flex items-center"
                      >
                        <FaFileDownload className="mr-2" />
                        Descargar Documento
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all duration-200"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => handleDescargarDocumento(documentoPreview.id)}
                  className="px-8 py-3 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center"
                >
                  <FaFileDownload className="mr-2" />
                  Descargar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmpleadoDetail;