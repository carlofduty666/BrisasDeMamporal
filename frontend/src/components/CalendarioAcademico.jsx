import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavBar from './NavBar';
import axios from 'axios';
import { toast } from 'react-toastify';

const CalendarioAcademico = () => {
  const [annoEscolar, setAnnoEscolar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showContent, setShowContent] = useState(false);
  const [titleMoved, setTitleMoved] = useState(false);
  const [visibleSections, setVisibleSections] = useState({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showHorarioModal, setShowHorarioModal] = useState(false);
  const [grados, setGrados] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [selectedGrado, setSelectedGrado] = useState('');
  const [selectedSeccion, setSelectedSeccion] = useState('');

  // Imágenes para el fondo dinámico
  const backgroundImages = [
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
  ];
  
  // Eventos del calendario con temática estacional
  const eventos = [
    { 
      mes: 'Septiembre', 
      eventos: [
        { fecha: '01/09/2023', titulo: 'Inicio del año escolar', descripcion: 'Bienvenida a todos los estudiantes' },
        { fecha: '15/09/2023', titulo: 'Acto de Independencia', descripcion: 'Conmemoración de la Independencia' }
      ],
      tematica: {
        season: 'autumn',
        colors: 'from-amber-600 to-orange-600',
        bgGradient: 'from-amber-50 to-orange-50',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        ),
        seasonIcon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.86.66C7.06 17.33 9.64 12.44 17 10.97V17l7-7z"/>
          </svg>
        ),
        description: 'Otoño - Regreso a clases'
      }
    },
    { 
      mes: 'Octubre', 
      eventos: [
        { fecha: '12/10/2023', titulo: 'Día de la Resistencia Indígena', descripcion: 'Actividades culturales' },
        { fecha: '31/10/2023', titulo: 'Festival de Otoño', descripcion: 'Actividades recreativas para los estudiantes' }
      ],
      tematica: {
        season: 'autumn',
        colors: 'from-orange-600 to-red-600',
        bgGradient: 'from-orange-50 to-red-50',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.86.66C7.06 17.33 9.64 12.44 17 10.97V17l7-7z"/>
          </svg>
        ),
        seasonIcon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.86.66C7.06 17.33 9.64 12.44 17 10.97V17l7-7z"/>
          </svg>
        ),
        description: 'Otoño - Festival de colores'
      }
    },
    { 
      mes: 'Noviembre', 
      eventos: [
        { fecha: '15/11/2023', titulo: 'Entrega de boletines primer lapso', descripcion: 'Reunión con representantes' },
        { fecha: '20/11/2023', titulo: 'Semana de la Ciencia', descripcion: 'Exposiciones de proyectos científicos' }
      ],
      tematica: {
        season: 'autumn',
        colors: 'from-yellow-700 to-amber-800',
        bgGradient: 'from-yellow-50 to-amber-50',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 3V18H7V3H9M12 3L14 5H13V10H14L12 12L10 10H11V5H10L12 3Z"/>
          </svg>
        ),
        seasonIcon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.86.66C7.06 17.33 9.64 12.44 17 10.97V17l7-7z"/>
          </svg>
        ),
        description: 'Otoño tardío - Cosecha del saber'
      }
    },
    { 
      mes: 'Diciembre', 
      eventos: [
        { fecha: '08/12/2023', titulo: 'Acto de Navidad', descripcion: 'Presentaciones artísticas navideñas' },
        { fecha: '15/12/2023', titulo: 'Cierre del primer trimestre', descripcion: 'Último día de clases antes de vacaciones' }
      ],
      tematica: {
        season: 'winter',
        colors: 'from-blue-600 to-indigo-700',
        bgGradient: 'from-blue-50 to-indigo-50',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12,2L13.09,8.26L22,9L17,14L18.18,22.74L12,19.27L5.82,22.74L7,14L2,9L10.91,8.26L12,2Z"/>
          </svg>
        ),
        seasonIcon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6,14L8,16H16L18,14V10L16,8H8L6,10V14Z"/>
          </svg>
        ),
        description: 'Invierno - Navidad y celebración'
      }
    },
    { 
      mes: 'Enero', 
      eventos: [
        { fecha: '08/01/2024', titulo: 'Reinicio de actividades', descripcion: 'Regreso a clases después de vacaciones' },
        { fecha: '15/01/2024', titulo: 'Jornada de orientación vocacional', descripcion: 'Para estudiantes de último año' }
      ],
      tematica: {
        season: 'winter',
        colors: 'from-slate-600 to-blue-700',
        bgGradient: 'from-slate-50 to-blue-50',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,19H5V8H19V19Z"/>
          </svg>
        ),
        seasonIcon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6,14L8,16H16L18,14V10L16,8H8L6,10V14Z"/>
          </svg>
        ),
        description: 'Invierno - Nuevo comienzo'
      }
    },
    { 
      mes: 'Febrero', 
      eventos: [
        { fecha: '12/02/2024', titulo: 'Carnaval escolar', descripcion: 'Actividades recreativas y culturales' },
        { fecha: '28/02/2024', titulo: 'Entrega de boletines segundo lapso', descripcion: 'Reunión con representantes' }
      ],
      tematica: {
        season: 'winter',
        colors: 'from-pink-600 to-rose-600',
        bgGradient: 'from-pink-50 to-rose-50',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.5,8.64L13.77,6.5L12.95,5.15L7.68,7.29C6.8,7.64 6.34,8.63 6.68,9.5L8.5,8.64M12,18A6,6 0 0,1 6,12C6,10.62 6.5,9.35 7.33,8.37L8.5,8.64C7.58,9.43 7,10.64 7,12A5,5 0 0,0 12,17C13.36,17 14.57,16.42 15.36,15.5L15.63,16.67C14.65,17.5 13.38,18 12,18Z"/>
          </svg>
        ),
        seasonIcon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5 2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"/>
          </svg>
        ),
        description: 'Invierno - Carnaval y amor'
      }
    },
    { 
      mes: 'Marzo', 
      eventos: [
        { fecha: '08/03/2024', titulo: 'Día Internacional de la Mujer', descripcion: 'Charlas y actividades especiales' },
        { fecha: '22/03/2024', titulo: 'Día Mundial del Agua', descripcion: 'Actividades de concientización ambiental' }
      ],
      tematica: {
        season: 'spring',
        colors: 'from-emerald-600 to-green-600',
        bgGradient: 'from-emerald-50 to-green-50',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12,20A6,6 0 0,1 6,14C6,10 12,3.25 12,3.25S18,10 18,14A6,6 0 0,1 12,20Z"/>
          </svg>
        ),
        seasonIcon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6.05,8.05C6.05,6.05 7.86,5.42 9.68,5.61C10,3.84 11.6,2.5 13.5,2.5C15.4,2.5 17,3.84 17.32,5.61C19.14,5.42 20.95,6.05 20.95,8.05V17.95C20.95,19.95 19.14,20.58 17.32,20.39C17,22.16 15.4,23.5 13.5,23.5C11.6,23.5 10,22.16 9.68,20.39C7.86,20.58 6.05,19.95 6.05,17.95V8.05Z"/>
          </svg>
        ),
        description: 'Primavera - Renovación y crecimiento'
      }
    },
    { 
      mes: 'Abril', 
      eventos: [
        { fecha: '07/04/2024', titulo: 'Semana Santa', descripcion: 'Receso escolar' },
        { fecha: '19/04/2024', titulo: 'Día de la Declaración de Independencia', descripcion: 'Acto conmemorativo' }
      ],
      tematica: {
        season: 'spring',
        colors: 'from-green-600 to-teal-600',
        bgGradient: 'from-green-50 to-teal-50',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22M12,20C16.42,20 20,16.42 20,12C20,7.58 16.42,4 12,4C7.58,4 4,7.58 4,12C4,16.42 7.58,20 12,20M16.5,7.5C17.33,7.5 18,8.17 18,9A1.5,1.5 0 0,1 16.5,10.5A1.5,1.5 0 0,1 15,9C15,8.17 15.67,7.5 16.5,7.5Z"/>
          </svg>
        ),
        seasonIcon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6.05,8.05C6.05,6.05 7.86,5.42 9.68,5.61C10,3.84 11.6,2.5 13.5,2.5C15.4,2.5 17,3.84 17.32,5.61C19.14,5.42 20.95,6.05 20.95,8.05V17.95C20.95,19.95 19.14,20.58 17.32,20.39C17,22.16 15.4,23.5 13.5,23.5C11.6,23.5 10,22.16 9.68,20.39C7.86,20.58 6.05,19.95 6.05,17.95V8.05Z"/>
          </svg>
        ),
        description: 'Primavera - Florecimiento y paz'
      }
    },
    { 
      mes: 'Mayo', 
      eventos: [
        { fecha: '01/05/2024', titulo: 'Día del Trabajador', descripcion: 'Feriado nacional' },
        { fecha: '15/05/2024', titulo: 'Olimpiadas deportivas', descripcion: 'Competencias deportivas intercolegiales' }
      ],
      tematica: {
        season: 'spring',
        colors: 'from-lime-600 to-green-600',
        bgGradient: 'from-lime-50 to-green-50',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 3V6H3V14A4 4 0 0 0 7 18H9V21H11V18H13V21H15V18H17A4 4 0 0 0 21 14V6H17V3H15V6H9V3H7M5 8H19V14A2 2 0 0 1 17 16H7A2 2 0 0 1 5 14V8Z"/>
          </svg>
        ),
        seasonIcon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12,18.5A4.5,4.5 0 0,1 7.5,14C7.5,11.11 9.89,8.5 12,8.5C14.11,8.5 16.5,11.11 16.5,14A4.5,4.5 0 0,1 12,18.5M12,2L13.09,8.26L22,9L17,14L18.18,22.74L12,19.27L5.82,22.74L7,14L2,9L10.91,8.26L12,2Z"/>
          </svg>
        ),
        description: 'Primavera - Deporte y energía'
      }
    },
    { 
      mes: 'Junio', 
      eventos: [
        { fecha: '05/06/2024', titulo: 'Día Mundial del Ambiente', descripcion: 'Jornada de limpieza y concientización' },
        { fecha: '24/06/2024', titulo: 'Batalla de Carabobo', descripcion: 'Acto conmemorativo' }
      ],
      tematica: {
        season: 'summer',
        colors: 'from-yellow-500 to-orange-500',
        bgGradient: 'from-yellow-50 to-orange-50',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.9,17.39C17.64,16.59 16.89,16 16,16H15V13A6,6 0 0,0 9,7H3V8.5C3,9.33 3.67,10 4.5,10H5V13A4,4 0 0,0 9,17H17.9M21,16V14L18,11V7C18,6.45 17.55,6 17,6H16C15.45,6 15,6.45 15,7V12L18,15V17C18,17.55 18.45,18 19,18H20C20.55,18 21,17.55 21,17C21,16.45 20.55,16 20,16H21Z"/>
          </svg>
        ),
        seasonIcon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8M12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18M20,8.69V4H15.31L12,0.69L8.69,4H4V8.69L0.69,12L4,15.31V20H8.69L12,23.31L15.31,20H20V15.31L23.31,12L20,8.69Z"/>
          </svg>
        ),
        description: 'Verano - Naturaleza y patria'
      }
    },
    { 
      mes: 'Julio', 
      eventos: [
        { fecha: '05/07/2024', titulo: 'Día de la Independencia', descripcion: 'Acto conmemorativo' },
        { fecha: '15/07/2024', titulo: 'Cierre del año escolar', descripcion: 'Entrega de boletines finales y graduación' }
      ],
      tematica: {
        season: 'summer',
        colors: 'from-red-600 to-yellow-600',
        bgGradient: 'from-red-50 to-yellow-50',
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12,3L13,10.53L20.5,11.5L15.5,16.5L16.5,22L12,19.5L7.5,22L8.5,16.5L3.5,11.5L11,10.53L12,3Z"/>
          </svg>
        ),
        seasonIcon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8M12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18M20,8.69V4H15.31L12,0.69L8.69,4H4V8.69L0.69,12L4,15.31V20H8.69L12,23.31L15.31,20H20V15.31L23.31,12L20,8.69Z"/>
          </svg>
        ),
        description: 'Verano - Graduación y libertad'
      }
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
    fetchGrados();

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

  // Cargar grados
  const fetchGrados = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/grados`);
      setGrados(response.data);
    } catch (error) {
      console.error('Error al cargar grados:', error);
    }
  };

  // Cargar secciones cuando se selecciona un grado
  const handleGradoChange = async (gradoId) => {
    setSelectedGrado(gradoId);
    setSelectedSeccion('');
    if (gradoId) {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/secciones/grado/${gradoId}`);
        setSecciones(response.data);
      } catch (error) {
        console.error('Error al cargar secciones:', error);
        setSecciones([]);
      }
    } else {
      setSecciones([]);
    }
  };

  // Descargar horario PDF
  const descargarHorarioPDF = async () => {
    if (!selectedGrado || !selectedSeccion) {
      toast.error('Por favor selecciona un grado y una sección');
      return;
    }

    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/pdf/horario/${selectedGrado}/${selectedSeccion}`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `horario_${selectedGrado}_${selectedSeccion}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Horario descargado exitosamente');
      setShowHorarioModal(false);
      setSelectedGrado('');
      setSelectedSeccion('');
    } catch (error) {
      console.error('Error al descargar horario:', error);
      toast.error('Error al descargar el horario');
    }
  };

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
                    <div className={`bg-gradient-to-br ${mes.tematica.bgGradient}/90 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden`}>
                      {/* Header del mes con temática estacional */}
                      <div className={`bg-gradient-to-r ${mes.tematica.colors} px-8 py-6 relative overflow-hidden`}>
                        <div className="absolute inset-0 opacity-10">
                          <div className="flex justify-end items-start pt-4 pr-4 text-6xl text-white">
                            {mes.tematica.seasonIcon}
                          </div>
                        </div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="text-white mr-4">{mes.tematica.icon}</div>
                              <div>
                                <h3 className="text-2xl font-bold text-white mb-1">
                                  {mes.mes}
                                </h3>
                                <p className="text-white/80 text-sm font-medium">
                                  {mes.tematica.description}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                                <span className="text-white text-sm font-bold">
                                  {mes.eventos.length} eventos
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Contenido de eventos */}
                      <div className="p-8">
                        <div className="space-y-6">
                          {mes.eventos.map((evento, idx) => (
                            <div key={idx} className="group/evento hover:bg-white/60 p-6 rounded-xl transition-all duration-300 border border-white/30 hover:border-white/60">
                              <div className="flex flex-col md:flex-row md:items-center gap-4">
                                <div className="flex-shrink-0">
                                  <div className={`bg-gradient-to-r ${mes.tematica.colors} text-white px-4 py-2 rounded-full text-sm font-bold min-w-[120px] text-center group-hover/evento:scale-105 transition-transform duration-300 shadow-lg`}>
                                    {evento.fecha}
                                  </div>
                                </div>
                                <div className="flex-grow">
                                  <h4 className="text-lg font-bold text-slate-800 mb-2 group-hover/evento:text-slate-900 transition-colors duration-300">
                                    {evento.titulo}
                                  </h4>
                                  <p className="text-slate-600 leading-relaxed">
                                    {evento.descripcion}
                                  </p>
                                </div>
                                <div className="flex-shrink-0 flex items-center space-x-2">
                                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${mes.tematica.colors} group-hover/evento:scale-150 transition-transform duration-300`}></div>
                                  <div className="group-hover/evento:scale-110 transition-transform duration-300 text-slate-600">
                                    {mes.tematica.seasonIcon}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Decoración estacional en la parte inferior */}
                        <div className="mt-8 pt-6 border-t border-white/30">
                          <div className="flex items-center justify-center space-x-4 opacity-50">
                            {Array.from({length: 5}).map((_, i) => (
                              <div key={i} className="transform hover:scale-125 transition-transform duration-300 text-slate-400">
                                {mes.tematica.seasonIcon}
                              </div>
                            ))}
                          </div>
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
                    gradient: 'from-green-500 to-cyan-500',
                    action: () => setShowHorarioModal(true)
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
                      <button 
                        onClick={doc.action || (() => {})}
                        className="inline-flex items-center text-green-700 hover:text-green-800 font-semibold group-hover:translate-x-1 transition-all duration-300"
                      >
                        {doc.title === 'Horarios por Grado' ? 'Seleccionar Grado' : 'Descargar PDF'}
                        <svg className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
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
      
      {/* Footer */}
      <footer className='bg-slate-800 text-white'>
        <div className='max-w-7xl mx-auto px-6 py-16'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
            {/* Información de Contacto */}
            <div className='space-y-6'>
              <div className='flex items-center space-x-3'>
                <img 
                  src="../img/1.colegioLogo.png" 
                  alt="Brisas de Mamporal" 
                  className="w-10 h-10 object-contain"
                />
                <h3 className='text-xl font-bold'>Brisas de Mamporal</h3>
              </div>
              <p className='text-gray-300 leading-relaxed'>
                Formando líderes del futuro desde 1995 con excelencia académica y valores sólidos.
              </p>
              <div className='space-y-3'>
                <div className='flex items-center space-x-3'>
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className='text-gray-300'>+58 424-123-4567</span>
                </div>
                <div className='flex items-center space-x-3'>
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className='text-gray-300'>info@brisasdemamporal.edu.ve</span>
                </div>
              </div>
            </div>

            {/* Información Académica */}
            <div className='space-y-6'>
              <h3 className='text-xl font-bold text-amber-400'>Información Académica</h3>
              <ul className='space-y-3 text-gray-300'>
                <li>
                  <Link to="/nuestra-institucion" className='hover:text-amber-400 transition-colors duration-300'>
                    Nuestra Institución
                  </Link>
                </li>
                <li>
                  <Link to="/calendario-academico" className='hover:text-amber-400 transition-colors duration-300'>
                    Calendario Académico
                  </Link>
                </li>
                <li>
                  <Link to="/niveles-educativos" className='hover:text-amber-400 transition-colors duration-300'>
                    Niveles Educativos
                  </Link>
                </li>
                <li>
                  <Link to="/inscripciones" className='hover:text-amber-400 transition-colors duration-300'>
                    Proceso de Inscripción
                  </Link>
                </li>
              </ul>
            </div>

            {/* Horarios de Atención */}
            <div className='space-y-6'>
              <h3 className='text-xl font-bold text-emerald-400'>Horarios de Atención</h3>
              <div className='space-y-3 text-gray-300'>
                <div>
                  <h4 className='font-semibold text-white'>Oficina Administrativa</h4>
                  <p>Lunes a Viernes: 7:00 AM - 3:00 PM</p>
                </div>
                <div>
                  <h4 className='font-semibold text-white'>Atención a Representantes</h4>
                  <p>Lunes a Viernes: 8:00 AM - 12:00 PM</p>
                  <p>Martes y Jueves: 2:00 PM - 4:00 PM</p>
                </div>
                <div>
                  <h4 className='font-semibold text-white'>Soporte Técnico</h4>
                  <p>Lunes a Viernes: 9:00 AM - 4:00 PM</p>
                </div>
              </div>
            </div>

            {/* Ubicación y Redes Sociales */}
            <div className='space-y-6'>
              <h3 className='text-xl font-bold text-sky-400'>Ubicación</h3>
              <div className='space-y-3'>
                <div className='flex items-start space-x-3'>
                  <svg className="w-5 h-5 text-sky-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className='text-gray-300 leading-relaxed'>
                    Sector Brisas de Mamporal, <br />
                    Municipio Plaza, Estado Miranda, <br />
                    Venezuela
                  </p>
                </div>
              </div>
              
              <div className='space-y-4'>
                <h4 className='text-lg font-semibold text-white'>Síguenos</h4>
                <div className='flex space-x-4'>
                  <a href="#" className='w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors duration-300'>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </a>
                  <a href="#" className='w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center hover:bg-blue-900 transition-colors duration-300'>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a href="#" className='w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors duration-300'>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.745.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
                    </svg>
                  </a>
                  <a href="#" className='w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors duration-300'>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Línea divisoria y Copyright */}
          <div className='border-t border-gray-700 mt-12 pt-8'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 items-center'>
              <div className='text-gray-400 text-sm'>
                <p>&copy; 2025 Unidad Educativa Privada Brisas de Mamporal. Todos los derechos reservados.</p>
              </div>
              <div className='text-gray-400 text-sm md:text-right'>
                <p>Desarrollado por Carlos Longa</p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal para seleccionar grado y sección */}
      {showHorarioModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Seleccionar Horario</h3>
                <button
                  onClick={() => {
                    setShowHorarioModal(false);
                    setSelectedGrado('');
                    setSelectedSeccion('');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Selector de Grado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecciona el Grado
                  </label>
                  <select
                    value={selectedGrado}
                    onChange={(e) => handleGradoChange(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">-- Selecciona un grado --</option>
                    {grados.map((grado) => (
                      <option key={grado.id} value={grado.id}>
                        {grado.nombre_grado}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selector de Sección */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecciona la Sección
                  </label>
                  <select
                    value={selectedSeccion}
                    onChange={(e) => setSelectedSeccion(e.target.value)}
                    disabled={!selectedGrado}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">-- Selecciona una sección --</option>
                    {secciones.map((seccion) => (
                      <option key={seccion.id} value={seccion.id}>
                        {seccion.nombre_seccion}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowHorarioModal(false);
                    setSelectedGrado('');
                    setSelectedSeccion('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={descargarHorarioPDF}
                  disabled={!selectedGrado || !selectedSeccion}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Descargar PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarioAcademico;
