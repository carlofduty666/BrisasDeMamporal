import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatearFecha, formatearNombreGrado } from '../../utils/formatters';
import { jwtDecode } from "jwt-decode";

const ComprobanteInscripcion = () => {
  const { inscripcionId } = useParams();
  const navigate = useNavigate();
  const [inscripcion, setInscripcion] = useState(null);
  const [estudiante, setEstudiante] = useState(null);
  const [representante, setRepresentante] = useState(null);
  const [grado, setGrado] = useState(null);
  const [seccion, setSeccion] = useState(null);
  const [annoEscolar, setAnnoEscolar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [metodosPago, setMetodosPago] = useState([]);
  const [userRole, setUserRole] = useState('');
  
  // Obtener token del localStorage
  const token = localStorage.getItem('token');

  const getReturnPath = () => {
    switch(userRole) {
      case 'owner':
      case 'adminweb':
        return '/admin/dashboard';
      case 'representante':
        return '/dashboard/representante';
      // case 'docente':
      //   return '/dashboard/docente'
    }
  };
  
  // Función simple para imprimir usando la API nativa
  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    // Determinar el rol del usuario desde el token
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUserRole(decodedToken.rol);
      } catch (error) {
        console.error("Error decodificando el token:", error);
      }
    }
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Configurar axios con el token
        const config = {
          headers: { 'Authorization': `Bearer ${token}` }
        };
        
        // Obtener datos de la inscripción
        const inscripcionRes = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/inscripciones/${inscripcionId}`, 
          config
        );
        setInscripcion(inscripcionRes.data);
        
        // Extraer IDs necesarios
        const estudianteID = inscripcionRes.data.estudianteID;
        const representanteID = inscripcionRes.data.representanteID;
        const gradoID = inscripcionRes.data.gradoID;
        const seccionID = inscripcionRes.data.seccionID;
        const annoEscolarID = inscripcionRes.data.annoEscolarID;
        
        // Resto del código para obtener datos...
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos del comprobante. ' + (err.response?.data?.message || err.message));
        setLoading(false);
      }
    };
    
    fetchData();
  }, [inscripcionId, token]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Configurar axios con el token
        const config = {
          headers: { 'Authorization': `Bearer ${token}` }
        };
        
        // Obtener datos de la inscripción
        const inscripcionRes = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/inscripciones/${inscripcionId}`, 
          config
        );
        setInscripcion(inscripcionRes.data);
        
        // Extraer IDs necesarios
        const estudianteID = inscripcionRes.data.estudianteID;
        const representanteID = inscripcionRes.data.representanteID;
        const gradoID = inscripcionRes.data.gradoID;
        const seccionID = inscripcionRes.data.seccionID;
        const annoEscolarID = inscripcionRes.data.annoEscolarID;
        
        // Obtener datos del estudiante
        const estudianteRes = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas/${estudianteID}`, 
          config
        );
        setEstudiante(estudianteRes.data);
        
        // Obtener datos del representante
        const representanteRes = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas/${representanteID}`, 
          config
        );
        setRepresentante(representanteRes.data);
        
        // Obtener datos del grado
        const gradoRes = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados/${gradoID}`, 
          config
        );
        setGrado(gradoRes.data);
        
        // Obtener datos de la sección
        const seccionRes = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/secciones/${seccionID}`, 
          config
        );
        setSeccion(seccionRes.data);
        
        // Obtener datos del año escolar
        const annoEscolarRes = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/anno-escolar/${annoEscolarID}`, 
          config
        );
        setAnnoEscolar(annoEscolarRes.data);
        
        // Obtener métodos de pago activos
        const metodosPagoRes = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/metodos-pago/activos`, 
          config
        );
        setMetodosPago(metodosPagoRes.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos del comprobante. ' + (err.response?.data?.message || err.message));
        setLoading(false);
      }
    };
    
    fetchData();
  }, [inscripcionId, token]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <Link
              to={getReturnPath()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Volver al Dashboard
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        {/* Contenido visible en pantalla y para imprimir */}
        <div className="px-6 py-8">
          {/* Encabezado - visible solo en pantalla */}
          <div className="flex justify-between items-center mb-6 print:hidden">
            <h1 className="text-2xl font-bold text-gray-900">Comprobante de Inscripción</h1>
            <button
              onClick={() => window.print()}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Descargar / Imprimir
            </button>
          </div>
          
          {/* Encabezado para impresión */}
          <div className="hidden print:block print:mb-8 pt-0">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Colegio Brisas de Mamporal</h1>
              <h2 className="text-xl font-semibold mt-2">Comprobante de Inscripción</h2>
              <p className="text-sm mt-1">Año Escolar: {annoEscolar?.periodo}</p>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Datos del Estudiante</h2>
            <div className="grid grid-cols-1 gap-y-2 sm:grid-cols-2">
              <div>
                <span className="text-sm font-medium text-gray-500">Nombre:</span>
                <p className="mt-1">{estudiante?.nombre} {estudiante?.apellido}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Cédula:</span>
                <p className="mt-1">{estudiante?.cedula}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Fecha de Nacimiento:</span>
                <p className="mt-1">
                  {formatearFecha(estudiante?.fechaNacimiento)}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Género:</span>
                <p className="mt-1">{estudiante?.genero === 'M' ? 'Masculino' : 'Femenino'}</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Datos Académicos</h2>
            <div className="grid grid-cols-1 gap-y-2 sm:grid-cols-2">
              <div>
                <span className="text-sm font-medium text-gray-500">Grado:</span>
                <p className="mt-1">{formatearNombreGrado(grado?.nombre_grado)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Sección:</span>
                <p className="mt-1">{seccion?.nombre_seccion}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Año Escolar:</span>
                <p className="mt-1">{annoEscolar?.periodo}</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Información de Pago</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 print:bg-white print:border-black">
              <div className="flex">
                <div className="flex-shrink-0 print:hidden">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700 print:text-black">
                    {inscripcion?.pagado 
                      ? 'El pago de inscripción ha sido registrado.' 
                      : 'El pago de inscripción está pendiente. Por favor, realice el pago para completar el proceso.'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-y-2 sm:grid-cols-2">
              <div>
                <span className="text-sm font-medium text-gray-500">Monto de Inscripción:</span>
                <p className="mt-1">${inscripcion?.montoInscripcion}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Estado:</span>
                <p className="mt-1">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    inscripcion?.pagado ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  } print:bg-white print:border print:border-black print:text-black`}>
                    {inscripcion?.pagado ? 'Pagado' : 'Pendiente'}
                  </span>
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Fecha de Inscripción:</span>
                <p className="mt-1">
                  {inscripcion?.fechaInscripcion ? new Date(inscripcion.fechaInscripcion).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            
            {!inscripcion?.pagado && (
              <div className="mt-6 print:hidden">
                <h3 className="text-md font-medium text-gray-900 mb-2">Métodos de Pago Disponibles</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {metodosPago.map(metodo => (
                    <div key={metodo.id} className="border rounded-md p-4">
                      <h4 className="font-medium">{metodo.nombre}</h4>
                      <p className="text-sm text-gray-500 mt-1">{metodo.descripcion}</p>
                      {metodo.numero_cuenta && (
                        <p className="text-sm mt-2">
                          <span className="font-medium">Número de cuenta:</span> {metodo.numero_cuenta}
                        </p>
                      )}
                      {metodo.beneficiario && (
                        <p className="text-sm">
                          <span className="font-medium">Beneficiario:</span> {metodo.beneficiario}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 print:hidden">
                  <Link
                    to={`/inscripcion/pago/${inscripcionId}`}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Registrar Pago
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Datos del Representante</h2>
            <div className="grid grid-cols-1 gap-y-2 sm:grid-cols-2">
              <div>
                <span className="text-sm font-medium text-gray-500">Nombre:</span>
                <p className="mt-1">{representante?.nombre} {representante?.apellido}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Cédula:</span>
                <p className="mt-1">{representante?.cedula}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Teléfono:</span>
                <p className="mt-1">{representante?.telefono}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Email:</span>
                <p className="mt-1">{representante?.email}</p>
              </div>
            </div>
          </div>
          
          {/* Pie de página para impresión */}
          <div className="hidden print:block print:mt-10 print:border-t print:border-gray-300 print:pt-4">
            <div className="text-center text-sm text-gray-600">
              <p>Este documento es un comprobante oficial de inscripción.</p>
              <p>Fecha de emisión: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        
        {/* Botones de navegación - solo visibles en pantalla */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 print:hidden">
          <div className="flex justify-between">
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Volver al Dashboard
            </Link>
            
            <button
              onClick={() => window.print()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Descargar / Imprimir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComprobanteInscripcion;
