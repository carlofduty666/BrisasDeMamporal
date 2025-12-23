import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/admin/layout/AdminSidebar';
import AdminHeader from '../components/admin/layout/AdminHeader';
import ProtectedRoute from '../components/admin/ProtectedRoute';
import ViewProtectedRoute from '../components/admin/ViewProtectedRoute';
import { getCurrentUser } from '../services/auth.service';

import AdminDashboard from '../components/admin/AdminDashboard';
import CuposManager from '../components/admin/academico/CuposManager';
import GradosList from '../components/admin/academico/GradosList';
import GradoDetail from '../components/admin/academico/GradoDetail';
import EditarGrado from '../components/admin/academico/EditarGrado';
import MateriasList from '../components/admin/academico/MateriasList';
import SeccionesList from '../components/admin/academico/SeccionesList';
import HorariosManagement from '../components/admin/HorariosManagementV2';
import InscripcionesList from '../components/admin/inscripciones/InscripcionesList'
import InscripcionDetail from '../components/admin/inscripciones/InscripcionDetail'
import EstudiantesList from '../components/admin/estudiantes/EstudiantesList';
import EstudianteDetail from '../components/admin/estudiantes/EstudianteDetail';
import RepresentanteList from '../components/admin/representantes/RepresentanteList';
import RepresentanteDetail from '../components/admin/representantes/RepresentanteDetail';
import RepresentanteForm from '../components/admin/representantes/RepresentanteForm';
import ProfesoresList from '../components/admin/profesores/ProfesoresList';
import ProfesorDetail from '../components/admin/profesores/ProfesorDetail';
import ProfesorForm from '../components/admin/profesores/ProfesorForm';
import ArancelesManager from '../components/admin/pagos/ArancelesManager';
import PagosList from '../components/admin/pagos/PagosList';
import MensualidadesAdmin from '../pages/admin/pagos/MensualidadesAdmin';
import ConfiguracionPagosAdmin from '../pages/admin/pagos/ConfiguracionPagosAdmin';
import EmpleadosList from '../components/admin/empleados/EmpleadosList';
import EmpleadoDetail from '../components/admin/empleados/EmpleadoDetail';
import EmpleadoForm from '../components/admin/empleados/EmpleadoForm';
import ConfiguracionGeneral from '../components/admin/configuracion/ConfiguracionGeneral';
import AnnoEscolarManager from '../components/admin/configuracion/AnnoEscolarManager.jsx';
import UsuariosManager from '../components/admin/configuracion/UsuariosManager.jsx';

const AdminLayoutWrapper = () => {
    const [user, setUser] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    
    useEffect(() => {
      const currentUser = getCurrentUser();
      setUser(currentUser || {});
    }, []);
    
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden relative">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <AdminSidebar 
          isOpen={sidebarOpen} 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          userRole={user?.tipo}
        />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          <AdminHeader 
            user={user} 
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          />
          
          {/* Page Content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
              <Outlet /> {/* Renderiza el componente hijo actual */}
            </div>
          </main>
        </div>
      </div>
    );
};

