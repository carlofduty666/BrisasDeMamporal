import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FaPlus, 
  FaSearch, 
  FaEye, 
  FaFileInvoiceDollar, 
  FaSave, 
  FaTimes, 
  FaMoneyBillWave,
  FaUser,
  FaGraduationCap,
  FaChartBar,
  FaTasks,
  FaChalkboardTeacher,
  FaBookOpen,
  FaClipboardList,
  FaUsers,
  FaCalendarAlt,
  FaHome
} from 'react-icons/fa';
import EstudianteProgresoModal from '../estudiante/EstudianteProgresoModal';
import ClasesActuales from '../ClasesActuales';

const RepresentanteDashboard = () => {
  const [representante, setRepresentante] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);
  const [cuposResumen, setCuposResumen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estados para la sección de pagos
  const [pagos, setPagos] = useState([]);
  const [pagosPendientes, setPagosPendientes] = useState([]);
  const [pagosPagados, setPagosPagados] = useState([]);
  const [pagosAnulados, setPagosAnulados] = useState([]);
  const [filteredPagos, setFilteredPagos] = useState([]);
  const [tabActiva, setTabActiva] = useState('pendientes');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  
  // Estados para el modal de nuevo pago
  const [showModal, setShowModal] = useState(false);
  const [aranceles, setAranceles] = useState([]);
  const [metodosPago, setMetodosPago] = useState([]);
  const [loadingAranceles, setLoadingAranceles] = useState(false);
  const [loadingMetodosPago, setLoadingMetodosPago] = useState(false);
  const [comprobante, setComprobante] = useState(null);
  const fileInputRef = useRef(null);
  const [annoEscolar, setAnnoEscolar] = useState(null);
  
  // Estado para el modal de detalles
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPago, setSelectedPago] = useState(null);

  // Estado para el modal de progreso
  const [showProgresoModal, setShowProgresoModal] = useState(false);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
  
  // Estados para datos académicos
  const [calificacionesEstudiantes, setCalificacionesEstudiantes] = useState({});
  const [evaluacionesEstudiantes, setEvaluacionesEstudiantes] = useState({});
  const [profesoresEstudiantes, setProfesoresEstudiantes] = useState({});
  const [estadosInscripcion, setEstadosInscripcion] = useState({});
  
  // // Estado para el formulario de nuevo pago
  const [formPago, setFormPago] = useState({
    estudianteID: '',
    representanteID: '',
    metodoPagoID: '',
    arancelID: '',
    inscripcionID: '',
    annoEscolarID: '',
    monto: '',
    montoMora: '0',
    descuento: '0',
    mesPago: '',
    fechaPago: new Date().toISOString().split('T')[0],
    referencia: '',
    observaciones: ''
  });

  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [formData, setFormData] = useState({
    estudianteID: '',
    arancelID: '',
    metodoPagoID: '',
    monto: '',
    montoMora: '0',
    descuento: '0',
    mesPago: '',
    fechaPago: new Date().toISOString().split('T')[0],
    referencia: '',
    observaciones: '',
    annoEscolarID: ''
  });
  
  // Estado para el cálculo automático del monto total
  const [montoTotal, setMontoTotal] = useState('0');

  // Efecto para calcular el monto total automáticamente
  useEffect(() => {
    const monto = parseFloat(formData.monto) || 0;
    const montoMora = parseFloat(formData.montoMora) || 0;
    const descuento = parseFloat(formData.descuento) || 0;
    
    const total = monto + montoMora - descuento;
    setMontoTotal(total.toFixed(2));
  }, [formData.monto, formData.montoMora, formData.descuento]);

  // Función para cargar datos académicos de los estudiantes
  const cargarDatosAcademicos = async (estudiantes, token, annoEscolarID) => {
    const calificaciones = {};
    const evaluaciones = {};
    const profesores = {};
    const estados = {};

    for (const estudiante of estudiantes) {
      try {
        // Obtener estado de inscripción
        const inscripcionResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/inscripciones/estudiante/${estudiante.id}/actual`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        estados[estudiante.id] = inscripcionResponse.data;
      } catch (err) {
        console.log(`No se encontró inscripción para estudiante ${estudiante.id}`);
        estados[estudiante.id] = null;
      }

      try {
        // Obtener calificaciones
        const califResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/calificaciones/estudiante/${estudiante.id}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        calificaciones[estudiante.id] = califResponse.data.slice(0, 5); // Solo últimas 5
      } catch (err) {
        console.log(`Error al cargar calificaciones para estudiante ${estudiante.id}`);
        calificaciones[estudiante.id] = [];
      }

      try {
        // Obtener evaluaciones
        const evalResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/evaluaciones/estudiante/${estudiante.id}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        evaluaciones[estudiante.id] = evalResponse.data.slice(0, 3); // Solo últimas 3
      } catch (err) {
        console.log(`Error al cargar evaluaciones para estudiante ${estudiante.id}`);
        evaluaciones[estudiante.id] = [];
      }

      try {
        // Obtener profesores
        const profResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/personas/estudiante/${estudiante.id}/profesores?annoEscolarID=${annoEscolarID}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        profesores[estudiante.id] = profResponse.data.slice(0, 4); // Solo primeros 4
      } catch (err) {
        console.log(`Error al cargar profesores para estudiante ${estudiante.id}`);
        profesores[estudiante.id] = [];
      }
    }

    setCalificacionesEstudiantes(calificaciones);
    setEvaluacionesEstudiantes(evaluaciones);
    setProfesoresEstudiantes(profesores);
    setEstadosInscripcion(estados);
  };

  useEffect(() => {
    const fetchAnnoEscolar = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/anno-escolar/actual`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        if (response.data && response.data.id) {
          setFormData(prev => ({
            ...prev,
            annoEscolarID: response.data.id
          }));
        }
      } catch (err) {
        console.error('Error al cargar año escolar:', err);
      }
    };
    
    fetchAnnoEscolar();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const userData = JSON.parse(atob(token.split('.')[1]));

        // Obtener año escolar actual
        const annoResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/anno-escolar/actual`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        if (!annoResponse.data || !annoResponse.data.id) {
          console.error('No se pudo obtener el año escolar actual');
          setError('Error al cargar datos. No se pudo obtener el año escolar actual.');
          setLoading(false);
          return;
        }
        
        const annoEscolarID = annoResponse.data.id;
        setAnnoEscolar(annoResponse.data);
        
        // Obtener datos del representante
        const representanteResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/personas/${userData.personaID}`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        setRepresentante(representanteResponse.data);
        localStorage.setItem('representanteData', JSON.stringify(representanteResponse.data));
        
        // Obtener estudiantes del representante
        const estudiantesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/personas/representante/${userData.personaID}/estudiantes`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        // Para cada estudiante, obtener su grado incluyendo el año escolar
        const estudiantesConGrado = await Promise.all(
          estudiantesResponse.data.map(async (estudiante) => {
            try {
              const gradoResponse = await axios.get(
                `${import.meta.env.VITE_API_URL}/grados/estudiante/${estudiante.id}?annoEscolarID=${annoEscolarID}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
              );
              
              // Si hay grados, tomar el primero (asumiendo que es el actual)
              if (gradoResponse.data && gradoResponse.data.length > 0) {
                console.log(`Estructura del grado:`, gradoResponse.data[0]);
                return {
                  ...estudiante,
                  grado: gradoResponse.data[0]
                };
              }
              return estudiante;
            } catch (err) {
              console.error(`Error al obtener grado para estudiante ${estudiante.id}:`, err);
              return estudiante;
            }
          })
        );
        
        setEstudiantes(estudiantesConGrado);
        
        // Cargar datos académicos para cada estudiante
        await cargarDatosAcademicos(estudiantesConGrado, token, annoEscolarID);
        
        // Obtener inscripciones del representante
        const inscripcionesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/inscripciones/representante/${userData.personaID}`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        setInscripciones(inscripcionesResponse.data);
        
        // Obtener resumen de cupos
        const cuposResponse = await axios.get(`${import.meta.env.VITE_API_URL}/cupos/resumen`);
        setCuposResumen(cuposResponse.data.resumenCupos);
        
        // Obtener pagos del representante
        const pagosResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/pagos/representante/${userData.personaID}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        console.log('Datos de pagos:', pagosResponse.data);
        
        if (pagosResponse.data && Array.isArray(pagosResponse.data)) {
          setPagos(pagosResponse.data);
          
          // Separar pagos por estado
          const pendientes = pagosResponse.data.filter(pago => pago.estado === 'pendiente');
          const pagados = pagosResponse.data.filter(pago => pago.estado === 'pagado');
          const anulados = pagosResponse.data.filter(pago => pago.estado === 'anulado');
          
          setPagosPendientes(pendientes);
          setPagosPagados(pagados);
          setPagosAnulados(anulados);
          setFilteredPagos(pendientes); 
          
          // Filtrar según la pestaña activa
          if (tabActiva === 'pendientes') {
            setFilteredPagos(pendientes);
          } else if (tabActiva === 'pagados') {
            setFilteredPagos(pagados);
          } else {
            setFilteredPagos(anulados);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar datos. Por favor, intente nuevamente.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [tabActiva]);

  useEffect(() => {
    const fetchPagos = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const userData = JSON.parse(atob(token.split('.')[1]));
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/pagos/representante/${userData.personaID}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        if (response.data && Array.isArray(response.data)) {
          setPagos(response.data);
        }
      } catch (err) {
        console.error('Error al cargar pagos:', err);
      }
    };
    
    fetchPagos();
  }, []);

  // Filtrar pagos cuando cambia el término de búsqueda
  useEffect(() => {
    let pagosAFiltrar = [];
    
    if (tabActiva === 'pendientes') {
      pagosAFiltrar = pagosPendientes;
    } else if (tabActiva === 'pagados') {
      pagosAFiltrar = pagosPagados;
    } else {
      pagosAFiltrar = pagosAnulados;
    }
    
    if (searchTerm.trim() === '') {
      setFilteredPagos(pagosAFiltrar);
    } else {
      const filtered = pagosAFiltrar.filter(pago => 
        (pago.estudiantes && pago.estudiantes.nombre && pago.estudiantes.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (pago.estudiantes && pago.estudiantes.apellido && pago.estudiantes.apellido.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (pago.estudiantes && pago.estudiantes.cedula && pago.estudiantes.cedula.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (pago.referencia && pago.referencia.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (pago.id && pago.id.toString().toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredPagos(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, pagosPendientes, pagosPagados, pagosAnulados, tabActiva]);

  // Función para cambiar de pestaña
  const cambiarTab = (tab) => {
    setTabActiva(tab);
    setCurrentPage(1); // Resetear a la primera página
    
    if (tab === 'pendientes') {
      setFilteredPagos(pagosPendientes);
    } else if (tab === 'pagados') {
      setFilteredPagos(pagosPagados);
    } else {
      setFilteredPagos(pagosAnulados);
    }
  };

  // Función para cargar datos necesarios para el modal
  const loadModalData = async () => {
    const token = localStorage.getItem('token');

    // Cargar aranceles
    try {
      setLoadingAranceles(true);
      const arancelesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/aranceles`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setAranceles(arancelesResponse.data.filter(arancel => arancel.activo));
      setLoadingAranceles(false);
    } catch (err) {
      console.error('Error al cargar aranceles:', err);
      setAranceles([]);
      setLoadingAranceles(false);
    }
    
    // Cargar métodos de pago
    try {
      setLoadingMetodosPago(true);
      const metodosResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/metodos-pago`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setMetodosPago(metodosResponse.data.filter(metodo => metodo.activo));
      setLoadingMetodosPago(false);
    } catch (err) {
      console.error('Error al cargar métodos de pago:', err);
      setMetodosPago([]);
      setLoadingMetodosPago(false);
    }
  };

  // Función para abrir el modal y cargar datos
  const handleOpenModal = () => {
    // Resetear el formulario
    setFormData({
      estudianteID: '',
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
    
    // Resetear archivo
    setArchivoSeleccionado(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Cargar datos necesarios
    loadModalData();
    
    // Mostrar el modal
    setShowModal(true);
  };

  // Función para manejar cambios en el archivo
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setArchivoSeleccionado(e.target.files[0]);
    } else {
      setArchivoSeleccionado(null);
    }
  };

  // Función para abrir modal de detalles
  const handleOpenDetailModal = async (pagoId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/pagos/${pagoId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setSelectedPago(response.data);
      setShowDetailModal(true);
      setLoading(false);
    } catch (err) {
      console.error('Error al obtener detalles del pago:', err);
      setError('Error al obtener detalles del pago. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };

  // Función para cerrar modal de detalles
  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedPago(null);
  };

  // Función para previsualizar comprobante
  const handlePreviewComprobante = (pago) => {
    if (pago.urlComprobante) {
      window.open(`${import.meta.env.VITE_API_URL}${pago.urlComprobante}`, '_blank');
    }
  };

// Función para cerrar el modal
const handleCloseModal = () => {
  setShowModal(false);
  setFormData({
    estudianteID: '',
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
};

// Función para enviar el formulario
const handleSubmitPago = async (e) => {
  e.preventDefault();
  
  // Validar campos obligatorios
  if (!formData.estudianteID || !formData.arancelID || !formData.metodoPagoID || 
    !formData.monto) {
    setError('Por favor, complete todos los campos obligatorios.');
  return;
}
  
  try {
    setLoading(true);
    setError('');
    
    const token = localStorage.getItem('token');
    const userData = JSON.parse(atob(token.split('.')[1]));

    const annoEscolarResponse = await axios.get(
      `${import.meta.env.VITE_API_URL}/anno-escolar/actual`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    if (!annoEscolarResponse.data || !annoEscolarResponse.data.id) {
      throw new Error('No se pudo obtener el año escolar actual');
    }

    const annoEscolarID = annoEscolarResponse.data.id;
    
    // Crear FormData
    const pagoFormData = new FormData();
    
    // Añadir todos los campos del formulario
    pagoFormData.append('estudianteID', formData.estudianteID);
    pagoFormData.append('representanteID', userData.personaID); // ID del representante desde el token
    pagoFormData.append('metodoPagoID', formData.metodoPagoID);
    pagoFormData.append('arancelID', formData.arancelID);
    pagoFormData.append('monto', formData.monto);
    pagoFormData.append('montoTotal', montoTotal);
    pagoFormData.append('annoEscolarID', annoEscolarID);
    
    // Añadir campos opcionales solo si tienen valor
    if (formData.montoMora && formData.montoMora !== '0') pagoFormData.append('montoMora', formData.montoMora);
    if (formData.descuento && formData.descuento !== '0') pagoFormData.append('descuento', formData.descuento);
    if (formData.mesPago) pagoFormData.append('mesPago', formData.mesPago);
    if (formData.fechaPago) pagoFormData.append('fechaPago', formData.fechaPago);
    if (formData.referencia) pagoFormData.append('referencia', formData.referencia);
    if (formData.observaciones) pagoFormData.append('observaciones', formData.observaciones);
    
    // Añadir comprobante si existe
    if (archivoSeleccionado) {
      pagoFormData.append('comprobante', archivoSeleccionado);
    }
    
    // Imprimir el contenido del FormData para depuración
    console.log("Datos a enviar:");
    for (let pair of pagoFormData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }
    
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/pagos`,
      pagoFormData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log("Respuesta del servidor:", response.data);
    
    setSuccess('Pago registrado correctamente');
    handleCloseModal();
    
    // Recargar la lista de pagos
    const pagosResponse = await axios.get(
      `${import.meta.env.VITE_API_URL}/pagos/representante/${userData.personaID}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    if (pagosResponse.data && Array.isArray(pagosResponse.data)) {
      setPagos(pagosResponse.data);
    }
    
    setLoading(false);
    
    // Ocultar mensaje de éxito después de 3 segundos
    setTimeout(() => {
      setSuccess('');
    }, 3000);
    
  } catch (err) {
    console.error('Error al registrar pago:', err);
    setError(err.response?.data?.message || 'Error al registrar el pago. Por favor, intente nuevamente.');
    setLoading(false);
  }
};

// Función para abrir el modal de progreso
const handleVerProgreso = (estudiante) => {
  setEstudianteSeleccionado(estudiante.id);
  setShowProgresoModal(true);
};


  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPagos.slice(indexOfFirstItem, indexOfLastItem);
  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Formatear monto
  const formatMonto = (monto) => {
    if (monto === undefined || monto === null) return 'N/A';
    return `$${parseFloat(monto).toFixed(2)}`;
  };

  if (loading && !representante) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="relative bg-slate-800 shadow-lg overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-full">
                <FaEye className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white drop-shadow-lg">Dashboard</h1>
                <p className="text-white/80 text-sm mt-1">Gestiona la información de tus estudiantes</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {representante && (
                <div className="text-right bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                  <p className="text-sm text-white/80">Bienvenido</p>
                  <p className="text-lg font-semibold text-white">{representante.nombre} {representante.apellido}</p>
                </div>
              )}
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/login';
                }}
                className="bg-red-500/80 hover:bg-red-600 text-white py-2 px-4 rounded-lg backdrop-blur-md border border-red-400/30 transition-all duration-300 hover:scale-105"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}
        
        {/* Componente de Clases Actuales */}
        <div className="mb-6">
          <ClasesActuales />
        </div>
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Sección de Estudiantes */}
          <div className="lg:col-span-3 bg-white shadow-lg rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-xl">
            <div className="bg-slate-700 px-6 py-4 rounded-t-xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <FaUsers className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Mis Estudiantes</h2>
                    <p className="text-gray-200 text-sm">Gestiona tus estudiantes inscritos</p>
                  </div>
                </div>
                <Link
                  to="/inscripcion/nuevo-estudiante"
                  className="bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg border border-white/20 transition-all duration-300 hover:scale-105 flex items-center space-x-2"
                >
                  <FaPlus className="h-4 w-4" />
                  <span>Nuevo Estudiante</span>
                </Link>
              </div>
            </div>
            <div className="px-6 py-6">
              
              {estudiantes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <FaPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg font-medium">No tienes estudiantes registrados</p>
                    <p className="text-gray-500 mt-2">Haz clic en "Nuevo Estudiante" para comenzar</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {estudiantes.map((estudiante, index) => {
                    const estadoInscripcion = estadosInscripcion[estudiante.id];
                    const calificaciones = calificacionesEstudiantes[estudiante.id] || [];
                    const evaluaciones = evaluacionesEstudiantes[estudiante.id] || [];
                    const profesores = profesoresEstudiantes[estudiante.id] || [];

                    return (
                      <div 
                        key={estudiante.id} 
                        className="group bg-white rounded-xl shadow-md hover:shadow-lg border border-gray-200 transition-all duration-300 hover:scale-[1.02] overflow-hidden"
                        style={{
                          animationDelay: `${index * 150}ms`,
                          animation: 'fadeInUp 0.6s ease-out forwards'
                        }}
                      >
                        {/* Header del estudiante */}
                        <div className="bg-slate-600 p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-white/10 rounded-lg">
                                <FaUser className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-white">
                                  {estudiante.nombre} {estudiante.apellido}
                                </h3>
                                <p className="text-white/80 text-sm">C.I: {estudiante.cedula}</p>
                              </div>
                            </div>
                            {estadoInscripcion && (
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                estadoInscripcion.estado === 'aprobado' || estadoInscripcion.estado === 'inscrito' 
                                  ? 'bg-green-500/80 text-white border border-green-400/50' :
                                estadoInscripcion.estado === 'rechazado' || estadoInscripcion.estado === 'retirado' 
                                  ? 'bg-red-500/80 text-white border border-red-400/50' :
                                  'bg-yellow-500/80 text-white border border-yellow-400/50'
                              }`}>
                                {estadoInscripcion.estado?.toUpperCase() || 'PENDIENTE'}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="p-6 space-y-6">
                          {/* Información Académica */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                              <div className="text-xs font-medium text-gray-700 mb-1 flex items-center">
                                <FaGraduationCap className="h-3 w-3 mr-1" />
                                Grado
                              </div>
                              <div className="text-sm font-bold text-gray-900">
                                {estudiante.grado?.nombre_grado || 'No asignado'}
                              </div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                              <div className="text-xs font-medium text-gray-700 mb-1 flex items-center">
                                <FaUsers className="h-3 w-3 mr-1" />
                                Sección
                              </div>
                              <div className="text-sm font-bold text-gray-900">
                                {estadoInscripcion?.Secciones?.nombre_seccion || 'No asignada'}
                              </div>
                            </div>
                          </div>

                          {/* Resumen Académico */}
                          <div className="grid grid-cols-3 gap-3">
                            <div className="text-center bg-gray-100 rounded-lg p-3 border border-gray-200">
                              <FaChartBar className="h-4 w-4 mx-auto mb-1 text-gray-600" />
                              <div className="text-lg font-bold text-gray-700">{calificaciones.length}</div>
                              <div className="text-xs text-gray-600">Calificaciones</div>
                            </div>
                            <div className="text-center bg-gray-100 rounded-lg p-3 border border-gray-200">
                              <FaTasks className="h-4 w-4 mx-auto mb-1 text-gray-600" />
                              <div className="text-lg font-bold text-gray-700">{evaluaciones.length}</div>
                              <div className="text-xs text-gray-600">Evaluaciones</div>
                            </div>
                            <div className="text-center bg-gray-100 rounded-lg p-3 border border-gray-200">
                              <FaChalkboardTeacher className="h-4 w-4 mx-auto mb-1 text-gray-600" />
                              <div className="text-lg font-bold text-gray-700">{profesores.length}</div>
                              <div className="text-xs text-gray-600">Profesores</div>
                            </div>
                          </div>

                          {/* Últimas Calificaciones */}
                          {calificaciones.length > 0 && (
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                              <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                <FaChartBar className="text-gray-600 mr-2 h-4 w-4" />
                                Últimas Calificaciones
                              </div>
                              <div className="space-y-2">
                                {calificaciones.slice(0, 3).map((calif, idx) => (
                                  <div key={idx} className="flex justify-between items-center text-xs">
                                    <span className="text-gray-600 truncate flex-1 mr-2">
                                      {calif.Evaluaciones?.nombreEvaluacion || 'Evaluación'}
                                    </span>
                                    <span className={`font-bold px-2 py-1 rounded ${
                                      calif.calificacion >= 16 ? 'bg-green-100 text-green-700' :
                                      calif.calificacion >= 10 ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-red-100 text-red-700'
                                    }`}>
                                      {calif.calificacion}/20
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Profesores */}
                          {profesores.length > 0 && (
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                              <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                <FaChalkboardTeacher className="text-gray-600 mr-2 h-4 w-4" />
                                Profesores Asignados
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {profesores.slice(0, 4).map((prof, idx) => (
                                  <div key={idx} className="text-xs bg-white rounded p-2 border border-gray-100">
                                    <div className="font-medium text-gray-800 truncate">
                                      {prof.nombre} {prof.apellido}
                                    </div>
                                    <div className="text-gray-500 truncate">
                                      {prof.materia?.asignatura || 'Materia'}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Botones de Acción */}
                          <div className="flex space-x-3 pt-2">
                            <Link 
                              to={`/estudiante/${estudiante.id}`} 
                              className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-3 px-4 rounded-lg text-center text-sm font-medium transition-all duration-300 hover:scale-105 shadow-md flex items-center justify-center"
                            >
                              <FaEye className="h-4 w-4 mr-2" />
                              Ver Detalles
                            </Link>
                            <button
                              onClick={() => handleVerProgreso(estudiante)}
                              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 shadow-md flex items-center justify-center"
                            >
                              <FaClipboardList className="h-4 w-4 mr-2" />
                              Ver Progreso
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar con información compacta */}
          <div className="lg:col-span-1 space-y-4">
            {/* Cupos Disponibles Compactos */}
            <div className="bg-white shadow-lg rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-xl">
              <div className="bg-slate-700 px-3 py-2 rounded-t-xl">
                <h3 className="text-sm font-bold text-white flex items-center">
                  <FaClipboardList className="h-4 w-4 mr-1" />
                  Cupos
                </h3>
              </div>
              <div className="p-3">
                {cuposResumen.length > 0 ? (
                  <div className="space-y-2">
                    {cuposResumen.slice(0, 3).map((cupo) => (
                      <div key={cupo.gradoID} className="bg-gray-50 rounded-lg border border-gray-200 p-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-gray-900 truncate">{cupo.nombre_grado}</span>
                          <span className="text-xs text-gray-500">{cupo.totalDisponibles}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                              cupo.porcentajeOcupacion > 90 ? 'bg-red-500' :
                              cupo.porcentajeOcupacion > 70 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${cupo.porcentajeOcupacion}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-xs">Sin datos</p>
                )}
              </div>
            </div>

            {/* Resumen de Pagos */}
            <div className="bg-white shadow-lg rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-xl">
              <div className="bg-slate-700 px-3 py-2 rounded-t-xl">
                <h3 className="text-sm font-bold text-white flex items-center">
                  <FaMoneyBillWave className="h-4 w-4 mr-1" />
                  Pagos
                </h3>
              </div>
              <div className="p-3 space-y-2">
                <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-xs font-medium text-gray-700">Pagados</span>
                  <span className="text-sm font-bold text-green-600">{pagosPagados.length}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                  <span className="text-xs font-medium text-gray-700">Pendientes</span>
                  <span className="text-sm font-bold text-yellow-600">{pagosPendientes.length}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-red-50 rounded-lg border border-red-200">
                  <span className="text-xs font-medium text-gray-700">Anulados</span>
                  <span className="text-sm font-bold text-red-600">{pagosAnulados.length}</span>
                </div>
                <button
                  onClick={handleOpenModal}
                  className="w-full bg-slate-600 hover:bg-slate-700 text-white py-2 px-3 rounded-lg text-xs font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-1"
                >
                  <FaPlus className="h-3 w-3" />
                  <span>Nuevo Pago</span>
                </button>
              </div>
            </div>
          </div>
        </div>


        
        {/* Secciones inferiores en grid */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Estadísticas Académicas Generales */}
          <div className="bg-white shadow-lg rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-xl">
            <div className="bg-slate-700 px-6 py-4 rounded-t-xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <FaChartBar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Resumen Académico</h2>
                  <p className="text-gray-200 text-sm">Estado general de tus estudiantes</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-6">
              {estudiantes.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center bg-gray-100 rounded-xl p-4 border border-gray-200">
                    <FaUsers className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <div className="text-2xl font-bold text-gray-700">{estudiantes.length}</div>
                    <div className="text-xs text-gray-600 mt-1">Estudiantes</div>
                  </div>
                  <div className="text-center bg-gray-100 rounded-xl p-4 border border-gray-200">
                    <FaGraduationCap className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <div className="text-2xl font-bold text-gray-700">
                      {Object.values(estadosInscripcion).filter(estado => estado?.estado === 'inscrito' || estado?.estado === 'aprobada').length}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Inscritos</div>
                  </div>
                  <div className="text-center bg-gray-100 rounded-xl p-4 border border-gray-200">
                    <FaChartBar className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <div className="text-2xl font-bold text-gray-700">
                      {Object.values(calificacionesEstudiantes).reduce((total, califs) => total + califs.length, 0)}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Calificaciones</div>
                  </div>
                  <div className="text-center bg-gray-100 rounded-xl p-4 border border-gray-200">
                    <FaTasks className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <div className="text-2xl font-bold text-gray-700">
                      {Object.values(evaluacionesEstudiantes).reduce((total, evals) => total + evals.length, 0)}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Evaluaciones</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <FaChartBar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg font-medium">Sin datos académicos</p>
                    <p className="text-gray-500 mt-2">Registra estudiantes para ver estadísticas</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pagos Recientes Compactos */}
          <div className="bg-white shadow-lg rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-xl">
            <div className="bg-slate-700 px-6 py-4 rounded-t-xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <FaMoneyBillWave className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Pagos Recientes</h2>
                    <p className="text-gray-200 text-sm">Últimos movimientos</p>
                  </div>
                </div>
                <Link 
                  to="/pagos" 
                  className="bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg border border-white/20 transition-all duration-300 hover:scale-105 text-sm"
                >
                  Ver Todos
                </Link>
              </div>
            </div>
            <div className="px-6 py-6">
              {pagos.length === 0 ? (
                <div className="text-center py-8">
                  <div className="p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <FaMoneyBillWave className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg font-medium">No tienes pagos registrados</p>
                    <p className="text-gray-500 mt-2">Los pagos aparecerán aquí cuando se procesen</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {pagos.slice(0, 6).map((pago, index) => (
                    <div 
                      key={pago.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animation: 'fadeInUp 0.6s ease-out forwards'
                      }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className={`w-3 h-3 rounded-full ${
                            pago.estado === 'pagado' ? 'bg-green-500' :
                            pago.estado === 'anulado' ? 'bg-red-500' :
                            'bg-yellow-500'
                          }`}></span>
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-gray-900 truncate">
                              {pago.estudiante?.nombre || pago.estudiantes?.nombre || 'N/A'} {pago.estudiante?.apellido || pago.estudiantes?.apellido || ''}
                            </h4>
                            <p className="text-xs text-gray-500 truncate">
                              {pago.arancel?.nombre || pago.aranceles?.nombre || 'No especificado'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900">
                          ${parseFloat(pago.montoTotal || pago.monto).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(pago.fechaPago || pago.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
          {/* Modal para registrar nuevo pago */}
          {showModal && (
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
                        <div className="mt-2">
                          <form onSubmit={handleSubmitPago} className="space-y-6">
                            {/* Sección de Estudiante */}
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                              <div className="sm:col-span-6">
                                <label htmlFor="estudiante" className="block text-sm font-medium text-gray-700">
                                  Estudiante <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-1">
                                  <select
                                    id="estudiante"
                                    name="estudianteID"
                                    value={formData.estudianteID}
                                    onChange={(e) => setFormData({
                                      ...formData,
                                      estudianteID: e.target.value
                                    })}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    required
                                  >
                                    <option value="">Seleccione un estudiante</option>
                                    {estudiantes.map((est) => (
                                      <option key={est.id} value={est.id}>
                                        {est.nombre} {est.apellido}
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
                                    value={formData.arancelID}
                                    onChange={(e) => {
                                      const arancelID = e.target.value;
                                      const arancel = aranceles.find(a => a.id.toString() === arancelID);
                                      
                                      setFormData({
                                        ...formData,
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
                                        {arancel.nombre} - ${arancel.monto}
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
                                    value={formData.metodoPagoID}
                                    onChange={(e) => {
                                      setFormData({
                                        ...formData,
                                        metodoPagoID: e.target.value
                                      });
                                    }}
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
                              
                              <div className="sm:col-span-3">
                              <label htmlFor="monto" className="block text-sm font-medium text-gray-700">
                                  Monto <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-1">
                                  <input
                                    type="number"
                                    step="0.01"
                                    id="monto"
                                    name="monto"
                                    value={formData.monto}
                                    onChange={(e) => {
                                      setFormData({
                                        ...formData,
                                        monto: e.target.value
                                      });
                                    }}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    required
                                  />
                                </div>
                              </div>
                              
                              <div className="sm:col-span-3">
                                <label htmlFor="montoMora" className="block text-sm font-medium text-gray-700">
                                  Monto por Mora
                                </label>
                                <div className="mt-1">
                                  <input
                                    type="number"
                                    step="0.01"
                                    id="montoMora"
                                    name="montoMora"
                                    value={formData.montoMora}
                                    onChange={(e) => {
                                      setFormData({
                                        ...formData,
                                        montoMora: e.target.value
                                      });
                                    }}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                  />
                                </div>
                              </div>
                              
                              <div className="sm:col-span-3">
                                <label htmlFor="descuento" className="block text-sm font-medium text-gray-700">
                                  Descuento
                                </label>
                                <div className="mt-1">
                                  <input
                                    type="number"
                                    step="0.01"
                                    id="descuento"
                                    name="descuento"
                                    value={formData.descuento}
                                    onChange={(e) => {
                                      setFormData({
                                        ...formData,
                                        descuento: e.target.value
                                      });
                                    }}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                  />
                                </div>
                              </div>
                              
                              <div className="sm:col-span-3">
                                <label htmlFor="montoTotal" className="block text-sm font-medium text-gray-700">
                                  Monto Total
                                </label>
                                <div className="mt-1">
                                  <input
                                    type="text"
                                    id="montoTotal"
                                    value={`${montoTotal}`}
                                    className="bg-gray-100 shadow-sm block w-full sm:text-sm border-gray-300 rounded-md"
                                    disabled
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
                                    value={formData.mesPago}
                                    onChange={(e) => {
                                      setFormData({
                                        ...formData,
                                        mesPago: e.target.value
                                      });
                                    }}
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
                                  Fecha de Pago
                                </label>
                                <div className="mt-1">
                                  <input
                                    type="date"
                                    id="fechaPago"
                                    name="fechaPago"
                                    value={formData.fechaPago}
                                    onChange={(e) => {
                                      setFormData({
                                        ...formData,
                                        fechaPago: e.target.value
                                      });
                                    }}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
                                    value={formData.referencia}
                                    onChange={(e) => {
                                      setFormData({
                                        ...formData,
                                        referencia: e.target.value
                                      });
                                    }}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                  />
                                </div>
                              </div>
                              
                              <div className="sm:col-span-6">
                                <label htmlFor="comprobante" className="block text-sm font-medium text-gray-700">
                                  Comprobante de Pago
                                </label>
                                <div className="mt-1">
                                  <input
                                    type="file"
                                    id="comprobante"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                  />
                                </div>
                                <p className="mt-2 text-sm text-gray-500">
                                  Formatos aceptados: PDF, JPG, JPEG, PNG
                                </p>
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
                                    onChange={(e) => {
                                      setFormData({
                                        ...formData,
                                        observaciones: e.target.value
                                      });
                                    }}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                  ></textarea>
                                </div>
                              </div>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      onClick={handleSubmitPago}
                      disabled={loading}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
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
                          Registrar Pago
                        </span>
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


          {/* Modal para ver detalles del pago */}
          {showDetailModal && selectedPago && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Detalles del Pago</h3>
                  <button
                    onClick={handleCloseDetailModal}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <FaTimes />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Estudiante</h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedPago.estudiante?.nombre} {selectedPago.estudiante?.apellido}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Concepto</h4>
                    <p className="mt-1 text-sm text-gray-900">{selectedPago.concepto}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Monto</h4>
                    <p className="mt-1 text-sm text-gray-900">{formatMonto(selectedPago.monto)}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Método de Pago</h4>
                    <p className="mt-1 text-sm text-gray-900">{selectedPago.metodoPago}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Referencia</h4>
                    <p className="mt-1 text-sm text-gray-900">{selectedPago.referencia}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Fecha</h4>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedPago.fecha)}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Estado</h4>
                    <p className="mt-1">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        selectedPago.estado === 'pagado' ? 'bg-green-100 text-green-800' :
                        selectedPago.estado === 'anulado' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedPago.estado.toUpperCase()}
                      </span>
                    </p>
                  </div>
                  
                  {selectedPago.observaciones && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Observaciones</h4>
                      <p className="mt-1 text-sm text-gray-900">{selectedPago.observaciones}</p>
                    </div>
                  )}
                  
                  {selectedPago.urlComprobante && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Comprobante</h4>
                      <div className="mt-2">
                        <button
                          onClick={() => handlePreviewComprobante(selectedPago)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <FaEye className="mr-2" /> Ver Comprobante
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleCloseDetailModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}

          {showProgresoModal && (
            <EstudianteProgresoModal
              isOpen={showProgresoModal}
              onClose={() => setShowProgresoModal(false)}
              estudianteID={estudianteSeleccionado}
            />
          )}
    </div>
  );
};

// Añadir las animaciones CSS
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

if (!document.head.querySelector('#dashboard-animations')) {
  styleSheet.id = 'dashboard-animations';
  document.head.appendChild(styleSheet);
}

export default RepresentanteDashboard;