import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSideBar from './AdminSideBar';
import AdminHeader from './AdminHeader';
import { getCurrentUser } from '../../../services/auth.service';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  useEffect(() => {
    const user = getCurrentUser();
    
    // Verificar si el usuario tiene permisos de administrador
    if (!user || (user.tipo !== 'owner' && user.tipo !== 'adminWeb')) {
      navigate('/login');
      return;
    }
    
    setUser(user);
  }, [navigate]);
  
  if (!user) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        userRole={user.tipo}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader 
          user={user} 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        />
        
        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
