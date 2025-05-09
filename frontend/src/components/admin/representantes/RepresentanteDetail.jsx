import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaEye, FaFileDownload, FaUpload, FaUserGraduate, FaMoneyBillWave, FaFileInvoice } from 'react-icons/fa';
import { formatearFecha, formatearFechaParaInput, tipoDocumentoFormateado, formatearNombreGrado } from '../../../utils/formatters';

const RepresentanteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // Estados para almacenar los datos
  const [representante, setRepresentante] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [grados, setGrados] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [documentosRequeridos, setDocumentosRequeridos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  // Estados para registrar pagos
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [formPago, setFormPago] = useState({
    estudianteID: '',
    representanteID: '',
    arancelID: '',
    metodoPagoID: '',
    annoEscolarID: '',
    inscripcionID: '',
    monto: '',
    montoMora: '0',
    descuento: '0',
    mesPago: '',
    fechaPago: new Date().toISOString().split('T')[0],
    referencia: '',
    observaciones: ''
  });
  const [aranceles, setAranceles] = useState([]);
  const [metodosPago, setMetodosPago] = useState([]);
  const [loadingPago, setLoadingPago] = useState(false);
  const [errorPago, setErrorPago] = useState('');
  const [successPago, setSuccessPago] = useState('');
  
  // Estados para el modal de documentos
  const [showModal, setShowModal] = useState(false);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [subiendoDocumento, setSubiendoDocumento] = useState(false);
  const fileInputRef = useRef(null);
  
  // Cargar datos del representante
  useEffect(() => {
    const fetchRepresentanteData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Obtener datos del representante
        const representanteResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas/${id}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        console.log("Datos del representante:", representanteResponse.data);
        
        if (representanteResponse.data && representanteResponse.data.tipo === 'representante') {
          setRepresentante(representanteResponse.data);
          setEditData({
            nombre: representanteResponse.data.nombre || '',
            apellido: representanteResponse.data.apellido || '',
            cedula: representanteResponse.data.cedula || '',
            telefono: representanteResponse.data.telefono || '',
            email: representanteResponse.data.email || '',
            direccion: representanteResponse.data.direccion || '',
            profesion: representanteResponse.data.profesion || '',
            fechaNacimiento: representanteResponse.data.fechaNacimiento || '',
            observaciones: representanteResponse.data.observaciones || ''
          });
        } else {
          setError('No se encontró el representante o los datos no son válidos');
        }
  
        // Obtener todos los grados
        const gradosResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
  
        setGrados(gradosResponse.data);
      
        // Obtener estudiantes asociados al representante
        const estudiantesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas/representante/${id}/estudiantes`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
  
        // Procesar todos los datos de estudiantes en un solo paso
        const estudiantesCompletos = await Promise.all(
          estudiantesResponse.data.map(async (estudiante) => {
            try {
              // Obtener la inscripción actual del estudiante
              const inscripcionResponse = await axios.get(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/inscripciones/estudiante/${estudiante.id}/actual`,
                { headers: { 'Authorization': `Bearer ${token}` } }
              );
              
              // Verificar pagos
              const estadoPagos = await verificarPagosAlDia(estudiante.id);
              
              // Combinar todos los datos
              return {
                ...estudiante,
                inscripcion: inscripcionResponse.data,
                grado: inscripcionResponse.data?.grado || null,
                estadoPagos
              };
            } catch (err) {
              console.error(`Error al obtener datos para estudiante ${estudiante.id}:`, err);
              return {
                ...estudiante,
                inscripcion: null,
                grado: null,
                estadoPagos: { alDia: true, pagosPendientes: 0 } // Por defecto, asumimos que está al día
              };
            }
          })
        );
  
        // Actualizar el estado una sola vez con todos los datos
        setEstudiantes(estudiantesCompletos);
        
        // Obtener pagos realizados por el representante
        const pagosResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/pagos/representante/${id}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        setPagos(pagosResponse.data);

        // Transformar los datos para tener un formato consistente
        const pagosFormateados = pagosResponse.data.map(pago => ({
          ...pago,
          estudiante: pago.estudiantes || pago.estudiante,
          arancel: pago.aranceles || pago.arancel,
          metodoPago: pago.metodoPagos || pago.metodoPago
        }));

        setPagos(pagosFormateados);
        
        // Obtener documentos del representante
        const documentosResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/persona/${id}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        setDocumentos(documentosResponse.data);
        
        // Obtener documentos requeridos
        const documentosRequeridosResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/verificar/${id}/representante`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        setDocumentosRequeridos(documentosRequeridosResponse.data.documentosRequeridos);
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar datos del representante:', err);
        setError('Error al cargar los datos del representante. Por favor, intente nuevamente.');
        setLoading(false);
      }
    };
    
    fetchRepresentanteData();
  }, [id]);
  
  
  // Manejar cambios en el formulario de edición
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]: value
    });
  };
  
  // Guardar cambios en el representante
  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas/${id}`,
        editData,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // Actualizar datos del representante
      const representanteResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas/tipo/representante/${id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setRepresentante(representanteResponse.data);
      setIsEditing(false);
      setSuccess('Datos del representante actualizados correctamente');
      
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

  // Calcular monto total
  const montoTotal = useMemo(() => {
    const monto = parseFloat(formPago.monto) || 0;
    const montoMora = parseFloat(formPago.montoMora) || 0;
    const descuento = parseFloat(formPago.descuento) || 0;
    return (monto + montoMora - descuento).toFixed(2);
  }, [formPago.monto, formPago.montoMora, formPago.descuento]);

  // Función para abrir el modal de pago
  const handleOpenPagoModal = async () => {
    try {
      setLoadingPago(true);
      setErrorPago('');
      
      const token = localStorage.getItem('token');

      // Obtener el año escolar actual
      const annoEscolarResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/anno-escolar/actual`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // Cargar aranceles
      const arancelesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/aranceles`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // Cargar métodos de pago
      const metodosPagoResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/metodos-pago`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setAranceles(arancelesResponse.data);
      setMetodosPago(metodosPagoResponse.data);
      
      // Inicializar el formulario con el representante actual
      const estudianteSeleccionado = estudiantes.length > 0 ? estudiantes[0] : null;
      const inscripcionID = estudianteSeleccionado?.inscripcion?.id || '';

      setFormPago({
        ...formPago,
        representanteID: representante.id,
        estudianteID: estudianteSeleccionado?.id || '',
        annoEscolarID: annoEscolarResponse.data?.id || '',
        inscripcionID: inscripcionID,
        fechaPago: new Date().toISOString().split('T')[0]
      });
      
      setShowPagoModal(true);
      setLoadingPago(false);
    } catch (err) {
      console.error('Error al cargar datos para el pago:', err);
      setErrorPago(err.response?.data?.message || 'Error al cargar los datos necesarios para el pago. Por favor, intente nuevamente.');
      setLoadingPago(false);
    }
  };

  const handleEstudianteChange = (e) => {
    const estudianteID = e.target.value;
    const estudianteSeleccionado = estudiantes.find(est => est.id.toString() === estudianteID);
    
    setFormPago({
      ...formPago,
      estudianteID,
      inscripcionID: estudianteSeleccionado?.inscripcion?.id || ''
    });
  };

  // Función para cerrar el modal
  const handleClosePagoModal = () => {
    setShowPagoModal(false);
    setFormPago({
      estudianteID: '',
      representanteID: '',
      arancelID: '',
      metodoPagoID: '',
      monto: '',
      montoMora: '0',
      descuento: '0',
      mesPago: '',
      fechaPago: new Date().toISOString().split('T')[0],
      referencia: '',
      observaciones: ''
    });
    setArchivoSeleccionado(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setErrorPago('');
    setSuccessPago('');
  };

  // Función para enviar el formulario de pago
  const handleSubmitPago = async (e) => {
    e.preventDefault();
    
    // Validar campos obligatorios
    if (!formPago.estudianteID || !formPago.arancelID || !formPago.metodoPagoID || !formPago.monto) {
      setErrorPago('Por favor, complete todos los campos obligatorios.');
      return;
    }
    
    try {
      setLoadingPago(true);
      setErrorPago('');
      
      const token = localStorage.getItem('token');
      
      // Crear FormData para enviar el archivo
      const formData = new FormData();
      
      // Añadir datos del pago
      Object.entries(formPago).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value);
        }
      });
      
      // Añadir comprobante si existe
      if (archivoSeleccionado) {
        formData.append('comprobante', archivoSeleccionado);
      }
      
      // Enviar solicitud
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/pagos`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setSuccessPago('Pago registrado correctamente');
      
      // Actualizar la lista de pagos
      const pagosResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/pagos/representante/${id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setPagos(pagosResponse.data);
      
      // Cerrar el modal después de 2 segundos
      setTimeout(() => {
        handleClosePagoModal();
      }, 2000);
      
      setLoadingPago(false);
    } catch (err) {
      console.error('Error al registrar pago:', err);
      setErrorPago(err.response?.data?.message || 'Error al procesar el pago. Por favor, intente nuevamente.');
      setLoadingPago(false);
    }
  };
  
  // Verificar si un estudiante está al día con los pagos
  const verificarPagosAlDia = async (estudianteId) => {
    try {
      const token = localStorage.getItem('token');
      
      // Obtener todos los pagos del estudiante
      const pagosResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/pagos/estudiante/${estudianteId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // Filtrar pagos pendientes
      const pagosPendientes = pagosResponse.data.filter(pago => pago.estado === 'pendiente');
      
      return {
        alDia: pagosPendientes.length === 0,
        pagosPendientes: pagosPendientes.length
      };
    } catch (err) {
      console.error(`Error al verificar pagos para estudiante ${estudianteId}:`, err);
      return { alDia: true, pagosPendientes: 0 }; // Por defecto, asumimos que está al día en caso de error
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
      formData.append('descripcion', `Documento ${documentoSeleccionado.nombre} del representante`);
      
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
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/verificar/${id}/representante`,
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
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/verificar/${id}/representante`,
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
  
  const handlePreviewDocument = (documento) => {
    window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${documento.urlDocumento}`, '_blank');
  };
  
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
          <span className="text-gray-600 text-xs font-bold">ARCHIVO</span>
        </div>
      );
    }
  };

  if (loading && !representante) {
    return (
       
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
       
    );
  }

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
        
        {/* Información del representante */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Información del Representante
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Datos personales y de contacto.
              </p>
            </div>
            <div>
              {isEditing ? (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveChanges}
                    disabled={loading}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {loading ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FaEdit className="mr-1" /> Editar
                </button>
              )}
            </div>
          </div>
          
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Nombre completo</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {isEditing ? (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        name="nombre"
                        value={editData.nombre || ''}
                        onChange={handleEditChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                      <input
                        type="text"
                        name="apellido"
                        value={editData.apellido || ''}
                        onChange={handleEditChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  ) : (
                    representante ? `${representante.nombre || ''} ${representante.apellido || ''}` : 'Cargando...'
                  )}
                </dd>
              </div>
              
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Cédula/Documento</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {isEditing ? (
                    <input
                      type="text"
                      name="cedula"
                      value={editData.cedula || ''}
                      onChange={handleEditChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  ) : (
                    representante?.cedula || 'No disponible'
                  )}
                </dd>
              </div>
              
              {/* Añadir div para fecha de nacimiento */}
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Fecha de Nacimiento</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {isEditing ? (
                    <input
                      type="date"
                      name="fechaNacimiento"
                      value={formatearFechaParaInput(editData.fechaNacimiento)}
                      onChange={handleEditChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  ) : (
                    representante?.fechaNacimiento ? 
                    formatearFecha(representante.fechaNacimiento) : 
                    'No disponible'
                  )}
                </dd>
              </div>
              
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {isEditing ? (
                    <input
                      type="tel"
                      name="telefono"
                      value={editData.telefono || ''}
                      onChange={handleEditChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  ) : (
                    representante?.telefono || 'No disponible'
                  )}
                </dd>
              </div>
              
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editData.email || ''}
                      onChange={handleEditChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  ) : (
                    representante?.email || 'No disponible'
                  )}
                </dd>
              </div>
              
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Dirección</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {isEditing ? (
                    <input
                      type="text"
                      name="direccion"
                      value={editData.direccion || ''}
                      onChange={handleEditChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  ) : (
                    representante?.direccion || 'No disponible'
                  )}
                </dd>
              </div>
              
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Profesión</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {isEditing ? (
                    <input
                      type="text"
                      name="profesion"
                      value={editData.profesion || ''}
                      onChange={handleEditChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  ) : (
                    representante?.profesion || 'No especificada'
                  )}
                </dd>
              </div>
              
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Observaciones</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {isEditing ? (
                    <textarea
                      name="observaciones"
                      value={editData.observaciones || ''}
                      onChange={handleEditChange}
                      rows="3"
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    ></textarea>
                  ) : (
                    representante?.observaciones || 'Sin observaciones'
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Tabla de estudiantes */}
        <div className="overflow-x-auto mb-5">
          <div className="flex justify-between items-center pl-6 mb-3">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Estudiantes inscritos
            </h3>
            <Link
              to={`/inscripcion/nuevo-estudiante?repId=${representante?.id}&repCedula=${representante?.cedula}&repNombre=${representante?.nombre}&repApellido=${representante?.apellido}`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FaPlus className="mr-2" /> Añadir Estudiante
            </Link>
        </div>
        <table className="min-w-full divide-y divide-gray-200 sm:rounded-lg">
            <thead className="bg-gray-50">
            <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cédula
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grado
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado de Pagos
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
                </th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {estudiantes.map((estudiante) => (
                <tr key={estudiante.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {estudiante.cedula}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                    {estudiante.nombre} {estudiante.apellido}
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {estudiante.grado && estudiante.grado.nombre_grado ? 
                    formatearNombreGrado(estudiante.grado.nombre_grado) : 
                    'No asignado'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    estudiante.estadoPagos?.alDia ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {estudiante.estadoPagos?.alDia 
                      ? 'Al día' 
                      : `${estudiante.estadoPagos?.pagosPendientes || 0} pendientes`}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                    <Link
                        to={`/admin/estudiantes/${estudiante.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Ver detalles"
                    >
                        <FaEye />
                    </Link>
                    <Link
                        to={`/admin/estudiantes/${estudiante.id}/notas`}
                        className="text-green-600 hover:text-green-900"
                        title="Ver notas"
                    >
                        <FaUserGraduate />
                    </Link>
                    <Link
                        to={`/admin/pagos/estudiante/${estudiante.id}`}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver pagos"
                    >
                        <FaMoneyBillWave />
                    </Link>
                    <button
                      onClick={handleOpenPagoModal}
                      className="text-yellow-600 hover:text-yellow-900"
                      title="Registrar pago"
                    >
                      <FaPlus />
                    </button>
                    </div>
                </td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>

          {/* Historial de pagos */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Historial de Pagos
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Pagos realizados por el representante.
            </p>
          </div>
          
          <div className="border-t border-gray-200">
            {pagos.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estudiante
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
                    {pagos.map((pago) => (
                      <tr key={pago.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatearFecha(pago.fechaPago || pago.fecha)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {pago.estudiantes?.nombre || pago.estudiante?.nombre} {pago.estudiantes?.apellido || pago.estudiante?.apellido}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {pago.aranceles?.nombre || pago.arancel?.nombre || 'Pago'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {pago.metodoPagos?.nombre || pago.metodoPago?.nombre || 'No especificado'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {pago.referencia || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${(Number(pago.monto) || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            pago.estado === 'pagado' ? 'bg-green-100 text-green-800' : 
                            pago.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {pago.estado?.charAt(0).toUpperCase() + pago.estado?.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-4 text-center text-sm text-gray-500">
                No hay pagos registrados para este representante.
              </div>
            )}
          </div>
        </div>

        {/* Documentos */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Documentos del Representante
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Documentos requeridos y subidos por el representante.
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
  
        {/* Botones de accion */}
        <div className="mt-4 flex flex-wrap space-x-2">         
          <button
            onClick={handleOpenPagoModal}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            <FaMoneyBillWave className="mr-2" /> Registrar Pago
          </button>
          
          <button
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <FaFileInvoice className="mr-2" /> Generar Comprobante
          </button>
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

        {/* Modal para registrar nuevo pago */}
        {showPagoModal && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        Registrar Nuevo Pago
                      </h3>
                      
                      {/* Mensajes de error o éxito */}
                      {errorPago && (
                        <div className="mt-2 bg-red-50 border-l-4 border-red-400 p-4">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm text-red-700">{errorPago}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {successPago && (
                        <div className="mt-2 bg-green-50 border-l-4 border-green-400 p-4">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm text-green-700">{successPago}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-2">
                        <form onSubmit={handleSubmitPago} className="space-y-6">
                          {/* Sección de Representante y Estudiante */}
                          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                            <div className="sm:col-span-6">
                              <label htmlFor="representante" className="block text-sm font-medium text-gray-700">
                                Representante
                              </label>
                              <div className="mt-1">
                                <input
                                  type="text"
                                  id="representante"
                                  value={`${representante.nombre} ${representante.apellido} - ${representante.cedula}`}
                                  className="bg-gray-100 shadow-sm block w-full sm:text-sm border-gray-300 rounded-md"
                                  disabled
                                />
                                <input
                                  type="hidden"
                                  name="representanteID"
                                  value={representante.id}
                                />
                              </div>
                            </div>
                            
                            <div className="sm:col-span-6">
                              <label htmlFor="estudiante" className="block text-sm font-medium text-gray-700">
                                Estudiante <span className="text-red-500">*</span>
                              </label>
                              <div className="mt-1">
                                <select
                                  id="estudiante"
                                  name="estudianteID"
                                  value={formPago.estudianteID}
                                  onChange={handleEstudianteChange}
                                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                  required
                                >
                                  <option value="">Seleccione un estudiante</option>
                                  {estudiantes.map((est) => (
                                    <option key={est.id} value={est.id}>
                                      {est.nombre} {est.apellido} - {est.cedula}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                          
                            {/* Sección de Detalles del Pago */}
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                            <div className="sm:col-span-3">
                              <label htmlFor="arancelID" className="block text-sm font-medium text-gray-700">
                                Concepto de Pago <span className="text-red-500">*</span>
                              </label>
                              <div className="mt-1">
                                <select
                                  id="arancelID"
                                  name="arancelID"
                                  value={formPago.arancelID}
                                  onChange={(e) => {
                                    const arancelID = e.target.value;
                                    const arancel = aranceles.find(a => a.id.toString() === arancelID);
                                    
                                    setFormPago({
                                      ...formPago,
                                      arancelID,
                                      monto: arancel ? arancel.monto.toString() : ''
                                    });
                                  }}
                                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                  required
                                >
                                  <option value="">Seleccione un concepto</option>
                                  {aranceles.map((arancel) => (
                                    <option key={arancel.id} value={arancel.id}>
                                      {arancel.nombre} - {typeof arancel.monto === 'number' 
                                        ? arancel.monto.toFixed(2) 
                                        : parseFloat(arancel.monto || 0).toFixed(2)} Bs
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            
                            <div className="sm:col-span-3">
                              <label htmlFor="metodoPagoID" className="block text-sm font-medium text-gray-700">
                                Método de Pago <span className="text-red-500">*</span>
                              </label>
                              <div className="mt-1">
                                <select
                                  id="metodoPagoID"
                                  name="metodoPagoID"
                                  value={formPago.metodoPagoID}
                                  onChange={(e) => setFormPago({...formPago, metodoPagoID: e.target.value})}
                                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                  required
                                >
                                  <option value="">Seleccione un método</option>
                                  {metodosPago.map((metodo) => (
                                    <option key={metodo.id} value={metodo.id}>
                                      {metodo.nombre}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            
                            <div className="sm:col-span-2">
                              <label htmlFor="monto" className="block text-sm font-medium text-gray-700">
                                Monto <span className="text-red-500">*</span>
                              </label>
                              <div className="mt-1">
                                <input
                                  type="number"
                                  step="0.01"
                                  id="monto"
                                  name="monto"
                                  value={formPago.monto}
                                  onChange={(e) => setFormPago({...formPago, monto: e.target.value})}
                                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                  required
                                />
                              </div>
                            </div>
                            
                            <div className="sm:col-span-2">
                              <label htmlFor="montoMora" className="block text-sm font-medium text-gray-700">
                                Mora
                              </label>
                              <div className="mt-1">
                                <input
                                  type="number"
                                  step="0.01"
                                  id="montoMora"
                                  name="montoMora"
                                  value={formPago.montoMora}
                                  onChange={(e) => setFormPago({...formPago, montoMora: e.target.value})}
                                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                />
                              </div>
                            </div>
                            
                            <div className="sm:col-span-2">
                              <label htmlFor="descuento" className="block text-sm font-medium text-gray-700">
                                Descuento
                              </label>
                              <div className="mt-1">
                                <input
                                  type="number"
                                  step="0.01"
                                  id="descuento"
                                  name="descuento"
                                  value={formPago.descuento}
                                  onChange={(e) => setFormPago({...formPago, descuento: e.target.value})}
                                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                />
                              </div>
                            </div>
                            
                            <div className="sm:col-span-3">
                              <label htmlFor="mesPago" className="block text-sm font-medium text-gray-700">
                                Mes de Pago
                              </label>
                              <div className="mt-1">
                                <select
                                  id="mesPago"
                                  name="mesPago"
                                  value={formPago.mesPago}
                                  onChange={(e) => setFormPago({...formPago, mesPago: e.target.value})}
                                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                >
                                  <option value="">Seleccione un mes</option>
                                  <option value="Enero">Enero</option>
                                  <option value="Febrero">Febrero</option>
                                  <option value="Marzo">Marzo</option>
                                  <option value="Abril">Abril</option>
                                  <option value="Mayo">Mayo</option>
                                  <option value="Junio">Junio</option>
                                  <option value="Julio">Julio</option>
                                  <option value="Agosto">Agosto</option>
                                  <option value="Septiembre">Septiembre</option>
                                  <option value="Octubre">Octubre</option>
                                  <option value="Noviembre">Noviembre</option>
                                  <option value="Diciembre">Diciembre</option>
                                </select>
                              </div>
                            </div>
                            
                            <div className="sm:col-span-3">
                              <label htmlFor="fechaPago" className="block text-sm font-medium text-gray-700">
                                Fecha de Pago <span className="text-red-500">*</span>
                              </label>
                              <div className="mt-1">
                                <input
                                  type="date"
                                  id="fechaPago"
                                  name="fechaPago"
                                  value={formPago.fechaPago}
                                  onChange={(e) => setFormPago({...formPago, fechaPago: e.target.value})}
                                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                  required
                                />
                              </div>
                            </div>
                            
                            <div className="sm:col-span-6">
                              <label htmlFor="referencia" className="block text-sm font-medium text-gray-700">
                                Referencia
                              </label>
                              <div className="mt-1">
                                <input
                                  type="text"
                                  id="referencia"
                                  name="referencia"
                                  value={formPago.referencia}
                                  onChange={(e) => setFormPago({...formPago, referencia: e.target.value})}
                                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                  placeholder="Número de referencia, transacción, etc."
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
                                  value={formPago.observaciones}
                                  onChange={(e) => setFormPago({...formPago, observaciones: e.target.value})}
                                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                ></textarea>
                              </div>
                            </div>
                          </div>
                          
                          {/* Sección de Comprobante */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Comprobante de Pago
                            </label>
                            <div className="mt-1">
                              <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-500
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-full file:border-0
                                  file:text-sm file:font-semibold
                                  file:bg-indigo-50 file:text-indigo-700
                                  hover:file:bg-indigo-100"
                                accept=".pdf,.jpg,.jpeg,.png"
                              />
                            </div>
                            <p className="mt-2 text-sm text-gray-500">
                              Suba una imagen o PDF del comprobante de pago (opcional).
                            </p>
                          </div>
                          
                          {/* Resumen del Pago */}
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="text-md font-medium text-gray-900 mb-2">Resumen del Pago</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-700">
                                  <span className="font-medium">Monto:</span> {parseFloat(formPago.monto || 0).toFixed(2)} Bs
                                </p>
                                {parseFloat(formPago.montoMora) > 0 && (
                                  <p className="text-sm text-gray-700">
                                    <span className="font-medium">Mora:</span> {parseFloat(formPago.montoMora).toFixed(2)} Bs
                                  </p>
                                )}
                                {parseFloat(formPago.descuento) > 0 && (
                                  <p className="text-sm text-gray-700">
                                    <span className="font-medium">Descuento:</span> {parseFloat(formPago.descuento).toFixed(2)} Bs
                                  </p>
                                )}
                              </div>
                              <div>
                                <p className="text-lg font-bold text-indigo-700">
                                  Total: {montoTotal} Bs
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Botones de acción */}
                          <div className="pt-5 border-t border-gray-200">
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={handleClosePagoModal}
                                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                Cancelar
                              </button>
                              <button
                                type="submit"
                                disabled={loadingPago}
                                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                              >
                                {loadingPago ? (
                                  <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Procesando...
                                  </span>
                                ) : (
                                  'Registrar Pago'
                                )}
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
     
  );
};

export default RepresentanteDetail;
