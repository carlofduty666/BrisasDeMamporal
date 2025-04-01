import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaEdit, FaCheck, FaTimes, FaFileDownload, FaMoneyBillWave, FaUserGraduate, FaEye, FaUpload, FaTrash } from 'react-icons/fa';
import { formatearFecha } from '../../../utils/formatters';
import AdminLayout from '../layout/AdminLayout';

const InscripcionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inscripcion, setInscripcion] = useState(null);
  const [documentosEstudiante, setDocumentosEstudiante] = useState([]);
  const [documentosRequeridos, setDocumentosRequeridos] = useState([]);
  const [documentosRepresentante, setDocumentosRepresentante] = useState([]);
  const [documentosRepresentanteSubidos, setDocumentosRepresentanteSubidos] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [grados, setGrados] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [seccionesFiltradas, setSeccionesFiltradas] = useState([]);
  
  // Estado para el modal de subida/resubida de documentos
  const [showModal, setShowModal] = useState(false);
  const [showModalRepresentante, setShowModalRepresentante] = useState(false);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [subiendoDocumento, setSubiendoDocumento] = useState(false);
  const [documentoRepresentanteSeleccionado, setDocumentoRepresentanteSeleccionado] = useState(null);
  

  const fileInputRef = useRef(null);
  
  // Cargar datos de la inscripción
  useEffect(() => {
    const fetchInscripcion = async () => {
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
        
        // Obtener datos de la inscripción
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/inscripciones/${id}`,
          config
        );
        
        setInscripcion(response.data);
        setEditData({
          estado: response.data.estado,
          gradoID: response.data.gradoID,
          seccionID: response.data.seccionID,
          observaciones: response.data.observaciones || ''
        });
        
        // Obtener documentos del estudiante
        if (response.data.estudiante) {
          const documentosResponse = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/persona/${response.data.estudiante.id}`,
            config
          );
          
          setDocumentosEstudiante(documentosResponse.data);
          
          // Obtener lista de documentos requeridos
          const documentosRequeridosResponse = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/verificar/${response.data.estudiante.id}/estudiante`,
            config
          );
          
          setDocumentosRequeridos(documentosRequeridosResponse.data.documentosRequeridos);
        }
        
        // Obtener grados y secciones
        const gradosResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados`,
          config
        );
        
        setGrados(gradosResponse.data);
        
        const seccionesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/secciones`,
          config
        );
        
        setSecciones(seccionesResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos. Por favor, intente nuevamente.');
        setLoading(false);
        
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };
    
    fetchInscripcion();
  }, [id, navigate]);

    // Cargar documentos del representante
    useEffect(() => {
      const fetchDocumentosRepresentante = async () => {
        if (inscripcion?.representante?.id) {
          try {
            const token = localStorage.getItem('token');
            
            // Obtener documentos subidos del representante
            const documentosResponse = await axios.get(
              `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/persona/${inscripcion.representante.id}`,
              { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
            setDocumentosRepresentanteSubidos(documentosResponse.data);
            
            // Obtener lista de documentos requeridos para representante
            const documentosRequeridosResponse = await axios.get(
              `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/verificar/${inscripcion.representante.id}/representante`,
              { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
            setDocumentosRepresentante(documentosRequeridosResponse.data.documentosRequeridos);
            
          } catch (err) {
            console.error('Error al cargar documentos del representante:', err);
            setError('Error al cargar los documentos del representante.');
          }
        }
      };
      
      fetchDocumentosRepresentante();
    }, [inscripcion?.representante?.id]);
  
    // Función para abrir modal de subida/resubida para representante
    const handleOpenUploadModalRepresentante = (tipoDocumento) => {
      // Buscar si ya existe un documento de este tipo
      const documentoExistente = documentosRepresentanteSubidos.find(doc => doc.tipoDocumento === tipoDocumento.id);
      
      setDocumentoRepresentanteSeleccionado({
        ...tipoDocumento,
        documentoExistente
      });
      setShowModalRepresentante(true);
    };
    
    // Función para cerrar modal del representante
    const handleCloseModalRepresentante = () => {
      setShowModalRepresentante(false);
      setDocumentoRepresentanteSeleccionado(null);
      setArchivoSeleccionado(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    
    // Función para subir/resubir documento del representante
    const handleUploadDocumentRepresentante = async () => {
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
        formData.append('personaID', inscripcion.representante.id);
        formData.append('tipoDocumento', documentoRepresentanteSeleccionado.id);
        formData.append('descripcion', `Documento ${documentoRepresentanteSeleccionado.nombre} del representante`);
        
        let response;
        
        if (documentoRepresentanteSeleccionado.documentoExistente) {
          // Actualizar documento existente
          response = await axios.put(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/${documentoRepresentanteSeleccionado.documentoExistente.id}`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
              }
            }
          );
          
          setSuccess('Documento del representante actualizado correctamente');
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
          
          setSuccess('Documento del representante subido correctamente');
        }
        
        // Actualizar lista de documentos del representante
        const documentosResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/persona/${inscripcion.representante.id}`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        
        setDocumentosRepresentanteSubidos(documentosResponse.data);
        
        // Actualizar lista de documentos requeridos
        const documentosRequeridosResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/verificar/${inscripcion.representante.id}/representante`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        
        setDocumentosRepresentante(documentosRequeridosResponse.data.documentosRequeridos);
        
        // Cerrar modal
        handleCloseModalRepresentante();
        
        // Ocultar mensaje de éxito después de 3 segundos
        setTimeout(() => {
          setSuccess('');
        }, 3000);
        
      } catch (err) {
        console.error('Error al subir documento del representante:', err);
        setError(err.response?.data?.message || 'Error al subir el documento. Por favor, intente nuevamente.');
      } finally {
        setSubiendoDocumento(false);
      }
    };
  
  
  // Filtrar secciones por grado seleccionado
  useEffect(() => {
    if (editData.gradoID) {
      const filtradas = secciones.filter(seccion => seccion.gradoID == editData.gradoID);
      setSeccionesFiltradas(filtradas);
    } else {
      setSeccionesFiltradas([]);
    }
  }, [editData.gradoID, secciones]);
  
  // Función para obtener el color del estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'inscrito':
      case 'aprobado':
        return 'bg-green-100 text-green-800';
      case 'rechazada':
        return 'bg-red-100 text-red-800';
      case 'retirado':
        return 'bg-gray-100 text-gray-800';
      case 'graduado':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Función para obtener nombre de grado
  const getNombreGrado = (gradoID) => {
    const grado = grados.find(g => g.id == gradoID);
    return grado ? grado.nombre_grado.replace(/_/g, ' ') : 'No asignado';
  };
  
  // Función para obtener nombre de sección
  const getNombreSeccion = (seccionID) => {
    const seccion = secciones.find(s => s.id == seccionID);
    return seccion ? seccion.nombre_seccion : 'No asignada';
  };
  
  // Manejar cambios en el formulario de edición
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };
  
  // Guardar cambios
  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      
      // Actualizar estado y observaciones
      await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/inscripciones/${id}/estado`,
        { 
          estado: editData.estado, 
          observaciones: editData.observaciones 
        },
        config
      );
      
      // Recargar datos
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/inscripciones/${id}`,
        config
      );
      
      setInscripcion(response.data);
      setIsEditing(false);
      setSuccess('Inscripción actualizada correctamente');
      
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
  
  // Aprobar inscripción
  const handleAprobarInscripcion = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      
      await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/inscripciones/${id}/estado`,
        { estado: 'aprobada', observaciones: 'Inscripción aprobada' },
        config
      );
      
      // Recargar datos
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/inscripciones/${id}`,
        config
      );
      
      setInscripcion(response.data);
      setSuccess('Inscripción aprobada correctamente');
      
      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
      setLoading(false);
    } catch (err) {
      console.error('Error al aprobar inscripción:', err);
      setError('Error al aprobar la inscripción. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };
  
  // Rechazar inscripción
  const handleRechazarInscripcion = async () => {
    const motivo = prompt('Ingrese el motivo del rechazo:');
    if (!motivo) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      
      await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/inscripciones/${id}/estado`,
        { estado: 'rechazada', observaciones: `Rechazado: ${motivo}` },
        config
      );
      
      // Recargar datos
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/inscripciones/${id}`,
        config
      );
      
      setInscripcion(response.data);
      setSuccess('Inscripción rechazada correctamente');
      
      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
      setLoading(false);
    } catch (err) {
      console.error('Error al rechazar inscripción:', err);
      setError('Error al rechazar la inscripción. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };
  
  // Función para descargar documento
  const handleDownloadDocument = async (documentoId) => {
    try {
      const token = localStorage.getItem('token');
      
      // Realizar solicitud para descargar el documento
      window.open(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/download/${documentoId}?token=${token}`,
        '_blank'
      );
    } catch (err) {
      console.error('Error al descargar documento:', err);
      setError('Error al descargar el documento. Por favor, intente nuevamente.');
    }
  };
  
  // Función para previsualizar documento
  const handlePreviewDocument = (documento) => {
    const token = localStorage.getItem('token');
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${documento.urlDocumento}?token=${token}`;
    
    window.open(url, '_blank');
  };
  
  // Función para abrir modal de subida/resubida
  const handleOpenUploadModal = (tipoDocumento) => {
    // Buscar si ya existe un documento de este tipo
    const documentoExistente = documentosEstudiante.find(doc => doc.tipoDocumento === tipoDocumento.id);
    
    setDocumentoSeleccionado({
      ...tipoDocumento,
      documentoExistente
    });
    setShowModal(true);
  };
  
  // Función para cerrar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setDocumentoSeleccionado(null);
    setArchivoSeleccionado(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Función para manejar selección de archivo
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setArchivoSeleccionado(e.target.files[0]);
    } else {
      setArchivoSeleccionado(null);
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
      formData.append('personaID', inscripcion.estudiante.id);
      formData.append('tipoDocumento', documentoSeleccionado.id);
      formData.append('descripcion', `Documento ${documentoSeleccionado.nombre}`);
      
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
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/persona/${inscripcion.estudiante.id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      setDocumentosEstudiante(documentosResponse.data);
      
      // Actualizar lista de documentos requeridos
      const documentosRequeridosResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/verificar/${inscripcion.estudiante.id}/estudiante`,
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
      
      // Primero, obtener el documento para saber a quién pertenece
      const documentoResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/${documentoId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      const documento = documentoResponse.data;
      const esDocumentoEstudiante = documento.personaID === inscripcion.estudiante.id;
      
      // Eliminar el documento
      await axios.delete(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/${documentoId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      // Actualizar las listas de documentos según corresponda
      if (esDocumentoEstudiante) {
        // Actualizar lista de documentos del estudiante
        const documentosResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/persona/${inscripcion.estudiante.id}`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        
        setDocumentosEstudiante(documentosResponse.data);
        
        // Actualizar lista de documentos requeridos del estudiante
        const documentosRequeridosResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/verificar/${inscripcion.estudiante.id}/estudiante`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        
        setDocumentosRequeridos(documentosRequeridosResponse.data.documentosRequeridos);
      } else {
        // Actualizar lista de documentos del representante
        const documentosResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/persona/${inscripcion.representante.id}`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        
        setDocumentosRepresentanteSubidos(documentosResponse.data);
        
        // Actualizar lista de documentos requeridos del representante
        const documentosRequeridosResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/verificar/${inscripcion.representante.id}/representante`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        
        setDocumentosRepresentante(documentosRequeridosResponse.data.documentosRequeridos);
      }
      
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

   
  // Función para obtener la miniatura según el tipo de archivo
  const getThumbnail = (documento) => {
    const tipo = documento.tipo_archivo || '';
    
    if (tipo.includes('image')) {
      return (
        <img 
          src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${documento.urlDocumento}`} 
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
  
  if (loading && !inscripcion) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Botón de volver */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/inscripciones')}
            className="flex items-center text-indigo-600 hover:text-indigo-900"
          >
            <FaArrowLeft className="mr-2" /> Volver a la lista de inscripciones
          </button>
        </div>
        
        {/* Mensajes de éxito o error */}
        {success && (
          <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
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
        
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
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
        
        {/* Encabezado */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Detalles de Inscripción
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Información completa de la inscripción.
              </p>
            </div>
            
            <div className="flex space-x-2">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <FaEdit className="mr-2" /> Editar
                  </button>
                  
                  {inscripcion?.estado === 'pendiente' && (
                    <>
                      <button
                        onClick={handleAprobarInscripcion}
                        className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <FaCheck className="mr-2" /> Aprobar
                      </button>
                      
                      <button
                        onClick={handleRechazarInscripcion}
                        className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <FaTimes className="mr-2" /> Rechazar
                      </button>
                    </>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={handleSaveChanges}
                    className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <FaCheck className="mr-2" /> Guardar
                  </button>
                  
                  <button
                    onClick={() => setIsEditing(false)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <FaTimes className="mr-2" /> Cancelar
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Estado</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {isEditing ? (
                    <select
                      name="estado"
                      value={editData.estado}
                      onChange={handleEditChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="aprobada">Aprobada</option>
                      <option value="rechazada">Rechazada</option>
                      <option value="inscrito">Inscrito</option>
                      <option value="retirado">Retirado</option>
                      <option value="graduado">Graduado</option>
                    </select>
                  ) : (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(inscripcion?.estado)}`}>
                      {inscripcion?.estado.charAt(0).toUpperCase() + inscripcion?.estado.slice(1)}
                    </span>
                  )}
                </dd>
              </div>
              
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Fecha de Inscripción</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {formatearFecha(inscripcion?.fechaInscripcion)}
                </dd>
              </div>
              
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Año Escolar</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {inscripcion?.annoEscolar?.periodo || 'No asignado'}
                </dd>
              </div>
              
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Grado</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {isEditing ? (
                    <select
                    name="gradoID"
                    value={editData.gradoID}
                    onChange={handleEditChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="">Seleccione un grado</option>
                    {grados.map(grado => (
                      <option key={grado.id} value={grado.id}>
                        {grado.nombre_grado.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                ) : (
                  getNombreGrado(inscripcion?.gradoID)
                )}
              </dd>
            </div>
            
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Sección</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <select
                    name="seccionID"
                    value={editData.seccionID}
                    onChange={handleEditChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    disabled={!editData.gradoID}
                  >
                    <option value="">Seleccione una sección</option>
                    {seccionesFiltradas.map(seccion => (
                      <option key={seccion.id} value={seccion.id}>
                        {seccion.nombre_seccion}
                      </option>
                    ))}
                  </select>
                ) : (
                  getNombreSeccion(inscripcion?.seccionID)
                )}
              </dd>
            </div>
            
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Observaciones</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <textarea
                    name="observaciones"
                    value={editData.observaciones}
                    onChange={handleEditChange}
                    rows="3"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  ></textarea>
                ) : (
                  inscripcion?.observaciones || 'Sin observaciones'
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      
      {/* Información del estudiante */}
      {inscripcion?.estudiante && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Información del Estudiante
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Datos personales del estudiante.
            </p>
          </div>
          
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Nombre completo</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {inscripcion.estudiante.nombre} {inscripcion.estudiante.apellido}
                </dd>
              </div>
              
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Cédula/Documento</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {inscripcion.estudiante.cedula}
                </dd>
              </div>
              
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Fecha de Nacimiento</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {formatearFecha(inscripcion.estudiante.fechaNacimiento)}
                </dd>
              </div>
              
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Género</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {inscripcion.estudiante.genero === 'M' ? 'Masculino' : 'Femenino'}
                </dd>
              </div>
              
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Dirección</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {inscripcion.estudiante.direccion}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}
      
      {/* Información del representante */}
      {inscripcion?.representante && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Información del Representante
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Datos personales del representante.
            </p>
          </div>
          
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Nombre completo</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {inscripcion.representante.nombre} {inscripcion.representante.apellido}
                </dd>
              </div>
              
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Cédula/Documento</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {inscripcion.representante.cedula}
                </dd>
              </div>
              
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {inscripcion.representante.telefono}
                </dd>
              </div>
              
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {inscripcion.representante.email}
                </dd>
              </div>
              
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Dirección</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {inscripcion.representante.direccion}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}
      
      {/* Documentos del estudiante */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Documentos del Estudiante
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Documentos requeridos y subidos.
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {documentosRequeridos.map((doc) => {
                // Buscar si existe un documento subido de este tipo
                const documentoSubido = documentosEstudiante.find(d => d.tipoDocumento === doc.id);
                
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

        
        {/* Documentos del representante */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Documentos del Representante
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Documentos requeridos y subidos por el representante.
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Necesitamos cargar y mostrar los documentos del representante */}
                  {documentosRepresentante && documentosRepresentante.map((doc) => {
                    // Buscar si existe un documento subido de este tipo
                    const documentoSubido = documentosRepresentanteSubidos ? 
                      documentosRepresentanteSubidos.find(d => d.tipoDocumento === doc.id) : null;
                    
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
                                  onClick={() => handleOpenUploadModalRepresentante(doc)}
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
                              onClick={() => handleOpenUploadModalRepresentante(doc)}
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
              )}
            </div>
          </div>
        </div>
        
        {/* Modal para subir/resubir documentos */}
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
                        {documentoSeleccionado?.documentoExistente ? 'Actualizar documento' : 'Subir documento'}
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          {documentoSeleccionado?.nombre} {documentoSeleccionado?.obligatorio && <span className="text-red-500">*</span>}
                        </p>
                        
                        {documentoSeleccionado?.documentoExistente && (
                          <div className="mt-4 flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              {getThumbnail(documentoSeleccionado.documentoExistente)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {documentoSeleccionado.documentoExistente.nombre_archivo}
                              </p>
                              <p className="text-sm text-gray-500">
                                {(documentoSeleccionado.documentoExistente.tamano / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          </div>
                        )}
                        
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

        {/* Modal para subir/resubir documentos del representante */}
        {showModalRepresentante && (
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
                        {documentoRepresentanteSeleccionado?.documentoExistente ? 'Actualizar documento del representante' : 'Subir documento del representante'}
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          {documentoRepresentanteSeleccionado?.nombre} {documentoRepresentanteSeleccionado?.obligatorio && <span className="text-red-500">*</span>}
                        </p>
                        
                        {documentoRepresentanteSeleccionado?.documentoExistente && (
                          <div className="mt-4 flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              {getThumbnail(documentoRepresentanteSeleccionado.documentoExistente)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {documentoRepresentanteSeleccionado.documentoExistente.nombre_archivo}
                              </p>
                              <p className="text-sm text-gray-500">
                                {(documentoRepresentanteSeleccionado.documentoExistente.tamano / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          </div>
                        )}
                        
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
                    onClick={handleUploadDocumentRepresentante}
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
                    onClick={handleCloseModalRepresentante}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        
        {/* Pagos */}
        {inscripcion?.pagos && inscripcion.pagos.length > 0 && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Pagos Realizados
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Historial de pagos asociados a esta inscripción.
              </p>
            </div>
            
            <div className="border-t border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Concepto
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Método de Pago
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Referencia
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monto
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inscripcion.pagos.map((pago) => (
                      <tr key={pago.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatearFecha(pago.fecha)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {pago.arancel?.nombre || 'Pago de inscripción'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {pago.metodoPago?.nombre || 'No especificado'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {pago.referencia || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${pago.monto.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${pago.estado === 'procesado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {pago.estado.charAt(0).toUpperCase() + pago.estado.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {/* Botones de acción */}
        <div className="flex justify-end space-x-4 mt-6">
          <Link
            to={`/admin/estudiantes/${inscripcion?.estudiante?.id}`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FaUserGraduate className="mr-2" /> Ver Perfil del Estudiante
          </Link>
          
          {!inscripcion?.pagoInscripcionCompletado && (
            <Link
              to={`/admin/inscripciones/${id}/pago`}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <FaMoneyBillWave className="mr-2" /> Registrar Pago
            </Link>
          )}
          
          <Link
            to={`/admin/inscripciones/${id}/comprobante`}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FaFileDownload className="mr-2" /> Generar Comprobante
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
};

export default InscripcionDetail;
