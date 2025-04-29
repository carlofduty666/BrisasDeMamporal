import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  FaUserGraduate, FaChalkboardTeacher, FaUsers, FaUserTie,
  FaMoneyBillWave, FaClipboardList, FaBook, FaSchool,
  FaCog, FaHome, FaSignOutAlt, FaChevronDown, FaChevronUp,
  FaGraduationCap, FaChalkboard
} from 'react-icons/fa';
import { logout } from '../../../services/auth.service';

const AdminSidebar = ({ isOpen, toggleSidebar, userRole }) => {
  const [showAcademicoSubmenu, setShowAcademicoSubmenu] = useState(false);
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('');

  // Función para determinar el color según la ruta
  const getColorForRoute = (route) => {
    switch(route) {
      case '/admin/dashboard': return { main: 'bg-indigo-600', active: 'bg-indigo-700', hover: 'hover:bg-indigo-500', text: 'text-indigo-600' };
      case '/admin/estudiantes': return { main: 'bg-blue-500', active: 'bg-blue-600', hover: 'hover:bg-blue-400', text: 'text-blue-500' };
      case '/admin/profesores': return { main: 'bg-emerald-500', active: 'bg-emerald-600', hover: 'hover:bg-emerald-400', text: 'text-emerald-500' };
      case '/admin/representantes': return { main: 'bg-violet-500', active: 'bg-violet-600', hover: 'hover:bg-violet-400', text: 'text-violet-500' };
      case '/admin/empleados': return { main: 'bg-amber-500', active: 'bg-amber-600', hover: 'hover:bg-amber-400', text: 'text-amber-500' };
      case '/admin/pagos': return { main: 'bg-pink-500', active: 'bg-pink-600', hover: 'hover:bg-pink-400', text: 'text-pink-500' };
      case '/admin/inscripciones': return { main: 'bg-blue-500', active: 'bg-blue-600', hover: 'hover:bg-blue-400', text: 'text-blue-500' };
      case '/admin/academico': return { main: 'bg-teal-500', active: 'bg-teal-600', hover: 'hover:bg-teal-400', text: 'text-teal-500' };
      case '/admin/academico/grados': return { main: 'bg-cyan-500', active: 'bg-cyan-600', hover: 'hover:bg-cyan-400', text: 'text-cyan-500' };
      case '/admin/academico/materias': return { main: 'bg-orange-500', active: 'bg-orange-600', hover: 'hover:bg-orange-400', text: 'text-orange-500' };
      case '/admin/academico/secciones': return { main: 'bg-purple-500', active: 'bg-purple-600', hover: 'hover:bg-purple-400', text: 'text-purple-500' };
      case '/admin/cupos': return { main: 'bg-red-500', active: 'bg-red-600', hover: 'hover:bg-red-400', text: 'text-red-500' };
      case '/admin/configuracion': return { main: 'bg-gray-500', active: 'bg-gray-600', hover: 'hover:bg-gray-400', text: 'text-gray-500' };
      default: return { main: 'bg-indigo-600', active: 'bg-indigo-700', hover: 'hover:bg-indigo-500', text: 'text-indigo-600' };
    }
  };

  // Efecto para detectar cambios en la ruta
  useEffect(() => {
    const path = location.pathname;
    
    // Determinar la sección activa basada en la ruta actual
    if (path.includes('/admin/academico/grados')) {
      setActiveSection('/admin/academico/grados');
      setShowAcademicoSubmenu(true);
    } else if (path.includes('/admin/academico/materias')) {
      setActiveSection('/admin/academico/materias');
      setShowAcademicoSubmenu(true);
    } else if (path.includes('/admin/academico/secciones')) {
      setActiveSection('/admin/academico/secciones');
      setShowAcademicoSubmenu(true);
    } else if (path.includes('/admin/academico')) {
      setActiveSection('/admin/academico');
      setShowAcademicoSubmenu(true);
    } else if (path.includes('/admin/dashboard')) {
      setActiveSection('/admin/dashboard');
    } else if (path.includes('/admin/estudiantes')) {
      setActiveSection('/admin/estudiantes');
    } else if (path.includes('/admin/profesores')) {
      setActiveSection('/admin/profesores');
    } else if (path.includes('/admin/representantes')) {
      setActiveSection('/admin/representantes');
    } else if (path.includes('/admin/empleados')) {
      setActiveSection('/admin/empleados');
    } else if (path.includes('/admin/pagos')) {
      setActiveSection('/admin/pagos');
    } else if (path.includes('/admin/inscripciones')) {
      setActiveSection('/admin/inscripciones');
    } else if (path.includes('/admin/cupos')) {
      setActiveSection('/admin/cupos');
    } else if (path.includes('/admin/configuracion')) {
      setActiveSection('/admin/configuracion');
    } else {
      setActiveSection('/admin/dashboard'); // Default
    }
  }, [location.pathname]);
 
  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };
 
  const isOwner = userRole === 'owner' || userRole === 'adminWeb';
  
  // Obtener el color actual basado en la sección activa
  const currentColors = getColorForRoute(activeSection);
  
  // Aplicar el color de fondo directamente como una clase CSS
  const sidebarBgColor = currentColors.main;
  
  // Para depuración
  console.log('Active Section:', activeSection);
  console.log('Current Colors:', currentColors);
  console.log('Sidebar BG Color:', sidebarBgColor);
 
  return (
    <div 
      className={`h-full text-white flex flex-col ${isOpen ? 'w-64' : 'w-20'} ${sidebarBgColor}`}
      style={{
        transition: 'background-color 0.5s ease-in-out, width 0.3s ease-in-out'
      }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-opacity-20 border-white">
        {isOpen ? (
          <h1 className="text-xl font-bold">Panel de Administrador</h1>
        ) : (
          <h1 className="text-xl font-bold"></h1>
        )}
        <button onClick={toggleSidebar} className="text-white focus:outline-none">
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2 px-2">
          <li>
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) => 
                `flex items-center p-2 rounded-lg transition-colors duration-200 text-white ${
                  isActive
                    ? getColorForRoute('/admin/dashboard').active
                    : getColorForRoute('/admin/dashboard').hover
                }`
              }
              title='Inicio'
            >
              <FaHome className="w-5 h-5" />
              {isOpen && <span className="ml-3">Inicio</span>}
            </NavLink>
          </li>
          
          <li>
            <NavLink
              to="/admin/estudiantes"
              className={({ isActive }) => 
                `flex items-center p-2 rounded-lg transition-colors duration-200 text-white ${
                  isActive
                    ? getColorForRoute('/admin/estudiantes').active
                    : getColorForRoute('/admin/estudiantes').hover
                }`
              }
              title='Estudiantes'
            >
              <FaUserGraduate className="w-5 h-5" />
              {isOpen && <span className="ml-3">Estudiantes</span>}
            </NavLink>
          </li>
          
          <li>
            <NavLink
              to="/admin/profesores"
              className={({ isActive }) => 
                `flex items-center p-2 rounded-lg transition-colors duration-200 text-white ${
                  isActive
                    ? getColorForRoute('/admin/profesores').active
                    : getColorForRoute('/admin/profesores').hover
                }`
              }
              title='Profesores'
            >
              <FaChalkboardTeacher className="w-5 h-5" />
              {isOpen && <span className="ml-3">Profesores</span>}
            </NavLink>
          </li>
          
          <li>
            <NavLink
              to="/admin/representantes"
              className={({ isActive }) => 
                `flex items-center p-2 rounded-lg transition-colors duration-200 text-white ${
                  isActive
                    ? getColorForRoute('/admin/representantes').active
                    : getColorForRoute('/admin/representantes').hover
                }`
              }
              title='Representantes'
            >
              <FaUsers className="w-5 h-5" />
              {isOpen && <span className="ml-3">Representantes</span>}
            </NavLink>
          </li>
          
          <li>
            <NavLink
              to="/admin/empleados"
              className={({ isActive }) => 
                `flex items-center p-2 rounded-lg transition-colors duration-200 text-white ${
                  isActive
                    ? getColorForRoute('/admin/empleados').active
                    : getColorForRoute('/admin/empleados').hover
                }`
              }
              title='Empleados'
            >
              <FaUserTie className="w-5 h-5" />
              {isOpen && <span className="ml-3">Empleados</span>}
            </NavLink>
          </li>
          
          <li>
            <NavLink
              to="/admin/pagos"
              className={({ isActive }) => 
                `flex items-center p-2 rounded-lg transition-colors duration-200 text-white ${
                  isActive
                    ? getColorForRoute('/admin/pagos').active
                    : getColorForRoute('/admin/pagos').hover
                }`
              }
              title='Pagos'
            >
              <FaMoneyBillWave className="w-5 h-5" />
              {isOpen && <span className="ml-3">Pagos</span>}
            </NavLink>
          </li>
          
          <li>
            <NavLink
              to="/admin/inscripciones"
              className={({ isActive }) => 
                `flex items-center p-2 rounded-lg transition-colors duration-200 text-white ${
                  isActive
                    ? getColorForRoute('/admin/inscripciones').active
                    : getColorForRoute('/admin/inscripciones').hover
                }`
              }
              title='Inscripciones'
            >
              <FaClipboardList className="w-5 h-5" />
              {isOpen && <span className="ml-3">Inscripciones</span>}
            </NavLink>
          </li>
          
          <li>
            <div>
              <button
                onClick={() => setShowAcademicoSubmenu(!showAcademicoSubmenu)}
                className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors duration-200 text-white ${
                  activeSection.includes('/admin/academico')
                    ? getColorForRoute('/admin/academico').active
                    : getColorForRoute('/admin/academico').hover
                }`}
              >
                <div className="flex items-center">
                  <FaBook className="w-5 h-5" />
                  {isOpen && <span className="ml-3">Académico</span>}
                </div>
                {isOpen && (
                  <div>
                    {showAcademicoSubmenu ? <FaChevronUp className="w-4 h-4" /> : <FaChevronDown className="w-4 h-4" />}
                  </div>
                )}
              </button>
              
              {showAcademicoSubmenu && isOpen && (
                <ul className="mt-2 space-y-1 pl-7">
                  <li>
                    <NavLink
                      to="/admin/academico/grados"
                      className={({ isActive }) => 
                        `flex items-center p-2 rounded-lg transition-colors duration-200 text-white ${
                          isActive
                            ? getColorForRoute('/admin/academico/grados').active
                            : getColorForRoute('/admin/academico/grados').hover
                        }`
                      }
                      title='Grados'
                    >
                      <FaGraduationCap className="w-4 h-4" />
                      <span className="ml-3">Grados</span>
                    </NavLink>
                  </li>
                  <li>
                  <NavLink
                  to="/admin/academico/materias"
                  className={({ isActive }) => 
                    `flex items-center p-2 rounded-lg transition-colors duration-200 text-white ${
                      isActive
                        ? getColorForRoute('/admin/academico/materias').active
                        : getColorForRoute('/admin/academico/materias').hover
                    }`
                  }
                >
                  <FaBook className="w-4 h-4" />
                  <span className="ml-3">Materias</span>
                </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin/academico/secciones"
                      className={({ isActive }) => 
                        `flex items-center p-2 rounded-lg transition-colors duration-200 text-white ${
                          isActive
                            ? getColorForRoute('/admin/academico/secciones').active
                            : getColorForRoute('/admin/academico/secciones').hover
                        }`
                      }
                      title='Materias'
                    >
                      <FaChalkboard className="w-4 h-4" />
                      <span className="ml-3">Secciones</span>
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
                `flex items-center p-2 rounded-lg transition-colors duration-200 text-white ${
                  isActive
                    ? getColorForRoute('/admin/cupos').active
                    : getColorForRoute('/admin/cupos').hover
                }`
              }
              title='Cupos'
            >
              <FaSchool className="w-5 h-5" />
              {isOpen && <span className="ml-3">Gestión de Cupos</span>}
            </NavLink>
          </li>
          
            <li>
              <NavLink
                to="/admin/configuracion"
                className={({ isActive }) => 
                  `flex items-center p-2 rounded-lg transition-colors duration-200 text-white ${
                    isActive
                      ? getColorForRoute('/admin/configuracion').active
                      : getColorForRoute('/admin/configuracion').hover
                  }`
                }
                title='Configuración'
              >
                <FaCog className="w-5 h-5" />
                {isOpen && <span className="ml-3">Configuración</span>}
              </NavLink>
            </li>
        </ul>
      </nav>
      
      {/* Logout */}
      <div className="p-4 border-t border-white border-opacity-20">
        <button
          onClick={handleLogout}
          className="flex items-center w-full p-2 rounded-lg hover:bg-opacity-20 hover:bg-white text-white"
        >
          <FaSignOutAlt className="w-5 h-5" />
          {isOpen && <span className="ml-3">Cerrar Sesión</span>}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;