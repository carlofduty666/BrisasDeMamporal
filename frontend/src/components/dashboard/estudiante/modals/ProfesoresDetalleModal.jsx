import { FaTimes, FaChalkboardTeacher, FaBook, FaEnvelope, FaPhone, FaUser, FaGraduationCap, FaSearch } from 'react-icons/fa';
import { formatearCedula } from '../../../../utils/formatters';
import { useState } from 'react';

const ProfesoresDetalleModal = ({ isOpen, onClose, profesores }) => {
  const [busqueda, setBusqueda] = useState('');

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

  if (!isOpen) return null;

  const profesoresFiltrados = getProfesoresFiltrados();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700 max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaChalkboardTeacher className="text-3xl text-white" />
            <h2 className="text-2xl font-bold text-white">Mis Profesores</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-all duration-300"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
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
          <div className="mb-6 relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <FaSearch className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre, cédula, materia o email..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-slate-400"
            />
          </div>

          {/* Lista de Profesores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profesoresFiltrados.length > 0 ? (
              profesoresFiltrados.map((profesor, index) => (
                <div
                  key={index}
                  className="bg-slate-700/30 rounded-xl p-5 border border-slate-600 transition-all duration-300 hover:bg-slate-700/50 hover:border-cyan-500 hover:shadow-xl"
                >
                  {/* Header del Profesor */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getMateriaColor(index)} flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0`}>
                      {getInitials(profesor.nombre, profesor.apellido)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold text-lg mb-1 truncate">
                        {profesor.nombre} {profesor.apellido}
                      </h3>
                      {profesor.cedula && (
                        <p className="text-slate-400 text-sm mb-1">
                          CI: {formatearCedula(profesor.cedula)}
                        </p>
                      )}
                      {profesor.materia && (
                        <div className="flex items-center gap-2 mt-2 p-2 bg-slate-700/50 rounded-lg border border-cyan-500/30">
                          <FaBook className="text-cyan-400 text-sm flex-shrink-0" />
                          <span className="text-white text-sm font-medium truncate">
                            {profesor.materia.asignatura}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Información de Contacto */}
                  <div className="space-y-3 mb-4">
                    {profesor.email && (
                      <div className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600 group hover:border-cyan-500 transition-colors">
                        <FaEnvelope className="text-cyan-400 text-lg flex-shrink-0 mt-0.5 group-hover:text-cyan-300" />
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-400 text-xs mb-1">Correo Electrónico</p>
                          <a 
                            href={`mailto:${profesor.email}`}
                            className="text-white text-sm break-all hover:text-cyan-400 transition-colors"
                          >
                            {profesor.email}
                          </a>
                        </div>
                      </div>
                    )}
                    {profesor.telefono && (
                      <div className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600 group hover:border-cyan-500 transition-colors">
                        <FaPhone className="text-cyan-400 text-lg flex-shrink-0 mt-0.5 group-hover:text-cyan-300" />
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-400 text-xs mb-1">Teléfono</p>
                          <a 
                            href={`tel:${profesor.telefono}`}
                            className="text-white text-sm hover:text-cyan-400 transition-colors"
                          >
                            {profesor.telefono}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Información Adicional */}
                  {profesor.grado && (
                    <div className="pt-3 border-t border-slate-600">
                      <div className="flex items-center gap-2 text-slate-300 text-sm">
                        <FaGraduationCap className="text-cyan-400" />
                        <span className="text-slate-400">Grado:</span>
                        <span className="font-medium">{profesor.grado.nombre_grado}</span>
                      </div>
                    </div>
                  )}

                  {/* Botones de Acción */}
                  <div className="mt-4 pt-4 border-t border-slate-600 flex gap-2">
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
              <div className="col-span-2 text-center py-12">
                <FaChalkboardTeacher className="text-6xl text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">
                  {busqueda ? 'No se encontraron profesores con ese término de búsqueda' : 'No hay profesores asignados'}
                </p>
              </div>
            )}
          </div>

          {/* Resumen */}
          {profesores.length > 0 && (
            <div className="mt-6 bg-slate-700/20 rounded-xl p-4 border border-slate-600">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <FaBook className="text-cyan-400" />
                Resumen de Materias
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {[...new Set(profesores.map(p => p.materia?.asignatura).filter(Boolean))].map((materia, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-slate-300 text-sm p-2 bg-slate-700/30 rounded border border-slate-600">
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>{materia}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfesoresDetalleModal;
