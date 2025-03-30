import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { 
  FaUserGraduate, FaChalkboardTeacher, FaUsers, FaUserTie, 
  FaMoneyBillWave, FaClipboardList, FaBook, FaSchool, 
  FaCog, FaHome, FaSignOutAlt, FaChevronDown, FaChevronUp,
  FaGraduationCap, FaChalkboard
} from 'react-icons/fa';
import { logout } from '../../../services/auth.service';

const AdminSidebar = ({ isOpen, toggleSidebar, userRole }) => {

  const [showAcademicoSubmenu, setShowAcademicoSubmenu] = useState(false);
  
  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };
  
  const isOwner = userRole === 'owner' || userRole === 'adminWeb';
  
  return (
    <div className={`bg-indigo-800 text-white ${isOpen ? 'w-64' : 'w-20'} transition-all duration-300 flex flex-col`}>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-indigo-700">
        {isOpen ? (
          <h1 className="text-xl font-bold">Brisas de Mamporal</h1>
        ) : (
          <h1 className="text-xl font-bold">BM</h1>
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
                `flex items-center p-2 rounded-lg ${isActive ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`
              }
            >
              <FaHome className="w-5 h-5" />
              {isOpen && <span className="ml-3">Dashboard</span>}
            </NavLink>
          </li>
          
          <li>
            <NavLink 
              to="/admin/estudiantes" 
              className={({ isActive }) => 
                `flex items-center p-2 rounded-lg ${isActive ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`
              }
            >
              <FaUserGraduate className="w-5 h-5" />
              {isOpen && <span className="ml-3">Estudiantes</span>}
            </NavLink>
          </li>
          
          <li>
            <NavLink 
              to="/admin/profesores" 
              className={({ isActive }) => 
                `flex items-center p-2 rounded-lg ${isActive ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`
              }
            >
              <FaChalkboardTeacher className="w-5 h-5" />
              {isOpen && <span className="ml-3">Profesores</span>}
            </NavLink>
          </li>
          
          <li>
            <NavLink 
              to="/admin/representantes" 
              className={({ isActive }) => 
                `flex items-center p-2 rounded-lg ${isActive ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`
              }
            >
              <FaUsers className="w-5 h-5" />
              {isOpen && <span className="ml-3">Representantes</span>}
            </NavLink>
          </li>
          
          <li>
            <NavLink 
              to="/admin/empleados" 
              className={({ isActive }) => 
                `flex items-center p-2 rounded-lg ${isActive ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`
              }
            >
              <FaUserTie className="w-5 h-5" />
              {isOpen && <span className="ml-3">Empleados</span>}
            </NavLink>
          </li>
          
          <li>
            <NavLink 
              to="/admin/pagos" 
              className={({ isActive }) => 
                `flex items-center p-2 rounded-lg ${isActive ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`
              }
            >
              <FaMoneyBillWave className="w-5 h-5" />
              {isOpen && <span className="ml-3">Pagos</span>}
            </NavLink>
          </li>
          
          <li>
            <NavLink 
              to="/admin/inscripciones" 
              className={({ isActive }) => 
                `flex items-center p-2 rounded-lg ${isActive ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`
              }
            >
              <FaClipboardList className="w-5 h-5" />
              {isOpen && <span className="ml-3">Inscripciones</span>}
            </NavLink>
          </li>
          
          <li>
            <div>
              <button
                onClick={() => setShowAcademicoSubmenu(!showAcademicoSubmenu)}
                className={`flex items-center justify-between w-full p-2 rounded-lg hover:bg-indigo-700 ${
                  showAcademicoSubmenu ? 'bg-indigo-700' : ''
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
                        `flex items-center p-2 rounded-lg ${isActive ? 'bg-indigo-600' : 'hover:bg-indigo-600'}`
                      }
                    >
                      <FaGraduationCap className="w-4 h-4" />
                      <span className="ml-3">Grados</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink 
                      to="/admin/academico/materias" 
                      className={({ isActive }) => 
                        `flex items-center p-2 rounded-lg ${isActive ? 'bg-indigo-600' : 'hover:bg-indigo-600'}`
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
                        `flex items-center p-2 rounded-lg ${isActive ? 'bg-indigo-600' : 'hover:bg-indigo-600'}`
                      }
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
                `flex items-center p-2 rounded-lg ${isActive ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`
              }
            >
              <FaSchool className="w-5 h-5" />
              {isOpen && <span className="ml-3">Gestión de Cupos</span>}
            </NavLink>
          </li>
          
          {/* Solo visible para el rol owner */}
          {isOwner && (
            <li>
              <NavLink 
                to="/admin/configuracion" 
                className={({ isActive }) => 
                  `flex items-center p-2 rounded-lg ${isActive ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`
                }
              >
                <FaCog className="w-5 h-5" />
                {isOpen && <span className="ml-3">Configuración</span>}
              </NavLink>
            </li>
          )}
        </ul>
      </nav>
      
      {/* Logout */}
      <div className="p-4 border-t border-indigo-700">
        <button 
          onClick={handleLogout}
          className="flex items-center w-full p-2 rounded-lg hover:bg-indigo-700"
        >
          <FaSignOutAlt className="w-5 h-5" />
          {isOpen && <span className="ml-3">Cerrar Sesión</span>}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;