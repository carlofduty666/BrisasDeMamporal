import React from 'react';
import { useState, useEffect } from 'react';
import { FaUserGraduate, FaClipboardList, FaSchool, FaEye, FaChalkboardTeacher, FaUsers, FaMoneyBillWave } from 'react-icons/fa';
import { MdChecklist } from "react-icons/md";
import { Link } from 'react-router-dom';
import axios from 'axios';

const colorCard = (color) => {
  switch (color) {
    case 'blue':
      return {
        card: 'bg-blue-100',
        circle: 'bg-blue-200',
        icon: 'text-blue-600',
        title: 'text-blue-500',
        value: 'text-blue-700'
      };
    case 'purple':
      return {
        card: 'bg-purple-100',
        circle: 'bg-purple-200',
        icon: 'text-purple-600',
        title: 'text-purple-500',
        value: 'text-purple-700'
      };
    case 'yellow':
      return {
        card: 'bg-yellow-100',
        circle: 'bg-yellow-200',
        icon: 'text-yellow-600',
        title: 'text-yellow-600',
        value: 'text-yellow-700'
      };
    case 'green':
      return {
        card: 'bg-green-100',
        circle: 'bg-green-200',
        icon: 'text-green-600',
        title: 'text-green-500',
        value: 'text-green-700'
      };
    default:
      return {
        card: 'bg-gray-100',
        circle: 'bg-gray-100',
        icon: 'text-gray-600',
        title: 'text-gray-500',
        value: 'text-gray-700'
      };
  }
};


