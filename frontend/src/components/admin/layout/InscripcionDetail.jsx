import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FaArrowLeft, 
  FaEdit, 
  FaCheck, 
  FaTimes, 
  FaFileDownload, 
  FaMoneyBillWave, 
  FaUserGraduate, 
  FaEye, 
  FaUpload, 
  FaTrash, 
  FaExchangeAlt,
  FaFileAlt,
  FaCheckCircle,
  FaExclamationCircle,
  FaUser,
  FaIdCard,
  FaCalendarAlt,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaVenusMars,
  FaBriefcase,
  FaStickyNote,
  FaDownload,
  FaSpinner
} from 'react-icons/fa';
import { formatearFecha, formatearNombreGrado } from '../../../utils/formatters';

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
  
  // Estado para el modal de vista previa
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [documentoPreview, setDocumentoPreview] = useState(null);

  // Estados para la transferencia de grado
  const [showTransferirGradoModal, setShowTransferirGradoModal] = useState(false);
  const [transferirGradoData, setTransferirGradoData] = useState({
    gradoDestinoID: '',
    annoEscolarID: ''
  });
  const [annoEscolarActual, setAnnoEscolarActual] = useState(null);
  const [seccionesPorGrado, setSeccionesPorGrado] = useState([]);
  const [historialTransferencias, setHistorialTransferencias] = useState([]);
  const [loadingTransferencia, setLoadingTransferencia] = useState(false);

  // Estado para el modal de pago
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [metodoPagos, setMetodoPagos] = useState([]);
  const [loadingMetodoPagos, setLoadingMetodoPagos] = useState(false);
  const [comprobante, setComprobante] = useState(null);

  // Estado para el formulario de pago
  const [formPago, setFormPago] = useState({
    metodoPagoID: '',
    referencia: '',
    monto: '',
    fechaPago: new Date().toISOString().split('T')[0],
    observaciones: ''
  });
  
  // Función para abrir el modal de pago
  const handleOpenPagoModal = async () => {
    try {
      setLoadingMetodoPagos(true);
      const token = localStorage.getItem('token');
      
      // Cargar métodos de pago
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/metodos-pago`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setMetodoPagos(response.data.filter(metodo => metodo.activo));
      
      // Establecer el monto de inscripción
      setFormPago({
        ...formPago,
        monto: inscripcion.montoInscripcion || 0
      });
      
      setLoadingMetodoPagos(false);
      setShowPagoModal(true);
    } catch (err) {
      console.error('Error al cargar métodos de pago:', err);
      setError('Error al cargar métodos de pago. Por favor, intente nuevamente.');
      setLoadingMetodoPagos(false);
    }
  };

  // Función para manejar cambios en el formulario de pago
  const handlePagoChange = (e) => {
    const { name, value } = e.target;
    setFormPago({
      ...formPago,
      [name]: value
    });
  };

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
    
          // Obtener año escolar actual
          const annoResponse = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/anno-escolar/actual`,
            config
          );
          setAnnoEscolarActual(annoResponse.data);
          
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
    
          // Si hay un estudiante, obtener su sección actual
          if (response.data.estudiante) {
            try {
              // Obtener la sección actual del estudiante
              const seccionesEstudianteResponse = await axios.get(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/secciones/estudiante/${response.data.estudiante.id}`,
                {
                  ...config,
                  params: { annoEscolarID: annoResponse.data.id }
                }
              );
              
              if (seccionesEstudianteResponse.data && seccionesEstudianteResponse.data.length > 0) {
                const seccionActual = seccionesEstudianteResponse.data[0];
                
                // Si la sección actual es diferente a la de la inscripción, actualizar
                if (seccionActual.id !== response.data.seccionID) {
                  setInscripcion(prev => ({
                    ...prev,
                    seccionActualID: seccionActual.id,
                    seccionActual: seccionActual,
                    // También obtener el grado de esta sección
                    gradoActualID: seccionActual.gradoID
                  }));
                }
              }
            } catch (err) {
              console.error('Error al cargar sección actual del estudiante:', err);
              // No interrumpimos el flujo si falla esta petición
            }
            
            // Obtener documentos del estudiante
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

  // Función para cargar secciones por grado
  const loadSeccionesByGrado = async (gradoID) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/secciones/grado/${gradoID}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      setSeccionesPorGrado(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error al cargar secciones por grado:', err);
      setSeccionesPorGrado([]);
      setLoading(false);
    }
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

  // Función para manejar la transferencia de grado
  const handleTransferirGrado = async (e) => {
  e.preventDefault();

  if (!transferirGradoData.gradoDestinoID) {
    setError('Debe seleccionar un grado destino');
    return;
  }
  
  try {
    setLoadingTransferencia(true);
    const token = localStorage.getItem('token');
    
    // Obtener el grado y sección actuales del estudiante
    const gradoOrigenID = inscripcion.gradoID;
    const seccionOrigenID = inscripcion.seccionID;
    
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados/transferir-estudiante`,
      {
        estudianteID: inscripcion.estudiante.id,
        gradoOrigenID,
        gradoDestinoID: transferirGradoData.gradoDestinoID,
        annoEscolarID: annoEscolarActual.id,
        seccionOrigenID,
        seccionDestinoID: transferirGradoData.seccionID
      },
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    
    // Recargar los datos de la inscripción para obtener la información actualizada
    const inscripcionResponse = await axios.get(
      `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/inscripciones/${id}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    
    setInscripcion(inscripcionResponse.data);
    
    // Actualizar los datos de edición
    setEditData({
      ...editData,
      gradoID: transferirGradoData.gradoDestinoID,
      seccionID: transferirGradoData.seccionID
    });
    
    setSuccess('Estudiante transferido correctamente');
    setShowTransferirGradoModal(false);
    setTransferirGradoData({
      gradoDestinoID: '',
      seccionID: '',
      motivo: ''
    });

    setTimeout(() => {
      setSuccess('');
    }, 3000);

    setLoadingTransferencia(false);
  } catch (err) {
    console.error('Error al transferir estudiante:', err);
    setError(err.response?.data?.message || 'Error al transferir estudiante. Por favor, intente nuevamente.');
    setLoadingTransferencia(false);
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
        { estado: 'aprobado', observaciones: 'Inscripción aprobada' },
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
        { estado: 'rechazado', observaciones: `Rechazado: ${motivo}` },
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
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/download/${documentoId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      
      // Obtener el nombre del archivo del header o usar uno por defecto
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'documento';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      
      // Crear un enlace temporal y hacer clic en él para descargar
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setSuccess('Documento descargado correctamente');
    } catch (err) {
      console.error('Error al descargar documento:', err);
      setError('Error al descargar el documento. Por favor, intente nuevamente.');
    }
  };
  
  // Función para previsualizar documento
  const handlePreviewDocument = (documento) => {
    console.log('Documento a previsualizar:', documento);
    setDocumentoPreview(documento);
    setShowPreviewModal(true);
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

  const handleSubmitPago = async (e) => {
    e.preventDefault();
    
    // Validar campos obligatorios
    if (!formPago.metodoPagoID || !formPago.monto || !formPago.fechaPago) {
      setError('Por favor, complete todos los campos obligatorios.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      
      // Crear FormData para enviar archivos
      const formDataToSend = new FormData();
      
      // Añadir datos del pago
      Object.entries(formPago).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formDataToSend.append(key, value);
        }
      });
      
      // Añadir IDs necesarios
      formDataToSend.append('personaID', inscripcion.estudianteID);
      formDataToSend.append('representanteID', inscripcion.representanteID);
      formDataToSend.append('inscripcionID', inscripcion.id);
      formDataToSend.append('annoEscolarID', inscripcion.annoEscolarID);
      
      // Buscar el arancel de inscripción
      const arancelesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/aranceles`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      const arancelInscripcion = arancelesResponse.data.find(a => 
        a.nombre.toLowerCase().includes('inscripci') && a.activo
      );
      
      if (arancelInscripcion) {
        formDataToSend.append('arancelID', arancelInscripcion.id);
      }
      
      // Añadir comprobante si existe
      if (comprobante) {
        formDataToSend.append('comprobante', comprobante);
      }
      
      // Enviar datos al servidor
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/pagos`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Recargar inscripción
      fetchInscripcion();
      
      // Mostrar mensaje de éxito
      setSuccess('Pago registrado correctamente. Pendiente de verificación por el administrador.');
      
      // Mostrar mensaje de éxito
      setSuccess('Pago registrado correctamente. Pendiente de verificación por el administrador.');
        
      // Cerrar modal y limpiar formulario
      setShowPagoModal(false);
      setFormPago({
        metodoPagoID: '',
        referencia: '',
        monto: '',
        fechaPago: new Date().toISOString().split('T')[0],
        observaciones: ''
      });
      setComprobante(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
      setLoading(false);
    } catch (err) {
      console.error('Error al registrar pago:', err);
      setError(err.response?.data?.message || 'Error al registrar el pago. Por favor, intente nuevamente.');
      setLoading(false);
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
  
  // Modal para transferir grado - Memoizado para evitar re-renders
  const TransferirGradoModal = useMemo(() => {
    if (!showTransferirGradoModal) return null;
    
    return (
      <div className="fixed z-50 inset-0 overflow-y-auto animate-fade-in" key="transferir-modal">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity backdrop-blur-sm"
            onClick={() => setShowTransferirGradoModal(false)}
          ></div>
          
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          
          {/* Modal */}
          <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-700 to-cyan-800 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg transition-all duration-300 hover:bg-white/30">
                    <FaExchangeAlt className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Transferir Estudiante
                  </h3>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTransferirGradoModal(false);
                  }}
                  className="text-white/80 hover:text-white transition-colors duration-200"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Body */}
            <div className="bg-white px-6 py-6">
              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                {/* Grado Actual */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <FaUserGraduate className="w-4 h-4 mr-2 text-cyan-600" />
                    Grado Actual
                  </label>
                  <input
                    type="text"
                    className="w-full py-3 px-4 border-2 border-gray-200 bg-gray-50 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 text-gray-700 font-medium"
                    value={getNombreGrado(inscripcion?.gradoID)}
                    disabled
                  />
                </div>
                
                {/* Nuevo Grado */}
                <div>
                  <label htmlFor="gradoDestinoID" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <FaExchangeAlt className="w-4 h-4 mr-2 text-cyan-600" />
                    Nuevo Grado <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    id="gradoDestinoID"
                    name="gradoDestinoID"
                    required
                    className="w-full py-3 px-4 border-2 border-gray-200 bg-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 text-gray-700 font-medium hover:border-cyan-300"
                    value={transferirGradoData.gradoDestinoID}
                    onChange={(e) => {
                      e.stopPropagation();
                      setTransferirGradoData({...transferirGradoData, gradoDestinoID: e.target.value});
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="">Seleccione un grado</option>
                    {grados.map((grado) => (
                      <option key={grado.id} value={grado.id}>
                        {formatearNombreGrado(grado.nombre_grado)}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Año Escolar */}
                <div>
                  <label htmlFor="annoEscolar" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <FaCalendarAlt className="w-4 h-4 mr-2 text-cyan-600" />
                    Año Escolar
                  </label>
                  <input
                    type="text"
                    id="annoEscolar"
                    className="w-full py-3 px-4 border-2 border-gray-200 bg-gray-50 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 text-gray-700 font-medium"
                    value={annoEscolarActual ? annoEscolarActual.periodo : 'Cargando...'}
                    disabled
                  />
                </div>
              </form>
            </div>
            
            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse gap-3" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTransferirGrado(e);
                }}
                disabled={loadingTransferencia || !transferirGradoData.gradoDestinoID}
                className="w-full sm:w-auto inline-flex justify-center items-center rounded-xl border border-transparent shadow-lg px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 text-base font-semibold text-white hover:from-cyan-700 hover:to-cyan-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
              >
                {loadingTransferencia ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <FaCheck className="mr-2" />
                    Transferir
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTransferirGradoModal(false);
                }}
                className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center items-center rounded-xl border-2 border-gray-300 shadow-sm px-6 py-3 bg-white text-base font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-200"
              >
                <FaTimes className="mr-2" />
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }, [showTransferirGradoModal, transferirGradoData, grados, annoEscolarActual, inscripcion, loadingTransferencia]);
  
  if (loading && !inscripcion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-200 border-t-cyan-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-cyan-500/10 animate-pulse"></div>
          </div>
          <p className="mt-4 text-cyan-600 font-medium">Cargando datos de la inscripción...</p>
        </div>
      </div>
    );
  }
  
  return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          {/* Toast de éxito - Fixed position */}
          {success && (
          <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
            <div className="bg-white rounded-2xl shadow-2xl border-l-4 border-emerald-500 p-4 max-w-md transform transition-all duration-300 hover:scale-105">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <FaCheckCircle className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-semibold text-gray-900">{success}</p>
                </div>
                <button
                  onClick={() => setSuccess('')}
                  className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Toast de error - Fixed position */}
        {error && (
          <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
            <div className="bg-white rounded-2xl shadow-2xl border-l-4 border-red-500 p-4 max-w-md transform transition-all duration-300 hover:scale-105">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <FaExclamationCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-semibold text-gray-900">{error}</p>
                </div>
                <button
                  onClick={() => setError('')}
                  className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Modal de transferencia de grado */}
        {TransferirGradoModal}
        
        {/* Botón de volver */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/inscripciones')}
            className="flex items-center text-cyan-700 hover:text-cyan-900 font-semibold transition-all duration-200 hover:translate-x-[-4px]"
          >
            <FaArrowLeft className="mr-2" /> Volver a la lista de inscripciones
          </button>
        </div>
        
        {/* Encabezado */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden mb-6 border border-cyan-100 transition-all duration-300 hover:shadow-2xl">
          <div className="bg-gradient-to-r from-cyan-700 to-cyan-800 px-6 py-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-white flex items-center">
                  <FaFileAlt className="mr-3" />
                  Detalles de Inscripción
                </h3>
                <p className="mt-1 text-cyan-100">
                  Información completa de la inscripción
                </p>
              </div>
              
              <div className="flex space-x-2">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center px-4 py-2 border-2 border-white/30 shadow-lg text-sm font-semibold rounded-xl text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-200 transform hover:scale-105"
                    >
                      <FaEdit className="mr-2" /> Editar
                    </button>
                    
                    {inscripcion?.estado === 'pendiente' && (
                      <>
                        <button
                          onClick={handleAprobarInscripcion}
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-lg text-sm font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 transform hover:scale-105"
                        >
                          <FaCheck className="mr-2" /> Aprobar
                        </button>
                        
                        <button
                          onClick={handleRechazarInscripcion}
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-lg text-sm font-semibold rounded-xl text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 transform hover:scale-105"
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
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-lg text-sm font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 transform hover:scale-105"
                    >
                      <FaCheck className="mr-2" /> Guardar
                    </button>
                    
                    <button
                      onClick={() => setIsEditing(false)}
                      className="inline-flex items-center px-4 py-2 border-2 border-white/30 shadow-lg text-sm font-semibold rounded-xl text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-200 transform hover:scale-105"
                    >
                      <FaTimes className="mr-2" /> Cancelar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Estado */}
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-5 border border-cyan-100 transition-all duration-200 hover:shadow-md">
                <div className="flex items-center mb-3">
                  <FaCheckCircle className="w-5 h-5 text-cyan-600 mr-2" />
                  <h4 className="text-sm font-bold text-cyan-800">Estado</h4>
                </div>
                {isEditing ? (
                  <select
                    name="estado"
                    value={editData.estado}
                    onChange={handleEditChange}
                    className="w-full py-2 px-3 border-2 border-cyan-200 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="aprobado">Aprobado</option>
                    <option value="rechazado">Rechazado</option>
                    <option value="inscrito">Inscrito</option>
                    <option value="retirado">Retirado</option>
                    <option value="graduado">Graduado</option>
                  </select>
                ) : (
                  <span className={`px-3 py-1 inline-flex text-sm font-bold rounded-full ${getEstadoColor(inscripcion?.estado)}`}>
                    {inscripcion?.estado.charAt(0).toUpperCase() + inscripcion?.estado.slice(1)}
                  </span>
                )}
              </div>

              {/* Fecha de Inscripción */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100 transition-all duration-200 hover:shadow-md">
                <div className="flex items-center mb-3">
                  <FaCalendarAlt className="w-5 h-5 text-purple-600 mr-2" />
                  <h4 className="text-sm font-bold text-purple-800">Fecha de Inscripción</h4>
                </div>
                <p className="text-gray-900 font-semibold">{formatearFecha(inscripcion?.fechaInscripcion)}</p>
              </div>

              {/* Año Escolar */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100 transition-all duration-200 hover:shadow-md">
                <div className="flex items-center mb-3">
                  <FaBriefcase className="w-5 h-5 text-emerald-600 mr-2" />
                  <h4 className="text-sm font-bold text-emerald-800">Año Escolar</h4>
                </div>
                <p className="text-gray-900 font-semibold">{inscripcion?.annoEscolar?.periodo || 'No asignado'}</p>
              </div>

              {/* Grado */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100 transition-all duration-200 hover:shadow-md">
                <div className="flex items-center mb-3">
                  <FaUserGraduate className="w-5 h-5 text-amber-600 mr-2" />
                  <h4 className="text-sm font-bold text-amber-800">Grado</h4>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-gray-900 font-semibold">{getNombreGrado(inscripcion?.gradoID)}</p>
                  <button
                    onClick={() => setShowTransferirGradoModal(true)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-semibold rounded-lg text-cyan-700 bg-cyan-100 hover:bg-cyan-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-200"
                  >
                    <FaExchangeAlt className="mr-1" /> Cambiar
                  </button>
                </div>
              </div>

              {/* Sección */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100 transition-all duration-200 hover:shadow-md">
                <div className="flex items-center mb-3">
                  <FaBriefcase className="w-5 h-5 text-blue-600 mr-2" />
                  <h4 className="text-sm font-bold text-blue-800">Sección</h4>
                </div>
                <p className="text-gray-900 font-semibold">{getNombreSeccion(inscripcion?.seccionID)}</p>
              </div>
            </div>

            {/* Observaciones - Full width */}
            <div className="mt-6 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-5 border border-gray-200 transition-all duration-200 hover:shadow-md">
              <div className="flex items-center mb-3">
                <FaStickyNote className="w-5 h-5 text-gray-600 mr-2" />
                <h4 className="text-sm font-bold text-gray-800">Observaciones</h4>
              </div>
              {isEditing ? (
                <textarea
                  name="observaciones"
                  value={editData.observaciones}
                  onChange={handleEditChange}
                  rows="3"
                  className="w-full py-2 px-3 border-2 border-gray-200 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                  placeholder="Ingrese observaciones..."
                ></textarea>
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">{inscripcion?.observaciones || 'Sin observaciones'}</p>
              )}
            </div>
          </div>
        </div>
      
        {/* Información del estudiante */}
        {inscripcion?.estudiante && (
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden mb-6 border border-cyan-100 transition-all duration-300 hover:shadow-2xl">
          <div className="bg-gradient-to-r from-cyan-700 to-cyan-800 px-6 py-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-white flex items-center">
                  <FaUserGraduate className="mr-3" />
                  Información del Estudiante
                </h3>
                <p className="mt-1 text-cyan-100">Datos personales y académicos</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowTransferirGradoModal(true)}
                  className="inline-flex items-center px-4 py-2 border-2 border-white/30 shadow-lg text-sm font-semibold rounded-xl text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-200 transform hover:scale-105"
                >
                  <FaExchangeAlt className="mr-2" /> Cambiar Grado
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información Personal */}
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-5 border border-cyan-100 transition-all duration-200 hover:shadow-md">
                <h4 className="text-sm font-bold text-cyan-800 mb-4 flex items-center">
                  <FaUser className="w-4 h-4 mr-2" />
                  Información Personal
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-32 text-sm font-medium text-cyan-700">Nombre:</div>
                    <div className="text-sm text-gray-900 font-semibold">{inscripcion.estudiante.nombre} {inscripcion.estudiante.apellido}</div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-32 text-sm font-medium text-cyan-700">Cédula:</div>
                    <div className="text-sm text-gray-900">{inscripcion.estudiante.cedula}</div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-32 text-sm font-medium text-cyan-700">Nacimiento:</div>
                    <div className="text-sm text-gray-900">{formatearFecha(inscripcion.estudiante.fechaNacimiento)}</div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-32 text-sm font-medium text-cyan-700">Género:</div>
                    <div className="text-sm text-gray-900">{inscripcion.estudiante.genero === 'M' ? 'Masculino' : 'Femenino'}</div>
                  </div>
                </div>
              </div>

              {/* Información Académica */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100 transition-all duration-200 hover:shadow-md">
                <h4 className="text-sm font-bold text-purple-800 mb-4 flex items-center">
                  <FaUserGraduate className="w-4 h-4 mr-2" />
                  Información Académica
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-24 text-sm font-medium text-purple-700">Grado:</div>
                    <div className="text-sm text-gray-900 font-semibold">{getNombreGrado(inscripcion?.gradoActualID || inscripcion?.gradoID)}</div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-24 text-sm font-medium text-purple-700">Sección:</div>
                    <div className="text-sm text-gray-900">{getNombreSeccion(inscripcion?.seccionActualID || inscripcion?.seccionID)}</div>
                  </div>
                  
                  {/* Historial de transferencias */}
                  {historialTransferencias.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-purple-200">
                      <p className="text-xs font-bold text-purple-700 mb-2">Historial de transferencias:</p>
                      <ul className="text-xs space-y-1">
                        {historialTransferencias.map((transferencia, index) => {
                          const gradoOrigen = grados.find(g => g.id === transferencia.gradoOrigenID);
                          const gradoDestino = grados.find(g => g.id === transferencia.gradoDestinoID);
                          return (
                            <li key={index} className="text-gray-700 flex items-start">
                              <FaExchangeAlt className="h-3 w-3 mr-1 text-cyan-500 mt-0.5 flex-shrink-0" />
                              <span>
                                De {gradoOrigen?.nombre_grado.replace(/_/g, ' ') || 'Grado anterior'} a {gradoDestino?.nombre_grado.replace(/_/g, ' ') || 'Grado actual'} el {formatearFecha(transferencia.fechaTransferencia)}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Información de Contacto */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100 transition-all duration-200 hover:shadow-md md:col-span-2">
                <h4 className="text-sm font-bold text-emerald-800 mb-4 flex items-center">
                  <FaPhone className="w-4 h-4 mr-2" />
                  Información de Contacto
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <FaEnvelope className="w-4 h-4 text-emerald-600 mr-2" />
                    <div>
                      <div className="text-xs font-medium text-emerald-700">Email</div>
                      <div className="text-sm text-gray-900">{inscripcion.estudiante.email || 'No registrado'}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FaPhone className="w-4 h-4 text-emerald-600 mr-2" />
                    <div>
                      <div className="text-xs font-medium text-emerald-700">Teléfono</div>
                      <div className="text-sm text-gray-900">{inscripcion.estudiante.telefono || 'No registrado'}</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FaMapMarkerAlt className="w-4 h-4 text-emerald-600 mr-2 mt-1" />
                    <div>
                      <div className="text-xs font-medium text-emerald-700">Dirección</div>
                      <div className="text-sm text-gray-900">{inscripcion.estudiante.direccion || 'No registrada'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
        
        {/* Información del representante */}
        {inscripcion?.representante && (
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden mb-6 border border-cyan-100 transition-all duration-300 hover:shadow-2xl">
            <div className="bg-gradient-to-r from-cyan-700 to-cyan-800 px-6 py-5">
              <div>
                <h3 className="text-2xl font-bold text-white flex items-center">
                  <FaUser className="mr-3" />
                  Información del Representante
                </h3>
                <p className="mt-1 text-cyan-100">
                  Datos personales del representante
                </p>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información Personal */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100 transition-all duration-200 hover:shadow-md">
                  <h4 className="text-sm font-bold text-blue-800 mb-4 flex items-center">
                    <FaIdCard className="w-4 h-4 mr-2" />
                    Datos Personales
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-24 text-sm font-medium text-blue-700">Nombre:</div>
                      <div className="text-sm text-gray-900 font-semibold">{inscripcion.representante.nombre} {inscripcion.representante.apellido}</div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-24 text-sm font-medium text-blue-700">Cédula:</div>
                      <div className="text-sm text-gray-900">{inscripcion.representante.cedula}</div>
                    </div>
                  </div>
                </div>

                {/* Información de Contacto */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100 transition-all duration-200 hover:shadow-md">
                  <h4 className="text-sm font-bold text-emerald-800 mb-4 flex items-center">
                    <FaPhone className="w-4 h-4 mr-2" />
                    Contacto
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-24 text-sm font-medium text-emerald-700">Teléfono:</div>
                      <div className="text-sm text-gray-900">{inscripcion.representante.telefono}</div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-24 text-sm font-medium text-emerald-700">Email:</div>
                      <div className="text-sm text-gray-900">{inscripcion.representante.email}</div>
                    </div>
                  </div>
                </div>

                {/* Dirección */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100 transition-all duration-200 hover:shadow-md md:col-span-2">
                  <h4 className="text-sm font-bold text-purple-800 mb-4 flex items-center">
                    <FaMapMarkerAlt className="w-4 h-4 mr-2" />
                    Dirección
                  </h4>
                  <p className="text-sm text-gray-900">{inscripcion.representante.direccion}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Documentos del estudiante */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden mb-6 border border-cyan-100 transition-all duration-300 hover:shadow-2xl">
          <div className="bg-gradient-to-r from-cyan-700 to-cyan-800 px-6 py-5">
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center">
                <FaFileAlt className="mr-3" />
                Documentos del Estudiante
              </h3>
              <p className="mt-1 text-cyan-100">
                Documentos requeridos y subidos
              </p>
            </div>
          </div>
          
          <div className="p-6">
            {documentosRequeridos.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-cyan-100 mb-4">
                  <FaFileAlt className="h-8 w-8 text-cyan-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Cargando documentos...</h3>
                <p className="text-gray-500">Obteniendo información de documentos requeridos.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {documentosRequeridos.map((doc) => {
                  const documentoSubido = documentosEstudiante.find(d => d.tipoDocumento === doc.id);
                  const estaSubido = !!documentoSubido;
                  
                  return (
                    <div 
                      key={doc.id} 
                      className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                        estaSubido 
                          ? 'border-emerald-300 bg-emerald-50' 
                          : 'border-cyan-300 bg-cyan-50'
                      }`}
                    >
                      {/* Badge de estado */}
                      <div className="absolute top-3 right-3 z-10">
                        <span className={`px-3 py-1 inline-flex items-center text-xs font-bold rounded-full shadow-lg transition-all duration-200 ${
                          estaSubido 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-cyan-500 text-white'
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
                            estaSubido ? 'bg-emerald-200' : 'bg-cyan-200'
                          }`}>
                            <FaFileAlt className={`w-6 h-6 ${
                              estaSubido ? 'text-emerald-700' : 'text-cyan-700'
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
                                  onClick={() => handlePreviewDocument(documentoSubido)}
                                  className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-blue-200 transition-colors flex items-center justify-center"
                                >
                                  <FaEye className="mr-1" /> Vista Previa
                                </button>
                                <button
                                  onClick={() => handleDownloadDocument(documentoSubido.id)}
                                  className="flex-1 bg-emerald-100 text-emerald-700 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-emerald-200 transition-colors flex items-center justify-center"
                                >
                                  <FaFileDownload className="mr-1" /> Descargar
                                </button>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleOpenUploadModal(doc)}
                                  className="flex-1 bg-cyan-600 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-cyan-700 transition-colors flex items-center justify-center"
                                >
                                  <FaUpload className="mr-1" /> Actualizar
                                </button>
                                <button
                                  onClick={() => handleDeleteDocument(documentoSubido.id)}
                                  className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-red-200 transition-colors"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </>
                          ) : (
                            <button
                              onClick={() => handleOpenUploadModal(doc)}
                              className="w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center bg-cyan-600 text-white hover:bg-cyan-700"
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
        </div>

        
        {/* Documentos del representante */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden mb-6 border border-cyan-100 transition-all duration-300 hover:shadow-2xl">
          <div className="bg-gradient-to-r from-cyan-700 to-cyan-800 px-6 py-5">
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center">
                <FaFileAlt className="mr-3" />
                Documentos del Representante
              </h3>
              <p className="mt-1 text-cyan-100">
                Documentos requeridos y subidos por el representante
              </p>
            </div>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-200 border-t-cyan-600 mx-auto"></div>
                  <div className="absolute inset-0 rounded-full bg-cyan-500/10 animate-pulse"></div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {documentosRepresentante && documentosRepresentante.map((doc) => {
                  const documentoSubido = documentosRepresentanteSubidos ? 
                    documentosRepresentanteSubidos.find(d => d.tipoDocumento === doc.id) : null;
                  const estaSubido = !!documentoSubido;
                  
                  return (
                    <div 
                      key={doc.id} 
                      className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                        estaSubido 
                          ? 'border-emerald-300 bg-emerald-50' 
                          : 'border-cyan-300 bg-cyan-50'
                      }`}
                    >
                      {/* Badge de estado */}
                      <div className="absolute top-3 right-3 z-10">
                        <span className={`px-3 py-1 inline-flex items-center text-xs font-bold rounded-full shadow-lg transition-all duration-200 ${
                          estaSubido 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-cyan-500 text-white'
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
                            estaSubido ? 'bg-emerald-200' : 'bg-cyan-200'
                          }`}>
                            <FaFileAlt className={`w-6 h-6 ${
                              estaSubido ? 'text-emerald-700' : 'text-cyan-700'
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
                                  onClick={() => handlePreviewDocument(documentoSubido)}
                                  className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-blue-200 transition-colors flex items-center justify-center"
                                >
                                  <FaEye className="mr-1" /> Vista Previa
                                </button>
                                <button
                                  onClick={() => handleDownloadDocument(documentoSubido.id)}
                                  className="flex-1 bg-emerald-100 text-emerald-700 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-emerald-200 transition-colors flex items-center justify-center"
                                >
                                  <FaFileDownload className="mr-1" /> Descargar
                                </button>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleOpenUploadModalRepresentante(doc)}
                                  className="flex-1 bg-cyan-600 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-cyan-700 transition-colors flex items-center justify-center"
                                >
                                  <FaUpload className="mr-1" /> Actualizar
                                </button>
                                <button
                                  onClick={() => handleDeleteDocument(documentoSubido.id)}
                                  className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-red-200 transition-colors"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </>
                          ) : (
                            <button
                              onClick={() => handleOpenUploadModalRepresentante(doc)}
                              className="w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center bg-cyan-600 text-white hover:bg-cyan-700"
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
        </div>
        
        {/* Modal para subir/resubir documentos */}
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
                <div className="bg-gradient-to-r from-cyan-700 to-cyan-800 px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-lg transition-all duration-300 hover:bg-white/30">
                        <FaUpload className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white">
                        {documentoSeleccionado?.documentoExistente ? 'Actualizar Documento' : 'Subir Documento'}
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
                    <div className="flex items-center space-x-3 p-4 bg-cyan-50 rounded-xl border border-cyan-200 transition-all duration-200 hover:border-cyan-300">
                      <FaFileAlt className="w-6 h-6 text-cyan-600" />
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
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-3 file:px-6
                        file:rounded-xl file:border-0
                        file:text-sm file:font-semibold
                        file:bg-cyan-50 file:text-cyan-700
                        hover:file:bg-cyan-100
                        file:transition-all file:duration-200
                        file:cursor-pointer
                        cursor-pointer
                        border-2 border-dashed border-gray-300 rounded-xl p-4
                        hover:border-cyan-400 transition-all duration-200"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Formatos permitidos: PDF, JPG, PNG, DOC, DOCX
                    </p>
                  </div>
                </div>
                
                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse gap-3">
                  <button
                    type="button"
                    onClick={handleUploadDocument}
                    disabled={subiendoDocumento || !archivoSeleccionado}
                    className="w-full sm:w-auto inline-flex justify-center items-center rounded-xl border border-transparent shadow-lg px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 text-base font-semibold text-white hover:from-cyan-700 hover:to-cyan-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                  >
                    {subiendoDocumento ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <FaUpload className="mr-2" />
                        Subir
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center items-center rounded-xl border-2 border-gray-300 shadow-sm px-6 py-3 bg-white text-base font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-200"
                  >
                    <FaTimes className="mr-2" />
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal para subir/resubir documentos del representante */}
        {showModalRepresentante && (
          <div className="fixed z-50 inset-0 overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              {/* Overlay */}
              <div 
                className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity backdrop-blur-sm"
                onClick={handleCloseModalRepresentante}
              ></div>
              
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              {/* Modal */}
              <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full animate-scale-in">
                {/* Header */}
                <div className="bg-gradient-to-r from-cyan-700 to-cyan-800 px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-lg transition-all duration-300 hover:bg-white/30">
                        <FaUpload className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white">
                        {documentoRepresentanteSeleccionado?.documentoExistente ? 'Actualizar Documento' : 'Subir Documento'}
                      </h3>
                    </div>
                    <button
                      onClick={handleCloseModalRepresentante}
                      className="text-white/80 hover:text-white transition-colors duration-200"
                    >
                      <FaTimes className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {/* Body */}
                <div className="bg-white px-6 py-6">
                  <div className="mb-6">
                    <div className="flex items-center space-x-3 p-4 bg-cyan-50 rounded-xl border border-cyan-200 transition-all duration-200 hover:border-cyan-300">
                      <FaFileAlt className="w-6 h-6 text-cyan-600" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {documentoRepresentanteSeleccionado?.nombre}
                          {documentoRepresentanteSeleccionado?.obligatorio && <span className="text-red-500 ml-1">*</span>}
                        </p>
                        <p className="text-xs text-gray-600">
                          Documento del representante - {documentoRepresentanteSeleccionado?.obligatorio ? 'Obligatorio' : 'Opcional'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Seleccione un archivo
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-3 file:px-6
                        file:rounded-xl file:border-0
                        file:text-sm file:font-semibold
                        file:bg-cyan-50 file:text-cyan-700
                        hover:file:bg-cyan-100
                        file:transition-all file:duration-200
                        file:cursor-pointer
                        cursor-pointer
                        border-2 border-dashed border-gray-300 rounded-xl p-4
                        hover:border-cyan-400 transition-all duration-200"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Formatos permitidos: PDF, JPG, PNG, DOC, DOCX
                    </p>
                  </div>
                </div>
                
                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse gap-3">
                  <button
                    type="button"
                    onClick={handleUploadDocumentRepresentante}
                    disabled={subiendoDocumento || !archivoSeleccionado}
                    className="w-full sm:w-auto inline-flex justify-center items-center rounded-xl border border-transparent shadow-lg px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 text-base font-semibold text-white hover:from-cyan-700 hover:to-cyan-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                  >
                    {subiendoDocumento ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <FaUpload className="mr-2" />
                        Subir
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModalRepresentante}
                    className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center items-center rounded-xl border-2 border-gray-300 shadow-sm px-6 py-3 bg-white text-base font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-200"
                  >
                    <FaTimes className="mr-2" />
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Vista Previa de Documentos */}
        {showPreviewModal && documentoPreview && (
          <div className="fixed z-50 inset-0 overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-center min-h-screen py-8 px-4 text-center">
              {/* Overlay */}
              <div 
                className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity backdrop-blur-sm"
                onClick={() => setShowPreviewModal(false)}
              ></div>
              
              {/* Modal */}
              <div className="relative inline-block bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all max-w-4xl w-full max-h-[90vh] flex flex-col animate-scale-in">
                {/* Header */}
                <div className="bg-gradient-to-r from-cyan-700 to-cyan-800 px-6 py-4 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <FaEye className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          Vista Previa del Documento
                        </h3>
                        <p className="text-cyan-100 text-sm">
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
                <div className="bg-white px-6 py-6 overflow-y-auto flex-1">
                  <div className="bg-gray-100 rounded-xl p-4 flex items-center justify-center">
                    {(() => {
                      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                      // El backend guarda la ruta en 'urlDocumento' que ya incluye '/uploads/documentos/'
                      const urlDocumento = documentoPreview.urlDocumento;
                      
                      // Construir la URL completa
                      const urlCompleta = `${apiUrl}${urlDocumento}`;
                      
                      console.log('URL del documento:', urlCompleta);
                      console.log('Documento completo:', documentoPreview);
                      
                      if (!urlDocumento) {
                        return (
                          <div className="text-center">
                            <FaFileAlt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">
                              No se encontró la ruta del archivo.
                            </p>
                          </div>
                        );
                      }
                      
                      const extension = urlDocumento.toLowerCase().split('.').pop();
                      
                      if (extension === 'pdf') {
                        return (
                          <iframe
                            src={urlCompleta}
                            className="w-full h-[500px] rounded-lg border-2 border-gray-300"
                            title="Vista previa del documento"
                            onError={(e) => {
                              console.error('Error al cargar PDF:', urlCompleta);
                            }}
                          />
                        );
                      } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
                        return (
                          <div className="w-full flex justify-center">
                            <img
                              src={urlCompleta}
                              alt="Vista previa"
                              className="max-w-full max-h-[500px] rounded-lg shadow-lg object-contain"
                              onError={(e) => {
                                console.error('Error al cargar imagen:', urlCompleta);
                              }}
                            />
                          </div>
                        );
                      } else {
                        return (
                          <div className="text-center">
                            <FaFileAlt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-2">
                              No se puede mostrar una vista previa de este tipo de archivo.
                            </p>
                            <p className="text-xs text-gray-500 mb-4">
                              Tipo: {extension?.toUpperCase() || 'Desconocido'}
                            </p>
                            <button
                              onClick={() => handleDownloadDocument(documentoPreview.id)}
                              className="mt-4 px-6 py-3 bg-cyan-600 text-white font-semibold rounded-xl hover:bg-cyan-700 transition-colors duration-200 inline-flex items-center"
                            >
                              <FaFileDownload className="mr-2" />
                              Descargar Documento
                            </button>
                          </div>
                        );
                      }
                    })()}
                  </div>
                </div>
                
                {/* Footer */}
                <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3 flex-shrink-0 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowPreviewModal(false)}
                    className="px-6 py-2 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all duration-200"
                  >
                    Cerrar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadDocument(documentoPreview.id)}
                    className="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-xl hover:bg-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center"
                  >
                    <FaFileDownload className="mr-2" />
                    Descargar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Pagos Realizados */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden mb-6 border border-cyan-100 transition-all duration-300 hover:shadow-2xl">
          <div className="bg-gradient-to-r from-cyan-700 to-cyan-800 px-6 py-5">
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center">
                <FaMoneyBillWave className="mr-3" />
                Pagos Realizados
              </h3>
              <p className="mt-1 text-cyan-100">
                Historial de pagos asociados a esta inscripción
              </p>
            </div>
          </div>
          
          <div className="p-6">
            {(!inscripcion?.pagos || inscripcion.pagos.length === 0) ? (
              <div className="text-center py-12">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-cyan-100 mb-4">
                  <FaMoneyBillWave className="h-8 w-8 text-cyan-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sin pagos registrados</h3>
                <p className="text-gray-500">No se han realizado pagos para esta inscripción.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {inscripcion.pagos.map((pago) => (
                  <div 
                    key={pago.id} 
                    className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-5 border border-cyan-100 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      {/* Información principal */}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <FaCalendarAlt className="w-4 h-4 text-cyan-600 mr-2" />
                          <div>
                            <div className="text-xs font-medium text-cyan-700">Fecha</div>
                            <div className="text-sm text-gray-900 font-semibold">{formatearFecha(pago.fechaPago)}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <FaStickyNote className="w-4 h-4 text-purple-600 mr-2" />
                          <div>
                            <div className="text-xs font-medium text-purple-700">Concepto</div>
                            <div className="text-sm text-gray-900 font-semibold">{pago.arancel?.nombre || 'Pago de inscripción'}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <FaMoneyBillWave className="w-4 h-4 text-emerald-600 mr-2" />
                          <div>
                            <div className="text-xs font-medium text-emerald-700">Método de Pago</div>
                            <div className="text-sm text-gray-900">{pago.metodoPago?.nombre || 'No especificado'}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <FaIdCard className="w-4 h-4 text-amber-600 mr-2" />
                          <div>
                            <div className="text-xs font-medium text-amber-700">Referencia</div>
                            <div className="text-sm text-gray-900">{pago.referencia || 'N/A'}</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Monto y Estado */}
                      <div className="flex items-center gap-4 md:flex-col md:items-end">
                        <div className="text-right">
                          <div className="text-xs font-medium text-gray-600">Monto</div>
                          <div className="text-2xl font-bold text-cyan-700">${(Number(pago.monto) || 0).toFixed(2)}</div>
                        </div>
                        <span className={`px-4 py-2 inline-flex items-center text-xs font-bold rounded-full shadow-md ${
                          pago.estado === 'completado' 
                            ? 'bg-emerald-500 text-white' 
                            : pago.estado === 'rechazado' 
                            ? 'bg-red-500 text-white' 
                            : 'bg-amber-500 text-white'
                        }`}>
                          {pago.estado === 'completado' && <FaCheckCircle className="mr-1" />}
                          {pago.estado === 'rechazado' && <FaTimes className="mr-1" />}
                          {pago.estado === 'pendiente' && <FaExclamationCircle className="mr-1" />}
                          {pago.estado.charAt(0).toUpperCase() + pago.estado.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        
        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
          <Link
            to={`/admin/estudiantes/${inscripcion?.estudiante?.id}`}
            className="inline-flex items-center justify-center px-6 py-3 border-2 border-cyan-300 shadow-lg text-sm font-semibold rounded-xl text-cyan-700 bg-white hover:bg-cyan-50 hover:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-200 transform hover:scale-105"
          >
            <FaUserGraduate className="mr-2" /> Ver Perfil del Estudiante
          </Link>
          
          {!inscripcion?.pagoInscripcionCompletado && (
            <Link
              to={`/admin/inscripciones/${id}/pago`}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent shadow-lg text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 transform hover:scale-105"
            >
              <FaMoneyBillWave className="mr-2" /> Registrar Pago
            </Link>
          )}
          
          <Link
            to={`/admin/inscripciones/${id}/comprobante`}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent shadow-lg text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-200 transform hover:scale-105"
          >
            <FaFileDownload className="mr-2" /> Generar Comprobante
          </Link>
        </div>
        </div>
      </div>


    
  );
};

export default InscripcionDetail;
