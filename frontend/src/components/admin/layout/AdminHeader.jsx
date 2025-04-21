import { useState } from 'react';
import { FaBell, FaUser, FaBars } from 'react-icons/fa';

const AdminHeader = ({ user, toggleSidebar }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  return (
    <header className="bg-white shadow h-16 flex items-center justify-between px-6">
      <div className="flex items-center">
        <button onClick={toggleSidebar} className="text-gray-500 focus:outline-none lg:hidden">
          <FaBars className="h-6 w-6" />
        </button>
      </div>
      
      <div className="flex items-center">
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="flex mx-4 text-gray-600 focus:outline-none"
          >
            <FaBell className="h-6 w-6" />
            <span className="absolute top-0 right-0 h-2 w-2 mt-1 mr-2 bg-red-500 rounded-full"></span>
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-50">
              <div className="py-2">
                <a href="#" className="flex items-center px-4 py-3 border-b hover:bg-gray-100">
                  <div className="text-sm">
                    <p className="font-medium text-gray-800">Nueva inscripción</p>
                    <p className="text-xs text-gray-600">Se ha registrado una nueva inscripción</p>
                    <p className="text-xs text-gray-500">Hace 5 minutos</p>
                  </div>
                </a>
                <a href="#" className="flex items-center px-4 py-3 border-b hover:bg-gray-100">
                  <div className="text-sm">
                    <p className="font-medium text-gray-800">Nuevo pago registrado</p>
                    <p className="text-xs text-gray-600">Se ha registrado un nuevo pago</p>
                    <p className="text-xs text-gray-500">Hace 10 minutos</p>
                  </div>
                </a>
                <a href="#" className="flex items-center px-4 py-3 hover:bg-gray-100">
                  <div className="text-sm">
                    <p className="font-medium text-gray-800">Cupos por agotarse</p>
                    <p className="text-xs text-gray-600">Los cupos para 3er grado están por agotarse</p>
                    <p className="text-xs text-gray-500">Hace 1 hora</p>
                  </div>
                </a>
              </div>
              <a href="#" className="block bg-gray-800 text-white text-center font-bold py-2">
                Ver todas las notificaciones
              </a>
            </div>
          )}
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="relative z-10 block h-8 w-8 rounded-full overflow-hidden shadow focus:outline-none"
          >
            {user?.avatar ? (
              <img
                className="h-full w-full object-cover"
                src={user.avatar}
                alt="Avatar"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-indigo-600 text-white">
                <FaUser />
              </div>
            )}
          </button>
          
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-xl z-20">
              <div className="px-4 py-2 text-xs text-gray-400">
                {user?.nombre} {user?.apellido}
              </div>
              <a
                href="#"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-600 hover:text-white"
              >
                Mi Perfil
              </a>
              <a
                href="#"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-600 hover:text-white"
              >
                Configuración
              </a>
              <a
                href="/login"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-600 hover:text-white"
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                }}
              >
                Cerrar Sesión
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
