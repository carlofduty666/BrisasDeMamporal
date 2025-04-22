import { useState, useEffect } from 'react';
import { FaUserGraduate, FaChalkboardTeacher, FaUsers, FaMoneyBillWave } from 'react-icons/fa';

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex items-center">
      <div className={`rounded-full p-3 ${color}`}>
        {icon}
      </div>
      <div className="ml-4">
        <h3 className="text-gray-500 text-sm">{title}</h3>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
    </div>
  </div>
);

const RecentActivity = ({ activities }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h2 className="text-lg font-semibold mb-4">Actividad Reciente</h2>
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-start">
          <div className={`rounded-full p-2 ${activity.color} text-white mt-1`}>
            {activity.icon}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">{activity.title}</p>
            <p className="text-xs text-gray-500">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const CuposChart = ({ cupos }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h2 className="text-lg font-semibold mb-4">Cupos Disponibles</h2>
    <div className="space-y-4">
      {cupos.map((item, index) => (
        <div key={index}>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">{item.grado}</span>
            <span className="text-sm font-medium">{item.ocupados}/{item.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full" 
              style={{ width: `${(item.ocupados / item.total) * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const PagosRecientes = ({ pagos }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h2 className="text-lg font-semibold mb-4">Pagos Recientes</h2>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estudiante
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Concepto
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Monto
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {pagos.map((pago, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{pago.estudiante}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{pago.concepto}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">${pago.monto}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  pago.estado === 'Pagado' ? 'bg-green-100 text-green-800' : 
                  pago.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {pago.estado}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    estudiantes: 0,
    profesores: 0,
    representantes: 0,
    pagosMes: 0
  });
  
  const [activities, setActivities] = useState([]);
  const [cupos, setCupos] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // En un escenario real, estas serían llamadas a tu API
        // Por ahora, usamos datos de ejemplo
        
        // Simulación de carga de datos
        setTimeout(() => {
          setStats({
            estudiantes: 450,
            profesores: 32,
            representantes: 380,
            pagosMes: 125000
          });
          
          setActivities([
            {
              title: 'Nueva inscripción: María Rodríguez',
              time: 'Hace 10 minutos',
              icon: <FaUserGraduate size={12} />,
              color: 'bg-blue-500'
            },
            {
              title: 'Pago registrado: Juan Pérez',
              time: 'Hace 30 minutos',
              icon: <FaMoneyBillWave size={12} />,
              color: 'bg-green-500'
            },
            {
              title: 'Nuevo profesor: Carlos Mendoza',
              time: 'Hace 2 horas',
              icon: <FaChalkboardTeacher size={12} />,
              color: 'bg-purple-500'
            },
            {
              title: 'Nuevo representante: Ana Gómez',
              time: 'Hace 3 horas',
              icon: <FaUsers size={12} />,
              color: 'bg-yellow-500'
            }
          ]);
          
          setCupos([
            { grado: '1er Grado', total: 60, ocupados: 45 },
            { grado: '2do Grado', total: 60, ocupados: 52 },
            { grado: '3er Grado', total: 60, ocupados: 58 },
            { grado: '4to Grado', total: 60, ocupados: 40 },
            { grado: '5to Grado', total: 60, ocupados: 35 },
            { grado: '6to Grado', total: 60, ocupados: 30 }
          ]);
          setPagos([
            { estudiante: 'María Rodríguez', concepto: 'Mensualidad Abril', monto: 150, estado: 'Pagado' },
            { estudiante: 'Juan Pérez', concepto: 'Inscripción', monto: 300, estado: 'Pagado' },
            { estudiante: 'Pedro Martínez', concepto: 'Mensualidad Abril', monto: 150, estado: 'Pendiente' },
            { estudiante: 'Luisa Fernández', concepto: 'Mensualidad Abril', monto: 150, estado: 'Vencido' },
            { estudiante: 'Carlos Mendoza', concepto: 'Mensualidad Abril', monto: 150, estado: 'Pagado' }
          ]);
          
          setLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  if (loading) {
    return (
       
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
       
    );
  }
  
  return (
     
      <div className="container mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Resumen escolar</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard 
            title="Estudiantes" 
            value={stats.estudiantes} 
            icon={<FaUserGraduate className="h-6 w-6 text-white" />} 
            color="bg-blue-500" 
          />
          <StatCard 
            title="Profesores" 
            value={stats.profesores} 
            icon={<FaChalkboardTeacher className="h-6 w-6 text-white" />} 
            color="bg-purple-500" 
          />
          <StatCard 
            title="Representantes" 
            value={stats.representantes} 
            icon={<FaUsers className="h-6 w-6 text-white" />} 
            color="bg-yellow-500" 
          />
          <StatCard 
            title="Pagos del Mes" 
            value={`$${stats.pagosMes.toLocaleString()}`} 
            icon={<FaMoneyBillWave className="h-6 w-6 text-white" />} 
            color="bg-green-500" 
          />
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PagosRecientes pagos={pagos} />
          </div>
          <div className="space-y-6">
            <RecentActivity activities={activities} />
            <CuposChart cupos={cupos} />
          </div>
        </div>
      </div>
     
  );
};

export default AdminDashboard;