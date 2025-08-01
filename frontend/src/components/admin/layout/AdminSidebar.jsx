import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  FaUserGraduate, FaChalkboardTeacher, FaUsers, FaUserTie,
  FaMoneyBillWave, FaClipboardList, FaBook, FaSchool,
  FaCog, FaHome, FaSignOutAlt, FaChevronDown, FaChevronUp,
  FaGraduationCap, FaChalkboard
} from 'react-icons/fa';
import { logout } from '../../../services/auth.service';

const AdminSidebar = ({ isOpen, toggleSidebar, userRole, onThemeChange }) => {
  const [showAcademicoSubmenu, setShowAcademicoSubmenu] = useState(false);
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('');

  // Función para determinar el color según la ruta - Paleta elegante y moderna
  const getColorForRoute = (route) => {
    switch(route) {
      case '/admin/dashboard': 
        return { 
          main: 'bg-gradient-to-br from-slate-800 to-slate-900', 
          active: 'bg-slate-700/90 backdrop-blur-md', 
          hover: 'hover:bg-slate-700/60 hover:backdrop-blur-md', 
          text: 'text-slate-600',
          accent: 'slate',
          gradient: 'from-slate-700 to-slate-800'
        };
      case '/admin/estudiantes': 
        return { 
          main: 'bg-gradient-to-br from-blue-800 to-blue-900', 
          active: 'bg-blue-700/90 backdrop-blur-md', 
          hover: 'hover:bg-blue-700/60 hover:backdrop-blur-md', 
          text: 'text-blue-600',
          accent: 'blue',
          gradient: 'from-blue-700 to-blue-800'
        };
      case '/admin/profesores': 
        return { 
          main: 'bg-gradient-to-br from-emerald-800 to-emerald-900', 
          active: 'bg-emerald-700/90 backdrop-blur-md', 
          hover: 'hover:bg-emerald-700/60 hover:backdrop-blur-md', 
          text: 'text-emerald-600',
          accent: 'emerald',
          gradient: 'from-emerald-700 to-emerald-800'
        };
      case '/admin/representantes': 
        return { 
          main: 'bg-gradient-to-br from-violet-800 to-violet-900', 
          active: 'bg-violet-700/90 backdrop-blur-md', 
          hover: 'hover:bg-violet-700/60 hover:backdrop-blur-md', 
          text: 'text-violet-600',
          accent: 'violet',
          gradient: 'from-violet-700 to-violet-800'
        };
      case '/admin/empleados': 
        return { 
          main: 'bg-gradient-to-br from-amber-800 to-amber-900', 
          active: 'bg-amber-700/90 backdrop-blur-md', 
          hover: 'hover:bg-amber-700/60 hover:backdrop-blur-md', 
          text: 'text-amber-600',
          accent: 'amber',
          gradient: 'from-amber-700 to-amber-800'
        };
      case '/admin/pagos': 
        return { 
          main: 'bg-gradient-to-br from-pink-800 to-pink-900', 
          active: 'bg-pink-700/90 backdrop-blur-md', 
          hover: 'hover:bg-pink-700/60 hover:backdrop-blur-md', 
          text: 'text-pink-600',
          accent: 'pink',
          gradient: 'from-pink-700 to-pink-800'
        };
      case '/admin/inscripciones': 
        return { 
          main: 'bg-gradient-to-br from-cyan-800 to-cyan-900', 
          active: 'bg-cyan-700/90 backdrop-blur-md', 
          hover: 'hover:bg-cyan-700/60 hover:backdrop-blur-md', 
          text: 'text-cyan-600',
          accent: 'cyan',
          gradient: 'from-cyan-700 to-cyan-800'
        };
      case '/admin/academico/grados': 
        return { 
          main: 'bg-gradient-to-br from-indigo-800 to-indigo-900', 
          active: 'bg-indigo-700/90 backdrop-blur-md', 
          hover: 'hover:bg-indigo-700/60 hover:backdrop-blur-md', 
          text: 'text-indigo-600',
          accent: 'indigo',
          gradient: 'from-indigo-700 to-indigo-800'
        };
      case '/admin/academico/materias': 
        return { 
          main: 'bg-gradient-to-br from-orange-800 to-orange-900', 
          active: 'bg-orange-700/90 backdrop-blur-md', 
          hover: 'hover:bg-orange-700/60 hover:backdrop-blur-md', 
          text: 'text-orange-600',
          accent: 'orange',
          gradient: 'from-orange-700 to-orange-800'
        };
      case '/admin/academico/secciones': 
        return { 
          main: 'bg-gradient-to-br from-purple-800 to-purple-900', 
          active: 'bg-purple-700/90 backdrop-blur-md', 
          hover: 'hover:bg-purple-700/60 hover:backdrop-blur-md', 
          text: 'text-purple-600',
          accent: 'purple',
          gradient: 'from-purple-700 to-purple-800'
        };
      case '/admin/cupos': 
        return { 
          main: 'bg-gradient-to-br from-red-800 to-red-900', 
          active: 'bg-red-700/90 backdrop-blur-md', 
          hover: 'hover:bg-red-700/60 hover:backdrop-blur-md', 
          text: 'text-red-600',
          accent: 'red',
          gradient: 'from-red-700 to-red-800'
        };
      case '/admin/configuracion': 
        return { 
          main: 'bg-gradient-to-br from-gray-800 to-gray-900', 
          active: 'bg-gray-700/90 backdrop-blur-md', 
          hover: 'hover:bg-gray-700/60 hover:backdrop-blur-md', 
          text: 'text-gray-600',
          accent: 'gray',
          gradient: 'from-gray-700 to-gray-800'
        };
      default: 
        return { 
          main: 'bg-gradient-to-br from-slate-800 to-slate-900', 
          active: 'bg-slate-700/90 backdrop-blur-md', 
          hover: 'hover:bg-slate-700/60 hover:backdrop-blur-md', 
          text: 'text-slate-600',
          accent: 'slate',
          gradient: 'from-slate-700 to-slate-800'
        };
    }
  };

  // Función especial para el botón académico que toma el color del hijo activo
  const getAcademicoColors = () => {
    // Si hay una ruta académica activa, usar su color
    if (activeSection.includes('/admin/academico/')) {
      return getColorForRoute(activeSection);
    }
    // Si no, usar el color por defecto de académico (teal elegante)
    return { 
      main: 'bg-gradient-to-br from-teal-800 to-teal-900', 
      active: 'bg-teal-700/90 backdrop-blur-md', 
      hover: 'hover:bg-teal-700/60 hover:backdrop-blur-md', 
      text: 'text-teal-600',
      accent: 'teal',
      gradient: 'from-teal-700 to-teal-800'
    };
  };

  // Efecto para detectar cambios en la ruta
  useEffect(() => {
    const path = location.pathname;
    let newActiveSection;
    
    // Determinar la sección activa basada en la ruta actual
    if (path.includes('/admin/academico/grados')) {
      newActiveSection = '/admin/academico/grados';
      setShowAcademicoSubmenu(true);
    } else if (path.includes('/admin/academico/materias')) {
      newActiveSection = '/admin/academico/materias';
      setShowAcademicoSubmenu(true);
    } else if (path.includes('/admin/academico/secciones')) {
      newActiveSection = '/admin/academico/secciones';
      setShowAcademicoSubmenu(true);
    } else if (path.includes('/admin/academico')) {
      newActiveSection = '/admin/academico';
      setShowAcademicoSubmenu(true);
    } else if (path.includes('/admin/dashboard')) {
      newActiveSection = '/admin/dashboard';
    } else if (path.includes('/admin/estudiantes')) {
      newActiveSection = '/admin/estudiantes';
    } else if (path.includes('/admin/profesores')) {
      newActiveSection = '/admin/profesores';
    } else if (path.includes('/admin/representantes')) {
      newActiveSection = '/admin/representantes';
    } else if (path.includes('/admin/empleados')) {
      newActiveSection = '/admin/empleados';
    } else if (path.includes('/admin/pagos')) {
      newActiveSection = '/admin/pagos';
    } else if (path.includes('/admin/inscripciones')) {
      newActiveSection = '/admin/inscripciones';
    } else if (path.includes('/admin/cupos')) {
      newActiveSection = '/admin/cupos';
    } else if (path.includes('/admin/configuracion')) {
      newActiveSection = '/admin/configuracion';
    } else {
      newActiveSection = '/admin/dashboard'; // Default
    }
    
    setActiveSection(newActiveSection);
    
    // Notificar el cambio de tema al componente padre
    if (onThemeChange) {
      const themeColors = getColorForRoute(newActiveSection);
      onThemeChange(themeColors);
    }
  }, [location.pathname, onThemeChange]);
 
  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };
 
  const isOwner = userRole === 'owner' || userRole === 'adminWeb';
  
  // Obtener el color actual basado en la sección activa
  const currentColors = getColorForRoute(activeSection);
  
  // Aplicar el color de fondo directamente como una clase CSS
  const sidebarBgColor = currentColors.main;
  
  // // Para depuración
  // console.log('Active Section:', activeSection);
  // console.log('Current Colors:', currentColors);
  // console.log('Sidebar BG Color:', sidebarBgColor);
 
  return (
    <div 
      className={`h-full text-white flex flex-col ${isOpen ? 'w-64' : 'w-20'} ${sidebarBgColor} backdrop-blur-xl border-r border-white/10 shadow-2xl`}
      style={{
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        background: `linear-gradient(135deg, ${currentColors.main.replace('bg-gradient-to-br from-', '').replace(' to-', ', ')})`
      }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-white/20 backdrop-blur-md">
        {isOpen ? (
          <div className="flex flex-col">
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Panel Admin
            </h1>
            <span className="text-xs text-white/60 font-medium">Brisas de Mamporal</span>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center">
              <FaSchool className="w-4 h-4 text-white" />
            </div>
          </div>
        )}
        <button 
          onClick={toggleSidebar} 
          className="text-white/80 hover:text-white focus:outline-none transition-all duration-300 hover:scale-110 p-2 rounded-lg hover:bg-white/10 backdrop-blur-md"
        >
          {isOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3">
        <ul className="space-y-3">
          <li>
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) => 
                `group flex items-center p-3 rounded-xl transition-all duration-300 text-white relative overflow-hidden ${
                  isActive
                    ? 'bg-white/20 backdrop-blur-md shadow-lg border border-white/30'
                    : 'hover:bg-white/10 hover:backdrop-blur-md hover:scale-105 hover:shadow-lg'
                }`
              }
              title='Inicio'
            >
              {({ isActive }) => (
                <>
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'group-hover:bg-white/10'} transition-all duration-300`}>
                    <FaHome className="w-4 h-4" />
                  </div>
                  {isOpen && (
                    <span className="ml-3 font-medium group-hover:translate-x-1 transition-transform duration-300">
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
              to="/admin/estudiantes"
              className={({ isActive }) => 
                `group flex items-center p-3 rounded-xl transition-all duration-300 text-white relative overflow-hidden ${
                  isActive
                    ? 'bg-white/20 backdrop-blur-md shadow-lg border border-white/30'
                    : 'hover:bg-white/10 hover:backdrop-blur-md hover:scale-105 hover:shadow-lg'
                }`
              }
              title='Estudiantes'
            >
              {({ isActive }) => (
                <>
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'group-hover:bg-white/10'} transition-all duration-300`}>
                    <FaUserGraduate className="w-4 h-4" />
                  </div>
                  {isOpen && (
                    <span className="ml-3 font-medium group-hover:translate-x-1 transition-transform duration-300">
                      Estudiantes
                    </span>
                  )}
                  {isActive && <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-xl"></div>}
                </>
              )}
            </NavLink>
          </li>
          
          <li>
            <NavLink
              to="/admin/profesores"
              className={({ isActive }) => 
                `group flex items-center p-3 rounded-xl transition-all duration-300 text-white relative overflow-hidden ${
                  isActive
                    ? 'bg-white/20 backdrop-blur-md shadow-lg border border-white/30'
                    : 'hover:bg-white/10 hover:backdrop-blur-md hover:scale-105 hover:shadow-lg'
                }`
              }
              title='Profesores'
            >
              {({ isActive }) => (
                <>
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'group-hover:bg-white/10'} transition-all duration-300`}>
                    <FaChalkboardTeacher className="w-4 h-4" />
                  </div>
                  {isOpen && (
                    <span className="ml-3 font-medium group-hover:translate-x-1 transition-transform duration-300">
                      Profesores
                    </span>
                  )}
                  {isActive && <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-xl"></div>}
                </>
              )}
            </NavLink>
          </li>
          
          <li>
            <NavLink
              to="/admin/representantes"
              className={({ isActive }) => 
                `group flex items-center p-3 rounded-xl transition-all duration-300 text-white relative overflow-hidden ${
                  isActive
                    ? 'bg-white/20 backdrop-blur-md shadow-lg border border-white/30'
                    : 'hover:bg-white/10 hover:backdrop-blur-md hover:scale-105 hover:shadow-lg'
                }`
              }
              title='Representantes'
            >
              {({ isActive }) => (
                <>
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'group-hover:bg-white/10'} transition-all duration-300`}>
                    <FaUsers className="w-4 h-4" />
                  </div>
                  {isOpen && (
                    <span className="ml-3 font-medium group-hover:translate-x-1 transition-transform duration-300">
                      Representantes
                    </span>
                  )}
                  {isActive && <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-xl"></div>}
                </>
              )}
            </NavLink>
          </li>
          
          <li>
            <NavLink
              to="/admin/empleados"
              className={({ isActive }) => 
                `group flex items-center p-3 rounded-xl transition-all duration-300 text-white relative overflow-hidden ${
                  isActive
                    ? 'bg-white/20 backdrop-blur-md shadow-lg border border-white/30'
                    : 'hover:bg-white/10 hover:backdrop-blur-md hover:scale-105 hover:shadow-lg'
                }`
              }
              title='Empleados'
            >
              {({ isActive }) => (
                <>
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'group-hover:bg-white/10'} transition-all duration-300`}>
                    <FaUserTie className="w-4 h-4" />
                  </div>
                  {isOpen && (
                    <span className="ml-3 font-medium group-hover:translate-x-1 transition-transform duration-300">
                      Empleados
                    </span>
                  )}
                  {isActive && <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-xl"></div>}
                </>
              )}
            </NavLink>
          </li>
          
          <li>
            <NavLink
              to="/admin/pagos"
              className={({ isActive }) => 
                `group flex items-center p-3 rounded-xl transition-all duration-300 text-white relative overflow-hidden ${
                  isActive
                    ? 'bg-white/20 backdrop-blur-md shadow-lg border border-white/30'
                    : 'hover:bg-white/10 hover:backdrop-blur-md hover:scale-105 hover:shadow-lg'
                }`
              }
              title='Pagos'
            >
              {({ isActive }) => (
                <>
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'group-hover:bg-white/10'} transition-all duration-300`}>
                    <FaMoneyBillWave className="w-4 h-4" />
                  </div>
                  {isOpen && (
                    <span className="ml-3 font-medium group-hover:translate-x-1 transition-transform duration-300">
                      Pagos
                    </span>
                  )}
                  {isActive && <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-xl"></div>}
                </>
              )}
            </NavLink>
          </li>
          
          <li>
            <NavLink
              to="/admin/inscripciones"
              className={({ isActive }) => 
                `group flex items-center p-3 rounded-xl transition-all duration-300 text-white relative overflow-hidden ${
                  isActive
                    ? 'bg-white/20 backdrop-blur-md shadow-lg border border-white/30'
                    : 'hover:bg-white/10 hover:backdrop-blur-md hover:scale-105 hover:shadow-lg'
                }`
              }
              title='Inscripciones'
            >
              {({ isActive }) => (
                <>
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'group-hover:bg-white/10'} transition-all duration-300`}>
                    <FaClipboardList className="w-4 h-4" />
                  </div>
                  {isOpen && (
                    <span className="ml-3 font-medium group-hover:translate-x-1 transition-transform duration-300">
                      Inscripciones
                    </span>
                  )}
                  {isActive && <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-xl"></div>}
                </>
              )}
            </NavLink>
          </li>
          
          <li>
            <div>
              <button
                onClick={() => setShowAcademicoSubmenu(!showAcademicoSubmenu)}
                className={`group flex items-center justify-between w-full p-3 rounded-xl transition-all duration-300 text-white relative overflow-hidden ${
                  activeSection.includes('/admin/academico')
                    ? 'bg-white/20 backdrop-blur-md shadow-lg border border-white/30'
                    : 'hover:bg-white/10 hover:backdrop-blur-md hover:scale-105 hover:shadow-lg'
                }`}
              >
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${activeSection.includes('/admin/academico') ? 'bg-white/20' : 'group-hover:bg-white/10'} transition-all duration-300`}>
                    <FaBook className="w-4 h-4" />
                  </div>
                  {isOpen && (
                    <span className="ml-3 font-medium group-hover:translate-x-1 transition-transform duration-300">
                      Académico
                    </span>
                  )}
                </div>
                {isOpen && (
                  <div className="p-1">
                    <div className={`transform transition-transform duration-300 ${showAcademicoSubmenu ? 'rotate-180' : 'rotate-0'}`}>
                      <FaChevronDown className="w-3 h-3" />
                    </div>
                  </div>
                )}
                {activeSection.includes('/admin/academico') && <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-xl"></div>}
              </button>
              
              {showAcademicoSubmenu && isOpen && (
                <ul className="mt-3 space-y-2 pl-4 border-l border-white/20 ml-6">
                  <li>
                    <NavLink
                      to="/admin/academico/grados"
                      className={({ isActive }) => 
                        `group flex items-center p-2.5 rounded-lg transition-all duration-300 text-white/90 relative overflow-hidden ${
                          isActive
                            ? 'bg-white/15 backdrop-blur-md shadow-md border border-white/20 text-white'
                            : 'hover:bg-white/10 hover:backdrop-blur-md hover:scale-105 hover:text-white'
                        }`
                      }
                      title='Grados'
                    >
                      {({ isActive }) => (
                        <>
                          <div className={`p-1.5 rounded-md ${isActive ? 'bg-white/20' : 'group-hover:bg-white/10'} transition-all duration-300`}>
                            <FaGraduationCap className="w-3 h-3" />
                          </div>
                          <span className="ml-3 text-sm font-medium group-hover:translate-x-1 transition-transform duration-300">
                            Grados
                          </span>
                          {isActive && <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-lg"></div>}
                        </>
                      )}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin/academico/materias"
                      className={({ isActive }) => 
                        `group flex items-center p-2.5 rounded-lg transition-all duration-300 text-white/90 relative overflow-hidden ${
                          isActive
                            ? 'bg-white/15 backdrop-blur-md shadow-md border border-white/20 text-white'
                            : 'hover:bg-white/10 hover:backdrop-blur-md hover:scale-105 hover:text-white'
                        }`
                      }
                      title='Materias'
                    >
                      {({ isActive }) => (
                        <>
                          <div className={`p-1.5 rounded-md ${isActive ? 'bg-white/20' : 'group-hover:bg-white/10'} transition-all duration-300`}>
                            <FaBook className="w-3 h-3" />
                          </div>
                          <span className="ml-3 text-sm font-medium group-hover:translate-x-1 transition-transform duration-300">
                            Materias
                          </span>
                          {isActive && <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-lg"></div>}
                        </>
                      )}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin/academico/secciones"
                      className={({ isActive }) => 
                        `group flex items-center p-2.5 rounded-lg transition-all duration-300 text-white/90 relative overflow-hidden ${
                          isActive
                            ? 'bg-white/15 backdrop-blur-md shadow-md border border-white/20 text-white'
                            : 'hover:bg-white/10 hover:backdrop-blur-md hover:scale-105 hover:text-white'
                        }`
                      }
                      title='Secciones'
                    >
                      {({ isActive }) => (
                        <>
                          <div className={`p-1.5 rounded-md ${isActive ? 'bg-white/20' : 'group-hover:bg-white/10'} transition-all duration-300`}>
                            <FaChalkboard className="w-3 h-3" />
                          </div>
                          <span className="ml-3 text-sm font-medium group-hover:translate-x-1 transition-transform duration-300">
                            Secciones
                          </span>
                          {isActive && <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-lg"></div>}
                        </>
                      )}
                    </NavLink>
                  </li>
                </ul>
              )}
            </div>
          </li>
          
          <li>
            <NavLink
              to="/admin/cupos"
              className={({ isActive }) => 
                `group flex items-center p-3 rounded-xl transition-all duration-300 text-white relative overflow-hidden ${
                  isActive
                    ? 'bg-white/20 backdrop-blur-md shadow-lg border border-white/30'
                    : 'hover:bg-white/10 hover:backdrop-blur-md hover:scale-105 hover:shadow-lg'
                }`
              }
              title='Cupos'
            >
              {({ isActive }) => (
                <>
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'group-hover:bg-white/10'} transition-all duration-300`}>
                    <FaSchool className="w-4 h-4" />
                  </div>
                  {isOpen && (
                    <span className="ml-3 font-medium group-hover:translate-x-1 transition-transform duration-300">
                      Gestión de Cupos
                    </span>
                  )}
                  {isActive && <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-xl"></div>}
                </>
              )}
            </NavLink>
          </li>
          
          {isOwner && (
            <li>
              <NavLink
                to="/admin/configuracion"
                className={({ isActive }) => 
                  `group flex items-center p-3 rounded-xl transition-all duration-300 text-white relative overflow-hidden ${
                    isActive
                      ? 'bg-white/20 backdrop-blur-md shadow-lg border border-white/30'
                      : 'hover:bg-white/10 hover:backdrop-blur-md hover:scale-105 hover:shadow-lg'
                  }`
                }
                title='Configuración'
              >
                {({ isActive }) => (
                  <>
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'group-hover:bg-white/10'} transition-all duration-300`}>
                      <FaCog className="w-4 h-4" />
                    </div>
                    {isOpen && (
                      <span className="ml-3 font-medium group-hover:translate-x-1 transition-transform duration-300">
                        Configuración
                      </span>
                    )}
                    {isActive && <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-xl"></div>}
                  </>
                )}
              </NavLink>
            </li>
          )}
        </ul>
      </nav>
      
      {/* Logout */}
      <div className="p-4 border-t border-white/20 backdrop-blur-md">
        <button
          onClick={handleLogout}
          className="group flex items-center w-full p-3 rounded-xl hover:bg-red-500/20 hover:backdrop-blur-md text-white/90 hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg relative overflow-hidden"
        >
          <div className="p-2 rounded-lg group-hover:bg-red-500/20 transition-all duration-300">
            <FaSignOutAlt className="w-4 h-4" />
          </div>
          {isOpen && (
            <span className="ml-3 font-medium group-hover:translate-x-1 transition-transform duration-300">
              Cerrar Sesión
            </span>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;