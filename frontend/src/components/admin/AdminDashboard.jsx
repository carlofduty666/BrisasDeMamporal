import { useState, useEffect } from 'react';
import { FaUserGraduate, FaEye, FaChalkboardTeacher, FaUsers, FaMoneyBillWave } from 'react-icons/fa';
import { MdChecklist } from "react-icons/md";
import { Link } from 'react-router-dom';
import axios from 'axios';

const StatCard = ({ title, value, icon, color, link }) => (
  <Link to={link} className="block transition-transform duration-300 hover:scale-105 hover:shadow-lg">
    <div className="bg-white rounded-lg shadow-md p-6 h-full">
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
  </Link>
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
    <div className="flex flex-row justify-between content-center mb-4 ">
      <h2 className="text-lg font-semibold">Pagos Recientes</h2>
      <Link
          to={`/admin/pagos`}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center"
          title="Gestionar pagos"
      >
       Gestionar pagos <MdChecklist className="ml-2" />
      </Link>
    </div>
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
                <div className="text-sm font-medium text-gray-900">
                  {pago.estudiantes?.nombre} {pago.estudiantes?.apellido}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{pago.aranceles?.nombre || 'Pago'}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">${Number(pago.monto).toLocaleString()}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  pago.estado === 'pagado' ? 'bg-green-100 text-green-800' : 
                  pago.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {pago.estado.charAt(0).toUpperCase() + pago.estado.slice(1)}
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
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // Obtener conteo de estudiantes, profesores y representantes
        const estudiantesResponse = await axios.get(`${baseURL}/personas/tipo/estudiante`, { headers });
        const profesoresResponse = await axios.get(`${baseURL}/personas/tipo/profesor`, { headers });
        const representantesResponse = await axios.get(`${baseURL}/personas/tipo/representante`, { headers });
        
        // Obtener pagos del mes actual
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        const pagosResponse = await axios.get(`${baseURL}/pagos`, { headers });
        
        // Filtrar pagos del mes actual y que estén pagados
        const pagosMes = pagosResponse.data.filter(pago => {
          const fechaPago = new Date(pago.fechaPago);
          return fechaPago >= firstDayOfMonth && 
                 fechaPago <= lastDayOfMonth && 
                 pago.estado === 'pagado';
        });
        
        // Calcular el total de pagos del mes
        const totalPagosMes = pagosMes.reduce((total, pago) => total + Number(pago.monto), 0);
        
        // Obtener los últimos 5 pagos para mostrar en la tabla
        const pagosRecientes = pagosResponse.data.slice(0, 5);
        
        // Obtener resumen de cupos
        const cuposResponse = await axios.get(`${baseURL}/cupos/resumen`, { headers });
        
        // Transformar los datos de cupos para el componente
        const cuposFormateados = cuposResponse.data.resumenCupos.map(cupo => ({
          grado: cupo.nombre_grado,
          total: cupo.totalCapacidad,
          ocupados: cupo.totalOcupados
        }));
        
        // Generar actividades recientes
        // Esto es una simulación, idealmente se obtendría de un endpoint específico
        // o se implementaría con websockets para actualizaciones en tiempo real
        const actividadesRecientes = [];
        
        // Añadir últimas inscripciones
        if (estudiantesResponse.data.length > 0) {
          // Ordenar estudiantes por fecha de creación (más recientes primero)
          const estudiantesOrdenados = [...estudiantesResponse.data].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          
          // Añadir los 2 estudiantes más recientes
          estudiantesOrdenados.slice(0, 2).forEach(estudiante => {
            const tiempoTranscurrido = calcularTiempoTranscurrido(new Date(estudiante.createdAt));
            actividadesRecientes.push({
              title: `Nueva inscripción: ${estudiante.nombre} ${estudiante.apellido}`,
              time: tiempoTranscurrido,
              icon: <FaUserGraduate size={12} />,
              color: 'bg-blue-500'
            });
          });
        }
        
        // Añadir últimos pagos
        if (pagosResponse.data.length > 0) {
          // Ordenar pagos por fecha de creación (más recientes primero)
          const pagosOrdenados = [...pagosResponse.data].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          
          // Añadir los 2 pagos más recientes
          pagosOrdenados.slice(0, 2).forEach(pago => {
            const tiempoTranscurrido = calcularTiempoTranscurrido(new Date(pago.createdAt));
            const nombreEstudiante = pago.estudiantes ? 
              `${pago.estudiantes.nombre} ${pago.estudiantes.apellido}` : 
              'Estudiante';
            
            actividadesRecientes.push({
              title: `Pago registrado: ${nombreEstudiante}`,
              time: tiempoTranscurrido,
              icon: <FaMoneyBillWave size={12} />,
              color: 'bg-green-500'
            });
          });
        }
        
        // Añadir últimos profesores
        if (profesoresResponse.data.length > 0) {
          // Ordenar profesores por fecha de creación (más recientes primero)
          const profesoresOrdenados = [...profesoresResponse.data].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          
          // Añadir el profesor más reciente
          if (profesoresOrdenados.length > 0) {
            const profesor = profesoresOrdenados[0];
            const tiempoTranscurrido = calcularTiempoTranscurrido(new Date(profesor.createdAt));
            
            actividadesRecientes.push({
              title: `Nuevo profesor: ${profesor.nombre} ${profesor.apellido}`,
              time: tiempoTranscurrido,
              icon: <FaChalkboardTeacher size={12} />,
              color: 'bg-purple-500'
            });
          }
        }
        
        // Añadir últimos representantes
        if (representantesResponse.data.length > 0) {
          // Ordenar representantes por fecha de creación (más recientes primero)
          const representantesOrdenados = [...representantesResponse.data].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          
          // Añadir el representante más reciente
          if (representantesOrdenados.length > 0) {
            const representante = representantesOrdenados[0];
            const tiempoTranscurrido = calcularTiempoTranscurrido(new Date(representante.createdAt));
            
            actividadesRecientes.push({
              title: `Nuevo representante: ${representante.nombre} ${representante.apellido}`,
              time: tiempoTranscurrido,
              icon: <FaUsers size={12} />,
              color: 'bg-yellow-500'
            });
          }
        }
        
        // Ordenar actividades por tiempo (más recientes primero)
        actividadesRecientes.sort((a, b) => {
          const timeA = a.time.includes('minuto') ? parseInt(a.time) : 
                        a.time.includes('hora') ? parseInt(a.time) * 60 : 
                        a.time.includes('día') ? parseInt(a.time) * 60 * 24 : 0;
          
          const timeB = b.time.includes('minuto') ? parseInt(b.time) : 
                        b.time.includes('hora') ? parseInt(b.time) * 60 : 
                        b.time.includes('día') ? parseInt(b.time) * 60 * 24 : 0;
          
          return timeA - timeB;
        });
        
        // Actualizar estados
        setStats({
          estudiantes: estudiantesResponse.data.length,
          profesores: profesoresResponse.data.length,
          representantes: representantesResponse.data.length,
          pagosMes: totalPagosMes
        });
        
        setActivities(actividadesRecientes);
        setCupos(cuposFormateados);
        setPagos(pagosRecientes);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar datos del dashboard:', err);
        setError('Error al cargar los datos del dashboard. Por favor, intente nuevamente.');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Función para calcular el tiempo transcurrido en formato legible
  const calcularTiempoTranscurrido = (fecha) => {
    const ahora = new Date();
    const diferencia = ahora - fecha;
    
    // Convertir a minutos
    const minutos = Math.floor(diferencia / 60000);
    
    if (minutos < 60) {
      return `Hace ${minutos} minutos`;
    }
    
    // Convertir a horas
    const horas = Math.floor(minutos / 60);
    
    if (horas < 24) {
      return `Hace ${horas} horas`;
    }
    
    // Convertir a días
    const dias = Math.floor(horas / 24);
    
    if (dias < 30) {
      return `Hace ${dias} días`;
    }
    
    // Convertir a meses
    const meses = Math.floor(dias / 30);
    
    if (meses < 12) {
      return `Hace ${meses} meses`;
    }
    
    // Convertir a años
    const años = Math.floor(meses / 12);
    return `Hace ${años} años`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Panel de Administración</h1>
      
      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Estudiantes" 
          value={stats.estudiantes} 
          icon={<FaUserGraduate className="text-white" size={20} />} 
          color="bg-blue-500" 
          link="/admin/estudiantes"
        />
        <StatCard 
          title="Profesores" 
          value={stats.profesores} 
          icon={<FaChalkboardTeacher className="text-white" size={20} />} 
          color="bg-purple-500" 
          link="/admin/profesores"
        />
        <StatCard 
          title="Representantes" 
          value={stats.representantes} 
          icon={<FaUsers className="text-white" size={20} />} 
          color="bg-yellow-500" 
          link="/admin/representantes"
        />
        <StatCard 
          title="Pagos del Mes" 
          value={`$${stats.pagosMes.toLocaleString()}`} 
          icon={<FaMoneyBillWave className="text-white" size={20} />} 
          color="bg-green-500" 
          link="/admin/pagos"
        />
      </div>
      
      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pagos recientes */}
          <PagosRecientes pagos={pagos} />
          
          {/* Cupos disponibles */}
          <CuposChart cupos={cupos} />
        </div>
        
        {/* Columna derecha */}
        <div>
          {/* Actividad reciente */}
          <RecentActivity activities={activities} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;