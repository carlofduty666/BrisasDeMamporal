import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavBar from './NavBar';
import axios from 'axios';

const CalendarioAcademico = () => {
  const [annoEscolar, setAnnoEscolar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showContent, setShowContent] = useState(false);
  const [titleMoved, setTitleMoved] = useState(false);
  const [visibleSections, setVisibleSections] = useState({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Imágenes para el fondo dinámico
  const backgroundImages = [
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
  ];
  
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

    // Animaciones
    const titleTimer = setTimeout(() => {
      setTitleMoved(true);
    }, 1000);
    
    const contentTimer = setTimeout(() => {
      setShowContent(true);
    }, 2000);

    // Aparición escalonada de secciones
    const sectionTimers = [
      setTimeout(() => setVisibleSections(prev => ({ ...prev, info: true })), 3000),
      setTimeout(() => setVisibleSections(prev => ({ ...prev, calendario: true })), 3500),
      setTimeout(() => setVisibleSections(prev => ({ ...prev, descargas: true })), 4000),
      setTimeout(() => setVisibleSections(prev => ({ ...prev, enlaces: true })), 4500),
    ];

    return () => {
      clearTimeout(titleTimer);
      clearTimeout(contentTimer);
      sectionTimers.forEach(timer => clearTimeout(timer));
    };
  }, []);

  // Cambio automático de imagen de fondo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-cyan-50 relative overflow-hidden">
      {/* Fondo dinámico */}
      <div className="absolute inset-0 z-0">
        {backgroundImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-2000 ease-in-out ${
              index === currentImageIndex ? 'opacity-20 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            <img
              src={image}
              alt={`Background ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-green-900/30 via-slate-800/20 to-cyan-900/30"></div>
          </div>
        ))}
      </div>

      <NavBar />
      
      {/* Hero Section */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className={`transition-all duration-1500 ease-out ${
            titleMoved ? 'transform translate-y-0 opacity-100' : 'transform translate-y-10 opacity-0'
          }`}>
            <div className="inline-block px-6 py-3 bg-green-500/20 backdrop-blur-md rounded-full mb-6 border border-green-300/30">
              <span className="text-green-700 text-sm font-semibold">
                Planificación Académica
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-600 via-cyan-600 to-green-700 bg-clip-text text-transparent">
                Calendario
              </span>
              <br />
              <span className="bg-gradient-to-r from-slate-800 via-green-700 to-slate-800 bg-clip-text text-transparent">
                Académico
              </span>
            </h1>
            
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <p className="text-xl text-slate-700">Cargando información...</p>
              </div>
            ) : error ? (
              <p className="text-xl text-red-500 bg-red-50 p-4 rounded-lg backdrop-blur-sm">{error}</p>
            ) : (
              <p className={`max-w-3xl mx-auto text-xl text-slate-700 mb-8 transition-all duration-1000 ${
                showContent ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
              }`}>
                Año Escolar {annoEscolar?.periodo || '2023-2024'}
              </p>
            )}
            
            {showContent && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
                <Link 
                  to="/register" 
                  className="inline-block bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-full font-semibold hover:from-green-700 hover:to-green-800 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
                >
                  Inscribirse Ahora
                </Link>
                <Link 
                  to="/nuestra-institucion" 
                  className="inline-block border-2 border-green-600 text-green-700 px-8 py-4 rounded-full font-semibold hover:bg-green-600 hover:text-white transform hover:scale-105 transition-all duration-300 backdrop-blur-sm"
                >
                  Conocer Más
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        
        {/* Información general */}
        <div className={`transition-all duration-1000 transform ${
          visibleSections.info ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        } mb-20`}>
          <div className="bg-white/80 backdrop-blur-xl overflow-hidden shadow-2xl rounded-3xl border border-white/20 hover:shadow-3xl transition-all duration-500">
            <div className="px-8 py-12">
              <div className="text-center mb-12">
                <div className="inline-block px-4 py-2 bg-green-100 rounded-full mb-4">
                  <span className="text-green-700 text-sm font-semibold">Información Esencial</span>
                </div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent mb-4">
                  Información General
                </h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {[
                  {
                    title: 'Períodos Académicos',
                    icon: '📚',
                    items: [
                      'Primer Lapso: Septiembre - Diciembre',
                      'Segundo Lapso: Enero - Marzo',
                      'Tercer Lapso: Abril - Julio'
                    ],
                    gradient: 'from-blue-500 to-green-500'
                  },
                  {
                    title: 'Horarios',
                    icon: '🕐',
                    items: [
                      'Educación Inicial: 8:00 AM - 12:00 PM',
                      'Educación Primaria: 7:30 AM - 1:30 PM',
                      'Educación Secundaria: 7:00 AM - 2:00 PM'
                    ],
                    gradient: 'from-green-500 to-cyan-500'
                  },
                  {
                    title: 'Fechas Importantes',
                    icon: '📅',
                    items: [
                      'Inicio de clases: 01/09/2023',
                      'Vacaciones de Navidad: 16/12/2023 - 07/01/2024',
                      'Fin de año escolar: 15/07/2024'
                    ],
                    gradient: 'from-cyan-500 to-blue-500'
                  }
                ].map((section, index) => (
                  <div key={index} className="group hover:scale-105 transition-all duration-500">
                    <div className="bg-gradient-to-br from-green-50/90 to-cyan-50/90 backdrop-blur-sm p-8 rounded-2xl border border-green-100/50 shadow-xl hover:shadow-2xl transition-all duration-500 h-full">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${section.gradient} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        <span className="text-2xl">{section.icon}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-green-800 mb-6">{section.title}</h3>
                      <ul className="space-y-4">
                        {section.items.map((item, idx) => (
                          <li key={idx} className="flex items-start group/item hover:bg-white/50 p-3 rounded-lg transition-all duration-300">
                            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-gradient-to-r from-green-500 to-cyan-500 mt-2 mr-3 group-hover/item:scale-150 transition-transform duration-300"></div>
                            <span className="text-slate-700 font-medium">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Calendario por meses */}
        <div className={`transition-all duration-1000 transform ${
          visibleSections.calendario ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        } mb-20`}>
          <div className="bg-white/80 backdrop-blur-xl overflow-hidden shadow-2xl rounded-3xl border border-white/20 hover:shadow-3xl transition-all duration-500">
            <div className="px-8 py-12">
              <div className="text-center mb-12">
                <div className="inline-block px-4 py-2 bg-green-100 rounded-full mb-4">
                  <span className="text-green-700 text-sm font-semibold">Eventos del Año</span>
                </div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent mb-4">
                  Calendario Mensual
                </h2>
              </div>
              
              <div className="space-y-12">
                {eventos.map((mes, index) => (
                  <div key={index} className="group hover:scale-[1.02] transition-all duration-500">
                    <div className="bg-gradient-to-br from-green-50/90 to-cyan-50/90 backdrop-blur-sm rounded-2xl border border-green-100/50 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
                      <div className="bg-gradient-to-r from-green-600 to-cyan-600 px-8 py-6">
                        <h3 className="text-2xl font-bold text-white flex items-center">
                          <span className="text-3xl mr-3">📅</span>
                          {mes.mes}
                        </h3>
                      </div>
                      <div className="p-8">
                        <div className="space-y-6">
                          {mes.eventos.map((evento, idx) => (
                            <div key={idx} className="group/evento hover:bg-white/60 p-6 rounded-xl transition-all duration-300 border border-green-100/30">
                              <div className="flex flex-col md:flex-row md:items-center gap-4">
                                <div className="flex-shrink-0">
                                  <div className="bg-gradient-to-r from-green-600 to-cyan-600 text-white px-4 py-2 rounded-full text-sm font-bold min-w-[120px] text-center group-hover/evento:scale-105 transition-transform duration-300">
                                    {evento.fecha}
                                  </div>
                                </div>
                                <div className="flex-grow">
                                  <h4 className="text-lg font-bold text-green-800 mb-2 group-hover/evento:text-green-900 transition-colors duration-300">
                                    {evento.titulo}
                                  </h4>
                                  <p className="text-slate-700 leading-relaxed">
                                    {evento.descripcion}
                                  </p>
                                </div>
                                <div className="flex-shrink-0">
                                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-cyan-500 group-hover/evento:scale-150 transition-transform duration-300"></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Descargas */}
        <div className={`transition-all duration-1000 transform ${
          visibleSections.descargas ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        } mb-20`}>
          <div className="bg-gradient-to-br from-green-50/90 to-cyan-50/90 backdrop-blur-xl overflow-hidden shadow-2xl rounded-3xl border border-green-100/50 hover:shadow-3xl transition-all duration-500">
            <div className="px-8 py-12">
              <div className="text-center mb-12">
                <div className="inline-block px-4 py-2 bg-green-100 rounded-full mb-4">
                  <span className="text-green-700 text-sm font-semibold">Recursos Disponibles</span>
                </div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent mb-4">
                  Documentos Descargables
                </h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {[
                  {
                    title: 'Calendario Completo',
                    description: 'Descarga el calendario académico completo en formato PDF.',
                    icon: '📄',
                    gradient: 'from-blue-500 to-green-500'
                  },
                  {
                    title: 'Horarios por Grado',
                    description: 'Descarga los horarios específicos para cada grado y sección.',
                    icon: '📊',
                    gradient: 'from-green-500 to-cyan-500'
                  },
                  {
                    title: 'Planificación Anual',
                    description: 'Descarga la planificación anual de actividades académicas y extracurriculares.',
                    icon: '📋',
                    gradient: 'from-cyan-500 to-blue-500'
                  }
                ].map((doc, index) => (
                  <div key={index} className="group hover:scale-105 transition-all duration-500">
                    <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl border border-green-100/50 shadow-xl hover:shadow-2xl transition-all duration-500 h-full">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${doc.gradient} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        <span className="text-2xl">{doc.icon}</span>
                      </div>
                      <h3 className="text-xl font-bold text-green-800 mb-4">{doc.title}</h3>
                      <p className="text-slate-700 mb-6 leading-relaxed">{doc.description}</p>
                      <a 
                        href="#" 
                        className="inline-flex items-center text-green-700 hover:text-green-800 font-semibold group-hover:translate-x-1 transition-all duration-300"
                      >
                        Descargar PDF
                        <svg className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Enlaces rápidos */}
        <div className={`transition-all duration-1000 transform ${
          visibleSections.enlaces ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        } text-center mb-12`}>
          <h3 className="text-2xl font-bold text-slate-800 mb-8">Enlaces Rápidos</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { to: '/nuestra-institucion', text: 'Nuestra Institución', icon: '🏫' },
              { to: '/register', text: 'Proceso de Inscripción', icon: '📝' },
              { to: '/login', text: 'Inicio de sesión', icon: '🔐' },
            ].map((link, index) => (
              <Link 
                key={index}
                to={link.to} 
                className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm border border-green-200 rounded-full shadow-lg text-green-700 font-semibold hover:bg-green-600 hover:text-white hover:scale-105 transition-all duration-300"
              >
                <span className="mr-2">{link.icon}</span>
                {link.text}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarioAcademico;
