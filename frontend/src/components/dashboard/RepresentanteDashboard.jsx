import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaPlus, FaSearch, FaEye, FaFileInvoiceDollar, FaSave, FaTimes, FaMoneyBillWave } from 'react-icons/fa';
import EstudianteProgresoModal from '../estudiante/EstudianteProgresoModal';

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
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard del Representante</h1>
            <div className="flex items-center">
              <span className="text-gray-600 mr-4">{representante?.nombre} {representante?.apellido}</span>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/login';
                }}
                className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
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
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Sección de Estudiantes */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Mis Estudiantes</h2>
                <Link
                  to="/inscripcion/nuevo-estudiante"
                  className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors"
                >
                  Inscribir Nuevo Estudiante
                </Link>
              </div>
              
              {estudiantes.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">No tiene estudiantes registrados.</p>
                  <p className="text-gray-500 mt-2">Haga clic en "Inscribir Nuevo Estudiante" para comenzar.</p>
                </div>
                
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cédula</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {estudiantes.map((estudiante) => (
                        <tr key={estudiante.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {estudiante.nombre} {estudiante.apellido}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{estudiante.cedula}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                            {estudiante.grado ? (
                              <>
                                {estudiante.grado.nombre_grado || 'Grado sin nombre'} 
                                
                              </>
                            ) : (
                              'No asignado'
                            )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link to={`/estudiante/${estudiante.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                              Ver Detalles
                            </Link>
                            <button
                              onClick={() => handleVerProgreso(estudiante)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Ver Progreso
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Sección de Inscripciones */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Inscripciones Recientes</h2>
              
              {inscripciones.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">No tiene inscripciones registradas.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estudiante</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {inscripciones.map((inscripcion) => (
                        <tr key={inscripcion.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {inscripcion.estudiante.nombre} {inscripcion.estudiante.apellido}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                            {inscripcion.grado?.nombre_grado}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              inscripcion.estado === 'aprobado' ? 'bg-green-100 text-green-800' :
                              inscripcion.estado === 'rechazado' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {inscripcion.estado.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link to={`/inscripcion/comprobante/${inscripcion.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                              Ver Comprobante
                            </Link>
                            {/* {!inscripcion.pagado && (
                              <Link to={`/pagos/inscripcion/${inscripcion.id}`} className="text-green-600 hover:text-green-900">
                                Pagar
                              </Link>
                            )} */}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          
          {/* Sección de Pagos Recientes */}
          <div className="bg-white overflow-hidden shadow rounded-lg mt-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Pagos Recientes</h2>
                <button
                  onClick={handleOpenModal}
                  className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors flex items-center"
                >
                  <FaMoneyBillWave className="mr-2" /> Registrar Pago
                </button>
              </div>
              
              {pagos.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">No tiene pagos registrados.</p>
                  <p className="text-gray-500 mt-2">Haga clic en "Registrar Pago" para comenzar.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estudiante</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concepto</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pagos.slice(0, 5).map((pago) => (
                        <tr key={pago.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(pago.fechaPago || pago.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                            {pago.estudiante?.nombre || pago.estudiantes?.nombre || pago.estudianteInfo?.nombre || 'N/A'} {pago.estudiante?.apellido || pago.estudiantes?.apellido || pago.estudianteInfo?.apellido || ''}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {pago.arancel?.nombre || pago.aranceles?.nombre || pago.concepto || 'No especificado'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              ${parseFloat(pago.montoTotal || pago.monto).toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              pago.estado === 'pagado' ? 'bg-green-100 text-green-800' :
                              pago.estado === 'anulado' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {pago.estado.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {pagos.length > 5 && (
                    <div className="mt-4 text-center">
                      <Link to="/pagos" className="text-indigo-600 hover:text-indigo-900">
                        Ver todos los pagos
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Sección de Cupos Disponibles */}
          <div className="bg-white overflow-hidden shadow rounded-lg lg:col-span-2">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Cupos Disponibles</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacidad Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cupos Ocupados</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cupos Disponibles</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ocupación</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cuposResumen.map((cupo) => (
                      <tr key={cupo.gradoID}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{cupo.nombre_grado}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{cupo.totalCapacidad}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{cupo.totalOcupados}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{cupo.totalDisponibles}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${
                                cupo.porcentajeOcupacion > 90 ? 'bg-red-600' :
                                cupo.porcentajeOcupacion > 70 ? 'bg-yellow-600' :
                                'bg-green-600'
                              }`}
                              style={{ width: `${cupo.porcentajeOcupacion}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{cupo.porcentajeOcupacion}%</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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

export default RepresentanteDashboard;