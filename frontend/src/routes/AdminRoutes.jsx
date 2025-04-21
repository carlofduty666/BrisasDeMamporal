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

const AdminLayoutWrapper = () => {
    const [user, setUser] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    
    useEffect(() => {
      const currentUser = getCurrentUser();
      setUser(currentUser || {});
    }, []);
    
    return (
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <AdminSidebar 
          isOpen={sidebarOpen} 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          userRole={user?.tipo}
        />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminHeader 
            user={user} 
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          />
          
          {/* Page Content - Aquí se renderizará el contenido específico */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
            <Outlet /> {/* Esto es clave: renderiza el componente hijo actual */}
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
        </Route>
      </Routes>
    );
};
  
export default AdminRoutes;
  
  