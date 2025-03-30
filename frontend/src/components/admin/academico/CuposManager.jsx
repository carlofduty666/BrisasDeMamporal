import { useState, useEffect } from 'react';
import { FaSave, FaSync, FaPlus, FaRedo } from 'react-icons/fa';
import AdminLayout from '../layout/AdminLayout';
import axios from 'axios';
import { formatearNombreGrado } from '../../../utils/formatters';

const CuposManager = () => {
  const [cupos, setCupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [annoEscolar, setAnnoEscolar] = useState(null);
  const [grados, setGrados] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [cuposModificados, setCuposModificados] = useState({});
  const [restableciendo, setRestableciendo] = useState(false);
  
  // Obtener token de autenticación
  const token = localStorage.getItem('token');
  
  // En el useEffect inicial de CuposManager.jsx
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener parámetros de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const gradoIDParam = urlParams.get('gradoID');
        const seccionIDParam = urlParams.get('seccionID');
        
        // Obtener año escolar activo
        const annoResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/anno-escolar/actual`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setAnnoEscolar(annoResponse.data);
        
        // Obtener grados
        const gradosResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setGrados(gradosResponse.data);
        
        // Obtener secciones
        let seccionesResponse;
        if (gradoIDParam) {
          // Si hay un grado específico, obtener solo las secciones de ese grado
          seccionesResponse = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/secciones/grado/${gradoIDParam}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
        } else {
          // Si no, obtener todas las secciones
          seccionesResponse = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/secciones`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
        }
        setSecciones(seccionesResponse.data);
        
        // Obtener cupos
        const cuposResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/cupos`,
          { 
            headers: { 'Authorization': `Bearer ${token}` },
            params: { 
              annoEscolarID: annoResponse.data.id,
              gradoID: gradoIDParam,
              seccionID: seccionIDParam
            }
          }
        );
        
        // Procesar los datos de cupos
        const cuposData = cuposResponse.data;
        
        // Si hay un grado o sección específica, filtrar los cupos
        let cuposFiltrados = cuposData;
        if (gradoIDParam) {
          cuposFiltrados = cuposData.filter(cupo => cupo.gradoID == gradoIDParam);
        }
        if (seccionIDParam) {
          cuposFiltrados = cuposFiltrados.filter(cupo => cupo.seccionID == seccionIDParam);
        }
        
        setCupos(cuposFiltrados);
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setLoading(false);
        setMessage({ 
          type: 'error', 
          text: 'Error al cargar los datos. Por favor, intente de nuevo.' 
        });
      }
    };
    
    fetchData();
  }, [token]);

  
  // Función para preparar cupos iniciales si no existen
  const prepararCuposIniciales = async (grados, secciones, annoEscolarID, cuposExistentes = []) => {
    try {
      const cuposIniciales = [...cuposExistentes]; // Mantener los cupos existentes
      const seccionesConCupo = new Set(cuposExistentes.map(c => c.seccionID));
      
      // Para cada grado, obtener sus secciones y crear cupos si no existen
      for (const grado of grados) {
        const seccionesDelGrado = secciones.filter(seccion => seccion.gradoID === grado.id);
        
        for (const seccion of seccionesDelGrado) {
          // Verificar si ya existe un cupo para esta sección
          if (seccionesConCupo.has(seccion.id)) {
            continue; // Ya existe un cupo para esta sección
          }
          
          // Verificar si ya existen estudiantes asignados a esta sección
          const estudiantesResponse = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/secciones/${seccion.id}/estudiantes`,
            { 
              headers: { 'Authorization': `Bearer ${token}` },
              params: { annoEscolarID }
            }
          );
          
          const ocupados = estudiantesResponse.data.length;
          const capacidad = seccion.capacidad || 30;
          const disponibles = Math.max(0, capacidad - ocupados);
          
          cuposIniciales.push({
            id: `temp_${grado.id}_${seccion.id}`,
            gradoID: grado.id,
            seccionID: seccion.id,
            annoEscolarID,
            capacidad,
            ocupados,
            disponibles,
            grado,
            Secciones: seccion
          });
        }
      }
      
      return cuposIniciales;
    } catch (error) {
      console.error('Error al preparar cupos iniciales:', error);
      setMessage({ 
        type: 'error', 
        text: 'Error al preparar los cupos iniciales. Por favor, intente de nuevo.' 
      });
      return cuposExistentes;
    }
  };
  
  // Función para manejar cambios en la capacidad
  const handleCapacidadChange = (id, gradoID, seccionID, value) => {
    const newValue = parseInt(value, 10);
    if (isNaN(newValue) || newValue < 0) return;
    
    setCupos(cupos.map(cupo => {
      if (cupo.id === id || (cupo.gradoID === gradoID && cupo.seccionID === seccionID)) {
        const disponibles = Math.max(0, newValue - cupo.ocupados);
        return { ...cupo, capacidad: newValue, disponibles };
      }
      return cupo;
    }));
    
    // Marcar este cupo como modificado
    setCuposModificados({
      ...cuposModificados,
      [`${gradoID}_${seccionID}`]: true
    });
  };
  
  // Función para guardar los cambios de cupos
  const handleSaveCupos = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Para cada cupo modificado, enviar actualización al servidor
      for (const cupo of cupos) {
        const cupoKey = `${cupo.gradoID}_${cupo.seccionID}`;
        
        if (cuposModificados[cupoKey]) {
          const cupoData = {
            gradoID: cupo.gradoID,
            seccionID: cupo.seccionID,
            annoEscolarID: annoEscolar.id,
            capacidad: cupo.capacidad,
            ocupados: cupo.ocupados,
            disponibles: cupo.disponibles
          };
          
          if (cupo.id && !cupo.id.toString().startsWith('temp_')) {
            // Actualizar cupo existente
            await axios.put(
              `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/cupos/${cupo.id}/capacidad`,
              { capacidad: cupo.capacidad },
              { headers: { 'Authorization': `Bearer ${token}` } }
            );
          } else {
            // Crear nuevo cupo
            await axios.post(
              `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/cupos`,
              cupoData,
              { headers: { 'Authorization': `Bearer ${token}` } }
            );
          }
        }
      }
      
      // Recargar los cupos actualizados
      const cuposResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/cupos`,
        { 
          headers: { 'Authorization': `Bearer ${token}` },
          params: { annoEscolarID: annoEscolar.id }
        }
      );
      
      setCupos(cuposResponse.data);
      setCuposModificados({});
      
      setSaving(false);
      setMessage({ type: 'success', text: 'Cupos actualizados correctamente' });
      
      // Limpiar el mensaje después de 3 segundos
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      console.error('Error al guardar cupos:', error);
      setSaving(false);
      setMessage({ 
        type: 'error', 
        text: 'Error al guardar los cupos. Por favor, intente de nuevo.' 
      });
    }
  };
  
  // Función para refrescar los datos
  const handleRefresh = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Obtener cupos actualizados
      const cuposResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/cupos`,
        { 
          headers: { 'Authorization': `Bearer ${token}` },
          params: { annoEscolarID: annoEscolar.id }
        }
      );
      
      setCupos(cuposResponse.data);
      setCuposModificados({});
      
      setLoading(false);
      setMessage({ type: 'success', text: 'Datos actualizados correctamente' });
      
      // Limpiar el mensaje después de 3 segundos
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      console.error('Error al refrescar datos:', error);
      setLoading(false);
      setMessage({ 
        type: 'error', 
        text: 'Error al actualizar los datos. Por favor, intente de nuevo.' 
      });
    }
  };
  
  // Función para restablecer todos los cupos
  const handleRestablecerCupos = async () => {
    try {
      setRestableciendo(true);
      setMessage({ type: '', text: '' });
      
      // Llamar al endpoint para actualizar cupos basados en estudiantes reales
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/cupos/actualizar-reales`,
        { annoEscolarID: annoEscolar.id },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // Recargar los cupos actualizados
      const cuposResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/cupos`,
        { 
          headers: { 'Authorization': `Bearer ${token}` },
          params: { annoEscolarID: annoEscolar.id }
        }
      );
      
      setCupos(cuposResponse.data);
      setCuposModificados({});
      
      setRestableciendo(false);
      setMessage({ type: 'success', text: 'Cupos restablecidos correctamente' });
      
      // Limpiar el mensaje después de 3 segundos
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      console.error('Error al restablecer cupos:', error);
      setRestableciendo(false);
      setMessage({ 
        type: 'error', 
        text: 'Error al restablecer los cupos. Por favor, intente de nuevo.' 
      });
    }
  };
  
  // Función para crear cupos para todos los grados y secciones
  const handleCrearTodosCupos = async () => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      
      // Preparar cupos para todas las secciones
      const cuposIniciales = await prepararCuposIniciales(
        grados, 
        secciones, 
        annoEscolar.id,
        cupos
      );
      
      // Guardar todos los cupos
      for (const cupo of cuposIniciales) {
        // Solo guardar los cupos temporales (nuevos)
        if (cupo.id && cupo.id.toString().startsWith('temp_')) {
          const cupoData = {
            gradoID: cupo.gradoID,
            seccionID: cupo.seccionID,
            annoEscolarID: annoEscolar.id,
            capacidad: cupo.capacidad,
            ocupados: cupo.ocupados,
            disponibles: cupo.disponibles
          };
          
          await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/cupos`,
            cupoData,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
        }
      }
      
      // Recargar los cupos actualizados
      const cuposResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/cupos`,
        { 
          headers: { 'Authorization': `Bearer ${token}` },
          params: { annoEscolarID: annoEscolar.id }
        }
      );
      
      setCupos(cuposResponse.data);
      setCuposModificados({});
      
      setSaving(false);
      setMessage({ type: 'success', text: 'Cupos creados correctamente para todos los grados y secciones' });
      
      // Limpiar el mensaje después de 3 segundos
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      console.error('Error al crear todos los cupos:', error);
      setSaving(false);
      setMessage({ 
        type: 'error', 
        text: 'Error al crear los cupos. Por favor, intente de nuevo.' 
      });
    }
  };
  
  // Agrupar cupos por grado para mejor visualización
  const cuposPorGrado = cupos.reduce((acc, cupo) => {
    const gradoID = cupo.gradoID;
    if (!acc[gradoID]) {
      acc[gradoID] = [];
    }
    acc[gradoID].push(cupo);
    return acc;
  }, {});
  
  return (
    <AdminLayout>
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Gestión de Cupos</h1>
          <div className="flex space-x-4">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="bg-gray-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              <FaSync className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Actualizar
            </button>
            
            <button
              onClick={handleRestablecerCupos}
              disabled={restableciendo || loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              <FaRedo className="mr-2" /> Restablecer Cupos
            </button>
            
            <button
              onClick={handleCrearTodosCupos}
              disabled={saving || loading}
              className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              <FaPlus className="mr-2" /> Crear Todos los Cupos
            </button>
            
            <button
              onClick={handleSaveCupos}
              disabled={saving || Object.keys(cuposModificados).length === 0}
              className={`${
                Object.keys(cuposModificados).length === 0 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700'
              } text-white px-4 py-2 rounded-md flex items-center`}
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
        </div>
        
        {message.text && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message.text}
          </div>
        )}
        
        {annoEscolar && (
          <div className="mb-6 p-4 bg-blue-50 rounded-md">
            <h2 className="text-lg font-medium text-blue-800">
              Año Escolar: {annoEscolar.periodo}
              {annoEscolar.activo ? ' (Activo)' : ''}
            </h2>
            <p className="text-sm text-blue-600 mt-1">
              Los cupos se están gestionando para el año escolar actual.
            </p>
          </div>
        )}

            <div className="mt-6 bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Resumen de Cupos</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-md">
                  <h3 className="text-md font-medium text-blue-800">Total de Cupos</h3>
                  <p className="text-2xl font-bold text-blue-900 mt-2">
                    {cupos.reduce((total, cupo) => total + cupo.capacidad, 0)}
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-md">
                  <h3 className="text-md font-medium text-green-800">Cupos Disponibles</h3>
                  <p className="text-2xl font-bold text-green-900 mt-2">
                    {cupos.reduce((total, cupo) => total + cupo.disponibles, 0)}
                  </p>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-md">
                  <h3 className="text-md font-medium text-orange-800">Cupos Ocupados</h3>
                  <p className="text-2xl font-bold text-orange-900 mt-2">
                    {cupos.reduce((total, cupo) => total + cupo.ocupados, 0)}
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-md font-medium text-gray-900 mb-2">Instrucciones</h3>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>Modifique la capacidad de cada sección según sea necesario.</li>
                  <li>Los cupos disponibles se calculan automáticamente (Capacidad - Ocupados).</li>
                  <li>Los cambios no se guardarán hasta que haga clic en "Guardar Cambios".</li>
                  <li>Las filas resaltadas en amarillo indican cambios pendientes de guardar.</li>
                  <li>Use "Crear Todos los Cupos" para configurar cupos para todos los grados y secciones.</li>
                  <li>Use "Restablecer Cupos" para actualizar los cupos basados en los estudiantes realmente inscritos.</li>
                </ul>
              </div>
            </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            {/* Mostrar cupos agrupados por grado */}
            {Object.keys(cuposPorGrado).length > 0 ? (
              Object.keys(cuposPorGrado).map(gradoID => {
                const cuposDelGrado = cuposPorGrado[gradoID];
                const gradoInfo = cuposDelGrado[0]?.grado || grados.find(g => g.id == gradoID);
                
                return (
                  <div key={gradoID} className="mb-8">
                    <h2 className="text-xl font-medium text-gray-800 mb-4">
                      {gradoInfo ? formatearNombreGrado(gradoInfo.nombre_grado) : `Grado ${gradoID}`}
                    </h2>
                    
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
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
                            {cuposDelGrado.map((cupo) => {
                              const seccionNombre = cupo.Secciones ? cupo.Secciones.nombre_seccion : 'No disponible';
                              const cupoKey = `${cupo.gradoID}_${cupo.seccionID}`;
                              const isModified = cuposModificados[cupoKey];
                              
                              return (
                                <tr key={cupo.id || `${cupo.gradoID}_${cupo.seccionID}`} 
                                    className={isModified ? 'bg-yellow-50' : ''}>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{seccionNombre}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <input
                                      type="number"
                                      min="0"
                                      value={cupo.capacidad}
                                      onChange={(e) => handleCapacidadChange(
                                        cupo.id, 
                                        cupo.gradoID, 
                                        cupo.seccionID, 
                                        e.target.value
                                      )}
                                      className={`w-20 px-2 py-1 border rounded-md ${
                                        isModified ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'
                                      }`}
                                    />
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{cupo.ocupados}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{cupo.disponibles}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      cupo.disponibles > 0 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {cupo.disponibles > 0 ? 'Disponible' : 'Completo'}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500">No hay cupos configurados para el año escolar actual.</p>
                <button
                  onClick={handleCrearTodosCupos}
                  disabled={saving}
                  className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md inline-flex items-center"
                >
                  <FaPlus className="mr-2" /> Crear Cupos para Todos los Grados
                </button>
              </div>
            )}
            
            {/* Mostrar grados sin cupos configurados */}
            {grados.length > 0 && Object.keys(cuposPorGrado).length > 0 && 
             grados.filter(grado => !Object.keys(cuposPorGrado).includes(grado.id.toString())).length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-medium text-gray-800 mb-4">
                  Grados sin Cupos Configurados
                </h2>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {grados
                      .filter(grado => !Object.keys(cuposPorGrado).includes(grado.id.toString()))
                      .map(grado => (
                        <div key={grado.id} className="p-4 border rounded-md">
                          <h3 className="font-medium text-gray-800">{formatearNombreGrado(grado.nombre_grado)}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            No hay cupos configurados para este grado.
                          </p>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default CuposManager;
