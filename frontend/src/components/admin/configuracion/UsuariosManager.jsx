import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaUsers,
  FaEdit,
  FaTrash,
  FaKey,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaEye,
  FaEyeSlash,
  FaClock,
  FaEnvelope,
  FaIdCard,
  FaPhone,
  FaCheckCircle,
  FaExclamationCircle,
  FaSearch,
  FaPlus,
  FaShieldAlt
} from 'react-icons/fa';
import { FaShield } from "react-icons/fa6";
import * as usuariosService from '../../../services/usuarios.service';
import * as permisosService from '../../../services/permisos.service';
import * as authService from '../../../services/auth.service';
import { toast } from 'react-toastify';
import { formatearCedula } from '../../../utils/formatters';
import ModalRestablecerPassword from './modal/ModalRestablecerPassword';
import ModalEliminarUsuario from './modal/ModalEliminarUsuario';
import ModalGestionarPermisos from './modal/ModalGestionarPermisos';
import ModalCambiarEstado from './modal/ModalCambiarEstado';

const ROLE_COLORS = {
  'owner': { bg: 'bg-purple-100', text: 'text-purple-800', badge: 'bg-purple-600' },
  'adminWeb': { bg: 'bg-blue-100', text: 'text-blue-800', badge: 'bg-blue-600' },
  'administrativo': { bg: 'bg-orange-100', text: 'text-orange-800', badge: 'bg-orange-600' },
  'profesor': { bg: 'bg-green-100', text: 'text-green-800', badge: 'bg-green-600' },
  'estudiante': { bg: 'bg-indigo-100', text: 'text-indigo-800', badge: 'bg-indigo-600' },
  'representante': { bg: 'bg-cyan-100', text: 'text-cyan-800', badge: 'bg-cyan-600' }
};

const ROLE_LABELS = {
  'owner': 'Propietario',
  'adminWeb': 'Administrador',
  'administrativo': 'Administrativo',
  'profesor': 'Profesor',
  'estudiante': 'Estudiante',
  'representante': 'Representante'
};

