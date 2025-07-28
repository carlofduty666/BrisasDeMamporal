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
  const getLinkClasses = (path) => {
    const baseClasses = 'px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105';
    
    if (isActive(path)) {
      // Si el enlace está activo, aplicar estilo activo más opaco
      return `${baseClasses} bg-slate-600 text-white shadow-lg`;	
    }
    
    // Si no está activo, estilo hover suave
    return `${baseClasses} text-gray-700 hover:bg-slate-100 hover:text-slate-800 hover:shadow-md`;
  };

  return (
    <nav className='fixed w-full px-6 py-4 z-50'>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between bg-white/95 backdrop-blur-md rounded-2xl px-6 py-4 shadow-xl border border-white/20">
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="group flex items-center space-x-3 transition-transform duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-slate-500 rounded-xl shadow-lg flex items-center justify-center group-hover:shadow-xl transition-all duration-300">
                <img 
                  src="../img/1.colegioLogo.png" 
                  alt="Brisas de Mamporal" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div className="hidden md:block">
                <h2 className="text-xl font-bold text-slate-800">
                  Brisas de Mamporal
                </h2>
                <p className="text-xs text-gray-500">Unidad Educativa</p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center space-x-2">
            <Link to="/" className={getLinkClasses('/')}>
              <span className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Inicio</span>
              </span>
            </Link>
            
            <Link to="/nuestra-institucion" className={getLinkClasses('/nuestra-institucion')}>
              <span className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>Nuestra Institución</span>
              </span>
            </Link>
            
            <Link to="/calendario-academico" className={getLinkClasses('/calendario-academico')}>
              <span className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Calendario</span>
              </span>
            </Link>
            
            {/* Dashboard según el tipo de usuario */}
            {isAuthenticated && (
              <Link to={getDashboardRoute()} className={getLinkClasses(getDashboardRoute())}>
                <span className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span>Dashboard</span>
                </span>
              </Link>
            )}
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-3">
                  <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {(user?.nombres || user?.nombre)?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-800">
                      {user?.nombres || user?.nombre}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">
                      {user?.tipo || 'Usuario'}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-xl font-medium transition-all duration-300 hover:bg-red-600 hover:shadow-lg transform hover:scale-105"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden md:inline">Cerrar sesión</span>
                </button>
              </div>
            ) : (
              <Link to="/login">
                <button className="flex items-center space-x-2 px-6 py-2 bg-slate-600 text-white rounded-xl font-medium transition-all duration-300 hover:bg-slate-700 hover:shadow-lg transform hover:scale-105">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>Iniciar sesión</span>
                </button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button className="lg:hidden p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors duration-300">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
