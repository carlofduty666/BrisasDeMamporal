import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaTrash, FaFileInvoice, FaPrint } from 'react-icons/fa';
import axios from 'axios';
import AdminLayout from '../layout/AdminLayout';

const PagosDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pago, setPago] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  
  // Cargar datos del pago
  useEffect(() => {
    fetchPagoDetails();
  }, [id]);
  
  // Función para cargar detalles del pago
  const fetchPagoDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/pagos/${id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setPago(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error al cargar detalles del pago:', err);
      setError('Error al cargar los detalles del pago. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };
  
  // Función para eliminar pago
  const handleDelete = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.delete(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/pagos/${id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setSuccess('Pago eliminado correctamente');
      
      // Redirigir a la lista de pagos después de 2 segundos
      setTimeout(() => {
        navigate('/admin/pagos');
      }, 2000);
    } catch (err) {
      console.error('Error al eliminar pago:', err);
      setError(err.response?.data?.message || 'Error al eliminar el pago. Por favor, intente nuevamente.');
      setLoading(false);
      setShowConfirmDelete(false);
    }
  };
  
  // Función para cambiar estado del pago
  const handleChangeStatus = async (newStatus) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/pagos/${id}/estado`,
        { estado: newStatus },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // Actualizar el pago en el estado
      setPago({
        ...pago,
        estado: newStatus
      });
      
      setSuccess(`Estado del pago actualizado a "${newStatus}"`);
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
      setLoading(false);
    } catch (err) {
      console.error('Error al cambiar estado del pago:', err);
      setError(err.response?.data?.message || 'Error al cambiar el estado del pago. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };
  
  // Función para imprimir comprobante
  const handlePrintReceipt = () => {
    window.open(`/admin/pagos/${id}/comprobante`, '_blank');
  };
  
  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Formatear monto
  const formatAmount = (amount) => {
    if (amount === undefined || amount === null) return '-';
    return amount.toLocaleString('es-VE', { style: 'currency', currency: 'VES' });
  };
  
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Botón de regreso */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/pagos')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FaArrowLeft className="mr-2" /> Volver a la lista
          </button>
        </div>
        
        {/* Mensajes de error o éxito */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Detalles del pago */}
        {loading && !pago ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : pago ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Detalles del Pago #{pago.id}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Información completa del pago.
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handlePrintReceipt}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FaPrint className="mr-2" /> Imprimir
                </button>
                <Link
                  to={`/admin/pagos/${id}/editar`}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FaEdit className="mr-2" /> Editar
                </Link>
                <button
                  onClick={() => setShowConfirmDelete(true)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <FaTrash className="mr-2" /> Eliminar
                </button>
              </div>
            </div>
            
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Estado</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div className="flex items-center">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        pago.estado === 'completado' ? 'bg-green-100 text-green-800' : 
                        pago.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                        pago.estado === 'rechazado' ? 'bg-red-100 text-red-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {pago.estado ? pago.estado.charAt(0).toUpperCase() + pago.estado.slice(1) : 'Desconocido'}
                      </span>
                      
                      <div className="ml-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleChangeStatus('completado')}
                            disabled={pago.estado === 'completado'}
                            className={`px-2 py-1 text-xs rounded ${
                              pago.estado === 'completado' 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                          >
                            Completado
                          </button>
                          <button
                            onClick={() => handleChangeStatus('pendiente')}
                            disabled={pago.estado === 'pendiente'}
                            className={`px-2 py-1 text-xs rounded ${
                              pago.estado === 'pendiente' 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            }`}
                          >
                            Pendiente
                          </button>
                          <button
                            onClick={() => handleChangeStatus('rechazado')}
                            disabled={pago.estado === 'rechazado'}
                            className={`px-2 py-1 text-xs rounded ${
                              pago.estado === 'rechazado' 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            Rechazado
                          </button>
                        </div>
                      </div>
                    </div>
                  </dd>
                </div>
                
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Estudiante</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {pago.estudiante ? (
                      <div>
                        <div className="font-medium">{pago.estudiante.nombre} {pago.estudiante.apellido}</div>
                        <div className="text-gray-500">C.I.: {pago.estudiante.cedula}</div>
                        {pago.inscripcion && pago.inscripcion.grado && (
                          <div className="text-gray-500">Grado: {pago.inscripcion.grado.nombre_grado}</div>
                        )}
                      </div>
                    ) : '-'}
                  </dd>
                </div>
                
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Concepto</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {pago.arancel ? pago.arancel.nombre : pago.concepto || '-'}
                    {pago.arancel && pago.arancel.descripcion && (
                      <div className="text-gray-500 mt-1">{pago.arancel.descripcion}</div>
                    )}
                  </dd>
                </div>
                
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Monto</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {formatAmount(pago.monto)}
                  </dd>
                </div>
                
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Método de Pago</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {pago.metodoPago ? pago.metodoPago.nombre : '-'}
                  </dd>
                </div>
                
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Referencia</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {pago.referencia || '-'}
                  </dd>
                </div>
                
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Fecha de Pago</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {formatDate(pago.fechaPago)}
                  </dd>
                </div>
                
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Fecha de Registro</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {formatDate(pago.createdAt)}
                  </dd>
                </div>
                
                {pago.observaciones && (
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Observaciones</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {pago.observaciones}
                    </dd>
                  </div>
                )}
                
                {pago.registradoPor && (
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Registrado por</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {pago.registradoPor.nombre} {pago.registradoPor.apellido}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
            <p className="text-gray-500">No se encontró información del pago.</p>
          </div>
        )}
        
        {/* Modal de confirmación para eliminar */}
        {showConfirmDelete && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <FaTrash className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        Eliminar Pago
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          ¿Está seguro de que desea eliminar este pago? Esta acción no se puede deshacer.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {loading ? 'Eliminando...' : 'Eliminar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmDelete(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default PagosDetail;