const ESTADO_COLORS = {
  'activo': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', label: 'Activo' },
  'suspendido': { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', label: 'Suspendido' },
  'desactivado': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', label: 'Desactivado' },
  'inactivo': { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', label: 'Inactivo' }
};

const ESTADOS = ['activo', 'suspendido', 'desactivado', 'inactivo'];

const UsuariosManager = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [filtrados, setFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('tabla'); // 'tabla' o 'tarjetas'
  const [allPermisos, setAllPermisos] = useState([]);

  // Estados para modal de restablecer contraseña
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [passwordNueva, setPasswordNueva] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargandoPassword, setCargandoPassword] = useState(false);

  // Estados para modal de eliminar
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [usuarioParaEliminar, setUsuarioParaEliminar] = useState(null);
  const [cargandoDelete, setCargandoDelete] = useState(false);

  // Estados para modal de permisos
  const [showModalPermisos, setShowModalPermisos] = useState(false);
  const [usuarioPermisosSeleccionado, setUsuarioPermisosSeleccionado] = useState(null);
  const [usuarioPermisosActuales, setUsuarioPermisosActuales] = useState([]);
  const [permisosSeleccionados, setPermisosSeleccionados] = useState(new Set());
  const [cargandoPermisos, setCargandoPermisos] = useState(false);

  // Estados para modal de estado de usuario
  const [showModalEstado, setShowModalEstado] = useState(false);
  const [usuarioEstadoSeleccionado, setUsuarioEstadoSeleccionado] = useState(null);
  const [estadoNuevo, setEstadoNuevo] = useState('activo');
  const [cargandoEstado, setCargandoEstado] = useState(false);

  // Estado para usuario actual
  const [usuarioActual, setUsuarioActual] = useState(null);

  // Obtener usuario actual en el montaje del componente
  useEffect(() => {
    const user = authService.getCurrentUser();
    setUsuarioActual(user);
  }, []);

  // Función para verificar si el usuario actual es administrador
  const esAdministrador = () => {
    if (!usuarioActual || !usuarioActual.persona_roles) return false;
    const rolesAdmin = ['owner', 'adminWeb', 'administrativo'];
    return usuarioActual.persona_roles.some(r => rolesAdmin.includes(r.rol?.nombre));
  };

  // Función para verificar si un usuario puede tener permisos gestionados
  const puedeTenerPermisos = (usuario) => {
    if (!usuario || !usuario.persona) return false;
    const tiposAdmin = ['owner', 'adminWeb', 'administrativo'];
    return tiposAdmin.includes(usuario.persona.tipo);
  };

  // Cargar usuarios y permisos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usuariosData, permisosData] = await Promise.all([
          usuariosService.getAllUsuarios(),
          permisosService.getAllPermisos()
        ]);
        setUsuarios(usuariosData);
        setFiltrados(usuariosData);
        setAllPermisos(permisosData);
        setError('');
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos');
        toast.error('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar usuarios
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = usuarios.filter(usuario => 
      usuario.email.toLowerCase().includes(term) ||
      usuario.persona?.nombre.toLowerCase().includes(term) ||
      usuario.persona?.apellido.toLowerCase().includes(term) ||
      usuario.persona?.cedula?.includes(term)
    );
    setFiltrados(filtered);
  }, [searchTerm, usuarios]);

  // Manejar restablecer contraseña
  const handleAbrirModalPassword = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setPasswordNueva('');
    setMostrarPassword(false);
    setShowModalPassword(true);
  };

  const handleCerrarModalPassword = () => {
    setShowModalPassword(false);
    setUsuarioSeleccionado(null);
    setPasswordNueva('');
    setMostrarPassword(false);
  };

  const generarPasswordTemporal = () => {
    const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-2).toUpperCase();
    setPasswordNueva(password);
  };

  const handleRestablecerPassword = async () => {
    if (!passwordNueva.trim()) {
      toast.error('Por favor ingresa una contraseña');
      return;
    }

    try {
      setCargandoPassword(true);
      await usuariosService.restablecerPassword(usuarioSeleccionado.id, passwordNueva);
      
      // Actualizar usuario en la lista
      const usuarioActualizado = await usuariosService.getUsuarioById(usuarioSeleccionado.id);
      setUsuarios(usuarios.map(u => u.id === usuarioSeleccionado.id ? usuarioActualizado : u));
      
      toast.success('Contraseña restablecida correctamente');
      handleCerrarModalPassword();
      setSuccess('Contraseña restablecida correctamente');
    } catch (err) {
      console.error('Error al restablecer contraseña:', err);
      toast.error(err.message || 'Error al restablecer contraseña');
      setError(err.message || 'Error al restablecer contraseña');
    } finally {
      setCargandoPassword(false);
    }
  };

  // Manejar verificación
  const handleVerificar = async (usuario) => {
    try {
      await usuariosService.verificarUsuario(usuario.id);
      const usuarioActualizado = await usuariosService.getUsuarioById(usuario.id);
      setUsuarios(usuarios.map(u => u.id === usuario.id ? usuarioActualizado : u));
      toast.success('Usuario verificado correctamente');
    } catch (err) {
      console.error('Error al verificar usuario:', err);
      toast.error(err.message || 'Error al verificar usuario');
    }
  };

  // Manejar eliminar
  const handleAbrirModalDelete = (usuario) => {
    setUsuarioParaEliminar(usuario);
    setShowModalDelete(true);
  };

  const handleCerrarModalDelete = () => {
    setShowModalDelete(false);
    setUsuarioParaEliminar(null);
  };

  const handleEliminarUsuario = async () => {
    try {
      setCargandoDelete(true);
      await usuariosService.deleteUsuario(usuarioParaEliminar.id);
      setUsuarios(usuarios.filter(u => u.id !== usuarioParaEliminar.id));
      toast.success('Usuario eliminado correctamente');
      handleCerrarModalDelete();
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      toast.error(err.message || 'Error al eliminar usuario');
    } finally {
      setCargandoDelete(false);
    }
  };

  // Manejar modal de permisos
  const handleAbrirModalPermisos = async (usuario) => {
    try {
      setUsuarioPermisosSeleccionado(usuario);
      const permisosUser = await permisosService.getPermisosByUsuario(usuario.id);
      setUsuarioPermisosActuales(permisosUser);
      setPermisosSeleccionados(new Set(permisosUser.map(p => p.id)));
      setShowModalPermisos(true);
    } catch (err) {
      console.error('Error al cargar permisos:', err);
      toast.error('Error al cargar permisos');
    }
  };

  const handleCerrarModalPermisos = () => {
    setShowModalPermisos(false);
    setUsuarioPermisosSeleccionado(null);
    setUsuarioPermisosActuales([]);
    setPermisosSeleccionados(new Set());
  };

  const handleTogglePermiso = (permisoID) => {
    const newSet = new Set(permisosSeleccionados);
    if (newSet.has(permisoID)) {
      newSet.delete(permisoID);
    } else {
      newSet.add(permisoID);
    }
    setPermisosSeleccionados(newSet);
  };

  const handleGuardarPermisos = async () => {
    try {
      setCargandoPermisos(true);
      const permisoIDs = Array.from(permisosSeleccionados);
      await permisosService.asignarMultiplesPermisosUsuario(usuarioPermisosSeleccionado.id, permisoIDs);
      toast.success('Permisos actualizados correctamente');
      handleCerrarModalPermisos();
      // Recargar usuarios
      const usuariosActualizados = await usuariosService.getAllUsuarios();
      setUsuarios(usuariosActualizados);
      setFiltrados(usuariosActualizados);
    } catch (err) {
      console.error('Error al guardar permisos:', err);
      toast.error(err.message || 'Error al guardar permisos');
    } finally {
      setCargandoPermisos(false);
    }
  };

  // Manejar modal de estado de usuario
  const handleAbrirModalEstado = (usuario) => {
    setUsuarioEstadoSeleccionado(usuario);
    setEstadoNuevo(usuario.estado || 'activo');
    setShowModalEstado(true);
  };

  const handleCerrarModalEstado = () => {
    setShowModalEstado(false);
    setUsuarioEstadoSeleccionado(null);
    setEstadoNuevo('activo');
  };

  const handleGuardarEstado = async () => {
    try {
      if (estadoNuevo === usuarioEstadoSeleccionado.estado) {
        toast.info('El estado es el mismo');
        return;
      }

      setCargandoEstado(true);
      await usuariosService.cambiarEstadoUsuario(usuarioEstadoSeleccionado.id, estadoNuevo);
      
      toast.success(`Estado cambió a ${ESTADO_COLORS[estadoNuevo].label}`);
      handleCerrarModalEstado();
      
      // Recargar usuarios
      const usuariosActualizados = await usuariosService.getAllUsuarios();
      setUsuarios(usuariosActualizados);
      setFiltrados(usuariosActualizados);
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      toast.error(err.message || 'Error al cambiar estado');
    } finally {
      setCargandoEstado(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Nunca';
    return new Date(fecha).toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-gray-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl rounded-2xl mb-8">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative px-6 py-12">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/admin/configuracion')}
              className="p-3 bg-gray-700/40 rounded-xl hover:bg-gray-700/60 transition-colors duration-200"
            >
              <FaArrowLeft className="w-5 h-5 text-gray-300" />
            </button>
            <div>
              <h1 className="text-4xl font-bold text-white">Gestión de Usuarios</h1>
              <p className="text-gray-300 text-lg mt-1">Administra usuarios y permisos del sistema</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Total de Usuarios</p>
                  <p className="text-2xl font-bold text-white">{usuarios.length}</p>
                </div>
                <FaUsers className="w-8 h-8 text-gray-300 opacity-50" />
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Verificados</p>
                  <p className="text-2xl font-bold text-green-400">
                    {usuarios.filter(u => u.verificado).length}
                  </p>
                </div>
                <FaCheckCircle className="w-8 h-8 text-green-400 opacity-50" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o cédula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('tabla')}
            className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
              viewMode === 'tabla'
                ? 'bg-gray-700 text-white shadow-lg'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Tabla
          </button>
          <button
            onClick={() => setViewMode('tarjetas')}
            className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
              viewMode === 'tarjetas'
                ? 'bg-gray-700 text-white shadow-lg'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Tarjetas
          </button>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3">
          <FaExclamationCircle className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex gap-3">
          <FaCheckCircle className="text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-700">{success}</p>
        </div>
      )}

      {/* Vista Tabla */}
      {viewMode === 'tabla' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {filtrados.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Usuario</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Rol</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Teléfono</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Estado</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Último Login</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtrados.map((usuario, idx) => (
                    <tr
                      key={usuario.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg flex items-center justify-center text-white font-semibold">
                            {usuario.persona?.nombre[0]}{usuario.persona?.apellido[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {usuario.persona?.nombre} {usuario.persona?.apellido}
                            </p>
                            <p className="text-xs text-gray-500">{formatearCedula(usuario.persona?.cedula)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-700">{usuario.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${ROLE_COLORS[usuario.persona?.tipo]?.bg} ${ROLE_COLORS[usuario.persona?.tipo]?.text}`}>
                          {ROLE_LABELS[usuario.persona?.tipo] || usuario.persona?.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-700">{usuario.persona?.telefono || '-'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium border ${ESTADO_COLORS[usuario.estado]?.bg} ${ESTADO_COLORS[usuario.estado]?.border} ${ESTADO_COLORS[usuario.estado]?.text}`}>
                          {ESTADO_COLORS[usuario.estado]?.label || usuario.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-700 text-sm">{formatearFecha(usuario.ultimoLogin)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {!usuario.verificado && (
                            <button
                              onClick={() => handleVerificar(usuario)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                              title="Verificar usuario"
                            >
                              <FaCheck className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleAbrirModalEstado(usuario)}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors duration-200"
                            title="Cambiar estado del usuario"
                          >
                            <FaClock className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAbrirModalPermisos(usuario)}
                            disabled={!puedeTenerPermisos(usuario)}
                            className={`p-2 rounded-lg transition-colors duration-200 ${
                              puedeTenerPermisos(usuario)
                                ? 'text-purple-600 hover:bg-purple-50'
                                : 'text-gray-400 cursor-not-allowed opacity-50'
                            }`}
                            title={puedeTenerPermisos(usuario) ? "Gestionar permisos" : "Solo administradores pueden gestionar permisos"}
                          >
                            <FaShieldAlt className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAbrirModalPassword(usuario)}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors duration-200"
                            title="Restablecer contraseña"
                          >
                            <FaKey className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAbrirModalDelete(usuario)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            title="Eliminar usuario"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <FaUsers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay usuarios que coincidan con tu búsqueda</p>
            </div>
          )}
        </div>
      )}

      {/* Vista Tarjetas */}
      {viewMode === 'tarjetas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtrados.length > 0 ? (
            filtrados.map((usuario) => (
              <div
                key={usuario.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 p-6 relative overflow-hidden group"
              >
                {/* Background accent */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>

                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl flex items-center justify-center text-white font-bold">
                    {usuario.persona?.nombre[0]}{usuario.persona?.apellido[0]}
                  </div>
                  {usuario.verificado ? (
                    <div className="p-2 bg-green-50 rounded-lg">
                      <FaCheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  ) : (
                    <div className="p-2 bg-yellow-50 rounded-lg">
                      <FaExclamationCircle className="w-5 h-5 text-yellow-600" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {usuario.persona?.nombre} {usuario.persona?.apellido}
                </h3>
                <div className="mb-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[usuario.persona?.tipo]?.bg} ${ROLE_COLORS[usuario.persona?.tipo]?.text}`}>
                    {ROLE_LABELS[usuario.persona?.tipo] || usuario.persona?.tipo}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaIdCard className="w-4 h-4 text-gray-400" />
                    <span>{formatearCedula(usuario.persona?.cedula)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaEnvelope className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{usuario.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaPhone className="w-4 h-4 text-gray-400" />
                    <span>{usuario.persona?.telefono || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaClock className="w-4 h-4 text-gray-400" />
                    <span>{formatearFecha(usuario.ultimoLogin)}</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-200 mb-4"></div>

                {/* Estado Badge */}
                <div className="mb-4 p-3 rounded-lg border" style={{
                  backgroundColor: ESTADO_COLORS[usuario.estado]?.bg,
                  borderColor: ESTADO_COLORS[usuario.estado]?.border?.replace('border-', '')
                }}>
                  <p className={`text-xs font-semibold ${ESTADO_COLORS[usuario.estado]?.text}`}>
                    Estado: {ESTADO_COLORS[usuario.estado]?.label || usuario.estado}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    {!usuario.verificado && (
                      <button
                        onClick={() => handleVerificar(usuario)}
                        className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium text-sm transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        <FaCheck className="w-4 h-4" />
                        Verificar
                      </button>
                    )}
                    <button
                      onClick={() => handleAbrirModalEstado(usuario)}
                      className="flex-1 px-3 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 font-medium text-sm transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <FaClock className="w-4 h-4" />
                      Estado
                    </button>
                    <button
                      onClick={() => handleAbrirModalPermisos(usuario)}
                      disabled={!puedeTenerPermisos(usuario)}
                      className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-colors duration-200 flex items-center justify-center gap-2 ${
                        puedeTenerPermisos(usuario)
                          ? 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                      }`}
                      title={puedeTenerPermisos(usuario) ? "Gestionar permisos" : "Solo administradores pueden gestionar permisos"}
                    >
                      <FaShieldAlt className="w-4 h-4" />
                      Permisos
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAbrirModalPassword(usuario)}
                      className="flex-1 px-3 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 font-medium text-sm transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <FaKey className="w-4 h-4" />
                      Contraseña
                    </button>
                    <button
                      onClick={() => handleAbrirModalDelete(usuario)}
                      className="flex-1 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium text-sm transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <FaTrash className="w-4 h-4" />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-gray-200">
              <FaUsers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay usuarios que coincidan con tu búsqueda</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Restablecer Contraseña */}
      <ModalRestablecerPassword
        isOpen={showModalPassword}
        usuario={usuarioSeleccionado}
        passwordNueva={passwordNueva}
        loading={cargandoPassword}
        onClose={handleCerrarModalPassword}
        onPasswordChange={setPasswordNueva}
        onGeneratePassword={generarPasswordTemporal}
        onSubmit={handleRestablecerPassword}
      />

      {/* Modal Eliminar */}
      <ModalEliminarUsuario
        isOpen={showModalDelete}
        usuario={usuarioParaEliminar}
        loading={cargandoDelete}
        onClose={handleCerrarModalDelete}
        onSubmit={handleEliminarUsuario}
      />

      {/* Modal Gestionar Permisos */}
      <ModalGestionarPermisos
        isOpen={showModalPermisos}
        usuario={usuarioPermisosSeleccionado}
        permisos={allPermisos}
        permisosSeleccionados={permisosSeleccionados}
        loading={cargandoPermisos}
        onClose={handleCerrarModalPermisos}
        onTogglePermiso={handleTogglePermiso}
        onSubmit={handleGuardarPermisos}
      />

      {/* Modal Cambiar Estado */}
      <ModalCambiarEstado
        isOpen={showModalEstado}
        usuario={usuarioEstadoSeleccionado}
        estadoActual={usuarioEstadoSeleccionado?.estado || 'activo'}
        estadoNuevo={estadoNuevo}
        loading={cargandoEstado}
        onClose={handleCerrarModalEstado}
        onEstadoChange={setEstadoNuevo}
        onSubmit={handleGuardarEstado}
      />
    </div>
  );
};

export default UsuariosManager;