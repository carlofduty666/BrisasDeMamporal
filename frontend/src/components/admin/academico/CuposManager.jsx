import { useState, useEffect } from 'react';
import { FaSave } from 'react-icons/fa';
import AdminLayout from '../layout/AdminLayout';
import api from '../../../services/api';

const CuposManager = () => {
  const [cupos, setCupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  useEffect(() => {
    const fetchCupos = async () => {
      try {
        // En un escenario real, esta sería una llamada a tu API
        // Por ahora, usamos datos de ejemplo
        setTimeout(() => {
          const mockCupos = [
            { id: 1, grado: '1er Grado', seccion: 'A', capacidad: 30, ocupados: 25, disponibles: 5 },
            { id: 2, grado: '1er Grado', seccion: 'B', capacidad: 30, ocupados: 20, disponibles: 10 },
            { id: 3, grado: '2do Grado', seccion: 'A', capacidad: 30, ocupados: 28, disponibles: 2 },
            { id: 4, grado: '2do Grado', seccion: 'B', capacidad: 30, ocupados: 24, disponibles: 6 },
            { id: 5, grado: '3er Grado', seccion: 'A', capacidad: 30, ocupados: 29, disponibles: 1 },
            { id: 6, grado: '3er Grado', seccion: 'B', capacidad: 30, ocupados: 27, disponibles: 3 },
            { id: 7, grado: '4to Grado', seccion: 'A', capacidad: 30, ocupados: 22, disponibles: 8 },
            { id: 8, grado: '4to Grado', seccion: 'B', capacidad: 30, ocupados: 18, disponibles: 12 },
            { id: 9, grado: '5to Grado', seccion: 'A', capacidad: 30, ocupados: 20, disponibles: 10 },
            { id: 10, grado: '5to Grado', seccion: 'B', capacidad: 30, ocupados: 15, disponibles: 15 },
            { id: 11, grado: '6to Grado', seccion: 'A', capacidad: 30, ocupados: 18, disponibles: 12 },
            { id: 12, grado: '6to Grado', seccion: 'B', capacidad: 30, ocupados: 12, disponibles: 18 }
          ];
          
          setCupos(mockCupos);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error al cargar cupos:', error);
        setLoading(false);
        setMessage({ type: 'error', text: 'Error al cargar los cupos. Por favor, intente de nuevo.' });
      }
    };
    
    fetchCupos();
  }, []);
  
  const handleCapacidadChange = (id, value) => {
    const newValue = parseInt(value, 10);
    if (isNaN(newValue) || newValue < 0) return;
    
    setCupos(cupos.map(cupo => {
      if (cupo.id === id) {
        const disponibles = newValue - cupo.ocupados;
        return { ...cupo, capacidad: newValue, disponibles: disponibles >= 0 ? disponibles : 0 };
      }
      return cupo;
    }));
  };
  
  const handleSaveCupos = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      // En un escenario real, esta sería una llamada a tu API para guardar los cambios
      // Por ahora, simulamos una operación exitosa
      setTimeout(() => {
        setSaving(false);
        setMessage({ type: 'success', text: 'Cupos actualizados correctamente' });
        
        // Limpiar el mensaje después de 3 segundos
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 3000);
      }, 1000);
    } catch (error) {
      console.error('Error al guardar cupos:', error);
      setSaving(false);
      setMessage({ type: 'error', text: 'Error al guardar los cupos. Por favor, intente de nuevo.' });
    }
  };
  
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Gestión de Cupos</h1>
          <button
            onClick={handleSaveCupos}
            disabled={saving}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <FaSave className="mr-2" /> Guardar Cambios
              </>
            )}
          </button>
        </div>
        
        {message.text && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message.text}
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sección
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ocupados
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Disponibles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cupos.map((cupo) => (
                  <tr key={cupo.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{cupo.grado}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{cupo.seccion}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        value={cupo.capacidad}
                        onChange={(e) => handleCapacidadChange(cupo.id, e.target.value)}
                        className="w-20 px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{cupo.ocupados}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{cupo.disponibles}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        cupo.disponibles === 0 
                          ? 'bg-red-100 text-red-800' 
                          : cupo.disponibles <= 5 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                      }`}>
                        {cupo.disponibles === 0 
                          ? 'Sin cupos' 
                          : cupo.disponibles <= 5 
                            ? 'Limitado' 
                            : 'Disponible'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="mt-8 bg-gray-50 p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Información sobre Cupos</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 mr-2">
                Disponible
              </span>
              <p className="text-sm text-gray-600">Más de 5 cupos disponibles</p>
            </div>
            <div className="flex items-center">
              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 mr-2">
                Limitado
              </span>
              <p className="text-sm text-gray-600">5 o menos cupos disponibles</p>
            </div>
            <div className="flex items-center">
              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 mr-2">
                Sin cupos
              </span>
              <p className="text-sm text-gray-600">No hay cupos disponibles</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CuposManager;
