import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { getCurrentUser } from '../../../services/auth.service';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTheme, setCurrentTheme] = useState({
    accent: 'slate',
    gradient: 'from-slate-700 to-slate-800'
  });
  
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
  
  const handleThemeChange = (themeColors) => {
    setCurrentTheme({
      accent: themeColors.accent,
      gradient: themeColors.gradient,
      ...themeColors
    });
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Sidebar */}
      <AdminSidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        userRole={user.tipo}
        onThemeChange={handleThemeChange}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader 
          user={user} 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          currentTheme={currentTheme}
        />
        
        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-slate-50/50 via-white to-gray-50/50 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
