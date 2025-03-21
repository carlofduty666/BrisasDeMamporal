import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';

const ComprobanteInscripcion = () => {
  const { inscripcionId } = useParams();
  const [inscripcion, setInscripcion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const componentRef = useRef();
  
  useEffect(() => {
    const fetchInscripcion = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/inscripciones/${inscripcionId}/comprobante`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        setInscripcion(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error al obtener comprobante:', err);
        setError(err.response?.data?.message || 'Error al cargar el comprobante de inscripción');
        setLoading(false);
      }
    };
    
    fetchInscripcion();
  }, [inscripcionId]);
  
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });
  
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
  
  if (!inscripcion) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Comprobante de Inscripción</h1>
              <button
                onClick={handlePrint}
                className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors"
              >
                Imprimir
              </button>
            </div>
            
            <div ref={componentRef} className="p-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold">Unidad Educativa Brisas de Mamporal</h2>
                <p className="text-gray-600">Comprobante de Inscripción</p>
                <p className="text-gray-600">Año Escolar: {inscripcion.inscripcion.annoEscolar.periodo}</p>
              </div>
              
              <div className="border-t border-b border-gray-200 py-4 mb-4">
                <h3 className="text-lg font-semibold mb-2">Datos del Estudiante</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-600">Cédula/Documento:</div>
                  <div>{inscripcion.inscripcion.estudiante.cedula}</div>
                  
                  <div className="text-gray-600">Nombre completo:</div>
                  <div>{inscripcion.inscripcion.estudiante.nombre} {inscripcion.inscripcion.estudiante.apellido}</div>
                  
                  <div className="text-gray-600">Fecha de nacimiento:</div>
                  <div>{new Date(inscripcion.inscripcion.estudiante.fechaNacimiento).toLocaleDateString()}</div>
                  
                  <div className="text-gray-600">Grado:</div>
                  <div>{inscripcion.inscripcion.grado.nombre_grado}</div>
                  
                  <div className="text-gray-600">Sección:</div>
                  <div>{inscripcion.inscripcion.seccion.nombre_seccion}</div>
                </div>
              </div>
              
              <div className="border-b border-gray-200 py-4 mb-4">
                <h3 className="text-lg font-semibold mb-2">Datos del Representante</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-600">Cédula/Documento:</div>
                  <div>{inscripcion.inscripcion.representante.cedula}</div>
                  
                  <div className="text-gray-600">Nombre completo:</div>
                  <div>{inscripcion.inscripcion.representante.nombre} {inscripcion.inscripcion.representante.apellido}</div>
                  
                  <div className="text-gray-600">Teléfono:</div>
                  <div>{inscripcion.inscripcion.representante.telefono}</div>
                  
                  <div className="text-gray-600">Email:</div>
                  <div>{inscripcion.inscripcion.representante.email}</div>
                </div>
              </div>
              
              <div className="border-b border-gray-200 py-4 mb-4">
                <h3 className="text-lg font-semibold mb-2">Información de la Inscripción</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-600">Fecha de inscripción:</div>
                  <div>{new Date(inscripcion.inscripcion.fechaInscripcion).toLocaleDateString()}</div>
                  
                  <div className="text-gray-600">Estado:</div>
                  <div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      inscripcion.inscripcion.estado === 'aprobada' ? 'bg-green-100 text-green-800' :
                      inscripcion.inscripcion.estado === 'rechazada' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {inscripcion.inscripcion.estado.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="text-gray-600">Monto de inscripción:</div>
                  <div>${parseFloat(inscripcion.inscripcion.montoInscripcion).toFixed(2)}</div>
                  
                  <div className="text-gray-600">Pagado:</div>
                  <div>{inscripcion.inscripcion.pagado ? 'Sí' : 'No'}</div>
                </div>
              </div>

              {inscripcion.inscripcion.pagos && inscripcion.inscripcion.pagos.length > 0 && (
                <div className="border-b border-gray-200 py-4 mb-4">
                  <h3 className="text-lg font-semibold mb-2">Pagos Realizados</h3>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concepto</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referencia</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {inscripcion.inscripcion.pagos.map((pago) => (
                        <tr key={pago.id}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{pago.arancel.nombre}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{pago.metodoPago.nombre}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{pago.referencia || '-'}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">${parseFloat(pago.monto).toFixed(2)}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{new Date(pago.fecha).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              <div className="border-b border-gray-200 py-4 mb-4">
                <h3 className="text-lg font-semibold mb-2">Documentos Entregados</h3>
                <ul className="list-disc list-inside">
                  {inscripcion.documentos.map((doc) => (
                    <li key={doc.id} className="text-gray-700">
                      {doc.tipoDocumento}
                    </li>
                  ))}
                </ul>
              </div>
              
              {inscripcion.inscripcion.observaciones && (
                <div className="py-4 mb-4">
                  <h3 className="text-lg font-semibold mb-2">Observaciones</h3>
                  <p className="text-gray-700">{inscripcion.inscripcion.observaciones}</p>
                </div>
              )}
              
              <div className="mt-8 text-center text-gray-500 text-sm">
                <p>Este comprobante fue generado el {new Date(inscripcion.fechaComprobante).toLocaleString()}</p>
                <p>Unidad Educativa Brisas de Mamporal - Sistema de Gestión Escolar</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-6 py-4 flex justify-between">
            <Link
              to="/dashboard/representante"
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              Volver al Dashboard
            </Link>
            
            {!inscripcion.inscripcion.pagado && (
              <Link
                to={`/pagos/inscripcion/${inscripcionId}`}
                className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
              >
                Realizar Pago
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComprobanteInscripcion;
