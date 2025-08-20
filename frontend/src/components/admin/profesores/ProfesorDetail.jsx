import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaEdit, 
  FaTrash, 
  FaArrowLeft, 
  FaPlus, 
  FaFileAlt, 
  FaBook, 
  FaChalkboardTeacher, 
  FaUserGraduate, 
  FaTimes,
  FaUsers,
  FaGraduationCap,
  FaCalendarAlt,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaIdCard,
  FaClipboardList,
  FaFileDownload,
  FaUpload,
  FaCheck,
  FaEye,
  FaSave,
  FaSpinner,
  FaFilter,
  FaSearch,
  FaDownload,
  FaHistory,
  FaLock,
  FaUnlock,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaChartLine,
  FaStickyNote,
  FaUser
} from 'react-icons/fa';
import { formatearFecha, formatearNombreGrado } from '../../../utils/formatters';

const ProfesorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Estados principales
  const [profesor, setProfesor] = useState(null);
  const [materias, setMaterias] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [grados, setGrados] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('info');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [annoEscolar, setAnnoEscolar] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Estados para filtros y búsquedas
  const [filtroMateria, setFiltroMateria] = useState('');
  const [filtroGrado, setFiltroGrado] = useState('');
  const [filtroLapso, setFiltroLapso] = useState('');
  const [filtroTipoEvaluacion, setFiltroTipoEvaluacion] = useState('');
  const [busquedaEvaluacion, setBusquedaEvaluacion] = useState('');
  const [busquedaEstudiante, setBusquedaEstudiante] = useState('');
  
  // Estados para configuración de bloqueo
  const [configuracionBloqueo, setConfiguracionBloqueo] = useState(null);
  const [showConfigBloqueoModal, setShowConfigBloqueoModal] = useState(false);
  const [bloqueoForm, setBloqueoForm] = useState({
    fechaLimite: '',
    activo: false,
    mensaje: ''
  });
  
  // Estados para edición de calificaciones
  const [editingCalificacion, setEditingCalificacion] = useState(null);
  const [calificacionForm, setCalificacionForm] = useState({
    nota: '',
    observaciones: ''
  });
  const [savingCalificacion, setSavingCalificacion] = useState(false);
  
  // Estados para historial
  const [showHistorialModal, setShowHistorialModal] = useState(false);
  const [historialCalificacion, setHistorialCalificacion] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

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

  // Estados para modales
  const [showAsignMateriaModal, setShowAsignMateriaModal] = useState(false);
  const [showAsignGradoModal, setShowAsignGradoModal] = useState(false);
  
  // Estados para formularios
  const [asignMateriaForm, setAsignMateriaForm] = useState({
    materiaID: '',
    gradoID: '',
    annoEscolarID: ''
  });
  
  const [asignGradoForm, setAsignGradoForm] = useState({
    gradoID: '',
    annoEscolarID: ''
  });
  
  // Estados para listas de opciones
  const [materiasDisponibles, setMateriasDisponibles] = useState([]);
  const [gradosDisponibles, setGradosDisponibles] = useState([]);
  
  // Estados adicionales para asignación de materias
  const [gradoSeleccionado, setGradoSeleccionado] = useState('');
  const [materiasPorGrado, setMateriasPorGrado] = useState([]);

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
        
        // Obtener año escolar actual
        const annoResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/anno-escolar/actual`,
          config
        );
        setAnnoEscolar(annoResponse.data);
        
        // Obtener datos del profesor
        const profesorResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas/${id}`,
          config
        );
        
        if (profesorResponse.data.tipo !== 'profesor') {
          throw new Error('La persona seleccionada no es un profesor');
        }
        
        setProfesor(profesorResponse.data);
        
        // Obtener materias asignadas al profesor con información de grados
        const materiasResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias/profesor/${id}`,
          { 
            ...config,
            params: { annoEscolarID: annoResponse.data.id }
          }
        );
        
        setMaterias(Array.isArray(materiasResponse.data) ? materiasResponse.data : []);

        // Obtener evaluaciones creadas por el profesor
        const evaluacionesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/evaluaciones/profesor/${id}`,
          { 
            ...config,
            params: { annoEscolarID: annoResponse.data.id }
          }
        );
        setEvaluaciones(Array.isArray(evaluacionesResponse.data) ? evaluacionesResponse.data : []);
        
        // Obtener grados asignados al profesor
        const gradosResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados/profesor/${id}`,
          { 
            ...config,
            params: { annoEscolarID: annoResponse.data.id }
          }
        );
        setGrados(Array.isArray(gradosResponse.data) ? gradosResponse.data : []);
        
        // Obtener estudiantes del profesor
        const estudiantesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas/profesor/${id}/estudiantes`,
          { 
            ...config,
            params: { annoEscolarID: annoResponse.data.id }
          }
        );
        setEstudiantes(Array.isArray(estudiantesResponse.data) ? estudiantesResponse.data : []);
        
        // Obtener calificaciones de las evaluaciones del profesor
        const calificacionesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/calificaciones/profesor/${id}`,
          { 
            ...config,
            params: { annoEscolarID: annoResponse.data.id }
          }
        );
        setCalificaciones(Array.isArray(calificacionesResponse.data) ? calificacionesResponse.data : []);
        
        // Obtener documentos del profesor
        const documentosResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/persona/${id}`,
          config
        );
        setDocumentos(Array.isArray(documentosResponse.data) ? documentosResponse.data : []);

        // Obtener documentos requeridos para profesores
        try {
          const documentosRequeridosResponse = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/verificar/${id}/profesor`,
            config
          );
          setDocumentosRequeridos(documentosRequeridosResponse.data.documentosRequeridos || []);
        } catch (documentosRequeridosError) {
          console.error('Error al obtener documentos requeridos:', documentosRequeridosError.response?.data || documentosRequeridosError.message);
          setDocumentosRequeridos([]);
        }
        
        // Obtener configuración de bloqueo de calificaciones
        try {
          const bloqueoResponse = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/configuracion/bloqueo-calificaciones`,
            config
          );
          setConfiguracionBloqueo(bloqueoResponse.data);
        } catch (bloqueoError) {
          console.log('No hay configuración de bloqueo establecida');
          setConfiguracionBloqueo(null);
        }
        
        // Obtener todas las materias disponibles para asignar
        const todasMateriasResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias`,
          config
        );
        setMateriasDisponibles(Array.isArray(todasMateriasResponse.data) ? todasMateriasResponse.data : []);
        
        // Obtener todos los grados disponibles para asignar
        const todosGradosResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados`,
          config
        );
        setGradosDisponibles(Array.isArray(todosGradosResponse.data) ? todosGradosResponse.data : []);
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar datos del profesor:', err);
        setError(err.response?.data?.message || 'Error al cargar los datos del profesor. Por favor, intente nuevamente.');
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
      
      navigate('/admin/profesores', { 
        state: { message: 'Profesor eliminado correctamente' } 
      });
    } catch (err) {
      console.error('Error al eliminar profesor:', err);
      setError('Error al eliminar el profesor. Por favor, intente nuevamente.');
    }
  };

  // Función para asignar materia a profesor
  const handleAsignarMateria = async (e) => {
    e.preventDefault();
    
    if (!gradoSeleccionado || !asignMateriaForm.materiaID) {
      setError('Por favor, seleccione un grado y una materia');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      
      // Asignar materia al profesor
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias/asignar-profesor`,
        {
          profesorID: id,
          materiaID: asignMateriaForm.materiaID,
          gradoID: gradoSeleccionado,
          annoEscolarID: annoEscolar.id
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // Actualizar lista de materias
      const materiasResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias/profesor/${id}`,
        { 
          headers: { 'Authorization': `Bearer ${token}` },
          params: { annoEscolarID: annoEscolar.id }
        }
      );
      
      setMaterias(Array.isArray(materiasResponse.data) ? materiasResponse.data : []);
      
      // Cerrar modal y limpiar formulario
      setShowAsignMateriaModal(false);
      setAsignMateriaForm({ materiaID: '', gradoID: '' });
      setGradoSeleccionado('');
      setMateriasPorGrado([]);
      
      setSuccessMessage('Materia asignada correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      setLoading(false);
    } catch (err) {
      console.error('Error al asignar materia:', err);
      setError(err.response?.data?.message || 'Error al asignar la materia. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };
  
  
  // Función para asignar grado a profesor
  const handleAsignarGrado = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados/${asignGradoForm.gradoID}/asignar-profesor`,
        {
          profesorID: id,
          annoEscolarID: asignGradoForm.annoEscolarID || annoEscolar.id
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // Recargar los grados
      const gradosResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados/profesor/${id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setGrados(Array.isArray(gradosResponse.data) ? gradosResponse.data : []);
      
      setSuccessMessage('Grado asignado correctamente');
      setShowAsignGradoModal(false);
      setAsignGradoForm({
        gradoID: '',
        annoEscolarID: ''
      });
      
      setTimeout(() => setSuccessMessage(''), 3000);
      setLoading(false);
    } catch (err) {
      console.error('Error al asignar grado:', err);
      setError(err.response?.data?.message || 'Error al asignar el grado. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };
  
  // Función para eliminar materia asignada
  const handleEliminarMateria = async (materiaID, gradoID) => {
    if (!window.confirm('¿Está seguro de eliminar esta asignación? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      setLoading(true);
      
      await axios.delete(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias/profesor/${id}/${materiaID}/${gradoID}/${annoEscolar.id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // Recargar las materias
      const materiasResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias/profesor/${id}`,
        { 
          headers: { 'Authorization': `Bearer ${token}` },
          params: { annoEscolarID: annoEscolar.id, includeGrados: true }
        }
      );
      setMaterias(Array.isArray(materiasResponse.data) ? materiasResponse.data : []);
      
      setSuccessMessage('Asignación eliminada correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      setLoading(false);
    } catch (err) {
      console.error('Error al eliminar asignación:', err);
      setError(err.response?.data?.message || 'Error al eliminar la asignación. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };

  // Función para editar calificación
  const handleEditCalificacion = (calificacion) => {
    setEditingCalificacion(calificacion.id);
    setCalificacionForm({
      nota: calificacion.nota || '',
      observaciones: calificacion.observaciones || ''
    });
  };

  // Función para guardar calificación editada
  const handleSaveCalificacion = async (calificacionID) => {
    try {
      setSavingCalificacion(true);
      
      await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/calificaciones/${calificacionID}`,
        calificacionForm,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // Recargar calificaciones
      const calificacionesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/calificaciones/profesor/${id}`,
        { 
          headers: { 'Authorization': `Bearer ${token}` },
          params: { annoEscolarID: annoEscolar.id }
        }
      );
      setCalificaciones(Array.isArray(calificacionesResponse.data) ? calificacionesResponse.data : []);
      
      setEditingCalificacion(null);
      setCalificacionForm({ nota: '', observaciones: '' });
      setSuccessMessage('Calificación actualizada correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      setSavingCalificacion(false);
    } catch (err) {
      console.error('Error al actualizar calificación:', err);
      setError(err.response?.data?.message || 'Error al actualizar la calificación.');
      setSavingCalificacion(false);
    }
  };

  // Función para ver historial de calificación
  const handleVerHistorial = async (calificacionID) => {
    try {
      setLoadingHistorial(true);
      setShowHistorialModal(true);
      
      const historialResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/calificaciones/${calificacionID}/historial`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setHistorialCalificacion(Array.isArray(historialResponse.data) ? historialResponse.data : []);
      setLoadingHistorial(false);
    } catch (err) {
      console.error('Error al obtener historial:', err);
      setError('Error al obtener el historial de la calificación.');
      setLoadingHistorial(false);
    }
  };

  // Función para configurar bloqueo de calificaciones
  const handleConfiguracionBloqueo = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/configuracion/bloqueo-calificaciones`,
        bloqueoForm,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // Recargar configuración
      const bloqueoResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/configuracion/bloqueo-calificaciones`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setConfiguracionBloqueo(bloqueoResponse.data);
      
      setShowConfigBloqueoModal(false);
      setSuccessMessage('Configuración de bloqueo actualizada correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      setLoading(false);
    } catch (err) {
      console.error('Error al configurar bloqueo:', err);
      setError(err.response?.data?.message || 'Error al configurar el bloqueo de calificaciones.');
      setLoading(false);
    }
  };

  // Función para verificar si las calificaciones están bloqueadas
  const isCalificacionesBloqueadas = () => {
    if (!configuracionBloqueo || !configuracionBloqueo.activo) return false;
    
    const fechaLimite = new Date(configuracionBloqueo.fechaLimite);
    const hoy = new Date();
    
    return hoy > fechaLimite;
  };

  // Función para exportar datos
  const exportarDatos = () => {
    const datos = {
      profesor: profesor,
      materias: materias,
      evaluaciones: evaluaciones,
      calificaciones: calificaciones,
      estudiantes: estudiantes
    };
    
    const dataStr = JSON.stringify(datos, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `profesor_${profesor.nombre}_${profesor.apellido}_datos.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Funciones para manejo de documentos
  const handleSubirDocumento = async () => {
    if (!archivoSeleccionado || !documentoSeleccionado) {
      setError('Por favor, seleccione un archivo y especifique el tipo de documento');
      return;
    }

    try {
      setSubiendoDocumento(true);
      setError('');

      const formData = new FormData();
      formData.append('documento', archivoSeleccionado); // Cambiar 'archivo' por 'documento'
      formData.append('tipoDocumento', documentoSeleccionado.nombre);
      formData.append('descripcion', documentoSeleccionado.descripcion || '');
      formData.append('personaID', id);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/upload`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Actualizar lista de documentos
      const documentosResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/persona/${id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setDocumentos(Array.isArray(documentosResponse.data) ? documentosResponse.data : []);

      // Actualizar documentos requeridos
      try {
        const documentosRequeridosResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/verificar/${id}/profesor`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setDocumentosRequeridos(documentosRequeridosResponse.data.documentosRequeridos || []);
      } catch (error) {
        console.error('Error al actualizar documentos requeridos:', error);
      }

      // Limpiar formulario y cerrar modal
      setArchivoSeleccionado(null);
      setDocumentoSeleccionado(null);
      setShowModal(false);
      setSuccessMessage('Documento subido correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (err) {
      console.error('Error al subir documento:', err);
      setError(err.response?.data?.message || 'Error al subir el documento. Por favor, intente nuevamente.');
    } finally {
      setSubiendoDocumento(false);
    }
  };

  const handleDescargarDocumento = (documentoId) => {
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/${documentoId}/download`;
    window.open(url, '_blank');
  };

  const handleVistaPrevia = (documento) => {
    setDocumentoPreview(documento);
    setShowPreviewModal(true);
  };

  const handleDescargarTodos = async () => {
    if (documentos.length === 0) {
      setError('No hay documentos para descargar');
      return;
    }

    try {
      setDescargandoTodos(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/persona/${id}/download-all`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Error al descargar documentos');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `documentos_${profesor?.nombre}_${profesor?.apellido}_${profesor?.cedula}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccessMessage('Documentos descargados correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error al descargar documentos:', error);
      setError('Error al descargar los documentos. Por favor, intente nuevamente.');
    } finally {
      setDescargandoTodos(false);
    }
  };

  const handleEliminarDocumento = async (documentoId) => {
    if (!window.confirm('¿Está seguro de eliminar este documento? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
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
      try {
        const documentosRequeridosResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/verificar/${id}/profesor`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setDocumentosRequeridos(documentosRequeridosResponse.data.documentosRequeridos || []);
      } catch (error) {
        console.error('Error al actualizar documentos requeridos:', error);
      }

      setSuccessMessage('Documento eliminado correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error al eliminar documento:', error);
      setError('Error al eliminar el documento. Por favor, intente nuevamente.');
    }
  };

  // Componente Modal personalizado
  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>
          
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500"
                      onClick={onClose}
                    >
                      <FaTimes />
                    </button>
                  </div>
                  <div className="mt-4">
                    {children}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-pulse"></div>
          </div>
          <p className="mt-4 text-emerald-600 font-medium">Cargando información del profesor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-emerald-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <FaExclamationTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar datos</h3>
            <p className="text-sm text-gray-500 mb-6">{error}</p>
            <Link
              to="/admin/profesores"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-colors duration-200"
            >
              <FaArrowLeft className="mr-2" /> Volver a la lista
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-emerald-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header con información del profesor */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-800 to-emerald-900 shadow-2xl rounded-2xl mb-8">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/30 to-transparent"></div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-400/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-emerald-300/10 rounded-full blur-2xl"></div>
          
          <div className="relative px-6 py-8">
            {/* Botón de regreso */}
            <div className="mb-6">
              <Link
                to="/admin/profesores"
                className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-md text-white font-medium rounded-xl border border-white/30 hover:bg-white/30 transition-all duration-300"
              >
                <FaArrowLeft className="mr-2" /> Volver a la lista
              </Link>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-3xl">
                      {profesor?.nombre?.charAt(0)}{profesor?.apellido?.charAt(0)}
                    </span>
                  </div>
                </div>
                
                {/* Información básica */}
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-white mb-2">
                    {profesor?.nombre} {profesor?.apellido}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-emerald-200">
                    <div className="flex items-center">
                      <FaIdCard className="w-4 h-4 mr-2" />
                      <span>C.I: {profesor?.cedula}</span>
                    </div>
                    <div className="flex items-center">
                      <FaChalkboardTeacher className="w-4 h-4 mr-2" />
                      <span>Profesor</span>
                    </div>
                    {annoEscolar && (
                      <div className="flex items-center">
                        <FaCalendarAlt className="w-4 h-4 mr-2" />
                        <span>{annoEscolar.periodo}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Stats rápidas */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-200 text-xs font-medium">Materias</p>
                          <p className="text-xl font-bold text-white">{materias.length}</p>
                        </div>
                        <FaBook className="w-6 h-6 text-emerald-300" />
                      </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-200 text-xs font-medium">Grados</p>
                          <p className="text-xl font-bold text-white">{grados.length}</p>
                        </div>
                        <FaGraduationCap className="w-6 h-6 text-emerald-300" />
                      </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-200 text-xs font-medium">Evaluaciones</p>
                          <p className="text-xl font-bold text-white">{evaluaciones.length}</p>
                        </div>
                        <FaClipboardList className="w-6 h-6 text-emerald-300" />
                      </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-200 text-xs font-medium">Estudiantes</p>
                          <p className="text-xl font-bold text-white">{estudiantes.length}</p>
                        </div>
                        <FaUsers className="w-6 h-6 text-emerald-300" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Botones de acción */}
              <div className="mt-8 lg:mt-0 lg:ml-8 flex flex-col space-y-3">
                <Link
                  to={`/admin/profesores/editar/${id}`}
                  className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-md text-white font-semibold rounded-xl border border-white/30 hover:bg-white/30 transition-all duration-300 shadow-lg"
                >
                  <FaEdit className="w-4 h-4 mr-2" />
                  Editar Profesor
                </Link>
                
                <button
                  onClick={exportarDatos}
                  className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-md text-white font-semibold rounded-xl border border-white/30 hover:bg-white/30 transition-all duration-300 shadow-lg"
                >
                  <FaDownload className="w-4 h-4 mr-2" />
                  Exportar Datos
                </button>
                
                {/* Configuración de bloqueo (solo admin) */}
                <button
                  onClick={() => setShowConfigBloqueoModal(true)}
                  className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-md text-white font-semibold rounded-xl border border-white/30 hover:bg-white/30 transition-all duration-300 shadow-lg"
                >
                  <FaLock className="w-4 h-4 mr-2" />
                  Config. Bloqueo
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

        {/* Banner de bloqueo de calificaciones */}
        {isCalificacionesBloqueadas() && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaLock className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Edición de Calificaciones Bloqueada
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    Las calificaciones están bloqueadas desde el {formatearFecha(configuracionBloqueo?.fechaLimite)}.
                    {configuracionBloqueo?.mensaje && ` ${configuracionBloqueo.mensaje}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mensajes de éxito */}
        {successMessage && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 p-4 mb-6 rounded-r-lg shadow-sm">
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
                    ? 'border-emerald-500 text-emerald-600 bg-emerald-50'
                    : 'border-transparent text-gray-500 hover:text-emerald-600 hover:border-emerald-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-semibold text-sm rounded-t-lg transition-all duration-200 flex items-center`}
                onClick={() => setActiveTab('info')}
              >
                <FaUser className="w-4 h-4 mr-2" />
                Información Personal
              </button>
              <button
                className={`${
                  activeTab === 'materias'
                    ? 'border-emerald-500 text-emerald-600 bg-emerald-50'
                    : 'border-transparent text-gray-500 hover:text-emerald-600 hover:border-emerald-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-semibold text-sm rounded-t-lg transition-all duration-200 flex items-center`}
                onClick={() => setActiveTab('materias')}
              >
                <FaBook className="w-4 h-4 mr-2" />
                Materias ({materias.length})
              </button>
              <button
                className={`${
                  activeTab === 'evaluaciones'
                    ? 'border-emerald-500 text-emerald-600 bg-emerald-50'
                    : 'border-transparent text-gray-500 hover:text-emerald-600 hover:border-emerald-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-semibold text-sm rounded-t-lg transition-all duration-200 flex items-center`}
                onClick={() => setActiveTab('evaluaciones')}
              >
                <FaClipboardList className="w-4 h-4 mr-2" />
                Evaluaciones ({evaluaciones.length})
              </button>
              <button
                className={`${
                  activeTab === 'calificaciones'
                    ? 'border-emerald-500 text-emerald-600 bg-emerald-50'
                    : 'border-transparent text-gray-500 hover:text-emerald-600 hover:border-emerald-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-semibold text-sm rounded-t-lg transition-all duration-200 flex items-center`}
                onClick={() => setActiveTab('calificaciones')}
              >
                <FaChartLine className="w-4 h-4 mr-2" />
                Calificaciones ({calificaciones.length})
              </button>
              <button
                className={`${
                  activeTab === 'estudiantes'
                    ? 'border-emerald-500 text-emerald-600 bg-emerald-50'
                    : 'border-transparent text-gray-500 hover:text-emerald-600 hover:border-emerald-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-semibold text-sm rounded-t-lg transition-all duration-200 flex items-center`}
                onClick={() => setActiveTab('estudiantes')}
              >
                <FaUsers className="w-4 h-4 mr-2" />
                Estudiantes ({estudiantes.length})
              </button>
              <button
                className={`${
                  activeTab === 'documentos'
                    ? 'border-emerald-500 text-emerald-600 bg-emerald-50'
                    : 'border-transparent text-gray-500 hover:text-emerald-600 hover:border-emerald-300'
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
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-emerald-800 mb-4 flex items-center">
                      <FaIdCard className="w-5 h-5 mr-2" />
                      Información Básica
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="w-24 text-sm font-medium text-emerald-700">Cédula:</div>
                        <div className="text-sm text-gray-900 font-semibold">{profesor.cedula}</div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-24 text-sm font-medium text-emerald-700">Nombre:</div>
                        <div className="text-sm text-gray-900">{profesor.nombre} {profesor.apellido}</div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-24 text-sm font-medium text-emerald-700">Género:</div>
                        <div className="text-sm text-gray-900">{profesor.genero === 'M' ? 'Masculino' : 'Femenino'}</div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-24 text-sm font-medium text-emerald-700">Nacimiento:</div>
                        <div className="text-sm text-gray-900">{formatearFecha(profesor.fechaNacimiento)}</div>
                      </div>
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
                        <FaPhone className="w-4 h-4 text-blue-600 mr-3" />
                        <div className="text-sm text-gray-900">{profesor.telefono || 'No especificado'}</div>
                      </div>
                      <div className="flex items-center">
                        <FaEnvelope className="w-4 h-4 text-blue-600 mr-3" />
                        <div className="text-sm text-gray-900">{profesor.email || 'No especificado'}</div>
                      </div>
                      <div className="flex items-start">
                        <FaMapMarkerAlt className="w-4 h-4 text-blue-600 mr-3 mt-1" />
                        <div className="text-sm text-gray-900">{profesor.direccion || 'No especificada'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Observaciones */}
                {profesor.observaciones && (
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
                      <FaStickyNote className="w-5 h-5 mr-2" />
                      Observaciones
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{profesor.observaciones}</p>
                  </div>
                )}

                {/* Estadísticas académicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white border border-emerald-200 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-600">{materias.length}</div>
                    <div className="text-sm text-gray-600">Materias Asignadas</div>
                  </div>
                  <div className="bg-white border border-blue-200 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{grados.length}</div>
                    <div className="text-sm text-gray-600">Grados</div>
                  </div>
                  <div className="bg-white border border-purple-200 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{evaluaciones.length}</div>
                    <div className="text-sm text-gray-600">Evaluaciones</div>
                  </div>
                  <div className="bg-white border border-orange-200 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">{estudiantes.length}</div>
                    <div className="text-sm text-gray-600">Estudiantes</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Materias Asignadas */}
            {activeTab === 'materias' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                      <FaBook className="w-5 h-5 mr-2 text-emerald-600" />
                      Materias Asignadas
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Gestiona las materias que imparte el profesor
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAsignMateriaModal(true)}
                    className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
                  >
                    <FaPlus className="w-4 h-4 mr-2" />
                    Asignar Materia
                  </button>
                </div>
                
                {materias.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 mb-4">
                      <FaBook className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay materias asignadas</h3>
                    <p className="text-gray-500 mb-6">Este profesor no tiene materias asignadas actualmente.</p>
                    <button
                      onClick={() => setShowAsignMateriaModal(true)}
                      className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors duration-200"
                    >
                      <FaPlus className="w-4 h-4 mr-2" />
                      Asignar Primera Materia
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {materias.map((materia) => (
                      <div key={`${materia.id}-${materia.gradoID || 'sin-grado'}`} className="bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                {materia.asignatura || materia.nombre}
                              </h4>
                              <div className="space-y-2">
                                <div className="flex items-center text-sm text-gray-600">
                                  <FaGraduationCap className="w-4 h-4 mr-2 text-emerald-500" />
                                  <span>
                                    {/* Usar gradosImpartidos que contiene los grados específicos del profesor */}
                                    {materia.gradosImpartidos && materia.gradosImpartidos.length > 0 
                                      ? materia.gradosImpartidos
                                          .map(grado => formatearNombreGrado(grado.nombre_grado))
                                          .join(', ')
                                      : 'Grado no especificado'}
                                  </span>
                                </div>
                                {(materia.Seccion?.nombre_seccion || materia.seccionNombre) && (
                                  <div className="flex items-center text-sm text-gray-600">
                                    <FaUsers className="w-4 h-4 mr-2 text-blue-500" />
                                    <span>Sección: {materia.Seccion?.nombre_seccion || materia.seccionNombre}</span>
                                  </div>
                                )}
                                {annoEscolar && (
                                  <div className="flex items-center text-sm text-gray-600">
                                    <FaCalendarAlt className="w-4 h-4 mr-2 text-purple-500" />
                                    <span>{annoEscolar.periodo}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col space-y-1">
                              {materia.gradosImpartidos && materia.gradosImpartidos.length > 0 
                                ? materia.gradosImpartidos.map(grado => (
                                    <button
                                      key={grado.id}
                                      onClick={() => handleEliminarMateria(materia.id, grado.id)}
                                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded text-xs transition-colors duration-200"
                                      title={`Eliminar asignación en ${formatearNombreGrado(grado.nombre_grado)}`}
                                    >
                                      <FaTrash className="w-3 h-3" />
                                    </button>
                                  ))
                                : (
                                    <button
                                      onClick={() => handleEliminarMateria(materia.id, null)}
                                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                      title="Eliminar asignación"
                                      disabled
                                    >
                                      <FaTrash className="w-4 h-4" />
                                    </button>
                                  )}
                            </div>
                          </div>
                          
                          {/* Estadísticas de la materia */}
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-emerald-50 rounded-lg p-3 text-center">
                              <div className="text-lg font-bold text-emerald-600">
                                {evaluaciones.filter(e => e.materiaID === materia.id).length}
                              </div>
                              <div className="text-xs text-emerald-700">Evaluaciones</div>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-3 text-center">
                              <div className="text-lg font-bold text-blue-600">
                                {materia.gradosImpartidos 
                                  ? materia.gradosImpartidos.reduce((total, grado) => 
                                      total + estudiantes.filter(e => e.gradoID === grado.id).length, 0)
                                  : estudiantes.filter(e => 
                                      e.gradoID === (materia.gradoID || materia.Grado?.id)
                                    ).length}
                              </div>
                              <div className="text-xs text-blue-700">Estudiantes</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <Link
                              to={`/admin/academico/materias/${materia.id}`}
                              className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center"
                            >
                              <FaEye className="w-4 h-4 mr-1" />
                              Ver detalles
                            </Link>
                            <div className="flex items-center space-x-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                Activa
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Grados Asignados */}
            {activeTab === 'grados' && (
            <div>
                <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Grados Asignados</h3>
                <button
                    onClick={() => setShowAsignGradoModal(true)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <FaPlus className="mr-2" /> Asignar Grado
                </button>
                </div>
                
                {grados.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                        No hay grados asignados a este profesor
                    </div>
                    ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {grados.map((grado) => (
                        <div key={grado.id} className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                            <div className="flex justify-between">
                                <div>
                                <h4 className="text-lg font-medium text-gray-900">
                                    {formatearNombreGrado(grado.nombre_grado)}
                                </h4>
                                {grado.Nivel && (
                                    <p className="mt-1 text-sm text-gray-500">
                                    Nivel: {grado.Nivel.nombre_nivel}
                                    </p>
                                )}
                                </div>
                                <div>
                                <button

                                    onClick={async () => {
                                    if (window.confirm(`¿Está seguro de eliminar la asignación de este grado?`)) {
                                        try {
                                        await axios.delete(
                                            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias/profesor/${id}/${grado.id}/${annoEscolar.id}`,
                                            { headers: { 'Authorization': `Bearer ${token}` } }
                                        );
                                        
                                        // Actualizar la lista de grados
                                        setGrados(grados.filter(g => g.id !== grado.id));
                                        
                                        setSuccessMessage('Asignación eliminada correctamente');
                                        setTimeout(() => setSuccessMessage(''), 3000);
                                        } catch (error) {
                                        console.error('Error al eliminar asignación:', error);
                                        setError('Error al eliminar la asignación. Por favor, intente nuevamente.');
                                        }
                                    }
                                    }}
                                    className="text-red-600 hover:text-red-900"
                                    title="Eliminar asignación"
                                >
                                    <FaTrash />
                                </button>
                                </div>
                            </div>
                            
                            {/* Mostrar materias que imparte en este grado */}
                            {grado.materiasImpartidas && grado.materiasImpartidas.length > 0 && (
                                <div className="mt-4">
                                <h5 className="text-sm font-medium text-gray-700 mb-2">Materias que imparte:</h5>
                                <div className="flex flex-wrap gap-2">
                                    {grado.materiasImpartidas.map(materia => (
                                    <span 
                                        key={materia.id} 
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                    >
                                        {materia.asignatura || materia.nombre}
                                    </span>
                                    ))}
                                </div>
                                </div>
                            )}
                            </div>
                            <div className="bg-gray-50 px-4 py-4 sm:px-6">
                            <div className="text-sm">
                                <Link
                                to={`/admin/academico/grados/${grado.id}`}
                                className="font-medium text-indigo-600 hover:text-indigo-500"
                                >
                                Ver detalles
                                </Link>
                            </div>
                            </div>
                        </div>
                        ))}
                    </div>
                    )}
                </div>
                )}


            
            {/* Evaluaciones */}
            {activeTab === 'evaluaciones' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                      <FaClipboardList className="w-5 h-5 mr-2 text-emerald-600" />
                      Evaluaciones Creadas
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Gestiona las evaluaciones creadas por el profesor
                    </p>
                  </div>
                  <Link
                    to={`/admin/evaluaciones/nueva?profesorID=${id}`}
                    className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
                  >
                    <FaPlus className="w-4 h-4 mr-2" />
                    Nueva Evaluación
                  </Link>
                </div>
                
                {evaluaciones.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 mb-4">
                      <FaClipboardList className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay evaluaciones</h3>
                    <p className="text-gray-500 mb-6">Este profesor no ha creado evaluaciones aún.</p>
                    <Link
                      to={`/admin/evaluaciones/nueva?profesorID=${id}`}
                      className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors duration-200"
                    >
                      <FaPlus className="w-4 h-4 mr-2" />
                      Crear Primera Evaluación
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {evaluaciones.map((evaluacion) => (
                      <div key={evaluacion.id} className="bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                {evaluacion.nombreEvaluacion}
                              </h4>
                              <div className="space-y-2">
                                <div className="flex items-center text-sm text-gray-600">
                                  <FaBook className="w-4 h-4 mr-2 text-emerald-500" />
                                  <span>{evaluacion.Materias?.asignatura || 'Materia no especificada'}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <FaGraduationCap className="w-4 h-4 mr-2 text-blue-500" />
                                  <span>
                                    {formatearNombreGrado(evaluacion.Grado?.nombre_grado) || 'Grado no especificado'}
                                    {evaluacion.Seccion?.nombre_seccion && ` - ${evaluacion.Seccion.nombre_seccion}`}
                                  </span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <FaCalendarAlt className="w-4 h-4 mr-2 text-purple-500" />
                                  <span>{formatearFecha(evaluacion.fechaEvaluacion)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                evaluacion.tipoEvaluacion === 'Examen' 
                                  ? 'bg-red-100 text-red-800'
                                  : evaluacion.tipoEvaluacion === 'Prueba'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {evaluacion.tipoEvaluacion}
                              </span>
                              {evaluacion.lapso && (
                                <span className="mt-1 text-xs text-gray-500">
                                  Lapso {evaluacion.lapso}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Estadísticas de la evaluación */}
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-emerald-50 rounded-lg p-3 text-center">
                              <div className="text-lg font-bold text-emerald-600">
                                {calificaciones.filter(c => c.evaluacionID === evaluacion.id).length}
                              </div>
                              <div className="text-xs text-emerald-700">Calificadas</div>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-3 text-center">
                              <div className="text-lg font-bold text-blue-600">
                                {evaluacion.puntajeMaximo || 20}
                              </div>
                              <div className="text-xs text-blue-700">Puntaje Máx.</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <Link
                              to={`/admin/evaluaciones/${evaluacion.id}`}
                              className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center"
                            >
                              <FaEye className="w-4 h-4 mr-1" />
                              Ver detalles
                            </Link>
                            <div className="flex items-center space-x-2">
                              <Link
                                to={`/admin/evaluaciones/${evaluacion.id}/calificar`}
                                className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center"
                              >
                                <FaEdit className="w-4 h-4 mr-1" />
                                Calificar
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Calificaciones */}
            {activeTab === 'calificaciones' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                      <FaChartLine className="w-5 h-5 mr-2 text-emerald-600" />
                      Calificaciones Registradas
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Todas las calificaciones registradas por el profesor
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <select
                      value={filtroMateria}
                      onChange={(e) => setFiltroMateria(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Todas las materias</option>
                      {materias.map(materia => (
                        <option key={materia.id} value={materia.id}>
                          {materia.asignatura || materia.nombre}
                        </option>
                      ))}
                    </select>
                    <select
                      value={filtroLapso}
                      onChange={(e) => setFiltroLapso(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Todos los lapsos</option>
                      <option value="1">Lapso 1</option>
                      <option value="2">Lapso 2</option>
                      <option value="3">Lapso 3</option>
                    </select>
                  </div>
                </div>

                {calificaciones.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 mb-4">
                      <FaChartLine className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay calificaciones</h3>
                    <p className="text-gray-500">No se han registrado calificaciones aún.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Estudiante
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Evaluación
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Materia
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Calificación
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Fecha
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {calificaciones
                            .filter(cal => !filtroMateria || cal.Evaluaciones?.materiaID === parseInt(filtroMateria))
                            .filter(cal => !filtroLapso || cal.Evaluaciones?.lapso === parseInt(filtroLapso))
                            .map((calificacion) => (
                            <tr key={calificacion.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-8 w-8">
                                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                      <span className="text-sm font-medium text-emerald-600">
                                        {calificacion.Personas?.nombre?.charAt(0)}{calificacion.Personas?.apellido?.charAt(0)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {calificacion.Personas?.nombre} {calificacion.Personas?.apellido}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      C.I: {calificacion.Personas?.cedula}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {calificacion.Evaluaciones?.nombreEvaluacion}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {calificacion.Evaluaciones?.Materias?.asignatura}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                                  calificacion.calificacion >= 10 
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {calificacion.calificacion}/20
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatearFecha(calificacion.createdAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end space-x-2">
                                  <button
                                    onClick={() => {
                                      setEditingCalificacion(calificacion);
                                      setCalificacionForm({
                                        nota: calificacion.calificacion,
                                        observaciones: calificacion.observaciones || ''
                                      });
                                    }}
                                    disabled={isCalificacionesBloqueadas()}
                                    className="text-emerald-600 hover:text-emerald-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                                  >
                                    <FaEdit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setHistorialCalificacion([]);
                                      setShowHistorialModal(true);
                                      // Aquí se cargaría el historial real
                                    }}
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    <FaHistory className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Estudiantes */}
            {activeTab === 'estudiantes' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                      <FaUsers className="w-5 h-5 mr-2 text-emerald-600" />
                      Estudiantes del Profesor
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Todos los estudiantes que reciben clases con este profesor
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <input
                      type="text"
                      placeholder="Buscar estudiante..."
                      value={busquedaEstudiante}
                      onChange={(e) => setBusquedaEstudiante(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>

                {estudiantes.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 mb-4">
                      <FaUsers className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay estudiantes</h3>
                    <p className="text-gray-500">No se encontraron estudiantes para este profesor.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {estudiantes
                      .filter(estudiante => 
                        !busquedaEstudiante || 
                        `${estudiante.nombre} ${estudiante.apellido}`.toLowerCase().includes(busquedaEstudiante.toLowerCase()) ||
                        estudiante.cedula.includes(busquedaEstudiante)
                      )
                      .map((estudiante) => (
                      <div key={estudiante.id} className="bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                        <div className="p-6">
                          <div className="flex items-center space-x-4 mb-4">
                            <div className="flex-shrink-0">
                              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                  {estudiante.nombre?.charAt(0)}{estudiante.apellido?.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-gray-900">
                                {estudiante.nombre} {estudiante.apellido}
                              </h4>
                              <p className="text-sm text-gray-600">C.I: {estudiante.cedula}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {estudiante.gradoNombre && (
                              <div className="flex items-center text-sm text-gray-600">
                                <FaGraduationCap className="w-4 h-4 mr-2 text-emerald-500" />
                                <span>{formatearNombreGrado(estudiante.gradoNombre)}</span>
                              </div>
                            )}
                            {estudiante.seccionNombre && (
                              <div className="flex items-center text-sm text-gray-600">
                                <FaUsers className="w-4 h-4 mr-2 text-blue-500" />
                                <span>Sección: {estudiante.seccionNombre}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <Link
                              to={`/admin/estudiantes/${estudiante.id}`}
                              className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center"
                            >
                              <FaEye className="w-4 h-4 mr-1" />
                              Ver perfil
                            </Link>
                            <div className="flex items-center space-x-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                Activo
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Documentos */}
            {activeTab === 'documentos' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-orange-100 rounded-xl">
                      <FaFileDownload className="w-6 h-6 text-orange-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Documentos</h2>
                  </div>
                  <div className="flex space-x-3">
                    {documentos.length > 0 && (
                      <button
                        onClick={handleDescargarTodos}
                        disabled={descargandoTodos}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors"
                      >
                        {descargandoTodos ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            <span>Descargando...</span>
                          </>
                        ) : (
                          <>
                            <FaFileDownload />
                            <span>Descargar Todos</span>
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => setShowModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors"
                    >
                      <FaUpload />
                      <span>Subir Documento</span>
                    </button>
                  </div>
                </div>

                {/* Contenedor único de documentos con indicadores de estado */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-6 text-white">
                    <h3 className="text-xl font-bold">Documentos del Profesor</h3>
                    <p className="text-orange-100 mt-1">
                      {documentosRequeridos.filter(doc => doc.subido).length} de {documentosRequeridos.length} documentos requeridos completados
                    </p>
                  </div>
                  
                  <div className="p-6">
                    {documentosRequeridos.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
                          <FaFileAlt className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Cargando documentos...</h3>
                        <p className="text-gray-500">Obteniendo información de documentos requeridos.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {documentosRequeridos.map(docRequerido => {
                          const documentoSubido = documentos.find(doc => doc.tipoDocumento === docRequerido.nombre);
                          const estaSubido = !!documentoSubido;
                          
                          return (
                            <div key={docRequerido.id} className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                              estaSubido 
                                ? 'bg-green-50 border-green-200 hover:shadow-md' 
                                : docRequerido.obligatorio 
                                  ? 'bg-red-50 border-red-200 hover:shadow-md' 
                                  : 'bg-gray-50 border-gray-200 hover:shadow-md'
                            }`}>
                              {/* Header de la tarjeta */}
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                  <div className={`p-2 rounded-lg ${
                                    estaSubido ? 'bg-green-100' : 'bg-gray-100'
                                  }`}>
                                    <FaFileAlt className={`w-4 h-4 ${
                                      estaSubido ? 'text-green-600' : 'text-gray-400'
                                    }`} />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-800 text-sm">{docRequerido.nombre}</h4>
                                    <p className="text-xs text-gray-500">
                                      {docRequerido.obligatorio ? 'Obligatorio' : 'Opcional'}
                                    </p>
                                  </div>
                                </div>
                                {estaSubido ? (
                                  <FaCheck className="w-5 h-5 text-green-600" />
                                ) : (
                                  <FaTimes className="w-5 h-5 text-red-600" />
                                )}
                              </div>

                              {/* Información del documento si está subido */}
                              {documentoSubido && (
                                <div className="mb-3 p-2 bg-white rounded-lg border">
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
                              <div className="flex space-x-2">
                                {estaSubido ? (
                                  <>
                                    <button
                                      onClick={() => handleVistaPrevia(documentoSubido)}
                                      className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-xs hover:bg-blue-200 transition-colors flex items-center justify-center"
                                    >
                                      <FaEye className="mr-1" /> Vista Previa
                                    </button>
                                    <button
                                      onClick={() => handleDescargarDocumento(documentoSubido.id)}
                                      className="flex-1 bg-green-100 text-green-700 px-3 py-2 rounded-lg text-xs hover:bg-green-200 transition-colors flex items-center justify-center"
                                    >
                                      <FaFileDownload className="mr-1" /> Descargar
                                    </button>
                                    <button
                                      onClick={() => handleEliminarDocumento(documentoSubido.id)}
                                      className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-xs hover:bg-red-200 transition-colors"
                                    >
                                      <FaTrash />
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setDocumentoSeleccionado(docRequerido);
                                      setShowModal(true);
                                    }}
                                    className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg text-xs hover:bg-blue-700 transition-colors flex items-center justify-center"
                                  >
                                    <FaUpload className="mr-1" /> Subir Documento
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        
                        {/* Mostrar documentos adicionales que no están en los requeridos */}
                        {documentos.filter(doc => !documentosRequeridos.some(req => req.nombre === doc.tipoDocumento)).map(documento => (
                          <div key={documento.id} className="p-4 rounded-xl border-2 bg-blue-50 border-blue-200 hover:shadow-md transition-all duration-200">
                            {/* Header de la tarjeta */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <div className="p-2 rounded-lg bg-blue-100">
                                  <FaFileAlt className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-800 text-sm">{documento.tipoDocumento}</h4>
                                  <p className="text-xs text-gray-500">Documento adicional</p>
                                </div>
                              </div>
                              <FaCheck className="w-5 h-5 text-blue-600" />
                            </div>

                            {/* Información del documento */}
                            <div className="mb-3 p-2 bg-white rounded-lg border">
                              <p className="text-xs text-gray-600 mb-1">
                                <strong>Archivo:</strong> {documento.nombre_archivo || 'Sin nombre'}
                              </p>
                              {documento.descripcion && (
                                <p className="text-xs text-gray-600 mb-1">
                                  <strong>Descripción:</strong> {documento.descripcion}
                                </p>
                              )}
                              <p className="text-xs text-gray-500">
                                Subido: {formatearFecha(documento.createdAt)}
                              </p>
                            </div>

                            {/* Botones de acción */}
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleVistaPrevia(documento)}
                                className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-xs hover:bg-blue-200 transition-colors flex items-center justify-center"
                              >
                                <FaEye className="mr-1" /> Vista Previa
                              </button>
                              <button
                                onClick={() => handleDescargarDocumento(documento.id)}
                                className="flex-1 bg-green-100 text-green-700 px-3 py-2 rounded-lg text-xs hover:bg-green-200 transition-colors flex items-center justify-center"
                              >
                                <FaFileDownload className="mr-1" /> Descargar
                              </button>
                              <button
                                onClick={() => handleEliminarDocumento(documento.id)}
                                className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-xs hover:bg-red-200 transition-colors"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modales */}
      {/* Modal para asignar materia */}
<Modal
  isOpen={showAsignMateriaModal}
  onClose={() => {
    setShowAsignMateriaModal(false);
    setGradoSeleccionado('');
    setMateriasPorGrado([]);
  }}
  title="Asignar Materia"
>
  <form onSubmit={handleAsignarMateria}>
    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
      <div className="sm:col-span-6">
        <label htmlFor="gradoID" className="block text-sm font-medium text-gray-700">
          Grado
        </label>
        <div className="mt-1">
          <select
            id="gradoID"
            name="gradoID"
            value={gradoSeleccionado}
            onChange={async (e) => {
              const selectedGradoID = e.target.value;
              setGradoSeleccionado(selectedGradoID);
              setAsignMateriaForm({...asignMateriaForm, gradoID: selectedGradoID, materiaID: ''});
              
              if (selectedGradoID) {
                try {
                  // Obtener materias asignadas a este grado
                  const response = await axios.get(
                    `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias/grado/${selectedGradoID}`,
                    { headers: { 'Authorization': `Bearer ${token}` } }
                  );
                  
                  // Filtrar materias que ya están asignadas a este profesor en este grado
                  const materiasDelGrado = Array.isArray(response.data) ? response.data : [];
                  const materiasYaAsignadas = materias.filter(m => 
                    m.gradoID === selectedGradoID || 
                    m.Grado?.id === selectedGradoID
                  ).map(m => m.id);
                  
                  const materiasDisponibles = materiasDelGrado.filter(m => 
                    !materiasYaAsignadas.includes(m.id)
                  );
                  
                  setMateriasPorGrado(materiasDisponibles);
                } catch (error) {
                  console.error('Error al cargar materias del grado:', error);
                  setError('No se pudieron cargar las materias para este grado');
                }
              } else {
                setMateriasPorGrado([]);
              }
            }}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            required
          >
            <option value="">Seleccione un grado</option>
            {gradosDisponibles.map((grado) => (
              <option key={grado.id} value={grado.id}>
                {grado.nombre_grado}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="sm:col-span-6">
        <label htmlFor="materiaID" className="block text-sm font-medium text-gray-700">
          Materia
        </label>
        <div className="mt-1">
          <select
            id="materiaID"
            name="materiaID"
            value={asignMateriaForm.materiaID}
            onChange={(e) => setAsignMateriaForm({...asignMateriaForm, materiaID: e.target.value})}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            required
            disabled={!gradoSeleccionado}
          >
            <option value="">
              {!gradoSeleccionado 
                ? 'Primero seleccione un grado' 
                : materiasPorGrado.length === 0 
                  ? 'No hay materias disponibles para este grado' 
                  : 'Seleccione una materia'
              }
            </option>
            {materiasPorGrado.map((materia) => (
              <option key={materia.id} value={materia.id}>
                {materia.asignatura || materia.nombre}
              </option>
            ))}
          </select>
        </div>
        {gradoSeleccionado && materiasPorGrado.length === 0 && (
          <p className="mt-2 text-sm text-yellow-600">
            No hay materias disponibles para asignar en este grado o todas ya están asignadas a este profesor.
          </p>
        )}
      </div>
    </div>
    
    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
      <button
        type="submit"
        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
        disabled={loading || !gradoSeleccionado || !asignMateriaForm.materiaID}
      >
        {loading ? 'Asignando...' : 'Asignar'}
      </button>
      <button
        type="button"
        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
        onClick={() => {
          setShowAsignMateriaModal(false);
          setGradoSeleccionado('');
          setMateriasPorGrado([]);
        }}
      >
        Cancelar
      </button>
    </div>
  </form>
</Modal>


            {/* Modal para asignar grado */}
            <Modal
            isOpen={showAsignGradoModal}
            onClose={() => setShowAsignGradoModal(false)}
            title="Asignar Grado"
            >
            <form onSubmit={handleAsignarGrado}>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                    <label htmlFor="gradoID" className="block text-sm font-medium text-gray-700">
                    Grado
                    </label>
                    <div className="mt-1">
                    <select
                        id="gradoID"
                        name="gradoID"
                        value={asignGradoForm.gradoID}
                        onChange={(e) => setAsignGradoForm({...asignGradoForm, gradoID: e.target.value})}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        required
                    >
                        <option value="">Seleccione un grado</option>
                        {gradosDisponibles
                        .filter(grado => !grados.some(g => g.id === grado.id)) // Filtrar grados ya asignados
                        .map((grado) => (
                            <option key={grado.id} value={grado.id}>
                            {grado.nombre_grado}
                            </option>
                        ))
                        }
                    </select>
                    </div>
                </div>
                </div>
                
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                    disabled={loading}
                >
                    {loading ? 'Asignando...' : 'Asignar'}
                </button>
                <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                    onClick={() => setShowAsignGradoModal(false)}
                >
                    Cancelar
                </button>
                </div>
            </form>
            </Modal>



      {/* Modal de vista previa de documento */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false);
          setDocumentoPreview(null);
        }}
        title="Vista Previa del Documento"
      >
        {documentoPreview && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900">{documentoPreview.tipoDocumento}</h3>
              <p className="text-sm text-gray-600 mt-1">
                Subido el {formatearFecha(documentoPreview.createdAt)}
              </p>
              {documentoPreview.descripcion && (
                <p className="text-sm text-gray-700 mt-2">{documentoPreview.descripcion}</p>
              )}
            </div>

            {/* Vista previa del archivo */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {documentoPreview.urlDocumento && documentoPreview.urlDocumento.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${documentoPreview.urlDocumento}`}
                  className="w-full h-96"
                  title="Vista previa del documento"
                />
              ) : documentoPreview.urlDocumento && (documentoPreview.urlDocumento.toLowerCase().includes('.jpg') || 
                     documentoPreview.urlDocumento.toLowerCase().includes('.jpeg') || 
                     documentoPreview.urlDocumento.toLowerCase().includes('.png')) ? (
                <img
                  src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${documentoPreview.urlDocumento}`}
                  alt="Vista previa"
                  className="w-full h-auto max-h-96 object-contain"
                />
              ) : (
                <div className="flex items-center justify-center h-32 bg-gray-100">
                  <div className="text-center">
                    <FaFileAlt className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">Vista previa no disponible</p>
                    <p className="text-xs text-gray-400">Haga clic en descargar para ver el archivo</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => handleDescargarDocumento(documentoPreview.id)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center"
              >
                <FaDownload className="w-4 h-4 mr-2" />
                Descargar
              </button>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setDocumentoPreview(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal para subir documentos */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Subir Documento</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Documento
                </label>
                <select
                  value={documentoSeleccionado?.id || ''}
                  onChange={(e) => {
                    const doc = documentosRequeridos.find(d => d.id === e.target.value);
                    setDocumentoSeleccionado(doc);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccionar tipo de documento</option>
                  {documentosRequeridos.map(doc => (
                    <option key={doc.id} value={doc.id}>
                      {doc.nombre} {doc.obligatorio ? '(Obligatorio)' : '(Opcional)'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Archivo
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => setArchivoSeleccionado(e.target.files[0])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formatos permitidos: PDF, DOC, DOCX, JPG, PNG
                </p>
              </div>

              {archivoSeleccionado && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    <strong>Archivo seleccionado:</strong> {archivoSeleccionado.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Tamaño: {(archivoSeleccionado.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubirDocumento}
                disabled={!archivoSeleccionado || !documentoSeleccionado || subiendoDocumento}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {subiendoDocumento ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Subiendo...
                  </>
                ) : (
                  <>
                    <FaUpload className="mr-2" />
                    Subir
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para vista previa de documentos */}
      {showPreviewModal && documentoPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-4xl mx-4 h-5/6 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{documentoPreview.descripcion}</h3>
                <p className="text-sm text-gray-600">{documentoPreview.nombre_archivo}</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleDescargarDocumento(documentoPreview.id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <FaFileDownload />
                  <span>Descargar</span>
                </button>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 p-6">
              <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                {documentoPreview.tipo_archivo?.includes('image/') ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/${documentoPreview.id}/preview`}
                    alt={documentoPreview.nombre_archivo}
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                ) : documentoPreview.tipo_archivo?.includes('pdf') ? (
                  <iframe
                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/${documentoPreview.id}/preview`}
                    className="w-full h-full rounded-lg"
                    title={documentoPreview.nombre_archivo}
                  />
                ) : (
                  <div className="text-center">
                    <FaFileDownload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-600 mb-2">Vista previa no disponible</h4>
                    <p className="text-gray-500 mb-4">
                      Este tipo de archivo no se puede previsualizar en el navegador.
                    </p>
                    <button
                      onClick={() => handleDescargarDocumento(documentoPreview.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors mx-auto"
                    >
                      <FaFileDownload />
                      <span>Descargar para ver</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfesorDetail;
