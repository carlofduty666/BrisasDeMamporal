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
    <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6">
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar} 
          className="text-gray-600 hover:text-gray-700 focus:outline-none transition-colors duration-150 p-2 rounded-lg hover:bg-gray-100 lg:hidden"
        >
          <FaBars className="h-5 w-5" />
        </button>
        
        {/* Breadcrumb o título de sección */}
        <div className="ml-4 hidden md:block">
          <h2 className="text-lg font-semibold text-gray-800">
            Panel de Administración
          </h2>
          <p className="text-xs text-gray-500">Brisas de Mamporal</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        {/* Notificaciones */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:text-gray-700 focus:outline-none transition-colors duration-150 hover:bg-gray-100 border border-gray-200 relative"
          >
            <FaBell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full">
              <span className="w-1 h-1 bg-white rounded-full m-auto mt-1"></span>
            </span>
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="py-2">
                <div className="px-4 py-2 border-b border-gray-100">
                  <h3 className="text-sm font-medium text-gray-900">Notificaciones</h3>
                </div>
                <a href="#" className="flex items-center px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mr-3"></div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-800">Nueva inscripción</p>
                    <p className="text-xs text-gray-500">Hace 5 minutos</p>
                  </div>
                </a>
                <a href="#" className="flex items-center px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-3"></div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-800">Nuevo pago registrado</p>
                    <p className="text-xs text-gray-500">Hace 10 minutos</p>
                  </div>
                </a>
                <a href="#" className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors duration-150">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mr-3"></div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-800">Cupos por agotarse</p>
                    <p className="text-xs text-gray-500">Hace 1 hora</p>
                  </div>
                </a>
              </div>
              <a href="#" className="block bg-gray-800 text-white text-center text-sm font-medium py-2 hover:bg-gray-900 transition-colors duration-150">
                Ver todas las notificaciones
              </a>
            </div>
          )}
        </div>
        
        {/* Perfil de usuario */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2 p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors duration-150 focus:outline-none"
          >
            <div className="flex items-center space-x-2">
              {user?.avatar ? (
                <img
                  className="h-8 w-8 rounded-lg object-cover"
                  src={user.avatar}
                  alt="Avatar"
                />
              ) : (
                <div className="h-8 w-8 rounded-lg bg-gray-600 text-white flex items-center justify-center">
                  <FaUser className="w-4 h-4" />
                </div>
              )}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-800">
                  {user?.nombre} {user?.apellido}
                </p>
                <p className="text-xs text-gray-600">
                  {user?.tipo === 'owner' ? 'Propietario' : 'Administrador'}
                </p>
              </div>
            </div>
          </button>
          
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-800">
                  {user?.nombre} {user?.apellido}
                </p>
                <p className="text-xs text-gray-600">
                  {user?.email}
                </p>
              </div>
              <a
                href="#"
                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
              >
                <FaUser className="w-4 h-4 mr-3" />
                Mi Perfil
              </a>
              <a
                href="#"
                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Configuración
              </a>
              <div className="border-t border-gray-100 mt-2">
                <a
                  href="/login"
                  className="flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
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
