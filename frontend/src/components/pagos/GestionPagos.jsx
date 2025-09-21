import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  FaMoneyBillWave, 
  FaFileUpload, 
  FaCheck, 
  FaTimes, 
  FaCalendarAlt, 
  FaInfoCircle,
  FaEye,
  FaSpinner
} from 'react-icons/fa';

const GestionPagos = ({ 
  userType, // 'representante' o 'estudiante'
  personaID, 
  estudiantes = [], // Solo necesario si userType es 'representante'
  annoEscolar,
  onSuccess
}) => {
  // Estados principales
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mesesPago, setMesesPago] = useState([]);
  const [pagosPorMes, setPagosPorMes] = useState({});
  
  // Estados para el modal de pago
  const [showModal, setShowModal] = useState(false);
  const [selectedMes, setSelectedMes] = useState(null);
  const [paso, setPaso] = useState(1);
  const [comprobante, setComprobante] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [procesandoPago, setProcesandoPago] = useState(false);
  
  // Formulario de pago
  const [formPago, setFormPago] = useState({
    estudianteID: '',
    representanteID: personaID,
    annoEscolarID: annoEscolar?.id || '',
    monto: '',
    montoMora: '0',
    descuento: '0',
    mesPago: '',
    fechaPago: new Date().toISOString().split('T')[0],
    referencia: '',
    observaciones: ''
  });
  
  const fileInputRef = useRef(null);
  
  // Cargar meses del año escolar y pagos existentes
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError('');
        
        if (!annoEscolar || !annoEscolar.id) {
          setError('No se pudo obtener información del año escolar actual');
          setLoading(false);
          return;
        }
        
        const token = localStorage.getItem('token');
        
        // 1. Obtener meses del año escolar
        const mesesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/anno-escolar/${annoEscolar.id}/meses`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        if (mesesResponse.data && Array.isArray(mesesResponse.data)) {
          setMesesPago(mesesResponse.data);
        }
        
        // 2. Obtener pagos existentes
        let pagosResponse;
        if (userType === 'representante') {
          pagosResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/pagos/representante/${personaID}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
        } else {
          pagosResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/pagos/estudiante/${personaID}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
        }
        
        // Organizar pagos por mes
        const pagosMes = {};
        if (pagosResponse.data && Array.isArray(pagosResponse.data)) {
          pagosResponse.data.forEach(pago => {
            if (pago.mesPago) {
              if (!pagosMes[pago.mesPago]) {
                pagosMes[pago.mesPago] = [];
              }
              pagosMes[pago.mesPago].push(pago);
            }
          });
        }
        
        setPagosPorMes(pagosMes);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar datos de pagos:', err);
        setError('Error al cargar información de pagos. Por favor, intente nuevamente.');
        setLoading(false);
      }
    };
    
    // Manejo defensivo: si faltan datos requeridos, apagar loader y mostrar mensaje
    if (!personaID || !annoEscolar?.id) {
      setLoading(false);
      if (!annoEscolar?.id) setError('No hay un año escolar activo.');
      if (!personaID) setError(prev => prev || 'No se encontró el identificador de la persona.');
      return;
    }

    cargarDatos();
  }, [personaID, annoEscolar, userType]);
  
  // Función para iniciar el proceso de pago
  const iniciarPago = (mes) => {
    setSelectedMes(mes);
    setFormPago(prev => ({
      ...prev,
      mesPago: mes.nombre,
      monto: mes.montoPago || '0',
      estudianteID: userType === 'estudiante' ? personaID : '',
    }));
    setPaso(1);
    setShowModal(true);
  };
  
  // Función para manejar cambios en el formulario
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormPago(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Función para manejar la subida del comprobante
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setComprobante(file);
    setPreviewUrl(URL.createObjectURL(file));
  };
  
  // Función para enviar el pago
  const enviarPago = async () => {
    try {
      setProcesandoPago(true);
      setError('');
      
      // Validar campos requeridos
      if (!formPago.estudianteID && userType === 'representante') {
        setError('Debe seleccionar un estudiante');
        setProcesandoPago(false);
        return;
      }
      
      if (!formPago.referencia) {
        setError('Debe ingresar un número de referencia');
        setProcesandoPago(false);
        return;
      }
      
      if (!comprobante) {
        setError('Debe adjuntar un comprobante de pago');
        setProcesandoPago(false);
        return;
      }
      
      const token = localStorage.getItem('token');
      
      // Crear FormData para enviar el archivo
      const formData = new FormData();
      formData.append('estudianteID', formPago.estudianteID);
      formData.append('representanteID', formPago.representanteID);
      formData.append('annoEscolarID', formPago.annoEscolarID);
      formData.append('monto', formPago.monto);
      formData.append('montoMora', formPago.montoMora);
      formData.append('descuento', formPago.descuento);
      formData.append('mesPago', formPago.mesPago);
      formData.append('fechaPago', formPago.fechaPago);
      formData.append('referencia', formPago.referencia);
      formData.append('observaciones', formPago.observaciones);
      formData.append('comprobante', comprobante);
      
      // Enviar solicitud
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/pagos`,
        formData,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );
      
      // Actualizar estado
      setProcesandoPago(false);
      setSuccess('Pago registrado con éxito. Será revisado por administración.');
      setPaso(3); // Paso de confirmación
      
      // Recargar datos
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess();
      }
      
      // Actualizar pagos por mes
      const nuevosPagosPorMes = { ...pagosPorMes };
      if (!nuevosPagosPorMes[formPago.mesPago]) {
        nuevosPagosPorMes[formPago.mesPago] = [];
      }
      // Empujar el objeto pago real si viene envuelto
      const pagoCreado = response?.data?.pago || response?.data;
      nuevosPagosPorMes[formPago.mesPago].push(pagoCreado);
      setPagosPorMes(nuevosPagosPorMes);
      
    } catch (err) {
      console.error('Error al registrar pago:', err);
      setError(err.response?.data?.message || 'Error al registrar el pago. Por favor, intente nuevamente.');
      setProcesandoPago(false);
    }
  };
  
  // Función para cerrar el modal y reiniciar estados
  const cerrarModal = () => {
    setShowModal(false);
    setPaso(1);
    setSelectedMes(null);
    setComprobante(null);
    setPreviewUrl('');
    setFormPago({
      estudianteID: '',
      representanteID: personaID,
      annoEscolarID: annoEscolar?.id || '',
      monto: '',
      montoMora: '0',
      descuento: '0',
      mesPago: '',
      fechaPago: new Date().toISOString().split('T')[0],
      referencia: '',
      observaciones: ''
    });
    setError('');
    setSuccess('');
  };
  
  // Función para obtener el estado del pago de un mes
  const obtenerEstadoPago = (mes) => {
    if (!pagosPorMes[mes.nombre] || pagosPorMes[mes.nombre].length === 0) {
      return 'pendiente';
    }
    
    // Verificar si hay algún pago aprobado
    const pagosAprobados = pagosPorMes[mes.nombre].filter(p => p.estado === 'pagado');
    if (pagosAprobados.length > 0) {
      return 'pagado';
    }
    
    // Verificar si hay algún pago pendiente
    const pagosPendientes = pagosPorMes[mes.nombre].filter(p => p.estado === 'pendiente');
    if (pagosPendientes.length > 0) {
      return 'en_revision';
    }
    
    return 'pendiente';
  };
  
  // Función para obtener el último pago de un mes
  const obtenerUltimoPago = (mes) => {
    if (!pagosPorMes[mes.nombre] || pagosPorMes[mes.nombre].length === 0) {
      return null;
    }
    
    // Ordenar por fecha de creación (más reciente primero)
    const pagosOrdenados = [...pagosPorMes[mes.nombre]].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    return pagosOrdenados[0];
  };
  
  // Renderizar el paso actual del modal
  const renderPasoModal = () => {
    switch (paso) {
      case 1: // Selección de estudiante (solo para representante)
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium">Mensualidad seleccionada</h3>
              <div className="mt-2 flex justify-between">
                <span>{selectedMes.nombre} {annoEscolar?.periodo}</span>
                <span className="font-semibold">
                  <div>${Number(selectedMes.montoPago).toFixed(2)}</div>
                  <div className="text-xs text-slate-500">
                    Bs. {(Number(selectedMes.montoPago) * 35).toFixed(2)}
                  </div>
                </span>
              </div>
            </div>
            
            {userType === 'representante' && estudiantes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccione el estudiante
                </label>
                <select
                  name="estudianteID"
                  value={formPago.estudianteID}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccione un estudiante</option>
                  {estudiantes.map(estudiante => (
                    <option key={estudiante.id} value={estudiante.id}>
                      {estudiante.nombre} {estudiante.apellido}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={cerrarModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (userType === 'representante' && !formPago.estudianteID) {
                    setError('Debe seleccionar un estudiante');
                    return;
                  }
                  setError('');
                  setPaso(2);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Continuar
              </button>
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
          </div>
        );
        
      case 2: // Información del pago
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium">Detalles del pago</h3>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div>Mes:</div>
                <div className="font-medium">{selectedMes.nombre} {annoEscolar?.periodo}</div>
                
                <div>Monto:</div>
                <div className="font-medium">
                  ${Number(selectedMes.montoPago).toFixed(2)}
                  <div className="text-xs text-slate-500">
                    Bs. {(Number(selectedMes.montoPago) * 35).toFixed(2)}
                  </div>
                </div>
                
                {userType === 'representante' && (
                  <>
                    <div>Estudiante:</div>
                    <div className="font-medium">
                      {estudiantes.find(e => e.id === parseInt(formPago.estudianteID))?.nombre} {estudiantes.find(e => e.id === parseInt(formPago.estudianteID))?.apellido}
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de referencia
              </label>
              <input
                type="text"
                name="referencia"
                value={formPago.referencia}
                onChange={handleFormChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Ej: 1234567890"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comprobante de pago
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="comprobante-upload"
                  ref={fileInputRef}
                />
                <label htmlFor="comprobante-upload" className="cursor-pointer">
                  {!comprobante ? (
                    <div className="space-y-2">
                      <div className="mx-auto w-12 h-12 text-gray-400">
                        <FaFileUpload className="w-full h-full" />
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Adjunte aquí el comprobante (screenshot, pdf) de transferencia o pago móvil</p>
                        <p className="mt-1 text-xs">Haga clic para subir o arrastre y suelte</p>
                        <p className="mt-1 text-xs">JPG, PNG o PDF (máx. 5MB)</p>
                      </div>
                      <div className="mt-2 text-xs text-amber-600 font-medium">
                        <p>Para pagos en efectivo, diríjase al plantel educativo</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {previewUrl && previewUrl.includes('image') ? (
                        <img src={previewUrl} alt="Vista previa" className="max-h-40 mx-auto" />
                      ) : (
                        <div className="mx-auto w-12 h-12 text-gray-400">
                          <FaFileUpload className="w-full h-full" />
                        </div>
                      )}
                      <div className="text-sm text-gray-600">
                        {comprobante.name} ({Math.round(comprobante.size / 1024)} KB)
                      </div>
                      <div className="text-xs text-blue-600">
                        Haga clic para cambiar
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones (opcional)
              </label>
              <textarea
                name="observaciones"
                value={formPago.observaciones}
                onChange={handleFormChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Información adicional sobre el pago..."
              />
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setPaso(1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={enviarPago}
                disabled={procesandoPago}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {procesandoPago ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Procesando...
                  </>
                ) : (
                  'Enviar pago'
                )}
              </button>
            </div>
          </div>
        );
        
      case 3: // Confirmación
        return (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 text-green-500">
              <FaCheck className="w-full h-full" />
            </div>
            <h2 className="mt-4 text-xl font-medium text-gray-900">¡Pago registrado con éxito!</h2>
            <p className="mt-2 text-gray-600">
              Su pago ha sido registrado y está en proceso de revisión. 
              Recibirá una notificación cuando sea aprobado.
            </p>
            <button
              type="button"
              onClick={cerrarModal}
              className="mt-6 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Cerrar
            </button>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  // Renderizar tarjeta de mes
  const renderTarjetaMes = (mes) => {
    const estadoPago = obtenerEstadoPago(mes);
    const ultimoPago = obtenerUltimoPago(mes);
    
    let estadoClase = 'bg-gray-100';
    let estadoTexto = 'Pendiente';
    let estadoIcono = null;
    
    if (estadoPago === 'pagado') {
      estadoClase = 'bg-green-100 border-green-200';
      estadoTexto = 'Pagado';
      estadoIcono = <FaCheck className="text-green-500" />;
    } else if (estadoPago === 'en_revision') {
      estadoClase = 'bg-yellow-100 border-yellow-200';
      estadoTexto = 'En revisión';
      estadoIcono = <FaSpinner className="text-yellow-500" />;
    } else {
      estadoClase = 'bg-gray-100 border-gray-200';
      estadoTexto = 'Pendiente';
      estadoIcono = <FaInfoCircle className="text-gray-500" />;
    }
    
    return (
      <div className={`border rounded-lg overflow-hidden shadow-sm ${estadoClase}`}>
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">{mes.nombre}</h3>
              <p className="text-sm text-gray-500">{annoEscolar?.periodo}</p>
            </div>
            <div className="text-right">
              <div className="font-bold">${Number(mes.montoPago).toFixed(2)}</div>
              <div className="text-xs text-gray-500">Bs. {(Number(mes.montoPago) * 35).toFixed(2)}</div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-1 text-sm">
              {estadoIcono}
              <span>{estadoTexto}</span>
            </div>
            
            {ultimoPago && (
              <div className="text-xs text-gray-500 flex items-center">
                <FaCalendarAlt className="mr-1" />
                {new Date(ultimoPago.fechaPago).toLocaleDateString('es-VE')}
              </div>
            )}
          </div>
          
          {ultimoPago && ultimoPago.urlComprobante && (
            <div className="mt-2 text-xs flex items-center text-blue-600">
              <FaEye className="mr-1" />
              <a 
                href={ultimoPago.urlComprobante} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Ver comprobante
              </a>
            </div>
          )}
        </div>
        
        <div className="bg-white p-3 border-t">
          <button
            onClick={() => iniciarPago(mes)}
            disabled={estadoPago === 'pagado'}
            className={`w-full py-2 px-4 rounded-md text-sm font-medium ${
              estadoPago === 'pagado' 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {estadoPago === 'pagado' ? 'Pagado' : 'Pagar'}
          </button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center">
          <FaMoneyBillWave className="mr-2 text-blue-600" />
          Gestión de Pagos
        </h2>
        <div className="text-sm text-gray-500">
          Año Escolar: {annoEscolar?.periodo || 'No disponible'}
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <FaSpinner className="animate-spin text-blue-600 text-3xl" />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {error}
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-gray-600">
              Seleccione el mes que desea pagar. Los pagos serán revisados por administración antes de ser aprobados.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mesesPago.map(mes => (
              <div key={mes.id || mes.nombre}>
                {renderTarjetaMes(mes)}
              </div>
            ))}
          </div>
          
          {mesesPago.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay meses disponibles para pago en este momento.
            </div>
          )}
        </>
      )}
      
      {/* Modal de pago */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                      <FaMoneyBillWave className="mr-2 text-blue-600" />
                      {paso === 3 ? 'Confirmación de Pago' : 'Registrar Pago'}
                    </h3>
                    <div className="mt-4">
                      {renderPasoModal()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionPagos;