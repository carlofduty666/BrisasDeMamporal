import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';


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
import AdminRoutes from './routes/AdminRoutes';

// Componentes de profesor
import ProfesorDashboard from './components/dashboard/ProfesorDashboard'

// Componentes de home
import NavBar from './components/NavBar';
import InfoHome from './components/InfoHome';
import NuestraInstitucion from './components/NuestraInstitucion';
import CalendarioAcademico from './components/CalendarioAcademico';
import axios from 'axios';
import GestionPagos from './components/pagos/GestionPagos';
import { jwtDecode } from 'jwt-decode';


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
      <InfoHome />
    </div>
  );
};

// Contenedor para GestionPagos: obtiene personaID, annoEscolar y estudiantes si es representante
const GestionPagosPage = () => {
  const token = localStorage.getItem('token');
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [annoEscolar, setAnnoEscolar] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(storedUser);
  const [personaIDLocal, setPersonaIDLocal] = useState(storedUser?.personaID || storedUser?.id || null);
  const [userTypeLocal, setUserTypeLocal] = useState(storedUser?.tipo || '');

  useEffect(() => {
    const cargar = async () => {
      try {
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };

        // Decodificar token para asegurar personaID y tipo
        let decoded = {};
        try {
          decoded = jwtDecode(token);
        } catch {}
        const finalUser = {
          ...storedUser,
          personaID: decoded.personaID ?? storedUser.personaID ?? storedUser.id,
          tipo: storedUser.tipo || decoded.tipo || decoded.rol,
        };
        setUser(finalUser);
        setPersonaIDLocal(finalUser.personaID || null);
        setUserTypeLocal(finalUser.tipo || '');

        // Año escolar actual
        const annoRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/anno-escolar/actual`,
          { headers }
        );
        setAnnoEscolar(annoRes.data || null);

        // Estudiantes si es representante
        if (finalUser?.tipo === 'representante' && finalUser?.personaID) {
          const estRes = await axios.get(
            `${import.meta.env.VITE_API_URL}/personas/representante/${finalUser.personaID}/estudiantes`,
            { headers }
          );
          setEstudiantes(Array.isArray(estRes.data) ? estRes.data : []);
        }
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  if (!token) return <Navigate to="/login" replace />;
  if (loading) return null;

  return (
    <GestionPagos
      userType={userTypeLocal === 'estudiante' ? 'estudiante' : 'representante'}
      personaID={personaIDLocal}
      estudiantes={estudiantes}
      annoEscolar={annoEscolar}
      onSuccess={() => {}}
    />
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  return (


      <ThemeProvider>
        <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/nuestra-institucion" element={<NuestraInstitucion />} />
        <Route path="/calendario-academico" element={<CalendarioAcademico />} />

        <Route path="/register" element={<RegisterForm key="register" />} />
        <Route path="/registro-profesor" element={<RegisterForm />} />
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
        {/* Nueva ruta para gestionar pagos (vista unificada) */}
        <Route 
          path="/pagos" 
          element={
            <ProtectedRoute allowedRoles={['representante', 'estudiante', 'adminWeb', 'owner']}>
              <GestionPagosPage />
            </ProtectedRoute>
          } 
        />

        {/* Ruta legacy para registrar pagos por inscripcion (si se sigue usando en algún lugar) */}
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
            path="/admin/*" 
            element={
              <ProtectedRoute allowedRoles={['adminWeb', 'owner']}>
                <AdminRoutes />
              </ProtectedRoute>
            } 
          />

        {/* Rutas panel de profesor */}
        <Route
          path="/profesor/dashboard"
          element={
            <ProtectedRoute allowedRoles={['profesor', 'adminWeb', 'owner']}>
              <ProfesorDashboard />
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
      
      </ThemeProvider>
  );
}

export default App;