const StatCard = ({ title, value, icon, color, link }) => {
  const styles = colorCard(color);
  
  return (
    <Link 
      to={link} 
      className="block group transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
    >
      <div className={`${styles.card} p-6 rounded-2xl shadow-md h-full border border-white/20 transition-all duration-200 group-hover:shadow-lg`}>
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${styles.circle}`}>
            {React.cloneElement(icon, { className: `h-6 w-6 ${styles.icon}` })}
          </div>
          <div className="text-right">
            <p className={`text-sm font-medium ${styles.title} mb-1`}>{title}</p>
            <p className={`text-2xl font-bold ${styles.value}`}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
          </div>
        </div>
        
        {/* Barra de progreso simplificada */}
        <div className="w-full bg-gray-200/50 rounded-full h-1">
          <div 
            className={`h-full bg-gradient-to-r from-${color}-400 to-${color}-500 rounded-full`}
            style={{ width: '75%' }}
          ></div>
        </div>
      </div>
    </Link>
  );
};

const RecentActivity = ({ activities }) => (
  <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20 relative overflow-hidden">
    {/* Fondo decorativo */}
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full blur-2xl"></div>
    
    <div className="relative z-10">
      <div className="flex items-center mb-6">
        <div className="p-2 rounded-xl bg-blue-100/70 backdrop-blur-md mr-3">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent">
          Actividad Reciente
        </h2>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div 
            key={index} 
            className="group flex items-start p-3 rounded-xl hover:bg-white/50 hover:backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`rounded-xl p-2.5 ${activity.color} text-white mt-1 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              {activity.icon}
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 transition-colors duration-300">
                {activity.title}
              </p>
              <p className="text-xs text-gray-500 mt-1 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {activity.time}
              </p>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const CuposChart = ({ cupos }) => (
  <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20 relative overflow-hidden">
    {/* Fondo decorativo */}
    <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-2xl"></div>
    
    <div className="relative z-10">
      <div className="flex items-center mb-6">
        <div className="p-2 rounded-xl bg-emerald-100/70 backdrop-blur-md mr-3">
          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-600 bg-clip-text text-transparent">
          Cupos Disponibles
        </h2>
      </div>
      
      <div className="space-y-6">
        {cupos.map((item, index) => {
          const percentage = (item.ocupados / item.total) * 100;
          const isNearFull = percentage > 85;
          const isFull = percentage === 100;
          
          return (
            <div 
              key={index} 
              className="group p-4 rounded-xl hover:bg-white/50 hover:backdrop-blur-md transition-all duration-300 hover:shadow-md"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <span className="text-sm font-bold text-gray-800 group-hover:text-emerald-700 transition-colors duration-300">
                    {item.grado}
                  </span>
                  {isFull && (
                    <span className="ml-2 px-2 py-1 text-xs font-semibold bg-red-100 text-red-600 rounded-full">
                      Completo
                    </span>
                  )}
                  {isNearFull && !isFull && (
                    <span className="ml-2 px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-600 rounded-full">
                      Casi lleno
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-gray-700">{item.ocupados}</span>
                  <span className="text-sm text-gray-500">/{item.total}</span>
                </div>
              </div>
              
              {/* Barra de progreso moderna */}
              <div className="relative">
                <div className="w-full bg-gray-200/70 rounded-full h-3 overflow-hidden backdrop-blur-sm">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${
                      isFull ? 'bg-gradient-to-r from-red-500 to-red-600' :
                      isNearFull ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                      'bg-gradient-to-r from-emerald-500 to-emerald-600'
                    }`}
                    style={{ 
                      width: `${percentage}%`,
                      transform: 'translateX(-100%)',
                      animation: `slideIn 1s ease-out ${index * 200}ms forwards`
                    }}
                  >
                    {/* Efecto de brillo */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 w-6 animate-pulse"></div>
                  </div>
                </div>
                
                {/* Porcentaje */}
                <div className="flex justify-end mt-1">
                  <span className={`text-xs font-semibold ${
                    isFull ? 'text-red-600' :
                    isNearFull ? 'text-yellow-600' :
                    'text-emerald-600'
                  }`}>
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

const PagosRecientes = ({ pagos }) => (
  <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20">
    <div className="flex flex-row justify-between items-center mb-6">
      <div className="flex items-center">
        <div className="p-2 rounded-xl bg-slate-100 mr-3">
          <FaMoneyBillWave className="w-5 h-5 text-slate-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-700">
          Pagos Recientes
        </h2>
      </div>
      <Link
        to={`/admin/pagos`}
        className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl flex items-center transition-colors duration-200"
        title="Gestionar pagos"
      >
        <span className="font-medium">Gestionar pagos</span>
        <MdChecklist className="ml-2" />
      </Link>
    </div>
      
    <div className="space-y-3">
        {pagos.map((pago, index) => (
          <div 
            key={index} 
            className="p-4 rounded-xl bg-white/60 border border-slate-200/50 hover:bg-white/80 transition-colors duration-200"
          >
            <div className="flex items-center justify-between">
              {/* Información del estudiante */}
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-slate-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {pago.estudiantes?.nombre?.charAt(0) || 'E'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {pago.estudiantes?.nombre} {pago.estudiantes?.apellido}
                  </p>
                  <p className="text-xs text-gray-500">
                    {pago.aranceles?.nombre || 'Pago'}
                  </p>
                </div>
              </div>
              
              {/* Monto y estado */}
              <div className="text-right">
                <p className="text-lg font-bold text-gray-800">
                  ${Number(pago.monto).toLocaleString()}
                </p>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                  pago.estado === 'pagado' 
                    ? 'bg-green-100 text-green-700' : 
                  pago.estado === 'pendiente' 
                    ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-red-100 text-red-700'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                    pago.estado === 'pagado' ? 'bg-green-500' :
                    pago.estado === 'pendiente' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}></div>
                  {pago.estado.charAt(0).toUpperCase() + pago.estado.slice(1)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {pagos.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <FaMoneyBillWave className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">No hay pagos recientes</p>
        </div>
      )}
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
      <div className="flex flex-col justify-center items-center h-96">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-600 border-t-transparent absolute top-0 left-0"></div>
        </div>
        <p className="mt-4 text-slate-600 font-medium">Cargando panel de administración...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50/80 backdrop-blur-xl border border-red-200/50 rounded-2xl p-6 mb-6 shadow-lg">
        <div className="flex items-center">
          <div className="flex-shrink-0 p-2 bg-red-100 rounded-xl">
            <svg className="h-6 w-6 text-red-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-red-800">Error al cargar el dashboard</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section y Widget de Accesos Rápidos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Hero Section */}
        <div className="lg:col-span-2">
          <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-3xl p-8 text-white h-full">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
            <div className="relative z-10 h-full flex flex-col justify-center">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                  Bienvenido al Panel de Administración
                </h1>
                <p className="text-slate-300 text-base lg:text-lg">
                  Gestiona tu institución educativa de manera eficiente y moderna
                </p>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/10 to-transparent rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-full blur-2xl"></div>
          </div>
        </div>

        {/* Widget de Accesos Rápidos */}
        <div className="lg:col-span-1">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20 h-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <div className="p-2 rounded-xl bg-slate-100 mr-3">
                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              Accesos Rápidos
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/inscripcion/nuevo-estudiante"
                className="group p-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200/50 transition-all duration-200 hover:shadow-sm"
              >
                <FaClipboardList className="w-5 h-5 text-blue-600 mb-2" />
                <p className="text-xs font-medium text-blue-700">Nueva Inscripción</p>
              </Link>
              
              <Link
                to="/admin/cupos"
                className="group p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/50 transition-all duration-200 hover:shadow-sm"
              >
                <FaSchool className="w-5 h-5 text-emerald-600 mb-2" />
                <p className="text-xs font-medium text-emerald-700">Gestionar Cupos</p>
              </Link>
              
              <Link
                to="/admin/pagos"
                className="group p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/50 transition-all duration-200 hover:shadow-sm"
              >
                <FaMoneyBillWave className="w-5 h-5 text-slate-600 mb-2" />
                <p className="text-xs font-medium text-slate-700">Registro Pago</p>
              </Link>
              
              <Link
                to="/admin/estudiantes"
                className="group p-3 rounded-xl bg-violet-50 hover:bg-violet-100 border border-violet-200/50 transition-all duration-200 hover:shadow-sm"
              >
                <FaUserGraduate className="w-5 h-5 text-violet-600 mb-2" />
                <p className="text-xs font-medium text-violet-700">Ver Estudiantes</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Estudiantes" 
          value={stats.estudiantes} 
          icon={<FaUserGraduate />} 
          color="blue" 
          link="/admin/estudiantes"
        />
        <StatCard 
          title="Profesores" 
          value={stats.profesores} 
          icon={<FaChalkboardTeacher />} 
          color="purple" 
          link="/admin/profesores"
        />
        <StatCard 
          title="Representantes" 
          value={stats.representantes} 
          icon={<FaUsers />} 
          color="yellow" 
          link="/admin/representantes"
        />
        <StatCard 
          title="Pagos del Mes" 
          value={`$${stats.pagosMes.toLocaleString()}`} 
          icon={<FaMoneyBillWave />} 
          color="green" 
          link="/admin/pagos"
        />
      </div>
      
      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - Información principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pagos recientes */}
          <PagosRecientes pagos={pagos} />
          
          {/* Cupos disponibles */}
          <CuposChart cupos={cupos} />
        </div>
        
        {/* Columna derecha - Actividad */}
        <div>
          {/* Actividad reciente */}
          <RecentActivity activities={activities} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;