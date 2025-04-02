import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';


// Componentes de authentication
import RegisterForm from './components/auth/RegisterForm';
import EmailVerification from './components/auth/EmailVerification';
import LoginForm from './components/auth/LoginForm';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import RegistrarPago from './components/pagos/RegistrarPago';

// Componentes de representante
import RepresentanteDashboard from './components/dashboard/RepresentanteDashboard';
import NuevoEstudiante from './components/inscripcion/NuevoEstudiante';
import ComprobanteInscripcion from './components/inscripcion/ComprobanteInscripcion';
import DetallesEstudiante from './components/estudiante/DetallesEstudiante';
import TestUpload from './components/test/TestUpload';

// Componentes de administrador
import AdminDashboard from './components/admin/AdminDashboard';
import CuposManager from './components/admin/academico/CuposManager';
import GradosList from './components/admin/academico/GradosList';
import EditarGrado from './components/admin/academico/EditarGrado';
import MateriasList from './components/admin/academico/MateriasList';
import SeccionesList from './components/admin/academico/SeccionesList';
import InscripcionesList from './components/admin/inscripciones/InscripcionesList'
import InscripcionDetail from './components/admin/inscripciones/InscripcionDetail'
import EstudiantesList from './components/admin/estudiantes/EstudiantesList';
import RepresentanteList from './components/admin/representantes/RepresentanteList';
import RepresentanteDetail from './components/admin/representantes/RepresentanteDetail';
import RepresentanteForm from './components/admin/representantes/RepresentanteForm';
import ProfesoresList from './components/admin/profesores/ProfesoresList';
import ProfesorDetail from './components/admin/profesores/ProfesorDetail';
import ProfesorForm from './components/admin/profesores/ProfesorForm';

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

        <Route 
          path="/admin/academico/grados" 
          element={
            <ProtectedRoute allowedRoles={['adminWeb', 'owner']}>
              <GradosList />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/academico/grados/:id/editar" 
          element={
            <ProtectedRoute allowedRoles={['adminWeb', 'owner']}>
              <EditarGrado />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/academico/materias" 
          element={
            <ProtectedRoute allowedRoles={['adminWeb', 'owner']}>
              <MateriasList />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/academico/secciones" 
          element={
            <ProtectedRoute allowedRoles={['adminWeb', 'owner']}>
              <SeccionesList />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/inscripciones" 
          element={
            <ProtectedRoute allowedRoles={['adminWeb', 'owner']}>
              <InscripcionesList />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/inscripciones/:id" 
          element={
            <ProtectedRoute allowedRoles={['adminWeb', 'owner']}>
              <InscripcionDetail />
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
          path="/admin/representantes"
          element={
            <ProtectedRoute allowedRoles={['adminWeb', 'owner']}>
              <RepresentanteList />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/representantes/nuevo"
          element={
            <ProtectedRoute allowedRoles={['adminWeb', 'owner']}>
              <RepresentanteForm />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/representantes/:id"
          element={
            <ProtectedRoute allowedRoles={['adminWeb', 'owner']}>
              <RepresentanteDetail />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/profesores"
          element={
            <ProtectedRoute allowedRoles={['adminWeb', 'owner']}>
              <ProfesoresList />
            </ProtectedRoute>
          } 
        />

<Route 
          path="/admin/profesores/:id"
          element={
            <ProtectedRoute allowedRoles={['adminWeb', 'owner']}>
              <ProfesorDetail />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/profesores/nuevo"
          element={
            <ProtectedRoute allowedRoles={['adminWeb', 'owner']}>
              <ProfesorForm />
            </ProtectedRoute>
          } 
        />

        <Route
        path="/test/file-upload"
        element={
            <ProtectedRoute allowedRoles={['adminWeb', 'owner']}>
              <TestUpload />
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
