import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaChalkboardTeacher, FaBook, FaEnvelope, FaPhone, FaGraduationCap, FaSearch, FaSpinner } from 'react-icons/fa';
import { formatearCedula } from '../../../utils/formatters';

const ProfesoresPage = () => {
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    const fetchProfesores = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const userData = JSON.parse(atob(token.split('.')[1]));
        const estudianteID = userData.personaID;

        const annoResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/anno-escolar/actual`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        const annoEscolarID = annoResponse.data.id;

        const profesoresResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/personas/estudiante/${estudianteID}/profesores?annoEscolarID=${annoEscolarID}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setProfesores(profesoresResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar profesores:', err);
        setError('Error al cargar profesores. Por favor, intente nuevamente.');
        setLoading(false);
      }
    };

    fetchProfesores();
  }, []);

  const getMateriaColor = (index) => {
    const colores = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-orange-500 to-orange-600',
      'from-teal-500 to-teal-600',
      'from-indigo-500 to-indigo-600',
      'from-cyan-500 to-cyan-600',
      'from-red-500 to-red-600'
    ];
    return colores[index % colores.length];
  };

  const getInitials = (nombre, apellido) => {
    const inicial1 = nombre ? nombre.charAt(0).toUpperCase() : '';
    const inicial2 = apellido ? apellido.charAt(0).toUpperCase() : '';
    return `${inicial1}${inicial2}`;
  };

  const getProfesoresFiltrados = () => {
    if (!busqueda.trim()) return profesores;
    
    const termino = busqueda.toLowerCase();
    return profesores.filter(prof => 
      prof.nombre?.toLowerCase().includes(termino) ||
      prof.apellido?.toLowerCase().includes(termino) ||
      prof.cedula?.includes(termino) ||
      prof.email?.toLowerCase().includes(termino) ||
      prof.materia?.asignatura?.toLowerCase().includes(termino)
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-6xl text-slate-800 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 text-lg">Cargando profesores...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-600 text-center">{error}</p>
        </div>
      </div>
    );
  }

  const profesoresFiltrados = getProfesoresFiltrados();

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <FaChalkboardTeacher className="text-4xl text-slate-800" />
          <h1 className="text-3xl font-bold text-slate-800">Mis Profesores</h1>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4 text-center">
            <FaChalkboardTeacher className="text-3xl text-white/80 mx-auto mb-2" />
            <p className="text-white/80 text-xs mb-1">Total Profesores</p>
            <p className="text-3xl font-bold text-white">{profesores.length}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-4 text-center">
            <FaBook className="text-3xl text-white/80 mx-auto mb-2" />
            <p className="text-white/80 text-xs mb-1">Materias</p>
            <p className="text-3xl font-bold text-white">
              {new Set(profesores.map(p => p.materia?.asignatura).filter(Boolean)).size}
            </p>
          </div>
          <div className="bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-xl p-4 text-center">
            <FaEnvelope className="text-3xl text-white/80 mx-auto mb-2" />
            <p className="text-white/80 text-xs mb-1">Con Email</p>
            <p className="text-3xl font-bold text-white">
              {profesores.filter(p => p.email).length}
            </p>
          </div>
        </div>

        {/* Buscador */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <FaSearch className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre, cédula, materia o email..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 text-slate-800 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-slate-400"
          />
        </div>
      </div>

      {/* Lista de Profesores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profesoresFiltrados.length > 0 ? (
          profesoresFiltrados.map((profesor, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-5 border border-slate-200 transition-all duration-300 hover:shadow-lg hover:border-cyan-500"
            >
              {/* Header del Profesor */}
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getMateriaColor(index)} flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0`}>
                  {getInitials(profesor.nombre, profesor.apellido)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-slate-800 font-bold text-lg mb-1 truncate">
                    {profesor.nombre} {profesor.apellido}
                  </h3>
                  {profesor.cedula && (
                    <p className="text-slate-500 text-sm mb-1">
                      CI: {formatearCedula(profesor.cedula)}
                    </p>
                  )}
                  {profesor.materia && (
                    <div className="flex items-center gap-2 mt-2 p-2 bg-slate-50 rounded-lg border border-cyan-200">
                      <FaBook className="text-cyan-600 text-sm flex-shrink-0" />
                      <span className="text-slate-800 text-sm font-medium truncate">
                        {profesor.materia.asignatura}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Información de Contacto */}
              <div className="space-y-3 mb-4">
                {profesor.email && (
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 group hover:border-cyan-500 transition-colors">
                    <FaEnvelope className="text-cyan-600 text-lg flex-shrink-0 mt-0.5 group-hover:text-cyan-700" />
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-500 text-xs mb-1">Correo Electrónico</p>
                      <a 
                        href={`mailto:${profesor.email}`}
                        className="text-slate-800 text-sm break-all hover:text-cyan-600 transition-colors"
                      >
                        {profesor.email}
                      </a>
                    </div>
                  </div>
                )}
                {profesor.telefono && (
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 group hover:border-cyan-500 transition-colors">
                    <FaPhone className="text-cyan-600 text-lg flex-shrink-0 mt-0.5 group-hover:text-cyan-700" />
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-500 text-xs mb-1">Teléfono</p>
                      <a 
                        href={`tel:${profesor.telefono}`}
                        className="text-slate-800 text-sm hover:text-cyan-600 transition-colors"
                      >
                        {profesor.telefono}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Información Adicional */}
              {profesor.grado && (
                <div className="pt-3 border-t border-slate-200">
                  <div className="flex items-center gap-2 text-slate-700 text-sm">
                    <FaGraduationCap className="text-cyan-600" />
                    <span className="text-slate-500">Grado:</span>
                    <span className="font-medium">{profesor.grado.nombre_grado}</span>
                  </div>
                </div>
              )}

              {/* Botones de Acción */}
              <div className="mt-4 pt-4 border-t border-slate-200 flex gap-2">
                {profesor.email && (
                  <a
                    href={`mailto:${profesor.email}`}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-lg text-center text-sm font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <FaEnvelope />
                    Enviar Email
                  </a>
                )}
                {profesor.telefono && (
                  <a
                    href={`tel:${profesor.telefono}`}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-center text-sm font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <FaPhone />
                    Llamar
                  </a>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-12">
            <FaChalkboardTeacher className="text-6xl text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">
              {busqueda ? 'No se encontraron profesores con ese término de búsqueda' : 'No hay profesores asignados'}
            </p>
          </div>
        )}
      </div>

      {/* Resumen */}
      {profesores.length > 0 && (
        <div className="mt-6 bg-white rounded-xl p-4 border border-slate-200">
          <h3 className="text-slate-800 font-semibold mb-3 flex items-center gap-2">
            <FaBook className="text-cyan-600" />
            Resumen de Materias
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {[...new Set(profesores.map(p => p.materia?.asignatura).filter(Boolean))].map((materia, idx) => (
              <div key={idx} className="flex items-center gap-2 text-slate-700 text-sm p-2 bg-slate-50 rounded border border-slate-200">
                <div className="w-2 h-2 rounded-full bg-cyan-600" />
                <span>{materia}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfesoresPage;
