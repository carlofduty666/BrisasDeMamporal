import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useThemedClasses } from '../hooks/useThemedClasses';
import React from 'react';
import { Link } from 'react-router-dom';
import NavBar from './NavBar';

const NuestraInstitucion = () => {
    const [showContent, setShowContent] = useState(false);
    const [titleMoved, setTitleMoved] = useState(false);
    const [visibleSections, setVisibleSections] = useState({});
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const { setTheme } = useTheme();
    const { themedClasses } = useThemedClasses();

    // Imágenes para el fondo dinámico
    const backgroundImages = [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Cinco_de_julio_de_1811_por_Juan_Lovera.jpg/1024px-Cinco_de_julio_de_1811_por_Juan_Lovera.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Los_cazadores_a_caballo_en_la_posada_1866_por_Celestino_Mart%C3%ADnez.jpg/1280px-Los_cazadores_a_caballo_en_la_posada_1866_por_Celestino_Mart%C3%ADnez.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Le_d%C3%A9part_pour_les_champs_%28La_partida_hacia_el_campo%29_by_Emilio_Boggio.jpg/800px-Le_d%C3%A9part_pour_les_champs_%28La_partida_hacia_el_campo%29_by_Emilio_Boggio.jpg"
    ];

    useEffect(() => {
        setTheme('red');
        
        // Animación del título
        const titleTimer = setTimeout(() => {
            setTitleMoved(true);
        }, 1000);
        
        // Aparición del contenido
        const contentTimer = setTimeout(() => {
            setShowContent(true);
        }, 2000);

        // Aparición escalonada de secciones
        const sectionTimers = [
            setTimeout(() => setVisibleSections(prev => ({ ...prev, historia: true })), 3000),
            setTimeout(() => setVisibleSections(prev => ({ ...prev, filosofia: true })), 3500),
            setTimeout(() => setVisibleSections(prev => ({ ...prev, oferta: true })), 4000),
            setTimeout(() => setVisibleSections(prev => ({ ...prev, instalaciones: true })), 4500),
            setTimeout(() => setVisibleSections(prev => ({ ...prev, equipo: true })), 5000),
            setTimeout(() => setVisibleSections(prev => ({ ...prev, contacto: true })), 5500),
        ];

        return () => {
            clearTimeout(titleTimer);
            clearTimeout(contentTimer);
            sectionTimers.forEach(timer => clearTimeout(timer));
        };
    }, [setTheme]);

    // Cambio automático de imagen de fondo
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [backgroundImages.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-amber-50 relative overflow-hidden">
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
            <div className="absolute inset-0 bg-gradient-to-br from-red-900/30 via-slate-800/20 to-amber-900/30"></div>
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
            <div className="inline-block px-6 py-3 bg-red-500/20 backdrop-blur-md rounded-full mb-6 border border-red-300/30">
              <span className="text-red-700 text-sm font-semibold">
                Excelencia Educativa desde 1995
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-red-600 via-amber-600 to-red-700 bg-clip-text text-transparent">
                Unidad Educativa
              </span>
              <br />
              <span className="bg-gradient-to-r from-slate-800 via-red-700 to-slate-800 bg-clip-text text-transparent">
                Brisas de Mamporal
              </span>
            </h1>
            <p className={`max-w-3xl mx-auto text-xl text-slate-700 mb-8 transition-all duration-1000 ${
              showContent ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
            }`}>
              Formando líderes del futuro con valores sólidos y excelencia académica
            </p>
            
            {showContent && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
                <Link 
                  to="/register" 
                  className="inline-block bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-full font-semibold hover:from-red-700 hover:to-red-800 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
                >
                  Inscribirse Ahora
                </Link>
                <Link 
                  to="/calendario-academico" 
                  className="inline-block border-2 border-red-600 text-red-700 px-8 py-4 rounded-full font-semibold hover:bg-red-600 hover:text-white transform hover:scale-105 transition-all duration-300 backdrop-blur-sm"
                >
                  Ver Calendario
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        
        {/* Historia */}
        <div className={`transition-all duration-1000 transform ${
          visibleSections.historia ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        } mb-20`}>
          <div className="bg-white/80 backdrop-blur-xl overflow-hidden shadow-2xl rounded-3xl border border-white/20 hover:shadow-3xl transition-all duration-500">
            <div className="px-8 py-12">
              <div className="text-center mb-12">
                <div className="inline-block px-4 py-2 bg-red-100 rounded-full mb-4">
                  <span className="text-red-700 text-sm font-semibold">Nuestra Trayectoria</span>
                </div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-red-700 to-red-600 bg-clip-text text-transparent mb-4">
                  Nuestra Historia
                </h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <p className="text-slate-700 text-lg leading-relaxed">
                    La Unidad Educativa Brisas de Mamporal fue fundada en 1995 con la visión de ofrecer una educación de calidad a la comunidad de Mamporal y sus alrededores. Lo que comenzó como una pequeña escuela con apenas 50 estudiantes, ha crecido hasta convertirse en una institución educativa de referencia en la región.
                  </p>
                  <p className="text-slate-700 text-lg leading-relaxed">
                    A lo largo de estos años, hemos formado a miles de estudiantes que hoy son profesionales exitosos y ciudadanos comprometidos con el desarrollo de su comunidad y del país.
                  </p>
                  <p className="text-slate-700 text-lg leading-relaxed">
                    Nuestra trayectoria está marcada por un constante compromiso con la innovación pedagógica, la formación en valores y la excelencia académica, adaptándonos a los cambios y desafíos de cada época para ofrecer siempre la mejor educación posible.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-amber-50 p-8 rounded-2xl border border-red-100">
                  <h3 className="text-2xl font-bold text-red-800 mb-6">Hitos Importantes</h3>
                  <ul className="space-y-4">
                    {[
                      { year: '95', text: 'Fundación de la institución con educación primaria' },
                      { year: '00', text: 'Ampliación a educación secundaria' },
                      { year: '05', text: 'Inauguración de nuevas instalaciones' },
                      { year: '10', text: 'Implementación de laboratorios de ciencias y tecnología' },
                      { year: '15', text: 'Reconocimiento como institución de excelencia educativa' },
                      { year: '20', text: 'Celebración de 25 años de trayectoria educativa' },
                      { year: '23', text: 'Lanzamiento del sistema de inscripción y gestión en línea' }
                    ].map((item, index) => (
                      <li key={index} className="flex items-start group hover:bg-white/50 p-3 rounded-lg transition-all duration-300">
                        <span className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center text-white text-sm font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                          {item.year}
                        </span>
                        <span className="ml-4 text-slate-700 font-medium group-hover:text-red-700 transition-colors duration-300">
                          {item.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filosofía Institucional */}
        <div className={`transition-all duration-1000 transform ${
          visibleSections.filosofia ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        } mb-20`}>
          <div className="bg-white/80 backdrop-blur-xl overflow-hidden shadow-2xl rounded-3xl border border-white/20 hover:shadow-3xl transition-all duration-500">
            <div className="px-8 py-12">
              <div className="text-center mb-12">
                <div className="inline-block px-4 py-2 bg-red-100 rounded-full mb-4">
                  <span className="text-red-700 text-sm font-semibold">Nuestros Principios</span>
                </div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-red-700 to-red-600 bg-clip-text text-transparent mb-4">
                  Filosofía Institucional
                </h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {[
                  {
                    title: 'Misión',
                    icon: (
                      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                    content: 'Formar estudiantes integrales con sólidos conocimientos académicos, valores éticos y morales, y habilidades para la vida, capaces de contribuir positivamente a la sociedad y enfrentar los desafíos del mundo contemporáneo con responsabilidad y compromiso.',
                    gradient: 'from-red-500 to-red-600'
                  },
                  {
                    title: 'Visión',
                    icon: (
                      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ),
                    content: 'Ser una institución educativa líder y referente en la región, reconocida por su excelencia académica, innovación pedagógica, formación en valores y compromiso con el desarrollo sostenible, que prepara a sus estudiantes para ser ciudadanos globales y agentes de cambio positivo.',
                    gradient: 'from-amber-500 to-red-500'
                  },
                  {
                    title: 'Valores',
                    icon: (
                      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    ),
                    content: null,
                    gradient: 'from-red-600 to-amber-600'
                  }
                ].map((item, index) => (
                  <div key={index} className={`group hover:scale-105 transition-all duration-500 ${index === 2 ? 'lg:col-span-1' : ''}`}>
                    <div className="bg-gradient-to-br from-white/90 to-red-50/90 backdrop-blur-sm p-8 rounded-2xl border border-red-100/50 shadow-xl hover:shadow-2xl transition-all duration-500 h-full">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${item.gradient} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        {item.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-red-800 mb-6">{item.title}</h3>
                      {item.content ? (
                        <p className="text-slate-700 leading-relaxed">{item.content}</p>
                      ) : (
                        <ul className="space-y-3">
                          {[
                            { name: 'Respeto', desc: 'Valoramos la dignidad de cada persona' },
                            { name: 'Responsabilidad', desc: 'Asumimos las consecuencias de nuestras acciones' },
                            { name: 'Excelencia', desc: 'Buscamos la mejora continua en todo lo que hacemos' },
                            { name: 'Solidaridad', desc: 'Nos apoyamos mutuamente como comunidad' },
                            { name: 'Innovación', desc: 'Fomentamos la creatividad y el pensamiento crítico' }
                          ].map((valor, idx) => (
                            <li key={idx} className="flex items-start group/item hover:bg-white/60 p-2 rounded-lg transition-all duration-300">
                              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-gradient-to-r from-red-500 to-amber-500 mt-2 mr-3 group-hover/item:scale-150 transition-transform duration-300"></div>
                              <div>
                                <span className="font-semibold text-red-700">{valor.name}:</span>
                                <span className="text-slate-600 ml-1">{valor.desc}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Oferta Educativa */}
        <div className={`transition-all duration-1000 transform ${
          visibleSections.oferta ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        } mb-20`}>
          <div className="bg-white/80 backdrop-blur-xl overflow-hidden shadow-2xl rounded-3xl border border-white/20 hover:shadow-3xl transition-all duration-500">
            <div className="px-8 py-12">
              <div className="text-center mb-12">
                <div className="inline-block px-4 py-2 bg-red-100 rounded-full mb-4">
                  <span className="text-red-700 text-sm font-semibold">Niveles Educativos</span>
                </div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-red-700 to-red-600 bg-clip-text text-transparent mb-4">
                  Oferta Educativa
                </h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {[
                  {
                    title: 'Educación Inicial',
                    icon: (
                      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                    description: 'Primer acercamiento de los niños al entorno escolar, donde desarrollan habilidades sociales, motoras y cognitivas a través del juego y la exploración.',
                    features: ['Maternal (3 años)', 'Preescolar I (4 años)', 'Preescolar II (5 años)'],
                    gradient: 'from-pink-500 to-red-500',
                    bgGradient: 'from-pink-50/90 to-red-50/90'
                  },
                  {
                    title: 'Educación Primaria',
                    icon: (
                      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    ),
                    description: 'Formación integral que desarrolla competencias básicas en lectura, escritura, matemáticas, ciencias y valores, fomentando la curiosidad y el amor por el aprendizaje.',
                    features: ['1° a 6° grado', 'Programa de inglés intensivo', 'Actividades deportivas y culturales'],
                    gradient: 'from-red-500 to-orange-500',
                    bgGradient: 'from-red-50/90 to-orange-50/90'
                  },
                  {
                    title: 'Educación Secundaria',
                    icon: (
                      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    ),
                    description: 'Preparación académica avanzada que profundiza en las diferentes áreas del conocimiento, desarrollando el pensamiento crítico y preparando a los estudiantes para la educación superior.',
                    features: ['1° a 5° año', 'Orientación vocacional', 'Proyectos de investigación'],
                    gradient: 'from-orange-500 to-amber-500',
                    bgGradient: 'from-orange-50/90 to-amber-50/90'
                  }
                ].map((nivel, index) => (
                  <div key={index} className="group hover:scale-105 transition-all duration-500">
                    <div className={`bg-gradient-to-br ${nivel.bgGradient} backdrop-blur-sm p-8 rounded-2xl border border-red-100/50 shadow-xl hover:shadow-2xl transition-all duration-500 h-full`}>
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${nivel.gradient} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        {nivel.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-red-800 mb-4">{nivel.title}</h3>
                      <p className="text-slate-700 mb-6 leading-relaxed">{nivel.description}</p>
                      <ul className="space-y-3">
                        {nivel.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center group/item hover:bg-white/50 p-2 rounded-lg transition-all duration-300">
                            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-gradient-to-r from-red-500 to-amber-500 mr-3 group-hover/item:scale-150 transition-transform duration-300"></div>
                            <span className="text-slate-700 font-medium">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-6 pt-6 border-t border-red-200/50">
                        <Link 
                          to="/register"
                          className="inline-flex items-center text-red-700 hover:text-red-800 font-semibold group-hover:translate-x-1 transition-all duration-300"
                        >
                          Inscribirse aquí
                          <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Instalaciones */}
        <div className={`transition-all duration-1000 transform ${
          visibleSections.instalaciones ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        } mb-20`}>
          <div className="bg-white/80 backdrop-blur-xl overflow-hidden shadow-2xl rounded-3xl border border-white/20 hover:shadow-3xl transition-all duration-500">
            <div className="px-8 py-12">
              <div className="text-center mb-12">
                <div className="inline-block px-4 py-2 bg-red-100 rounded-full mb-4">
                  <span className="text-red-700 text-sm font-semibold">Espacios Modernos</span>
                </div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-red-700 to-red-600 bg-clip-text text-transparent mb-4">
                  Nuestras Instalaciones
                </h2>
                <p className="text-slate-700 text-lg max-w-3xl mx-auto">
                  Contamos with modernas instalaciones diseñadas para proporcionar un ambiente seguro, cómodo y estimulante para el aprendizaje.
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {[
                  { name: 'Aulas', desc: 'Espaciosas, ventiladas y equipadas con recursos tecnológicos', icon: '🏫', gradient: 'from-blue-500 to-purple-500' },
                  { name: 'Laboratorios', desc: 'De ciencias, informática y robótica para el aprendizaje práctico', icon: '🔬', gradient: 'from-green-500 to-blue-500' },
                  { name: 'Biblioteca', desc: 'Amplia colección de libros, recursos digitales y espacios de estudio', icon: '📚', gradient: 'from-purple-500 to-pink-500' },
                  { name: 'Áreas deportivas', desc: 'Canchas multiusos, piscina y espacios para actividades físicas', icon: '⚽', gradient: 'from-orange-500 to-red-500' },
                  { name: 'Áreas recreativas', desc: 'Patios, jardines y zonas de juego adaptadas a cada edad', icon: '🌳', gradient: 'from-green-500 to-teal-500' },
                  { name: 'Auditorio', desc: 'Para eventos, presentaciones y actividades culturales', icon: '🎭', gradient: 'from-red-500 to-pink-500' }
                ].map((instalacion, index) => (
                  <div key={index} className="group hover:scale-105 transition-all duration-500">
                    <div className="bg-gradient-to-br from-white/90 to-red-50/90 backdrop-blur-sm p-6 rounded-2xl border border-red-100/50 shadow-xl hover:shadow-2xl transition-all duration-500 h-full">
                      <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-r ${instalacion.gradient} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <span className="text-2xl">{instalacion.icon}</span>
                      </div>
                      <h4 className="text-xl font-bold text-red-800 mb-3">{instalacion.name}</h4>
                      <p className="text-slate-700 leading-relaxed">{instalacion.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Equipo Docente */}
        <div className={`transition-all duration-1000 transform ${
          visibleSections.equipo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        } mb-20`}>
          <div className="bg-white/80 backdrop-blur-xl overflow-hidden shadow-2xl rounded-3xl border border-white/20 hover:shadow-3xl transition-all duration-500">
            <div className="px-8 py-12">
              <div className="text-center mb-12">
                <div className="inline-block px-4 py-2 bg-red-100 rounded-full mb-4">
                  <span className="text-red-700 text-sm font-semibold">Profesionales Calificados</span>
                </div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-red-700 to-red-600 bg-clip-text text-transparent mb-4">
                  Equipo Docente
                </h2>
                <p className="text-slate-700 text-lg max-w-3xl mx-auto mb-12">
                  Nuestro equipo está formado por profesionales altamente calificados, con amplia experiencia en el ámbito educativo y comprometidos con la formación integral de nuestros estudiantes.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { name: 'Prof. María González', role: 'Directora Académica', gradient: 'from-pink-500 to-red-500' },
                  { name: 'Prof. Carlos Rodríguez', role: 'Coordinador de Primaria', gradient: 'from-blue-500 to-purple-500' },
                  { name: 'Prof. Ana Martínez', role: 'Coordinadora de Secundaria', gradient: 'from-green-500 to-blue-500' },
                  { name: 'Prof. Luis Pérez', role: 'Coordinador de Tecnología', gradient: 'from-orange-500 to-red-500' }
                ].map((profesor, index) => (
                  <div key={index} className="group text-center hover:scale-105 transition-all duration-500">
                    <div className="bg-gradient-to-br from-white/90 to-red-50/90 backdrop-blur-sm p-6 rounded-2xl border border-red-100/50 shadow-xl hover:shadow-2xl transition-all duration-500">
                      <div className={`h-24 w-24 rounded-full bg-gradient-to-r ${profesor.gradient} mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-bold text-red-800 mb-2">{profesor.name}</h4>
                      <p className="text-slate-600 text-sm">{profesor.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Contacto */}
        <div className={`transition-all duration-1000 transform ${
          visibleSections.contacto ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        } mb-20`}>
          <div className="bg-gradient-to-br from-red-50/90 to-amber-50/90 backdrop-blur-xl overflow-hidden shadow-2xl rounded-3xl border border-red-100/50 hover:shadow-3xl transition-all duration-500">
            <div className="px-8 py-12">
              <div className="text-center mb-12">
                <div className="inline-block px-4 py-2 bg-red-100 rounded-full mb-4">
                  <span className="text-red-700 text-sm font-semibold">Información de Contacto</span>
                </div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-red-700 to-red-600 bg-clip-text text-transparent mb-4">
                  Contáctanos
                </h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <p className="text-slate-700 text-lg leading-relaxed">
                    Si deseas más información sobre nuestra institución, proceso de inscripción o cualquier otra consulta, no dudes en contactarnos. Estaremos encantados de atenderte.
                  </p>
                  <div className="space-y-6">
                    {[
                      { icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z', title: 'Dirección', info: 'Av. Principal de Mamporal, Sector Brisas, Estado Miranda, Venezuela' },
                      { icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z', title: 'Teléfonos', info: '(0234) 123-4567 / (0414) 987-6543' },
                      { icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', title: 'Correo electrónico', info: 'info@brisasdemamporal.edu.ve' },
                      { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', title: 'Horario de atención', info: 'Lunes a Viernes: 7:00 AM - 4:00 PM' }
                    ].map((contact, index) => (
                      <div key={index} className="flex items-start group hover:bg-white/50 p-4 rounded-xl transition-all duration-300">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={contact.icon} />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-red-800 mb-1">{contact.title}</h4>
                          <p className="text-slate-700">{contact.info}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/50">
                  <h3 className="text-2xl font-bold text-red-800 mb-6">Envíanos un mensaje</h3>
                  <form className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">Nombre completo</label>
                      <input type="text" id="name" className="w-full px-4 py-3 border border-red-200 rounded-xl shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300" />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">Correo electrónico</label>
                      <input type="email" id="email" className="w-full px-4 py-3 border border-red-200 rounded-xl shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300" />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-semibold text-slate-700 mb-2">Asunto</label>
                      <input type="text" id="subject" className="w-full px-4 py-3 border border-red-200 rounded-xl shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300" />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-2">Mensaje</label>
                      <textarea id="message" rows="4" className="w-full px-4 py-3 border border-red-200 rounded-xl shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"></textarea>
                    </div>
                    <button type="submit" className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl">
                      Enviar mensaje
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enlaces rápidos */}
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-slate-800 mb-8">Enlaces Rápidos</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { to: '/calendario-academico', text: 'Calendario Académico', icon: '📅' },
              { to: '/register', text: 'Proceso de Inscripción', icon: '📝' },
              { to: '/login', text: 'Acceso a Representantes', icon: '👨‍👩‍👧‍👦' },
              { to: '/registro-profesor', text: 'Acceso a Profesores', icon: '👨‍🏫' }
            ].map((link, index) => (
              <Link 
                key={index}
                to={link.to} 
                className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm border border-red-200 rounded-full shadow-lg text-red-700 font-semibold hover:bg-red-600 hover:text-white hover:scale-105 transition-all duration-300"
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
    </div>
  );
};

export default NuestraInstitucion;
