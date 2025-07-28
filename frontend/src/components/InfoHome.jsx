import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

function InfoHome() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [showContent, setShowContent] = useState(false);
    const [titleMoved, setTitleMoved] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    
    // Imágenes del carrusel expandido con 7 slides
    const slides = [
        {
            image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
            title: "Excelencia Académica",
            subtitle: "Formando líderes del futuro con los más altos estándares educativos",
            description: "Más de 25 años de experiencia en educación de calidad",
            stats: { students: "1,200+", teachers: "85", programs: "15" }
        },
        {
            image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1232&q=80",
            title: "Educación Integral",
            subtitle: "Desarrollo completo de nuestros estudiantes en todas las áreas",
            description: "Formación académica, artística, deportiva y en valores",
            stats: { students: "98%", teachers: "100%", programs: "24/7" }
        },
        {
            image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
            title: "Innovación Educativa",
            subtitle: "Tecnología de vanguardia al servicio del aprendizaje",
            description: "Aulas inteligentes, laboratorios modernos y plataformas digitales",
            stats: { students: "100%", teachers: "Smart", programs: "Cloud" }
        },
        {
            image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
            title: "Deportes y Recreación",
            subtitle: "Fomentando el desarrollo físico y el trabajo en equipo",
            description: "Múltiples disciplinas deportivas y espacios recreativos",
            stats: { students: "15", teachers: "Olympic", programs: "Daily" }
        },
        {
            image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
            title: "Arte y Cultura",
            subtitle: "Desarrollando la creatividad y sensibilidad artística",
            description: "Teatro, música, danza y artes plásticas",
            stats: { students: "8", teachers: "Professional", programs: "Annual" }
        },
        {
            image: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
            title: "Ciencias y Laboratorios",
            subtitle: "Explorando el mundo a través de la investigación científica",
            description: "Laboratorios de física, química, biología y computación",
            stats: { students: "6", teachers: "PhD", programs: "Research" }
        },
        {
            image: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
            title: "Comunidad Educativa",
            subtitle: "Unidos por la educación y el crecimiento personal",
            description: "Familias, estudiantes y educadores trabajando juntos",
            stats: { students: "Community", teachers: "Together", programs: "Growth" }
        }
    ];

    const statsLabels = {
        0: { students: "Estudiantes", teachers: "Profesores", programs: "Programas" },
        1: { students: "Promoción", teachers: "Calificados", programs: "Soporte" },
        2: { students: "Digital", teachers: "Aulas", programs: "Conectado" },
        3: { students: "Deportes", teachers: "Nivel", programs: "Actividad" },
        4: { students: "Talleres", teachers: "Artistas", programs: "Shows" },
        5: { students: "Labs", teachers: "Científicos", programs: "Proyectos" },
        6: { students: "Unidos", teachers: "Crecemos", programs: "Constante" }
    };

    useEffect(() => {
        if (!isPaused) {
            const interval = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % slides.length);
            }, 7000); // Aumentado a 7 segundos para más contenido
            return () => clearInterval(interval);
        }
    }, [slides.length, isPaused]);

    useEffect(() => {
        // Animación del título que se mueve después de 2 segundos
        const titleTimer = setTimeout(() => {
            setTitleMoved(true);
        }, 2000);
        
        // Contenido que aparece después de 3 segundos
        const contentTimer = setTimeout(() => {
            setShowContent(true);
        }, 3000);

        return () => {
            clearTimeout(titleTimer);
            clearTimeout(contentTimer);
        };
    }, []);

    // Función para cambiar slide manualmente
    const goToSlide = (index) => {
        setCurrentSlide(index);
        setIsPaused(true);
        // Reactivar después de 10 segundos
        setTimeout(() => setIsPaused(false), 10000);
    };

    const goToPrevious = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
        setIsPaused(true);
        setTimeout(() => setIsPaused(false), 10000);
    };

    const goToNext = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setIsPaused(true);
        setTimeout(() => setIsPaused(false), 10000);
    };

    // Control por teclado
    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.key === 'ArrowLeft') {
                goToPrevious();
            } else if (event.key === 'ArrowRight') {
                goToNext();
            } else if (event.key >= '1' && event.key <= '7') {
                goToSlide(parseInt(event.key) - 1);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    return (
        <div className='min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-amber-50'>
            {/* Hero Section con Carrusel Mejorado */}
            <section 
                className='relative h-screen overflow-hidden'
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                {/* Fondo del carrusel */}
                <div className='absolute inset-0'>
                    {slides.map((slide, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-all duration-1500 ease-in-out ${
                                index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                            }`}
                        >
                            <img
                                src={slide.image}
                                alt={slide.title}
                                className='w-full h-full object-cover'
                            />
                            <div className='absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-800/70 to-slate-700/50'></div>
                        </div>
                    ))}
                </div>

                {/* Contenido principal con animaciones */}
                <div className='relative z-10 h-full px-6'>
                    <div className='flex items-center justify-center h-full'>
                        <div className='w-full max-w-7xl mx-auto'>
                            {/* Layout responsivo con animaciones */}
                            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center transition-all duration-1000 ${
                                titleMoved ? 'lg:translate-x-0' : ''
                            }`}>
                                
                                {/* Columna izquierda - Título y información principal */}
                                <div className={`text-white transition-all duration-1000 ease-out ${
                                    titleMoved ? 'lg:text-left' : 'text-center lg:col-span-2'
                                }`}>
                                    <div className='mb-6'>
                                        <div className='inline-block px-4 py-2 bg-amber-500/20 rounded-full mb-4'>
                                            <span className='text-amber-300 text-sm font-semibold'>
                                                {slides[currentSlide].title}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <h1 className={`font-bold text-white mb-6 transition-all duration-1000 ${
                                        titleMoved ? 'text-4xl lg:text-5xl' : 'text-5xl md:text-7xl'
                                    }`}>
                                        <span className='bg-gradient-to-r from-white via-amber-100 to-white bg-clip-text text-transparent'>
                                            Brisas de Mamporal
                                        </span>
                                    </h1>
                                    
                                    <p className={`text-slate-200 mb-8 transition-all duration-1000 ${
                                        titleMoved ? 'text-lg' : 'text-xl md:text-2xl opacity-90'
                                    }`}>
                                        {slides[currentSlide].subtitle}
                                    </p>

                                    {/* Descripción adicional que aparece cuando se mueve el título */}
                                    <div className={`transition-all duration-1000 overflow-hidden ${
                                        titleMoved ? 'max-h-40 opacity-100 mb-8' : 'max-h-0 opacity-0'
                                    }`}>
                                        <p className='text-slate-300 text-base leading-relaxed'>
                                            {slides[currentSlide].description}
                                        </p>
                                    </div>
                                    
                                    <div className='flex flex-col sm:flex-row gap-4'>
                                        <Link 
                                            to="/register" 
                                            className='inline-block bg-amber-500 text-black px-8 py-4 rounded-full font-semibold hover:bg-amber-400 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl'
                                        >
                                            Inscribirse Ahora
                                        </Link>
                                        
                                        {titleMoved && (
                                            <Link 
                                                to="/nuestra-institucion" 
                                                className='inline-block border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-slate-800 transform hover:scale-105 transition-all duration-300'
                                            >
                                                Conocer Más
                                            </Link>
                                        )}
                                    </div>
                                </div>

                                {/* Columna derecha - Tarjetas informativas */}
                                <div className={`transition-all duration-1000 ${
                                    showContent ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
                                }`}>
                                    {showContent && (
                                        <div className='space-y-6'>
                                            {/* Tarjetas de estadísticas */}
                                            <div className='grid grid-cols-3 gap-4'>
                                                {Object.entries(slides[currentSlide].stats).map(([key, value], index) => (
                                                    <div 
                                                        key={key}
                                                        className={`bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center border border-white/20 transition-all duration-500 hover:bg-white/20 hover:scale-105`}
                                                        style={{ animationDelay: `${index * 200}ms` }}
                                                    >
                                                        <div className='text-2xl font-bold text-amber-300 mb-1'>
                                                            {value}
                                                        </div>
                                                        <div className='text-xs text-slate-300'>
                                                            {statsLabels[currentSlide][key]}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Características destacadas */}
                                            <div className='bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20'>
                                                <h3 className='text-xl font-semibold text-white mb-4'>
                                                    Lo que nos hace únicos
                                                </h3>
                                                <div className='grid grid-cols-2 gap-4'>
                                                    <div className='flex items-center space-x-3'>
                                                        <div className='w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center'>
                                                            <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                        <span className='text-slate-200 text-sm'>Acreditación Nacional</span>
                                                    </div>
                                                    <div className='flex items-center space-x-3'>
                                                        <div className='w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center'>
                                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        </div>
                                                        <span className='text-slate-200 text-sm'>ISO 9001:2015</span>
                                                    </div>
                                                    <div className='flex items-center space-x-3'>
                                                        <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center'>
                                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                            </svg>
                                                        </div>
                                                        <span className='text-slate-200 text-sm'>Educación Bilingüe</span>
                                                    </div>
                                                    <div className='flex items-center space-x-3'>
                                                        <div className='w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center'>
                                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                            </svg>
                                                        </div>
                                                        <span className='text-slate-200 text-sm'>Innovación Constante</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Indicadores del carrusel mejorados */}
                <div className='absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50'>
                    <div className='flex flex-col items-center space-y-2'>
                        {/* Indicador de pausa */}
                        {isPaused && (
                            <div className='bg-amber-500/90 text-black px-3 py-1 rounded-full text-xs font-semibold animate-pulse'>
                                ⏸ Pausado - se reanudará automáticamente
                            </div>
                        )}
                        
                        <div className='flex space-x-3 bg-white/10 backdrop-blur-md rounded-full p-3 border border-white/20'>
                            {slides.map((slide, index) => (
                                <button
                                    key={index}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        goToSlide(index);
                                    }}
                                    className={`group relative transition-all duration-300 cursor-pointer ${
                                        index === currentSlide 
                                            ? 'bg-amber-400 w-12 h-4 rounded-full shadow-lg' 
                                            : 'bg-white/50 hover:bg-white/75 w-4 h-4 rounded-full hover:scale-125'
                                    }`}
                                    title={`${slide.title} (Tecla ${index + 1})`}
                                >
                                    {/* Tooltip que aparece al hover */}
                                    <div className='absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/90 text-white px-3 py-1 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none'>
                                        <div className='font-semibold'>{slide.title}</div>
                                        <div className='text-xs opacity-75'>Presiona {index + 1}</div>
                                    </div>
                                    {/* Número del slide */}
                                    {index === currentSlide && (
                                        <span className='absolute inset-0 flex items-center justify-center text-xs font-bold text-black'>
                                            {index + 1}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                        
                        {/* Indicador de controles de teclado */}
                        <div className='text-white/60 text-xs text-center'>
                            Usa ← → o números 1-7 para navegar
                        </div>
                    </div>
                </div>

                {/* Navegación lateral */}
                <button 
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        goToPrevious();
                    }}
                    className='absolute left-6 top-1/2 transform -translate-y-1/2 z-50 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full p-4 transition-all duration-300 border border-white/30 hover:scale-110 active:scale-95 cursor-pointer shadow-lg'
                    title="Slide anterior (← o tecla flecha izquierda)"
                >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                
                <button 
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        goToNext();
                    }}
                    className='absolute right-6 top-1/2 transform -translate-y-1/2 z-50 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full p-4 transition-all duration-300 border border-white/30 hover:scale-110 active:scale-95 cursor-pointer shadow-lg'
                    title="Siguiente slide (→ o tecla flecha derecha)"
                >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </section>

            {/* Sección Nuestra Institución */}
            <section className='py-20 px-6 bg-amber-50'>
                <div 
                    className='max-w-7xl mx-auto relative rounded-3xl overflow-hidden'
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)),
                            url('./img/bodegon-pic.jpg')
                        `,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}
                >
                    {/* Contenido principal */}
                    <div className="relative z-10 py-16"
                >
                    <div className='text-center mb-16 animate-fade-in-up'>
                        <h2 className='text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg'>
                            Nuestra Institución
                        </h2>
                        <div className='w-24 h-1 bg-amber-400 mx-auto rounded-full'></div>
                    </div>
                    
                    <div className='grid lg:grid-cols-2 gap-16 items-center p-7'>
                        <div className='bg-amber-50 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20 animate-fade-in-left'>
                            <div className='space-y-6'>
                                <p className='text-lg text-gray-700 leading-relaxed'>
                                    La Unidad Educativa Brisas de Mamporal es una institución comprometida con la excelencia académica y la formación integral de nuestros estudiantes desde 1995.
                                </p>
                                <p className='text-lg text-gray-700 leading-relaxed'>
                                    Ofrecemos educación de calidad desde preescolar hasta bachillerato, con un equipo docente altamente calificado y dedicado al desarrollo de las capacidades y talentos de cada estudiante.
                                </p>
                                <div className='pt-4'>
                                    <Link 
                                        to="/nuestra-institucion" 
                                        className='inline-flex items-center text-amber-700 hover:text-amber-900 font-semibold group transition-all duration-300'
                                    >
                                        Conocer más sobre nuestra institución
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </div>
                        
                        <div className='grid grid-cols-1 gap-6 animate-fade-in-right'>
                            <div className='bg-amber-50 p-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 border border-white/20'>
                                <div className='flex items-center mb-4'>
                                    <div className='w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center mr-4'>
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <h3 className='text-xl font-bold text-gray-800'>Misión</h3>
                                </div>
                                <p className='text-gray-600 leading-relaxed'>Formar estudiantes integrales con valores y competencias para enfrentar los desafíos del futuro.</p>
                            </div>
                            
                            <div className='bg-amber-50 p-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 border border-white/20'>
                                <div className='flex items-center mb-4'>
                                    <div className='w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mr-4'>
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </div>
                                    <h3 className='text-xl font-bold text-gray-800'>Visión</h3>
                                </div>
                                <p className='text-gray-600 leading-relaxed'>Ser referentes en educación de calidad, innovación pedagógica y formación en valores.</p>
                            </div>
                            
                            <div className='bg-amber-50 p-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 border border-white/20'>
                                <div className='flex items-center mb-4'>
                                    <div className='w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center mr-4'>
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>  
                                    </div>
                                    <h3 className='text-xl font-bold text-gray-800'>Valores</h3>
                                </div>
                                <p className='text-gray-600 leading-relaxed'>Respeto, responsabilidad, excelencia, solidaridad e innovación son los pilares de nuestra comunidad educativa.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className='mt-16 text-center animate-fade-in-up'>
                        <Link 
                            to="/calendario-academico" 
                            className='inline-block bg-amber-500 text-black px-8 py-4 rounded-full font-semibold hover:bg-amber-600 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl drop-shadow-lg'
                        >
                            Ver Calendario Académico
                        </Link>
                    </div>
                    </div>
                </div>
            </section>
            
            {/* Sección Proceso de Inscripción */}
            <section className='py-20 px-6 bg-emerald-50'>
                <div className='max-w-7xl mx-auto'>
                    <div className='text-center mb-16 animate-fade-in-up'>
                        <h2 className='text-4xl md:text-5xl font-bold text-emerald-800 mb-6'>
                            Inscripciones en línea y automáticas
                        </h2>
                        <p className='text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed'>
                            En Brisas de Mamporal hemos implementado un sistema de inscripción en línea para facilitar el proceso a los representantes.
                            Ahora puedes inscribir a tus hijos desde la comodidad de tu hogar, siguiendo unos sencillos pasos.
                        </p>
                        <div className='w-24 h-1 bg-emerald-500 mx-auto rounded-full mt-6'></div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mt-16'>
                        {[
                            {
                                number: "1",
                                title: "Registro de Representante",
                                description: "El primer paso es registrarte como representante en nuestra plataforma. Necesitarás proporcionar tus datos personales y verificar tu correo electrónico.",
                                icon: (
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                )
                            },
                            {
                                number: "2",
                                title: "Inscripción de Estudiantes",
                                description: "Una vez registrado, podrás inscribir a tus hijos proporcionando sus datos y adjuntando los documentos requeridos.",
                                icon: (
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                )
                            },
                            {
                                number: "3",
                                title: "Comprobante y Aprobación",
                                description: "Al finalizar la inscripción, recibirás un comprobante que deberás presentar en la institución para su firma. La inscripción será revisada y aprobada por la administración.",
                                icon: (
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                    </svg>
                                )
                            }
                        ].map((step, index) => (
                            <div 
                                key={index}
                                className='group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-4 transition-all duration-500 border border-white/20 animate-fade-in-up'
                                style={{ animationDelay: `${index * 200}ms` }}
                            >
                                <div className='flex items-center justify-between mb-6'>
                                    <div className='text-6xl font-bold text-emerald-600'>
                                        {step.number}
                                    </div>
                                    <div className='w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300'>
                                        {step.icon}
                                    </div>
                                </div>
                                <h3 className='text-xl font-bold text-gray-800 mb-4'>{step.title}</h3>
                                <p className='text-gray-600 leading-relaxed'>{step.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className='mt-16 text-center animate-fade-in-up'>
                        <Link 
                            to="/register" 
                            className='inline-block bg-emerald-600 text-white px-10 py-4 rounded-full font-semibold hover:bg-emerald-700 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl text-lg'
                        >
                            Comenzar el proceso de inscripción
                        </Link>
                    </div>
                </div>
            </section>

            {/* Sección Beneficios */}
            <section className='py-20 px-6 bg-sky-50'>
                <div className='max-w-7xl mx-auto'>
                    <div className='text-center mb-16 animate-fade-in-up'>
                        <h2 className='text-4xl md:text-5xl font-bold text-sky-800 mb-6'>
                            Beneficios de nuestro sistema
                        </h2>
                        <div className='w-24 h-1 bg-sky-500 mx-auto rounded-full'></div>
                    </div>
                    
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                        {[
                            {
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ),
                                title: "Proceso simplificado",
                                description: "Inscribe a tus hijos sin hacer largas filas ni trámites complicados."
                            },
                            {
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                ),
                                title: "Ahorro de tiempo",
                                description: "Completa el proceso en minutos, desde cualquier lugar y a cualquier hora."
                            },
                            {
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                ),
                                title: "Documentación digital",
                                description: "Adjunta los documentos requeridos en formato digital, sin necesidad de fotocopias."
                            },
                            {
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                ),
                                title: "Seguimiento en línea",
                                description: "Consulta el estado de la inscripción, notas y pagos desde tu perfil de representante."
                            }
                        ].map((benefit, index) => (
                            <div 
                                key={index}
                                className='flex items-start p-6 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-500 animate-fade-in-up border border-white/20'
                                style={{ animationDelay: `${index * 150}ms` }}
                            >
                                <div className='flex-shrink-0 h-14 w-14 rounded-2xl bg-sky-600 flex items-center justify-center text-white mr-6 shadow-lg'>
                                    {benefit.icon}
                                </div>
                                <div>
                                    <h3 className='text-xl font-bold text-gray-800 mb-2'>{benefit.title}</h3>
                                    <p className='text-gray-600 leading-relaxed'>{benefit.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

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
}

export default InfoHome;