// Definición de rutas
const AdminRoutes = () => {
    return (
      <Routes>
        <Route path="/" element={<AdminLayoutWrapper />}>
          {/* Ruta por defecto */}
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          
          {/* Dashboard */}
          <Route path="dashboard" element={<ViewProtectedRoute route="/admin/dashboard"><AdminDashboard /></ViewProtectedRoute>} />
          
          {/* Gestión académica */}
          <Route path="cupos" element={<ViewProtectedRoute route="/admin/cupos"><CuposManager /></ViewProtectedRoute>} />
          <Route path="academico/grados" element={<ViewProtectedRoute route="/admin/academico/grados"><GradosList /></ViewProtectedRoute>} />
          <Route path="academico/grados/:id" element={<ViewProtectedRoute route="/admin/academico/grados"><GradoDetail /></ViewProtectedRoute>} />
          <Route path="academico/grados/:id/editar" element={<ViewProtectedRoute route="/admin/academico/grados"><EditarGrado /></ViewProtectedRoute>} />
          <Route path="academico/materias" element={<ViewProtectedRoute route="/admin/academico/materias"><MateriasList /></ViewProtectedRoute>} />
          <Route path="academico/secciones" element={<ViewProtectedRoute route="/admin/academico/secciones"><SeccionesList /></ViewProtectedRoute>} />
          <Route path="academico/horarios" element={<ViewProtectedRoute route="/admin/academico/horarios"><HorariosManagement /></ViewProtectedRoute>} />
          
          {/* Inscripciones */}
          <Route path="inscripciones" element={<ViewProtectedRoute route="/admin/inscripciones"><InscripcionesList /></ViewProtectedRoute>} />
          <Route path="inscripciones/:id" element={<ViewProtectedRoute route="/admin/inscripciones"><InscripcionDetail /></ViewProtectedRoute>} />
          
          {/* Estudiantes */}
          <Route path="estudiantes" element={<ViewProtectedRoute route="/admin/estudiantes"><EstudiantesList /></ViewProtectedRoute>} />
          <Route path="estudiantes/:id" element={<ViewProtectedRoute route="/admin/estudiantes"><EstudianteDetail /></ViewProtectedRoute>} />
          
          {/* Representantes */}
          <Route path="representantes" element={<ViewProtectedRoute route="/admin/representantes"><RepresentanteList /></ViewProtectedRoute>} />
          <Route path="representantes/:id" element={<ViewProtectedRoute route="/admin/representantes"><RepresentanteDetail /></ViewProtectedRoute>} />
          <Route path="representantes/nuevo" element={<ViewProtectedRoute route="/admin/representantes"><RepresentanteForm /></ViewProtectedRoute>} />
          
          {/* Profesores */}
          <Route path="profesores" element={<ViewProtectedRoute route="/admin/profesores"><ProfesoresList /></ViewProtectedRoute>} />
          <Route path="profesores/:id" element={<ViewProtectedRoute route="/admin/profesores"><ProfesorDetail /></ViewProtectedRoute>} />
          <Route path="profesores/nuevo" element={<ViewProtectedRoute route="/admin/profesores"><ProfesorForm /></ViewProtectedRoute>} />
          <Route path="profesores/editar/:id" element={<ViewProtectedRoute route="/admin/profesores"><ProfesorForm /></ViewProtectedRoute>} />
          
          {/* Pagos y aranceles */}
          <Route path="aranceles" element={<ViewProtectedRoute route="/admin/pagos"><ArancelesManager /></ViewProtectedRoute>} />
          <Route path="pagos" element={<ViewProtectedRoute route="/admin/pagos"><PagosList /></ViewProtectedRoute>} />
          
          {/* Empleados */}
          <Route path="empleados" element={<ViewProtectedRoute route="/admin/empleados"><EmpleadosList /></ViewProtectedRoute>} />
          <Route path="empleados/:id" element={<ViewProtectedRoute route="/admin/empleados"><EmpleadoDetail /></ViewProtectedRoute>} />
          <Route path="empleados/nuevo" element={<ViewProtectedRoute route="/admin/empleados"><EmpleadoForm /></ViewProtectedRoute>} />
          <Route path="empleados/editar/:id" element={<ViewProtectedRoute route="/admin/empleados"><EmpleadoForm /></ViewProtectedRoute>} />
          
          {/* Configuración del sistema */}
          <Route path="configuracion" element={<ViewProtectedRoute route="/admin/configuracion"><ConfiguracionGeneral /></ViewProtectedRoute>} />
          <Route path="periodo-escolar" element={<ViewProtectedRoute route="/admin/configuracion"><AnnoEscolarManager /></ViewProtectedRoute>} />
          <Route path="usuarios" element={<ViewProtectedRoute route="/admin/configuracion"><UsuariosManager /></ViewProtectedRoute>} />
        </Route>

      </Routes>
    );
};
  
export default AdminRoutes;
  
  