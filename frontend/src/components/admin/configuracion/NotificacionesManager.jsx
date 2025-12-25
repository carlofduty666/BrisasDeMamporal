import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  FaBell,
  FaEnvelope,
  FaUsers,
  FaUserGraduate,
  FaUserTie,
  FaChalkboardTeacher,
  FaUserShield,
  FaFilter,
  FaPaperPlane,
  FaEye,
  FaHistory,
  FaTimes,
  FaCheck,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaInfoCircle,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner
} from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:000';

const NOTIFICATION_TYPES = [
  { value: 'grado_publicado', label: 'Calificación Publicada', icon: FaUserGraduate, color: 'blue' },
  { value: 'alerta_riesgo', label: 'Alerta de Riesgo Académico', icon: FaExclamationTriangle, color: 'red' },
  { value: 'inasistencia', label: 'Inasistencia', icon: FaCalendarAlt, color: 'orange' },
  { value: 'cambio_horario', label: 'Cambio de Horario', icon: FaCalendarAlt, color: 'purple' },
  { value: 'factura_generada', label: 'Factura Generada', icon: FaMoneyBillWave, color: 'green' },
  { value: 'pago_recibido', label: 'Pago Recibido', icon: FaCheckCircle, color: 'green' },
  { value: 'pago_vencido', label: 'Pago Vencido', icon: FaTimesCircle, color: 'red' },
  { value: 'recordatorio_pago', label: 'Recordatorio de Pago', icon: FaMoneyBillWave, color: 'yellow' },
  { value: 'calculo_mora', label: 'Cálculo de Mora', icon: FaMoneyBillWave, color: 'orange' },
  { value: 'comunicado_general', label: 'Comunicado General', icon: FaBell, color: 'gray' },
  { value: 'evento_calendario', label: 'Evento de Calendario', icon: FaCalendarAlt, color: 'indigo' },
  { value: 'reunion_convocada', label: 'Reunión Convocada', icon: FaUsers, color: 'purple' },
  { value: 'emergencia', label: 'Emergencia', icon: FaExclamationTriangle, color: 'red' },
  { value: 'otro', label: 'Otro', icon: FaInfoCircle, color: 'gray' }
];

const DESTINATARIOS_TIPOS = [
  { value: 'todos', label: 'Todos los Usuarios', icon: FaUsers, description: 'Enviar a todos' },
  { value: 'estudiantes', label: 'Estudiantes', icon: FaUserGraduate, description: 'Solo estudiantes' },
  { value: 'representantes', label: 'Representantes', icon: FaUserTie, description: 'Solo representantes' },
  { value: 'profesores', label: 'Profesores', icon: FaChalkboardTeacher, description: 'Solo profesores' },
  { value: 'empleados', label: 'Empleados', icon: FaUserShield, description: 'Solo empleados' },
  { value: 'administradores', label: 'Administradores', icon: FaUserShield, description: 'Solo administradores' },
  { value: 'personalizado', label: 'Personalizado', icon: FaFilter, description: 'Selección manual' }
];

