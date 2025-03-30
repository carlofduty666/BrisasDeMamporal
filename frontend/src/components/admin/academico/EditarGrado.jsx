import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../layout/AdminLayout';

const EditarGrado = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    nombre_grado: '',
    nivel: '',
    descripcion: ''
  });
  
  const token = localStorage.getItem('token');
  
  useEffect(() => {
    const fetchGrado = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados/${id}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        setFormData({
          nombre_grado: response.data.nombre_grado || '',
          nivel: response.data.nivel || '',
          descripcion: response.data.descripcion || ''
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar el grado:', error);
        setError('No se pudo cargar la información del grado. Por favor, intente de nuevo.');
        setLoading(false);
      }
    };
    
    fetchGrado();
  }, [id, token]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      
      await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados/${id}`,
        formData,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setSuccess('Grado actualizado correctamente');
      setTimeout(() => {
        navigate('/admin/academico/grados');
      }, 2000);
      
    } catch (error) {
      console.error('Error al actualizar el grado:', error);
      setError(error.response?.data?.message || 'Error al actualizar el grado. Por favor, intente de nuevo.');
      setSaving(false);
    }
  };
  
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Editar Grado</h1>
          <button
            onClick={() => navigate('/admin/academico/grados')}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
          >
            Volver
          </button>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="nombre_grado" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Grado
                  </label>
                  <input
                    type="text"
                    id="nombre_grado"
                    name="nombre_grado"
                    value={formData.nombre_grado}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="nivel" className="block text-sm font-medium text-gray-700 mb-1">
                    Nivel
                  </label>
                  <select
                    id="nivel"
                    name="nivel"
                    value={formData.nivel}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Seleccione un nivel</option>
                    <option value="Primaria">Primaria</option>
                    <option value="Secundaria">Secundaria</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    rows="3"
                    value={formData.descripcion}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  ></textarea>
                </div>
                
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {saving ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Guardando...
                      </span>
                    ) : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default EditarGrado;
