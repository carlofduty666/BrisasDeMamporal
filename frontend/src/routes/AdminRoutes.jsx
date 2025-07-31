import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/admin/layout/AdminSidebar';
import AdminHeader from '../components/admin/layout/AdminHeader';
import { getCurrentUser } from '../services/auth.service';

import AdminDashboard from '../components/admin/AdminDashboard';
import CuposManager from '../components/admin/academico/CuposManager';
import GradosList from '../components/admin/academico/GradosList';
import EditarGrado from '../components/admin/academico/EditarGrado';
import MateriasList from '../components/admin/academico/MateriasList';
import SeccionesList from '../components/admin/academico/SeccionesList';
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
// import EmpleadosList from '../components/admin/empleados/EmpleadosList';
// import EmpleadoDetail from '../components/admin/empleados/EmpleadoDetail';
// import EmpleadoForm from '../components/admin/empleados/EmpleadoForm';
// import ConfiguracionSistema from '../components/admin/configuracion/ConfiguracionSistema';

const AdminLayoutWrapper = () => {
    const [user, setUser] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    
    useEffect(() => {
      const currentUser = getCurrentUser();
      setUser(currentUser || {});
    }, []);
    
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 overflow-hidden">
        {/* Sidebar */}
        <AdminSidebar 
          isOpen={sidebarOpen} 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          userRole={user?.tipo}
        />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Elementos decorativos de fondo */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-200/20 via-purple-200/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-gradient-to-tr from-indigo-200/15 to-transparent rounded-full blur-2xl pointer-events-none"></div>
          
          <AdminHeader 
            user={user} 
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          />
          
          {/* Page Content - Contenido específico con glassmorphism */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 relative z-10">
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
          <Route path="academico/grados/:id/editar" element={<EditarGrado />} />
          <Route path="academico/materias" element={<MateriasList />} />
          <Route path="academico/secciones" element={<SeccionesList />} />
          
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
          
          {/* Pagos y aranceles */}
          <Route path="aranceles" element={<ArancelesManager />} />
          <Route path="pagos" element={<PagosList />} />
          
          {/* Empleados */}
          {/* <Route path="empleados" element={<EmpleadosList />} />
          <Route path="empleados/:id" element={<EmpleadoDetail />} />
          <Route path="empleados/nuevo" element={<EmpleadoForm />} /> */}
          
          {/* Configuración del sistema (solo para propietarios) */}
          {/* <Route path="configuracion" element={<ConfiguracionSistema />} /> */}
        </Route>
      </Routes>
    );
};
  
export default AdminRoutes;
  
  