import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaClock, 
  FaChalkboardTeacher, 
  FaBook, 
  FaUsers, 
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaSpinner,
  FaExclamationTriangle
} from 'react-icons/fa';

const ClasesActuales = ({ showTitle = true, compact = false }) => {
  const [clasesActuales, setClasesActuales] = useState([]);
  const [proximasClases, setProximasClases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchClasesActuales();
    fetchProximasClases();
    
    // Actualizar cada minuto
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      fetchClasesActuales();
      fetchProximasClases();
    }, 60000);

    // Actualizar la hora cada segundo
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);

  const fetchClasesActuales = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/horarios/clases-actuales`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClasesActuales(response.data.clases || []);
    } catch (error) {
      console.error('Error al obtener clases actuales:', error);
      setError('Error al cargar las clases actuales');
    }
  };

  const fetchProximasClases = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/horarios/proximas-clases?limit=3`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProximasClases(response.data.clases || []);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener próximas clases:', error);
      setError('Error al cargar las próximas clases');
      setLoading(false);
    }
  };

  const formatTime = (time) => {
    if (!time) return '';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getCurrentTimeString = () => {
    return currentTime.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const getCurrentDateString = () => {
    return currentTime.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDayOfWeek = (date = new Date()) => {
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    return days[date.getDay()];
  };

  const isSchoolDay = () => {
    const today = getDayOfWeek();
    return ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'].includes(today);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${compact ? 'p-4' : ''}`}>
        <div className="flex items-center justify-center h-32">
          <FaSpinner className="animate-spin text-blue-500 text-2xl mr-2" />
          <span className="text-gray-600">Cargando clases...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${compact ? 'p-4' : ''}`}>
        <div className="flex items-center justify-center h-32 text-red-500">
          <FaExclamationTriangle className="mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm ${compact ? 'p-4' : 'p-6'}`}>
      {showTitle && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-2">
            <FaClock className="mr-3 text-blue-600" />
            Estado de Clases
          </h2>
          <div className="text-sm text-gray-600">
            <div className="flex items-center mb-1">
              <FaCalendarAlt className="mr-2" />
              {getCurrentDateString()}
            </div>
            <div className="flex items-center">
              <FaClock className="mr-2" />
              {getCurrentTimeString()}
            </div>
          </div>
        </div>
      )}

      {!isSchoolDay() ? (
        <div className="text-center py-8">
          <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay clases hoy
          </h3>
          <p className="text-gray-500">
            Las clases se imparten de lunes a viernes.
          </p>
        </div>
      ) : (
        <>
          {/* Clases Actuales */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Clases en Curso ({clasesActuales.length})
            </h3>
            
            {clasesActuales.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <FaClock className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-600">No hay clases en curso en este momento</p>
              </div>
            ) : (
              <div className="space-y-3">
                {clasesActuales.map((clase, index) => (
                  <div key={index} className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <FaBook className="text-green-600 mr-2" />
                          <h4 className="font-semibold text-gray-900">
                            {clase.materia?.asignatura}
                          </h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <FaChalkboardTeacher className="mr-2" />
                            {clase.profesor?.nombre} {clase.profesor?.apellido}
                          </div>
                          <div className="flex items-center">
                            <FaUsers className="mr-2" />
                            {clase.grado?.nombre_grado} - Sección {clase.seccion?.nombre_seccion}
                          </div>
                          {clase.aula && (
                            <div className="flex items-center">
                              <FaMapMarkerAlt className="mr-2" />
                              {clase.aula}
                            </div>
                          )}
                          <div className="flex items-center">
                            <FaClock className="mr-2" />
                            {formatTime(clase.hora_inicio)} - {formatTime(clase.hora_fin)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          En curso
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Próximas Clases */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              Próximas Clases
            </h3>
            
            {proximasClases.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <FaCalendarAlt className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-600">No hay más clases programadas para hoy</p>
              </div>
            ) : (
              <div className="space-y-3">
                {proximasClases.map((clase, index) => (
                  <div key={index} className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <FaBook className="text-blue-600 mr-2" />
                          <h4 className="font-semibold text-gray-900">
                            {clase.materia?.asignatura}
                          </h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <FaChalkboardTeacher className="mr-2" />
                            {clase.profesor?.nombre} {clase.profesor?.apellido}
                          </div>
                          <div className="flex items-center">
                            <FaUsers className="mr-2" />
                            {clase.grado?.nombre_grado} - Sección {clase.seccion?.nombre_seccion}
                          </div>
                          {clase.aula && (
                            <div className="flex items-center">
                              <FaMapMarkerAlt className="mr-2" />
                              {clase.aula}
                            </div>
                          )}
                          <div className="flex items-center">
                            <FaClock className="mr-2" />
                            {formatTime(clase.hora_inicio)} - {formatTime(clase.hora_fin)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {clase.dia_semana.charAt(0).toUpperCase() + clase.dia_semana.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ClasesActuales;