import { FaChalkboardTeacher, FaBook, FaEnvelope, FaPhone, FaUser, FaEye } from 'react-icons/fa';
import { formatearCedula } from '../../../utils/formatters';

const ProfesoresWidget = ({ profesores, onVerDetalle }) => {
  const getMateriaColor = (index) => {
    const colores = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-orange-500 to-orange-600',
      'from-teal-500 to-teal-600',
      'from-indigo-500 to-indigo-600'
    ];
    return colores[index % colores.length];
  };

  const getInitials = (nombre, apellido) => {
    const inicial1 = nombre ? nombre.charAt(0).toUpperCase() : '';
    const inicial2 = apellido ? apellido.charAt(0).toUpperCase() : '';
    return `${inicial1}${inicial2}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
      {/* Header */}
      <div className="bg-slate-800 px-6 py-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <FaChalkboardTeacher className="text-2xl text-white" />
          <h2 className="text-xl font-bold text-white">Mis Profesores</h2>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {profesores && profesores.length > 0 ? (
          <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
            {profesores.map((profesor, index) => (
              <div
                key={index}
                className="bg-slate-50 rounded-lg p-4 border border-slate-200 transition-all duration-300 hover:bg-white hover:border-cyan-500 hover:shadow-sm hover:scale-[1.02]"
              >
                {/* Header del Profesor */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getMateriaColor(index)} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                    {getInitials(profesor.nombre, profesor.apellido)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-slate-800 font-semibold text-sm">
                      {profesor.nombre} {profesor.apellido}
                    </h3>
                    {profesor.cedula && (
                      <p className="text-slate-500 text-xs">
                        CI: {formatearCedula(profesor.cedula)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Materia */}
                {profesor.materia && (
                  <div className="mb-3 p-2 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2">
                      <FaBook className="text-cyan-600 text-sm flex-shrink-0" />
                      <span className="text-slate-700 text-xs font-medium truncate">
                        {profesor.materia.asignatura}
                      </span>
                    </div>
                  </div>
                )}

                {/* Información de Contacto */}
                <div className="space-y-2">
                  {profesor.email && (
                    <div className="flex items-center gap-2 text-slate-600 text-xs group">
                      <FaEnvelope className="text-cyan-600 text-xs flex-shrink-0 group-hover:text-cyan-500 transition-colors" />
                      <a 
                        href={`mailto:${profesor.email}`}
                        className="truncate hover:text-cyan-600 transition-colors"
                        title={profesor.email}
                      >
                        {profesor.email}
                      </a>
                    </div>
                  )}
                  {profesor.telefono && (
                    <div className="flex items-center gap-2 text-slate-600 text-xs group">
                      <FaPhone className="text-cyan-600 text-xs flex-shrink-0 group-hover:text-cyan-500 transition-colors" />
                      <a 
                        href={`tel:${profesor.telefono}`}
                        className="hover:text-cyan-600 transition-colors"
                      >
                        {profesor.telefono}
                      </a>
                    </div>
                  )}
                </div>

                {/* Grado (si existe) */}
                {profesor.grado && (
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <span className="text-slate-500 text-xs">
                      Grado: {profesor.grado.nombre_grado}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FaChalkboardTeacher className="text-6xl text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No hay profesores asignados</p>
          </div>
        )}

        {/* Contador de Profesores */}
        {profesores && profesores.length > 0 && (
          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
            <p className="text-slate-600 text-sm">
              <span className="font-bold text-cyan-600">{profesores.length}</span>{' '}
              profesor{profesores.length !== 1 ? 'es' : ''} asignado{profesores.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Botón Ver Detalles */}
        {onVerDetalle && profesores && profesores.length > 0 && (
          <button
            onClick={onVerDetalle}
            className="w-full mt-4 bg-slate-800 hover:bg-slate-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 border border-slate-600 shadow-sm"
          >
            <FaEye className="text-lg" />
            Ver Todos los Profesores
          </button>
        )}
      </div>

      {/* Estilo para scrollbar personalizada */}
      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #1e293b;
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </div>
  );
};

export default ProfesoresWidget;
