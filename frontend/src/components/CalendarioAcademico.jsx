import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavBar from './NavBar';
import axios from 'axios';

const CalendarioAcademico = () => {
  const [annoEscolar, setAnnoEscolar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Eventos del calendario (estos serían dinámicos en una implementación real)
  const eventos = [
    { 
      mes: 'Septiembre', 
      eventos: [
        { fecha: '01/09/2023', titulo: 'Inicio del año escolar', descripcion: 'Bienvenida a todos los estudiantes' },
        { fecha: '15/09/2023', titulo: 'Acto de Independencia', descripcion: 'Conmemoración de la Independencia' }
      ] 
    },
    { 
      mes: 'Octubre', 
      eventos: [
        { fecha: '12/10/2023', titulo: 'Día de la Resistencia Indígena', descripcion: 'Actividades culturales' },
        { fecha: '31/10/2023', titulo: 'Festival de Otoño', descripcion: 'Actividades recreativas para los estudiantes' }
      ] 
    },
    { 
      mes: 'Noviembre', 
      eventos: [
        { fecha: '15/11/2023', titulo: 'Entrega de boletines primer lapso', descripcion: 'Reunión con representantes' },
        { fecha: '20/11/2023', titulo: 'Semana de la Ciencia', descripcion: 'Exposiciones de proyectos científicos' }
      ] 
    },
    { 
      mes: 'Diciembre', 
      eventos: [
        { fecha: '08/12/2023', titulo: 'Acto de Navidad', descripcion: 'Presentaciones artísticas navideñas' },
        { fecha: '15/12/2023', titulo: 'Cierre del primer trimestre', descripcion: 'Último día de clases antes de vacaciones' }
      ] 
    },
    { 
      mes: 'Enero', 
      eventos: [
        { fecha: '08/01/2024', titulo: 'Reinicio de actividades', descripcion: 'Regreso a clases después de vacaciones' },
        { fecha: '15/01/2024', titulo: 'Jornada de orientación vocacional', descripcion: 'Para estudiantes de último año' }
      ] 
    },
    { 
      mes: 'Febrero', 
      eventos: [
        { fecha: '12/02/2024', titulo: 'Carnaval escolar', descripcion: 'Actividades recreativas y culturales' },
        { fecha: '28/02/2024', titulo: 'Entrega de boletines segundo lapso', descripcion: 'Reunión con representantes' }
      ] 
    },
    { 
      mes: 'Marzo', 
      eventos: [
        { fecha: '08/03/2024', titulo: 'Día Internacional de la Mujer', descripcion: 'Charlas y actividades especiales' },
        { fecha: '22/03/2024', titulo: 'Día Mundial del Agua', descripcion: 'Actividades de concientización ambiental' }
      ] 
    },
    { 
      mes: 'Abril', 
      eventos: [
        { fecha: '07/04/2024', titulo: 'Semana Santa', descripcion: 'Receso escolar' },
        { fecha: '19/04/2024', titulo: 'Día de la Declaración de Independencia', descripcion: 'Acto conmemorativo' }
      ] 
    },
    { 
      mes: 'Mayo', 
      eventos: [
        { fecha: '01/05/2024', titulo: 'Día del Trabajador', descripcion: 'Feriado nacional' },
        { fecha: '15/05/2024', titulo: 'Olimpiadas deportivas', descripcion: 'Competencias deportivas intercolegiales' }
      ] 
    },
    { 
      mes: 'Junio', 
      eventos: [
        { fecha: '05/06/2024', titulo: 'Día Mundial del Ambiente', descripcion: 'Jornada de limpieza y concientización' },
        { fecha: '24/06/2024', titulo: 'Batalla de Carabobo', descripcion: 'Acto conmemorativo' }
      ] 
    },
    { 
      mes: 'Julio', 
      eventos: [
        { fecha: '05/07/2024', titulo: 'Día de la Independencia', descripcion: 'Acto conmemorativo' },
        { fecha: '15/07/2024', titulo: 'Cierre del año escolar', descripcion: 'Entrega de boletines finales y graduación' }
      ] 
    }
  ];

  useEffect(() => {
    const fetchAnnoEscolar = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/anno-escolar/actual`);
        setAnnoEscolar(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error al obtener el año escolar:', err);
        setError('No se pudo cargar la información del año escolar');
        setLoading(false);
      }
    };

    fetchAnnoEscolar();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 mt-16">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Calendario Académico
          </h1>
          {loading ? (
            <p className="mt-5 text-xl text-gray-500">Cargando información...</p>
          ) : error ? (
            <p className="mt-5 text-xl text-red-500">{error}</p>
          ) : (
            <p className="mt-5 text-xl text-gray-500">
              Año Escolar {annoEscolar?.periodo || '2023-2024'}
            </p>
          )}
        </div>
        
        {/* Información general */}
        <div className="bg-white overflow-hidden shadow rounded-lg mb-12">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-3xl font-bold text-green-700 mb-6">Información General</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-green-800 mb-4">Períodos Académicos</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <strong>Primer Lapso:</strong> Septiembre - Diciembre
                    </div>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <strong>Segundo Lapso:</strong> Enero - Marzo
                    </div>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <strong>Tercer Lapso:</strong> Abril - Julio
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-green-800 mb-4">Horarios</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <strong>Educación Inicial:</strong> 8:00 AM - 12:00 PM
                    </div>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <strong>Educación Primaria:</strong> 7:30 AM - 1:30 PM
                    </div>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                    <strong>Educación Secundaria:</strong> 7:00 AM - 2:00 PM
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-green-800 mb-4">Fechas Importantes</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <strong>Inicio de clases:</strong> 01/09/2023
                    </div>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <strong>Vacaciones de Navidad:</strong> 16/12/2023 - 07/01/2024
                    </div>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <strong>Fin de año escolar:</strong> 15/07/2024
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Calendario por meses */}
        <div className="bg-white overflow-hidden shadow rounded-lg mb-12">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-3xl font-bold text-green-700 mb-6">Calendario Mensual</h2>
            
            <div className="space-y-12">
              {eventos.map((mes, index) => (
                <div key={index} className="border-b border-gray-200 pb-8 last:border-b-0 last:pb-0">
                  <h3 className="text-2xl font-semibold text-green-600 mb-6">{mes.mes}</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Evento
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Descripción
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {mes.eventos.map((evento, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {evento.fecha}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {evento.titulo}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {evento.descripcion}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Descargas */}
        <div className="bg-green-50 overflow-hidden shadow rounded-lg mb-12">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-3xl font-bold text-green-700 mb-6">Documentos Descargables</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <svg className="h-12 w-12 text-green-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Calendario Completo</h3>
                <p className="text-gray-600 mb-4">Descarga el calendario académico completo en formato PDF.</p>
                <a href="#" className="text-green-600 hover:text-green-800 font-medium flex items-center">
                  Descargar PDF
                  <svg className="ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <svg className="h-12 w-12 text-green-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Horarios por Grado</h3>
                <p className="text-gray-600 mb-4">Descarga los horarios específicos para cada grado y sección.</p>
                <a href="#" className="text-green-600 hover:text-green-800 font-medium flex items-center">
                  Descargar PDF
                  <svg className="ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <svg className="h-12 w-12 text-green-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Planificación Anual</h3>
                <p className="text-gray-600 mb-4">Descarga la planificación anual de actividades académicas y extracurriculares.</p>
                <a href="#" className="text-green-600 hover:text-green-800 font-medium flex items-center">
                  Descargar PDF
                  <svg className="ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enlaces rápidos */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Enlaces rápidos</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/nuestra-institucion" className="inline-flex items-center px-4 py-2 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-white hover:bg-green-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              Nuestra Institución
            </Link>
            <Link to="/register" className="inline-flex items-center px-4 py-2 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-white hover:bg-green-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              Proceso de Inscripción
            </Link>
            <Link to="/login" className="inline-flex items-center px-4 py-2 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-white hover:bg-green-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              Inicio de sesión
            </Link>
            {/* <Link to="/registro-profesor" className="inline-flex items-center px-4 py-2 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-white hover:bg-green-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              Acceso a Profesores
            </Link> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarioAcademico;
