import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const DetallesEstudiante = () => {
  const { estudianteId } = useParams();
  const navigate = useNavigate();
  const [estudiante, setEstudiante] = useState(null);
  const [inscripcion, setInscripcion] = useState(null);
  const [notas, setNotas] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagoAlDia, setPagoAlDia] = useState(false);
  const [activeTab, setActiveTab] = useState('informacion');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        // Obtener información del estudiante
        const estudianteResponse = await axios.get(`/estudiante/${estudianteId}`, config);
        setEstudiante(estudianteResponse.data);

        // Obtener información de la inscripción
        const inscripcionResponse = await axios.get(`/inscripcion/estudiante/${estudianteId}`, config);
        setInscripcion(inscripcionResponse.data);

        // Obtener documentos del estudiante
        const documentosResponse = await axios.get(`/documentos/estudiante/${estudianteId}`, config);
        setDocumentos(documentosResponse.data);

        // Obtener estado de pagos
        const pagosResponse = await axios.get(`/pagos/estudiante/${estudianteId}`, config);
        setPagos(pagosResponse.data);
        
        // Verificar si el pago está al día
        const pagoResponse = await axios.get(`/pagos/estado/${estudianteId}`, config);
        setPagoAlDia(pagoResponse.data.alDia);

        // Si el pago está al día, obtener las notas
        if (pagoResponse.data.alDia) {
          const notasResponse = await axios.get(`/notas/estudiante/${estudianteId}`, config);
          setNotas(notasResponse.data);
        }
      } catch (err) {
        setError('Error al cargar los datos del estudiante. Por favor, inténtelo de nuevo.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [estudianteId]);

  const handleExportarNotas = () => {
    if (!pagoAlDia) {
      setError('No se pueden exportar las notas. El pago de la mensualidad no está al día.');
      return;
    }

    // Crear un libro de Excel con las notas
    const wb = XLSX.utils.book_new();
    
    // Formatear los datos para Excel
    const notasData = notas.map(nota => ({
      'Materia': nota.materia.nombre,
      'Evaluación': nota.evaluacion.nombre,
      'Calificación': nota.calificacion,
      'Fecha': new Date(nota.fecha).toLocaleDateString(),
      'Observaciones': nota.observaciones || ''
    }));

    // Crear una hoja de cálculo con los datos
    const ws = XLSX.utils.json_to_sheet(notasData);
    
    // Añadir la hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, 'Notas');
    
    // Generar el archivo y descargarlo
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `notas_${estudiante.nombres}_${estudiante.apellidos}.xlsx`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Cargando...</span>
          </div>
          <p className="mt-2">Cargando información del estudiante...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
          <button
            onClick={() => navigate('/dashboard/representante')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!estudiante || !inscripcion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">No se encontró la información del estudiante.</span>
          </div>
          <button
            onClick={() => navigate('/dashboard/representante')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h2 className="text-lg leading-6 font-medium text-gray-900">
                Detalles del Estudiante
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {estudiante.nombres} {estudiante.apellidos} - {inscripcion.grado}
              </p>
            </div>
            <div>
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                inscripcion.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                inscripcion.estado === 'Aprobado' ? 'bg-green-100 text-green-800' : 
                'bg-red-100 text-red-800'
              }`}>
                {inscripcion.estado}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-200">
            <div className="px-4 py-5 sm:px-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('informacion')}
                    className={`${
                      activeTab === 'informacion'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Información Personal
                  </button>
                  <button
                    onClick={() => setActiveTab('documentos')}
                    className={`${
                      activeTab === 'documentos'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Documentos
                  </button>
                  <button
                    onClick={() => setActiveTab('notas')}
                    className={`${
                      activeTab === 'notas'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Notas y Evaluaciones
                  </button>
                  <button
                    onClick={() => setActiveTab('pagos')}
                    className={`${
                      activeTab === 'pagos'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Pagos
                  </button>
                </nav>
              </div>

              {activeTab === 'informacion' && (
                <div className="mt-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Cédula</dt>
                      <dd className="mt-1 text-sm text-gray-900">{estudiante.cedula}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Nombres</dt>
                      <dd className="mt-1 text-sm text-gray-900">{estudiante.nombres}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Apellidos</dt>
                      <dd className="mt-1 text-sm text-gray-900">{estudiante.apellidos}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Fecha de Nacimiento</dt>
                      <dd className="mt-1 text-sm text-gray-900">{new Date(estudiante.fechaNacimiento).toLocaleDateString()}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Lugar de Nacimiento</dt>
                      <dd className="mt-1 text-sm text-gray-900">{estudiante.lugarNacimiento}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Género</dt>
                      <dd className="mt-1 text-sm text-gray-900">{estudiante.genero}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Dirección</dt>
                      <dd className="mt-1 text-sm text-gray-900">{estudiante.direccion}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Grado Actual</dt>
                      <dd className="mt-1 text-sm text-gray-900">{inscripcion.grado}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Fecha de Inscripción</dt>
                      <dd className="mt-1 text-sm text-gray-900">{new Date(inscripcion.fechaInscripcion).toLocaleDateString()}</dd>
                    </div>
                    {estudiante.observaciones && (
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">Observaciones</dt>
                        <dd className="mt-1 text-sm text-gray-900">{estudiante.observaciones}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}

              {activeTab === 'documentos' && (
                <div className="mt-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Documentos del Estudiante
                  </h3>
                  {documentos.length === 0 ? (
                    <p className="text-sm text-gray-500">No hay documentos disponibles.</p>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {documentos.map((documento) => (
                        <li key={documento.id} className="py-4 flex justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{documento.nombre}</p>
                            <p className="text-sm text-gray-500">{documento.descripcion}</p>
                          </div>
                          <div>
                            <a
                              href={documento.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                            >
                              Ver Documento
                            </a>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {activeTab === 'notas' && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Notas y Evaluaciones
                    </h3>
                    <button
                      onClick={handleExportarNotas}
                      disabled={!pagoAlDia}
                      className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm ${
                        pagoAlDia
                          ? 'text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                          : 'text-gray-500 bg-gray-200 cursor-not-allowed'
                      }`}
                    >
                      Exportar Notas
                    </button>
                  </div>

                  {!pagoAlDia ? (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700">
                            Las notas no están disponibles. Por favor, verifique que los pagos estén al día para acceder a esta información.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : notas.length === 0 ? (
                    <p className="text-sm text-gray-500">No hay notas disponibles para este estudiante.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Materia
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Evaluación
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Calificación
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Fecha
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Observaciones
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {notas.map((nota) => (
                            <tr key={nota.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {nota.materia.nombre}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {nota.evaluacion.nombre}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {nota.calificacion}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(nota.fecha).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {nota.observaciones || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'pagos' && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Historial de Pagos
                    </h3>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      pagoAlDia ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {pagoAlDia ? 'Pagos al día' : 'Pagos pendientes'}
                    </span>
                  </div>

                  {pagos.length === 0 ? (
                    <p className="text-sm text-gray-500">No hay registros de pagos para este estudiante.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Concepto
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Monto
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Fecha de Pago
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Estado
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Referencia
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {pagos.map((pago) => (
                            <tr key={pago.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {pago.concepto}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {pago.monto.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {pago.fechaPago ? new Date(pago.fechaPago).toLocaleDateString() : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  pago.estado === 'Pagado' ? 'bg-green-100 text-green-800' : 
                                  pago.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {pago.estado}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {pago.referencia || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <button
              onClick={() => navigate('/dashboard/representante')}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetallesEstudiante;
