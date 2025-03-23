import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const ComprobanteInscripcion = () => {
  const { inscripcionId } = useParams();
  const [inscripcion, setInscripcion] = useState(null);
  const [estudiante, setEstudiante] = useState(null);
  const [representante, setRepresentante] = useState(null);
  const [grado, setGrado] = useState(null);
  const [seccion, setSeccion] = useState(null);
  const [annoEscolar, setAnnoEscolar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [metodosPago, setMetodosPago] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener datos de la inscripción
        const inscripcionRes = await axios.get(`http://localhost:5000/inscripciones/${inscripcionId}`);
        setInscripcion(inscripcionRes.data);
        
        // Obtener datos del estudiante
        const estudianteRes = await axios.get(`http://localhost:5000/personas/${inscripcionRes.data.estudianteID}`);
        setEstudiante(estudianteRes.data);
        
        // Obtener datos del representante
        const representanteRes = await axios.get(`http://localhost:5000/personas/${inscripcionRes.data.representanteID}`);
        setRepresentante(representanteRes.data);
        
        // Obtener datos del grado
        const gradoRes = await axios.get(`http://localhost:5000/grados/${inscripcionRes.data.gradoID}`);
        setGrado(gradoRes.data);
        
        // Obtener datos de la sección
        const seccionRes = await axios.get(`http://localhost:5000/secciones/${inscripcionRes.data.seccionID}`);
        setSeccion(seccionRes.data);
        
        // Obtener datos del año escolar
        const annoEscolarRes = await axios.get(`http://localhost:5000/anno-escolar/${inscripcionRes.data.annoEscolarID}`);
        setAnnoEscolar(annoEscolarRes.data);
        
        // Obtener métodos de pago activos
        const metodosPagoRes = await axios.get('http://localhost:5000/metodos-pago/activos');
        setMetodosPago(metodosPagoRes.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos del comprobante');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [inscripcionId]);
  
  // Componente PDF para descargar
  const ComprobantePDF = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>Comprobante de Inscripción</Text>
          <Text style={styles.subtitle}>Colegio Brisas de Mamporal</Text>
          
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Datos del Estudiante</Text>
            <Text>Nombre: {estudiante?.nombre} {estudiante?.apellido}</Text>
            <Text>Cédula: {estudiante?.cedula}</Text>
            <Text>Fecha de Nacimiento: {new Date(estudiante?.fechaNacimiento).toLocaleDateString()}</Text>
          </View>
          
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Datos Académicos</Text>
            <Text>Grado: {grado?.nombre}</Text>
            <Text>Sección: {seccion?.nombre}</Text>
            <Text>Año Escolar: {annoEscolar?.periodo}</Text>
          </View>
          
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Información de Pago</Text>
            <Text>Monto de Inscripción: ${inscripcion?.montoInscripcion}</Text>
            <Text>Estado: {inscripcion?.pagado ? 'Pagado' : 'Pendiente'}</Text>
            <Text>Fecha de Inscripción: {new Date(inscripcion?.fechaInscripcion).toLocaleDateString()}</Text>
          </View>
          
          <View style={styles.footer}>
            <Text>Este comprobante debe ser presentado junto con el comprobante de pago.</Text>
            <Text>Fecha de emisión: {new Date().toLocaleDateString()}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
  
  // Estilos para el PDF
  const styles = StyleSheet.create({
    page: {
      padding: 30,
    },
    section: {
      margin: 10,
    },
    title: {
      fontSize: 24,
      textAlign: 'center',
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 20,
    },
    infoSection: {
      marginBottom: 15,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    footer: {
      marginTop: 30,
      fontSize: 10,
      textAlign: 'center',
    },
  });
  
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
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <Link to="/dashboard/representante" className="text-indigo-600 hover:text-indigo-800">
            Volver al Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Comprobante de Inscripción</h1>
            <PDFDownloadLink 
              document={<ComprobantePDF />} 
              fileName={`comprobante_inscripcion_${inscripcionId}.pdf`}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              {({ blob, url, loading, error }) =>
                loading ? 'Generando PDF...' : 'Descargar PDF'
              }
            </PDFDownloadLink>
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
                <p className="mt-1">{new Date(estudiante?.fechaNacimiento).toLocaleDateString()}</p>
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
                <p className="mt-1">{grado?.nombre}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Sección:</span>
                <p className="mt-1">{seccion?.nombre}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Año Escolar:</span>
                <p className="mt-1">{annoEscolar?.periodo}</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Información de Pago</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Importante:</strong> Para completar la inscripción, debe realizar el pago correspondiente y presentar el comprobante en la institución.
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
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${inscripcion?.pagado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {inscripcion?.pagado ? 'Pagado' : 'Pendiente'}
                  </span>
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Fecha de Inscripción:</span>
                <p className="mt-1">{new Date(inscripcion?.fechaInscripcion).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          
          {!inscripcion?.pagado && (
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Métodos de Pago Disponibles</h2>
              <div className="space-y-4">
                {metodosPago.map(metodo => (
                  <div key={metodo.id} className="border rounded-lg p-4">
                    <h3 className="font-medium text-gray-900">{metodo.nombre}</h3>
                    <p className="text-sm text-gray-500 mt-1">{metodo.descripcion}</p>
                    
                    {metodo.nombre.toLowerCase().includes('transferencia') && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">Datos Bancarios:</p>
                        <ul className="mt-1 text-sm text-gray-600 list-disc list-inside">
                          <li>Banco: Banco Nacional de Venezuela</li>
                          <li>Cuenta: 0123-4567-8901-2345</li>
                          <li>Titular: Colegio Brisas de Mamporal</li>
                          <li>RIF: J-12345678-9</li>
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <Link 
                  to={`/pagos/registrar/${inscripcionId}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Registrar Pago
                </Link>
              </div>
            </div>
          )}
          
          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="flex justify-between">
              <Link 
                to="/dashboard/representante"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Volver al Dashboard
              </Link>
              
              <Link 
                to={`/estudiante/${estudiante?.id}`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
              >
                Ver Perfil del Estudiante
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComprobanteInscripcion;
