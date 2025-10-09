import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaEdit, FaTrash, FaEye, FaFileDownload, FaUpload, FaUserGraduate, FaMoneyBillWave, FaFileInvoice, FaBook, FaGraduationCap, FaChalkboardTeacher, FaUser, FaIdCard, FaCalendarAlt, FaPhone, FaEnvelope, FaMapMarkerAlt, FaStickyNote, FaChartLine, FaAward, FaTimes, FaCheck, FaPlus } from 'react-icons/fa';
import { formatearFecha, parsearFecha, formatearFechaParaInput, tipoDocumentoFormateado, formatearNombreGrado, formatearCedula } from '../../../utils/formatters';

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
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'info');
  
  // Estados adicionales para las nuevas funcionalidades
  const [filtroMateria, setFiltroMateria] = useState('');
  const [filtroLapso, setFiltroLapso] = useState('');
  const [filtroTipoEvaluacion, setFiltroTipoEvaluacion] = useState('');
  const [resumenCalificaciones, setResumenCalificaciones] = useState(null);
  const [archivosEvaluaciones, setArchivosEvaluaciones] = useState([]);
  const [loadingCalificaciones, setLoadingCalificaciones] = useState(false);
  const [loadingMaterias, setLoadingMaterias] = useState(false);
  
  // Estados para el modal de documentos
  const [showModal, setShowModal] = useState(false);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [subiendoDocumento, setSubiendoDocumento] = useState(false);
  const fileInputRef = useRef(null);
  
  // Estados para vista previa de documentos
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [documentoPreview, setDocumentoPreview] = useState(null);
  const [descargandoTodos, setDescargandoTodos] = useState(false);

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
        // console.log('Obteniendo datos del estudiante ID:', id);
        const estudianteResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas/${id}`,
          config
        );
        // console.log('Datos del estudiante:', estudianteResponse.data);
        setEstudiante(estudianteResponse.data);

        // Obtener representante
        try {
          const representanteResponse = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas/estudiante/${id}/representante`,
            config
          );
          setRepresentante(representanteResponse.data);
        } catch (representanteError) {
          console.error('Error al obtener representante:', representanteError);
          setRepresentante(null);
        }

        // Obtener año escolar actual
        let gradoData = null;
        let annoEscolarData = null;
        
        try {
          const annoEscolarResponse = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/anno-escolar/actual`,
            config
          );
          annoEscolarData = annoEscolarResponse.data;
          setAnnoEscolar(annoEscolarData);
          // console.log('Año escolar obtenido:', annoEscolarData);
        } catch (annoError) {
          console.error('Error al obtener año escolar:', annoError);
          setAnnoEscolar(null);
        }

        // Obtener grado del estudiante (necesita annoEscolarID)
        if (annoEscolarData && annoEscolarData.id) {
          try {
            // console.log('Obteniendo grado para estudiante ID:', id, 'con año escolar:', annoEscolarData.id);
            const gradoResponse = await axios.get(
              `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados/estudiante/${id}?annoEscolarID=${annoEscolarData.id}`,
              config
            );
            // console.log('Respuesta de grado:', gradoResponse.data);
            if (gradoResponse.data && gradoResponse.data.length > 0) {
              gradoData = gradoResponse.data[0];
              setGrado(gradoData);
            } else {
              // console.log('No se encontró grado para el estudiante');
              setGrado(null);
            }
          } catch (gradoError) {
            console.error('Error al obtener grado:', gradoError.response?.data || gradoError.message);
            setGrado(null);
          }

          // Obtener sección del estudiante (necesita annoEscolarID)
          try {
            // console.log('Obteniendo sección para estudiante ID:', id, 'con año escolar:', annoEscolarData.id);
            const seccionResponse = await axios.get(
              `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/secciones/estudiante/${id}?annoEscolarID=${annoEscolarData.id}`,
              config
            );
            // console.log('Respuesta de sección:', seccionResponse.data);
            if (seccionResponse.data && seccionResponse.data.length > 0) {
              setSeccion(seccionResponse.data[0]);
            } else {
              // console.log('No se encontró sección para el estudiante');
              setSeccion(null);
            }
          } catch (seccionError) {
            console.error('Error al obtener sección:', seccionError.response?.data || seccionError.message);
            setSeccion(null);
          }

          // Obtener materias del estudiante (solo si tiene grado)
          if (gradoData && gradoData.id) {
            try {
              // console.log('Obteniendo materias para grado ID:', gradoData.id, 'con año escolar:', annoEscolarData.id);
              const materiasResponse = await axios.get(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados/${gradoData.id}/materias?annoEscolarID=${annoEscolarData.id}`,
                config
              );
              // console.log('Respuesta de materias:', materiasResponse.data);
              setMaterias(materiasResponse.data || []);
            } catch (materiasError) {
              console.error('Error al obtener materias:', materiasError.response?.data || materiasError.message);
              setMaterias([]);
            }
          }
        } else {
          // console.log('No se puede obtener grado, sección y materias sin año escolar activo');
          setGrado(null);
          setSeccion(null);
          setMaterias([]);
        }

        // Obtener evaluaciones del estudiante
        try {
          const evaluacionesUrl = annoEscolarData && annoEscolarData.id 
            ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/evaluaciones/estudiante/${id}?annoEscolarID=${annoEscolarData.id}`
            : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/evaluaciones/estudiante/${id}`;
          
          // console.log('Obteniendo evaluaciones para estudiante ID:', id, annoEscolarData ? `con año escolar: ${annoEscolarData.id}` : 'sin año escolar');
          const evaluacionesResponse = await axios.get(evaluacionesUrl, config);
          // console.log('Respuesta de evaluaciones:', evaluacionesResponse.data);
          setEvaluaciones(evaluacionesResponse.data || []);
        } catch (evaluacionesError) {
          console.error('Error al obtener evaluaciones:', evaluacionesError.response?.data || evaluacionesError.message);
          setEvaluaciones([]);
        }

        // Obtener calificaciones del estudiante
        try {
          const calificacionesUrl = annoEscolarData && annoEscolarData.id 
            ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/calificaciones/estudiante/${id}?annoEscolarID=${annoEscolarData.id}`
            : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/calificaciones/estudiante/${id}`;
          
          // console.log('Obteniendo calificaciones para estudiante ID:', id, annoEscolarData ? `con año escolar: ${annoEscolarData.id}` : 'sin año escolar');
          const calificacionesResponse = await axios.get(calificacionesUrl, config);
          // console.log('Respuesta de calificaciones:', calificacionesResponse.data);
          setCalificaciones(calificacionesResponse.data || []);
        } catch (calificacionesError) {
          console.error('Error al obtener calificaciones:', calificacionesError.response?.data || calificacionesError.message);
          setCalificaciones([]);
        }

        // Obtener documentos del estudiante
        try {
          // console.log('Obteniendo documentos para estudiante ID:', id);
          const documentosResponse = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/persona/${id}`,
            config
          );
          // console.log('Respuesta de documentos:', documentosResponse.data);
          setDocumentos(documentosResponse.data || []);
        } catch (documentosError) {
          console.error('Error al obtener documentos:', documentosError.response?.data || documentosError.message);
          setDocumentos([]);
        }

        // Obtener documentos requeridos para estudiantes
        try {
          // console.log('Obteniendo documentos requeridos para estudiante');
          const documentosRequeridosResponse = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/verificar/${id}/estudiante`,
            config
          );
          // console.log('Respuesta de documentos requeridos:', documentosRequeridosResponse.data);
          setDocumentosRequeridos(documentosRequeridosResponse.data.documentosRequeridos || []);
        } catch (documentosRequeridosError) {
          console.error('Error al obtener documentos requeridos:', documentosRequeridosError.response?.data || documentosRequeridosError.message);
          setDocumentosRequeridos([]);
        }

        // Obtener pagos del estudiante
        try {
          // console.log('Obteniendo pagos para estudiante ID:', id);
          const pagosResponse = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/pagos/estudiante/${id}`,
            config
          );
          // console.log('Respuesta de pagos:', pagosResponse.data);
          setPagos(pagosResponse.data || []);
        } catch (pagosError) {
          console.error('Error al obtener pagos:', pagosError.response?.data || pagosError.message);
          setPagos([]);
        }

        // Preparar datos para edición
        setEditData({
          nombre: estudianteResponse.data.nombre || '',
          apellido: estudianteResponse.data.apellido || '',
          cedula: estudianteResponse.data.cedula || '',
          fechaNacimiento: estudianteResponse.data.fechaNacimiento || '',
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

  // Función para obtener resumen de calificaciones
  const fetchResumenCalificaciones = async () => {
    try {
      setLoadingCalificaciones(true);
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/calificaciones/resumen/estudiante/${id}`,
          config
        );
        
        if (response.data && Object.keys(response.data).length > 0) {
          setResumenCalificaciones(response.data);
        } else {
          throw new Error('No data from backend');
        }
      } catch (error) {
        // Crear resumen local como fallback
        const resumenLocal = {
          promedioGeneral: calificaciones.length > 0 
            ? (calificaciones.reduce((acc, cal) => acc + parseFloat(cal.calificacion || 0), 0) / calificaciones.length).toFixed(2)
            : 0,
          totalEvaluaciones: calificaciones.length,
          aprobadas: calificaciones.filter(cal => parseFloat(cal.calificacion) >= 10).length,
          reprobadas: calificaciones.filter(cal => parseFloat(cal.calificacion) < 10).length
        };
        setResumenCalificaciones(resumenLocal);
      }
    } catch (error) {
      console.error('Error al obtener resumen de calificaciones:', error);
    } finally {
      setLoadingCalificaciones(false);
    }
  };

  // Función para obtener archivos de evaluaciones
  const fetchArchivosEvaluaciones = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      // Obtener evaluaciones del estudiante y luego sus archivos
      const evaluacionesEstudiante = evaluaciones.filter(ev => 
        materias.some(materia => materia.id === ev.materiaID)
      );
      
      const archivosPromises = evaluacionesEstudiante.map(async (evaluacion) => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/archivos-evaluaciones/estudiante/${evaluacion.id}/${id}`,
            config
          );
          return response.data;
        } catch (error) {
          console.error(`Error al obtener archivos para evaluación ${evaluacion.id}:`, error);
          return [];
        }
      });
      
      const archivosArrays = await Promise.all(archivosPromises);
      const todosLosArchivos = archivosArrays.flat();
      setArchivosEvaluaciones(todosLosArchivos);
    } catch (error) {
      console.error('Error al obtener archivos de evaluaciones:', error);
      setArchivosEvaluaciones([]);
    }
  };

  // Función para manejar la subida de documentos
  const handleSubirDocumento = async () => {
    if (!archivoSeleccionado || !documentoSeleccionado) {
      setError('Debe seleccionar un archivo y un tipo de documento');
      return;
    }

    try {
      setSubiendoDocumento(true);
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('documento', archivoSeleccionado);
      formData.append('personaID', id);
      formData.append('tipoDocumento', documentoSeleccionado.id);
      formData.append('descripcion', documentoSeleccionado.nombre);

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

      setSuccess('Documento subido correctamente');
      setShowModal(false);
      setArchivoSeleccionado(null);
      setDocumentoSeleccionado(null);
      
      // Recargar documentos
      const documentosResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/persona/${id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setDocumentos(documentosResponse.data || []);

      // Recargar documentos requeridos
      const documentosRequeridosResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/verificar/${id}/estudiante`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setDocumentosRequeridos(documentosRequeridosResponse.data.documentosRequeridos || []);

    } catch (error) {
      console.error('Error al subir documento:', error);
      setError('Error al subir el documento. Por favor, intente nuevamente.');
    } finally {
      setSubiendoDocumento(false);
    }
  };

  // Función para eliminar documento
  const handleEliminarDocumento = async (documentoId) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este documento?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/${documentoId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      setSuccess('Documento eliminado correctamente');
      
      // Recargar documentos
      const documentosResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/persona/${id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setDocumentos(documentosResponse.data || []);

      // Recargar documentos requeridos
      const documentosRequeridosResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/verificar/${id}/estudiante`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setDocumentosRequeridos(documentosRequeridosResponse.data.documentosRequeridos || []);

    } catch (error) {
      console.error('Error al eliminar documento:', error);
      setError('Error al eliminar el documento. Por favor, intente nuevamente.');
    }
  };

  // Función para descargar documento
  const handleDescargarDocumento = (documentoId) => {
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/${documentoId}/download`;
    window.open(url, '_blank');
  };

  // Función para vista previa de documento
  const handleVistaPrevia = (documento) => {
    setDocumentoPreview(documento);
    setShowPreviewModal(true);
  };

  // Función para descargar todos los documentos como ZIP
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

      // Crear blob y descargar
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `documentos_${estudiante?.nombre}_${estudiante?.apellido}_${estudiante?.cedula}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess('Documentos descargados correctamente');
    } catch (error) {
      console.error('Error al descargar documentos:', error);
      setError('Error al descargar los documentos. Por favor, intente nuevamente.');
    } finally {
      setDescargandoTodos(false);
    }
  };

  // Función para manejar la edición del estudiante
  const handleEditarEstudiante = () => {
    setIsEditing(true);
  };

  // Función para cancelar la edición
  const handleCancelarEdicion = () => {
    setIsEditing(false);
    setEditData({
      nombre: estudiante?.nombre || '',
      apellido: estudiante?.apellido || '',
      cedula: estudiante?.cedula || '',
      fechaNacimiento: estudiante?.fechaNacimiento || '',
      genero: estudiante?.genero || '',
      telefono: estudiante?.telefono || '',
      email: estudiante?.email || '',
      direccion: estudiante?.direccion || '',
      observaciones: estudiante?.observaciones || ''
    });
  };

  // Función para guardar los cambios del estudiante
  const handleGuardarCambios = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas/${id}`,
        editData,
        config
      );

      setEstudiante(response.data);
      setIsEditing(false);
      setSuccess('Información del estudiante actualizada correctamente');
    } catch (error) {
      console.error('Error al actualizar estudiante:', error);
      setError('Error al actualizar la información del estudiante. Por favor, intente nuevamente.');
    }
  };

  // Función para manejar cambios en los campos de edición
  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Calcular monto total del pago
  const montoTotal = useMemo(() => {
    const monto = parseFloat(formPago.monto) || 0;
    const montoMora = parseFloat(formPago.montoMora) || 0;
    const descuento = parseFloat(formPago.descuento) || 0;
    return (monto + montoMora - descuento).toFixed(2);
  }, [formPago.monto, formPago.montoMora, formPago.descuento]);

  // Función para abrir el modal de pago
  const handleOpenPagoModal = () => {
    // console.log('Abriendo modal de pago...');
    
    // Inicializar el formulario con el estudiante actual
    setFormPago({
      estudianteID: estudiante?.id || '',
      representanteID: representante?.id || '',
      arancelID: '',
      metodoPagoID: '',
      annoEscolarID: annoEscolar?.id || '',
      inscripcionID: '',
      monto: '',
      montoMora: '0',
      descuento: '0',
      mesPago: '',
      fechaPago: new Date().toISOString().split('T')[0],
      referencia: '',
      observaciones: ''
    });
    
    setErrorPago('');
    setSuccessPago('');
    setShowPagoModal(true);
    
    // Cargar datos después de abrir el modal
    loadPagoData();
  };

  // Función para cargar datos del modal de pago
  const loadPagoData = async () => {
    try {
      setLoadingPago(true);
      const token = localStorage.getItem('token');

      // Cargar aranceles y métodos de pago en paralelo
      const [arancelesResponse, metodosPagoResponse] = await Promise.all([
        axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/aranceles`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        ),
        axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/metodos-pago`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        )
      ]);
      
      setAranceles(arancelesResponse.data || []);
      setMetodosPago(metodosPagoResponse.data || []);
      
      // console.log('Datos cargados:', {
      //   aranceles: arancelesResponse.data?.length || 0,
      //   metodosPago: metodosPagoResponse.data?.length || 0
      // });
      
      setLoadingPago(false);
    } catch (err) {
      console.error('Error al cargar datos para el pago:', err);
      setErrorPago('Error al cargar los datos necesarios. Algunos campos pueden no estar disponibles.');
      setLoadingPago(false);
    }
  };

  // Función para cerrar el modal de pago
  const handleClosePagoModal = () => {
    setShowPagoModal(false);
    setFormPago({
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
    setErrorPago('');
    setSuccessPago('');
  };

  // Función para enviar el formulario de pago
  const handleSubmitPago = async (e) => {
    e.preventDefault();
    
    // Validar campos obligatorios
    if (!formPago.arancelID || !formPago.metodoPagoID || !formPago.monto) {
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
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/pagos/estudiante/${id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setPagos(pagosResponse.data || []);
      
      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        handleClosePagoModal();
      }, 2000);
      
      setLoadingPago(false);
    } catch (err) {
      console.error('Error al registrar pago:', err);
      setErrorPago(err.response?.data?.message || 'Error al registrar el pago. Por favor, intente nuevamente.');
      setLoadingPago(false);
    }
  };

  // Cargar datos adicionales cuando cambia la pestaña
  useEffect(() => {
    if (activeTab === 'calificaciones' && estudiante && calificaciones.length > 0) {
      fetchResumenCalificaciones();
    }
    if (activeTab === 'calificaciones' && estudiante && evaluaciones.length > 0 && materias.length > 0) {
      fetchArchivosEvaluaciones();
    }
  }, [activeTab, estudiante, calificaciones, evaluaciones, materias]);

  // Limpiar mensajes después de 5 segundos
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Calcular progreso académico por materia
  const calcularProgresoMateria = (materiaId) => {
    const calificacionesMateria = calificaciones.filter(cal => 
      cal.Evaluaciones && cal.Evaluaciones.materiaID === materiaId
    );
    const evaluacionesMateria = evaluaciones.filter(evaluacion => evaluacion.materiaID === materiaId);
    
    if (calificacionesMateria.length === 0) {
      return {
        promedio: 0,
        porcentajeCompletado: 0,
        calificaciones: [],
        evaluacionesTotales: evaluacionesMateria.length,
        evaluacionesCompletadas: 0,
        status: 'sin-calificaciones'
      };
    }
    
    const suma = calificacionesMateria.reduce((acc, cal) => acc + parseFloat(cal.calificacion || 0), 0);
    const promedio = suma / calificacionesMateria.length;
    
    const porcentajeCompletado = evaluacionesMateria.length > 0 
      ? (calificacionesMateria.length / evaluacionesMateria.length) * 100 
      : 0;
    
    let status = 'excelente';
    if (promedio < 10) status = 'reprobado';
    else if (promedio < 14) status = 'regular';
    else if (promedio < 17) status = 'bueno';
    
    return {
      promedio: promedio.toFixed(2),
      porcentajeCompletado: Math.round(porcentajeCompletado),
      calificaciones: calificacionesMateria,
      evaluacionesTotales: evaluacionesMateria.length,
      evaluacionesCompletadas: calificacionesMateria.length,
      status
    };
  };

  // Filtrar calificaciones según los filtros activos
  const getCalificacionesFiltradas = () => {
    let calificacionesFiltradas = [...calificaciones];
    
    if (filtroMateria) {
      calificacionesFiltradas = calificacionesFiltradas.filter(cal => 
        cal.Evaluaciones && cal.Evaluaciones.materiaID === parseInt(filtroMateria)
      );
    }
    
    if (filtroLapso) {
      calificacionesFiltradas = calificacionesFiltradas.filter(cal => 
        cal.Evaluaciones && cal.Evaluaciones.lapso === filtroLapso
      );
    }
    
    if (filtroTipoEvaluacion) {
      calificacionesFiltradas = calificacionesFiltradas.filter(cal => 
        cal.Evaluaciones && cal.Evaluaciones.tipoEvaluacion === filtroTipoEvaluacion
      );
    }
    
    return calificacionesFiltradas;
  };

  // Obtener color según el status de la materia
  const getStatusColor = (status) => {
    switch (status) {
      case 'excelente': return 'bg-green-100 text-green-800 border-green-200';
      case 'bueno': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'regular': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reprobado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading && !estudiante) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-blue-500/10 animate-pulse"></div>
          </div>
          <p className="mt-4 text-lg font-medium text-gray-700">Cargando información del estudiante...</p>
          <p className="text-sm text-gray-500">Por favor espere un momento</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-slate-50 to-red-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl border border-red-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTimes className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error al cargar datos</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
            <Link
              to="/admin/estudiantes"
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Volver
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  to="/admin/estudiantes"
                  className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
                >
                  <FaArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                  <h1 className="text-3xl font-bold">
                    {estudiante?.nombre} {estudiante?.apellido}
                  </h1>
                  <p className="text-blue-100 mt-1">
                    Cédula: {estudiante?.cedula ? `V - ${formatearCedula(estudiante.cedula)}` : 'No registrada'} • {grado ? formatearNombreGrado(grado.nombre_grado) : 'Sin grado asignado'} {seccion ? `- Sección ${seccion.nombre_seccion}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {!isEditing ? (
                  <>
                    <button
                      onClick={handleEditarEstudiante}
                      className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center space-x-2 border border-white/20"
                    >
                      <FaEdit />
                      <span>Editar</span>
                    </button>
                    <button className="bg-red-500/80 backdrop-blur-sm text-white px-4 py-2 rounded-xl hover:bg-red-600/80 transition-all duration-300 flex items-center space-x-2 border border-red-400/20">
                      <FaTrash />
                      <span>Eliminar</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleGuardarCambios}
                      className="bg-green-500/80 backdrop-blur-sm text-white px-4 py-2 rounded-xl hover:bg-green-600/80 transition-all duration-300 flex items-center space-x-2 border border-green-400/20"
                    >
                      <FaCheck />
                      <span>Guardar</span>
                    </button>
                    <button
                      onClick={handleCancelarEdicion}
                      className="bg-gray-500/80 backdrop-blur-sm text-white px-4 py-2 rounded-xl hover:bg-gray-600/80 transition-all duration-300 flex items-center space-x-2 border border-gray-400/20"
                    >
                      <FaTimes />
                      <span>Cancelar</span>
                    </button>
                  </>
                )}
                <div className="p-3 bg-white/20 rounded-xl">
                  <FaUserGraduate className="w-8 h-8" />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="overflow-x-auto">
              <nav className="flex space-x-8 px-6 min-w-max">
                {[
                  { id: 'info', label: 'Información Personal', icon: FaUser },
                  { id: 'academico', label: 'Información Académica', icon: FaGraduationCap },
                  { id: 'materias', label: 'Materias y Progreso', icon: FaBook },
                  { id: 'calificaciones', label: 'Calificaciones', icon: FaAward },
                  { id: 'documentos', label: 'Documentos', icon: FaFileDownload },
                  { id: 'pagos', label: 'Pagos', icon: FaMoneyBillWave }
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Información Personal */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FaUser className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Información Personal</h2>
              </div>
              
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Información del estudiante */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                        Datos del Estudiante
                      </h3>
                      
                      <div className="space-y-4">
                        {!isEditing ? (
                          <>
                            <div className="flex items-center space-x-3">
                              <FaUser className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-500">Nombre Completo</p>
                                <p className="text-gray-900">{estudiante?.nombre} {estudiante?.apellido}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <FaIdCard className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-500">Cédula</p>
                                <p className="text-gray-900">{estudiante?.cedula ? `V - ${formatearCedula(estudiante.cedula)}` : 'No registrada'}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <FaCalendarAlt className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-500">Fecha de Nacimiento</p>
                                <p className="text-gray-900">
                                  {estudiante?.fechaNacimiento ? formatearFecha(estudiante.fechaNacimiento) : 'No disponible'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <FaPhone className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-500">Teléfono</p>
                                <p className="text-gray-900">{estudiante?.telefono || 'No disponible'}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <FaEnvelope className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-500">Email</p>
                                <p className="text-gray-900">{estudiante?.email || 'No disponible'}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <FaMapMarkerAlt className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-500">Dirección</p>
                                <p className="text-gray-900">{estudiante?.direccion || 'No disponible'}</p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                                <input
                                  type="text"
                                  value={editData.nombre}
                                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
                                <input
                                  type="text"
                                  value={editData.apellido}
                                  onChange={(e) => handleInputChange('apellido', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Cédula</label>
                              <input
                                type="text"
                                value={editData.cedula}
                                onChange={(e) => handleInputChange('cedula', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Nacimiento</label>
                              <input
                                type="date"
                                value={editData.fechaNacimiento ? formatearFechaParaInput(editData.fechaNacimiento) : ''}
                                onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Género</label>
                              <select
                                value={editData.genero}
                                onChange={(e) => handleInputChange('genero', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">Seleccionar género</option>
                                <option value="M">Masculino</option>
                                <option value="F">Femenino</option>
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                              <input
                                type="tel"
                                value={editData.telefono}
                                onChange={(e) => handleInputChange('telefono', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                              <input
                                type="email"
                                value={editData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                              <textarea
                                value={editData.direccion}
                                onChange={(e) => handleInputChange('direccion', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
                              <textarea
                                value={editData.observaciones}
                                onChange={(e) => handleInputChange('observaciones', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Información del representante */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                        Datos del Representante
                      </h3>
                      
                      {representante ? (
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <FaUser className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-500">Nombre Completo</p>
                              <p className="text-gray-900">{representante.nombre} {representante.apellido}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <FaIdCard className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-500">Cédula</p>
                              <p className="text-gray-900">{representante.cedula ? `V - ${formatearCedula(representante.cedula)}` : 'No registrada'}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <FaPhone className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-500">Teléfono</p>
                              <p className="text-gray-900">{representante.telefono || 'No disponible'}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <FaEnvelope className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-500">Email</p>
                              <p className="text-gray-900">{representante.email || 'No disponible'}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FaUser className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600">No hay representante asignado</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Información Académica */}
          {activeTab === 'academico' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FaGraduationCap className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Información Académica</h2>
              </div>
              
              {/* Información básica académica */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <FaCalendarAlt className="text-blue-600" />
                      <h3 className="text-sm font-semibold text-blue-800">Año Escolar</h3>
                    </div>
                    <p className="text-lg font-medium text-gray-800">
                      {annoEscolar ? annoEscolar.periodo : 'No disponible'}
                    </p>
                  </div>
                  
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <FaGraduationCap className="text-blue-600" />
                      <h3 className="text-sm font-semibold text-blue-800">Grado</h3>
                    </div>
                    <p className="text-lg font-medium text-gray-800">
                      {grado ? formatearNombreGrado(grado.nombre_grado) : 'No asignado'}
                    </p>
                    {!grado && (
                      <p className="text-xs text-orange-600 mt-1">
                        El estudiante debe ser asignado a un grado
                      </p>
                    )}
                  </div>
                  
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <FaChalkboardTeacher className="text-blue-600" />
                      <h3 className="text-sm font-semibold text-blue-800">Sección</h3>
                    </div>
                    <p className="text-lg font-medium text-gray-800">
                      {seccion ? seccion.nombre_seccion : 'No asignada'}
                    </p>
                    {!seccion && (
                      <p className="text-xs text-orange-600 mt-1">
                        El estudiante debe ser asignado a una sección
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Resumen académico mejorado */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <FaChartLine className="mr-3 text-blue-600" />
                  Resumen Académico
                </h3>
                
                {!grado ? (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 text-center">
                    <FaGraduationCap className="w-12 h-12 text-orange-500 mx-auto mb-3" />
                    <h4 className="text-lg font-semibold text-orange-800 mb-2">Estudiante sin asignar</h4>
                    <p className="text-orange-700">
                      Este estudiante no está asignado a ningún grado. Para ver el resumen académico, 
                      debe ser asignado a un grado y sección primero.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                      <div className="flex items-center justify-between mb-4">
                        <FaBook className="w-8 h-8 text-blue-600" />
                        <span className="text-2xl font-bold text-blue-700">{materias.length}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-blue-800">Materias Cursadas</h4>
                      <p className="text-xs text-blue-600 mt-1">Materias activas</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                      <div className="flex items-center justify-between mb-4">
                        <FaFileInvoice className="w-8 h-8 text-green-600" />
                        <span className="text-2xl font-bold text-green-700">{evaluaciones.length}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-green-800">Evaluaciones</h4>
                      <p className="text-xs text-green-600 mt-1">Total programadas</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                      <div className="flex items-center justify-between mb-4">
                        <FaAward className="w-8 h-8 text-purple-600" />
                        <span className="text-2xl font-bold text-purple-700">
                          {calificaciones.length > 0 
                            ? (calificaciones.reduce((acc, cal) => acc + parseFloat(cal.calificacion || 0), 0) / calificaciones.length).toFixed(1)
                            : 'N/A'}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-purple-800">Promedio General</h4>
                      <p className="text-xs text-purple-600 mt-1">Todas las materias</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                      <div className="flex items-center justify-between mb-4">
                        <FaChartLine className="w-8 h-8 text-orange-600" />
                        <span className="text-2xl font-bold text-orange-700">
                          {calificaciones.length > 0 && evaluaciones.length > 0
                            ? Math.round((calificaciones.length / evaluaciones.length) * 100)
                            : 0}%
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-orange-800">Progreso</h4>
                      <p className="text-xs text-orange-600 mt-1">Evaluaciones completadas</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Materias y progreso */}
          {activeTab === 'materias' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <FaBook className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Materias y Progreso Académico</h2>
                </div>
                
                {/* Filtro de materias */}
                <div className="flex items-center space-x-3">
                  <select
                    value={filtroMateria}
                    onChange={(e) => setFiltroMateria(e.target.value)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Todas las materias</option>
                    {materias.map(materia => (
                      <option key={materia.id} value={materia.id}>
                        {materia.asignatura}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {materias.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {materias
                    .filter(materia => !filtroMateria || materia.id === parseInt(filtroMateria))
                    .map(materia => {
                      const progreso = calcularProgresoMateria(materia.id);
                      
                      return (
                        <div key={materia.id} className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="text-xl font-bold mb-2">{materia.asignatura}</h3>
                                <p className="text-blue-100 text-sm">{materia.descripcion || 'Sin descripción'}</p>
                              </div>
                              
                              <div className="text-right">
                                <div className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold border-2 ${getStatusColor(progreso.status)}`}>
                                  Promedio: {progreso.promedio}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-6">
                            {/* Estadísticas de la materia */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                <div className="flex items-center justify-between">
                                  <FaFileInvoice className="w-6 h-6 text-blue-600" />
                                  <span className="text-xl font-bold text-blue-700">
                                    {progreso.evaluacionesCompletadas}/{progreso.evaluacionesTotales}
                                  </span>
                                </div>
                                <p className="text-sm font-semibold text-blue-800 mt-2">Evaluaciones</p>
                              </div>
                              
                              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                                <div className="flex items-center justify-between">
                                  <FaChartLine className="w-6 h-6 text-green-600" />
                                  <span className="text-xl font-bold text-green-700">{progreso.porcentajeCompletado}%</span>
                                </div>
                                <p className="text-sm font-semibold text-green-800 mt-2">Progreso</p>
                              </div>
                              
                              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                                <div className="flex items-center justify-between">
                                  <FaAward className="w-6 h-6 text-purple-600" />
                                  <span className="text-xl font-bold text-purple-700">{progreso.promedio}</span>
                                </div>
                                <p className="text-sm font-semibold text-purple-800 mt-2">Promedio</p>
                              </div>
                            </div>
                            
                            {/* Barra de progreso moderna */}
                            <div className="mb-6">
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-semibold text-gray-700">Progreso del curso</span>
                                <span className="text-sm font-semibold text-gray-700">{progreso.porcentajeCompletado}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                                <div 
                                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full shadow-sm transition-all duration-500 ease-out" 
                                  style={{ width: `${progreso.porcentajeCompletado}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Calificaciones de la materia */}
                            {progreso.calificaciones.length > 0 ? (
                              <div>
                                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                  <FaFileInvoice className="mr-2 text-blue-600" />
                                  Calificaciones Recientes
                                </h4>
                                <div className="bg-gray-50 rounded-xl p-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {progreso.calificaciones.slice(0, 6).map(calificacion => {
                                      const evaluacion = calificacion.Evaluaciones;
                                      const nota = parseFloat(calificacion.calificacion);
                                      
                                      return (
                                        <div key={calificacion.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                          <div className="flex justify-between items-start mb-2">
                                            <h5 className="text-sm font-semibold text-gray-800 truncate">
                                              {evaluacion ? evaluacion.nombreEvaluacion : 'Evaluación'}
                                            </h5>
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                              nota >= 18 ? 'bg-green-100 text-green-800' :
                                              nota >= 14 ? 'bg-blue-100 text-blue-800' :
                                              nota >= 10 ? 'bg-yellow-100 text-yellow-800' :
                                              'bg-red-100 text-red-800'
                                            }`}>
                                              {calificacion.calificacion}
                                            </span>
                                          </div>
                                          <p className="text-xs text-gray-500 mb-1">
                                            {evaluacion ? evaluacion.tipoEvaluacion : 'Sin tipo'}
                                          </p>
                                          <p className="text-xs text-gray-400">
                                            {evaluacion ? formatearFecha(evaluacion.fechaEvaluacion) : 'Sin fecha'}
                                          </p>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-gray-50 rounded-xl p-6 text-center">
                                <FaFileInvoice className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600">No hay calificaciones registradas para esta materia</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
                  <FaBook className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay materias asignadas</h3>
                  <p className="text-gray-500">Este estudiante no tiene materias asignadas en el año escolar actual.</p>
                </div>
              )}
            </div>
          )}

          {/* Calificaciones */}
          {activeTab === 'calificaciones' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <FaAward className="w-6 h-6 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Calificaciones</h2>
                </div>
                
                {/* Filtros de calificaciones */}
                <div className="flex items-center space-x-3">
                  <select
                    value={filtroMateria}
                    onChange={(e) => setFiltroMateria(e.target.value)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Todas las materias</option>
                    {materias.map(materia => (
                      <option key={materia.id} value={materia.id}>
                        {materia.asignatura}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={filtroLapso}
                    onChange={(e) => setFiltroLapso(e.target.value)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Todos los lapsos</option>
                    <option value="1">Primer Lapso</option>
                    <option value="2">Segundo Lapso</option>
                    <option value="3">Tercer Lapso</option>
                  </select>
                  
                  <select
                    value={filtroTipoEvaluacion}
                    onChange={(e) => setFiltroTipoEvaluacion(e.target.value)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Todos los tipos</option>
                    <option value="examen">Examen</option>
                    <option value="quiz">Quiz</option>
                    <option value="tarea">Tarea</option>
                    <option value="proyecto">Proyecto</option>
                    <option value="participacion">Participación</option>
                  </select>
                </div>
              </div>

              {loadingCalificaciones ? (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando calificaciones...</p>
                </div>
              ) : (
                <>
                  {/* Resumen de calificaciones */}
                  {resumenCalificaciones && (
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-2xl p-6 border border-purple-200">
                      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <FaChartLine className="mr-3 text-purple-600" />
                        Resumen de Rendimiento
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-purple-200">
                          <div className="flex items-center justify-between">
                            <FaAward className="w-6 h-6 text-purple-600" />
                            <span className="text-xl font-bold text-purple-700">
                            {calificaciones.length > 0 
                            ? (calificaciones.reduce((acc, cal) => acc + parseFloat(cal.calificacion || 0), 0) / calificaciones.length).toFixed(1)
                            : 'N/A'}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-purple-800 mt-2">Promedio General</p>
                        </div>
                        
                        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-purple-200">
                          <div className="flex items-center justify-between">
                            <FaFileInvoice className="w-6 h-6 text-blue-600" />
                            <span className="text-xl font-bold text-blue-700">
                              {evaluaciones.length || 0}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-blue-800 mt-2">Evaluaciones</p>
                        </div>
                        
                        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-purple-200">
                          <div className="flex items-center justify-between">
                            <FaCheck className="w-6 h-6 text-green-600" />
                            <span className="text-xl font-bold text-green-700">
                              {calificaciones.filter(cal => parseFloat(cal.calificacion) >= 10).length || 0}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-green-800 mt-2">Aprobadas</p>
                        </div>
                        
                        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-purple-200">
                          <div className="flex items-center justify-between">
                            <FaTimes className="w-6 h-6 text-red-600" />
                            <span className="text-xl font-bold text-red-700">
                              {calificaciones.filter(cal => parseFloat(cal.calificacion) < 10).length || 0}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-red-800 mt-2">Reprobadas</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Lista de calificaciones */}
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
                      <h3 className="text-xl font-bold">Historial de Calificaciones</h3>
                      <p className="text-purple-100 mt-1">
                        {getCalificacionesFiltradas().length} calificaciones encontradas
                      </p>
                    </div>
                    
                    {getCalificacionesFiltradas().length > 0 ? (
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {getCalificacionesFiltradas().map(calificacion => {
                            const evaluacion = calificacion.Evaluaciones;
                            const materia = evaluacion && evaluacion.Materias ? evaluacion.Materias : null;
                            const nota = parseFloat(calificacion.calificacion);
                            const archivoEvaluacion = archivosEvaluaciones.find(archivo => 
                              archivo.evaluacionID === evaluacion?.id
                            );
                            
                            return (
                              <div key={calificacion.id} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all duration-300">
                                <div className="flex justify-between items-start mb-3">
                                  <div className="flex-1">
                                    <h4 className="text-sm font-bold text-gray-800 truncate">
                                      {evaluacion ? evaluacion.nombreEvaluacion : 'Evaluación'}
                                    </h4>
                                    <p className="text-xs text-gray-600 mt-1">
                                      {materia ? materia.asignatura : 'Materia no encontrada'}
                                    </p>
                                  </div>
                                  <span className={`px-3 py-1 text-sm font-bold rounded-full ${
                                    nota >= 18 ? 'bg-green-100 text-green-800' :
                                    nota >= 14 ? 'bg-blue-100 text-blue-800' :
                                    nota >= 10 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {calificacion.calificacion}
                                  </span>
                                </div>
                                
                                <div className="space-y-2">
                                  <div className="flex items-center text-xs text-gray-500">
                                    <FaCalendarAlt className="mr-2" />
                                    {evaluacion ? formatearFecha(evaluacion.fechaEvaluacion) : 'Sin fecha'}
                                  </div>
                                  
                                  {evaluacion && (
                                    <div className="flex items-center text-xs text-gray-500">
                                      <FaFileInvoice className="mr-2" />
                                      {evaluacion.tipoEvaluacion || 'Sin tipo'}
                                    </div>
                                  )}
                                  
                                  {evaluacion && evaluacion.lapso && (
                                    <div className="flex items-center text-xs text-gray-500">
                                      <FaBook className="mr-2" />
                                      Lapso {evaluacion.lapso}
                                    </div>
                                  )}
                                  
                                  {archivoEvaluacion && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                      <button
                                        onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/archivos-evaluaciones/descargar/${archivoEvaluacion.id}`, '_blank')}
                                        className="flex items-center text-xs text-blue-600 hover:text-blue-800 transition-colors"
                                      >
                                        <FaFileDownload className="mr-2" />
                                        Ver archivo de evaluación
                                      </button>
                                    </div>
                                  )}
                                  
                                  {evaluacion && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                      <button
                                        onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/evaluaciones/descargar/${evaluacion.id}`, '_blank')}
                                        className="flex items-center text-xs text-green-600 hover:text-green-800 transition-colors"
                                      >
                                        <FaEye className="mr-2" />
                                        Ver evaluación original
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="p-12 text-center">
                        <FaAward className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay calificaciones</h3>
                        <p className="text-gray-500">
                          {filtroMateria || filtroLapso || filtroTipoEvaluacion 
                            ? 'No se encontraron calificaciones con los filtros aplicados.'
                            : 'Este estudiante no tiene calificaciones registradas.'}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Documentos - placeholder */}
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

              {/* Contenedor único de documentos: requeridos + estado + acciones */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-6 text-white">
                  <h3 className="text-xl font-bold">Documentos del Estudiante</h3>
                  <p className="text-orange-100 mt-1">
                    {documentosRequeridos.filter(doc => doc.subido || documentos.some(d => d.tipoDocumento == doc.id || d.tipoDocumento === doc.nombre)).length}
                    {' '}de{' '} {documentosRequeridos.length} documentos requeridos completados
                  </p>
                </div>
                
                <div className="p-6">
                  {documentosRequeridos.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
                        <FaFileDownload className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Cargando documentos...</h3>
                      <p className="text-gray-500">Obteniendo información de documentos requeridos.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {documentosRequeridos.map(docRequerido => {
                        const documentoSubido = documentos.find(doc => (doc.tipoDocumento == docRequerido.id) || (doc.tipoDocumento === docRequerido.nombre));
                        const estaSubido = !!documentoSubido || !!docRequerido.subido;
                        return (
                          <div key={docRequerido.id} className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                            estaSubido 
                              ? 'bg-green-50 border-green-200 hover:shadow-md' 
                              : docRequerido.obligatorio 
                                ? 'bg-red-50 border-red-200 hover:shadow-md' 
                                : 'bg-gray-50 border-gray-200 hover:shadow-md'
                          }`}>
                            {/* Header */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <div className={`p-2 rounded-lg ${estaSubido ? 'bg-green-100' : 'bg-gray-100'}`}>
                                  <FaFileDownload className={`w-4 h-4 ${estaSubido ? 'text-green-600' : 'text-gray-400'}`} />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-800 text-sm">{docRequerido.nombre}</h4>
                                  <p className="text-xs text-gray-500">{docRequerido.obligatorio ? 'Obligatorio' : 'Opcional'}</p>
                                </div>
                              </div>
                              {estaSubido ? (
                                <FaCheck className="w-5 h-5 text-green-600" />
                              ) : (
                                <FaTimes className="w-5 h-5 text-red-600" />
                              )}
                            </div>

                            {/* Info si está subido */}
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
                                <p className="text-xs text-gray-500">Subido: {formatearFecha(documentoSubido.createdAt)}</p>
                              </div>
                            )}

                            {/* Acciones */}
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

                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Pagos */}
          {activeTab === 'pagos' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <FaMoneyBillWave className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Historial de Pagos</h2>
                </div>
                <button
                  onClick={handleOpenPagoModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors"
                >
                  <FaPlus />
                  <span>Registrar Pago</span>
                </button>
              </div>

              {/* Resumen de pagos */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <FaMoneyBillWave className="w-8 h-8 text-green-600" />
                    <span className="text-2xl font-bold text-green-700">
                      {pagos.length}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-green-800">Total Pagos</h4>
                  <p className="text-xs text-green-600 mt-1">Registros de pago</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <FaCheck className="w-8 h-8 text-blue-600" />
                    <span className="text-2xl font-bold text-blue-700">
                      {pagos.filter(pago => pago.estado === 'pagado').length}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-blue-800">Aprobados</h4>
                  <p className="text-xs text-blue-600 mt-1">Pagos confirmados</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <FaTimes className="w-8 h-8 text-yellow-600" />
                    <span className="text-2xl font-bold text-yellow-700">
                      {pagos.filter(pago => pago.estado === 'pendiente').length}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-yellow-800">Pendientes</h4>
                  <p className="text-xs text-yellow-600 mt-1">Por confirmar</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <FaMoneyBillWave className="w-8 h-8 text-purple-600" />
                    <span className="text-2xl font-bold text-purple-700">
                      ${pagos
                        .filter(pago => pago.estado === 'pagado')
                        .reduce((total, pago) => total + parseFloat(pago.monto || 0), 0)
                        .toFixed(2)}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-purple-800">Total Pagado</h4>
                  <p className="text-xs text-purple-600 mt-1">Solo pagos aprobados</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <FaTimes className="w-8 h-8 text-red-600" />
                    <span className="text-2xl font-bold text-red-700">
                      {pagos.filter(pago => pago.estado === 'anulado').length}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-red-800">Rechazados</h4>
                  <p className="text-xs text-red-600 mt-1">Pagos no válidos</p>
                </div>
              </div>

              {/* Lista de pagos */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
                  <h3 className="text-xl font-bold">Historial de Pagos</h3>
                  <p className="text-green-100 mt-1">
                    {pagos.length} pagos registrados
                  </p>
                </div>
                
                {pagos.length > 0 ? (
                  <div className="p-6">
                    <div className="space-y-4">
                      {pagos.map(pago => (
                        <div key={pago.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="text-lg font-semibold text-gray-800">
                                  {pago.aranceles?.nombre || 'Pago sin especificar'}
                                </h4>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  pago.estado === 'pagado' 
                                    ? 'bg-green-100 text-green-800' 
                                    : pago.estado === 'pendiente'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                }`}>
                                  {pago.estado === 'pagado' ? 'Aprobado' : 
                                   pago.estado === 'pendiente' ? 'Pendiente' : 'Rechazado'}
                                </span>
                              </div>
                              <p className="text-gray-600 mb-2">
                                {pago.aranceles?.descripcion || 'Sin descripción'}
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-500">Monto</p>
                                  <p className="font-semibold text-gray-800">${parseFloat(pago.monto || 0).toFixed(2)}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Método de Pago</p>
                                  <p className="font-semibold text-gray-800">
                                    {pago.metodoPagos?.nombre || 'No especificado'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Fecha de Pago</p>
                                  <p className="font-semibold text-gray-800">
                                    {pago.fechaPago ? formatearFecha(pago.fechaPago) : 'No especificada'}
                                  </p>
                                </div>
                              </div>
                              {pago.numeroReferencia && (
                                <div className="mt-3">
                                  <p className="text-gray-500 text-sm">Número de Referencia</p>
                                  <p className="font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded inline-block">
                                    {pago.numeroReferencia}
                                  </p>
                                </div>
                              )}
                              {pago.observaciones && (
                                <div className="mt-3">
                                  <p className="text-gray-500 text-sm">Observaciones</p>
                                  <p className="text-gray-700">{pago.observaciones}</p>
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-green-600">
                                ${parseFloat(pago.monto || 0).toFixed(2)}
                              </p>
                              <p className="text-sm text-gray-500">
                                {pago.annoEscolar?.periodo || 'Sin período'}
                              </p>
                            </div>
                          </div>
                          
                          {pago.comprobantePago && (
                            <div className="border-t border-gray-200 pt-4">
                              <button
                                onClick={() => window.open(pago.comprobantePago, '_blank')}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center"
                              >
                                <FaFileDownload className="mr-2" />
                                Ver Comprobante
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <FaMoneyBillWave className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay pagos registrados</h3>
                    <p className="text-gray-500">Este estudiante no tiene pagos registrados en el sistema.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Botón flotante para volver */}
        <div className="fixed bottom-6 right-6">
          <Link
            to="/admin/estudiantes"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-colors duration-200"
            title="Volver a la lista de estudiantes"
          >
            <FaArrowLeft className="h-6 w-6" />
          </Link>
        </div>

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

        {/* Modal para registrar pagos */}
        {showPagoModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Registrar Pago</h3>
                <button
                  onClick={handleClosePagoModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmitPago} className="space-y-4">
                {/* Información del estudiante */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-blue-800 mb-2">Información del Estudiante</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-600">Estudiante:</span>
                      <span className="ml-2 font-medium">{estudiante?.nombre} {estudiante?.apellido}</span>
                    </div>
                    <div>
                      <span className="text-blue-600">Cédula:</span>
                      <span className="ml-2 font-medium">{estudiante?.cedula ? `V - ${formatearCedula(estudiante.cedula)}` : 'No registrada'}</span>
                    </div>
                    <div>
                      <span className="text-blue-600">Grado:</span>
                      <span className="ml-2 font-medium">{grado ? formatearNombreGrado(grado.nombre_grado) : 'Sin grado'}</span>
                    </div>
                    <div>
                      <span className="text-blue-600">Representante:</span>
                      <span className="ml-2 font-medium">{representante ? `${representante.nombre} ${representante.apellido}` : 'Sin representante'}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Arancel */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Arancel *
                    </label>
                    <select
                      value={formPago.arancelID}
                      onChange={(e) => setFormPago({...formPago, arancelID: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Seleccionar arancel</option>
                      {aranceles.map(arancel => (
                        <option key={arancel.id} value={arancel.id}>
                          {arancel.nombre} - ${arancel.monto}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Método de Pago */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Método de Pago *
                    </label>
                    <select
                      value={formPago.metodoPagoID}
                      onChange={(e) => setFormPago({...formPago, metodoPagoID: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Seleccionar método</option>
                      {metodosPago.map(metodo => (
                        <option key={metodo.id} value={metodo.id}>
                          {metodo.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Monto */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monto *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formPago.monto}
                      onChange={(e) => setFormPago({...formPago, monto: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Monto Mora */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monto Mora
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formPago.montoMora}
                      onChange={(e) => setFormPago({...formPago, montoMora: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Descuento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descuento
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formPago.descuento}
                      onChange={(e) => setFormPago({...formPago, descuento: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Fecha de Pago */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Pago *
                    </label>
                    <input
                      type="date"
                      value={formPago.fechaPago}
                      onChange={(e) => setFormPago({...formPago, fechaPago: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Mes de Pago */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mes de Pago
                    </label>
                    <select
                      value={formPago.mesPago}
                      onChange={(e) => setFormPago({...formPago, mesPago: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleccionar mes</option>
                      <option value="enero">Enero</option>
                      <option value="febrero">Febrero</option>
                      <option value="marzo">Marzo</option>
                      <option value="abril">Abril</option>
                      <option value="mayo">Mayo</option>
                      <option value="junio">Junio</option>
                      <option value="julio">Julio</option>
                      <option value="agosto">Agosto</option>
                      <option value="septiembre">Septiembre</option>
                      <option value="octubre">Octubre</option>
                      <option value="noviembre">Noviembre</option>
                      <option value="diciembre">Diciembre</option>
                    </select>
                  </div>
                </div>

                {/* Referencia */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Referencia
                  </label>
                  <input
                    type="text"
                    value={formPago.referencia}
                    onChange={(e) => setFormPago({...formPago, referencia: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Número de referencia del pago"
                  />
                </div>

                {/* Comprobante */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comprobante de Pago
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={(e) => setArchivoSeleccionado(e.target.files[0])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Formatos permitidos: PDF, JPG, PNG
                  </p>
                </div>

                {/* Observaciones */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones
                  </label>
                  <textarea
                    value={formPago.observaciones}
                    onChange={(e) => setFormPago({...formPago, observaciones: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Observaciones adicionales..."
                  />
                </div>

                {/* Resumen del pago */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Resumen del Pago</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>Monto Base: ${parseFloat(formPago.monto || 0).toFixed(2)}</div>
                    <div>Monto Mora: ${parseFloat(formPago.montoMora || 0).toFixed(2)}</div>
                    <div>Descuento: ${parseFloat(formPago.descuento || 0).toFixed(2)}</div>
                    <div className="font-bold text-lg">Total: ${montoTotal}</div>
                  </div>
                </div>

                {/* Mensajes de error y éxito */}
                {errorPago && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center text-red-700">
                      <FaTimes className="mr-2" />
                      {errorPago}
                    </div>
                  </div>
                )}

                {successPago && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center text-green-700">
                      <FaCheck className="mr-2" />
                      {successPago}
                    </div>
                  </div>
                )}

                {/* Botones */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClosePagoModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loadingPago}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {loadingPago ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Registrando...
                      </>
                    ) : (
                      <>
                        <FaMoneyBillWave className="mr-2" />
                        Registrar Pago
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Mensajes de éxito y error */}
        {success && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            <div className="flex items-center">
              <FaCheck className="mr-2" />
              {success}
            </div>
          </div>
        )}

        {error && (
          <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            <div className="flex items-center">
              <FaTimes className="mr-2" />
              {error}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EstudianteDetail;