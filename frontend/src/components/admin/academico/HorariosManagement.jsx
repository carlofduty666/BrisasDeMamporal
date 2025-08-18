import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  FaClock, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaCalendarDay,
  FaSave,
  FaTimes,
  FaChalkboard,
  FaUserTie
} from 'react-icons/fa';

const HorariosManager = () => {
  const [horarios, setHorarios] = useState([]);
  const [grados, setGrados] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingHorario, setEditingHorario] = useState(null);
  const [selectedGrado, setSelectedGrado] = useState('');
  const [selectedSeccion, setSelectedSeccion] = useState('');
  
  const [formData, setFormData] = useState({
    grado_id: '',
    seccion_id: '',
    materia_id: '',
    profesor_id: '',
    dia_semana: '',
    hora_inicio: '',
    hora_fin: '',
    aula: ''
  });

  const diasSemana = [
    { value: 'lunes', label: 'Lunes' },
    { value: 'martes', label: 'Martes' },
    { value: 'miércoles', label: 'Miércoles' },
    { value: 'jueves', label: 'Jueves' },
    { value: 'viernes', label: 'Viernes' }
  ];

  // Datos simulados - reemplazar con llamadas a la API
  useEffect(() => {
    fetchInitialData();
    fetchHorarios();
  }, []);

  const fetchInitialData = async () => {
    // Simular datos de grados, secciones, materias y profesores
    setGrados([
      { id: 1, nombre: '1er Grado' },
      { id: 2, nombre: '2do Grado' },
      { id: 3, nombre: '3er Grado' },
      { id: 4, nombre: '4to Grado' },
      { id: 5, nombre: '5to Grado' },
      { id: 6, nombre: '6to Grado' }
    ]);

    setSecciones([
      { id: 1, nombre: 'A', grado_id: 1 },
      { id: 2, nombre: 'B', grado_id: 1 },
      { id: 3, nombre: 'A', grado_id: 2 },
      { id: 4, nombre: 'B', grado_id: 2 },
      { id: 5, nombre: 'A', grado_id: 3 },
      { id: 6, nombre: 'B', grado_id: 3 }
    ]);

    setMaterias([
      { id: 1, nombre: 'Matemáticas' },
      { id: 2, nombre: 'Castellano' },
      { id: 3, nombre: 'Ciencias Naturales' },
      { id: 4, nombre: 'Ciencias Sociales' },
      { id: 5, nombre: 'Educación Física' },
      { id: 6, nombre: 'Arte y Cultura' }
    ]);

    setProfesores([
      { id: 1, nombre: 'María García', especialidad: 'Matemáticas' },
      { id: 2, nombre: 'Carlos Rodríguez', especialidad: 'Ciencias' },
      { id: 3, nombre: 'Ana López', especialidad: 'Castellano' },
      { id: 4, nombre: 'José Martínez', especialidad: 'Educación Física' }
    ]);
  };

  const fetchHorarios = async () => {
    setLoading(true);
    // Simular datos de horarios
    const horariosSimulados = [
      {
        id: 1,
        grado: '3er Grado',
        seccion: 'A',
        materia: 'Matemáticas',
        profesor: 'María García',
        dia_semana: 'lunes',
        hora_inicio: '08:00',
        hora_fin: '08:45',
        aula: 'Aula 3A'
      },
      {
        id: 2,
        grado: '3er Grado',
        seccion: 'A',
        materia: 'Castellano',
        profesor: 'Ana López',
        dia_semana: 'lunes',
        hora_inicio: '08:45',
        hora_fin: '09:30',
        aula: 'Aula 3A'
      },
      {
        id: 3,
        grado: '5to Grado',
        seccion: 'B',
        materia: 'Ciencias Naturales',
        profesor: 'Carlos Rodríguez',
        dia_semana: 'martes',
        hora_inicio: '08:00',
        hora_fin: '09:30',
        aula: 'Lab. Ciencias'
      }
    ];
    setHorarios(horariosSimulados);
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingHorario) {
        toast.success('Horario actualizado correctamente');
      } else {
        toast.success('Horario creado correctamente');
      }
      setShowModal(false);
      resetForm();
      fetchHorarios();
    } catch (error) {
      toast.error('Error al guardar el horario');
    }
  };

  const handleEdit = (horario) => {
    setEditingHorario(horario);
    setFormData({
      grado_id: horario.grado_id || '',
      seccion_id: horario.seccion_id || '',
      materia_id: horario.materia_id || '',
      profesor_id: horario.profesor_id || '',
      dia_semana: horario.dia_semana,
      hora_inicio: horario.hora_inicio,
      hora_fin: horario.hora_fin,
      aula: horario.aula
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este horario?')) {
      try {
        toast.success('Horario eliminado correctamente');
        fetchHorarios();
      } catch (error) {
        toast.error('Error al eliminar el horario');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      grado_id: '',
      seccion_id: '',
      materia_id: '',
      profesor_id: '',
      dia_semana: '',
      hora_inicio: '',
      hora_fin: '',
      aula: ''
    });
    setEditingHorario(null);
  };

  const getSeccionesByGrado = (gradoId) => {
    return secciones.filter(seccion => seccion.grado_id === parseInt(gradoId));
  };

  const filteredHorarios = horarios.filter(horario => {
    if (selectedGrado && horario.grado !== grados.find(g => g.id === parseInt(selectedGrado))?.nombre) {
      return false;
    }
    if (selectedSeccion && horario.seccion !== secciones.find(s => s.id === parseInt(selectedSeccion))?.nombre) {
      return false;
    }
    return true;
  });

  const groupedHorarios = filteredHorarios.reduce((groups, horario) => {
    const key = `${horario.grado} - ${horario.seccion}`;
    if (!groups[key]) {
      groups[key] = {};
    }
    if (!groups[key][horario.dia_semana]) {
      groups[key][horario.dia_semana] = [];
    }
    groups[key][horario.dia_semana].push(horario);
    return groups;
  }, {});

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100 mr-4">
                <FaClock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Horarios</h1>
                <p className="text-gray-600">Configura los horarios de clases para cada grado y sección</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-150"
            >
              <FaPlus className="mr-2" />
              Nuevo Horario
            </button>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Grado
              </label>
              <select
                value={selectedGrado}
                onChange={(e) => {
                  setSelectedGrado(e.target.value);
                  setSelectedSeccion('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los grados</option>
                {grados.map(grado => (
                  <option key={grado.id} value={grado.id}>{grado.nombre}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Sección
              </label>
              <select
                value={selectedSeccion}
                onChange={(e) => setSelectedSeccion(e.target.value)}
                disabled={!selectedGrado}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Todas las secciones</option>
                {getSeccionesByGrado(selectedGrado).map(seccion => (
                  <option key={seccion.id} value={seccion.id}>{seccion.nombre}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Horarios Grid */}
        <div className="grid gap-6">
          {Object.entries(groupedHorarios).map(([gradoSeccion, horariosPorDia]) => (
            <div key={gradoSeccion} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">{gradoSeccion}</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {diasSemana.map(dia => (
                        <th key={dia.value} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                          {dia.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      {diasSemana.map(dia => (
                        <td key={dia.value} className="px-6 py-4 align-top border-r border-gray-200">
                          <div className="space-y-2">
                            {horariosPorDia[dia.value]?.map(horario => (
                              <div key={horario.id} className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="font-medium text-blue-900">{horario.materia}</p>
                                    <p className="text-sm text-blue-700 flex items-center mt-1">
                                      <FaUserTie className="w-3 h-3 mr-1" />
                                      {horario.profesor}
                                    </p>
                                    <p className="text-sm text-blue-600 flex items-center mt-1">
                                      <FaChalkboard className="w-3 h-3 mr-1" />
                                      {horario.aula}
                                    </p>
                                    <p className="text-xs text-blue-500 mt-1">
                                      {horario.hora_inicio} - {horario.hora_fin}
                                    </p>
                                  </div>
                                  <div className="flex space-x-1 ml-2">
                                    <button
                                      onClick={() => handleEdit(horario)}
                                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
                                    >
                                      <FaEdit className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(horario.id)}
                                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                                    >
                                      <FaTrash className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )) || (
                              <p className="text-gray-400 text-sm text-center py-4">Sin clases</p>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {Object.keys(groupedHorarios).length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-200">
            <FaClock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No hay horarios configurados</h3>
            <p className="text-gray-600 mb-4">Comienza creando el primer horario de clases</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center mx-auto transition-colors duration-150"
            >
              <FaPlus className="mr-2" />
              Crear Horario
            </button>
          </div>
        )}
      </div>

      {/* Modal para crear/editar horario */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingHorario ? 'Editar Horario' : 'Nuevo Horario'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grado *
                    </label>
                    <select
                      name="grado_id"
                      value={formData.grado_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Seleccionar grado</option>
                      {grados.map(grado => (
                        <option key={grado.id} value={grado.id}>{grado.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sección *
                    </label>
                    <select
                      name="seccion_id"
                      value={formData.seccion_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={!formData.grado_id}
                    >
                      <option value="">Seleccionar sección</option>
                      {getSeccionesByGrado(formData.grado_id).map(seccion => (
                        <option key={seccion.id} value={seccion.id}>{seccion.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Materia *
                    </label>
                    <select
                      name="materia_id"
                      value={formData.materia_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Seleccionar materia</option>
                      {materias.map(materia => (
                        <option key={materia.id} value={materia.id}>{materia.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profesor *
                    </label>
                    <select
                      name="profesor_id"
                      value={formData.profesor_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Seleccionar profesor</option>
                      {profesores.map(profesor => (
                        <option key={profesor.id} value={profesor.id}>
                          {profesor.nombre} - {profesor.especialidad}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Día de la Semana *
                    </label>
                    <select
                      name="dia_semana"
                      value={formData.dia_semana}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Seleccionar día</option>
                      {diasSemana.map(dia => (
                        <option key={dia.value} value={dia.value}>{dia.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aula *
                    </label>
                    <input
                      type="text"
                      name="aula"
                      value={formData.aula}
                      onChange={handleInputChange}
                      placeholder="Ej: Aula 3A, Lab. Ciencias"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hora de Inicio *
                    </label>
                    <input
                      type="time"
                      name="hora_inicio"
                      value={formData.hora_inicio}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hora de Fin *
                    </label>
                    <input
                      type="time"
                      name="hora_fin"
                      value={formData.hora_fin}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-150"
                >
                  <FaSave className="mr-2" />
                  {editingHorario ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HorariosManager;