import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaSearch, FaEye, FaFileInvoiceDollar, FaSave, FaTimes, FaCheck, FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';
import HeaderStats from './components/HeaderStats';
import MonthlySummaryModal from './components/MonthlySummaryModal.jsx';
import PaymentItem from './components/PaymentItem';
import PaymentsList from './components/PaymentsList.jsx';
import PaymentDetailModal from './components/PaymentDetailModal';
import MensualidadesTable from './components/MensualidadesTable';
import ConfiguracionPagosPanel from './components/PagosConfigPanel.jsx';
import PagosConfigModal from './components/PagosConfigModal.jsx';
import { formatearNombreGrado } from '../../../utils/formatters'

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

  // Filtros
  const [estadoFilter, setEstadoFilter] = useState('todos'); // 'todos' | 'pendientes' | 'reportados' | 'aprobados'
  const [gradoFilter, setGradoFilter] = useState('todos');
  const [seccionFilter, setSeccionFilter] = useState('todos');
  const [mesFilter, setMesFilter] = useState('todos'); // 1..12
  const [anioFilter, setAnioFilter] = useState('todos');

  // Config de pagos (para fecha vencimiento, mora, precios)
  const [configPagos, setConfigPagos] = useState(null);
  
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
  const [pagosAprobados, setPagosAprobados] = useState([]);
  const [pagosReportados, setPagosReportados] = useState([]);
  const [tabActiva, setTabActiva] = useState('pendientes'); // 'pendientes' | 'reportados' | 'aprobados' | 'mensualidades' | 'configuracion'
  const [viewMode, setViewMode] = useState('list'); // 'cards' | 'list'
  const [groupBy, setGroupBy] = useState(false); // agrupar por grado/sección
  const [showFilters, setShowFilters] = useState(false);
  const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

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
  const [showMonthlySummary, setShowMonthlySummary] = useState(false);
  const [selectedMes, setSelectedMes] = useState(new Date().getMonth()+1);
  const [selectedAnio, setSelectedAnio] = useState(new Date().getFullYear());
  const [showConfigModal, setShowConfigModal] = useState(false);

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

  // Filtrado avanzado (estado, grado, sección, mes, año) + búsqueda (estudiante, cédula, referencia, representante)
  useEffect(() => {
    const base = pagos; // base global
    const q = searchTerm.trim().toLowerCase();

    let result = base.filter(p => {
      const est = p.estudiantes || p.estudiante || {};
      const rep = p.representantes || p.representante || {};
      const metodo = p.metodoPagos || p.metodoPago || {};
      const insc = p.inscripciones || p.inscripcion || {};
      const grado = insc.grado?.nombre_grado || '';
      const seccion = insc.Secciones?.nombre_seccion || '';

      // Filtro por estado
      if (estadoFilter === 'pendientes' && p.estado !== 'pendiente') return false;
      if (estadoFilter === 'reportados' && !(p.estado === 'pendiente' && p.urlComprobante)) return false;
      if (estadoFilter === 'aprobados' && p.estado !== 'pagado') return false;

      // Filtro por grado/seccion
      if (gradoFilter !== 'todos' && grado !== gradoFilter) return false;
      if (seccionFilter !== 'todos' && seccion !== seccionFilter) return false;

      // Filtro por mes/año (usa mesPago si existe; como fallback usa fechaPago)
      const mes = p.mesPago ? Number(p.mesPago) : (p.fechaPago ? (new Date(p.fechaPago).getMonth()+1) : null);
      const anio = p.anio || (p.fechaPago ? new Date(p.fechaPago).getFullYear() : null);
      if (mesFilter !== 'todos' && mes !== Number(mesFilter)) return false;
      if (anioFilter !== 'todos' && anio !== Number(anioFilter)) return false;

      // Búsqueda
      if (!q) return true;
      const matchEst = `${est.nombre||''} ${est.apellido||''}`.toLowerCase().includes(q);
      const matchCedula = String(est.cedula||'').toLowerCase().includes(q);
      const matchRef = String(p.referencia||'').toLowerCase().includes(q);
      const matchRep = (
        `${rep.nombre||''} ${rep.apellido||''}`.toLowerCase().includes(q) ||
        String(rep.cedula||'').toLowerCase().includes(q)
      );
      const matchId = String(p.id||'').toLowerCase().includes(q);
      return matchEst || matchCedula || matchRef || matchRep || matchId;
    });

    setFilteredPagos(result);
    setCurrentPage(1);
  }, [searchTerm, pagos, estadoFilter, gradoFilter, seccionFilter, mesFilter, anioFilter]);
  
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

      // Obtener configuración de pagos (para precios, mora, fecha vencimiento)
      try {
        const cfgResp = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/configuracion-pagos`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setConfigPagos(cfgResp.data);
      } catch (e) {
        console.warn('No se pudo cargar configuracion-pagos', e);
      }
      
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
      
      // Separar pagos por estado
      const pendientes = response.data.filter(pago => pago.estado === 'pendiente');
      const reportados = response.data.filter(pago => pago.estado === 'pendiente' && pago.urlComprobante); // reportado = pendiente con comprobante
      const aprobados = response.data.filter(pago => pago.estado === 'pagado');
      
      setPagosPendientes(pendientes);
      setPagosReportados(reportados);
      setPagosAprobados(aprobados);
      setPagos(response.data);
      
      // Filtrar según la pestaña activa
      if (tabActiva === 'pendientes') {
        setFilteredPagos(pendientes);
      } else if (tabActiva === 'reportados') {
        setFilteredPagos(reportados);
      } else {
        setFilteredPagos(aprobados);
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
    } else if (tab === 'reportados') {
      setFilteredPagos(pagosReportados);
    } else if (tab === 'aprobados') {
      setFilteredPagos(pagosAprobados);
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

  const groupByGradeSection = (items) => {
    const groups = new Map();
    for (const p of items) {
      const grado = p?.inscripciones?.grado?.nombre_grado || p?.inscripcion?.grado?.nombre_grado || 'Sin grado';
      const seccion = p?.inscripciones?.Secciones?.nombre_seccion || p?.inscripcion?.Secciones?.nombre_seccion || '';
      const key = `${grado}__${seccion}`;
      if (!groups.has(key)) groups.set(key, { grado, seccion, items: [] });
      groups.get(key).items.push(p);
    }
    return Array.from(groups.values());
  };
  
  // Cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handlePreviewComprobante = (pago) => {
    if (pago && pago.urlComprobante) {
      window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${pago.urlComprobante}`, '_blank');
    }
  };

  // Función para abrir el modal con los detalles del pago
  const handleOpenDetailModal = async (pagoId) => {
    try {
      const token = localStorage.getItem('token');
      
      // Obtener detalles completos del pago
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/pagos/${pagoId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      const pagoDetallado = response.data;
      
      // Obtener información del estudiante si no está incluida o está incompleta
      if (pagoDetallado.estudianteID && (!pagoDetallado.estudiantes || !pagoDetallado.estudiantes.nombre)) {
        try {
          const estudianteResponse = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas/${pagoDetallado.estudianteID}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          pagoDetallado.estudiante = estudianteResponse.data;
        } catch (err) {
          console.error('Error al obtener datos del estudiante:', err);
        }
      } else if (pagoDetallado.estudiantes) {
        // Si los datos vienen como "estudiantes" (plural), los copiamos a "estudiante" (singular)
        pagoDetallado.estudiante = pagoDetallado.estudiantes;
      }
      
      // Obtener información del representante si no está incluida o está incompleta
      if (pagoDetallado.representanteID && (!pagoDetallado.representantes || !pagoDetallado.representantes.nombre)) {
        try {
          const representanteResponse = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas/${pagoDetallado.representanteID}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          pagoDetallado.representante = representanteResponse.data;
        } catch (err) {
          console.error('Error al obtener datos del representante:', err);
        }
      } else if (pagoDetallado.representantes) {
        // Si los datos vienen como "representantes" (plural), los copiamos a "representante" (singular)
        pagoDetallado.representante = pagoDetallado.representantes;
      }
      
      // Obtener información de la inscripción si existe
      if (pagoDetallado.inscripcionID) {
        try {
          const inscripcionResponse = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/inscripciones/${pagoDetallado.inscripcionID}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          pagoDetallado.inscripcion = inscripcionResponse.data;
          
          // Obtener información del grado y sección si no están incluidos
          if (pagoDetallado.inscripcion.gradoID && !pagoDetallado.inscripcion.grado) {
            try {
              const gradoResponse = await axios.get(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados/${pagoDetallado.inscripcion.gradoID}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
              );
              pagoDetallado.inscripcion.grado = gradoResponse.data;
            } catch (err) {
              console.error('Error al obtener datos del grado:', err);
            }
          }
          
          if (pagoDetallado.inscripcion.seccionID && !pagoDetallado.inscripcion.seccion) {
            try {
              const seccionResponse = await axios.get(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/secciones/${pagoDetallado.inscripcion.seccionID}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
              );
              pagoDetallado.inscripcion.seccion = seccionResponse.data;
            } catch (err) {
              console.error('Error al obtener datos de la sección:', err);
            }
          }
        } catch (err) {
          console.error('Error al obtener datos de la inscripción:', err);
        }
      }
      
      // Obtener información del arancel si no está incluida o está incompleta
      if (pagoDetallado.arancelID && (!pagoDetallado.aranceles || !pagoDetallado.aranceles.nombre)) {
        try {
          const arancelResponse = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/aranceles/${pagoDetallado.arancelID}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          pagoDetallado.arancel = arancelResponse.data;
        } catch (err) {
          console.error('Error al obtener datos del arancel:', err);
        }
      } else if (pagoDetallado.aranceles) {
        // Si los datos vienen como "aranceles" (plural), los copiamos a "arancel" (singular)
        pagoDetallado.arancel = pagoDetallado.aranceles;
      }
      
      // Obtener información del método de pago si no está incluida o está incompleta
      if (pagoDetallado.metodoPagoID && (!pagoDetallado.metodoPagos || !pagoDetallado.metodoPagos.nombre)) {
        try {
          const metodoPagoResponse = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/metodos-pago/${pagoDetallado.metodoPagoID}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          pagoDetallado.metodoPago = metodoPagoResponse.data;
        } catch (err) {
          console.error('Error al obtener datos del método de pago:', err);
        }
      } else if (pagoDetallado.metodoPagos) {
        // Si los datos vienen como "metodoPagos" (plural), los copiamos a "metodoPago" (singular)
        pagoDetallado.metodoPago = pagoDetallado.metodoPagos;
      }
      
      console.log("Pago detallado completo:", pagoDetallado);
      
      setSelectedPago(pagoDetallado);
      setShowDetailModal(true);
    } catch (err) {
      console.error('Error al obtener detalles del pago:', err);
      setError(err.response?.data?.message || 'Error al cargar los detalles del pago. Por favor, intente nuevamente.');
    }
  };

  // Función para cerrar el modal
  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedPago(null);
  };

  // Función para ver detalles de un pago
  const handleViewDetails = async (pago) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Obtener detalles completos del pago
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/pagos/${pago.id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      const pagoDetallado = response.data;
      
      // Obtener información del estudiante si no está incluida
      if (pagoDetallado.estudianteID && (!pagoDetallado.estudiante || !pagoDetallado.estudiante.nombre)) {
        try {
          const estudianteResponse = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas/${pagoDetallado.estudianteID}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          pagoDetallado.estudiante = estudianteResponse.data;
        } catch (err) {
          console.error('Error al obtener datos del estudiante:', err);
        }
      }
      
      // Obtener información del representante si no está incluida
      if (pagoDetallado.representanteID && (!pagoDetallado.representante || !pagoDetallado.representante.nombre)) {
        try {
          const representanteResponse = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas/${pagoDetallado.representanteID}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          pagoDetallado.representante = representanteResponse.data;
        } catch (err) {
          console.error('Error al obtener datos del representante:', err);
        }
      }
      
      // Obtener información de la inscripción si existe
      if (pagoDetallado.inscripcionID) {
        try {
          const inscripcionResponse = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/inscripciones/${pagoDetallado.inscripcionID}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          pagoDetallado.inscripcion = inscripcionResponse.data;
          
          // Obtener información del grado y sección si no están incluidos
          if (pagoDetallado.inscripcion.gradoID && !pagoDetallado.inscripcion.grado) {
            try {
              const gradoResponse = await axios.get(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados/${pagoDetallado.inscripcion.gradoID}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
              );
              pagoDetallado.inscripcion.grado = gradoResponse.data;
            } catch (err) {
              console.error('Error al obtener datos del grado:', err);
            }
          }
          
          if (pagoDetallado.inscripcion.seccionID && !pagoDetallado.inscripcion.seccion) {
            try {
              const seccionResponse = await axios.get(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/secciones/${pagoDetallado.inscripcion.seccionID}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
              );
              pagoDetallado.inscripcion.seccion = seccionResponse.data;
            } catch (err) {
              console.error('Error al obtener datos de la sección:', err);
            }
          }
        } catch (err) {
          console.error('Error al obtener datos de la inscripción:', err);
        }
      }
      
      // Obtener información del arancel si no está incluida
      if (pagoDetallado.arancelID && (!pagoDetallado.arancel || !pagoDetallado.arancel.nombre)) {
        try {
          const arancelResponse = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/aranceles/${pagoDetallado.arancelID}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          pagoDetallado.arancel = arancelResponse.data;
        } catch (err) {
          console.error('Error al obtener datos del arancel:', err);
        }
      }
      
      // Obtener información del método de pago si no está incluida
      if (pagoDetallado.metodoPagoID && (!pagoDetallado.metodoPago || !pagoDetallado.metodoPago.nombre)) {
        try {
          const metodoPagoResponse = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/metodos-pago/${pagoDetallado.metodoPagoID}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          pagoDetallado.metodoPago = metodoPagoResponse.data;
        } catch (err) {
          console.error('Error al obtener datos del método de pago:', err);
        }
      }
      
      setSelectedPago(pagoDetallado);
      setShowDetailModal(true);
      setLoading(false);
    } catch (err) {
      console.error('Error al obtener detalles del pago:', err);
      setError('Error al obtener los detalles del pago');
      setLoading(false);
    }
  };

  
  useEffect(() => {
    const open = () => setShowConfigModal(true);
    window.addEventListener('open-config-pagos', open);
    return () => window.removeEventListener('open-config-pagos', open);
  }, []);

  // Auto-cierre de toasts
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(''), 2500);
      return () => clearTimeout(t);
    }
  }, [success]);
  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(''), 4000);
      return () => clearTimeout(t);
    }
  }, [error]);
  
  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* Toasts absolute */}
      {error && (
        <div className="absolute top-3 right-3 z-50">
          <div className="flex items-center gap-2 bg-red-600 text-white text-sm px-3 py-2 rounded shadow-lg">
            <FaInfoCircle className="opacity-90" />
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-2 text-white/80 hover:text-white">
              <FaTimes />
            </button>
          </div>
        </div>
      )}
      {success && (
        <div className="absolute top-3 right-3 z-50">
          <div className="flex items-center gap-2 bg-green-600 text-white text-sm px-3 py-2 rounded shadow-lg">
            <FaCheck className="opacity-90" />
            <span>{success}</span>
            <button onClick={() => setSuccess('')} className="ml-2 text-white/80 hover:text-white">
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      {/* Modales */}
      <MonthlySummaryModal
        open={showMonthlySummary}
        onClose={() => setShowMonthlySummary(false)}
        mes={selectedMes}
        anio={selectedAnio}
        annoEscolarID={annoEscolar?.id}
      />
      {showConfigModal && (
        <PagosConfigModal
          onClose={() => setShowConfigModal(false)}
          onVerPendientesMes={(m) => {
            setShowConfigModal(false);
            setTabActiva('pendientes');
            setViewMode('list');
            setGroupBy(false);
            if (m?.mesNumero || m?.mes) setMesFilter(String(m.mesNumero || m.mes));
            if (m?.anio) setAnioFilter(String(m.anio));
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          annoEscolarID={annoEscolar?.id}
        />
      )}

      {/* Header Hero con métricas */}
      <HeaderStats
        filteredPagos={filteredPagos}
        pagosPendientes={pagosPendientes}
        pagosReportados={pagosReportados}
        pagosAprobados={pagosAprobados}
        annoEscolar={annoEscolar}
        onOpenMonthlySummary={() => setShowMonthlySummary(true)}
        selectedMes={selectedMes}
        selectedAnio={selectedAnio}
        onChangeMes={setSelectedMes}
        onChangeAnio={setSelectedAnio}
      />

      {/* Barra de acciones */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <input
          type="text"
          placeholder="Buscar por estudiante, cédula, referencia, representante o ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-80 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
        <div className="inline-flex rounded-xl overflow-hidden border border-slate-200">
          <button
            onClick={() => setViewMode('list')}
            className={`${viewMode === 'list' ? 'bg-slate-800 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'} px-4 py-2 text-sm font-medium`}
            title="Vista lista"
          >
            Lista
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`${viewMode === 'cards' ? 'bg-slate-800 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'} px-4 py-2 text-sm font-medium`}
            title="Vista tarjetas"
          >
            Tarjetas
          </button>
          <button
            onClick={() => setGroupBy(v => !v)}
            className={`px-4 py-2 text-sm font-medium ${groupBy ? 'bg-pink-700 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
            title="Agrupar por grado y sección"
          >
            {groupBy ? 'Seccionado' : 'Seccionar'}
          </button>
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl bg-white border border-slate-200 hover:bg-slate-50"
        >
          {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
        </button>
        <button
          onClick={handleOpenModal}
          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl bg-pink-700 text-white hover:bg-pink-800 shadow"
        >
          <FaPlus className="mr-2" /> Registrar Pago
        </button>
      </div>
        
      {/* Panel de filtros expandible */}
      {showFilters && (
        <div className="mb-6 bg-white border border-slate-200 rounded-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Estado de pago</label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="pendientes">Pendientes</option>
                <option value="reportados">Reportados sin revisar</option>
                <option value="aprobados">Aprobados</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Grado</label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                value={gradoFilter}
                onChange={(e) => setGradoFilter(e.target.value)}
              >
                <option value="todos">Todos</option>
                {[...new Set(pagos.map(p => (p.inscripciones||p.inscripcion)?.grado?.nombre_grado).filter(Boolean))].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Sección</label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                value={seccionFilter}
                onChange={(e) => setSeccionFilter(e.target.value)}
              >
                <option value="todos">Todas</option>
                {[...new Set(pagos.map(p => (p.inscripciones||p.inscripcion)?.Secciones?.nombre_seccion).filter(Boolean))].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Mes</label>
                <select
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  value={mesFilter}
                  onChange={(e) => setMesFilter(e.target.value)}
                >
                  <option value="todos">Todos</option>
                  {MONTHS.map((m, idx) => (
                    <option key={idx+1} value={idx+1}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Año</label>
                <select
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  value={anioFilter}
                  onChange={(e) => setAnioFilter(e.target.value)}
                >
                  <option value="todos">Todos</option>
                  {[...new Set(pagos.map(p => p.anio || (p.fechaPago ? new Date(p.fechaPago).getFullYear() : null)).filter(Boolean))].map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* Contenido principal */}
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-pink-600"></div>
            </div>
          </div>
        ) : (
          viewMode === 'cards' ? (
            groupBy ? (
              <div className="space-y-6">
                {groupByGradeSection(currentItems).map(group => {
                  const subtotal = group.items.reduce((acc, it) => acc + (parseFloat(it.monto||0)+parseFloat(it.montoMora||0)-parseFloat(it.descuento||0)), 0);
                  return (
                    <div key={`${formatearNombreGrado(group.grado)}__${group.seccion}`} className="bg-white border border-slate-200 rounded-xl">
                      <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl flex items-center justify-between">
                        <h4 className="font-semibold text-slate-800">{formatearNombreGrado(group.grado)} {group.seccion ? `- ${group.seccion}` : ''}</h4>
                        <span className="text-sm font-medium text-slate-600">Subtotal: {Number(subtotal).toLocaleString('es-VE', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {group.items.map(p => (
                          <PaymentItem key={p.id} pago={p} onClick={(e) => { e?.preventDefault?.(); handleOpenDetailModal(p.id); }} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentItems.map((p) => (
                  <PaymentItem key={p.id} pago={p} onClick={(e) => { e?.preventDefault?.(); handleOpenDetailModal(p.id); }} />
                ))}
              </div>
            )
          ) : (
            groupBy ? (
              <div className="space-y-6">
                {groupByGradeSection(currentItems).map(group => {
                  const subtotal = group.items.reduce((acc, it) => acc + (parseFloat(it.monto||0)+parseFloat(it.montoMora||0)-parseFloat(it.descuento||0)), 0);
                  return (
                    <div key={`${formatearNombreGrado(group.grado)}__${group.seccion}`} className="bg-white border border-slate-200 rounded-xl">
                      <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl flex items-center justify-between">
                        <h4 className="font-semibold text-slate-800">{group.grado} {group.seccion ? `- ${group.seccion}` : ''}</h4>
                        <span className="text-sm font-medium text-slate-600">Subtotal: {Number(subtotal).toLocaleString('es-VE', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="p-4">
                        <PaymentsList items={group.items} onOpenDetail={(id) => handleOpenDetailModal(id)} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-0">
                <PaymentsList items={currentItems} onOpenDetail={(id) => handleOpenDetailModal(id)} />
              </div>
            )
          )
        )}
        
        {/* Paginación */}
        {tabActiva !== 'mensualidades' && tabActiva !== 'configuracion' && filteredPagos.length > itemsPerPage && (
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

        {/* Modal de Detalles del Pago (nuevo estilo) */}
        {showDetailModal && selectedPago && (
          <PaymentDetailModal
            pago={selectedPago}
            onClose={handleCloseDetailModal}
            onPreview={handlePreviewComprobante}
            onApprove={(p) => { handleUpdateEstado(p.id, 'pagado'); handleCloseDetailModal(); }}
            onReject={(p) => { handleUpdateEstado(p.id, 'anulado'); handleCloseDetailModal(); }}
          />
        )}

      </div>
     
  );
};

export default PagosList;