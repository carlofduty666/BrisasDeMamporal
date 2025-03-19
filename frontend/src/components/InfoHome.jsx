// import React from 'react';

// import '../App.css'

// function InfoHome() {
    
//     return (

//         <section className='p-5 my-7 flex flex-row-reverse'>
//             <h1 className='text-focus-in text-4xl'>Inscripciones en línea y automáticas</h1>
//             <p className='text-focus-in text-2xl'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatum. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatum.</p>
//         </section>



//     )
// }

// export default InfoHome

import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

function InfoHome() {
    return (
        <section className='p-5 my-7 flex flex-col'>
            <div className='text-focus-in mb-10'>
                <h1 className='text-4xl font-bold text-indigo-700 mb-4'>Inscripciones en línea y automáticas</h1>
                <p className='text-xl text-gray-700'>
                    En Brisas de Mamporal hemos implementado un sistema de inscripción en línea para facilitar el proceso a los representantes.
                    Ahora puedes inscribir a tus hijos desde la comodidad de tu hogar, siguiendo unos sencillos pasos.
                </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-8'>
                <div className='bg-white p-6 rounded-lg shadow-md'>
                    <div className='text-indigo-600 text-4xl font-bold mb-4'>01</div>
                    <h3 className='text-xl font-semibold mb-2'>Registro de Representante</h3>
                    <p className='text-gray-600'>
                        El primer paso es registrarte como representante en nuestra plataforma. Necesitarás proporcionar tus datos personales y verificar tu correo electrónico.
                    </p>
                </div>

                <div className='bg-white p-6 rounded-lg shadow-md'>
                    <div className='text-indigo-600 text-4xl font-bold mb-4'>02</div>
                    <h3 className='text-xl font-semibold mb-2'>Inscripción de Estudiantes</h3>
                    <p className='text-gray-600'>
                        Una vez registrado, podrás inscribir a tus hijos proporcionando sus datos y adjuntando los documentos requeridos.
                    </p>
                </div>

                <div className='bg-white p-6 rounded-lg shadow-md'>
                    <div className='text-indigo-600 text-4xl font-bold mb-4'>03</div>
                    <h3 className='text-xl font-semibold mb-2'>Comprobante y Aprobación</h3>
                    <p className='text-gray-600'>
                        Al finalizar la inscripción, recibirás un comprobante que deberás presentar en la institución para su firma. La inscripción será revisada y aprobada por la administración.
                    </p>
                </div>
            </div>

            <div className='mt-12 text-center'>
                <Link to="/register" className='inline-block bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700 transition-all'>
                    Comenzar el proceso de inscripción
                </Link>
            </div>

            <div className='mt-16 bg-gray-50 p-8 rounded-lg'>
                <h2 className='text-3xl font-bold text-gray-800 mb-6'>Beneficios de nuestro sistema</h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='flex items-start'>
                        <div className='flex-shrink-0 h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white'>
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
                        <div className='flex-shrink-0 h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white'>
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
                        <div className='flex-shrink-0 h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white'>
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
                        <div className='flex-shrink-0 h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white'>
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
        </section>
    );
}

export default InfoHome;
