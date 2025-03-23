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
import RegistrarPago from './components/pagos/RegistrarPago';

// Componentes de administrador
import AdminDashboard from './components/admin/AdminDashboard';
import EstudiantesList from './components/admin/estudiantes/EstudiantesList';
import CuposManager from './components/admin/academico/CuposManager';

// Importando tus componentes existentes
import NavBar from './components/NavBar';
import Carrusel from './components/Carrusel';
import InfoHome from './components/InfoHome';

// Componente para proteger rutas
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.tipo)) {
    return <Navigate to="/" replace />;
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
        
        {/* Rutas protegidas para representantes */}
        <Route 
          path="/dashboard/representante" 
          element={
            <ProtectedRoute allowedRoles={['representante', 'adminWeb', 'owner']}>
              <RepresentanteDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/inscripcion/nuevo-estudiante" 
          element={
            <ProtectedRoute allowedRoles={['representante', 'adminWeb', 'owner']}>
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
        {/* Nueva ruta para registrar pagos */}
        <Route 
          path="/pagos/registrar/:inscripcionId" 
          element={
            <ProtectedRoute allowedRoles={['representante', 'adminWeb', 'owner']}>
              <RegistrarPago />
            </ProtectedRoute>
          } 
        />
        
        {/* Rutas del panel de administrador */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['adminWeb', 'owner']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/estudiantes" 
          element={
            <ProtectedRoute allowedRoles={['adminWeb', 'owner']}>
              <EstudiantesList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/cupos" 
          element={
            <ProtectedRoute allowedRoles={['adminWeb', 'owner']}>
              <CuposManager />
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
