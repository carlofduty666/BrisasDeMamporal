import { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useThemedClasses } from '../hooks/useThemedClasses';
import React from 'react';
import { Link } from 'react-router-dom';
import NavBar from './NavBar';

const NuestraInstitucion = () => {

    const { setTheme } = useTheme();
    const { themedClasses } = useThemedClasses();

    useEffect(() => {
        setTheme('red');
      }, [setTheme]);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 mt-16">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Unidad Educativa Brisas de Mamporal
          </h1>
          <p className="max-w-3xl mt-5 mx-auto text-xl text-gray-500">
            Formando líderes del futuro desde 1995
          </p>
        </div>
        
        {/* Historia */}
        <div className="bg-white overflow-hidden shadow rounded-lg mb-12">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-3xl font-bold text-red-700 mb-6">Nuestra Historia</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-gray-700 mb-4">
                  La Unidad Educativa Brisas de Mamporal fue fundada en 1995 con la visión de ofrecer una educación de calidad a la comunidad de Mamporal y sus alrededores. Lo que comenzó como una pequeña escuela con apenas 50 estudiantes, ha crecido hasta convertirse en una institución educativa de referencia en la región.
                </p>
                <p className="text-gray-700 mb-4">
                  A lo largo de estos años, hemos formado a miles de estudiantes que hoy son profesionales exitosos y ciudadanos comprometidos con el desarrollo de su comunidad y del país.
                </p>
                <p className="text-gray-700">
                  Nuestra trayectoria está marcada por un constante compromiso con la innovación pedagógica, la formación en valores y la excelencia académica, adaptándonos a los cambios y desafíos de cada época para ofrecer siempre la mejor educación posible.
                </p>
              </div>
              <div className="bg-gray-100 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Hitos importantes</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                  <span className="ml-3 text-gray-700">Fundación de la institución con educación primaria</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-red-50 flex items-center justify-center text-black text-sm font-medium">
                      00
                    </span>
                    <span className="ml-3 text-gray-700">Ampliación a educación secundaria</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-red-50 flex items-center justify-center text-black text-sm font-medium">
                      05
                    </span>
                    <span className="ml-3 text-gray-700">Inauguración de nuevas instalaciones</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-red-50 flex items-center justify-center text-black text-sm font-medium">
                      10
                    </span>
                    <span className="ml-3 text-gray-700">Implementación de laboratorios de ciencias y tecnología</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-red-50 flex items-center justify-center text-black text-sm font-medium">
                      15
                    </span>
                    <span className="ml-3 text-gray-700">Reconocimiento como institución de excelencia educativa</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-red-50 flex items-center justify-center text-black text-sm font-medium">
                      20
                    </span>
                    <span className="ml-3 text-gray-700">Celebración de 25 años de trayectoria educativa</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-red-50 flex items-center justify-center text-black text-sm font-medium">
                      23
                    </span>
                    <span className="ml-3 text-gray-700">Lanzamiento del sistema de inscripción y gestión en línea</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Misión, Visión y Valores */}
        <div className="bg-white overflow-hidden shadow rounded-lg mb-12">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-3xl font-bold text-red-700 mb-6">Filosofía Institucional</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-red-50 p-6 rounded-lg">
                <h3 className="text-2xl font-semibold text-red-800 mb-4">Misión</h3>
                <p className="text-gray-700">
                  Formar estudiantes integrales con sólidos conocimientos académicos, valores éticos y morales, y habilidades para la vida, capaces de contribuir positivamente a la sociedad y enfrentar los desafíos del mundo contemporáneo con responsabilidad y compromiso.
                </p>
              </div>
              <div className="bg-red-50 p-6 rounded-lg">
                <h3 className="text-2xl font-semibold text-red-800 mb-4">Visión</h3>
                <p className="text-gray-700">
                  Ser una institución educativa líder y referente en la región, reconocida por su excelencia académica, innovación pedagógica, formación en valores y compromiso con el desarrollo sostenible, que prepara a sus estudiantes para ser ciudadanos globales y agentes de cambio positivo.
                </p>
              </div>
              <div className="bg-red-50 p-6 rounded-lg">
                <h3 className="text-2xl font-semibold text-red-800 mb-4">Valores</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span><strong>Respeto:</strong> Valoramos la dignidad de cada persona.</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span><strong>Responsabilidad:</strong> Asumimos las consecuencias de nuestras acciones.</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span><strong>Excelencia:</strong> Buscamos la mejora continua en todo lo que hacemos.</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span><strong>Solidaridad:</strong> Nos apoyamos mutuamente como comunidad.</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span><strong>Innovación:</strong> Fomentamos la creatividad y el pensamiento crítico.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Oferta Educativa */}
        <div className="bg-white overflow-hidden shadow rounded-lg mb-12">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-3xl font-bold text-red-700 mb-6">Oferta Educativa</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 rounded-md bg-red-600 flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Educación Inicial</h3>
                <p className="text-gray-600 mb-4">
                  Primer acercamiento de los niños al entorno escolar, donde desarrollan habilidades sociales, motoras y cognitivas a través del juego y la exploración.
                </p>
                <ul className="text-gray-600 space-y-1">
                  <li>• Maternal (3 años)</li>
                  <li>• Preescolar I (4 años)</li>
                  <li>• Preescolar II (5 años)</li>
                </ul>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 rounded-md bg-red-600 flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Educación Primaria</h3>
                <p className="text-gray-600 mb-4">
                  Formación integral que desarrolla competencias básicas en lectura, escritura, matemáticas, ciencias y valores, fomentando la curiosidad y el amor por el aprendizaje.
                </p>
                <ul className="text-gray-600 space-y-1">
                  <li>• 1° a 6° grado</li>
                  <li>• Programa de inglés intensivo</li>
                  <li>• Actividades deportivas y culturales</li>
                </ul>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 rounded-md bg-red-600 flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Educación Secundaria</h3>
                <p className="text-gray-600 mb-4">
                  Preparación académica avanzada que profundiza en las diferentes áreas del conocimiento, desarrollando el pensamiento crítico y preparando a los estudiantes para la educación superior.
                </p>
                <ul className="text-gray-600 space-y-1">
                  <li>• 1° a 5° año</li>
                  <li>• Orientación vocacional</li>
                  <li>• Proyectos de investigación</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Instalaciones */}
        <div className="bg-white overflow-hidden shadow rounded-lg mb-12">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-3xl font-bold text-red-700 mb-6">Nuestras Instalaciones</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-gray-700 mb-6">
                  Contamos con modernas instalaciones diseñadas para proporcionar un ambiente seguro, cómodo y estimulante para el aprendizaje. Nuestros espacios están adaptados a las necesidades de cada nivel educativo y equipados con tecnología de vanguardia.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-700 mb-2">Aulas</h4>
                    <p className="text-gray-600 text-sm">Espaciosas, ventiladas y equipadas con recursos tecnológicos.</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-700 mb-2">Laboratorios</h4>
                    <p className="text-gray-600 text-sm">De ciencias, informática y robótica para el aprendizaje práctico.</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-700 mb-2">Biblioteca</h4>
                    <p className="text-gray-600 text-sm">Amplia colección de libros, recursos digitales y espacios de estudio.</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-700 mb-2">Áreas deportivas</h4>
                    <p className="text-gray-600 text-sm">Canchas multiusos, piscina y espacios para actividades físicas.</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-700 mb-2">Áreas recreativas</h4>
                    <p className="text-gray-600 text-sm">Patios, jardines y zonas de juego adaptadas a cada edad.</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-700 mb-2">Auditorio</h4>
                    <p className="text-gray-600 text-sm">Para eventos, presentaciones y actividades culturales.</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-100 rounded-lg h-48 flex items-center justify-center">
                  <span className="text-red-500 font-medium">Imagen de aulas</span>
                </div>
                <div className="bg-red-100 rounded-lg h-48 flex items-center justify-center">
                  <span className="text-red-500 font-medium">Imagen de laboratorio</span>
                </div>
                <div className="bg-red-100 rounded-lg h-48 flex items-center justify-center">
                  <span className="text-red-500 font-medium">Imagen de biblioteca</span>
                </div>
                <div className="bg-red-100 rounded-lg h-48 flex items-center justify-center">
                  <span className="text-red-500 font-medium">Imagen de áreas deportivas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Equipo Docente */}
        <div className="bg-white overflow-hidden shadow rounded-lg mb-12">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-3xl font-bold text-red-700 mb-6">Equipo Docente</h2>
            <p className="text-gray-700 mb-8">
              Nuestro equipo está formado por profesionales altamente calificados, con amplia experiencia en el ámbito educativo y comprometidos con la formación integral de nuestros estudiantes. Todos nuestros docentes participan en programas de formación continua para mantenerse actualizados en las últimas tendencias pedagógicas y tecnológicas.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="h-32 w-32 rounded-full bg-red-100 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-red-500">Foto</span>
                </div>
                <h4 className="font-semibold text-gray-900">Prof. María González</h4>
                <p className="text-gray-600 text-sm">Directora Académica</p>
              </div>
              <div className="text-center">
                <div className="h-32 w-32 rounded-full bg-red-100 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-red-500">Foto</span>
                </div>
                <h4 className="font-semibold text-gray-900">Prof. Carlos Rodríguez</h4>
                <p className="text-gray-600 text-sm">Coordinador de Primaria</p>
              </div>
              <div className="text-center">
                <div className="h-32 w-32 rounded-full bg-red-100 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-red-500">Foto</span>
                </div>
                <h4 className="font-semibold text-gray-900">Prof. Ana Martínez</h4>
                <p className="text-gray-600 text-sm">Coordinadora de Secundaria</p>
              </div>
              <div className="text-center">
                <div className="h-32 w-32 rounded-full bg-red-100 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-red-500">Foto</span>
                </div>
                <h4 className="font-semibold text-gray-900">Prof. Luis Pérez</h4>
                <p className="text-gray-600 text-sm">Coordinador de Tecnología</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Contacto */}
        <div className="bg-red-50 overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-3xl font-bold text-red-700 mb-6">Contáctanos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-gray-700 mb-6">
                  Si deseas más información sobre nuestra institución, proceso de inscripción o cualquier otra consulta, no dudes en contactarnos. Estaremos encantados de atenderte.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <svg className="h-6 w-6 text-red-600 mt-1 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-gray-900">Dirección</h4>
                      <p className="text-gray-600">Av. Principal de Mamporal, Sector Brisas, Estado Miranda, Venezuela</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <svg className="h-6 w-6 text-red-600 mt-1 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-gray-900">Teléfonos</h4>
                      <p className="text-gray-600">(0234) 123-4567 / (0414) 987-6543</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <svg className="h-6 w-6 text-red-600 mt-1 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-gray-900">Correo electrónico</h4>
                      <p className="text-gray-600">info@brisasdemamporal.edu.ve</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <svg className="h-6 w-6 text-red-600 mt-1 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-gray-900">Horario de atención</h4>
                      <p className="text-gray-600">Lunes a Viernes: 7:00 AM - 4:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Envíanos un mensaje</h3>
                <form className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre completo</label>
                    <input type="text" id="name" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo electrónico</label>
                    <input type="email" id="email" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Asunto</label>
                    <input type="text" id="subject" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">Mensaje</label>
                    <textarea id="message" rows="4" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"></textarea>
                  </div>
                  <div>
                    <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                      Enviar mensaje
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enlaces rápidos */}
        <div className="mt-12 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Enlaces rápidos</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/calendario-academico" className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50">
              Calendario Académico
            </Link>
            <Link to="/register" className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50">
              Proceso de Inscripción
            </Link>
            <Link to="/login" className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50">
              Acceso a Representantes
            </Link>
            <Link to="/registro-profesor" className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50">
              Acceso a Profesores
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NuestraInstitucion;
