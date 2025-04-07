import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaEdit, FaTrash, FaEye, FaFileDownload, FaUpload, FaUserGraduate, FaMoneyBillWave, FaFileInvoice, FaBook, FaGraduationCap, FaChalkboardTeacher } from 'react-icons/fa';
import AdminLayout from '../layout/AdminLayout';
import { formatearFecha, tipoDocumentoFormateado, formatearNombreGrado } from '../../../utils/formatters';

const EstudianteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Estados para almacenar los datos
  const [estudiante, setEstudiante] = useState(null);
  const [representante, setRepresentante] = useState(null);
  const [grado, setGrado] = useState(null);
  const [seccion, setSeccion] = useState(null);
  const [materias, setMaterias] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [documentosRequeridos, setDocumentosRequeridos] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [annoEscolar, setAnnoEscolar] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  
  // Estados para el modal de documentos
  const [showModal, setShowModal] = useState(false);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [subiendoDocumento, setSubiendoDocumento] = useState(false);
  const fileInputRef = useRef(null);
  
  // Cargar datos del estudiante
  useEffect(() => {
    const fetchEstudianteData = async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem('token');
          
          if (!token) {
            navigate('/login');
            return;
          }
          
          const config = {
            headers: { 'Authorization': `Bearer ${token}` }
          };
          
          // Obtener datos del estudiante
          const estudianteResponse = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas/${id}`,
            config
          );
          
          setEstudiante(estudianteResponse.data);
          
          // Obtener año escolar activo
          const annoResponse = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/anno-escolar/actual`,
            config
          );
          
          setAnnoEscolar(annoResponse.data);
          
        // Obtener información académica del estudiante
        try {
            // Obtener el grado del estudiante directamente
            const gradoResponse = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados/estudiante/${id}`,
            { 
                ...config,
                params: { annoEscolarID: annoResponse.data.id }
            }
            );
            
            if (gradoResponse.data && gradoResponse.data.length > 0) {
            // Tomamos el primer grado (asumiendo que un estudiante está en un solo grado por año escolar)
            setGrado(gradoResponse.data[0]);
            
            // Obtener información de la sección usando la ruta directa de secciones
            try {
                const seccionResponse = await axios.get(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/secciones/estudiante/${id}`,
                { 
                    ...config,
                    params: { annoEscolarID: annoResponse.data.id }
                }
                );
                
                if (seccionResponse.data && seccionResponse.data.length > 0) {
                setSeccion(seccionResponse.data[0]);
                }
            } catch (seccionError) {
                console.error('Error al obtener sección:', seccionError);
                // No interrumpir el flujo si falla
            }
            }
        } catch (gradoError) {
            console.error('Error al obtener grado:', gradoError);
            // No interrumpir el flujo si falla esta petición
        }
        
        // Obtener información del representante directamente
        try {
            const representanteResponse = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas/estudiante/${id}/representante`,
            config
            );
            
            if (representanteResponse.data) {
            setRepresentante(representanteResponse.data);
            }
        } catch (representanteError) {
            console.error('Error al obtener representante:', representanteError);
            // No interrumpir el flujo si falla
        }

            // Obtener materias del estudiante
            try {
            // Primero verificamos si tenemos el grado del estudiante
            if (grado && grado.id && annoEscolar && annoEscolar.id) {
                const materiasResponse = await axios.get(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados/${grado.id}/materias`,
                { 
                    ...config,
                    params: { annoEscolarID: annoEscolar.id }
                }
                );
                setMaterias(materiasResponse.data);
            }
            } catch (materiasError) {
            console.error('Error al obtener materias:', materiasError);
            setMaterias([]);
            }

            // Obtener evaluaciones del estudiante
            try {
            const evaluacionesResponse = await axios.get(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/evaluaciones/estudiante/${id}`,
                { 
                ...config,
                params: { annoEscolarID: annoEscolar?.id }
                }
            );
            setEvaluaciones(evaluacionesResponse.data);
            } catch (evaluacionesError) {
            console.error('Error al obtener evaluaciones:', evaluacionesError);
            setEvaluaciones([]);
            }

            // Obtener calificaciones del estudiante
            try {
            // Usar la nueva ruta para obtener el resumen de calificaciones
            const calificacionesResponse = await axios.get(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/calificaciones/resumen/estudiante/${id}`,
                { 
                ...config,
                params: { annoEscolarID: annoEscolar?.id }
                }
            );
            
            // Si la respuesta tiene el formato esperado
            if (calificacionesResponse.data && calificacionesResponse.data.materias) {
                setCalificaciones(calificacionesResponse.data.materias);
            } else {
                // Fallback a la ruta antigua si es necesario
                const calificacionesAntiguasResponse = await axios.get(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/calificaciones/estudiante/${id}`,
                { 
                    ...config,
                    params: { annoEscolarID: annoEscolar?.id }
                }
                );
                setCalificaciones(calificacionesAntiguasResponse.data);
            }
            } catch (calificacionesError) {
            console.error('Error al obtener calificaciones:', calificacionesError);
            setCalificaciones([]);
            
            // Intentar con la ruta antigua como fallback
            try {
                const calificacionesAntiguasResponse = await axios.get(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/calificaciones/estudiante/${id}`,
                { 
                    ...config,
                    params: { annoEscolarID: annoEscolar?.id }
                }
                );
                setCalificaciones(calificacionesAntiguasResponse.data);
            } catch (error) {
                console.error('Error al obtener calificaciones (fallback):', error);
                setCalificaciones([]);
            }
            }

            // Obtener documentos del estudiante
            try {
                const documentosResponse = await axios.get(
                  `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/persona/${id}`,
                  config
                );
                setDocumentos(documentosResponse.data);
                
                // Obtener tipos de documentos requeridos
                const tiposDocumentosResponse = await axios.get(
                  `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/verificar/${id}/estudiante`,
                  config
                );
                
                setDocumentosRequeridos(tiposDocumentosResponse.data.documentosRequeridos);


              } catch (documentosError) {
                console.error('Error al obtener documentos:', documentosError);
                setDocumentos([]);
                setDocumentosRequeridos([]);
              }

            // Función auxiliar para validar fechas
            const isValidDate = (dateString) => {
                if (!dateString) return false;
                const date = new Date(dateString);
                return !isNaN(date.getTime());
            };

            // Preparar datos para edición
            setEditData({
            nombre: estudianteResponse.data.nombre || '',
            apellido: estudianteResponse.data.apellido || '',
            cedula: estudianteResponse.data.cedula || '',
            fechaNacimiento: isValidDate(estudianteResponse.data.fechaNacimiento) ? new Date(estudianteResponse.data.fechaNacimiento).toISOString().split('T')[0] : '',
            genero: estudianteResponse.data.genero || '',
            telefono: estudianteResponse.data.telefono || '',
            email: estudianteResponse.data.email || '',
            direccion: estudianteResponse.data.direccion || '',
            observaciones: estudianteResponse.data.observaciones || ''
            });

            setLoading(false);
            } catch (error) {
            console.error('Error al cargar datos del estudiante:', error);
            setError('Error al cargar los datos del estudiante. Por favor, intente nuevamente.');
            setLoading(false);
            }
            };

      
    
    fetchEstudianteData();
  }, [id, navigate]);
  
  // Manejar cambios en el formulario de edición
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]: value
    });
  };
  
  // Guardar cambios en el estudiante
  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas/${id}`,
        editData,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // Actualizar datos del estudiante
      const estudianteResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas/${id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setEstudiante(estudianteResponse.data);
      setIsEditing(false);
      setSuccess('Datos del estudiante actualizados correctamente');
      
      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
      setLoading(false);
    } catch (err) {
      console.error('Error al guardar cambios:', err);
      setError('Error al guardar los cambios. Por favor, intente nuevamente.');
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
  
    // Función para abrir modal de subida/resubida
    const handleOpenUploadModal = (tipoDocumento) => {
        // Buscar si ya existe un documento de este tipo
        const documentoExistente = documentos.find(doc => doc.tipoDocumento === tipoDocumento.id);
        
        setDocumentoSeleccionado({
          ...tipoDocumento,
          documentoExistente
        });
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
  
    // Función para subir/resubir documento
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
          formData.append('personaID', id);
          formData.append('tipoDocumento', documentoSeleccionado.id);
          formData.append('descripcion', `Documento ${documentoSeleccionado.nombre} del estudiante`);
          
          let response;
          
          if (documentoSeleccionado.documentoExistente) {
            // Actualizar documento existente
            response = await axios.put(
              `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/${documentoSeleccionado.documentoExistente.id}`,
              formData,
              {
                headers: {
                  'Content-Type': 'multipart/form-data',
                  'Authorization': `Bearer ${token}`
                }
              }
            );
            
            setSuccess('Documento actualizado correctamente');
          } else {
            // Subir nuevo documento
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
            
            setSuccess('Documento subido correctamente');
          }
          
          // Actualizar lista de documentos
          const documentosResponse = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/persona/${id}`,
            {
              headers: { 'Authorization': `Bearer ${token}` }
            }
          );
          
          setDocumentos(documentosResponse.data);
          
          // Actualizar lista de documentos requeridos
          const documentosRequeridosResponse = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/verificar/${id}/estudiante`,
            {
              headers: { 'Authorization': `Bearer ${token}` }
            }
          );
          
          setDocumentosRequeridos(documentosRequeridosResponse.data.documentosRequeridos);
          
          // Cerrar modal
          handleCloseModal();
          
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
  
    // Función para eliminar documento
    const handleDeleteDocument = async (documentoId) => {
        if (!confirm('¿Está seguro de eliminar este documento?')) {
          return;
        }
        
        try {
          setLoading(true);
          const token = localStorage.getItem('token');
          
          await axios.delete(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/${documentoId}`,
            {
              headers: { 'Authorization': `Bearer ${token}` }
            }
          );
          
          // Actualizar lista de documentos
          const documentosResponse = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/persona/${id}`,
            {
              headers: { 'Authorization': `Bearer ${token}` }
            }
          );
          
          setDocumentos(documentosResponse.data);
          
          // Actualizar lista de documentos requeridos
          const documentosRequeridosResponse = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/verificar/${id}/estudiante`,
            {
              headers: { 'Authorization': `Bearer ${token}` }
            }
          );
          
          setDocumentosRequeridos(documentosRequeridosResponse.data.documentosRequeridos);
          
          setSuccess('Documento eliminado correctamente');
          
          // Ocultar mensaje de éxito después de 3 segundos
          setTimeout(() => {
              setSuccess('');
          }, 3000);
          
          setLoading(false);
        } catch (err) {
            console.error('Error al eliminar documento:', err);
            setError('Error al eliminar el documento. Por favor, intente nuevamente.');
            setLoading(false);
        }
    };
    
    // Función para previsualizar documento
    const handlePreviewDocument = (documento) => {
        window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${documento.urlDocumento}`, '_blank');
    };

    // Función para descargar documento
    const handleDownloadDocument = async (documentoId) => {
      try {
        const token = localStorage.getItem('token');
        
        window.open(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/download/${documentoId}`,
          '_blank'
        );
      } catch (err) {
        console.error('Error al descargar documento:', err);
        setError('Error al descargar el documento. Por favor, intente nuevamente.');
      }
    };

    // Función para obtener thumbnail según tipo de documento
    const getThumbnail = (documento) => {
        const tipo = documento.tipo_archivo || '';
        
        if (tipo.includes('image')) {
        return (
            <img 
            src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/${documento.id}/download`} 
            alt={documento.nombre_archivo}
            className="h-16 w-16 object-cover rounded"
            />
        );
        } else if (tipo.includes('pdf')) {
        return (
            <div className="h-16 w-16 flex items-center justify-center bg-red-100 rounded">
            <span className="text-red-600 text-xs font-bold">PDF</span>
            </div>
        );
        } else if (tipo.includes('word') || tipo.includes('document')) {
        return (
            <div className="h-16 w-16 flex items-center justify-center bg-blue-100 rounded">
            <span className="text-blue-600 text-xs font-bold">DOC</span>
            </div>
        );
        } else {
        return (
            <div className="h-16 w-16 flex items-center justify-center bg-gray-100 rounded">
            <span className="text-gray-600 text-xs font-bold">FILE</span>
            </div>
        );
        }
    };

  // Calcular progreso académico por materia
  const calcularProgresoMateria = (materiaId) => {
    const calificacionesMateria = calificaciones.filter(cal => cal.materiaID === materiaId);
    
    if (calificacionesMateria.length === 0) {
      return {
        promedio: 0,
        porcentajeCompletado: 0,
        calificaciones: []
      };
    }
    
    const suma = calificacionesMateria.reduce((acc, cal) => acc + parseFloat(cal.valor || 0), 0);
    const promedio = suma / calificacionesMateria.length;
    
    // Calcular porcentaje de evaluaciones completadas
    const evaluacionesMateria = evaluaciones.filter(ev => ev.materiaID === materiaId);
    const porcentajeCompletado = evaluacionesMateria.length > 0 
      ? (calificacionesMateria.length / evaluacionesMateria.length) * 100 
      : 0;
    
    return {
      promedio: promedio.toFixed(2),
      porcentajeCompletado: Math.round(porcentajeCompletado),
      calificaciones: calificacionesMateria
    };
  };
  
  if (loading && !estudiante) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Botón de regreso */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/estudiantes')}
            className="flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <FaArrowLeft className="mr-2" /> Volver a la lista de estudiantes
          </button>
        </div>
        
        {/* Mensajes de error y éxito */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}
        
        {estudiante && (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {/* Encabezado con nombre del estudiante */}
            <div className="bg-indigo-600 text-white px-6 py-4">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">
                  {estudiante.nombre} {estudiante.apellido}
                </h1>
                <div className="flex space-x-2">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-white text-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-100"
                    >
                      <FaEdit className="inline mr-2" /> Editar
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveChanges}
                        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                        disabled={loading}
                      >
                        {loading ? 'Guardando...' : 'Guardar'}
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Pestañas de navegación */}
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'info'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Información Personal
                </button>
                <button
                  onClick={() => setActiveTab('academico')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'academico'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Información Académica
                </button>
                <button
                  onClick={() => setActiveTab('materias')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'materias'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Materias y Progreso
                </button>
                <button
                  onClick={() => setActiveTab('documentos')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'documentos'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Documentos
                </button>
                <button
                  onClick={() => setActiveTab('calificaciones')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'calificaciones'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Calificaciones
                </button>
              </nav>
            </div>
            
            {/* Contenido principal */}
            <div className="p-6">
              {/* Información personal */}
              {activeTab === 'info' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Información del Estudiante</h2>
                  
                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input
                          type="text"
                          name="nombre"
                          value={editData.nombre}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                        <input
                          type="text"
                          name="apellido"
                          value={editData.apellido}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cédula</label>
                        <input
                          type="text"
                          name="cedula"
                          value={editData.cedula}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                        <input
                          type="date"
                          name="fechaNacimiento"
                          value={editData.fechaNacimiento ? editData.fechaNacimiento.substring(0, 10) : ''}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
                        <select
                          name="genero"
                          value={editData.genero}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">Seleccionar</option>
                          <option value="masculino">Masculino</option>
                          <option value="femenino">Femenino</option>
                          <option value="otro">Otro</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                        <input
                          type="text"
                          name="telefono"
                          value={editData.telefono}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={editData.email}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                        <textarea
                          name="direccion"
                          value={editData.direccion}
                          onChange={handleEditChange}
                          rows="2"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        ></textarea>
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                        <textarea
                          name="observaciones"
                          value={editData.observaciones}
                          onChange={handleEditChange}
                          rows="3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        ></textarea>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Cédula</h3>
                        <p className="mt-1 text-sm text-gray-900">{estudiante.cedula || 'No especificada'}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Fecha de Nacimiento</h3>
                        <p className="mt-1 text-sm text-gray-900">
                          {estudiante.fechaNacimiento ? formatearFecha(estudiante.fechaNacimiento) : 'No especificada'}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Género</h3>
                        <p className="mt-1 text-sm text-gray-900">
                          {estudiante.genero ? estudiante.genero.charAt(0).toUpperCase() + estudiante.genero.slice(1) : 'No especificado'}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Teléfono</h3>
                        <p className="mt-1 text-sm text-gray-900">{estudiante.telefono || 'No especificado'}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Email</h3>
                        <p className="mt-1 text-sm text-gray-900">{estudiante.email || 'No especificado'}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Dirección</h3>
                        <p className="mt-1 text-sm text-gray-900">{estudiante.direccion || 'No especificada'}</p>
                      </div>
                      
                      <div className="md:col-span-2">
                        <h3 className="text-sm font-medium text-gray-500">Observaciones</h3>
                        <p className="mt-1 text-sm text-gray-900">{estudiante.observaciones || 'No hay observaciones'}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Información del representante */}
                  <div className="mt-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Representante</h2>
                    
                    {representante ? (
                      <div className="bg-gray-50 p-4 rounded-md">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Nombre</h3>
                            <p className="mt-1 text-sm text-gray-900">
                              {representante.nombre} {representante.apellido}
                            </p>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Cédula</h3>
                            <p className="mt-1 text-sm text-gray-900">{representante.cedula}</p>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Teléfono</h3>
                            <p className="mt-1 text-sm text-gray-900">{representante.telefono || 'No especificado'}</p>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Email</h3>
                            <p className="mt-1 text-sm text-gray-900">{representante.email || 'No especificado'}</p>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex justify-end">
                          <Link
                            to={`/admin/representantes/${representante.id}`}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                          >
                            <FaEye className="mr-2" /> Ver Detalles del Representante
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 p-4 rounded-md">
                        <p className="text-yellow-700">No hay representante asignado a este estudiante.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Información académica */}
              {activeTab === 'academico' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Información Académica</h2>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Año Escolar</h3>
                        <p className="mt-1 text-sm text-gray-900">
                          {annoEscolar ? annoEscolar.periodo : 'No disponible'}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Grado</h3>
                        <p className="mt-1 text-sm text-gray-900">
                          {grado ? formatearNombreGrado(grado.nombre_grado) : 'No asignado'}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Sección</h3>
                        <p className="mt-1 text-sm text-gray-900">
                          {seccion ? seccion.nombre_seccion : 'No asignada'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Resumen académico */}
                    <div className="mt-6">
                      <h3 className="text-md font-medium text-gray-700 mb-2">Resumen Académico</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-md shadow-sm">
                          <h4 className="text-sm font-medium text-gray-500">Materias Cursadas</h4>
                          <p className="mt-1 text-xl font-semibold text-gray-900">{materias.length}</p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-md shadow-sm">
                          <h4 className="text-sm font-medium text-gray-500">Evaluaciones</h4>
                          <p className="mt-1 text-xl font-semibold text-gray-900">{evaluaciones.length}</p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-md shadow-sm">
                          <h4 className="text-sm font-medium text-gray-500">Promedio General</h4>
                          <p className="mt-1 text-xl font-semibold text-gray-900">
                            {calificaciones.length > 0 
                              ? (calificaciones.reduce((acc, cal) => acc + parseFloat(cal.valor || 0), 0) / calificaciones.length).toFixed(2)
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Materias y progreso */}
              {activeTab === 'materias' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Materias y Progreso Académico</h2>
                  
                  {materias.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                      {materias.map(materia => {
                        const progreso = calcularProgresoMateria(materia.id);
                        
                        return (
                          <div key={materia.id} className="bg-gray-50 p-4 rounded-md">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">{materia.asignatura}</h3>
                                <p className="text-sm text-gray-500 mt-1">{materia.descripcion || 'Sin descripción'}</p>
                              </div>
                              
                              <div className="text-right">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Promedio: {progreso.promedio}
                                </span>
                              </div>
                            </div>
                            
                            {/* Barra de progreso */}
                            <div className="mt-4">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-medium text-gray-500">Progreso del curso</span>
                                <span className="text-xs font-medium text-gray-500">{progreso.porcentajeCompletado}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className="bg-blue-600 h-2.5 rounded-full" 
                                  style={{ width: `${progreso.porcentajeCompletado}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            {/* Calificaciones de la materia */}
                            {progreso.calificaciones.length > 0 ? (
                              <div className="mt-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Calificaciones</h4>
                                <div className="overflow-x-auto">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Evaluación
                                        </th>
                                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Tipo
                                        </th>
                                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Fecha
                                        </th>
                                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Calificación
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                      {progreso.calificaciones.map(calificacion => {
                                        const evaluacion = evaluaciones.find(ev => ev.id === calificacion.evaluacionID);
                                        
                                        return (
                                          <tr key={calificacion.id}>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                              {evaluacion ? evaluacion.titulo : 'No disponible'}
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                              {evaluacion ? evaluacion.tipo : 'No disponible'}
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                              {calificacion.fecha ? formatearFecha(calificacion.fecha) : 'No disponible'}
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap">
                                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                parseFloat(calificacion.valor) >= 10 
                                                  ? 'bg-green-100 text-green-800' 
                                                  : 'bg-red-100 text-red-800'
                                              }`}>
                                                {calificacion.valor}
                                              </span>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            ) : (
                              <div className="mt-4 text-sm text-gray-500">
                                No hay calificaciones registradas para esta materia.
                              </div>
                            )}
                            
                            {/* Próximas evaluaciones */}
                            <div className="mt-4">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Próximas Evaluaciones</h4>
                              {evaluaciones.filter(ev => 
                                ev.materiaID === materia.id && 
                                new Date(ev.fecha) > new Date() && 
                                !progreso.calificaciones.some(cal => cal.evaluacionID === ev.id)
                              ).length > 0 ? (
                                <ul className="space-y-2">
                                  {evaluaciones
                                    .filter(ev => 
                                      ev.materiaID === materia.id && 
                                      new Date(ev.fecha) > new Date() && 
                                      !progreso.calificaciones.some(cal => cal.evaluacionID === ev.id)
                                    )
                                    .map(ev => (
                                      <li key={ev.id} className="flex justify-between items-center p-2 bg-white rounded-md shadow-sm">
                                        <div>
                                          <span className="font-medium text-sm">{ev.titulo}</span>
                                          <p className="text-xs text-gray-500">{ev.tipo}</p>
                                        </div>
                                        <span className="text-xs text-gray-500">{formatearFecha(ev.fecha)}</span>
                                      </li>
                                    ))
                                  }
                                </ul>
                              ) : (
                                <p className="text-sm text-gray-500">No hay evaluaciones pendientes.</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-yellow-50 p-4 rounded-md">
                      <p className="text-yellow-700">No hay materias asignadas para este estudiante.</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Documentos */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Documentos del Estudiante
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Documentos requeridos y subidos por el estudiante.
                  </p>
                </div>
                
                <div className="border-t border-gray-200">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {documentosRequeridos.map((doc) => {
                        // Buscar si existe un documento subido de este tipo
                        const documentoSubido = documentos.find(d => d.tipoDocumento === doc.id);
                        
                        return (
                          <div key={doc.id} className="border rounded-lg overflow-hidden">
                            <div className={`p-4 ${documentoSubido ? 'bg-green-50' : 'bg-gray-50'}`}>
                              <div className="flex justify-between items-start">
                                <h4 className="text-sm font-medium text-gray-900">
                                  {doc.nombre} {doc.obligatorio && <span className="text-red-500">*</span>}
                                </h4>
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${documentoSubido ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                  {documentoSubido ? 'Subido' : 'Pendiente'}
                                </span>
                              </div>
                            </div>
                            
                            {documentoSubido ? (
                              <div className="p-4">
                                <div className="flex items-center space-x-4">
                                  {/* Miniatura del documento */}
                                  <div className="flex-shrink-0">
                                    {getThumbnail(documentoSubido)}
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {documentoSubido.nombre_archivo}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {(documentoSubido.tamano / 1024).toFixed(2)} KB
                                    </p>
                                  </div>
                                  
                                  <div className="flex-shrink-0 flex space-x-2">
                                    <button
                                      onClick={() => handlePreviewDocument(documentoSubido)}
                                      className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                      title="Ver documento"
                                    >
                                      <FaEye className="h-4 w-4" />
                                    </button>
                                    
                                    <button
                                      onClick={() => handleDownloadDocument(documentoSubido.id)}
                                      className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                      title="Descargar documento"
                                    >
                                      <FaFileDownload className="h-4 w-4" />
                                    </button>
                                    
                                    <button
                                      onClick={() => handleOpenUploadModal(doc)}
                                      className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                      title="Resubir documento"
                                    >
                                      <FaUpload className="h-4 w-4" />
                                    </button>
                                    
                                    <button
                                      onClick={() => handleDeleteDocument(documentoSubido.id)}
                                      className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                      title="Eliminar documento"
                                    >
                                      <FaTrash className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="p-4">
                                <button
                                  onClick={() => handleOpenUploadModal(doc)}
                                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                  <FaUpload className="mr-2" /> Subir documento
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Modal para subir/resubir documentos */}
              {showModal && (
              <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                  {/* Overlay de fondo */}
                  <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={handleCloseModal}></div>

                  {/* Centrar el modal */}
                  <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                  {/* Modal */}
                  <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                      <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                          <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                            {documentoSeleccionado?.documentoExistente ? 'Actualizar documento' : 'Subir documento'}
                          </h3>
                          <div className="mt-2">
                            <p className="text-sm text-gray-500 mb-4">
                              {documentoSeleccionado?.documentoExistente 
                                ? `Seleccione un nuevo archivo para reemplazar el documento "${documentoSeleccionado.nombre}"`
                                : `Seleccione un archivo para el documento "${documentoSeleccionado?.nombre}"`}
                            </p>
                            
                            {error && (
                              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                                <div className="flex">
                                  <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                  <div className="ml-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                              <div className="space-y-1 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <div className="flex text-sm text-gray-600">
                                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                    <span>Seleccionar archivo</span>
                                    <input 
                                      id="file-upload" 
                                      name="file-upload" 
                                      type="file" 
                                      className="sr-only" 
                                      onChange={handleFileChange}
                                      ref={fileInputRef}
                                    />
                                  </label>
                                  <p className="pl-1">o arrastre y suelte</p>
                                </div>
                                <p className="text-xs text-gray-500">
                                  PNG, JPG, PDF, DOC hasta 10MB
                                </p>
                              </div>
                            </div>
                            
                            {archivoSeleccionado && (
                              <div className="mt-4 p-2 bg-gray-50 rounded-md">
                                <div className="flex items-center">
                                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                  </svg>
                                  <span className="text-sm text-gray-900">{archivoSeleccionado.name}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                      <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={handleUploadDocument}
                        disabled={subiendoDocumento || !archivoSeleccionado}
                      >
                        {subiendoDocumento ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Subiendo...
                          </>
                        ) : documentoSeleccionado?.documentoExistente ? 'Actualizar' : 'Subir'}
                      </button>
                      <button
                        type="button"
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={handleCloseModal}
                        disabled={subiendoDocumento}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              )}
              {/* Calificaciones */}
              {activeTab === 'calificaciones' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Calificaciones</h2>
                  
                  {calificaciones.length > 0 ? (
                    <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Materia
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Evaluación
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tipo
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Calificación
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Fecha
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {calificaciones.map(calificacion => {
                            const evaluacion = evaluaciones.find(ev => ev.id === calificacion.evaluacionID);
                            const materia = materias.find(m => m.id === (evaluacion?.materiaID || calificacion.materiaID));
                            
                            return (
                              <tr key={calificacion.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {materia?.asignatura || 'No disponible'}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {evaluacion?.titulo || 'No disponible'}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-500">
                                    {evaluacion?.tipo || 'No especificado'}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className={`text-sm font-medium ${
                                    parseFloat(calificacion.valor) >= 10 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {calificacion.valor}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-500">
                                    {formatearFecha(calificacion.fecha || calificacion.createdAt)}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-gray-500">No hay calificaciones registradas para este estudiante.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Modal para subir documentos */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {documentoSeleccionado.documentoExistente ? 'Actualizar' : 'Subir'} {documentoSeleccionado.nombre}
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar archivo
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Formatos aceptados: PDF, JPG, PNG (máx. 5MB)
                </p>
              </div>
              
              {documentoSeleccionado.documentoExistente && (
                <div className="mb-4 p-3 bg-yellow-50 rounded-md">
                  <p className="text-sm text-yellow-700">
                    Ya existe un documento de este tipo. Si sube un nuevo archivo, reemplazará al anterior.
                  </p>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUploadDocument}
                  disabled={!archivoSeleccionado || subiendoDocumento}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    !archivoSeleccionado || subiendoDocumento
                      ? 'bg-indigo-300'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {subiendoDocumento ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Subiendo...
                    </>
                  ) : documentoSeleccionado.documentoExistente ? 'Actualizar Documento' : 'Subir Documento'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default EstudianteDetail;
