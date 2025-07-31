import { useState } from 'react';
import { FaBell, FaUser, FaBars } from 'react-icons/fa';

const AdminHeader = ({ user, toggleSidebar, currentTheme = { accent: 'slate' } }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Función para obtener colores del tema actual
  const getThemeColor = (opacity = '') => {
    const accent = currentTheme?.accent || 'slate';
    return opacity ? `${accent}-${opacity}` : accent;
  };
  
  return (
    <header className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20 h-16 flex items-center justify-between px-6 relative">
      {/* Fondo con gradiente temático */}
      <div 
        className={`absolute inset-0 bg-gradient-to-r from-${getThemeColor('50')}/30 via-white/50 to-${getThemeColor('50')}/30 opacity-60`}
      />
      
      <div className="flex items-center relative z-10">
        <button 
          onClick={toggleSidebar} 
          className={`text-${getThemeColor('600')} hover:text-${getThemeColor('700')} focus:outline-none transition-all duration-300 hover:scale-110 p-2 rounded-lg hover:bg-${getThemeColor('100')}/50 backdrop-blur-md lg:hidden`}
        >
          <FaBars className="h-5 w-5" />
        </button>
        
        {/* Breadcrumb o título de sección */}
        <div className="ml-4 hidden md:block">
          <h2 className={`text-lg font-semibold bg-gradient-to-r from-${getThemeColor('700')} to-${getThemeColor('600')} bg-clip-text text-transparent`}>
            Panel de Administración
          </h2>
          <p className="text-xs text-gray-500">Brisas de Mamporal</p>
        </div>
      </div>
      
      <div className="flex items-center relative z-10 space-x-4">
        {/* Notificaciones */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`flex items-center justify-center w-10 h-10 rounded-xl text-${getThemeColor('600')} hover:text-${getThemeColor('700')} focus:outline-none transition-all duration-300 hover:scale-110 hover:bg-${getThemeColor('100')}/50 backdrop-blur-md border border-${getThemeColor('200')}/30 relative`}
          >
            <FaBell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
            </span>
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden z-50 border border-white/20">
              <div className="py-3">
                <div className="px-4 py-2 border-b border-gray-100/50">
                  <h3 className={`text-sm font-semibold text-${getThemeColor('700')}`}>Notificaciones</h3>
                </div>
                <a href="#" className={`flex items-center px-4 py-3 border-b border-gray-100/30 hover:bg-${getThemeColor('50')}/30 transition-all duration-200`}>
                  <div className={`w-2 h-2 rounded-full bg-${getThemeColor('500')} mr-3 flex-shrink-0`}></div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-800">Nueva inscripción</p>
                    <p className="text-xs text-gray-600">Se ha registrado una nueva inscripción</p>
                    <p className="text-xs text-gray-500">Hace 5 minutos</p>
                  </div>
                </a>
                <a href="#" className={`flex items-center px-4 py-3 border-b border-gray-100/30 hover:bg-${getThemeColor('50')}/30 transition-all duration-200`}>
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-3 flex-shrink-0"></div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-800">Nuevo pago registrado</p>
                    <p className="text-xs text-gray-600">Se ha registrado un nuevo pago</p>
                    <p className="text-xs text-gray-500">Hace 10 minutos</p>
                  </div>
                </a>
                <a href="#" className={`flex items-center px-4 py-3 hover:bg-${getThemeColor('50')}/30 transition-all duration-200`}>
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mr-3 flex-shrink-0"></div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-800">Cupos por agotarse</p>
                    <p className="text-xs text-gray-600">Los cupos para 3er grado están por agotarse</p>
                    <p className="text-xs text-gray-500">Hace 1 hora</p>
                  </div>
                </a>
              </div>
              <a href="#" className={`block bg-gradient-to-r from-${getThemeColor('700')} to-${getThemeColor('800')} text-white text-center font-semibold py-3 hover:from-${getThemeColor('800')} hover:to-${getThemeColor('900')} transition-all duration-300`}>
                Ver todas las notificaciones
              </a>
            </div>
          )}
        </div>
        
        {/* Perfil de usuario */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={`relative z-10 flex items-center space-x-3 p-2 rounded-xl border border-${getThemeColor('200')}/30 bg-white/50 backdrop-blur-md hover:bg-white/70 transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none`}
          >
            <div className="flex items-center space-x-2">
              {user?.avatar ? (
                <img
                  className="h-8 w-8 rounded-lg object-cover"
                  src={user.avatar}
                  alt="Avatar"
                />
              ) : (
                <div className={`h-8 w-8 rounded-lg bg-gradient-to-r from-${getThemeColor('600')} to-${getThemeColor('700')} text-white flex items-center justify-center`}>
                  <FaUser className="w-4 h-4" />
                </div>
              )}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-800">
                  {user?.nombre} {user?.apellido}
                </p>
                <p className={`text-xs text-${getThemeColor('600')}`}>
                  {user?.tipo === 'owner' ? 'Propietario' : 'Administrador'}
                </p>
              </div>
            </div>
          </button>
          
          {showProfileMenu && (
            <div className="absolute right-0 mt-3 py-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl z-20 border border-white/20 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100/50">
                <p className="text-sm font-medium text-gray-800">
                  {user?.nombre} {user?.apellido}
                </p>
                <p className={`text-xs text-${getThemeColor('600')}`}>
                  {user?.email}
                </p>
              </div>
              <a
                href="#"
                className={`flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-${getThemeColor('50')}/50 hover:text-${getThemeColor('700')} transition-all duration-200`}
              >
                <FaUser className="w-4 h-4 mr-3" />
                Mi Perfil
              </a>
              <a
                href="#"
                className={`flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-${getThemeColor('50')}/50 hover:text-${getThemeColor('700')} transition-all duration-200`}
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Configuración
              </a>
              <div className="border-t border-gray-100/50 mt-2">
                <a
                  href="/login"
                  className="flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50/50 hover:text-red-700 transition-all duration-200"
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                  }}
                >
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Cerrar Sesión
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
