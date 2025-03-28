import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { tipoDocumentoFormateado, formatearNombreGrado, formatearFecha, calcularEdad } from '../../utils/formatters.js';


const DetallesEstudiante = () => {
  const { estudianteId } = useParams();
  const [estudiante, setEstudiante] = useState(null);
  const [inscripciones, setInscripciones] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Obtener datos del estudiante
        const estudianteResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/personas/${estudianteId}`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        setEstudiante(estudianteResponse.data);
        
        // Obtener inscripciones del estudiante
        const inscripcionesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/inscripciones?estudianteID=${estudianteId}`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        setInscripciones(inscripcionesResponse.data);
        
        // Obtener documentos del estudiante
        const documentosResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/documentos/persona/${estudianteId}`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        setDocumentos(documentosResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar datos del estudiante. Por favor, intente nuevamente.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [estudianteId]);

  // Añade este objeto de mapeo al inicio de tu componente
  const tipoDocumentoFormateado = {
    'cedula': 'Cédula de Identidad',
    'partidaNacimiento': 'Partida de Nacimiento',
    'boletin': 'Boletín de Calificaciones',
    'notasCertificadas': 'Notas Certificadas',
    'fotoCarnet': 'Foto Carnet',
    'fotoCarta': 'Foto Tamaño Carta',
    'boletaRetiroPlantel': 'Boleta de Retiro del Plantel',
    'constanciaTrabajo': 'Constancia de Trabajo',
    'solvenciaPago': 'Solvencia de Pago',
    'foniatrico': 'Informe Foniátrico',
    'psicomental': 'Evaluación Psicomental',
    'certificadoSalud': 'Certificado de Salud',
    'curriculumVitae': 'Curriculum Vitae',
    'constanciaEstudio6toSemestre': 'Constancia de Estudio 6to Semestre',
    'titulo': 'Título Académico'
  };

  // Función para formatear nombres de grados
  const formatearNombreGrado = (nombreGrado) => {
    return nombreGrado.replace(/_/g, ' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>{error}</p>
          <div className="mt-4">
            <Link to="/dashboard/representante" className="text-indigo-600 hover:text-indigo-800">
              Volver al dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!estudiante) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Detalles del Estudiante</h1>
            <Link
              to="/dashboard/representante"
              className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors"
            >
              Volver al Dashboard
            </Link>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Información Personal */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Información Personal</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-sm font-medium text-gray-500">Nombre completo:</div>
                <div className="text-sm text-gray-900">{estudiante.nombre} {estudiante.apellido}</div>
                
                <div className="text-sm font-medium text-gray-500">Cédula/Documento:</div>
                <div className="text-sm text-gray-900">{estudiante.cedula}</div>
                
                <div className="text-sm font-medium text-gray-500">Fecha de nacimiento:</div>
                <div className="text-sm text-gray-900">
                  {formatearFecha(estudiante?.fechaNacimiento)}
                </div>
                
                <div className="text-sm font-medium text-gray-500">Edad:</div>
                <div className="text-sm text-gray-900">
                  {estudiante?.fechaNacimiento ? `${calcularEdad(estudiante.fechaNacimiento)} años` : 'No disponible'}
                </div>
                
                <div className="text-sm font-medium text-gray-500">Género:</div>
                <div className="text-sm text-gray-900">
                  {estudiante.genero === 'M' ? 'Masculino' : 'Femenino'}
                </div>
                
                <div className="text-sm font-medium text-gray-500">Dirección:</div>
                <div className="text-sm text-gray-900">{estudiante.direccion}</div>
              </div>
            </div>
          </div>
          
          {/* Inscripciones */}
          <div className="bg-white overflow-hidden shadow rounded-lg lg:col-span-2">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Inscripciones</h2>
              
              {inscripciones.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">No hay inscripciones registradas para este estudiante.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Año Escolar</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sección</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {inscripciones.map((inscripcion) => (
                        <tr key={inscripcion.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{inscripcion.annoEscolar.periodo}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">  {inscripcion.grado ? formatearNombreGrado(inscripcion.grado.nombre_grado) : 'No asignado'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{inscripcion.Secciones.nombre_seccion}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              inscripcion.estado === 'aprobada' || inscripcion.estado === 'inscrito' ? 'bg-green-100 text-green-800' :
                              inscripcion.estado === 'rechazada' || inscripcion.estado === 'retirado' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {inscripcion.estado.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link to={`/inscripcion/comprobante/${inscripcion.id}`} className="text-indigo-600 hover:text-indigo-900">
                              Ver Comprobante
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          
          {/* Documentos */}
          <div className="bg-white overflow-hidden shadow rounded-lg lg:col-span-3">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Documentos</h2>
              
              {documentos.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">No hay documentos registrados para este estudiante.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documentos.map((documento) => (
                    <div key={documento.id} className="border rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">{documento.tipoDocumento ? tipoDocumentoFormateado[documento.tipoDocumento] || documento.tipoDocumento : 'No especificado'}</h3>
                      <p className="text-sm text-gray-500 mb-3">
                        Subido el {new Date(documento.createdAt).toLocaleDateString()}
                      </p>
                      <div className="flex justify-between">
                        <a 
                          href={`${import.meta.env.VITE_API_URL}${documento.urlDocumento}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-900 text-sm"
                        >
                          Ver documento
                        </a>
                        <a 
                          href={`${import.meta.env.VITE_API_URL}/documentos/download/${documento.id}`}
                          className="text-green-600 hover:text-green-900 text-sm"
                        >
                          Descargar
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Calificaciones (si están disponibles) */}
          {estudiante.calificaciones && estudiante.calificaciones.length > 0 && (
            <div className="bg-white overflow-hidden shadow rounded-lg lg:col-span-3">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Calificaciones</h2>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Materia</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lapso 1</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lapso 2</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lapso 3</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Definitiva</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {estudiante.calificaciones.map((calificacion) => (
                        <tr key={calificacion.materiaID}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{calificacion.materia}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{calificacion.lapso1 || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{calificacion.lapso2 || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{calificacion.lapso3 || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-medium ${
                              calificacion.definitiva >= 10 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {calificacion.definitiva || '-'}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* Pagos */}
          {estudiante.pagos && estudiante.pagos.length > 0 && (
            <div className="bg-white overflow-hidden shadow rounded-lg lg:col-span-3 mt-6">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Historial de Pagos</h2>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concepto</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método de Pago</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referencia</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {estudiante.pagos.map((pago) => (
                        <tr key={pago.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{new Date(pago.fecha).toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{pago.arancel.nombre}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{pago.metodoPago.nombre}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{pago.referencia || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">${parseFloat(pago.monto).toFixed(2)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              pago.verificado ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {pago.verificado ? 'VERIFICADO' : 'PENDIENTE'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* Si no hay pagos, mostrar mensaje */}
          {(!estudiante.pagos || estudiante.pagos.length === 0) && (
            <div className="bg-white overflow-hidden shadow rounded-lg lg:col-span-3 mt-6">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Historial de Pagos</h2>
                <div className="text-center py-4">
                  <p className="text-gray-500">No hay pagos registrados para este estudiante.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DetallesEstudiante;
