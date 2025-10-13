import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FaTimes, FaMoneyBillWave, FaExchangeAlt, FaCalendarAlt, FaFileUpload, FaPlus, FaMinus, FaCheckCircle, FaExclamationTriangle, FaDollarSign, FaReceipt, FaStickyNote, FaUser } from 'react-icons/fa';
import axios from 'axios';

/**
 * Modal reutilizable para registrar pagos administrativos (efectivo y transferencias)
 * Soporta temas dinámicos según el contexto de uso
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Estado de apertura del modal
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onSuccess - Callback al registrar exitosamente
 * @param {Object} props.estudiante - Datos del estudiante (opcional, para pre-selección)
 * @param {Object} props.representante - Datos del representante (opcional, para pre-selección)
 * @param {string} props.theme - Tema de colores ('pink', 'violet', 'blue')
 * @param {Object} props.user - Usuario actual (para determinar permisos)
 */
const AdminPaymentModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  estudiante = null, 
  representante = null,
  theme = 'pink',
  user = null
}) => {
  // Estados principales
  const [step, setStep] = useState(1); // 1: Selección, 2: Detalles, 3: Confirmación
  const [paymentType, setPaymentType] = useState('efectivo'); // 'efectivo' | 'transferencia'
  const [multiplePayments, setMultiplePayments] = useState(false);
  
  // Estados de datos
  const [estudiantes, setEstudiantes] = useState([]);
  const [representantes, setRepresentantes] = useState([]);
  const [mensualidades, setMensualidades] = useState([]);
  const [metodosPago, setMetodosPago] = useState([]);
  const [aranceles, setAranceles] = useState([]);
  const [annoEscolar, setAnnoEscolar] = useState(null);
  const [configPagos, setConfigPagos] = useState(null);
  
  // Estados de selección
  const [selectedEstudiante, setSelectedEstudiante] = useState(estudiante);
  const [selectedRepresentante, setSelectedRepresentante] = useState(representante);
  const [selectedMensualidades, setSelectedMensualidades] = useState([]);
  const [selectedMetodoPago, setSelectedMetodoPago] = useState(null);
  
  // Estados de formulario
  const [formData, setFormData] = useState({
    montoRecibido: '',
    montoEfectivo: '',
    montoTransferencia: '',
    referencia: '',
    fechaPago: new Date().toISOString().split('T')[0],
    observaciones: '',
    descuentoGlobal: '0',
    recibioPago: user?.nombre || ''
  });
  
  // Estados de archivo
  const [comprobante, setComprobante] = useState(null);
  const fileInputRef = useRef(null);
  
  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchRepTerm, setSearchRepTerm] = useState('');
  
  // Configuración de temas
  const themeConfig = useMemo(() => {
    const themes = {
      pink: {
        gradient: 'from-pink-700 to-pink-800',
        bg: 'bg-pink-600',
        bgHover: 'hover:bg-pink-700',
        text: 'text-pink-600',
        border: 'border-pink-300',
        focus: 'focus:ring-pink-500 focus:border-pink-500',
        badge: 'bg-pink-100 text-pink-800',
        light: 'bg-pink-50'
      },
      violet: {
        gradient: 'from-violet-700 to-violet-800',
        bg: 'bg-violet-600',
        bgHover: 'hover:bg-violet-700',
        text: 'text-violet-600',
        border: 'border-violet-300',
        focus: 'focus:ring-violet-500 focus:border-violet-500',
        badge: 'bg-violet-100 text-violet-800',
        light: 'bg-violet-50'
      },
      blue: {
        gradient: 'from-blue-700 to-blue-800',
        bg: 'bg-blue-600',
        bgHover: 'hover:bg-blue-700',
        text: 'text-blue-600',
        border: 'border-blue-300',
        focus: 'focus:ring-blue-500 focus:border-blue-500',
        badge: 'bg-blue-100 text-blue-800',
        light: 'bg-blue-50'
      }
    };
    return themes[theme] || themes.pink;
  }, [theme]);

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  // Cargar estudiantes cuando se selecciona representante
  useEffect(() => {
    if (selectedRepresentante) {
      loadEstudiantesByRepresentante(selectedRepresentante.id);
    }
  }, [selectedRepresentante]);

  // Cargar mensualidades cuando se selecciona estudiante
  useEffect(() => {
    if (selectedEstudiante && annoEscolar) {
      loadMensualidades(selectedEstudiante.id, annoEscolar.id);
    }
  }, [selectedEstudiante, annoEscolar]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };

      // Cargar año escolar activo
      const annoRes = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/anno-escolar/actual`,
        config
      );
      setAnnoEscolar(annoRes.data);

      // Cargar configuración de pagos
      const cfgRes = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/configuracion-pagos`,
        config
      );
      setConfigPagos(cfgRes.data);

      // Cargar métodos de pago
      const metodosRes = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/metodos-pago`,
        config
      );
      setMetodosPago(metodosRes.data);

      // Cargar aranceles
      const arancelesRes = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/aranceles`,
        config
      );
      setAranceles(arancelesRes.data);

      // Si no hay representante pre-seleccionado, cargar todos
      if (!representante) {
        const repRes = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas/tipo/representante`,
          config
        );
        setRepresentantes(repRes.data);
      }

      // Si hay estudiante pre-seleccionado, cargar sus mensualidades
      if (estudiante && annoRes.data) {
        await loadMensualidades(estudiante.id, annoRes.data.id);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error al cargar datos iniciales:', err);
      setError('Error al cargar datos. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };

  const loadEstudiantesByRepresentante = async (representanteID) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas/representante/${representanteID}/estudiantes`,
        config
      );
      setEstudiantes(res.data);
    } catch (err) {
      console.error('Error al cargar estudiantes:', err);
      setError('Error al cargar estudiantes del representante.');
    }
  };

  const loadMensualidades = async (estudianteID, annoEscolarID) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/mensualidades/estudiante/${estudianteID}?annoEscolarID=${annoEscolarID}`,
        config
      );
      
      // Filtrar solo mensualidades pendientes o reportadas
      const pendientes = res.data.filter(m => 
        m.estado === 'pendiente' || m.estado === 'reportado'
      );
      setMensualidades(pendientes);
    } catch (err) {
      console.error('Error al cargar mensualidades:', err);
      setError('Error al cargar mensualidades del estudiante.');
    }
  };

  const handleMensualidadToggle = (mensualidad) => {
    if (!multiplePayments) {
      setSelectedMensualidades([mensualidad]);
      return;
    }

    const isSelected = selectedMensualidades.find(m => m.id === mensualidad.id);
    if (isSelected) {
      setSelectedMensualidades(selectedMensualidades.filter(m => m.id !== mensualidad.id));
    } else {
      setSelectedMensualidades([...selectedMensualidades, mensualidad]);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('El archivo no debe superar los 5MB');
        return;
      }
      // Validar tipo
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setError('Solo se permiten archivos JPG, PNG o PDF');
        return;
      }
      setComprobante(file);
      setError('');
    }
  };

  const calculateTotals = useMemo(() => {
    if (selectedMensualidades.length === 0) {
      return { subtotal: 0, mora: 0, descuento: 0, total: 0 };
    }

    const subtotal = selectedMensualidades.reduce((sum, m) => {
      return sum + (Number(m.precioVES) || Number(m.updatedBaseVES) || 0);
    }, 0);

    const mora = selectedMensualidades.reduce((sum, m) => {
      return sum + (Number(m.moraAcumuladaVES) || Number(m.updatedMoraVES) || 0);
    }, 0);

    const descuento = Number(formData.descuentoGlobal) || 0;
    const total = subtotal + mora - descuento;

    return { subtotal, mora, descuento, total };
  }, [selectedMensualidades, formData.descuentoGlobal]);

  const calculateChange = useMemo(() => {
    if (paymentType !== 'efectivo') return 0;
    const recibido = Number(formData.montoRecibido) || 0;
    const total = calculateTotals.total;
    return Math.max(0, recibido - total);
  }, [formData.montoRecibido, calculateTotals.total, paymentType]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Validaciones
      if (!selectedEstudiante) {
        setError('Debe seleccionar un estudiante');
        setLoading(false);
        return;
      }

      if (!selectedRepresentante) {
        setError('Debe seleccionar un representante');
        setLoading(false);
        return;
      }

      if (selectedMensualidades.length === 0) {
        setError('Debe seleccionar al menos una mensualidad');
        setLoading(false);
        return;
      }

      if (paymentType === 'transferencia' && !formData.referencia) {
        setError('Debe ingresar la referencia de la transferencia');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      
      // Determinar método de pago
      let metodoPagoID;
      if (paymentType === 'efectivo') {
        const efectivoMetodo = metodosPago.find(m => m.nombre.toLowerCase().includes('efectivo'));
        metodoPagoID = efectivoMetodo?.id;
        
        // Si no existe, crear método "Efectivo"
        if (!metodoPagoID) {
          const createRes = await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/metodos-pago`,
            { nombre: 'Efectivo', activo: true },
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          metodoPagoID = createRes.data.metodoPago.id;
        }
      } else {
        const transferenciaMetodo = metodosPago.find(m => 
          m.nombre.toLowerCase().includes('transferencia') || 
          m.nombre.toLowerCase().includes('pago móvil')
        );
        metodoPagoID = transferenciaMetodo?.id;
      }

      // Determinar arancel (Mensualidad)
      let arancelID = aranceles.find(a => a.nombre.toLowerCase().includes('mensualidad'))?.id;
      if (!arancelID) {
        const createArancelRes = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/aranceles`,
          { nombre: 'Mensualidad', monto: 0, descripcion: 'Pago mensual', activo: true },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        arancelID = createArancelRes.data.id;
      }

      // Determinar estado según rol del usuario
      let estadoPago = 'pendiente';
      if (user?.rol === 'owner' || user?.rol === 'adminWeb') {
        estadoPago = 'pagado'; // Aprobación automática para admin/owner
      } else if (paymentType === 'efectivo') {
        estadoPago = 'pagado'; // Efectivo se marca como pagado directamente
      }

      // Crear pagos para cada mensualidad seleccionada
      const pagosCreados = [];
      
      for (const mensualidad of selectedMensualidades) {
        const formDataToSend = new FormData();
        
        formDataToSend.append('estudianteID', selectedEstudiante.id);
        formDataToSend.append('representanteID', selectedRepresentante.id);
        formDataToSend.append('metodoPagoID', metodoPagoID);
        formDataToSend.append('arancelID', arancelID);
        formDataToSend.append('annoEscolarID', annoEscolar.id);
        
        // Calcular montos para esta mensualidad
        const montoBase = Number(mensualidad.precioVES) || Number(mensualidad.updatedBaseVES) || 0;
        const montoMora = Number(mensualidad.moraAcumuladaVES) || Number(mensualidad.updatedMoraVES) || 0;
        const descuentoProporcional = selectedMensualidades.length > 1 
          ? (Number(formData.descuentoGlobal) || 0) / selectedMensualidades.length 
          : (Number(formData.descuentoGlobal) || 0);
        
        formDataToSend.append('monto', montoBase.toString());
        formDataToSend.append('montoMora', montoMora.toString());
        formDataToSend.append('descuento', descuentoProporcional.toString());
        formDataToSend.append('mesPago', mensualidad.mes.toString());
        formDataToSend.append('fechaPago', formData.fechaPago);
        
        if (paymentType === 'transferencia') {
          formDataToSend.append('referencia', formData.referencia);
          if (comprobante) {
            formDataToSend.append('comprobante', comprobante);
          }
        }
        
        const observacionesCompletas = [
          formData.observaciones,
          paymentType === 'efectivo' ? `Pago en efectivo recibido por: ${formData.recibioPago}` : '',
          paymentType === 'efectivo' && formData.montoRecibido ? `Monto recibido: Bs. ${formData.montoRecibido}` : '',
          calculateChange > 0 ? `Cambio entregado: Bs. ${calculateChange.toFixed(2)}` : ''
        ].filter(Boolean).join(' | ');
        
        formDataToSend.append('observaciones', observacionesCompletas);

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/pagos`,
          formDataToSend,
          { 
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            } 
          }
        );

        pagosCreados.push(response.data);
      }

      setLoading(false);
      
      // Llamar callback de éxito
      if (onSuccess) {
        onSuccess(pagosCreados);
      }
      
      // Resetear y cerrar
      handleClose();
    } catch (err) {
      console.error('Error al registrar pago:', err);
      setError(err.response?.data?.message || 'Error al registrar el pago. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Resetear estados
    setStep(1);
    setPaymentType('efectivo');
    setMultiplePayments(false);
    setSelectedEstudiante(estudiante);
    setSelectedRepresentante(representante);
    setSelectedMensualidades([]);
    setSelectedMetodoPago(null);
    setFormData({
      montoRecibido: '',
      montoEfectivo: '',
      montoTransferencia: '',
      referencia: '',
      fechaPago: new Date().toISOString().split('T')[0],
      observaciones: '',
      descuentoGlobal: '0',
      recibioPago: user?.nombre || ''
    });
    setComprobante(null);
    setError('');
    setSearchTerm('');
    setSearchRepTerm('');
    
    onClose();
  };

  if (!isOpen) return null;

  // Filtrar representantes por búsqueda
  const filteredRepresentantes = representantes.filter(rep =>
    `${rep.nombre} ${rep.apellido} ${rep.cedula}`.toLowerCase().includes(searchRepTerm.toLowerCase())
  );

  // Filtrar estudiantes por búsqueda
  const filteredEstudiantes = estudiantes.filter(est =>
    `${est.nombre} ${est.apellido} ${est.cedula}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className={`bg-gradient-to-r ${themeConfig.gradient} text-white px-6 py-4 flex justify-between items-center`}>
          <div className="flex items-center space-x-3">
            <FaMoneyBillWave className="text-2xl" />
            <div>
              <h2 className="text-xl font-bold">Registrar Pago Administrativo</h2>
              <p className="text-sm opacity-90">
                {step === 1 && 'Paso 1: Selección de tipo y estudiante'}
                {step === 2 && 'Paso 2: Selección de mensualidades'}
                {step === 3 && 'Paso 3: Detalles del pago'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-100 px-6 py-3">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  step >= s ? `${themeConfig.bg} text-white` : 'bg-gray-300 text-gray-600'
                }`}>
                  {s}
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step > s ? themeConfig.bg : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
            <FaExclamationTriangle className="mt-0.5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Step 1: Tipo de pago y selección de estudiante */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Tipo de pago */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Pago
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setPaymentType('efectivo')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      paymentType === 'efectivo'
                        ? `${themeConfig.border} ${themeConfig.light}`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <FaMoneyBillWave className={`text-3xl mx-auto mb-2 ${
                      paymentType === 'efectivo' ? themeConfig.text : 'text-gray-400'
                    }`} />
                    <p className="font-semibold">Efectivo</p>
                    <p className="text-xs text-gray-500">Pago en efectivo</p>
                  </button>
                  <button
                    onClick={() => setPaymentType('transferencia')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      paymentType === 'transferencia'
                        ? `${themeConfig.border} ${themeConfig.light}`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <FaExchangeAlt className={`text-3xl mx-auto mb-2 ${
                      paymentType === 'transferencia' ? themeConfig.text : 'text-gray-400'
                    }`} />
                    <p className="font-semibold">Transferencia</p>
                    <p className="text-xs text-gray-500">Pago móvil / Transferencia</p>
                  </button>
                </div>
              </div>

              {/* Múltiples mensualidades */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="multiplePayments"
                  checked={multiplePayments}
                  onChange={(e) => setMultiplePayments(e.target.checked)}
                  className={`mr-2 ${themeConfig.focus}`}
                />
                <label htmlFor="multiplePayments" className="text-sm font-medium text-gray-700">
                  Pagar múltiples mensualidades
                </label>
              </div>

              {/* Selección de representante (si no está pre-seleccionado) */}
              {!representante && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Representante
                  </label>
                  <input
                    type="text"
                    placeholder="Buscar representante..."
                    value={searchRepTerm}
                    onChange={(e) => setSearchRepTerm(e.target.value)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${themeConfig.focus}`}
                  />
                  <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                    {filteredRepresentantes.map((rep) => (
                      <button
                        key={rep.id}
                        onClick={() => setSelectedRepresentante(rep)}
                        className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${
                          selectedRepresentante?.id === rep.id ? themeConfig.light : ''
                        }`}
                      >
                        <p className="font-medium">{rep.nombre} {rep.apellido}</p>
                        <p className="text-sm text-gray-500">{rep.cedula}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Selección de estudiante (si no está pre-seleccionado) */}
              {!estudiante && selectedRepresentante && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estudiante
                  </label>
                  <input
                    type="text"
                    placeholder="Buscar estudiante..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${themeConfig.focus}`}
                  />
                  <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                    {filteredEstudiantes.map((est) => (
                      <button
                        key={est.id}
                        onClick={() => setSelectedEstudiante(est)}
                        className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${
                          selectedEstudiante?.id === est.id ? themeConfig.light : ''
                        }`}
                      >
                        <p className="font-medium">{est.nombre} {est.apellido}</p>
                        <p className="text-sm text-gray-500">{est.cedula}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Mostrar selección actual */}
              {selectedRepresentante && (
                <div className={`p-3 rounded-lg ${themeConfig.light} border ${themeConfig.border}`}>
                  <p className="text-sm font-medium text-gray-700">Representante seleccionado:</p>
                  <p className="font-semibold">{selectedRepresentante.nombre} {selectedRepresentante.apellido}</p>
                </div>
              )}

              {selectedEstudiante && (
                <div className={`p-3 rounded-lg ${themeConfig.light} border ${themeConfig.border}`}>
                  <p className="text-sm font-medium text-gray-700">Estudiante seleccionado:</p>
                  <p className="font-semibold">{selectedEstudiante.nombre} {selectedEstudiante.apellido}</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Selección de mensualidades */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Seleccione {multiplePayments ? 'las mensualidades' : 'la mensualidad'} a pagar:
              </p>
              
              {mensualidades.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FaExclamationTriangle className="text-4xl mx-auto mb-2" />
                  <p>No hay mensualidades pendientes para este estudiante</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {mensualidades.map((mensualidad) => {
                    const isSelected = selectedMensualidades.find(m => m.id === mensualidad.id);
                    const montoBase = Number(mensualidad.precioVES) || Number(mensualidad.updatedBaseVES) || 0;
                    const montoMora = Number(mensualidad.moraAcumuladaVES) || Number(mensualidad.updatedMoraVES) || 0;
                    const total = montoBase + montoMora;

                    return (
                      <button
                        key={mensualidad.id}
                        onClick={() => handleMensualidadToggle(mensualidad)}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          isSelected
                            ? `${themeConfig.border} ${themeConfig.light}`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              {isSelected && <FaCheckCircle className={themeConfig.text} />}
                              <p className="font-semibold">{mensualidad.mesNombre} {mensualidad.anio}</p>
                            </div>
                            <div className="mt-2 space-y-1 text-sm">
                              <p className="text-gray-600">
                                Base: <span className="font-medium">Bs. {montoBase.toFixed(2)}</span>
                              </p>
                              {montoMora > 0 && (
                                <p className="text-red-600">
                                  Mora: <span className="font-medium">Bs. {montoMora.toFixed(2)}</span>
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">Bs. {total.toFixed(2)}</p>
                            <span className={`text-xs px-2 py-1 rounded ${
                              mensualidad.estado === 'reportado' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {mensualidad.estado === 'reportado' ? 'Reportado' : 'Pendiente'}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Detalles del pago */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Resumen de mensualidades seleccionadas */}
              <div className={`p-4 rounded-lg ${themeConfig.light} border ${themeConfig.border}`}>
                <h3 className="font-semibold mb-2">Resumen del Pago</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Mensualidades:</span>
                    <span className="font-medium">{selectedMensualidades.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium">Bs. {calculateTotals.subtotal.toFixed(2)}</span>
                  </div>
                  {calculateTotals.mora > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Mora:</span>
                      <span className="font-medium">Bs. {calculateTotals.mora.toFixed(2)}</span>
                    </div>
                  )}
                  {calculateTotals.descuento > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Descuento:</span>
                      <span className="font-medium">- Bs. {calculateTotals.descuento.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span>Bs. {calculateTotals.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Descuento global */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descuento (Bs.)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.descuentoGlobal}
                  onChange={(e) => setFormData({ ...formData, descuentoGlobal: e.target.value })}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${themeConfig.focus}`}
                />
              </div>

              {/* Campos específicos para efectivo */}
              {paymentType === 'efectivo' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monto Recibido (Bs.)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.montoRecibido}
                      onChange={(e) => setFormData({ ...formData, montoRecibido: e.target.value })}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${themeConfig.focus}`}
                      placeholder="Ingrese el monto recibido"
                    />
                  </div>

                  {calculateChange > 0 && (
                    <div className={`p-3 rounded-lg ${themeConfig.light} border ${themeConfig.border}`}>
                      <p className="text-sm font-medium text-gray-700">Cambio a entregar:</p>
                      <p className="text-2xl font-bold">Bs. {calculateChange.toFixed(2)}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recibido por
                    </label>
                    <input
                      type="text"
                      value={formData.recibioPago}
                      onChange={(e) => setFormData({ ...formData, recibioPago: e.target.value })}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${themeConfig.focus}`}
                      placeholder="Nombre de quien recibe el pago"
                    />
                  </div>
                </>
              )}

              {/* Campos específicos para transferencia */}
              {paymentType === 'transferencia' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Referencia *
                    </label>
                    <input
                      type="text"
                      value={formData.referencia}
                      onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${themeConfig.focus}`}
                      placeholder="Número de referencia"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comprobante (Opcional)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*,.pdf"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex-1 px-4 py-2 border-2 border-dashed ${themeConfig.border} rounded-lg ${themeConfig.bgHover} transition-colors flex items-center justify-center space-x-2`}
                      >
                        <FaFileUpload />
                        <span>{comprobante ? comprobante.name : 'Seleccionar archivo'}</span>
                      </button>
                      {comprobante && (
                        <button
                          type="button"
                          onClick={() => setComprobante(null)}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          <FaTimes />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Formatos permitidos: JPG, PNG, PDF (máx. 5MB)
                    </p>
                  </div>
                </>
              )}

              {/* Fecha de pago */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Pago
                </label>
                <input
                  type="date"
                  value={formData.fechaPago}
                  onChange={(e) => setFormData({ ...formData, fechaPago: e.target.value })}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${themeConfig.focus}`}
                />
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones
                </label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  rows={3}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${themeConfig.focus}`}
                  placeholder="Observaciones adicionales..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t">
          <button
            onClick={step === 1 ? handleClose : () => setStep(step - 1)}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={loading}
          >
            {step === 1 ? 'Cancelar' : 'Anterior'}
          </button>

          <div className="flex space-x-2">
            {step < 3 ? (
              <button
                onClick={() => {
                  if (step === 1 && (!selectedEstudiante || !selectedRepresentante)) {
                    setError('Debe seleccionar un estudiante y representante');
                    return;
                  }
                  if (step === 2 && selectedMensualidades.length === 0) {
                    setError('Debe seleccionar al menos una mensualidad');
                    return;
                  }
                  setError('');
                  setStep(step + 1);
                }}
                className={`px-6 py-2 ${themeConfig.bg} text-white rounded-lg ${themeConfig.bgHover} transition-colors`}
                disabled={loading}
              >
                Siguiente
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className={`px-6 py-2 ${themeConfig.bg} text-white rounded-lg ${themeConfig.bgHover} transition-colors flex items-center space-x-2`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <FaCheckCircle />
                    <span>Registrar Pago</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentModal;