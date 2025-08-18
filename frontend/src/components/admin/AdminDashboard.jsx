import React from 'react';
import { useState, useEffect } from 'react';
import { FaUserGraduate, FaClipboardList, FaSchool, FaEye, FaChalkboardTeacher, FaUsers, FaMoneyBillWave } from 'react-icons/fa';
import { MdChecklist } from "react-icons/md";
import { Link } from 'react-router-dom';
import axios from 'axios';
import ClasesActuales from '../ClasesActuales';

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
  <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 h-full flex flex-col">
    <div className="flex items-center mb-6">
      <div className="p-2 rounded-lg bg-blue-100 mr-3">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-blue-700">
        Actividad Reciente
      </h2>
    </div>
    
    <div className="flex-1 overflow-y-auto space-y-3 max-h-80">
      {activities.map((activity, index) => (
        <div 
          key={index} 
          className="flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150"
        >
          <div className={`rounded-lg p-2 ${activity.color} text-white`}>
            {activity.icon}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {activity.title}
            </p>
            <p className="text-xs text-gray-500 mt-1 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {activity.time}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const CuposChart = ({ cupos }) => (
  <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 h-full flex flex-col">
    <div className="flex items-center mb-6">
      <div className="p-2 rounded-lg bg-emerald-100 mr-3">
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-emerald-700">
        Cupos Disponibles
      </h2>
    </div>
    
    <div className="flex-1 overflow-y-auto space-y-4 max-h-80">
      {cupos.map((item, index) => {
        const percentage = (item.ocupados / item.total) * 100;
        const isNearFull = percentage > 85;
        const isFull = percentage === 100;
        
        return (
          <div 
            key={index} 
            className="p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <span className="text-sm font-semibold text-gray-900">
                  {item.grado}
                </span>
                {isFull && (
                  <span className="ml-2 px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                    Completo
                  </span>
                )}
                {isNearFull && !isFull && (
                  <span className="ml-2 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                    Casi lleno
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-gray-900">{item.ocupados}</span>
                <span className="text-sm text-gray-500">/{item.total}</span>
              </div>
            </div>
            
            {/* Barra de progreso simple */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-full rounded-full ${
                  isFull ? 'bg-red-500' :
                  isNearFull ? 'bg-yellow-500' :
                  'bg-emerald-500'
                }`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            
            {/* Porcentaje */}
            <div className="flex justify-end mt-1">
              <span className={`text-xs font-medium ${
                isFull ? 'text-red-600' :
                isNearFull ? 'text-yellow-600' :
                'text-emerald-600'
              }`}>
                {percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

const HorariosEnVivo = () => {
  const [horariosActuales, setHorariosActuales] = useState([]);
  const [horaActual, setHoraActual] = useState(new Date());

  useEffect(() => {
    // Actualizar la hora cada minuto
    const interval = setInterval(() => {
      setHoraActual(new Date());
    }, 60000);

    // Simular datos de horarios (esto vendrá de la API)
    const horariosSimulados = [
      {
        id: 1,
        grado: "3er Grado",
        seccion: "A",
        materia: "Matemáticas",
        profesor: "Prof. María García",
        horaInicio: "08:00",
        horaFin: "08:45",
        aula: "Aula 3A",
        estado: "en-curso"
      },
      {
        id: 2,
        grado: "5to Grado", 
        seccion: "B",
        materia: "Ciencias Naturales",
        profesor: "Prof. Carlos Rodríguez",
        horaInicio: "08:00",
        horaFin: "09:30",
        aula: "Lab. Ciencias",
        estado: "en-curso"
      },
      {
        id: 3,
        grado: "1er Grado",
        seccion: "A",
        materia: "Lenguaje",
        profesor: "Prof. Ana López",
        horaInicio: "08:30",
        horaFin: "09:15",
        aula: "Aula 1A",
        estado: "por-comenzar"
      }
    ];

    setHorariosActuales(horariosSimulados);

    return () => clearInterval(interval);
  }, []);

  const formatearHora = (fecha) => {
    return fecha.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const obtenerEstadoClase = (horaInicio, horaFin) => {
    const ahora = formatearHora(horaActual);
    const inicio = horaInicio.replace(':', '');
    const fin = horaFin.replace(':', '');
    const actual = ahora.replace(':', '');
    
    if (actual >= inicio && actual <= fin) return 'en-curso';
    if (actual < inicio) return 'por-comenzar';
    return 'finalizada';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-green-100 mr-3">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-green-700">Clases en Vivo</h2>
            <p className="text-xs text-gray-500">
              Ahora: {formatearHora(horaActual)} • {horariosActuales.filter(h => obtenerEstadoClase(h.horaInicio, h.horaFin) === 'en-curso').length} clases activas
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-green-600 font-medium">En Tiempo Real</span>
        </div>
      </div>
      
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {horariosActuales.map((horario) => {
          const estado = obtenerEstadoClase(horario.horaInicio, horario.horaFin);
          return (
            <div 
              key={horario.id} 
              className="p-4 rounded-lg border-l-4 hover:bg-gray-50 transition-colors duration-150"
              style={{
                borderLeftColor: 
                  estado === 'en-curso' ? '#10B981' :
                  estado === 'por-comenzar' ? '#F59E0B' : '#6B7280'
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900">
                      {horario.grado} - Sección {horario.seccion}
                    </span>
                    <span className="text-xs text-gray-500">{horario.aula}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    estado === 'en-curso' 
                      ? 'bg-green-100 text-green-700' :
                    estado === 'por-comenzar' 
                      ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                  }`}>
                    {estado === 'en-curso' && '🔴 En Curso'}
                    {estado === 'por-comenzar' && '🟡 Por Comenzar'}
                    {estado === 'finalizada' && '⚫ Finalizada'}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 mt-3">
                <div>
                  <span className="font-medium">Materia:</span> {horario.materia}
                </div>
                <div>
                  <span className="font-medium">Profesor:</span> {horario.profesor}
                </div>
                <div>
                  <span className="font-medium">Horario:</span> {horario.horaInicio} - {horario.horaFin}
                </div>
                <div>
                  <span className="font-medium">Estado:</span>
                  <span className={`ml-1 ${
                    estado === 'en-curso' ? 'text-green-600 font-semibold' :
                    estado === 'por-comenzar' ? 'text-yellow-600' : 'text-gray-500'
                  }`}>
                    {estado === 'en-curso' && 'Clase activa'}
                    {estado === 'por-comenzar' && `Inicia en ${horario.horaInicio}`}
                    {estado === 'finalizada' && 'Clase terminada'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {horariosActuales.length === 0 && (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-500">No hay clases programadas en este momento</p>
        </div>
      )}
    </div>
  );
};

const PagosRecientes = ({ pagos }) => (
  <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 h-full flex flex-col">
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
      <div className="flex items-center">
        <div className="p-2 rounded-lg bg-slate-100 mr-3">
          <FaMoneyBillWave className="w-5 h-5 text-slate-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-700">
          Pagos Recientes
        </h2>
      </div>
      <Link
        to={`/admin/pagos`}
        className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors duration-150 text-sm font-medium min-w-fit"
        title="Gestionar pagos"
      >
        <span className="hidden sm:inline">Gestionar pagos</span>
        <span className="sm:hidden">Pagos</span>
      </Link>
    </div>
    
    <div className="flex-1 overflow-y-auto space-y-3 max-h-80">
      {pagos.map((pago, index) => (
        <div 
          key={index} 
          className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-150"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Información del estudiante */}
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="w-10 h-10 bg-slate-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {pago.estudiantes?.nombre?.charAt(0) || 'E'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {pago.estudiantes?.nombre} {pago.estudiantes?.apellido}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {pago.aranceles?.nombre || 'Pago'}
                </p>
              </div>
            </div>
            
            {/* Monto y estado */}
            <div className="flex flex-col sm:text-right gap-1 flex-shrink-0">
              <p className="text-sm font-semibold text-gray-900">
                ${Number(pago.monto).toLocaleString()}
              </p>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium w-fit ${
                pago.estado === 'pagado' 
                  ? 'bg-green-100 text-green-700' : 
                pago.estado === 'pendiente' 
                  ? 'bg-yellow-100 text-yellow-700' : 
                  'bg-red-100 text-red-700'
              }`}>
                {pago.estado.charAt(0).toUpperCase() + pago.estado.slice(1)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
    
    {pagos.length === 0 && (
      <div className="text-center py-8">
        <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
          <FaMoneyBillWave className="w-6 h-6 text-gray-400" />
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
    <div className="space-y-4 lg:space-y-8 animate-fadeIn">
      {/* Hero Section y Widget de Accesos Rápidos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {/* Hero Section */}
        <div className="lg:col-span-2 order-1">
          <div className="bg-slate-800 rounded-xl lg:rounded-2xl p-6 lg:p-8 text-white h-full">
            <div className="h-full flex flex-col justify-center">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-white">
                  Bienvenido al Panel de Administración
                </h1>
                <p className="text-slate-300 text-sm sm:text-base lg:text-lg">
                  Gestiona tu institución educativa de manera eficiente y moderna
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Widget de Accesos Rápidos */}
        <div className="lg:col-span-1 order-2 lg:order-2">
          <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm p-4 lg:p-6 border border-gray-200 h-full">
            <h3 className="text-base lg:text-lg font-bold text-gray-800 mb-3 lg:mb-4 flex items-center">
              <div className="p-2 rounded-lg bg-slate-100 mr-2 lg:mr-3">
                <svg className="w-3 h-3 lg:w-4 lg:h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-sm lg:text-base">Accesos Rápidos</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-2 lg:gap-3">
              <Link
                to="/inscripcion/nuevo-estudiante"
                className="p-2 lg:p-3 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors duration-150 text-center"
              >
                <FaClipboardList className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600 mb-1 lg:mb-2 mx-auto" />
                <p className="text-xs font-medium text-blue-700">Nueva Inscripción</p>
              </Link>
              
              <Link
                to="/admin/cupos"
                className="p-2 lg:p-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors duration-150 text-center"
              >
                <FaSchool className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-600 mb-1 lg:mb-2 mx-auto" />
                <p className="text-xs font-medium text-emerald-700">Gestionar Cupos</p>
              </Link>
              
              <Link
                to="/admin/pagos"
                className="p-2 lg:p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors duration-150 text-center"
              >
                <FaMoneyBillWave className="w-4 h-4 lg:w-5 lg:h-5 text-slate-600 mb-1 lg:mb-2 mx-auto" />
                <p className="text-xs font-medium text-slate-700">Registro Pago</p>
              </Link>
              
              <Link
                to="/admin/estudiantes"
                className="p-2 lg:p-3 rounded-lg bg-violet-50 hover:bg-violet-100 border border-violet-200 transition-colors duration-150 text-center"
              >
                <FaUserGraduate className="w-4 h-4 lg:w-5 lg:h-5 text-violet-600 mb-1 lg:mb-2 mx-auto" />
                <p className="text-xs font-medium text-violet-700">Ver Estudiantes</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
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
      
      {/* Componente de Clases Actuales */}
      <ClasesActuales />
      
      {/* Contenido principal - Primera fila */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 auto-rows-fr">
        {/* Pagos recientes */}
        <div className="w-full">
          <PagosRecientes pagos={pagos} />
        </div>
        
        {/* Actividad reciente */}
        <div className="w-full">
          <RecentActivity activities={activities} />
        </div>
        
        {/* Cupos disponibles */}
        <div className="w-full">
          <CuposChart cupos={cupos} />
        </div>
      </div>

      {/* Segunda fila - Horarios en Vivo */}
      <div className="grid grid-cols-1">
        <HorariosEnVivo />
      </div>
    </div>
  );
};

export default AdminDashboard;