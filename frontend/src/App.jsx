// import { useState } from 'react'
// import './App.css'
// import NavBar from './components/NavBar'
// import Carrusel from './components/Carrusel'
// import InfoHome from './components/InfoHome'

// function App() {

//   return (
//     <>
//       <NavBar />

//       <Carrusel />

//       <InfoHome />
      
//     </>
//   )
// }

// export default App

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import RegisterForm from './components/auth/RegisterForm';
import EmailVerification from './components/auth/EmailVerification';
import LoginForm from './components/auth/LoginForm';
import RepresentanteDashboard from './components/dashboard/RepresentanteDashboard';
import NuevoEstudiante from './components/inscripcion/NuevoEstudiante';
import ComprobanteInscripcion from './components/inscripcion/ComprobanteInscripcion';
import DetallesEstudiante from './components/estudiante/DetallesEstudiante';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';

// Importando tus componentes existentes
import NavBar from './components/NavBar';
import Carrusel from './components/Carrusel';
import InfoHome from './components/InfoHome';

// Componente para proteger rutas
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Componente para la página de inicio que usa tus componentes existentes
const HomePage = () => {
  return (
    <div className="min-h-screen">
      <NavBar />
      <Carrusel />
      <InfoHome />
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/verificacion-email" element={<EmailVerification />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/recuperar-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Rutas protegidas */}
        <Route 
          path="/dashboard/representante" 
          element={
            <ProtectedRoute>
              <RepresentanteDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/inscripcion/nuevo-estudiante" 
          element={
            <ProtectedRoute>
              <NuevoEstudiante />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/inscripcion/comprobante/:inscripcionId" 
          element={
            <ProtectedRoute>
              <ComprobanteInscripcion />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/estudiante/:estudianteId" 
          element={
            <ProtectedRoute>
              <DetallesEstudiante />
            </ProtectedRoute>
          } 
        />
        
        {/* Ruta para cualquier otra dirección no definida */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;


// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { useState, useEffect } from 'react';

// // Importa solo los componentes que ya existen
// import NavBar from './components/NavBar';
// import Carrusel from './components/Carrusel';
// import InfoHome from './components/InfoHome';

// // Componente para la página de inicio que usa tus componentes existentes
// const HomePage = () => {
//   return (
//     <div className="min-h-screen">
//       <NavBar />
//       <Carrusel />
//       <InfoHome />
//     </div>
//   );
// };

// function App() {
//   return (
//     <Router>
//       <Routes>
//         {/* Por ahora, solo incluye la ruta principal */}
//         <Route path="/" element={<HomePage />} />
        
//         {/* Ruta para cualquier otra dirección no definida */}
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;