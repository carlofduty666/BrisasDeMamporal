import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import AdminLayout from '../layout/AdminLayout';

const ArancelesManager = () => {
  const [aranceles, setAranceles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingArancel, setEditingArancel] = useState(null);
  
  // Estado para el formulario
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    monto: '',
    // fechaVencimiento: '',
    activo: true
  });
  
  // Cargar aranceles al montar el componente
  useEffect(() => {
    fetchAranceles();
  }, []);
  
  // Función para cargar aranceles
  const fetchAranceles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/aranceles`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setAranceles(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error al cargar aranceles:', err);
      setError('Error al cargar los aranceles. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };
  
  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Abrir modal para crear nuevo arancel
  const handleOpenCreateModal = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      monto: '',
    //   fechaVencimiento: '',
      activo: true
    });
    setEditingArancel(null);
    setShowModal(true);
  };
  
  // Abrir modal para editar arancel
  const handleOpenEditModal = (arancel) => {
    setFormData({
      nombre: arancel.nombre || '',
      descripcion: arancel.descripcion || '',
      monto: arancel.monto || '',
    //   fechaVencimiento: arancel.fechaVencimiento ? new Date(arancel.fechaVencimiento).toISOString().split('T')[0] : '',
      activo: arancel.activo
    });
    setEditingArancel(arancel);
    setShowModal(true);
  };
  
  // Cerrar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingArancel(null);
    setFormData({
      nombre: '',
      descripcion: '',
      monto: '',
    //   fechaVencimiento: '',
      activo: true
    });
  };
  
  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar campos obligatorios
    if (!formData.nombre || !formData.monto) {
      setError('Por favor, complete los campos obligatorios.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      
      if (editingArancel) {
        // Actualizar arancel existente
        await axios.put(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/aranceles/${editingArancel.id}`,
          formData,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        setSuccess('Arancel actualizado correctamente');
      } else {
        // Crear nuevo arancel
        await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/aranceles`,
          formData,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        setSuccess('Arancel creado correctamente');
      }
      
      // Recargar lista de aranceles
      fetchAranceles();
      
      // Cerrar modal
      handleCloseModal();
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
      setLoading(false);
    } catch (err) {
      console.error('Error al guardar arancel:', err);
      setError(err.response?.data?.message || 'Error al procesar la solicitud. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };
  
  // Manejar eliminación de arancel
  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este arancel?')) {
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.delete(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/aranceles/${id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // Recargar lista de aranceles
      fetchAranceles();
      
      setSuccess('Arancel eliminado correctamente');
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
      setLoading(false);
    } catch (err) {
      console.error('Error al eliminar arancel:', err);
      setError(err.response?.data?.message || 'Error al eliminar el arancel. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };
  
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Aranceles</h1>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FaPlus className="mr-2" /> Nuevo Arancel
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
        
        {/* Tabla de aranceles */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">Lista de Aranceles</h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Gestione los aranceles del sistema.
            </p>
          </div>
          
          {loading && aranceles.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Vencimiento
                    </th> */}
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {aranceles.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                        No hay aranceles registrados
                      </td>
                    </tr>
                  ) : (
                    aranceles.map((arancel) => (
                      <tr key={arancel.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {arancel.nombre}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {arancel.descripcion || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {typeof arancel.monto === 'number' 
                            ? arancel.monto.toLocaleString('es-VE', { style: 'currency', currency: 'VES' })
                            : arancel.monto
                          }
                        </td>
                        {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {arancel.fechaVencimiento 
                            ? new Date(arancel.fechaVencimiento).toLocaleDateString()
                            : '-'
                          }
                        </td> */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${arancel.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {arancel.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleOpenEditModal(arancel)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            <FaEdit className="inline" /> Editar
                          </button>
                          <button
                            onClick={() => handleDelete(arancel.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTrash className="inline" /> Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Modal para crear/editar arancel */}
        {showModal && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        {editingArancel ? 'Editar Arancel' : 'Nuevo Arancel'}
                      </h3>
                      <div className="mt-2">
                        <form onSubmit={handleSubmit}>
                          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                            <div className="sm:col-span-6">
                              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                                Nombre <span className="text-red-500">*</span>
                              </label>
                              <div className="mt-1">
                                <input
                                  type="text"
                                  name="nombre"
                                  id="nombre"
                                  value={formData.nombre}
                                  onChange={handleChange}
                                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                  required
                                />
                              </div>
                            </div>
                            
                            <div className="sm:col-span-6">
                              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
                                Descripción
                              </label>
                              <div className="mt-1">
                                <textarea
                                  id="descripcion"
                                  name="descripcion"
                                  rows="3"
                                  value={formData.descripcion}
                                  onChange={handleChange}
                                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                ></textarea>
                              </div>
                            </div>
                            
                            <div className="sm:col-span-3">
                              <label htmlFor="monto" className="block text-sm font-medium text-gray-700">
                                Monto <span className="text-red-500">*</span>
                              </label>
                              <div className="mt-1">
                                <input
                                  type="number"
                                  name="monto"
                                  id="monto"
                                  step="0.01"
                                  min="0"
                                  value={formData.monto}
                                  onChange={handleChange}
                                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                  required
                                />
                              </div>
                            </div>
                            
                            {/* <div className="sm:col-span-3">
                              <label htmlFor="fechaVencimiento" className="block text-sm font-medium text-gray-700">
                                Fecha de Vencimiento
                              </label>
                              <div className="mt-1">
                                <input
                                  type="date"
                                  name="fechaVencimiento"
                                  id="fechaVencimiento"
                                  value={formData.fechaVencimiento}
                                  onChange={handleChange}
                                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                />
                              </div>
                            </div> */}
                            
                            <div className="sm:col-span-6">
                              <div className="flex items-start">
                                <div className="flex items-center h-5">
                                  <input
                                    id="activo"
                                    name="activo"
                                    type="checkbox"
                                    checked={formData.activo}
                                    onChange={handleChange}
                                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                  />
                                </div>
                                <div className="ml-3 text-sm">
                                  <label htmlFor="activo" className="font-medium text-gray-700">Activo</label>
                                  <p className="text-gray-500">Indica si el arancel está activo en el sistema.</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Guardando...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <FaSave className="mr-2" /> Guardar
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    <FaTimes className="mr-2" /> Cancelar
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

export default ArancelesManager;