const NotificacionesManager = () => {
  const [activeTab, setActiveTab] = useState('crear');
  const [formData, setFormData] = useState({
    tipo: 'comunicado_general',
    titulo: '',
    mensaje: '',
    canal: 'ambos',
    destinatariosTipo: 'todos',
    destinatariosIDs: [],
    filtros: {}
  });
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [destinatarios, setDestinatarios] = useState([]);
  const [destinatariosLoading, setDestinatariosLoading] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [filtrosAvanzados, setFiltrosAvanzados] = useState({
    pagosVencidos: false,
    gradoID: null,
    seccionID: null,
    busqueda: '',
    cargoProfesion: null
  });
  const [grados, setGrados] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [profesiones, setProfesiones] = useState([]);
  const [gradosLoading, setGradosLoading] = useState(false);


  useEffect(() => {
    if (activeTab === 'historial') {
      cargarHistorial();
    }
  }, [activeTab]);

  useEffect(() => {
    cargarGradosYSecciones();
  }, []);

  useEffect(() => {
    if (formData.destinatariosTipo) {
      cargarDestinatarios();
    }
  }, [formData.destinatariosTipo, filtrosAvanzados]);

  const cargarDestinatarios = async () => {
    setDestinatariosLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/notificaciones/destinatarios`,
        {
          tipo: formData.destinatariosTipo,
          filtros: filtrosAvanzados
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setDestinatarios(response.data.destinatarios || []);
    } catch (error) {
      console.error('Error al cargar destinatarios:', error);
      toast.error('Error al cargar destinatarios');
    } finally {
      setDestinatariosLoading(false);
    }
  };

  const cargarHistorial = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/notificaciones`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistorial(response.data.notificaciones || []);
    } catch (error) {
      console.error('Error al cargar historial:', error);
      toast.error('Error al cargar historial');
    }
  };

  const cargarGradosYSecciones = async () => {
    setGradosLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [gradosRes, seccionesRes, profesionesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/grados`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/secciones`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/personas/profesiones-administrativos`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setGrados(gradosRes.data || []);
      setSecciones(seccionesRes.data || []);
      setProfesiones(profesionesRes.data || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setGradosLoading(false);
    }
  };


  const cargarProfesiones = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/personas/profesiones-administrativos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfesiones(response.data || []);
    } catch (error) {
      console.error('Error al cargar profesiones:', error);
    }
  };

  const obtenerFiltrosDisponibles = () => {
  const base = {
    busqueda: true
  };
  
  switch(formData.destinatariosTipo) {
    case 'estudiantes':
      return { ...base, gradoID: true, seccionID: true, pagosVencidos: false };
    case 'representantes':
      return { ...base, gradoID: true, seccionID: true, pagosVencidos: true };
    case 'profesores':
      return { ...base, gradoID: true, seccionID: true };
    case 'empleados':
      return { ...base, cargoProfesion: true };
    case 'administradores':
      return { ...base };
    default:
      return base;
  }
};



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (id) => {
    setFormData(prev => {
      const newIDs = prev.destinatariosIDs.includes(id)
        ? prev.destinatariosIDs.filter(item => item !== id)
        : [...prev.destinatariosIDs, id];
      return { ...prev, destinatariosIDs: newIDs };
    });
  };

  const handleSelectAll = () => {
    if (formData.destinatariosIDs.length === destinatarios.length) {
      setFormData(prev => ({ ...prev, destinatariosIDs: [] }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        destinatariosIDs: destinatarios.map(d => d.id) 
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.titulo || !formData.mensaje) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    if (formData.destinatariosTipo === 'personalizado' && formData.destinatariosIDs.length === 0) {
      toast.error('Por favor seleccione al menos un destinatario');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const notificationType = NOTIFICATION_TYPES.find(t => t.value === formData.tipo);
      
      const dataToSend = {
        ...formData,
        filtros: Object.keys(filtrosAvanzados).some(key => filtrosAvanzados[key]) 
          ? filtrosAvanzados 
          : null,
        colorTema: notificationType?.color || 'gray',
        icono: notificationType?.icon?.name || 'FaBell'
      };

      const createResponse = await axios.post(
        `${API_BASE_URL}/notificaciones`,
        dataToSend,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const notificacionId = createResponse.data.notificacion.id;

      const sendResponse = await axios.post(
        `${API_BASE_URL}/notificaciones/${notificacionId}/enviar`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success(
        `Notificación enviada exitosamente a ${sendResponse.data.totalDestinatarios} destinatarios`
      );

      setFormData({
        tipo: 'comunicado_general',
        titulo: '',
        mensaje: '',
        canal: 'ambos',
        destinatariosTipo: 'todos',
        destinatariosIDs: [],
        filtros: {}
      });
      setFiltrosAvanzados({
        pagosVencidos: false,
        gradoID: null,
        seccionID: null,
        profesoresDeGrado: null,
        profesoresDeSeccion: null,
        representantesDeGrado: null,
        representantesDeSeccion: null
      });
      setTipoFiltroAvanzado(null);

    } catch (error) {
      console.error('Error al enviar notificación:', error);
      toast.error(error.response?.data?.message || 'Error al enviar notificación');
    } finally {
      setLoading(false);
    }
  };

  const selectedNotifType = NOTIFICATION_TYPES.find(t => t.value === formData.tipo);
  const NotifIcon = selectedNotifType?.icon || FaBell;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100">
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl rounded-2xl mb-8">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-700/30 to-transparent"></div>
        
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-pink-600/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl"></div>

        <div className="relative px-6 py-12">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-pink-600/40 rounded-xl backdrop-blur-sm border border-pink-500/30">
              <FaBell className="w-8 h-8 text-pink-200" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">
                Sistema de Notificaciones
              </h1>
              <p className="text-gray-300 text-lg mt-1">
                Gestiona y envía notificaciones a los usuarios del sistema
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm font-medium">Destinatarios Disponibles</p>
                  <p className="text-2xl font-bold text-white">
                    {destinatariosLoading ? '...' : destinatarios.length}
                  </p>
                </div>
                <FaUsers className="w-6 h-6 text-pink-300" />
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm font-medium">Notificaciones Enviadas</p>
                  <p className="text-2xl font-bold text-white">{historial.length}</p>
                </div>
                <FaHistory className="w-6 h-6 text-pink-300" />
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm font-medium">Canal de Envío</p>
                  <p className="text-lg font-bold text-pink-200">
                    {formData.canal === 'ambos' ? 'Email + App' : formData.canal === 'email' ? 'Email' : 'App'}
                  </p>
                </div>
                <FaEnvelope className="w-6 h-6 text-pink-300" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('crear')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
            activeTab === 'crear'
              ? 'bg-gradient-to-r from-pink-600 to-pink-700 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <FaBell />
          Crear Notificación
        </button>
        <button
          onClick={() => setActiveTab('historial')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
            activeTab === 'historial'
              ? 'bg-gradient-to-r from-pink-600 to-pink-700 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <FaHistory />
          Historial
        </button>
      </div>

      {activeTab === 'crear' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FaBell className="text-pink-600" />
                Nueva Notificación
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Notificación
                  </label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  >
                    {NOTIFICATION_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título de la Notificación *
                  </label>
                  <input
                    type="text"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleInputChange}
                    placeholder="Ej: Importante: Recordatorio de pago"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje *
                  </label>
                  <textarea
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder="Escribe el mensaje que deseas enviar..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Canal de Envío
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['email', 'in_app', 'ambos'].map(canal => (
                      <button
                        key={canal}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, canal }))}
                        className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                          formData.canal === canal
                            ? 'bg-gradient-to-r from-pink-600 to-pink-700 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {canal === 'email' && <><FaEnvelope className="inline mr-2" />Email</>}
                        {canal === 'in_app' && <><FaBell className="inline mr-2" />App</>}
                        {canal === 'ambos' && <><FaBell className="inline mr-2" />Ambos</>}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Destinatarios
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {DESTINATARIOS_TIPOS.map(tipo => {
                      const TipoIcon = tipo.icon;
                      return (
                        <button
                          key={tipo.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ 
                            ...prev, 
                            destinatariosTipo: tipo.value,
                            destinatariosIDs: []
                          }))}
                          className={`p-3 rounded-xl border-2 transition-all duration-300 text-left ${
                            formData.destinatariosTipo === tipo.value
                              ? 'border-pink-500 bg-pink-50'
                              : 'border-gray-200 bg-white hover:border-pink-300'
                          }`}
                        >
                          <TipoIcon className={`w-5 h-5 mb-2 ${
                            formData.destinatariosTipo === tipo.value ? 'text-pink-600' : 'text-gray-400'
                          }`} />
                          <div className="text-sm font-medium text-gray-800">{tipo.label}</div>
                          <div className="text-xs text-gray-500">{tipo.description}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {['estudiantes', 'representantes', 'profesores', 'empleados', 'administradores'].includes(formData.destinatariosTipo) && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <FaFilter className="text-gray-600" />
                      <h3 className="font-semibold text-gray-800">Filtros Avanzados</h3>
                    </div>
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Buscar por nombre, apellido, cédula..."
                        value={filtrosAvanzados.busqueda}
                        onChange={(e) => setFiltrosAvanzados(prev => ({ ...prev, busqueda: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                      />

                      {['estudiantes', 'representantes', 'profesores'].includes(formData.destinatariosTipo) && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Grado</label>
                          <select
                            value={filtrosAvanzados.gradoID || ''}
                            onChange={(e) => setFiltrosAvanzados(prev => ({ 
                              ...prev, 
                              gradoID: e.target.value ? parseInt(e.target.value) : null,
                              seccionID: null
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="">Todos los grados</option>
                            {grados.map(grado => (
                              <option key={grado.id} value={grado.id}>
                                {grado.nombre_grado}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {['estudiantes', 'representantes', 'profesores'].includes(formData.destinatariosTipo) && filtrosAvanzados.gradoID && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Sección</label>
                          <select
                            value={filtrosAvanzados.seccionID || ''}
                            onChange={(e) => setFiltrosAvanzados(prev => ({ ...prev, seccionID: e.target.value ? parseInt(e.target.value) : null }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="">Todas las secciones</option>
                            {secciones
                              .filter(s => s.gradoID === filtrosAvanzados.gradoID)
                              .map(seccion => (
                                <option key={seccion.id} value={seccion.id}>
                                  {seccion.nombre_seccion}
                                </option>
                              ))}
                          </select>
                        </div>
                      )}

                      {formData.destinatariosTipo === 'representantes' && (
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filtrosAvanzados.pagosVencidos}
                            onChange={(e) => setFiltrosAvanzados(prev => ({ ...prev, pagosVencidos: e.target.checked }))}
                            className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                          />
                          <span className="text-sm text-gray-700">Solo con pagos vencidos</span>
                        </label>
                      )}

                      {formData.destinatariosTipo === 'empleados' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Cargo/Profesión</label>
                          <select
                            value={filtrosAvanzados.cargoProfesion || ''}
                            onChange={(e) => setFiltrosAvanzados(prev => ({ ...prev, cargoProfesion: e.target.value || null }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="">Todos los cargos</option>
                            {profesiones.map(prof => (
                              <option key={prof} value={prof}>
                                {prof}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane />
                        Enviar Notificación
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode(!previewMode)}
                    className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 flex items-center gap-2"
                  >
                    <FaEye />
                    Vista Previa
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            {previewMode && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaEye className="text-pink-600" />
                  Vista Previa
                </h3>
                <div className={`p-4 rounded-xl bg-gradient-to-br from-${selectedNotifType?.color}-50 to-white border-2 border-${selectedNotifType?.color}-200`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 bg-${selectedNotifType?.color}-100 rounded-lg`}>
                      <NotifIcon className={`w-5 h-5 text-${selectedNotifType?.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 mb-1">
                        {formData.titulo || 'Título de la notificación'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {formData.mensaje || 'El mensaje aparecerá aquí...'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaUsers className="text-pink-600" />
                Destinatarios ({destinatariosLoading ? '...' : destinatarios.length})
              </h3>

              {['empleados', 'estudiantes', 'representantes', 'profesores', 'administradores'].includes(formData.destinatariosTipo) && destinatarios.length > 0 && (
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                  >
                    {formData.destinatariosIDs.length === destinatarios.length 
                      ? 'Deseleccionar todos' 
                      : 'Seleccionar todos'}
                  </button>
                </div>
              )}

              <div className="max-h-96 overflow-y-auto space-y-2">
                {destinatariosLoading ? (
                  <div className="text-center py-8">
                    <FaSpinner className="animate-spin w-6 h-6 text-pink-600 mx-auto" />
                    <p className="text-sm text-gray-500 mt-2">Cargando destinatarios...</p>
                  </div>
                ) : destinatarios.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No hay destinatarios disponibles
                  </p>
                ) : ['empleados', 'estudiantes', 'representantes', 'profesores', 'administradores'].includes(formData.destinatariosTipo) ? (
                  destinatarios.map(dest => (
                    <label
                      key={dest.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.destinatariosIDs.includes(dest.id)}
                        onChange={() => handleCheckboxChange(dest.id)}
                        className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-800">
                          {dest.nombre} {dest.apellido}
                        </div>
                        <div className="text-xs text-gray-500">{dest.email}</div>
                        {dest.profesion && <div className="text-xs text-pink-600">{dest.profesion}</div>}
                      </div>
                    </label>
                  ))
                ) : (
                  <div className="space-y-2">
                    {destinatarios.slice(0, 10).map(dest => (
                      <div key={dest.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-800">
                          {dest.nombre} {dest.apellido}
                        </div>
                        <div className="text-xs text-gray-500">{dest.email}</div>
                      </div>
                    ))}
                    {destinatarios.length > 10 && (
                      <p className="text-xs text-gray-500 text-center pt-2">
                        Y {destinatarios.length - 10} más...
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'historial' && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FaHistory className="text-pink-600" />
            Historial de Notificaciones
          </h2>

          {historial.length === 0 ? (
            <div className="text-center py-12">
              <FaBell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay notificaciones enviadas aún</p>
            </div>
          ) : (
            <div className="space-y-4">
              {historial.map(notif => {
                const notifType = NOTIFICATION_TYPES.find(t => t.value === notif.tipo);
                const NIcon = notifType?.icon || FaBell;
                
                return (
                  <div
                    key={notif.id}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 bg-${notifType?.color}-100 rounded-lg`}>
                        <NIcon className={`w-5 h-5 text-${notifType?.color}-600`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-800">{notif.titulo}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            notif.estado === 'enviado' 
                              ? 'bg-green-100 text-green-700'
                              : notif.estado === 'fallido'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {notif.estado === 'enviado' && <FaCheckCircle className="inline mr-1" />}
                            {notif.estado === 'fallido' && <FaTimesCircle className="inline mr-1" />}
                            {notif.estado}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{notif.mensaje}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>
                            <FaUsers className="inline mr-1" />
                            {notif.totalDestinatarios} destinatarios
                          </span>
                          <span>
                            <FaCheckCircle className="inline mr-1 text-green-600" />
                            {notif.exitosos} exitosos
                          </span>
                          {notif.fallidos > 0 && (
                            <span>
                              <FaTimesCircle className="inline mr-1 text-red-600" />
                              {notif.fallidos} fallidos
                            </span>
                          )}
                          <span>
                            <FaCalendarAlt className="inline mr-1" />
                            {new Date(notif.createdAt).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificacionesManager;
