import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../App.css';

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/');
  };

  // Función para determinar si un enlace está activo
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Función para obtener la ruta del dashboard según el tipo de usuario
  const getDashboardRoute = () => {
    if (!user || !user.tipo) return '/dashboard/representante';
    
    switch (user.tipo) {
      case 'profesor':
        return '/profesor/dashboard';
      case 'representante':
        return '/dashboard/representante';
      case 'adminWeb':
      case 'owner':
        return '/admin/dashboard';
      default:
        return '/dashboard/representante';
    }
  };

  // Función para generar las clases de los enlaces
  const getLinkClasses = (path, hoverBg, hoverText) => {
    const baseClasses = 'p-2 rounded-2xl transition-all transition-discrete';
    
    if (isActive(path)) {
      // Si el enlace está activo, aplicar el color de fondo y texto blanco
      return `${baseClasses} ${hoverBg.replace('hover:', '')} ${hoverText.replace('hover:', '')}`;	
    }
    
    // Si no está activo, mantener el hover original
    return `${baseClasses} ${hoverBg} ${hoverText}`;
  };

  return (
    <nav className='fixed w-full pl-5 pr-5 my-3 z-50 rounded-md'>
      <div className="nav-contenedor flex-row items-center justify-between rounded-sm mx-25 my-3 z-40 bg-white px-5">
        <div className="nav-logo">
          <Link to="/">
            <img src="../img/1.colegioLogo.png" alt="Brisas de Mamporal" />
          </Link>
        </div>
        <div className="nav-pages">
          <div>
            <Link 
              to="/" 
              className={getLinkClasses('/', 'hover:bg-blue-100', 'hover:text-blue-600')}
            >
              Inicio
            </Link>
          </div>
          <div>
            <Link 
              to="/nuestra-institucion" 
              className={getLinkClasses('/nuestra-institucion', 'hover:bg-red-100', 'hover:text-red-600')}
            >
              Nuestra Institución
            </Link>
          </div>
          <div>
            <Link 
              to="/calendario-academico" 
              className={getLinkClasses('/calendario-academico', 'hover:bg-green-100', 'hover:text-green-600')}
            >
              Calendario académico
            </Link>
          </div>
          
          {/* Enlace al dashboard según el tipo de usuario */}
          {isAuthenticated && (
            <div>
              <Link 
                to={getDashboardRoute()} 
                className={getLinkClasses(
                  getDashboardRoute(), 
                  'hover:bg-purple-100', 
                  'hover:text-purple-600'
                )}
              >
                Dashboard
              </Link>
            </div>
          )}
        </div>
        <div className="nav-button">
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user?.nombres || user?.nombre}</span>
              <button 
                onClick={handleLogout}
                className="border border-red-700 text-zinc-900 p-2 rounded-md hover:bg-red-700 hover:text-amber-50 transition-all transition-discrete cursor-pointer"
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <Link to="/login">
              <button className="border border-green-700 text-zinc-900 p-2 rounded-md hover:bg-green-700 hover:text-amber-50 transition-all transition-discrete cursor-pointer">
                Iniciar sesión
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
