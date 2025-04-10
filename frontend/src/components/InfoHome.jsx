import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

function InfoHome() {
    return (
        <section className='p-5 my-7 flex flex-col'>
            <div className='text-focus-in mb-10'>
                <h1 className='text-4xl font-bold text-blue-700 mb-4'>Inscripciones en línea y automáticas</h1>
                <p className='text-xl text-gray-700'>
                    En Brisas de Mamporal hemos implementado un sistema de inscripción en línea para facilitar el proceso a los representantes.
                    Ahora puedes inscribir a tus hijos desde la comodidad de tu hogar, siguiendo unos sencillos pasos.
                </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-8'>
                <div className='bg-white p-6 rounded-lg shadow-md'>
                    <div className='text-blue-600text-4xl font-bold mb-4'>01</div>
                    <h3 className='text-xl font-semibold mb-2'>Registro de Representante</h3>
                    <p className='text-gray-600'>
                        El primer paso es registrarte como representante en nuestra plataforma. Necesitarás proporcionar tus datos personales y verificar tu correo electrónico.
                    </p>
                </div>

                <div className='bg-white p-6 rounded-lg shadow-md'>
                    <div className='text-blue-600text-4xl font-bold mb-4'>02</div>
                    <h3 className='text-xl font-semibold mb-2'>Inscripción de Estudiantes</h3>
                    <p className='text-gray-600'>
                        Una vez registrado, podrás inscribir a tus hijos proporcionando sus datos y adjuntando los documentos requeridos.
                    </p>
                </div>

                <div className='bg-white p-6 rounded-lg shadow-md'>
                    <div className='text-blue-600text-4xl font-bold mb-4'>03</div>
                    <h3 className='text-xl font-semibold mb-2'>Comprobante y Aprobación</h3>
                    <p className='text-gray-600'>
                        Al finalizar la inscripción, recibirás un comprobante que deberás presentar en la institución para su firma. La inscripción será revisada y aprobada por la administración.
                    </p>
                </div>
            </div>

            <div className='mt-12 text-center'>
                <Link to="/register" className='inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-all'>
                    Comenzar el proceso de inscripción
                </Link>
            </div>

            <div className='mt-16 bg-gray-50 p-8 rounded-lg'>
                <h2 className='text-3xl font-bold text-gray-800 mb-6'>Beneficios de nuestro sistema</h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='flex items-start'>
                        <div className='flex-shrink-0 h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white'>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div className='ml-4'>
                            <h3 className='text-lg font-medium text-gray-900'>Proceso simplificado</h3>
                            <p className='mt-2 text-gray-600'>Inscribe a tus hijos sin hacer largas filas ni trámites complicados.</p>
                        </div>
                    </div>
                    <div className='flex items-start'>
                        <div className='flex-shrink-0 h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white'>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className='ml-4'>
                            <h3 className='text-lg font-medium text-gray-900'>Ahorro de tiempo</h3>
                            <p className='mt-2 text-gray-600'>Completa el proceso en minutos, desde cualquier lugar y a cualquier hora.</p>
                        </div>
                    </div>
                    <div className='flex items-start'>
                        <div className='flex-shrink-0 h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white'>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div className='ml-4'>
                            <h3 className='text-lg font-medium text-gray-900'>Documentación digital</h3>
                            <p className='mt-2 text-gray-600'>Adjunta los documentos requeridos en formato digital, sin necesidad de fotocopias.</p>
                        </div>
                    </div>
                    <div className='flex items-start'>
                        <div className='flex-shrink-0 h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white'>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div className='ml-4'>
                            <h3 className='text-lg font-medium text-gray-900'>Seguimiento en línea</h3>
                            <p className='mt-2 text-gray-600'>Consulta el estado de la inscripción, notas y pagos desde tu perfil de representante.</p>
                        </div>
                    </div>
                </div>
            </div>
                        {/* Nueva sección sobre Nuestra Institución */}
                        <div className='mt-16 bg-blue-50 p-8 rounded-lg'>
                <h2 className='text-3xl font-bold text-gray-800 mb-6'>Nuestra Institución</h2>
                <div className='flex flex-col md:flex-row gap-8'>
                    <div className='md:w-1/2'>
                        <p className='text-gray-700 mb-4'>
                            La Unidad Educativa Brisas de Mamporal es una institución comprometida con la excelencia académica y la formación integral de nuestros estudiantes desde 1995.
                        </p>
                        <p className='text-gray-700 mb-4'>
                            Ofrecemos educación de calidad desde preescolar hasta bachillerato, con un equipo docente altamente calificado y dedicado al desarrollo de las capacidades y talentos de cada estudiante.
                        </p>
                        <div className='mt-6'>
                            <Link to="/nuestra-institucion" className='inline-flex items-center text-blue-600 hover:text-blue-800'>
                                Conocer más sobre nuestra institución
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                    <div className='md:w-1/2'>
                        <div className='grid grid-cols-2 gap-4'>
                            <div className='bg-white p-4 rounded-lg shadow-sm'>
                                <h3 className='text-lg font-semibold text-blue-700 mb-2'>Misión</h3>
                                <p className='text-gray-600'>Formar estudiantes integrales con valores y competencias para enfrentar los desafíos del futuro.</p>
                            </div>
                            <div className='bg-white p-4 rounded-lg shadow-sm'>
                                <h3 className='text-lg font-semibold text-blue-700 mb-2'>Visión</h3>
                                <p className='text-gray-600'>Ser referentes en educación de calidad, innovación pedagógica y formación en valores.</p>
                            </div>
                            <div className='bg-white p-4 rounded-lg shadow-sm col-span-2'>
                                <h3 className='text-lg font-semibold text-blue-700 mb-2'>Valores</h3>
                                <p className='text-gray-600'>Respeto, responsabilidad, excelencia, solidaridad e innovación son los pilares de nuestra comunidad educativa.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='mt-8 text-center'>
                    <Link to="/calendario-academico" className='inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-all'>
                        Ver Calendario Académico
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default InfoHome;