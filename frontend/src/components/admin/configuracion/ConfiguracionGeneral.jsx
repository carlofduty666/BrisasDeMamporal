import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaCog,
  FaCalendarAlt,
  FaGraduationCap,
  FaMoneyBillWave,
  FaChevronRight,
  FaArrowRight,
  FaDatabase,
  FaShieldAlt,
  FaBell,
  FaFileAlt
} from 'react-icons/fa';

const ConfiguracionGeneral = () => {
  const navigate = useNavigate();
  const [configItems, setConfigItems] = useState([]);

  useEffect(() => {
    // Cargar items de configuración
    const items = [
      {
        id: 'periodo-escolar',
        titulo: 'Período Escolar',
        descripcion: 'Administra años escolares y fechas',
        icono: FaCalendarAlt,
        color: 'from-blue-500 to-blue-600',
        bgLight: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-700',
        action: () => navigate('/admin/periodo-escolar')
      },
      {
        id: 'academico',
        titulo: 'Configuración Académica',
        descripcion: 'Grados, secciones y materias',
        icono: FaGraduationCap,
        color: 'from-emerald-500 to-emerald-600',
        bgLight: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        textColor: 'text-emerald-700',
        action: () => navigate('/admin/academico/grados')
      },
      {
        id: 'pagos',
        titulo: 'Configuración de Pagos',
        descripcion: 'Aranceles, métodos y monedas',
        icono: FaMoneyBillWave,
        color: 'from-purple-500 to-purple-600',
        bgLight: 'bg-purple-50',
        borderColor: 'border-purple-200',
        textColor: 'text-purple-700',
        action: () => navigate('/admin/aranceles')
      },
      {
        id: 'seguridad',
        titulo: 'Seguridad',
        descripcion: 'Roles y permisos de usuarios',
        icono: FaShieldAlt,
        color: 'from-orange-500 to-orange-600',
        bgLight: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-700',
        action: () => navigate('/admin/usuarios')
      },
      {
        id: 'notificaciones',
        titulo: 'Notificaciones',
        descripcion: 'Configuración de alertas del sistema',
        icono: FaBell,
        color: 'from-pink-500 to-pink-600',
        bgLight: 'bg-pink-50',
        borderColor: 'border-pink-200',
        textColor: 'text-pink-700',
        action: () => {
          // Por implementar
        }
      },
      {
        id: 'reportes',
        titulo: 'Reportes',
        descripcion: 'Plantillas y configuración de reportes',
        icono: FaFileAlt,
        color: 'from-indigo-500 to-indigo-600',
        bgLight: 'bg-indigo-50',
        borderColor: 'border-indigo-200',
        textColor: 'text-indigo-700',
        action: () => {
          // Por implementar
        }
      }
    ];

    setConfigItems(items);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100">
      {/* Header Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl rounded-2xl mb-8">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-700/30 to-transparent"></div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gray-600/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-gray-500/10 rounded-full blur-2xl"></div>

        <div className="relative px-6 py-12">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-gray-700/40 rounded-xl backdrop-blur-sm border border-gray-600/30">
              <FaCog className="w-8 h-8 text-gray-300 animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">
                Configuración del Sistema
              </h1>
              <p className="text-gray-300 text-lg mt-1">
                Administra todos los parámetros y opciones del sistema
              </p>
            </div>
          </div>

          {/* Stats Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 transition-colors duration-200 hover:bg-white/15">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm font-medium">Módulos Disponibles</p>
                  <p className="text-2xl font-bold text-white">{configItems.length}</p>
                </div>
                <div className="p-3 bg-gray-600/30 rounded-xl">
                  <FaDatabase className="w-6 h-6 text-gray-300" />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 transition-colors duration-200 hover:bg-white/15">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm font-medium">Estado del Sistema</p>
                  <p className="text-2xl font-bold text-green-400">Activo</p>
                </div>
                <div className="p-3 bg-green-600/30 rounded-xl">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 transition-colors duration-200 hover:bg-white/15">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm font-medium">Última Actualización</p>
                  <p className="text-lg font-bold text-gray-200">Hoy</p>
                </div>
                <div className="p-3 bg-gray-600/30 rounded-xl">
                  <FaArrowRight className="w-6 h-6 text-gray-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Configuración Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {configItems.map((item) => {
          const Icon = item.icono;
          return (
            <div
              key={item.id}
              onClick={item.action}
              className="group cursor-pointer transition-all duration-300 transform hover:scale-105"
            >
              <div
                className={`${item.bgLight} ${item.borderColor} rounded-2xl border-2 p-6 
                shadow-sm hover:shadow-lg transition-all duration-300 
                bg-white/80 backdrop-blur-sm hover:backdrop-blur-md
                relative overflow-hidden group`}
              >
                {/* Gradient background on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 
                  group-hover:opacity-5 transition-opacity duration-300 -z-10`}
                ></div>

                {/* Icon container */}
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 bg-gradient-to-br ${item.color} rounded-xl 
                    transform transition-transform duration-300 group-hover:scale-110 
                    group-hover:rotate-6 shadow-md`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <FaChevronRight
                    className={`w-5 h-5 ${item.textColor} opacity-0 
                    group-hover:opacity-100 transform transition-all duration-300 
                    group-hover:translate-x-2`}
                  />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {item.titulo}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.descripcion}
                </p>

                {/* Bottom accent line */}
                <div
                  className={`h-1 w-0 group-hover:w-full bg-gradient-to-r ${item.color} 
                  rounded-full mt-4 transition-all duration-300`}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions Section */}
      <div className="mt-12 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <FaArrowRight className="text-gray-600" />
          Acciones Rápidas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/admin/periodo-escolar')}
            className="group relative px-6 py-4 bg-gradient-to-r from-gray-100 to-gray-50 
            border border-gray-300 rounded-xl font-medium text-gray-700 
            transition-all duration-300 hover:shadow-md hover:border-gray-400
            flex items-center justify-between overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <FaCalendarAlt className="w-4 h-4" />
              Gestionar Período Escolar
            </span>
            <span
              className="absolute inset-0 bg-gradient-to-r from-gray-700/10 to-transparent 
              transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
            ></span>
          </button>

          <button
            onClick={() => navigate('/admin/aranceles')}
            className="group relative px-6 py-4 bg-gradient-to-r from-gray-100 to-gray-50 
            border border-gray-300 rounded-xl font-medium text-gray-700 
            transition-all duration-300 hover:shadow-md hover:border-gray-400
            flex items-center justify-between overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <FaMoneyBillWave className="w-4 h-4" />
              Configurar Aranceles
            </span>
            <span
              className="absolute inset-0 bg-gradient-to-r from-gray-700/10 to-transparent 
              transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
            ></span>
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex gap-4">
          <div className="p-3 bg-blue-100 rounded-lg h-fit">
            <FaShieldAlt className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Consejo de Seguridad</h3>
            <p className="text-sm text-blue-700">
              Asegúrate de revisar regularmente la configuración del sistema y mantener los 
              datos actualizados. Los cambios realizados aquí afectarán a todo el sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionGeneral;