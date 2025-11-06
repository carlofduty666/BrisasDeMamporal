import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { tipoDocumentoFormateado, formatearNombreGrado, formatearFecha, formatearFechaParaInput, formatearCedula } from '../../utils/formatters';
import { 
  FaUserGraduate, 
  FaUsers, 
  FaIdCard, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaBriefcase,
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowRight,
  FaArrowLeft,
  FaFileUpload,
  FaCloudUploadAlt,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaInfoCircle
} from 'react-icons/fa';


const NuevoEstudiante = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Función para determinar el tema según el origen
  const getThemeColors = () => {
    const referrer = document.referrer;
    const searchParams = new URLSearchParams(location.search);
    const from = searchParams.get('from');
    
    // Verificar si viene de estudiantes
    if (from === 'estudiantes' || referrer.includes('/admin/estudiantes') || location.state?.from === 'estudiantes') {
      return {
        main: 'bg-gradient-to-br from-blue-800 to-blue-900',
        active: 'bg-blue-700/90 backdrop-blur-md',
        hover: 'hover:bg-blue-700/60 hover:backdrop-blur-md',
        text: 'text-blue-600',
        accent: 'blue',
        gradient: 'from-blue-700 to-blue-800',
        ring: 'focus:ring-blue-500',
        border: 'focus:border-blue-500',
        bgLight: 'bg-blue-50',
        borderColor: 'border-blue-400',
        textDark: 'text-blue-700',
        bgButton: 'bg-blue-600',
        hoverButton: 'hover:bg-blue-700'
      };
    }
    
    // Verificar si viene de representantes
    if (from === 'representantes' || referrer.includes('/admin/representantes') || location.state?.from === 'representantes' || searchParams.get('repId')) {
      return {
        main: 'bg-gradient-to-br from-violet-800 to-violet-900',
        active: 'bg-violet-700/90 backdrop-blur-md',
        hover: 'hover:bg-violet-700/60 hover:backdrop-blur-md',
        text: 'text-violet-600',
        accent: 'violet',
        gradient: 'from-violet-700 to-violet-800',
        ring: 'focus:ring-violet-500',
        border: 'focus:border-violet-500',
        bgLight: 'bg-violet-50',
        borderColor: 'border-violet-400',
        textDark: 'text-violet-700',
        bgButton: 'bg-violet-600',
        hoverButton: 'hover:bg-violet-700'
      };
    }
    
    // Tema por defecto (dashboard u otros)
    return {
      main: 'bg-gradient-to-br from-slate-800 to-slate-900',
      active: 'bg-slate-700/90 backdrop-blur-md',
      hover: 'hover:bg-slate-700/60 hover:backdrop-blur-md',
      text: 'text-slate-600',
      accent: 'slate',
      gradient: 'from-slate-700 to-slate-800',
      ring: 'focus:ring-slate-500',
      border: 'focus:border-slate-500',
      bgLight: 'bg-slate-50',
      borderColor: 'border-slate-400',
      textDark: 'text-slate-700',
      bgButton: 'bg-slate-600',
      hoverButton: 'hover:bg-slate-700'
    };
  };

  const theme = getThemeColors();
  
  // Estados para documentos
  const [documentosEstudiante, setDocumentosEstudiante] = useState([]);
  const [documentosRepresentante, setDocumentosRepresentante] = useState([]);
  const [loadingDocumentos, setLoadingDocumentos] = useState(false);
  const [errorDocumentos, setErrorDocumentos] = useState('');

  // Estado para buscar representante
  const [buscandoRepresentante, setBuscandoRepresentante] = useState(false);
  const [representanteEncontrado, setRepresentanteEncontrado] = useState(false);

  // Estados para el proceso de subida secuencial
  const [inscripcionCompletada, setInscripcionCompletada] = useState(false);
  const [estudianteCreado, setEstudianteCreado] = useState(null);
  const [inscripcionId, setInscripcionId] = useState(null);
  const [documentoActual, setDocumentoActual] = useState(0);
  const [documentosSubidos, setDocumentosSubidos] = useState([]);
  const [subiendoDocumento, setSubiendoDocumento] = useState(false);
  const [todosDocumentos, setTodosDocumentos] = useState([]);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);

  const tipoDocumentoFormateado = {
    'cedula': 'Cédula de Identidad',
    'partidaNacimiento': 'Partida de Nacimiento',
    'boletin': 'Boletín de Calificaciones',
    'notasCertificadas': 'Notas Certificadas',
    'fotoCarnet': 'Foto Carnet',
    'fotoCarta': 'Foto Tamaño Carta',
    'boletaRetiroPlantel': 'Boleta de Retiro del Plantel',
    'constanciaTrabajo': 'Constancia de Trabajo',
    'solvenciaPago': 'Solvencia de Pago',
    'foniatrico': 'Informe Foniátrico',
    'psicomental': 'Evaluación Psicomental',
    'certificadoSalud': 'Certificado de Salud',
    'curriculumVitae': 'Curriculum Vitae',
    'constanciaEstudio6toSemestre': 'Constancia de Estudio 6to Semestre',
    'titulo': 'Título Académico'
  };

  const token = localStorage.getItem('token');
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  
  // Estado para el formulario
  const [formData, setFormData] = useState({
    estudiante: {
      cedula: '',
      nombre: '',
      apellido: '',
      fechaNacimiento: '',
      lugarNacimiento: '',
      genero: '',
      direccion: '',
      observaciones: ''
    },
    representante: {
      cedula: '',
      nombre: '',
      apellido: '',
      telefono: '',
      email: '',
      direccion: '',
      profesion: '',
      id: ''
    },
    gradoID: '',
    annoEscolarID: ''
  });
  
  // Estados para datos adicionales
  const [grados, setGrados] = useState([]);
  const [annoEscolar, setAnnoEscolar] = useState(null);
  const [cuposDisponibles, setCuposDisponibles] = useState({});
  const [nivelSeleccionado, setNivelSeleccionado] = useState('');
  
  // Referencia para el formulario
  const formRef = useRef(null);
  const fileInputRef = useRef(null);

  const getQueryParams = () => {
    const searchParams = new URLSearchParams(location.search);
    return {
      repId: searchParams.get('repId'),
      repCedula: searchParams.get('repCedula'),
      repNombre: searchParams.get('repNombre'),
      repApellido: searchParams.get('repApellido')
    };
  };
  
  // Cargar datos iniciales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        // Obtener parámetros de la URL
        const { repId, repCedula, repNombre, repApellido } = getQueryParams();
        
        // Si hay parámetros del representante en la URL, usarlos
        if (repId && repCedula) {
          setFormData(prev => ({
            ...prev,
            representante: {
              ...prev.representante,
              id: repId,
              cedula: repCedula,
              nombre: repNombre || '',
              apellido: repApellido || ''
            }
          }));
          
          // Buscar datos completos del representante
          try {
            const token = localStorage.getItem('token');
            const repResponse = await axios.get(
              `http://localhost:5000/personas/${repId}`,
              { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
            if (repResponse.data && repResponse.data.tipo === 'representante') {
              setFormData(prev => ({
                ...prev,
                representante: {
                  ...prev.representante,
                  id: repResponse.data.id,
                  cedula: repResponse.data.cedula,
                  nombre: repResponse.data.nombre,
                  apellido: repResponse.data.apellido,
                  telefono: repResponse.data.telefono || '',
                  email: repResponse.data.email || '',
                  direccion: repResponse.data.direccion || '',
                  profesion: repResponse.data.profesion || ''
                }
              }));
              setRepresentanteEncontrado(true);
            }
          } catch (error) {
            console.warn("No se pudo cargar información completa del representante", error);
          }
        };
        
        // Obtener año escolar activo
        const annoResponse = await axios.get('http://localhost:5000/anno-escolar/actual');
        setAnnoEscolar(annoResponse.data);
        
        // Obtener grados y cupos disponibles
        const cuposResponse = await axios.get('http://localhost:5000/inscripciones/cupos-disponibles');
        setCuposDisponibles(cuposResponse.data.cuposDisponibles);
        
        // Obtener lista de grados
        const gradosResponse = await axios.get('http://localhost:5000/grados');
        setGrados(gradosResponse.data);
        
        // Si hay un usuario autenticado, cargar sus datos como representante
        if (token) {
          try {
            const userData = JSON.parse(atob(token.split('.')[1]));
            const userResponse = await axios.get(
              `http://localhost:5000/personas/${userData.personaID}`,
              {
                headers: { 'Authorization': `Bearer ${token}` }
              }
            );
            
            if (userResponse.data && userResponse.data.tipo === 'representante') {
              setFormData(prev => ({
                ...prev,
                representante: {
                  ...prev.representante,
                  id: userResponse.data.id,
                  cedula: userResponse.data.cedula,
                  nombre: userResponse.data.nombre,
                  apellido: userResponse.data.apellido,
                  telefono: userResponse.data.telefono || '',
                  email: userResponse.data.email || '',
                  direccion: userResponse.data.direccion || '',
                  profesion: userResponse.data.profesion || ''
                }
              }));
              setRepresentanteEncontrado(true);
            }
          } catch (error) {
            console.warn("No se pudo cargar información del usuario autenticado", error);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar datos iniciales:', err);
        setError('Error al cargar datos iniciales. Por favor, recargue la página.');
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [token], [location.search]);
  
  // Cargar documentos requeridos cuando se cambia al paso 2
  useEffect(() => {
    if (step === 2) {
      const cargarTodosDocumentos = async () => {
        try {
          setLoadingDocumentos(true);
          setErrorDocumentos('');
          
          // Cargar documentos para estudiante
          const responseEstudiante = await axios.get('http://localhost:5000/documentos/verificar/0/estudiante');
          setDocumentosEstudiante(responseEstudiante.data.documentosRequeridos);
          
          // Verificar si el representante ya tiene documentos completos
          if (representanteEncontrado && formData.representante.id) {
            const representanteDocStatus = await verificarDocumentosRepresentante(formData.representante.id);
            
            if (representanteDocStatus.completo) {
              // Si el representante ya tiene todos los documentos obligatorios, no solicitar más
              setDocumentosRepresentante([]);
              console.log('El representante ya tiene todos los documentos obligatorios');
            } else {
              // Mostrar solo los documentos que faltan
              const docsRepresentante = await axios.get('http://localhost:5000/documentos/verificar/0/representante');
              // Filtrar para mostrar solo los que no están subidos
              const docsFaltantes = docsRepresentante.data.documentosRequeridos.filter(
                doc => doc.obligatorio && !representanteDocStatus.documentos.find(
                  rdoc => rdoc.id === doc.id && rdoc.subido
                )
              );
              setDocumentosRepresentante(docsFaltantes);
            }
          } else {
            // Si es un nuevo representante, cargar todos los documentos requeridos
            const responseRepresentante = await axios.get('http://localhost:5000/documentos/verificar/0/representante');
            setDocumentosRepresentante(responseRepresentante.data.documentosRequeridos);
          }
          
          setLoadingDocumentos(false);
        } catch (err) {
          console.error('Error al cargar documentos requeridos:', err);
          setErrorDocumentos('No se pudieron cargar los documentos requeridos. Por favor, intente nuevamente.');
          setLoadingDocumentos(false);
        }
      };
      
      cargarTodosDocumentos();
    }
  }, [step, representanteEncontrado, formData.representante.id]);


  // Preparar lista completa de documentos cuando se completa la inscripción
  useEffect(() => {
    if (inscripcionCompletada && estudianteCreado) {
      const prepararDocumentosParaSubir = async () => {
        try {
          // Combinar documentos de estudiante
          const docsEstudiante = documentosEstudiante.map(doc => ({
            ...doc,
            tipo: 'estudiante',
            personaID: estudianteCreado.id
          }));
          
          let docsRepresentante = [];
          
          // Verificar si el representante necesita subir documentos
          if (documentosRepresentante.length > 0) {
            // Si hay documentos en la lista, significa que necesitan ser subidos
            docsRepresentante = documentosRepresentante.map(doc => ({
              ...doc,
              tipo: 'representante',
              personaID: formData.representante.id
            }));
          } else if (representanteEncontrado && formData.representante.id) {
            // Verificar si el representante ya tiene todos los documentos obligatorios
            const representanteDocStatus = await verificarDocumentosRepresentante(formData.representante.id);
            
            if (!representanteDocStatus.completo) {
              // Si faltan documentos obligatorios, incluirlos
              const docsFaltantes = representanteDocStatus.documentos
                .filter(doc => doc.obligatorio && !doc.subido)
                .map(doc => ({
                  ...doc,
                  tipo: 'representante',
                  personaID: formData.representante.id
                }));
              
              docsRepresentante = docsFaltantes;
            }
          }
          
          const todosLosDocumentos = [...docsEstudiante, ...docsRepresentante];
          console.log("Documentos a subir:", todosLosDocumentos);
          setTodosDocumentos(todosLosDocumentos);
          
          if (todosLosDocumentos.length > 0) {
            setDocumentoActual(0);
            setStep(4); // Avanzar al paso de subida de documentos
          } else {
            // Si no hay documentos, ir directamente al comprobante
            navigate(`/inscripcion/comprobante/${inscripcionId}`);
          }
        } catch (error) {
          console.error("Error al preparar documentos:", error);
          setError("Error al preparar los documentos para subir");
        }
      };
      
      prepararDocumentosParaSubir();
    }
  }, [inscripcionCompletada, estudianteCreado, inscripcionId]);


  useEffect(() => {
    const cargarGrados = async () => {
      try {
        // Obtener grados
        let url = 'http://localhost:5000/grados';
        if (nivelSeleccionado) {
          url = `http://localhost:5000/grados/nivel/${nivelSeleccionado}`;
        }
        
        const response = await axios.get(url);
        setGrados(response.data);
        
        // Calcular cupos disponibles con valores predeterminados
        const cuposObj = {};
        for (const grado of response.data) {
          cuposObj[grado.id] = 30; // Valor por defecto
        }
        
        // Intentar obtener cupos reales
        try {
          const cuposResponse = await axios.get('http://localhost:5000/cupos/resumen');
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

  // Función para cargar documentos requeridos
  const cargarDocumentosRequeridos = async () => {
    try {
      setLoadingDocumentos(true);
      setErrorDocumentos('');
      
      // Cargar documentos para estudiante
      const responseEstudiante = await axios.get('http://localhost:5000/documentos/verificar/0/estudiante');
      setDocumentosEstudiante(responseEstudiante.data.documentosRequeridos);
      
      // Cargar documentos para representante
      const responseRepresentante = await axios.get('http://localhost:5000/documentos/verificar/0/representante');
      setDocumentosRepresentante(responseRepresentante.data.documentosRequeridos);
      
      setLoadingDocumentos(false);
    } catch (err) {
      console.error('Error al cargar documentos requeridos:', err);
      setErrorDocumentos('No se pudieron cargar los documentos requeridos. Por favor, intente nuevamente.');
      setLoadingDocumentos(false);
    }
  };

  const verificarDocumentosRepresentante = async (representanteID) => {
    try {
      const response = await axios.get(`http://localhost:5000/documentos/verificar/${representanteID}/representante`);
      
      // Si todos los documentos obligatorios están subidos, retorna true
      const todosObligatoriosSubidos = response.data.documentosRequeridos
        .filter(doc => doc.obligatorio)
        .every(doc => doc.subido);
      
      return {
        completo: todosObligatoriosSubidos,
        documentos: response.data.documentosRequeridos
      };
    } catch (err) {
      console.error('Error al verificar documentos del representante:', err);
      return { completo: false, documentos: [] };
    }
  };
  
  // Función para buscar representante por cédula
  const buscarRepresentante = async () => {
    if (!formData.representante.cedula) {
      setError('Ingrese la cédula del representante para buscar');
      return;
    }
    
    try {
      setBuscandoRepresentante(true);
      setError('');
      
      const response = await axios.get(`http://localhost:5000/personas/cedula/${formData.representante.cedula}`);
      
      if (response.data && response.data.tipo === 'representante') {
        setFormData(prev => ({
          ...prev,
          representante: {
            ...prev.representante,
            id: response.data.id,
            nombre: response.data.nombre,
            apellido: response.data.apellido,
            telefono: response.data.telefono || '',
            email: response.data.email || '',
            direccion: response.data.direccion || '',
            profesion: response.data.profesion || ''
          }
        }));
        setRepresentanteEncontrado(true);
      } else {
        setError('No se encontró un representante con esa cédula');
        setRepresentanteEncontrado(false);
      }
    } catch (err) {
      console.error('Error al buscar representante:', err);
      setError('No se encontró un representante con esa cédula');
      setRepresentanteEncontrado(false);
    } finally {
      setBuscandoRepresentante(false);
    }
  };

  // Añade esta función junto a las demás funciones de tu componente
  const saltarDocumentoActual = () => {
    // Simplemente avanzar al siguiente documento sin hacer solicitudes HTTP
    if (documentoActual < todosDocumentos.length - 1) {
      setDocumentoActual(documentoActual + 1);
      setArchivoSeleccionado(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else {
      // Si es el último documento, finalizar sin hacer solicitudes HTTP
      navigate(`/inscripcion/comprobante/${inscripcionId}`);
    }
  };

  // Finalizar proceso de subida de documentos
  const finalizarSubidaDocumentos = async () => {
    try {
      setLoading(true);
      
      // Actualizar el estado de documentosCompletos en la inscripción si hay documentos subidos
      if (documentosSubidos.length > 0) {
        await axios.put(
          `http://localhost:5000/inscripciones/${inscripcionId}/update-estado`,
          { documentosCompletos: true },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      // Redirigir al comprobante
      navigate(`/inscripcion/comprobante/${inscripcionId}`);
      
    } catch (err) {
      console.error('Error al finalizar proceso:', err);
      setError(err.response?.data?.message || 'Error al finalizar el proceso. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  
  // Manejar cambios en el formulario
  const handleChange = (e, section) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [name]: value
      }
    });
  };
  
  // Manejar cambios en campos que no están en secciones
  const handleSimpleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Manejar cambio de paso
  const handleNextStep = () => {
    // Validaciones antes de avanzar
    if (step === 1) {
      // Validar datos del estudiante
      if (!formData.estudiante.cedula || !formData.estudiante.nombre || !formData.estudiante.apellido || 
          !formData.estudiante.fechaNacimiento || !formData.estudiante.direccion) {
        setError('Complete todos los campos obligatorios del estudiante');
        return;
      }
      
      // Validar datos del representante
      if (!representanteEncontrado) {
        if (!formData.representante.cedula || !formData.representante.nombre || !formData.representante.apellido || 
            !formData.representante.telefono || !formData.representante.email || !formData.representante.direccion) {
          setError('Complete todos los campos obligatorios del representante');
          return;
        }
      }
      
      // Validar selección de grado
      if (!formData.gradoID) {
        setError('Seleccione un grado');
        return;
      }
    }
    
    setError('');
    setStep(step + 1);
  };
  
  const handlePrevStep = () => {
    setStep(step - 1);
  };
  
  // Manejar envío del formulario para crear estudiante
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step < 3) {
      handleNextStep();
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Crear un nuevo FormData solo con los datos básicos
      const formDataToSend = new FormData();
      
      // Añadir datos del estudiante
      Object.entries(formData.estudiante).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formDataToSend.append(key, value);
        }
      });
      
      // Añadir datos del representante con prefijo rep_
      Object.entries(formData.representante).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formDataToSend.append(`rep_${key}`, value);
        }
      });
      
      // Añadir grado y año escolar
      formDataToSend.append('gradoID', formData.gradoID);
      formDataToSend.append('annoEscolarID', annoEscolar.id);
      formDataToSend.append('documentosCompletos', 'false');
      
      console.log('Creando estudiante e inscripción...');
      
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
      
      console.log('Respuesta del servidor:', response.data);
      
      // Guardar información del estudiante creado
      setEstudianteCreado(response.data.estudiante);
      setInscripcionId(response.data.inscripcionId);
      setInscripcionCompletada(true);
      setSuccess('Estudiante inscrito correctamente. Ahora puede subir los documentos.');
      
    } catch (err) {
      console.error('Error al enviar formulario:', err);
      setError(err.response?.data?.message || 'Error al procesar la inscripción. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };
  
  // Manejar selección de archivo para el documento actual
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setArchivoSeleccionado(e.target.files[0]);
    } else {
      setArchivoSeleccionado(null);
    }
  };
  
  // Modificar la función subirDocumentoActual
  const subirDocumentoActual = async () => {
    if (!archivoSeleccionado) {
      setError('Por favor, seleccione un archivo para subir');
      return;
    }
    
    const documentoActualObj = todosDocumentos[documentoActual];
    
    try {
      setSubiendoDocumento(true);
      setError('');
      
      const formData = new FormData();
      formData.append('documento', archivoSeleccionado);
      formData.append('personaID', documentoActualObj.personaID);
      formData.append('tipoDocumento', documentoActualObj.id);
      formData.append('descripcion', `Documento ${documentoActualObj.nombre} subido durante inscripción`);
      
      // Verificar si ya existe un documento de este tipo para esta persona
      try {
        const checkResponse = await axios.get(
          `http://localhost:5000/documentos/persona/${documentoActualObj.personaID}`
        );
        
        const documentoExistente = checkResponse.data.find(
          doc => doc.tipoDocumento === documentoActualObj.id
        );
        
        let response;
        
        if (documentoExistente) {
          // Si existe, actualizar en lugar de crear
          console.log(`Actualizando documento existente ID: ${documentoExistente.id}`);
          response = await axios.put(
            `http://localhost:5000/documentos/${documentoExistente.id}`,
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
          response = await axios.post(
            'http://localhost:5000/documentos/upload',
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
              }
            }
          );
        }

        // Actualizar el estado para marcar el documento como subido
        const documentosActualizados = todosDocumentos.map((doc, index) => {
          if (index === documentoActual) {
            return { ...doc, subido: true };
          }
          return doc;
        });
        setTodosDocumentos(documentosActualizados);

        // Añadir a la lista de documentos subidos
        setDocumentosSubidos(prev => [
          ...prev, 
          {
            ...documentoActualObj,
            documentoID: response.data.documento.id,
            nombreArchivo: archivoSeleccionado.name,
            subido: true
          }
        ]);
        
        console.log('Respuesta del servidor:', response.data);
        
        // Limpiar selección de archivo
        setArchivoSeleccionado(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Avanzar al siguiente documento o finalizar
        if (documentoActual < todosDocumentos.length - 1) {
          setDocumentoActual(documentoActual + 1);
        } else {
          // Actualizar el estado de documentosCompletos en la inscripción
          await axios.put(
            `http://localhost:5000/inscripciones/${inscripcionId}/update-estado`,
            { documentosCompletos: true },
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );
          
          // Redirigir al comprobante
          navigate(`/inscripcion/comprobante/${inscripcionId}`);
        }
      } catch (checkError) {
        console.error("Error al verificar o actualizar documentos:", checkError);
        setError("Error al procesar el documento. Por favor, intente nuevamente.");
      }
    } catch (err) {
      console.error('Error al subir documento:', err);
      setError(err.response?.data?.message || 'Error al subir el documento. Por favor, intente nuevamente.');
    } finally {
      setSubiendoDocumento(false);
    }
  };
  
  // Renderizado condicional según el paso actual
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Hero Section */}
        <div className={`relative overflow-hidden ${theme.main} shadow-2xl rounded-2xl mb-8`}>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className={`absolute inset-0 bg-gradient-to-r from-${theme.accent}-600/30 to-transparent`}></div>
          
          {/* Decorative elements */}
          <div className={`absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-${theme.accent}-400/20 rounded-full blur-xl`}></div>
          <div className={`absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-${theme.accent}-300/10 rounded-full blur-2xl`}></div>
          
          <div className="relative px-6 py-10">
            <div className="flex items-center space-x-4 mb-4">
              <div className={`p-3 bg-${theme.accent}-500/20 rounded-xl backdrop-blur-sm border border-${theme.accent}-400/30`}>
                <FaUserGraduate className={`w-8 h-8 text-${theme.accent}-200`} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  Inscripción de Nuevo Estudiante
                </h1>
                <p className={`text-${theme.accent}-200 text-sm`}>
                  Complete todos los campos requeridos para inscribir al estudiante
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
          {/* Indicador de pasos modernizado */}
          <div className={`px-6 py-6 bg-gradient-to-r ${theme.gradient} bg-opacity-5`}>
            <div className="flex items-center justify-between">
              <div className="w-full flex items-center">
                {/* Paso 1 */}
                <div className="flex flex-col items-center">
                  <div className={`flex items-center justify-center h-10 w-10 rounded-full transition-all duration-300 ${
                    step >= 1 ? `${theme.bgButton} shadow-lg transform scale-110` : 'bg-gray-300'
                  }`}>
                    {step > 1 ? (
                      <FaCheck className="text-white text-sm" />
                    ) : (
                      <span className="text-white text-sm font-semibold">1</span>
                    )}
                  </div>
                  <span className={`mt-2 text-xs font-medium ${step >= 1 ? theme.text : 'text-gray-500'}`}>
                    Datos
                  </span>
                </div>
                
                {/* Línea de conexión 1-2 */}
                <div className={`h-1 flex-1 mx-3 rounded-full transition-all duration-500 ${
                  step >= 2 ? theme.bgButton : 'bg-gray-300'
                }`}></div>
                
                {/* Paso 2 */}
                <div className="flex flex-col items-center">
                  <div className={`flex items-center justify-center h-10 w-10 rounded-full transition-all duration-300 ${
                    step >= 2 ? `${theme.bgButton} shadow-lg transform scale-110` : 'bg-gray-300'
                  }`}>
                    {step > 2 ? (
                      <FaCheck className="text-white text-sm" />
                    ) : (
                      <span className="text-white text-sm font-semibold">2</span>
                    )}
                  </div>
                  <span className={`mt-2 text-xs font-medium ${step >= 2 ? theme.text : 'text-gray-500'}`}>
                    Documentos
                  </span>
                </div>
                
                {/* Línea de conexión 2-3 */}
                <div className={`h-1 flex-1 mx-3 rounded-full transition-all duration-500 ${
                  step >= 3 ? theme.bgButton : 'bg-gray-300'
                }`}></div>
                
                {/* Paso 3 */}
                <div className="flex flex-col items-center">
                  <div className={`flex items-center justify-center h-10 w-10 rounded-full transition-all duration-300 ${
                    step >= 3 ? `${theme.bgButton} shadow-lg transform scale-110` : 'bg-gray-300'
                  }`}>
                    {step > 3 ? (
                      <FaCheck className="text-white text-sm" />
                    ) : (
                      <span className="text-white text-sm font-semibold">3</span>
                    )}
                  </div>
                  <span className={`mt-2 text-xs font-medium ${step >= 3 ? theme.text : 'text-gray-500'}`}>
                    Confirmación
                  </span>
                </div>
                
                {step >= 4 && (
                  <>
                    {/* Línea de conexión 3-4 */}
                    <div className={`h-1 flex-1 mx-3 rounded-full ${theme.bgButton}`}></div>
                    
                    {/* Paso 4 */}
                    <div className="flex flex-col items-center">
                      <div className={`flex items-center justify-center h-10 w-10 rounded-full ${theme.bgButton} shadow-lg transform scale-110`}>
                        <span className="text-white text-sm font-semibold">4</span>
                      </div>
                      <span className={`mt-2 text-xs font-medium ${theme.text}`}>
                        Archivos
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Mensajes de error o éxito modernizados */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 m-6 rounded-r-lg shadow-sm animate-fade-in">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaTimesCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
                <button
                  onClick={() => setError('')}
                  className="ml-3 flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
                >
                  <FaTimes className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 m-6 rounded-r-lg shadow-sm animate-fade-in">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaCheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-green-800">{success}</p>
                </div>
                <button
                  onClick={() => setSuccess('')}
                  className="ml-3 flex-shrink-0 text-green-400 hover:text-green-600 transition-colors"
                >
                  <FaTimes className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Mensaje informativo cuando se accede desde el detalle del representante */}
          {representanteEncontrado && getQueryParams().repId && (
            <div className={`${theme.bgLight} border-l-4 ${theme.borderColor} p-4 m-6 rounded-r-lg shadow-sm animate-fade-in`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaInfoCircle className={`h-5 w-5 ${theme.text}`} />
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${theme.textDark}`}>
                    Está registrando un nuevo estudiante para el representante <span className="font-semibold">{formData.representante.nombre} {formData.representante.apellido}</span>.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Barra de progreso de subida modernizada */}
          {isUploading && (
            <div className="mt-4 mx-6 mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-700 flex items-center">
                  <FaCloudUploadAlt className={`mr-2 ${theme.text}`} />
                  Subiendo archivos...
                </p>
                <span className={`text-sm font-bold ${theme.text}`}>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                <div 
                  className={`${theme.bgButton} h-3 rounded-full transition-all duration-300 ease-out relative overflow-hidden`}
                  style={{ width: `${uploadProgress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>
          )}
          
          {/* Formulario */}
          <form ref={formRef} onSubmit={handleSubmit} className="px-6 py-6 sm:p-8" encType="multipart/form-data">
            {/* Paso 1: Datos Personales */}
            {step === 1 && (
              <div className="space-y-8 animate-fade-in">
                <div>
                  <div className="flex items-center mb-6">
                    <div className={`p-2 ${theme.bgButton} rounded-lg mr-3`}>
                      <FaUserGraduate className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Datos del Estudiante</h3>
                  </div>
                  <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="cedula" className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaIdCard className="inline mr-2 text-gray-400" />
                        Cédula/Documento *
                      </label>
                      <input
                        type="text"
                        name="cedula"
                        id="cedula"
                        value={formData.estudiante.cedula}
                        onChange={(e) => handleChange(e, 'estudiante')}
                        placeholder="V-12345678"
                        className={`shadow-sm ${theme.ring} ${theme.border} block w-full sm:text-sm border-gray-300 rounded-lg transition-all duration-200 hover:border-gray-400 px-4 py-2.5`}
                        required
                      />
                    </div>
                    
                    <div className="sm:col-span-3">
                      <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-2">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        name="nombre"
                        id="nombre"
                        value={formData.estudiante.nombre}
                        onChange={(e) => handleChange(e, 'estudiante')}
                        placeholder="Nombre del estudiante"
                        className={`shadow-sm ${theme.ring} ${theme.border} block w-full sm:text-sm border-gray-300 rounded-lg transition-all duration-200 hover:border-gray-400 px-4 py-2.5`}
                        required
                      />
                    </div>
                    
                    <div className="sm:col-span-3">
                      <label htmlFor="apellido" className="block text-sm font-semibold text-gray-700 mb-2">
                        Apellido *
                      </label>
                      <input
                        type="text"
                        name="apellido"
                        id="apellido"
                        value={formData.estudiante.apellido}
                        onChange={(e) => handleChange(e, 'estudiante')}
                        placeholder="Apellido del estudiante"
                        className={`shadow-sm ${theme.ring} ${theme.border} block w-full sm:text-sm border-gray-300 rounded-lg transition-all duration-200 hover:border-gray-400 px-4 py-2.5`}
                        required
                      />
                    </div>
                    
                    <div className="sm:col-span-3">
                      <label htmlFor="fechaNacimiento" className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaCalendarAlt className="inline mr-2 text-gray-400" />
                        Fecha de Nacimiento *
                      </label>
                      <input
                        type="date"
                        name="fechaNacimiento"
                        id="fechaNacimiento"
                        value={formatearFechaParaInput(formData.estudiante.fechaNacimiento)}
                        onChange={(e) => handleChange(e, 'estudiante')}
                        className={`shadow-sm ${theme.ring} ${theme.border} block w-full sm:text-sm border-gray-300 rounded-lg transition-all duration-200 hover:border-gray-400 px-4 py-2.5`}
                        required
                      />
                    </div>
                    
                    <div className="sm:col-span-3">
                      <label htmlFor="lugarNacimiento" className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaMapMarkerAlt className="inline mr-2 text-gray-400" />
                        Lugar de Nacimiento
                      </label>
                      <input
                        type="text"
                        name="lugarNacimiento"
                        id="lugarNacimiento"
                        value={formData.estudiante.lugarNacimiento}
                        onChange={(e) => handleChange(e, 'estudiante')}
                        placeholder="Ciudad, Estado"
                        className={`shadow-sm ${theme.ring} ${theme.border} block w-full sm:text-sm border-gray-300 rounded-lg transition-all duration-200 hover:border-gray-400 px-4 py-2.5`}
                      />
                    </div>
                    
                    <div className="sm:col-span-3">
                      <label htmlFor="genero" className="block text-sm font-semibold text-gray-700 mb-2">
                        Género
                      </label>
                      <select
                        id="genero"
                        name="genero"
                        value={formData.estudiante.genero}
                        onChange={(e) => handleChange(e, 'estudiante')}
                        className={`shadow-sm ${theme.ring} ${theme.border} block w-full sm:text-sm border-gray-300 rounded-lg transition-all duration-200 hover:border-gray-400 px-4 py-2.5`}
                      >
                        <option value="">Seleccione género</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                      </select>
                    </div>
                    
                    <div className="sm:col-span-6">
                      <label htmlFor="direccion" className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaMapMarkerAlt className="inline mr-2 text-gray-400" />
                        Dirección *
                      </label>
                      <input
                        type="text"
                        name="direccion"
                        id="direccion"
                        value={formData.estudiante.direccion}
                        onChange={(e) => handleChange(e, 'estudiante')}
                        placeholder="Dirección completa de residencia"
                        className={`shadow-sm ${theme.ring} ${theme.border} block w-full sm:text-sm border-gray-300 rounded-lg transition-all duration-200 hover:border-gray-400 px-4 py-2.5`}
                        required
                      />
                    </div>
                    
                    <div className="sm:col-span-6">
                      <label htmlFor="observaciones" className="block text-sm font-semibold text-gray-700 mb-2">
                        Observaciones
                      </label>
                      <textarea
                        id="observaciones"
                        name="observaciones"
                        rows="3"
                        value={formData.estudiante.observaciones}
                        onChange={(e) => handleChange(e, 'estudiante')}
                        placeholder="Información adicional relevante..."
                        className={`shadow-sm ${theme.ring} ${theme.border} block w-full sm:text-sm border-gray-300 rounded-lg transition-all duration-200 hover:border-gray-400 px-4 py-2.5`}
                      ></textarea>
                    </div>
                  </div>
                </div>
                
                <div className="pt-8 border-t-2 border-gray-200">
                  <div className="flex items-center mb-6">
                    <div className={`p-2 ${theme.bgButton} rounded-lg mr-3`}>
                      <FaUsers className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Datos del Representante</h3>
                  </div>
                  {/* Sección para buscar representante por cédula */}
                  <div className="mt-6 flex flex-col sm:flex-row items-end space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="flex-grow w-full">
                      <label htmlFor="rep_cedula" className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaIdCard className="inline mr-2 text-gray-400" />
                        Cédula del Representante *
                      </label>
                      <input
                        type="text"
                        name="cedula"
                        id="rep_cedula"
                        value={formData.representante.cedula}
                        onChange={(e) => handleChange(e, 'representante')}
                        placeholder="V-12345678"
                        className={`shadow-sm ${theme.ring} ${theme.border} block w-full sm:text-sm border-gray-300 rounded-lg transition-all duration-200 hover:border-gray-400 px-4 py-2.5 ${representanteEncontrado ? 'bg-gray-100' : ''}`}
                        required
                        disabled={representanteEncontrado}
                      />
                    </div>
                    
                    {!representanteEncontrado && (
                      <button
                        type="button"
                        onClick={buscarRepresentante}
                        disabled={buscandoRepresentante || !formData.representante.cedula}
                        className={`inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-semibold rounded-lg shadow-md text-white ${theme.bgButton} ${theme.hoverButton} focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme.ring} disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105`}
                      >
                        {buscandoRepresentante ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Buscando...
                          </>
                        ) : (
                          <>
                            <FaSearch className="mr-2" />
                            Buscar
                          </>
                        )}
                      </button>
                    )}
                    
                    {/* Botón para cambiar representante - ocultar si viene de RepresentanteDetail */}
                    {representanteEncontrado && !getQueryParams().repId && (
                      <button
                        type="button"
                        onClick={() => {
                          setRepresentanteEncontrado(false);
                          setFormData(prev => ({
                            ...prev,
                            representante: {
                              ...prev.representante,
                              id: '',
                              cedula: '',
                              nombre: '',
                              apellido: '',
                              telefono: '',
                              email: '',
                              direccion: '',
                              profesion: ''
                            }
                          }));
                        }}
                        className="inline-flex items-center px-6 py-2.5 border-2 border-gray-300 text-sm font-semibold rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                      >
                        <FaTimes className="mr-2" />
                        Cambiar
                      </button>
                    )}
                  </div>
                  
                  {representanteEncontrado ? (
                    <div className="mt-6 bg-green-50 border-2 border-green-200 p-6 rounded-xl shadow-sm animate-fade-in">
                      <div className="flex items-center mb-4">
                        <FaCheckCircle className="h-6 w-6 text-green-500 mr-3" />
                        <span className="text-base font-bold text-green-800">
                          {getQueryParams().repId ? 'Representante seleccionado' : 'Representante encontrado'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-y-5 gap-x-6 sm:grid-cols-2">
                        <div className="bg-white p-3 rounded-lg">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre completo</label>
                          <div className="mt-1 text-sm font-medium text-gray-900">{formData.representante.nombre} {formData.representante.apellido}</div>
                        </div>
                        
                        <div className="bg-white p-3 rounded-lg">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Cédula</label>
                          <div className="mt-1 text-sm font-medium text-gray-900">{formatearCedula(formData.representante.cedula)}</div>
                        </div>
                        
                        <div className="bg-white p-3 rounded-lg">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Teléfono</label>
                          <div className="mt-1 text-sm font-medium text-gray-900">{formData.representante.telefono}</div>
                        </div>
                        
                        <div className="bg-white p-3 rounded-lg">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
                          <div className="mt-1 text-sm font-medium text-gray-900">{formData.representante.email}</div>
                        </div>
                        
                        <div className="sm:col-span-2">
                          <label htmlFor="rep_direccion" className="block text-sm font-semibold text-gray-700 mb-2">
                            <FaMapMarkerAlt className="inline mr-2 text-gray-400" />
                            Dirección *
                          </label>
                          <input
                            type="text"
                            name="direccion"
                            id="rep_direccion"
                            value={formData.representante.direccion}
                            onChange={(e) => handleChange(e, 'representante')}
                            placeholder="Dirección completa"
                            className={`shadow-sm ${theme.ring} ${theme.border} block w-full sm:text-sm border-gray-300 rounded-lg transition-all duration-200 hover:border-gray-400 px-4 py-2.5`}
                            required
                          />
                        </div>
                        
                        <div className="sm:col-span-2">
                          <label htmlFor="rep_profesion" className="block text-sm font-semibold text-gray-700 mb-2">
                            <FaBriefcase className="inline mr-2 text-gray-400" />
                            Profesión
                          </label>
                          <input
                            type="text"
                            name="profesion"
                            id="rep_profesion"
                            value={formData.representante.profesion}
                            onChange={(e) => handleChange(e, 'representante')}
                            placeholder="Profesión u ocupación"
                            className={`shadow-sm ${theme.ring} ${theme.border} block w-full sm:text-sm border-gray-300 rounded-lg transition-all duration-200 hover:border-gray-400 px-4 py-2.5`}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-6 animate-fade-in">
                      <div className="sm:col-span-3">
                        <label htmlFor="rep_nombre" className="block text-sm font-semibold text-gray-700 mb-2">
                          Nombre *
                        </label>
                        <input
                          type="text"
                          name="nombre"
                          id="rep_nombre"
                          value={formData.representante.nombre}
                          onChange={(e) => handleChange(e, 'representante')}
                          placeholder="Nombre del representante"
                          className={`shadow-sm ${theme.ring} ${theme.border} block w-full sm:text-sm border-gray-300 rounded-lg transition-all duration-200 hover:border-gray-400 px-4 py-2.5`}
                          required
                        />
                      </div>
                      
                      <div className="sm:col-span-3">
                        <label htmlFor="rep_apellido" className="block text-sm font-semibold text-gray-700 mb-2">
                          Apellido *
                        </label>
                        <input
                          type="text"
                          name="apellido"
                          id="rep_apellido"
                          value={formData.representante.apellido}
                          onChange={(e) => handleChange(e, 'representante')}
                          placeholder="Apellido del representante"
                          className={`shadow-sm ${theme.ring} ${theme.border} block w-full sm:text-sm border-gray-300 rounded-lg transition-all duration-200 hover:border-gray-400 px-4 py-2.5`}
                          required
                        />
                      </div>
                      
                      <div className="sm:col-span-3">
                        <label htmlFor="rep_telefono" className="block text-sm font-semibold text-gray-700 mb-2">
                          <FaPhone className="inline mr-2 text-gray-400" />
                          Teléfono *
                        </label>
                        <input
                          type="tel"
                          name="telefono"
                          id="rep_telefono"
                          value={formData.representante.telefono}
                          onChange={(e) => handleChange(e, 'representante')}
                          placeholder="0412-1234567"
                          className={`shadow-sm ${theme.ring} ${theme.border} block w-full sm:text-sm border-gray-300 rounded-lg transition-all duration-200 hover:border-gray-400 px-4 py-2.5`}
                          required
                        />
                      </div>
                      
                      <div className="sm:col-span-3">
                        <label htmlFor="rep_email" className="block text-sm font-semibold text-gray-700 mb-2">
                          <FaEnvelope className="inline mr-2 text-gray-400" />
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="rep_email"
                          value={formData.representante.email}
                          onChange={(e) => handleChange(e, 'representante')}
                          placeholder="correo@ejemplo.com"
                          className={`shadow-sm ${theme.ring} ${theme.border} block w-full sm:text-sm border-gray-300 rounded-lg transition-all duration-200 hover:border-gray-400 px-4 py-2.5`}
                          required
                        />
                      </div>
                      
                      <div className="sm:col-span-3">
                        <label htmlFor="rep_profesion" className="block text-sm font-semibold text-gray-700 mb-2">
                          <FaBriefcase className="inline mr-2 text-gray-400" />
                          Profesión
                        </label>
                        <input
                          type="text"
                          name="profesion"
                          id="rep_profesion"
                          value={formData.representante.profesion}
                          onChange={(e) => handleChange(e, 'representante')}
                          placeholder="Profesión u ocupación"
                          className={`shadow-sm ${theme.ring} ${theme.border} block w-full sm:text-sm border-gray-300 rounded-lg transition-all duration-200 hover:border-gray-400 px-4 py-2.5`}
                        />
                      </div>
                      
                      <div className="sm:col-span-6">
                        <label htmlFor="rep_direccion" className="block text-sm font-semibold text-gray-700 mb-2">
                          <FaMapMarkerAlt className="inline mr-2 text-gray-400" />
                          Dirección *
                        </label>
                        <input
                          type="text"
                          name="direccion"
                          id="rep_direccion"
                          value={formData.representante.direccion}
                          onChange={(e) => handleChange(e, 'representante')}
                          placeholder="Dirección completa de residencia"
                          className={`shadow-sm ${theme.ring} ${theme.border} block w-full sm:text-sm border-gray-300 rounded-lg transition-all duration-200 hover:border-gray-400 px-4 py-2.5`}
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Información Académica Modernizada */}
                <div className="pt-8 border-t-2 border-gray-200">
                  <div className="flex items-center mb-6">
                    <div className={`p-2 ${theme.bgButton} rounded-lg mr-3`}>
                      <FaUserGraduate className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Información Académica</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
                    <div className="sm:col-span-2">
                      <label htmlFor="nivel" className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaUserGraduate className="inline mr-2 text-gray-400" />
                        Nivel Educativo *
                      </label>
                      <select
                        id="nivel"
                        name="nivel"
                        value={nivelSeleccionado}
                        onChange={(e) => setNivelSeleccionado(e.target.value)}
                        className={`shadow-sm ${theme.ring} ${theme.border} block w-full sm:text-sm border-gray-300 rounded-lg transition-all duration-200 hover:border-gray-400 px-4 py-2.5`}
                      >
                        <option value="">Seleccione un nivel</option>
                        <option value="Primaria">📚 Primaria</option>
                        <option value="Secundaria">🎓 Secundaria</option>
                      </select>
                    </div>
                    
                    <div className="sm:col-span-2">
                      <label htmlFor="gradoID" className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaUserGraduate className="inline mr-2 text-gray-400" />
                        Grado *
                      </label>
                      <select
                        id="gradoID"
                        name="gradoID"
                        value={formData.gradoID}
                        onChange={handleSimpleChange}
                        className={`shadow-sm ${theme.ring} ${theme.border} block w-full sm:text-sm border-gray-300 rounded-lg transition-all duration-200 hover:border-gray-400 px-4 py-2.5`}
                        required
                      >
                        <option value="">Seleccione un grado</option>
                        {grados.map(grado => {
                          const cupos = cuposDisponibles[grado.id] || 0;
                          const sinCupos = cupos <= 0;
                          return (
                            <option 
                              key={grado.id} 
                              value={grado.id}
                              disabled={sinCupos}
                            >
                              {grado.nombre_grado} {sinCupos ? '🔴 Sin cupos' : `✅ ${cupos} cupos disponibles`}
                            </option>
                          );
                        })}
                      </select>
                      {formData.gradoID && cuposDisponibles[formData.gradoID] && (
                        <p className="mt-2 text-sm text-green-600 flex items-center">
                          <FaCheckCircle className="mr-1" />
                          {cuposDisponibles[formData.gradoID]} cupos disponibles
                        </p>
                      )}
                    </div>
                    
                    <div className="sm:col-span-2">
                      <label htmlFor="annoEscolar" className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaCalendarAlt className="inline mr-2 text-gray-400" />
                        Año Escolar
                      </label>
                      <input
                        type="text"
                        id="annoEscolar"
                        value={annoEscolar ? `📅 ${annoEscolar.periodo}` : 'Cargando...'}
                        className="bg-gray-100 shadow-sm block w-full sm:text-sm border-gray-300 rounded-lg px-4 py-2.5 font-medium text-gray-700"
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Paso 2: Documentos Modernizado */}
            {step === 2 && (
              <div className="space-y-8">
                {loadingDocumentos ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="relative">
                      <div className={`animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-${theme.accent}-600`}></div>
                      <div className="absolute inset-0 rounded-full bg-gray-500/10 animate-pulse"></div>
                    </div>
                    <p className={`mt-4 ${theme.text} font-medium`}>Cargando documentos requeridos...</p>
                  </div>
                ) : (
                  <>
                    {/* Documentos del Estudiante */}
                    <div>
                      <div className="flex items-center mb-6">
                        <div className={`p-2 ${theme.bgButton} rounded-lg mr-3`}>
                          <FaFileAlt className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Documentos del Estudiante</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Revise los documentos requeridos. Los marcados con <span className="text-red-600 font-semibold">*</span> son obligatorios.
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {documentosEstudiante.map((doc) => (
                          <div 
                            key={doc.id} 
                            className={`border-2 rounded-xl p-5 transition-all duration-200 hover:shadow-lg ${
                              doc.obligatorio 
                                ? 'border-red-200 bg-red-50/50 hover:border-red-300' 
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-start">
                              <div className="flex-shrink-0">
                                {doc.obligatorio ? (
                                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-red-100 border-2 border-red-200">
                                    <FaExclamationTriangle className="text-red-600 text-lg" />
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 border-2 border-blue-200">
                                    <FaFileAlt className="text-blue-600 text-lg" />
                                  </div>
                                )}
                              </div>
                              <div className="ml-4 flex-1">
                                <h4 className="text-sm font-bold text-gray-900">{doc.nombre}</h4>
                                <p className={`text-xs font-semibold mt-1 ${doc.obligatorio ? 'text-red-600' : 'text-gray-500'}`}>
                                  {doc.obligatorio ? '⚠️ Obligatorio' : '📎 Opcional'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Documentos del Representante */}
                    <div className="pt-8 border-t-2 border-gray-200">
                      <div className="flex items-center mb-6">
                        <div className={`p-2 ${theme.bgButton} rounded-lg mr-3`}>
                          <FaFileAlt className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Documentos del Representante</h3>
                        </div>
                      </div>
                      
                      {documentosRepresentante.length === 0 && representanteEncontrado ? (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-6 rounded-xl shadow-sm animate-fade-in">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 border-2 border-green-200">
                                <FaCheckCircle className="h-7 w-7 text-green-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <h4 className="text-base font-bold text-green-800">¡Documentos completos!</h4>
                              <p className="text-sm text-green-700 mt-1">
                                El representante ya tiene todos los documentos obligatorios subidos.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-gray-500 mb-6">
                            Revise los documentos requeridos para el representante. Los marcados con <span className="text-red-600 font-semibold">*</span> son obligatorios.
                          </p>
                          
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {documentosRepresentante.map((doc) => (
                              <div 
                                key={doc.id} 
                                className={`border-2 rounded-xl p-5 transition-all duration-200 hover:shadow-lg ${
                                  doc.obligatorio 
                                    ? 'border-red-200 bg-red-50/50 hover:border-red-300' 
                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                              >
                                <div className="flex items-start">
                                  <div className="flex-shrink-0">
                                    {doc.obligatorio ? (
                                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-red-100 border-2 border-red-200">
                                        <FaExclamationTriangle className="text-red-600 text-lg" />
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 border-2 border-blue-200">
                                        <FaFileAlt className="text-blue-600 text-lg" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-4 flex-1">
                                    <h4 className="text-sm font-bold text-gray-900">{doc.nombre}</h4>
                                    <p className={`text-xs font-semibold mt-1 ${doc.obligatorio ? 'text-red-600' : 'text-gray-500'}`}>
                                      {doc.obligatorio ? '⚠️ Obligatorio' : '📎 Opcional'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                  
                    {errorDocumentos && (
                      <div className="bg-red-50 border-l-4 border-red-400 p-4">
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
                  </>
                )}
              </div>
            )}
            
            {/* Paso 3: Confirmación Modernizado */}
            {step === 3 && (
              <div className="space-y-8">
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${theme.bgButton} mb-4`}>
                    <FaCheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Confirmar Inscripción</h3>
                  <p className="text-sm text-gray-500 mt-2">
                    Revise cuidadosamente la información antes de completar la inscripción
                  </p>
                </div>
                
                {/* Datos del Estudiante */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200 p-6 rounded-xl shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-blue-600 rounded-lg mr-3">
                      <FaUserGraduate className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">Datos del Estudiante</h4>
                  </div>
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="bg-white p-3 rounded-lg">
                      <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cédula/Documento</dt>
                      <dd className="mt-1 text-sm font-bold text-gray-900">{formatearCedula(formData.estudiante.cedula)}</dd>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre Completo</dt>
                      <dd className="mt-1 text-sm font-bold text-gray-900">{formData.estudiante.nombre} {formData.estudiante.apellido}</dd>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha de Nacimiento</dt>
                      <dd className="mt-1 text-sm font-bold text-gray-900">{formatearFecha(formData.estudiante.fechaNacimiento)}</dd>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Género</dt>
                      <dd className="mt-1 text-sm font-bold text-gray-900">{formData.estudiante.genero === 'M' ? '👨 Masculino' : '👩 Femenino'}</dd>
                    </div>
                    <div className="bg-white p-3 rounded-lg sm:col-span-2">
                      <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Dirección</dt>
                      <dd className="mt-1 text-sm font-bold text-gray-900">{formData.estudiante.direccion}</dd>
                    </div>
                  </dl>
                </div>
                
                {/* Datos del Representante */}
                <div className="bg-gradient-to-br from-violet-50 to-violet-100/50 border-2 border-violet-200 p-6 rounded-xl shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-violet-600 rounded-lg mr-3">
                      <FaUsers className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">Datos del Representante</h4>
                  </div>
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="bg-white p-3 rounded-lg">
                      <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cédula/Documento</dt>
                      <dd className="mt-1 text-sm font-bold text-gray-900">{formatearCedula(formData.representante.cedula)}</dd>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre Completo</dt>
                      <dd className="mt-1 text-sm font-bold text-gray-900">{formData.representante.nombre} {formData.representante.apellido}</dd>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Teléfono</dt>
                      <dd className="mt-1 text-sm font-bold text-gray-900">📞 {formData.representante.telefono}</dd>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</dt>
                      <dd className="mt-1 text-sm font-bold text-gray-900">📧 {formData.representante.email}</dd>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Profesión</dt>
                      <dd className="mt-1 text-sm font-bold text-gray-900">💼 {formData.representante.profesion || 'No especificada'}</dd>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Dirección</dt>
                      <dd className="mt-1 text-sm font-bold text-gray-900">📍 {formData.representante.direccion}</dd>
                    </div>
                  </dl>
                </div>
                
                {/* Información Académica */}
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-2 border-emerald-200 p-6 rounded-xl shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-emerald-600 rounded-lg mr-3">
                      <FaUserGraduate className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">Información Académica</h4>
                  </div>
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="bg-white p-3 rounded-lg">
                      <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Grado</dt>
                      <dd className="mt-1 text-sm font-bold text-gray-900">
                        🎓 {grados.find(g => g.id == formData.gradoID)?.nombre_grado || 'No seleccionado'}
                      </dd>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Año Escolar</dt>
                      <dd className="mt-1 text-sm font-bold text-gray-900">📅 {annoEscolar?.periodo || 'No disponible'}</dd>
                    </div>
                  </dl>
                </div>
                
                {/* Información importante */}
                <div className={`bg-gradient-to-r from-${theme.accent}-50 to-${theme.accent}-100/50 border-2 border-${theme.accent}-200 p-6 rounded-xl shadow-sm`}>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className={`flex items-center justify-center h-10 w-10 rounded-full bg-${theme.accent}-100 border-2 border-${theme.accent}-200`}>
                        <FaInfoCircle className={`h-6 w-6 text-${theme.accent}-600`} />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h5 className={`text-sm font-bold text-${theme.accent}-900`}>Información Importante</h5>
                      <p className={`text-sm text-${theme.accent}-700 mt-1`}>
                        Al completar la inscripción, acepta los términos y condiciones de la institución.
                        Después de registrar al estudiante, podrá subir los documentos requeridos.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Paso 4: Subida secuencial de documentos Modernizado */}
            {step === 4 && (
              <div className="space-y-8">
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${theme.bgButton} mb-4`}>
                    <FaCloudUploadAlt className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Subida de Documentos</h3>
                  <p className="text-sm text-gray-500 mt-2">
                    Suba los documentos uno por uno. Los marcados con <span className="text-red-600 font-semibold">*</span> son obligatorios.
                  </p>
                </div>
                
                {/* Progreso de subida modernizado */}
                <div className={`bg-gradient-to-r from-${theme.accent}-50 to-${theme.accent}-100/50 border-2 border-${theme.accent}-200 p-6 rounded-xl shadow-sm`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <FaCloudUploadAlt className={`w-6 h-6 text-${theme.accent}-600 mr-3`} />
                      <h4 className="text-base font-bold text-gray-900">
                        Progreso: {documentosSubidos.length} de {todosDocumentos.length} documentos
                      </h4>
                    </div>
                    <span className={`text-lg font-bold text-${theme.accent}-700`}>
                      {Math.round((documentosSubidos.length / todosDocumentos.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div 
                      className={`bg-gradient-to-r ${theme.gradient} h-4 rounded-full transition-all duration-500 ease-out animate-pulse`}
                      style={{ width: `${(documentosSubidos.length / todosDocumentos.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Documento actual modernizado */}
                {documentoActual < todosDocumentos.length && (
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${
                          todosDocumentos[documentoActual].obligatorio 
                            ? 'bg-red-100 border-2 border-red-200' 
                            : 'bg-blue-100 border-2 border-blue-200'
                        }`}>
                          <FaFileUpload className={`h-6 w-6 ${
                            todosDocumentos[documentoActual].obligatorio ? 'text-red-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <div className="ml-4">
                          <h4 className="text-lg font-bold text-gray-900">
                            {todosDocumentos[documentoActual].nombre}
                            {todosDocumentos[documentoActual].obligatorio && (
                              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                                ⚠️ Obligatorio
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1 flex items-center">
                            {todosDocumentos[documentoActual].tipo === 'estudiante' ? (
                              <>
                                <FaUserGraduate className="mr-1" />
                                Documento del estudiante
                              </>
                            ) : (
                              <>
                                <FaUsers className="mr-1" />
                                Documento del representante
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs ${theme.bgButton} text-white px-3 py-1.5 rounded-full font-bold`}>
                        {documentoActual + 1} de {todosDocumentos.length}
                      </span>
                    </div>
                    
                    <div className="mt-6">
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        <FaFileUpload className="inline mr-2" />
                        Seleccione el archivo (PDF, JPG, PNG)
                      </label>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className={`block w-full text-sm text-gray-500 border-2 border-dashed border-gray-300 rounded-xl p-4
                          file:mr-4 file:py-2.5 file:px-6
                          file:rounded-lg file:border-0
                          file:text-sm file:font-bold
                          file:${theme.bgButton} file:text-white
                          hover:file:opacity-90 file:transition-all file:duration-200
                          hover:border-${theme.accent}-400 transition-all duration-200`}
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </div>
                    
                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={subirDocumentoActual}
                        disabled={subiendoDocumento || !archivoSeleccionado}
                        className={`flex-1 inline-flex items-center justify-center py-3 px-6 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white ${theme.bgButton} ${theme.hoverButton} focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme.ring} disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105`}
                      >
                        {subiendoDocumento ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Subiendo...
                          </>
                        ) : (
                          <>
                            <FaCloudUploadAlt className="mr-2" />
                            Subir Documento
                          </>
                        )}
                      </button>
                      
                      <button
                        type="button"
                        onClick={saltarDocumentoActual}
                        disabled={subiendoDocumento || todosDocumentos[documentoActual].obligatorio}
                        className="flex-1 inline-flex items-center justify-center py-3 px-6 border-2 border-gray-300 rounded-xl shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        {todosDocumentos[documentoActual].obligatorio ? (
                          <>
                            <FaExclamationTriangle className="mr-2" />
                            Documento obligatorio
                          </>
                        ) : (
                          <>
                            <FaArrowRight className="mr-2" />
                            Omitir
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Documentos subidos modernizados */}
                {documentosSubidos.length > 0 && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 p-6 rounded-xl shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-green-600 rounded-lg mr-3">
                        <FaCheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900">Documentos Subidos ({documentosSubidos.length})</h4>
                    </div>
                    <ul className="space-y-3">
                      {documentosSubidos.map((doc, index) => (
                        <li key={index} className="bg-white p-4 rounded-lg shadow-sm border border-green-200 flex items-center transition-all duration-200 hover:shadow-md">
                          <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-green-100 border-2 border-green-200">
                            <FaCheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="ml-4 flex-1">
                            <p className="text-sm font-bold text-gray-900">{doc.nombre}</p>
                            <p className="text-xs text-gray-500 mt-1 flex items-center">
                              {doc.tipo === 'estudiante' ? (
                                <>
                                  <FaUserGraduate className="mr-1" />
                                  Estudiante
                                </>
                              ) : (
                                <>
                                  <FaUsers className="mr-1" />
                                  Representante
                                </>
                              )}
                              <span className="mx-2">•</span>
                              📄 {doc.nombreArchivo}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Botón para finalizar modernizado */}
                <div className="mt-8">
                  <button
                    type="button"
                    onClick={finalizarSubidaDocumentos}
                    disabled={loading || (documentosSubidos.length === 0 && todosDocumentos.some(doc => doc.obligatorio))}
                    className="w-full inline-flex items-center justify-center py-4 px-8 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <FaCheckCircle className="mr-3" />
                        Finalizar y Ver Comprobante
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Botones de navegación modernizados (solo para pasos 1-3) */}
            {step < 4 && (
              <div className="pt-6 mt-8 border-t-2 border-gray-200">
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={step > 1 ? handlePrevStep : () => navigate(-1)}
                    className="inline-flex items-center px-6 py-3 border-2 border-gray-300 rounded-xl shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 transform hover:scale-105"
                  >
                    <FaArrowLeft className="mr-2" />
                    {step > 1 ? 'Anterior' : 'Cancelar'}
                  </button>
                  <button
                    type={step === 3 ? 'submit' : 'button'}
                    onClick={step < 3 ? handleNextStep : undefined}
                    disabled={loading}
                    className={`inline-flex items-center px-8 py-3 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white ${theme.bgButton} ${theme.hoverButton} focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme.ring} disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Procesando...
                      </>
                    ) : (
                      <>
                        {step < 3 ? 'Siguiente' : 'Registrar Estudiante'}
                        {step < 3 ? <FaArrowRight className="ml-2" /> : <FaCheckCircle className="ml-2" />}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default NuevoEstudiante;