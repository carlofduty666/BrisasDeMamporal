import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/admin/layout/AdminSidebar';
import AdminHeader from '../components/admin/layout/AdminHeader';
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
// import ConfiguracionSistema from '../components/admin/configuracion/ConfiguracionSistema';
import AnnoEscolarManager from '../components/admin/configuracion/AnnoEscolarManager.jsx';

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
          <Route path="dashboard" element={<AdminDashboard />} />
          
          {/* Gestión académica */}
          <Route path="cupos" element={<CuposManager />} />
          <Route path="academico/grados" element={<GradosList />} />
          <Route path="academico/grados/:id" element={<GradoDetail />} />
          <Route path="academico/grados/:id/editar" element={<EditarGrado />} />
          <Route path="academico/materias" element={<MateriasList />} />
          <Route path="academico/secciones" element={<SeccionesList />} />
          <Route path="academico/horarios" element={<HorariosManagement />} />
          
          {/* Inscripciones */}
          <Route path="inscripciones" element={<InscripcionesList />} />
          <Route path="inscripciones/:id" element={<InscripcionDetail />} />
          
          {/* Estudiantes */}
          <Route path="estudiantes" element={<EstudiantesList />} />
          <Route path="estudiantes/:id" element={<EstudianteDetail />} />
          
          {/* Representantes */}
          <Route path="representantes" element={<RepresentanteList />} />
          <Route path="representantes/:id" element={<RepresentanteDetail />} />
          <Route path="representantes/nuevo" element={<RepresentanteForm />} />
          
          {/* Profesores */}
          <Route path="profesores" element={<ProfesoresList />} />
          <Route path="profesores/:id" element={<ProfesorDetail />} />
          <Route path="profesores/nuevo" element={<ProfesorForm />} />
          <Route path="profesores/editar/:id" element={<ProfesorForm />} />
          
          {/* Pagos y aranceles */}
          <Route path="aranceles" element={<ArancelesManager />} />
          <Route path="pagos" element={<PagosList />} />
          {/* <Route path="pagos/mensualidades" element={<MensualidadesAdmin />} />
          <Route path="pagos/configuracion" element={<ConfiguracionPagosAdmin />} /> */}
          
          {/* Empleados */}
          <Route path="empleados" element={<EmpleadosList />} />
          <Route path="empleados/:id" element={<EmpleadoDetail />} />
          <Route path="empleados/nuevo" element={<EmpleadoForm />} />
          <Route path="empleados/editar/:id" element={<EmpleadoForm />} />
          
          {/* Configuración del sistema */}
          <Route path="configuracion" element={<div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800">Configuración</h2>
              <p className="text-sm text-slate-600">Administra parámetros del sistema</p>
            </div>
            <div>
              {/* Manager de Años Escolares */}
              <div className="mb-4 text-sm text-slate-600">Años escolares</div>
              <AnnoEscolarManager />
            </div>
          </div>} />
        </Route>
      </Routes>
    );
};
  
export default AdminRoutes;
  
  