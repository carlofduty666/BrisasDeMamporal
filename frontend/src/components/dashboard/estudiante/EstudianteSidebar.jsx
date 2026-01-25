import { useState, useEffect } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import {
  FaHome, FaChalkboardTeacher, FaFileAlt, FaChartBar, 
  FaBook, FaMoneyBillWave, FaSignOutAlt
} from 'react-icons/fa';
import { logout } from '../../../services/auth.service';

const EstudianteSidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const path = location.pathname;
    
    if (path.includes('/estudiante/profesores')) {
      setActiveSection('/estudiante/profesores');
    } else if (path.includes('/estudiante/documentos')) {
      setActiveSection('/estudiante/documentos');
    } else if (path.includes('/estudiante/calificaciones')) {
      setActiveSection('/estudiante/calificaciones');
    } else if (path.includes('/estudiante/progreso')) {
      setActiveSection('/estudiante/progreso');
    } else if (path.includes('/estudiante/pagos')) {
      setActiveSection('/estudiante/pagos');
    } else {
      setActiveSection('/estudiante/dashboard');
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 1024 && isOpen) {
      toggleSidebar();
    }
  };

  return (
    <div 
      className={`h-full text-white flex flex-col ${isOpen ? 'w-64' : 'w-20 lg:w-28'} bg-gradient-to-br from-slate-800 to-slate-900 border-r border-white/10 shadow-xl transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} fixed lg:relative z-40 lg:z-auto`}
    >
      {/* Logo */}
      <div className={`flex items-center ${isOpen ? 'justify-between px-4' : 'justify-center px-2'} h-16 border-b border-white/20 backdrop-blur-md transition-all duration-300`}>
        <div className={`flex items-center ${isOpen ? 'space-x-3' : 'flex-col space-y-1'}`}>
          <img 
            src="/img/1.colegioLogo.png" 
            alt="U.E.P Brisas de Mamporal" 
            className={`rounded-lg object-cover bg-white/10 p-1 ${isOpen ? 'w-10 h-10' : 'w-6 h-6'}`}
          />
          {isOpen && (
            <div className="flex flex-col">
              <h1 className="text-sm font-bold text-white leading-tight">
                U.E.P Brisas
              </h1>
              <span className="text-xs text-white/70 font-medium">de Mamporal</span>
            </div>
          )}
          {!isOpen && (
            <button 
              onClick={toggleSidebar} 
              className="text-white/80 hover:text-white focus:outline-none transition-all duration-300 hover:scale-110 p-1 rounded-md hover:bg-white/10 backdrop-blur-md"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M9 5l7 7-7 7" 
                />
              </svg>
            </button>
          )}
        </div>
        
        {isOpen && (
          <button 
            onClick={toggleSidebar} 
            className="text-white/80 hover:text-white focus:outline-none transition-all duration-300 hover:scale-110 p-2 rounded-lg hover:bg-white/10 backdrop-blur-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M15 19l-7-7 7-7" 
              />
            </svg>
          </button>
        )}
      </div>
      
      {/* Navigation */}
      <nav className={`flex-1 overflow-y-auto py-6 ${isOpen ? 'px-3' : 'px-2'} transition-all duration-300`}>
        <ul className="space-y-3">
          <li>
            <NavLink
              to="/estudiante/dashboard"
              onClick={handleLinkClick}
              className={({ isActive }) => 
                `group flex items-center ${isOpen ? 'p-3' : 'p-2 justify-center'} rounded-xl transition-colors duration-200 text-white relative ${
                  isActive
                    ? 'bg-white/20 border border-white/30'
                    : 'hover:bg-white/10'
                }`
              }
              title='Inicio'
            >
              {({ isActive }) => (
                <>
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'group-hover:bg-white/10'} transition-colors duration-200`}>
                    <FaHome className="w-4 h-4" />
                  </div>
                  {isOpen && (
                    <span className="ml-3 font-medium transition-colors duration-200">
                      Inicio
                    </span>
                  )}
                  {isActive && <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-xl"></div>}
                </>
              )}
            </NavLink>
          </li>
          
          <li>
            <NavLink
              to="/estudiante/profesores"
              onClick={handleLinkClick}
              className={({ isActive }) => 
                `group flex items-center ${isOpen ? 'p-3' : 'p-2 justify-center'} rounded-xl transition-colors duration-200 text-white relative ${
                  isActive
                    ? 'bg-white/20 border border-white/30'
                    : 'hover:bg-white/10'
                }`
              }
              title='Mis Profesores'
            >
              {({ isActive }) => (
                <>
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'group-hover:bg-white/10'} transition-colors duration-200`}>
                    <FaChalkboardTeacher className="w-4 h-4" />
                  </div>
                  {isOpen && (
                    <span className="ml-3 font-medium transition-colors duration-200">
                      Mis Profesores
                    </span>
                  )}
                  {isActive && <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-xl"></div>}
                </>
              )}
            </NavLink>
          </li>
          
          <li>
            <NavLink
              to="/estudiante/documentos"
              onClick={handleLinkClick}
              className={({ isActive }) => 
                `group flex items-center ${isOpen ? 'p-3' : 'p-2 justify-center'} rounded-xl transition-colors duration-200 text-white relative ${
                  isActive
                    ? 'bg-white/20 border border-white/30'
                    : 'hover:bg-white/10'
                }`
              }
              title='Mis Documentos'
            >
              {({ isActive }) => (
                <>
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'group-hover:bg-white/10'} transition-colors duration-200`}>
                    <FaFileAlt className="w-4 h-4" />
                  </div>
                  {isOpen && (
                    <span className="ml-3 font-medium transition-colors duration-200">
                      Mis Documentos
                    </span>
                  )}
                  {isActive && <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-xl"></div>}
                </>
              )}
            </NavLink>
          </li>
          
          <li>
            <NavLink
              to="/estudiante/calificaciones"
              onClick={handleLinkClick}
              className={({ isActive }) => 
                `group flex items-center ${isOpen ? 'p-3' : 'p-2 justify-center'} rounded-xl transition-colors duration-200 text-white relative ${
                  isActive
                    ? 'bg-white/20 border border-white/30'
                    : 'hover:bg-white/10'
                }`
              }
              title='Mis Calificaciones'
            >
              {({ isActive }) => (
                <>
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'group-hover:bg-white/10'} transition-colors duration-200`}>
                    <FaChartBar className="w-4 h-4" />
                  </div>
                  {isOpen && (
                    <span className="ml-3 font-medium transition-colors duration-200">
                      Mis Calificaciones
                    </span>
                  )}
                  {isActive && <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-xl"></div>}
                </>
              )}
            </NavLink>
          </li>
          
          <li>
            <NavLink
              to="/estudiante/progreso"
              onClick={handleLinkClick}
              className={({ isActive }) => 
                `group flex items-center ${isOpen ? 'p-3' : 'p-2 justify-center'} rounded-xl transition-colors duration-200 text-white relative ${
                  isActive
                    ? 'bg-white/20 border border-white/30'
                    : 'hover:bg-white/10'
                }`
              }
              title='Materias y Progreso'
            >
              {({ isActive }) => (
                <>
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'group-hover:bg-white/10'} transition-colors duration-200`}>
                    <FaBook className="w-4 h-4" />
                  </div>
                  {isOpen && (
                    <span className="ml-3 font-medium transition-colors duration-200">
                      Materias y Progreso
                    </span>
                  )}
                  {isActive && <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-xl"></div>}
                </>
              )}
            </NavLink>
          </li>
          
          <li>
            <NavLink
              to="/estudiante/pagos"
              onClick={handleLinkClick}
              className={({ isActive }) => 
                `group flex items-center ${isOpen ? 'p-3' : 'p-2 justify-center'} rounded-xl transition-colors duration-200 text-white relative ${
                  isActive
                    ? 'bg-white/20 border border-white/30'
                    : 'hover:bg-white/10'
                }`
              }
              title='Pagos'
            >
              {({ isActive }) => (
                <>
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'group-hover:bg-white/10'} transition-colors duration-200`}>
                    <FaMoneyBillWave className="w-4 h-4" />
                  </div>
                  {isOpen && (
                    <span className="ml-3 font-medium transition-colors duration-200">
                      Pagos
                    </span>
                  )}
                  {isActive && <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-xl"></div>}
                </>
              )}
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Logout Button */}
      <div className={`border-t border-white/20 p-4 ${isOpen ? '' : 'px-2'}`}>
        <button
          onClick={handleLogout}
          className={`group flex items-center ${isOpen ? 'w-full p-3' : 'p-2 justify-center'} rounded-xl transition-all duration-200 text-white bg-red-500/20 hover:bg-red-500/30 border border-red-500/50`}
          title="Cerrar Sesión"
        >
          <div className="p-2 rounded-lg group-hover:bg-red-500/20 transition-colors duration-200">
            <FaSignOutAlt className="w-4 h-4" />
          </div>
          {isOpen && (
            <span className="ml-3 font-medium">
              Cerrar Sesión
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default EstudianteSidebar;
