import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaSearch, FaEye, FaFileInvoiceDollar, FaSave, FaTimes, FaCheck } from 'react-icons/fa';
import axios from 'axios';
import AdminLayout from '../layout/AdminLayout';

const PagosList = () => {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchRepresentante, setSearchRepresentante] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchType, setSearchType] = useState('representante'); // 'representante' o 'estudiante'
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [representantesFiltrados, setRepresentantesFiltrados] = useState([]);
  const [showRepresentanteDropdown, setShowRepresentanteDropdown] = useState(false);
  const [filteredPagos, setFilteredPagos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [annoEscolar, setAnnoEscolar] = useState(null);
  const [annoEscolarActivo, setAnnoEscolarActivo] = useState(null);
  
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
  const [selectedRepresentante, setSelectedRepresentante] = useState(null);
  const [selectedEstudiante, setSelectedEstudiante] = useState(null);
  const [pagosPendientes, setPagosPendientes] = useState([]);
  const [pagosRevisados, setPagosRevisados] = useState([]);
  const [tabActiva, setTabActiva] = useState('pendientes'); // 'pendientes' o 'revisados'

  // Estados para modal de detalles
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPago, setSelectedPago] = useState(null);


  
  // Estado para el formulario de nuevo pago
  const [formPago, setFormPago] = useState({
    estudianteID: '',
    representanteID: '',
    metodoPagoID: '',
    arancelID: '',
    inscripcionID: '',
    annoEscolarID: annoEscolar ? annoEscolar.id : '',
    monto: '',
    montoMora: '0',
    descuento: '0',
    mesPago: '',
    fechaPago: new Date().toISOString().split('T')[0],
    referencia: '',
    observaciones: ''
  });
  
  // Estado para el cálculo automático del monto total
  const [montoTotal, setMontoTotal] = useState('0');

  // Efecto para calcular el monto total automáticamente
  useEffect(() => {
    const monto = parseFloat(formPago.monto) || 0;
    const montoMora = parseFloat(formPago.montoMora) || 0;
    const descuento = parseFloat(formPago.descuento) || 0;
    
    const total = monto + montoMora - descuento;
    setMontoTotal(total.toFixed(2));
  }, [formPago.monto, formPago.montoMora, formPago.descuento]);
  
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
    // Actualizar el estado del representante seleccionado
    setSelectedRepresentante(representante);
    
    // Actualizar el formulario con el ID del representante
    setFormPago({
      ...formPago,
      representanteID: representante.id,
      estudianteID: ''
    });
    
    // Actualizar el campo de búsqueda
    setSearchRepresentante(`${representante.nombre} ${representante.apellido} - ${representante.cedula}`);
    
    // Ocultar el dropdown
    setShowRepresentanteDropdown(false);
    
    // Cargar los estudiantes del representante
    cargarEstudiantesDeRepresentante(representante.id);
  };

  const seleccionarEstudiante = (estudiante) => {
    setSelectedEstudiante(estudiante);
    
    // Buscar inscripción actual del estudiante
    const buscarInscripcionActual = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/inscripciones/estudiante/${estudiante.id}/actual`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        if (response.data) {
          setFormPago({
            ...formPago,
            estudianteID: estudiante.id,
            inscripcionID: response.data.id,
            annoEscolarID: response.data.annoEscolarID
          });
        } else {
          setFormPago({
            ...formPago,
            estudianteID: estudiante.id,
            inscripcionID: '',
            annoEscolarID: annoEscolarActivo ? annoEscolarActivo.id : ''
          });
        }
      } catch (err) {
        console.error('Error al buscar inscripción actual:', err);
        setFormPago({
          ...formPago,
          estudianteID: estudiante.id,
          inscripcionID: '',
          annoEscolarID: annoEscolarActivo ? annoEscolarActivo.id : ''
        });
      }
    };
    
    buscarInscripcionActual();
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
      
      // Obtener pagos
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
      const revisados = response.data.filter(pago => pago.estado === 'pagado' || pago.estado === 'anulado');
      
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

  // Función para cargar estudiantes de un representante
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
      const estudiantesData = response.data.map(inscripcion => ({
        ...inscripcion.estudiante,
        inscripcionID: inscripcion.id,
        gradoID: inscripcion.gradoID,
        seccionID: inscripcion.seccionID,
        annoEscolarID: inscripcion.annoEscolarID
      }));
      
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
  
  // Función para cargar datos necesarios para el modal
  const loadModalData = async () => {
    const token = localStorage.getItem('token');

    try {
      setLoadingRepresentantes(true);
      const representantesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas/tipo/representante`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setRepresentantes(Array.isArray(representantesResponse.data) ? representantesResponse.data : []);
      setLoadingRepresentantes(false);
    } catch (err) {
      console.error('Error al cargar representantes:', err);
      setRepresentantes([]);
      setLoadingRepresentantes(false);
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
      setAranceles([]);
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
      setMetodosPago([]);
      setLoadingMetodosPago(false);
    }
    
    // Obtener año escolar activo
    try {
      const annoResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/anno-escolar/actual`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setAnnoEscolarActivo(annoResponse.data);
      
      // Actualizar el formulario con el año escolar activo
      setFormPago(prev => ({
        ...prev,
        annoEscolarID: annoResponse.data ? annoResponse.data.id : ''
      }));
    } catch (err) {
      console.error('Error al cargar año escolar activo:', err);
    }
  };
  
  // Función para abrir el modal y cargar datos
  const handleOpenModal = () => {
    // Resetear el formulario
    setFormPago({
      estudianteID: '',
      representanteID: '',
      metodoPagoID: '',
      arancelID: '',
      inscripcionID: '',
      annoEscolarID: annoEscolarActivo ? annoEscolarActivo.id : '',
      monto: '',
      montoMora: '0',
      descuento: '0',
      mesPago: '',
      fechaPago: new Date().toISOString().split('T')[0],
      referencia: '',
      observaciones: ''
    });
    
    // Resetear estados
    setSelectedRepresentante(null);
    setSelectedEstudiante(null);
    setSearchRepresentante('');
    setComprobante(null);
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
      setComprobante(e.target.files[0]);
    } else {
      setComprobante(null);
    }
  };
  
  // Función para enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar campos obligatorios
    if (!formPago.representanteID || !formPago.estudianteID || !formPago.metodoPagoID || 
        !formPago.arancelID || !formPago.monto) {
      setError('Por favor, complete todos los campos obligatorios.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      
      // Crear FormData
      const formData = new FormData();
      
      // Añadir todos los campos del formulario
      formData.append('estudianteID', formPago.estudianteID);
      formData.append('representanteID', formPago.representanteID);
      formData.append('metodoPagoID', formPago.metodoPagoID);
      formData.append('arancelID', formPago.arancelID);
      formData.append('monto', formPago.monto);
      formData.append('montoTotal', montoTotal);
      
      // Añadir campos opcionales solo si tienen valor
      if (formPago.annoEscolarID) formData.append('annoEscolarID', formPago.annoEscolarID);
      if (formPago.inscripcionID) formData.append('inscripcionID', formPago.inscripcionID);
      if (formPago.montoMora && formPago.montoMora !== '0') formData.append('montoMora', formPago.montoMora);
      if (formPago.descuento && formPago.descuento !== '0') formData.append('descuento', formPago.descuento);
      if (formPago.mesPago) formData.append('mesPago', formPago.mesPago);
      if (formPago.fechaPago) formData.append('fechaPago', formPago.fechaPago);
      if (formPago.referencia) formData.append('referencia', formPago.referencia);
      if (formPago.observaciones) formData.append('observaciones', formPago.observaciones);
      
      // Añadir comprobante si existe
      if (comprobante) {
        formData.append('comprobante', comprobante);
      }
      
      // Imprimir el contenido del FormData para depuración
      console.log("Datos a enviar:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
      
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
      
      console.log("Respuesta del servidor:", response.data);
      
      setSuccess('Pago registrado correctamente');
      setShowModal(false);
      
      // Recargar la lista de pagos
      fetchPagos();
      
      // Limpiar el formulario
      setFormPago({
        estudianteID: '',
        representanteID: '',
        metodoPagoID: '',
        arancelID: '',
        inscripcionID: '',
        annoEscolarID: annoEscolar ? annoEscolar.id : '',
        monto: '',
        montoMora: '0',
        descuento: '0',
        mesPago: '',
        fechaPago: new Date().toISOString().split('T')[0],
        referencia: '',
        observaciones: ''
      });
      setMontoTotal('0');
      setSelectedRepresentante(null);
      setSelectedEstudiante(null);
      setComprobante(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error al registrar pago:', err);
      setError(err.response?.data?.message || 'Error al procesar la solicitud. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };
  
  // Función para actualizar el estado de un pago
  const handleUpdateEstado = async (pagoId, nuevoEstado) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/pagos/${pagoId}/estado`,
        { estado: nuevoEstado },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setSuccess(`Estado del pago actualizado a: ${nuevoEstado}`);
      
      // Recargar la lista de pagos
      fetchPagos();
      
      setLoading(false);
    } catch (err) {
      console.error('Error al actualizar estado del pago:', err);
      setError(err.response?.data?.message || 'Error al actualizar el estado del pago. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };
  

  
  // Función para eliminar un pago
  const handleDeletePago = async (pagoId) => {
    if (!confirm('¿Está seguro de que desea eliminar este pago? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.delete(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/pagos/${pagoId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setSuccess('Pago eliminado correctamente');
      
      // Recargar la lista de pagos
      fetchPagos();
      
      setLoading(false);
    } catch (err) {
      console.error('Error al eliminar pago:', err);
      setError(err.response?.data?.message || 'Error al eliminar el pago. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };
  
  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPagos.slice(indexOfFirstItem, indexOfLastItem);
  
  // Cambiar de página
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
    if (monto === null || monto === undefined) return 'N/A';
    return `$${parseFloat(monto).toFixed(2)}`;
  };

  const handlePreviewComprobante = (pago) => {
    if (pago && pago.urlComprobante) {
      window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${pago.urlComprobante}`, '_blank');
    }
  };
  // Función para abrir el modal con los detalles del pago
  const handleOpenDetailModal = async (pagoId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/pagos/${pagoId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setSelectedPago(response.data);
      setShowDetailModal(true);
      setLoading(false);
    } catch (err) {
      console.error('Error al cargar detalles del pago:', err);
      setError(err.response?.data?.message || 'Error al cargar los detalles del pago. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };

  // Función para cerrar el modal
  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedPago(null);
  };

  


  
  return (
     
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Gestión de Pagos</h1>
          <button
            onClick={handleOpenModal}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FaPlus className="mr-2" /> Registrar Nuevo Pago
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
        
        {/* Barra de búsqueda */}
        <div className="mb-6">
          <div className="flex items-center">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Buscar por nombre, cédula, referencia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Pestañas para filtrar por estado */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => cambiarTab('pendientes')}
              className={`${
                tabActiva === 'pendientes'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Pendientes ({pagosPendientes.length})
            </button>
            <button
              onClick={() => cambiarTab('revisados')}
              className={`${
                tabActiva === 'revisados'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Revisados ({pagosRevisados.length})
            </button>
          </nav>
        </div>
        
        {/* Tabla de pagos */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Método
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-4 text-center text-sm text-gray-500">
                      No se encontraron pagos
                    </td>
                  </tr>
                ) : (
                  currentItems.map((pago) => (
                    <tr key={pago.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {pago.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {pago.estudiantes ? `${pago.estudiantes.nombre} ${pago.estudiantes.apellido}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {pago.representantes ? `${pago.representantes.nombre} ${pago.representantes.apellido}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {pago.aranceles ? pago.aranceles.nombre : 'N/A'}
                        {pago.mesPago ? ` (${pago.mesPago})` : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatMonto(pago.montoTotal)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(pago.fechaPago)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          pago.estado === 'pagado' ? 'bg-green-100 text-green-800' : 
                          pago.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {pago.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {pago.metodoPagos ? pago.metodoPagos.nombre : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleOpenDetailModal(pago.id)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Ver detalles"
                          >
                            <FaEye />
                          </button>
                          
                          {pago.estado === 'pendiente' && (
                            <button
                              onClick={() => handleUpdateEstado(pago.id, 'pagado')}
                              className="text-green-600 hover:text-green-900"
                              title="Marcar como pagado"
                            >
                              <FaFileInvoiceDollar />
                            </button>
                          )}
                          
                          {pago.estado === 'pendiente' && (
                            <button
                              onClick={() => handleUpdateEstado(pago.id, 'anulado')}
                              className="text-red-600 hover:text-red-900"
                              title="Anular pago"
                            >
                              <FaTimes />
                            </button>
                          )}
                          
                          {pago.urlComprobante && (
                            <button
                              onClick={() => handlePreviewComprobante(pago)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Ver comprobante"
                            >
                              <FaFileInvoiceDollar />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Paginación */}
        {filteredPagos.length > itemsPerPage && (
          <div className="mt-4 flex justify-center">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
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
                    currentPage === index + 1 ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              
              <button
                onClick={() => paginate(currentPage < Math.ceil(filteredPagos.length / itemsPerPage) ? currentPage + 1 : Math.ceil(filteredPagos.length / itemsPerPage))}
                disabled={currentPage === Math.ceil(filteredPagos.length / itemsPerPage)}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span className="sr-only">Siguiente</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        )}
        
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
                        <form onSubmit={handleSubmit} className="space-y-6">
                          {/* Sección de Representante y Estudiante */}
                          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                            <div className="sm:col-span-6">
                              <label htmlFor="representante" className="block text-sm font-medium text-gray-700">
                                Representante <span className="text-red-500">*</span>
                              </label>
                              <div className="mt-1 relative">
                                <input
                                  type="text"
                                  id="representante"
                                  placeholder="Buscar representante por nombre o cédula"
                                  value={searchRepresentante}
                                  onChange={(e) => filtrarRepresentantes(e.target.value)}
                                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                  required
                                />
                                
                                {showRepresentanteDropdown && representantesFiltrados.length > 0 && (
                                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto max-h-60">
                                    {representantesFiltrados.map((rep) => (
                                      <div
                                        key={rep.id}
                                        onClick={() => seleccionarRepresentante(rep)}
                                        className="cursor-pointer hover:bg-gray-100 py-2 px-4"
                                      >
                                        {rep.nombre} {rep.apellido} - {rep.cedula}
                                      </div>
                                    ))}
                                  </div>
                                )}
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
                                  onChange={(e) => {
                                    const estudianteID = e.target.value;
                                    setFormPago({
                                      ...formPago,
                                      estudianteID
                                    });
                                    
                                    // Buscar el estudiante seleccionado
                                    const estudiante = estudiantes.find(est => est.id.toString() === estudianteID);
                                    if (estudiante) {
                                      seleccionarEstudiante(estudiante);
                                    }
                                  }}
                                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                  required
                                  disabled={!formPago.representanteID || loadingEstudiantes}
                                >
                                  <option value="">Seleccione un estudiante</option>
                                  {estudiantes.map((est) => (
                                    <option key={est.id} value={est.id}>
                                      {est.nombre} {est.apellido} - {est.cedula}
                                    </option>
                                  ))}
                                </select>
                                
                                {loadingEstudiantes && (
                                  <div className="mt-2 flex justify-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-indigo-500"></div>
                                  </div>
                                )}
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
                                  value={formPago.metodoPagoID}
                                  onChange={(e) => {
                                    setFormPago({
                                      ...formPago,
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
                                  value={formPago.monto}
                                  onChange={(e) => {
                                    setFormPago({
                                      ...formPago,
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
                                  value={formPago.montoMora}
                                  onChange={(e) => {
                                    setFormPago({
                                      ...formPago,
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
                                  value={formPago.descuento}
                                  onChange={(e) => {
                                    setFormPago({
                                      ...formPago,
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
                                  value={`$${montoTotal}`}
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
                                  value={formPago.mesPago}
                                  onChange={(e) => {
                                    setFormPago({
                                      ...formPago,
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
                                  value={formPago.fechaPago}
                                  onChange={(e) => {
                                    setFormPago({
                                      ...formPago,
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
                                  value={formPago.referencia}
                                  onChange={(e) => {
                                    setFormPago({
                                      ...formPago,
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
                                  value={formPago.observaciones}
                                  onChange={(e) => {
                                    setFormPago({
                                      ...formPago,
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
                    onClick={handleSubmit}
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
                        <FaSave className="mr-2" /> Registrar Pago
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Detalles del Pago */}
        {showDetailModal && selectedPago && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                          Detalles del Pago #{selectedPago.id}
                        </h3>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          selectedPago.estado === 'pagado' ? 'bg-green-100 text-green-800' : 
                          selectedPago.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {selectedPago.estado.charAt(0).toUpperCase() + selectedPago.estado.slice(1)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Información del Estudiante */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-md font-medium text-gray-900 mb-2">Información del Estudiante</h4>
                          {selectedPago.estudiante ? (
                            <div className="space-y-2">
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">Nombre:</span> {selectedPago.estudiante.nombre} {selectedPago.estudiante.apellido}
                              </p>
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">Cédula:</span> {selectedPago.estudiante.cedula}
                              </p>
                              {selectedPago.inscripcion && selectedPago.inscripcion.grado && (
                                <p className="text-sm text-gray-700">
                                  <span className="font-medium">Grado:</span> {selectedPago.inscripcion.grado.nombre_grado}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No hay información disponible</p>
                          )}
                        </div>
                        
                        {/* Información del Pago */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-md font-medium text-gray-900 mb-2">Información del Pago</h4>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Concepto:</span> {selectedPago.arancel ? selectedPago.arancel.nombre : selectedPago.concepto || '-'}
                            </p>
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Monto:</span> {formatMonto(selectedPago.monto)}
                            </p>
                            {selectedPago.montoMora > 0 && (
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">Mora:</span> {formatMonto(selectedPago.montoMora)}
                              </p>
                            )}
                            {selectedPago.descuento > 0 && (
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">Descuento:</span> {formatMonto(selectedPago.descuento)}
                              </p>
                            )}
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Método de Pago:</span> {selectedPago.metodoPago ? selectedPago.metodoPago.nombre : '-'}
                            </p>
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Referencia:</span> {selectedPago.referencia || '-'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Fechas */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-md font-medium text-gray-900 mb-2">Fechas</h4>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Fecha de Pago:</span> {formatDate(selectedPago.fechaPago)}
                            </p>
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Fecha de Registro:</span> {formatDate(selectedPago.createdAt)}
                            </p>
                            {selectedPago.updatedAt && selectedPago.updatedAt !== selectedPago.createdAt && (
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">Última Actualización:</span> {formatDate(selectedPago.updatedAt)}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Observaciones */}
                        {selectedPago.observaciones && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="text-md font-medium text-gray-900 mb-2">Observaciones</h4>
                            <p className="text-sm text-gray-700">{selectedPago.observaciones}</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Comprobante de Pago */}
                      {selectedPago.urlComprobante && (
                        <div className="mt-6">
                          <h4 className="text-md font-medium text-gray-900 mb-2">Comprobante de Pago</h4>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-700">
                                {selectedPago.urlComprobante.split('/').pop()}
                              </p>
                              <button
                                onClick={() => handlePreviewComprobante(selectedPago)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                <FaEye className="mr-1" /> Ver Comprobante
                              </button>
                            </div>
                            
                            {/* Vista previa del comprobante (si es una imagen) */}
                            {selectedPago.urlComprobante && 
                            (selectedPago.urlComprobante.toLowerCase().endsWith('.jpg') || 
                              selectedPago.urlComprobante.toLowerCase().endsWith('.jpeg') || 
                              selectedPago.urlComprobante.toLowerCase().endsWith('.png')) && (
                              <div className="mt-4 flex justify-center">
                                <img 
                                  src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${selectedPago.urlComprobante}`}
                                  alt="Comprobante de pago"
                                  className="max-h-64 object-contain border rounded"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Acciones para el pago */}
                      {selectedPago.estado === 'pendiente' && (
                        <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
                          <h4 className="text-md font-medium text-yellow-800 mb-2">Acciones Disponibles</h4>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                handleUpdateEstado(selectedPago.id, 'pagado');
                                handleCloseDetailModal();
                              }}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              <FaCheck className="mr-2" /> Aprobar Pago
                            </button>
                            <button
                              onClick={() => {
                                handleUpdateEstado(selectedPago.id, 'anulado');
                                handleCloseDetailModal();
                              }}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <FaTimes className="mr-2" /> Rechazar Pago
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={handleCloseDetailModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
     
  );
};

export default PagosList;