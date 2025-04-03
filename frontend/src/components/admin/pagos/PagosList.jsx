import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaSearch, FaEye, FaFileInvoiceDollar, FaSave, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import AdminLayout from '../layout/AdminLayout';

const PagosList = () => {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchRepresentante, setSearchRepresentante] = useState('');
  const [representantesFiltrados, setRepresentantesFiltrados] = useState([]);
  const [showRepresentanteDropdown, setShowRepresentanteDropdown] = useState(false);
  const [filteredPagos, setFilteredPagos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [annoEscolar, setAnnoEscolar] = useState(null);
  
  // Estados para el modal de nuevo pago
  const [showModal, setShowModal] = useState(false);
  const [estudiantes, setEstudiantes] = useState([]);
  const [aranceles, setAranceles] = useState([]);
  const [metodosPago, setMetodosPago] = useState([]);
  const [loadingEstudiantes, setLoadingEstudiantes] = useState(false);
  const [loadingAranceles, setLoadingAranceles] = useState(false);
  const [loadingMetodosPago, setLoadingMetodosPago] = useState(false);
  const [comprobante, setComprobante] = useState(null);
  const fileInputRef = useRef(null);
  const [representantes, setRepresentantes] = useState([]);
  const [loadingRepresentantes, setLoadingRepresentantes] = useState(false);
  const [representanteSeleccionado, setRepresentanteSeleccionado] = useState('');
  const [pagosPendientes, setPagosPendientes] = useState([]);
  const [pagosRevisados, setPagosRevisados] = useState([]);
  const [tabActiva, setTabActiva] = useState('pendientes'); // 'pendientes' o 'revisados'

  
  // Estado para el formulario de nuevo pago
  const [formData, setFormData] = useState({
    estudianteID: '',
    representanteID: '',
    arancelID: '',
    metodoPagoID: '',
    monto: '',
    referencia: '',
    fechaPago: new Date().toISOString().split('T')[0],
    observaciones: '',
    estado: 'pendiente'
  });
  
  // Cargar pagos al montar el componente
  useEffect(() => {
    fetchPagos();
  }, []);

  
    // Función para filtrar representantes según el término de búsqueda
    const filtrarRepresentantes = (term) => {
    setSearchRepresentante(term);
    
    if (!term.trim()) {
      setRepresentantesFiltrados([]);
      setShowRepresentanteDropdown(false);
      return;
    }
    
    const termLower = term.toLowerCase();
    const filtered = representantes.filter(rep => 
      rep.nombre.toLowerCase().includes(termLower) || 
      rep.apellido.toLowerCase().includes(termLower) || 
      rep.cedula.toLowerCase().includes(termLower)
    );
    
    setRepresentantesFiltrados(filtered);
    setShowRepresentanteDropdown(true);
  };
  
  // Función para seleccionar un representante
  const seleccionarRepresentante = (representante) => {
    setFormData({
      ...formData,
      representanteID: representante.id,
      estudianteID: ''
    });
    setSearchRepresentante(`${representante.nombre} ${representante.apellido} - ${representante.cedula}`);
    setShowRepresentanteDropdown(false);
    cargarEstudiantesDeRepresentante(representante.id);
  };
  
  // Filtrar pagos cuando cambia el término de búsqueda
  useEffect(() => {
    if (tabActiva === 'pendientes') {
        if (searchTerm.trim() === '') {
          setFilteredPagos(pagosPendientes);
        } else {
          const filtered = pagosPendientes.filter(pago => 
            (pago.estudiante && pago.estudiante.nombre && pago.estudiante.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (pago.estudiante && pago.estudiante.apellido && pago.estudiante.apellido.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (pago.estudiante && pago.estudiante.cedula && pago.estudiante.cedula.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (pago.referencia && pago.referencia.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (pago.id && pago.id.toString().toLowerCase().includes(searchTerm.toLowerCase()))
          );
          setFilteredPagos(filtered);
        }
      } else {
        if (searchTerm.trim() === '') {
          setFilteredPagos(pagosRevisados);
        } else {
          const filtered = pagosRevisados.filter(pago => 
            (pago.estudiante && pago.estudiante.nombre && pago.estudiante.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (pago.estudiante && pago.estudiante.apellido && pago.estudiante.apellido.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (pago.estudiante && pago.estudiante.cedula && pago.estudiante.cedula.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (pago.referencia && pago.referencia.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (pago.id && pago.id.toString().toLowerCase().includes(searchTerm.toLowerCase()))
          );
          setFilteredPagos(filtered);
        }
      }
      setCurrentPage(1);
    }, [searchTerm, pagosPendientes, pagosRevisados, tabActiva]);
  
  // Función para cargar pagos
  const fetchPagos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Obtener año escolar activo
      const annoResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/anno-escolar/actual`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setAnnoEscolar(annoResponse.data);
      
      // Obtener pagos - asegúrate de que esta ruta sea correcta
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/pagos`,
        { 
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      console.log('Pagos obtenidos:', response.data); // Para depuración
      
      // Si no hay pagos, establecer arrays vacíos
      if (!response.data || !Array.isArray(response.data)) {
        setPagosPendientes([]);
        setPagosRevisados([]);
        setPagos([]);
        setFilteredPagos([]);
        setLoading(false);
        return;
      }
      
      // Separar pagos por estado de revisión
      const pendientes = response.data.filter(pago => pago.estado === 'pendiente');
      const revisados = response.data.filter(pago => pago.estado === 'completado' || pago.estado === 'rechazado');
      
      setPagosPendientes(pendientes);
      setPagosRevisados(revisados);
      setPagos(response.data);
      
      // Filtrar según la pestaña activa
      if (tabActiva === 'pendientes') {
        setFilteredPagos(pendientes);
      } else {
        setFilteredPagos(revisados);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error al cargar pagos:', err);
      setError('Error al cargar los pagos. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };
  
  // Añadir función para cambiar de pestaña
  const cambiarTab = (tab) => {
    setTabActiva(tab);
    if (tab === 'pendientes') {
      setFilteredPagos(pagosPendientes);
    } else {
      setFilteredPagos(pagosRevisados);
    }
    setCurrentPage(1);
  };
  
  // Función para cargar datos necesarios para el modal
  const loadModalData = async () => {
    const token = localStorage.getItem('token');

    try {
        setLoadingRepresentantes(true);
        const representantesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas`,
          { headers: { 'Authorization': `Bearer ${token}` },
          params: { tipo: 'representante' } 
        }
        );
        setRepresentantes(Array.isArray(representantesResponse.data) ? representantesResponse.data : []);
        setLoadingRepresentantes(false);
      } catch (err) {
        console.error('Error al cargar representantes:', err);
        setRepresentantes([]);
        setLoadingRepresentantes(false);
      }
      
      // Añadir una función para cargar estudiantes de un representante
      const cargarEstudiantesDeRepresentante = async (representanteID) => {
        if (!representanteID) {
          setEstudiantes([]);
          return;
        }
        
        try {
          setLoadingEstudiantes(true);
          const token = localStorage.getItem('token');
          
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/inscripciones/representante/${representanteID}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          
          // Extraer estudiantes de las inscripciones
          const estudiantesData = response.data.map(inscripcion => inscripcion.estudiante);
          
          // Eliminar duplicados (si un estudiante tiene múltiples inscripciones)
          const estudiantesUnicos = estudiantesData.filter((estudiante, index, self) =>
            index === self.findIndex((e) => e.id === estudiante.id)
          );
          
          setEstudiantes(estudiantesUnicos);
          setLoadingEstudiantes(false);
        } catch (err) {
          console.error('Error al cargar estudiantes del representante:', err);
          setEstudiantes([]);
          setLoadingEstudiantes(false);
        }
      };
    
    // Cargar estudiantes
    try {
        setLoadingEstudiantes(true);
        const estudiantesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas/tipo/estudiante`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        // Asegurarse de que estudiantes sea un array
        setEstudiantes(Array.isArray(estudiantesResponse.data) ? estudiantesResponse.data : []);
        setLoadingEstudiantes(false);
      } catch (err) {
        console.error('Error al cargar estudiantes:', err);
        setEstudiantes([]); // Establecer un array vacío en caso de error
        setLoadingEstudiantes(false);
      }
    
    // Cargar aranceles
    try {
      setLoadingAranceles(true);
      const arancelesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/aranceles`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setAranceles(arancelesResponse.data.filter(arancel => arancel.activo));
      setLoadingAranceles(false);
    } catch (err) {
      console.error('Error al cargar aranceles:', err);
      setLoadingAranceles(false);
    }
    
    // Cargar métodos de pago
    try {
      setLoadingMetodosPago(true);
      const metodosResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/metodos-pago`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setMetodosPago(metodosResponse.data.filter(metodo => metodo.activo));
      setLoadingMetodosPago(false);
    } catch (err) {
      console.error('Error al cargar métodos de pago:', err);
      setLoadingMetodosPago(false);
    }
  };
  
  // Abrir modal para nuevo pago
  const handleOpenModal = () => {
    setFormData({
      estudianteID: '',
      arancelID: '',
      metodoPagoID: '',
      monto: '',
      referencia: '',
      fechaPago: new Date().toISOString().split('T')[0],
      observaciones: '',
      estado: 'pendiente'
    });
    setComprobante(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    loadModalData();
    setShowModal(true);
  };
  
  // Cerrar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setError('');
  };
  
  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'representanteID') {
      setFormData({
        ...formData,
        representanteID: value,
        estudianteID: '' // Resetear estudiante al cambiar representante
      });
      cargarEstudiantesDeRepresentante(value);
      return;
    }
    
    // Si cambia el arancel, actualizar el monto automáticamente
    if (name === 'arancelID' && value) {
      const arancel = aranceles.find(a => a.id === parseInt(value));
      if (arancel && arancel.monto) {
        setFormData({
          ...formData,
          [name]: value,
          monto: arancel.monto
        });
        return;
      }
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  
  // Manejar cambio de archivo
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setComprobante(e.target.files[0]);
    } else {
      setComprobante(null);
    }
  };
  
  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar campos obligatorios
    if (!formData.estudianteID || !formData.arancelID || !formData.metodoPagoID || !formData.monto || !formData.fechaPago) {
      setError('Por favor, complete todos los campos obligatorios.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      
      // Crear FormData para enviar archivos si es necesario
      const formDataToSend = new FormData();
      
      // Añadir datos del pago
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formDataToSend.append(key, value);
        }
      });
      
      // Añadir año escolar
      if (annoEscolar && annoEscolar.id) {
        formDataToSend.append('annoEscolarID', annoEscolar.id);
      }
      
      // Añadir comprobante si existe
      if (comprobante) {
        formDataToSend.append('comprobante', comprobante);
      }
      
      // Enviar datos al servidor
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/pagos`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Actualizar lista de pagos
      fetchPagos();
      
      // Mostrar mensaje de éxito
      setSuccess('Pago registrado correctamente');
      
      // Cerrar modal
      setShowModal(false);
      
      // Limpiar mensaje de éxito después de 3 segundos
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
  
  // Calcular índices para paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPagos.slice(indexOfFirstItem, indexOfLastItem);
  
  // Cambiar página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Formatear monto
  const formatAmount = (amount) => {
    if (amount === undefined || amount === null) return '-';
    return amount.toLocaleString('es-VE', { style: 'currency', currency: 'VES' });
  };
  
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Pagos</h1>
          <div className="flex space-x-3">
            <Link
              to="/admin/aranceles"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FaFileInvoiceDollar className="mr-2" /> Gestionar Aranceles
            </Link>
            <button
              onClick={handleOpenModal}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FaPlus className="mr-2" /> Registrar Pago
            </button>
          </div>
        </div>
        
        {/* Año escolar activo */}
        {annoEscolar && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaFileInvoiceDollar className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Año Escolar Activo: <span className="font-semibold">{annoEscolar.periodo}</span>
                </p>
              </div>
            </div>
          </div>
        )}
        
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
        
        {/* Barra de búsqueda */}
        <div className="mb-6">
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="search"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Buscar por nombre, apellido, cédula o referencia..."
            />
          </div>
        </div>
        
        {/* Tabla de pagos */}
        <div className="mb-6">
        <div className="border-b border-gray-200">
            <nav className="-mb-px flex" aria-label="Tabs">
            <button
                onClick={() => cambiarTab('pendientes')}
                className={`${
                tabActiva === 'pendientes'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm mr-8`}
            >
                Pagos Pendientes
                {pagosPendientes.length > 0 && (
                <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium ${
                    tabActiva === 'pendientes' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
                }`}>
                    {pagosPendientes.length}
                </span>
                )}
            </button>
            <button
                onClick={() => cambiarTab('revisados')}
                className={`${
                tabActiva === 'revisados'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
        Pagos Revisados
        {pagosRevisados.length > 0 && (
          <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium ${
            tabActiva === 'revisados' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {pagosRevisados.length}
          </span>
        )}
      </button>
    </nav>
  </div>
        </div>

        {/* Título de la tabla según la pestaña activa */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">
            {tabActiva === 'pendientes' ? 'Pagos Pendientes de Revisión' : 'Pagos Revisados'}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {tabActiva === 'pendientes' 
                ? 'Pagos que requieren verificación y procesamiento.' 
                : 'Pagos que ya han sido procesados (completados o rechazados).'}
            </p>
        </div>
        
        {loading && filteredPagos.length === 0 ? (
            <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        ) : (
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estudiante
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Representante
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Concepto
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                    </th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.length === 0 ? (
                    <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                        {tabActiva === 'pendientes' 
                        ? 'No hay pagos pendientes de revisión' 
                        : 'No hay pagos revisados'}
                    </td>
                    </tr>
                ) : (
                    currentItems.map((pago) => (
                    <tr key={pago.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {pago.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <div>
                            <div className="text-sm font-medium text-gray-900">
                                {pago.estudiante ? `${pago.estudiante.nombre} ${pago.estudiante.apellido}` : '-'}
                            </div>
                            <div className="text-sm text-gray-500">
                                {pago.estudiante ? pago.estudiante.cedula : '-'}
                            </div>
                            </div>
                        </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <div>
                            <div className="text-sm font-medium text-gray-900">
                                {pago.representante ? `${pago.representante.nombre} ${pago.representante.apellido}` : '-'}
                            </div>
                            <div className="text-sm text-gray-500">
                                {pago.representante ? pago.representante.cedula : '-'}
                            </div>
                            </div>
                        </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {pago.arancel ? pago.arancel.nombre : pago.concepto || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatAmount(pago.monto)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(pago.fechaPago)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            pago.estado === 'completado' ? 'bg-green-100 text-green-800' : 
                            pago.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                            pago.estado === 'rechazado' ? 'bg-red-100 text-red-800' : 
                            'bg-gray-100 text-gray-800'
                        }`}>
                            {pago.estado ? pago.estado.charAt(0).toUpperCase() + pago.estado.slice(1) : 'Desconocido'}
                        </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                            to={`/admin/pagos/${pago.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                        >
                            <FaEye className="inline mr-1" /> Ver
                        </Link>
                        </td>
                    </tr>
                    ))
                )}
                </tbody>
            </table>
            </div>
        )}

         {/* Paginación */}
        {filteredPagos.length > itemsPerPage && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{indexOfFirstItem + 1}</span> a <span className="font-medium">
                    {indexOfLastItem > filteredPagos.length ? filteredPagos.length : indexOfLastItem}
                    </span> de <span className="font-medium">{filteredPagos.length}</span> resultados
                </p>
                </div>
                <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                        currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                    >
                    <span className="sr-only">Anterior</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    </button>
                    
                    {Array.from({ length: Math.ceil(filteredPagos.length / itemsPerPage) }).map((_, index) => (
                    <button
                        key={index}
                        onClick={() => paginate(index + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === index + 1
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        {index + 1}
                    </button>
                    ))}
                    
                    <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === Math.ceil(filteredPagos.length / itemsPerPage)}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                        currentPage === Math.ceil(filteredPagos.length / itemsPerPage) ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                    >
                    <span className="sr-only">Siguiente</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    </button>
                </nav>
                </div>
            </div>
            </div>
        )}
        </div>
        
{/* Modal para registrar nuevo pago */}
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
                Registrar Nuevo Pago
              </h3>
              <div className="mt-2">
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                <label htmlFor="representanteSearch" className="block text-sm font-medium text-gray-700">
                    Representante <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                    <input
                    type="text"
                    id="representanteSearch"
                    value={searchRepresentante}
                    onChange={(e) => filtrarRepresentantes(e.target.value)}
                    onFocus={() => {
                        if (searchRepresentante.trim()) {
                        setShowRepresentanteDropdown(true);
                        }
                    }}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Buscar por nombre, apellido o cédula..."
                    required
                    />
                    
                    {showRepresentanteDropdown && representantesFiltrados.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                        {representantesFiltrados.map(representante => (
                        <div
                            key={representante.id}
                            className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50"
                            onClick={() => seleccionarRepresentante(representante)}
                        >
                            <div className="flex items-center">
                            <span className="font-normal block truncate">
                                {representante.nombre} {representante.apellido} - {representante.cedula}
                            </span>
                            </div>
                        </div>
                        ))}
                    </div>
                    )}
                    
                    {searchRepresentante && !showRepresentanteDropdown && (
                    <input
                        type="hidden"
                        name="representanteID"
                        value={formData.representanteID}
                        required
                    />
                    )}
                </div>
                {loadingRepresentantes && (
                    <p className="mt-1 text-xs text-gray-500">
                    Cargando representantes...
                    </p>
                )}
                </div>
                    
                <div className="sm:col-span-6">
                    <label htmlFor="estudianteID" className="block text-sm font-medium text-gray-700">
                        Estudiante <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                        {!formData.representanteID ? (
                        <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded-md">
                            Primero seleccione un representante
                        </div>
                        ) : loadingEstudiantes ? (
                        <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded-md">
                            Cargando estudiantes...
                        </div>
                        ) : estudiantes.length === 0 ? (
                        <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded-md">
                            No hay estudiantes asociados a este representante
                        </div>
                        ) : (
                        <select
                            id="estudianteID"
                            name="estudianteID"
                            value={formData.estudianteID}
                            onChange={handleChange}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            required
                        >
                            <option value="">Seleccione un estudiante</option>
                            {estudiantes.map(estudiante => (
                            <option key={estudiante.id} value={estudiante.id}>
                                {estudiante.nombre} {estudiante.apellido} - {estudiante.cedula} 
                                {estudiante.grado ? ` - ${estudiante.grado.nombre_grado}` : ''}
                                {estudiante.seccion ? ` "${estudiante.seccion.nombre_seccion}"` : ''}
                            </option>
                            ))}
                        </select>
                        )}
                    </div>
                </div>


                    <div className="sm:col-span-6">
                    <label htmlFor="arancelID" className="block text-sm font-medium text-gray-700">
                        Concepto de Pago <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                        <select
                        id="arancelID"
                        name="arancelID"
                        value={formData.arancelID}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        required
                        >
                        <option value="">Seleccione un concepto</option>
                        {loadingAranceles ? (
                            <option disabled>Cargando conceptos...</option>
                        ) : (
                            Array.isArray(aranceles) ? aranceles.map(arancel => (
                            <option key={arancel.id} value={arancel.id}>
                                {arancel.nombre} - {arancel.monto.toLocaleString('es-VE', { style: 'currency', currency: 'VES' })}
                            </option>
                            )) : <option disabled>No hay conceptos disponibles</option>
                        )}
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
                        name="monto"
                        id="monto"
                        value={formData.monto}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        required
                        step="0.01"
                        min="0"
                        />
                    </div>
                    </div>

                    <div className="sm:col-span-3">
                    <label htmlFor="fechaPago" className="block text-sm font-medium text-gray-700">
                        Fecha de Pago <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                        <input
                        type="date"
                        name="fechaPago"
                        id="fechaPago"
                        value={formData.fechaPago}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        required
                        />
                    </div>
                    </div>

                    <div className="sm:col-span-6">
                    <label htmlFor="metodoPagoID" className="block text-sm font-medium text-gray-700">
                        Método de Pago <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                        <select
                        id="metodoPagoID"
                        name="metodoPagoID"
                        value={formData.metodoPagoID}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        required
                        >
                        <option value="">Seleccione un método de pago</option>
                        {loadingMetodosPago ? (
                            <option disabled>Cargando métodos de pago...</option>
                        ) : (
                            Array.isArray(metodosPago) ? metodosPago.map(metodo => (
                            <option key={metodo.id} value={metodo.id}>
                                {metodo.nombre}
                            </option>
                            )) : <option disabled>No hay métodos de pago disponibles</option>
                        )}
                        </select>
                    </div>
                    </div>

                    <div className="sm:col-span-6">
                    <label htmlFor="referencia" className="block text-sm font-medium text-gray-700">
                        Referencia
                    </label>
                    <div className="mt-1">
                        <input
                        type="text"
                        name="referencia"
                        id="referencia"
                        value={formData.referencia}
                        onChange={handleChange}
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
                        name="comprobante"
                        id="comprobante"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        accept=".pdf,.jpg,.jpeg,.png"
                        />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                        Formatos aceptados: PDF, JPG, JPEG, PNG
                    </p>
                    </div>

                    <div className="sm:col-span-6">
                    <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
                        Estado
                    </label>
                    <div className="mt-1">
                        <select
                        id="estado"
                        name="estado"
                        value={formData.estado}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        >
                        <option value="pendiente">Pendiente</option>
                        <option value="completado">Completado</option>
                        <option value="rechazado">Rechazado</option>
                        </select>
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
                        value={formData.observaciones}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        ></textarea>
                    </div>
                    </div>
                                    </div>
                                    
                                    {error && (
                                        <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
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
                                    </form>
                                </div>
                                </div>
                            </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
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
                                    <FaSave className="mr-2" /> Guardar
                                </span>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            >
                                <FaTimes className="mr-2" /> Cancelar
                            </button>
                            </div>
                        </div>
                        </div>
                    </div>
                    )}

      </div>
    </AdminLayout>
  );
};

export default PagosList;
