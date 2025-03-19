// import React from 'react'

// import '../App.css'

// function NavBar() {


//   return (

//     <nav className='fixed w-full z-50'>
//         <div className="nav-contenedor flex-row items-center justify-between rounded-sm mx-25 my-3 z-40 bg-white px-5">
//             <div className="nav-logo">
//                 <a href="">
//                     <img src="../public/img/1.colegioLogo.png" alt="Brisas de Mamporal" />
//                 </a>
//             </div>
//             <div className="nav-pages">
//                 <div>
//                     <a href="#inicio" className='p-2 rounded-2xl hover:bg-blue-100 hover:text-blue-600 transition-all transition-discrete'>Inicio</a>
//                 </div>
//                 <div>
//                     <a href="#nuestraInstitucion" className='p-2 rounded-2xl hover:bg-red-100 hover:text-red-600 transition-all transition-discrete'>Nuestra Institución</a>
//                 </div>
//                 <div>
//                     <a href="#calendarioAcademico" className='p-2 rounded-2xl hover:bg-green-100 hover:text-green-600 transition-all transition-discrete'>Calendario académico</a>
//                 </div>
//             </div>
//             <div className="nav-button">
//                 <button className="border border-green-700 text-zinc-900 p-2 rounded-md hover:bg-green-700 hover:text-amber-50 transition-all transition-discrete cursor-pointer">Iniciar sesión</button>
//             </div>
//         </div>
//     </nav>
  

//     )       
// }

// export default NavBar

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';

function NavBar() {
  const navigate = useNavigate();
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

  return (
    <nav className='fixed w-full z-50'>
      <div className="nav-contenedor flex-row items-center justify-between rounded-sm mx-25 my-3 z-40 bg-white px-5">
        <div className="nav-logo">
          <Link to="/">
            <img src="../img/1.colegioLogo.png" alt="Brisas de Mamporal" />
          </Link>
        </div>
        <div className="nav-pages">
          <div>
            <a href="#inicio" className='p-2 rounded-2xl hover:bg-blue-100 hover:text-blue-600 transition-all transition-discrete'>Inicio</a>
          </div>
          <div>
            <a href="#nuestraInstitucion" className='p-2 rounded-2xl hover:bg-red-100 hover:text-red-600 transition-all transition-discrete'>Nuestra Institución</a>
          </div>
          <div>
            <a href="#calendarioAcademico" className='p-2 rounded-2xl hover:bg-green-100 hover:text-green-600 transition-all transition-discrete'>Calendario académico</a>
          </div>
          
          {/* Añadir enlaces para usuarios autenticados */}
          {isAuthenticated && (
            <div>
              <Link to="/dashboard/representante" className='p-2 rounded-2xl hover:bg-purple-100 hover:text-purple-600 transition-all transition-discrete'>Mi Dashboard</Link>
            </div>
          )}
        </div>
        <div className="nav-button">
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user?.nombres}</span>
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
