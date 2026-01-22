import React, { useState, useEffect } from 'react';
import { FaGraduationCap, FaUsers, FaCalendarAlt, FaCheckCircle, FaClock, FaIdCard, FaUserTie } from 'react-icons/fa';

const InfoAcademica = ({ grado, seccion, annoEscolar, inscripcion, estudiante, representante }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getEstadoInscripcion = () => {
    if (!inscripcion) return { color: 'slate', icon: FaClock, texto: 'Sin inscripción' };
    
    switch (inscripcion.estado) {
      case 'activo':
      case 'aprobado':
        return { color: 'green', icon: FaCheckCircle, texto: 'Activo' };
      case 'pendiente':
        return { color: 'yellow', icon: FaClock, texto: 'Pendiente' };
      case 'rechazado':
        return { color: 'red', icon: FaClock, texto: 'Rechazado' };
      default:
        return { color: 'slate', icon: FaClock, texto: inscripcion.estado };
    }
  };

  const estadoInscripcion = getEstadoInscripcion();
  const EstadoIcon = estadoInscripcion.icon;

  const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-VE', options);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
  };

  const welcomeMessage = estudiante?.genero === 'F' ? 'Bienvenida' : 'Bienvenido';

  return (
    <div className="rounded-xl overflow-hidden shadow-lg border border-slate-200 bg-white mb-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 md:p-8 relative overflow-hidden">
        {/* Abstract shapes/background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500 opacity-5 rounded-full translate-y-1/2 -translate-x-1/3 blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-blue-300 mb-2 text-sm font-medium">
               <FaClock />
               <span className="capitalize">{formatDate(currentTime)}</span>
               <span className="hidden md:inline mx-1">•</span>
               <span>{formatTime(currentTime)}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {welcomeMessage}, {estudiante?.nombre?.split(' ')[0]}
            </h1>
            <p className="text-slate-300 text-lg">
              Panel de Estudiante
            </p>
          </div>
          
          {estudiante && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 w-full md:w-auto md:min-w-[300px] shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-lg font-bold shadow-md ring-2 ring-white/20">
                  {estudiante.nombre?.charAt(0)}{estudiante.apellido?.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-lg leading-tight">{estudiante.nombre} {estudiante.apellido}</p>
                  <div className="flex items-center gap-2 text-sm text-slate-300 mt-1">
                    <FaIdCard className="text-blue-300" />
                    <span className="font-mono">{estudiante.cedula}</span>
                  </div>
                </div>
              </div>
               
               {representante && (
                 <div className="pt-3 border-t border-white/10">
                   <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Representante</p>
                   <div className="flex items-center gap-2 text-sm font-medium">
                     <FaUserTie className="text-slate-300" />
                     <span>{representante.nombre} {representante.apellido}</span>
                   </div>
                 </div>
               )}
            </div>
          )}
        </div>
      </div>

      {/* Stats/Info Grid */}
      <div className="p-4 md:p-6 bg-slate-50 border-t border-slate-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Año Escolar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 transition-all hover:shadow-md hover:border-blue-300 group">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <FaCalendarAlt className="text-blue-600 group-hover:text-white" />
                </div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Periodo</p>
              </div>
              <p className="font-bold text-slate-800 text-lg pl-1">{annoEscolar?.periodo || 'No asignado'}</p>
            </div>

            {/* Grado */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 transition-all hover:shadow-md hover:border-purple-300 group">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <FaGraduationCap className="text-purple-600 group-hover:text-white" />
                </div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Grado</p>
              </div>
              <p className="font-bold text-slate-800 text-lg pl-1">
                {grado?.nombre_grado || 'No asignado'}
              </p>
            </div>

            {/* Sección */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 transition-all hover:shadow-md hover:border-pink-300 group">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-pink-600 group-hover:text-white transition-colors">
                  <FaUsers className="text-pink-600 group-hover:text-white" />
                </div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Sección</p>
              </div>
              <p className="font-bold text-slate-800 text-lg pl-1">{seccion?.nombre_seccion || 'No asignada'}</p>
            </div>

            {/* Estado */}
            <div className={`bg-white p-4 rounded-xl shadow-sm border border-slate-200 transition-all hover:shadow-md hover:border-${estadoInscripcion.color}-300 group`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 bg-${estadoInscripcion.color}-100 rounded-lg flex items-center justify-center group-hover:bg-${estadoInscripcion.color}-600 group-hover:text-white transition-colors`}>
                  <EstadoIcon className={`text-${estadoInscripcion.color}-600 group-hover:text-white`} />
                </div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Estado</p>
              </div>
              <p className={`font-bold text-${estadoInscripcion.color}-600 text-lg pl-1`}>
                {estadoInscripcion.texto}
              </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default InfoAcademica;
