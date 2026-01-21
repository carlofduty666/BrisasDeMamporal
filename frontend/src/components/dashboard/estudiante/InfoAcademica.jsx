import { FaGraduationCap, FaUsers, FaCalendarAlt, FaCheckCircle, FaClock } from 'react-icons/fa';

const InfoAcademica = ({ grado, seccion, annoEscolar, inscripcion }) => {
  const getEstadoInscripcion = () => {
    if (!inscripcion) return { color: 'slate', icon: FaClock, texto: 'Sin inscripción' };
    
    switch (inscripcion.estado) {
      case 'activo':
      case 'aprobado':
        return { color: 'green', icon: FaCheckCircle, texto: 'Activo' };
      case 'pendiente':
        return { color: 'yellow', icon: FaClock, texto: 'Pendiente' };
      case 'rechazado':
        return { color: 'red', icon: FaClock, texto: 'Rechazado' };
      default:
        return { color: 'slate', icon: FaClock, texto: inscripcion.estado };
    }
  };

  const estadoInscripcion = getEstadoInscripcion();
  const EstadoIcon = estadoInscripcion.icon;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
      {/* Header */}
      <div className="bg-slate-800 px-6 py-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <FaGraduationCap className="text-2xl text-white" />
          <h2 className="text-xl font-bold text-white">Información Académica</h2>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Año Escolar */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 transition-all duration-300 hover:bg-white hover:border-blue-500 hover:shadow-sm">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FaCalendarAlt className="text-blue-600 text-lg" />
          </div>
          <div className="flex-1">
            <p className="text-slate-500 text-sm">Año Escolar</p>
            <p className="text-slate-800 font-semibold">{annoEscolar?.periodo || 'No disponible'}</p>
          </div>
        </div>

        {/* Grado */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 transition-all duration-300 hover:bg-white hover:border-purple-500 hover:shadow-sm">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <FaGraduationCap className="text-purple-600 text-lg" />
          </div>
          <div className="flex-1">
            <p className="text-slate-500 text-sm">Grado</p>
            <p className="text-slate-800 font-semibold">
              {grado?.nombre_grado || 'No asignado'}
              {grado?.Niveles?.nombre_nivel && (
                <span className="text-slate-500 text-xs ml-2">
                  ({grado.Niveles.nombre_nivel})
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Sección */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 transition-all duration-300 hover:bg-white hover:border-pink-500 hover:shadow-sm">
          <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
            <FaUsers className="text-pink-600 text-lg" />
          </div>
          <div className="flex-1">
            <p className="text-slate-500 text-sm">Sección</p>
            <p className="text-slate-800 font-semibold">
              {seccion?.nombre_seccion || 'No asignado'}
            </p>
          </div>
        </div>

        {/* Estado de Inscripción */}
        {inscripcion && (
          <div className={`flex items-center gap-3 p-3 bg-${estadoInscripcion.color}-50 rounded-lg border border-${estadoInscripcion.color}-200 transition-all duration-300 hover:bg-white hover:border-${estadoInscripcion.color}-500 hover:shadow-sm`}>
            <div className={`w-10 h-10 bg-${estadoInscripcion.color}-100 rounded-lg flex items-center justify-center`}>
              <EstadoIcon className={`text-${estadoInscripcion.color}-600 text-lg`} />
            </div>
            <div className="flex-1">
              <p className="text-slate-500 text-sm">Estado de Inscripción</p>
              <p className={`text-${estadoInscripcion.color}-600 font-semibold`}>
                {estadoInscripcion.texto}
              </p>
            </div>
          </div>
        )}

        {/* Información adicional */}
        {(!grado || !seccion) && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700 text-sm text-center">
              ⚠️ Falta información académica. Contacta a tu representante o administración.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoAcademica;
