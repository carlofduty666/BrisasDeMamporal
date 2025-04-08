import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaChalkboardTeacher, FaBook, FaClipboardList, FaGraduationCap, FaUsers, FaCalendarAlt } from 'react-icons/fa';
import GradosSeccionesList from './profesor/GradosSeccionesList';
import MateriasList from './profesor/MateriasList';
import EvaluacionesList from './profesor/EvaluacionesList';
import CalificacionesList from './profesor/CalificacionesList';
import EstudiantesList from './profesor/EstudiantesList';
// import ResumenCalificaciones from './profesor/ResumenCalificaciones';

const ProfesorDashboard = () => {
  const [profesor, setProfesor] = useState(null);
  const [activeTab, setActiveTab] = useState('grados');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [annoEscolar, setAnnoEscolar] = useState(null);
  const [grados, setGrados] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [selectedGrado, setSelectedGrado] = useState(null);
  const [selectedSeccion, setSelectedSeccion] = useState(null);
  const [selectedMateria, setSelectedMateria] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/login');
          return;
        }
        
        const userData = JSON.parse(atob(token.split('.')[1]));
        
        // Obtener datos del profesor
        const profesorResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/personas/${userData.personaID}`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        
        setProfesor(profesorResponse.data);
        
        // Obtener año escolar actual
        const annoEscolarResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/anno-escolar/actual`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        
        setAnnoEscolar(annoEscolarResponse.data);
        
        // Obtener grados asignados al profesor
        const gradosResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/grados/profesor/${userData.personaID}`,
          {
            headers: { 'Authorization': `Bearer ${token}` },
            params: { annoEscolarID: annoEscolarResponse.data.id }
          }
        );
        
        setGrados(gradosResponse.data);
        
        // Obtener materias asignadas al profesor
        const materiasResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/materias/profesor/${userData.personaID}`,
          {
            headers: { 'Authorization': `Bearer ${token}` },
            params: { annoEscolarID: annoEscolarResponse.data.id }
          }
        );
        
        setMaterias(materiasResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar datos. Por favor, intente nuevamente.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleGradoSelect = (grado) => {
    setSelectedGrado(grado);
    setSelectedSeccion(null);
  };

  const handleSeccionSelect = (seccion) => {
    setSelectedSeccion(seccion);
  };

  const handleMateriaSelect = (materia) => {
    setSelectedMateria(materia);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard del Profesor</h1>
            <div className="flex items-center">
              <span className="text-gray-600 mr-4">
                {profesor?.nombre} {profesor?.apellido}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>Año Escolar: {annoEscolar?.periodo || 'No disponible'}</p>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="flex flex-col md:flex-row">
          {/* Menú lateral */}
          <div className="w-full md:w-64 bg-white shadow rounded-lg p-4 mb-4 md:mr-4 md:mb-0">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('grados')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'grados'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <FaChalkboardTeacher className="mr-3 h-5 w-5" />
                Grados y Secciones
              </button>
              
              <button
                onClick={() => setActiveTab('materias')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'materias'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <FaBook className="mr-3 h-5 w-5" />
                Mis Materias
              </button>
              
              <button
                onClick={() => setActiveTab('evaluaciones')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'evaluaciones'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <FaClipboardList className="mr-3 h-5 w-5" />
                Evaluaciones
              </button>
              
              <button
                onClick={() => setActiveTab('calificaciones')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'calificaciones'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <FaGraduationCap className="mr-3 h-5 w-5" />
                Calificaciones
              </button>
              
              <button
                onClick={() => setActiveTab('estudiantes')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'estudiantes'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <FaUsers className="mr-3 h-5 w-5" />
                Estudiantes
              </button>
              
              <button
                onClick={() => setActiveTab('resumen')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'resumen'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <FaCalendarAlt className="mr-3 h-5 w-5" />
                Resumen de Calificaciones
              </button>
            </nav>
            
            {/* Filtros contextuales según la pestaña activa */}
            <div className="mt-6 border-t pt-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Filtros
              </h3>
              
              {(activeTab === 'evaluaciones' || activeTab === 'calificaciones' || activeTab === 'estudiantes' || activeTab === 'resumen') && (
                <div className="mt-2 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Grado</label>
                    <select
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      value={selectedGrado?.id || ''}
                      onChange={(e) => {
                        const gradoId = e.target.value;
                        const grado = grados.find(g => g.id.toString() === gradoId);
                        handleGradoSelect(grado || null);
                      }}
                    >
                      <option value="">Seleccione un grado</option>
                      {grados.map((grado) => (
                        <option key={grado.id} value={grado.id}>
                          {grado.nombre_grado}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {selectedGrado && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Sección</label>
                      <select
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        value={selectedSeccion?.id || ''}
                        onChange={(e) => {
                          const seccionId = e.target.value;
                          // Aquí deberías tener las secciones disponibles para el grado seleccionado
                          // Por ahora, simulamos una estructura básica
                          handleSeccionSelect(seccionId ? { id: seccionId, nombre_seccion: e.target.options[e.target.selectedIndex].text } : null);
                        }}
                      >
                        <option value="">Seleccione una sección</option>
                        {selectedGrado.secciones?.map((seccion) => (
                          <option key={seccion.id} value={seccion.id}>
                            {seccion.nombre_seccion}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Materia</label>
                    <select
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      value={selectedMateria?.id || ''}
                      onChange={(e) => {
                        const materiaId = e.target.value;
                        const materia = materias.find(m => m.id.toString() === materiaId);
                        handleMateriaSelect(materia || null);
                      }}
                    >
                      <option value="">Seleccione una materia</option>
                      {materias.map((materia) => (
                        <option key={materia.id} value={materia.id}>
                          {materia.asignatura}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Contenido principal */}
          <div className="flex-1 bg-white shadow rounded-lg p-6">
            {activeTab === 'grados' && (
              <GradosSeccionesList 
                grados={grados} 
                annoEscolarID={annoEscolar?.id}
                onGradoSelect={handleGradoSelect}
                onSeccionSelect={handleSeccionSelect}
              />
            )}
            
            {activeTab === 'materias' && (
              <MateriasList 
                materias={materias} 
                annoEscolarID={annoEscolar?.id}
                onMateriaSelect={handleMateriaSelect}
              />
            )}
            
            {activeTab === 'evaluaciones' && (
              <EvaluacionesList 
                profesorID={profesor?.id}
                annoEscolarID={annoEscolar?.id}
                gradoID={selectedGrado?.id}
                seccionID={selectedSeccion?.id}
                materiaID={selectedMateria?.id}
              />
            )}
            
            {activeTab === 'calificaciones' && (
              <CalificacionesList 
                profesorID={profesor?.id}
                annoEscolarID={annoEscolar?.id}
                gradoID={selectedGrado?.id}
                seccionID={selectedSeccion?.id}
                materiaID={selectedMateria?.id}
              />
            )}
            
            {activeTab === 'estudiantes' && (
              <EstudiantesList 
                profesorID={profesor?.id}
                annoEscolarID={annoEscolar?.id}
                gradoID={selectedGrado?.id}
                seccionID={selectedSeccion?.id}
                materiaID={selectedMateria?.id}
              />
            )}
            
            {activeTab === 'resumen' && (
              <ResumenCalificaciones 
                profesorID={profesor?.id}
                annoEscolarID={annoEscolar?.id}
                gradoID={selectedGrado?.id}
                seccionID={selectedSeccion?.id}
                materiaID={selectedMateria?.id}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfesorDashboard;
