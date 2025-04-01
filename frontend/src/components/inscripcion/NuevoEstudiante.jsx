import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { tipoDocumentoFormateado, formatearNombreGrado, formatearFecha } from '../../utils/formatters';


const NuevoEstudiante = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
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

    
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-indigo-600">
            <h2 className="text-xl font-semibold text-white">Inscripción de Nuevo Estudiante</h2>
            <p className="mt-1 text-sm text-indigo-100">Complete todos los campos requeridos para inscribir al estudiante.</p>
          </div>
          
          {/* Indicador de pasos */}
          <div className="px-4 py-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="w-full flex items-center">
                <div className={`flex items-center justify-center h-8 w-8 rounded-full ${step >= 1 ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                  <span className="text-white text-sm font-medium">1</span>
                </div>
                <div className={`h-1 flex-1 mx-2 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                <div className={`flex items-center justify-center h-8 w-8 rounded-full ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                  <span className="text-white text-sm font-medium">2</span>
                </div>
                <div className={`h-1 flex-1 mx-2 ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                <div className={`flex items-center justify-center h-8 w-8 rounded-full ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                  <span className="text-white text-sm font-medium">3</span>
                </div>
                {step >= 4 && (
                  <>
                    <div className={`h-1 flex-1 mx-2 bg-indigo-600`}></div>
                    <div className={`flex items-center justify-center h-8 w-8 rounded-full bg-indigo-600`}>
                      <span className="text-white text-sm font-medium">4</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>Datos Personales</span>
              <span>Documentos</span>
              <span>Confirmación</span>
              {step >= 4 && <span>Subir Archivos</span>}
            </div>
          </div>
          
          {/* Mensajes de error o éxito */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4">
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
            <div className="bg-green-50 border-l-4 border-green-400 p-4 m-4">
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

          {/* Mensaje informativo cuando se accede desde el detalle del representante */}
          {representanteEncontrado && getQueryParams().repId && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 m-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    Está registrando un nuevo estudiante para el representante {formData.representante.nombre} {formData.representante.apellido}.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Barra de progreso de subida */}
          {isUploading && (
            <div className="mt-4 mx-4">
              <p className="text-sm font-medium text-gray-700">
                Subiendo archivos: {uploadProgress}%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                <div 
                  className="bg-indigo-600 h-2.5 rounded-full" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {/* Formulario */}
          <form ref={formRef} onSubmit={handleSubmit} className="px-4 py-5 sm:p-6" encType="multipart/form-data">
            {/* Paso 1: Datos Personales */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Datos del Estudiante</h3>
                  <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="cedula" className="block text-sm font-medium text-gray-700">Cédula/Documento</label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="cedula"
                          id="cedula"
                          value={formData.estudiante.cedula}
                          onChange={(e) => handleChange(e, 'estudiante')}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="sm:col-span-3">
                      <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre</label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="nombre"
                          id="nombre"
                          value={formData.estudiante.nombre}
                          onChange={(e) => handleChange(e, 'estudiante')}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="sm:col-span-3">
                      <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">Apellido</label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="apellido"
                          id="apellido"
                          value={formData.estudiante.apellido}
                          onChange={(e) => handleChange(e, 'estudiante')}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="sm:col-span-3">
                      <label htmlFor="fechaNacimiento" className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                      <div className="mt-1">
                        <input
                          type="date"
                          name="fechaNacimiento"
                          id="fechaNacimiento"
                          value={formData.estudiante.fechaNacimiento}
                          onChange={(e) => handleChange(e, 'estudiante')}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="sm:col-span-3">
                      <label htmlFor="lugarNacimiento" className="block text-sm font-medium text-gray-700">Lugar de Nacimiento</label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="lugarNacimiento"
                          id="lugarNacimiento"
                          value={formData.estudiante.lugarNacimiento}
                          onChange={(e) => handleChange(e, 'estudiante')}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    
                    <div className="sm:col-span-3">
                      <label htmlFor="genero" className="block text-sm font-medium text-gray-700">Género</label>
                      <div className="mt-1">
                        <select
                          id="genero"
                          name="genero"
                          value={formData.estudiante.genero}
                          onChange={(e) => handleChange(e, 'estudiante')}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        >
                          <option value="">Seleccione</option>
                          <option value="M">Masculino</option>
                          <option value="F">Femenino</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="sm:col-span-6">
                      <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">Dirección</label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="direccion"
                          id="direccion"
                          value={formData.estudiante.direccion}
                          onChange={(e) => handleChange(e, 'estudiante')}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="sm:col-span-6">
                      <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700">Observaciones</label>
                      <div className="mt-1">
                        <textarea
                          id="observaciones"
                          name="observaciones"
                          rows="3"
                          value={formData.estudiante.observaciones}
                          onChange={(e) => handleChange(e, 'estudiante')}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Datos del Representante</h3>
                  {/* Sección para buscar representante por cédula */}
                  <div className="mt-4 flex items-end space-x-4">
                    <div className="flex-grow">
                      <label htmlFor="rep_cedula" className="block text-sm font-medium text-gray-700">Cédula del Representante</label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="cedula"
                          id="rep_cedula"
                          value={formData.representante.cedula}
                          onChange={(e) => handleChange(e, 'representante')}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          required
                          disabled={representanteEncontrado}
                        />
                      </div>
                    </div>
                    
                    {!representanteEncontrado && (
                      <button
                        type="button"
                        onClick={buscarRepresentante}
                        disabled={buscandoRepresentante || !formData.representante.cedula}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                      >
                        {buscandoRepresentante ? (
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : "Buscar"}
                      </button>
                    )}
                    
                    {/* Botón para cambiar representante - ocultar si viene de RepresentanteDetail */}
                    {!getQueryParams().repId && (
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
                        className="mt-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Cambiar
                      </button>
                    )}
                  </div>
                  
                  {representanteEncontrado ? (
                    <div className="mt-4 bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center mb-3">
                        <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium text-green-800">
                          {getQueryParams().repId ? 'Representante seleccionado' : 'Representante encontrado'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-500">Nombre completo</label>
                          <div className="mt-1 text-sm text-gray-900">{formData.representante.nombre} {formData.representante.apellido}</div>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-500">Cédula</label>
                          <div className="mt-1 text-sm text-gray-900">{formData.representante.cedula}</div>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-500">Teléfono</label>
                          <div className="mt-1 text-sm text-gray-900">{formData.representante.telefono}</div>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-500">Email</label>
                          <div className="mt-1 text-sm text-gray-900">{formData.representante.email}</div>
                        </div>
                        
                        <div className="sm:col-span-2">
                          <label htmlFor="rep_direccion" className="block text-sm font-medium text-gray-700">Dirección</label>
                          <div className="mt-1">
                            <input
                              type="text"
                              name="direccion"
                              id="rep_direccion"
                              value={formData.representante.direccion}
                              onChange={(e) => handleChange(e, 'representante')}
                              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="sm:col-span-2">
                          <label htmlFor="rep_profesion" className="block text-sm font-medium text-gray-700">Profesión</label>
                          <div className="mt-1">
                            <input
                              type="text"
                              name="profesion"
                              id="rep_profesion"
                              value={formData.representante.profesion}
                              onChange={(e) => handleChange(e, 'representante')}
                              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label htmlFor="rep_nombre" className="block text-sm font-medium text-gray-700">Nombre</label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="nombre"
                            id="rep_nombre"
                            value={formData.representante.nombre}
                            onChange={(e) => handleChange(e, 'representante')}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="sm:col-span-3">
                        <label htmlFor="rep_apellido" className="block text-sm font-medium text-gray-700">Apellido</label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="apellido"
                            id="rep_apellido"
                            value={formData.representante.apellido}
                            onChange={(e) => handleChange(e, 'representante')}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="sm:col-span-3">
                        <label htmlFor="rep_telefono" className="block text-sm font-medium text-gray-700">Teléfono</label>
                        <div className="mt-1">
                          <input
                            type="tel"
                            name="telefono"
                            id="rep_telefono"
                            value={formData.representante.telefono}
                            onChange={(e) => handleChange(e, 'representante')}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="sm:col-span-3">
                        <label htmlFor="rep_email" className="block text-sm font-medium text-gray-700">Email</label>
                        <div className="mt-1">
                          <input
                            type="email"
                            name="email"
                            id="rep_email"
                            value={formData.representante.email}
                            onChange={(e) => handleChange(e, 'representante')}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="sm:col-span-3">
                        <label htmlFor="rep_profesion" className="block text-sm font-medium text-gray-700">Profesión</label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="profesion"
                            id="rep_profesion"
                            value={formData.representante.profesion}
                            onChange={(e) => handleChange(e, 'representante')}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                      
                      <div className="sm:col-span-6">
                        <label htmlFor="rep_direccion" className="block text-sm font-medium text-gray-700">Dirección</label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="direccion"
                            id="rep_direccion"
                            value={formData.representante.direccion}
                            onChange={(e) => handleChange(e, 'representante')}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Información Académica</h3>
                  <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="nivel" className="block text-sm font-medium text-gray-700">
                        Nivel
                      </label>
                      <div className="mt-1">
                        <select
                          id="nivel"
                          name="nivel"
                          value={nivelSeleccionado}
                          onChange={(e) => setNivelSeleccionado(e.target.value)}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        >
                          <option value="">Seleccione un nivel</option>
                          <option value="Primaria">Primaria</option>
                          <option value="Secundaria">Secundaria</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="sm:col-span-3">
                      <label htmlFor="gradoID" className="block text-sm font-medium text-gray-700">
                        Grado
                      </label>
                      <div className="mt-1">
                        <select
                          id="gradoID"
                          name="gradoID"
                          value={formData.gradoID}
                          onChange={handleSimpleChange}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          required
                        >
                          <option value="">Seleccione un grado</option>
                          {grados.map(grado => (
                            <option 
                              key={grado.id} 
                              value={grado.id}
                              disabled={!cuposDisponibles[grado.id] || cuposDisponibles[grado.id] <= 0}
                            >
                              {grado.nombre_grado} {cuposDisponibles[grado.id] ? `(${cuposDisponibles[grado.id]} cupos)` : '(Sin cupos)'}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="sm:col-span-3">
                      <label htmlFor="annoEscolar" className="block text-sm font-medium text-gray-700">Año Escolar</label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="annoEscolar"
                          value={annoEscolar ? annoEscolar.periodo : 'Cargando...'}
                          className="bg-gray-100 shadow-sm block w-full sm:text-sm border-gray-300 rounded-md"
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Paso 2: Documentos */}
            {step === 2 && (
              <div className="space-y-6">
                {loadingDocumentos ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                  </div>
                ) : (
                  <>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Documentos del Estudiante</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Por favor, revise los documentos requeridos para el estudiante. Los documentos marcados con * son obligatorios.
                        Estos documentos se subirán después de completar la inscripción.
                      </p>
                      
                      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {documentosEstudiante.map((doc) => (
                          <div key={doc.id} className="border rounded-lg p-4 border-gray-200">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                {doc.obligatorio ? (
                                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-100">
                                    <span className="text-red-600 text-xs font-medium">*</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-gray-100">
                                    <span className="text-gray-600 text-xs font-medium">+</span>
                                  </span>
                                )}
                              </div>
                              <div className="ml-3">
                                <h4 className="text-sm font-medium text-gray-900">{doc.nombre}</h4>
                                <p className="text-xs text-gray-500">{doc.obligatorio ? 'Obligatorio' : 'Opcional'}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">Documentos del Representante</h3>
                      
                      {documentosRepresentante.length === 0 && representanteEncontrado ? (
                        <div className="mt-2 bg-green-50 p-4 rounded-lg">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm text-green-700">
                                El representante ya tiene todos los documentos obligatorios subidos.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-gray-500 mt-1">
                            Por favor, revise los documentos requeridos para el representante. Los documentos marcados con * son obligatorios.
                            Estos documentos se subirán después de completar la inscripción.
                          </p>
                          
                          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {documentosRepresentante.map((doc) => (
                              <div key={doc.id} className="border rounded-lg p-4 border-gray-200">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0">
                                    {doc.obligatorio ? (
                                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-100">
                                        <span className="text-red-600 text-xs font-medium">*</span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-gray-100">
                                        <span className="text-gray-600 text-xs font-medium">+</span>
                                      </span>
                                    )}
                                  </div>
                                  <div className="ml-3">
                                    <h4 className="text-sm font-medium text-gray-900">{doc.nombre}</h4>
                                    <p className="text-xs text-gray-500">{doc.obligatorio ? 'Obligatorio' : 'Opcional'}</p>
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
            
            {/* Paso 3: Confirmación */}
            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Confirmar Inscripción</h3>
                <p className="text-sm text-gray-500">
                  Por favor, revise la información antes de completar la inscripción.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 mb-2">Datos del Estudiante</h4>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Cédula/Documento</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formData.estudiante.cedula}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Nombre Completo</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formData.estudiante.nombre} {formData.estudiante.apellido}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Fecha de Nacimiento</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formData.estudiante.fechaNacimiento}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Género</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formData.estudiante.genero === 'M' ? 'Masculino' : 'Femenino'}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Dirección</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formData.estudiante.direccion}</dd>
                    </div>
                  </dl>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 mb-2">Datos del Representante</h4>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Cédula/Documento</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formData.representante.cedula}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Nombre Completo</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formData.representante.nombre} {formData.representante.apellido}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formData.representante.telefono}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formData.representante.email}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Profesión</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formData.representante.profesion || 'No especificada'}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Dirección</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formData.representante.direccion}</dd>
                    </div>
                  </dl>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 mb-2">Información Académica</h4>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Grado</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {grados.find(g => g.id == formData.gradoID)?.nombre_grado || 'No seleccionado'}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Año Escolar</dt>
                      <dd className="mt-1 text-sm text-gray-900">{annoEscolar?.periodo || 'No disponible'}</dd>
                    </div>
                  </dl>
                </div>
                
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-indigo-700">
                        Al completar la inscripción, acepta los términos y condiciones de la institución.
                        Después de registrar al estudiante, podrá subir los documentos requeridos.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Paso 4: Subida secuencial de documentos */}
            {step === 4 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Subida de Documentos</h3>
                <p className="text-sm text-gray-500">
                  Por favor, suba los documentos uno por uno. Los documentos obligatorios están marcados con *.
                </p>
                
                {/* Progreso de subida */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">
                      Progreso: {documentosSubidos.length} de {todosDocumentos.length} documentos
                    </h4>
                    <span className="text-xs text-gray-500">
                      {Math.round((documentosSubidos.length / todosDocumentos.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full" 
                      style={{ width: `${(documentosSubidos.length / todosDocumentos.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Documento actual */}
                {documentoActual < todosDocumentos.length && (
                  <div className="bg-white border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-md font-medium text-gray-900">
                          {todosDocumentos[documentoActual].nombre}
                          {todosDocumentos[documentoActual].obligatorio && <span className="text-red-500 ml-1">*</span>}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {todosDocumentos[documentoActual].tipo === 'estudiante' 
                            ? 'Documento del estudiante' 
                            : 'Documento del representante'}
                        </p>
                      </div>
                      <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                        {documentoActual + 1} de {todosDocumentos.length}
                      </span>
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Seleccione el archivo
                      </label>
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
                    
                    <div className="mt-4 flex space-x-3">
                      <button
                        type="button"
                        onClick={subirDocumentoActual}
                        disabled={subiendoDocumento || !archivoSeleccionado}
                        className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                      >
                        {subiendoDocumento ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Subiendo...
                          </span>
                        ) : 'Subir Documento'}
                      </button>
                      
                      <button
                        type="button"
                        onClick={saltarDocumentoActual}
                        disabled={subiendoDocumento || todosDocumentos[documentoActual].obligatorio}
                        className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                      >
                        {todosDocumentos[documentoActual].obligatorio ? 'Documento obligatorio' : 'Omitir'}
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Documentos subidos */}
                {documentosSubidos.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-md font-medium text-gray-900 mb-3">Documentos Subidos</h4>
                    <ul className="divide-y divide-gray-200 border rounded-lg">
                      {documentosSubidos.map((doc, index) => (
                        <li key={index} className="p-3 flex items-center">
                          <svg className="h-5 w-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{doc.nombre}</p>
                            <p className="text-xs text-gray-500">
                              {doc.tipo === 'estudiante' ? 'Estudiante' : 'Representante'} - {doc.nombreArchivo}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Botón para finalizar */}
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={finalizarSubidaDocumentos}
                    disabled={loading || (documentosSubidos.length === 0 && todosDocumentos.some(doc => doc.obligatorio))}
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {loading ? 'Procesando...' : 'Finalizar y Ver Comprobante'}
                  </button>
                </div>
              </div>
            )}

            {/* Botones de navegación (solo para pasos 1-3) */}
            {step < 4 && (
              <div className="pt-5 mt-6 border-t border-gray-200">
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={step > 1 ? handlePrevStep : () => navigate(-1)}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {step > 1 ? 'Anterior' : 'Cancelar'}
                  </button>
                  <button
                    type={step === 3 ? 'submit' : 'button'}
                    onClick={step < 3 ? handleNextStep : undefined}
                    disabled={loading}
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {loading ? (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : null}
                    {step < 3 ? 'Siguiente' : 'Registrar Estudiante'}
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
