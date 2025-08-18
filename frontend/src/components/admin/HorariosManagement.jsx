import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FaClock, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaDownload, 
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaChalkboardTeacher,
  FaBook,
  FaUsers
} from 'react-icons/fa';

const HorariosManagement = () => {
  const [horarios, setHorarios] = useState([]);
  const [grados, setGrados] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingHorario, setEditingHorario] = useState(null);
  const [filters, setFilters] = useState({
    grado: '',
    seccion: '',
    dia: '',
    materia: ''
  });

  // Estados del formulario
  const [formData, setFormData] = useState({
    grado_id: '',
    seccion_id: '',
    materia_id: '',
    profesor_id: '',
    dia_semana: '',
    hora_inicio: '',
    hora_fin: '',
    aula: '',
    activo: true
  });

  const diasSemana = [
    { value: 'lunes', label: 'Lunes' },
    { value: 'martes', label: 'Martes' },
    { value: 'miércoles', label: 'Miércoles' },
    { value: 'jueves', label: 'Jueves' },
    { value: 'viernes', label: 'Viernes' }
  ];

  useEffect(() => {
    fetchHorarios();
    fetchGrados();
    fetchMaterias();
    fetchProfesores();
  }, []);

  useEffect(() => {
    if (formData.grado_id) {
      fetchSeccionesByGrado(formData.grado_id);
    }
  }, [formData.grado_id]);

  const fetchHorarios = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/horarios`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHorarios(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener horarios:', error);
      toast.error('Error al cargar los horarios');
      setLoading(false);
    }
  };

  const fetchGrados = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/grados`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGrados(response.data);
    } catch (error) {
      console.error('Error al obtener grados:', error);
    }
  };

  const fetchSeccionesByGrado = async (gradoId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/secciones/grado/${gradoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSecciones(response.data);
    } catch (error) {
      console.error('Error al obtener secciones:', error);
      setSecciones([]);
    }
  };

  const fetchMaterias = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/materias`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMaterias(response.data);
    } catch (error) {
      console.error('Error al obtener materias:', error);
    }
  };

  const fetchProfesores = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/personas?tipo=profesor`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfesores(response.data);
    } catch (error) {
      console.error('Error al obtener profesores:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      if (editingHorario) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/horarios/${editingHorario.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Horario actualizado exitosamente');
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/horarios`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Horario creado exitosamente');
      }
      
      fetchHorarios();
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Error al guardar horario:', error);
      toast.error(error.response?.data?.message || 'Error al guardar el horario');
    }
  };

  const handleEdit = (horario) => {
    setEditingHorario(horario);
    setFormData({
      grado_id: horario.grado_id,
      seccion_id: horario.seccion_id,
      materia_id: horario.materia_id,
      profesor_id: horario.profesor_id,
      dia_semana: horario.dia_semana,
      hora_inicio: horario.hora_inicio,
      hora_fin: horario.hora_fin,
      aula: horario.aula || '',
      activo: horario.activo
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este horario?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${import.meta.env.VITE_API_URL}/horarios/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Horario eliminado exitosamente');
        fetchHorarios();
      } catch (error) {
        console.error('Error al eliminar horario:', error);
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
      aula: '',
      activo: true
    });
    setEditingHorario(null);
    setSecciones([]);
  };

  const descargarHorarioPDF = async (gradoId, seccionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/pdf/horario/${gradoId}/${seccionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `horario_${gradoId}_${seccionId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Horario descargado exitosamente');
    } catch (error) {
      console.error('Error al descargar horario:', error);
      toast.error('Error al descargar el horario');
    }
  };

  const filteredHorarios = horarios.filter(horario => {
    return (
      (!filters.grado || horario.grado_id.toString() === filters.grado) &&
      (!filters.seccion || horario.seccion_id.toString() === filters.seccion) &&
      (!filters.dia || horario.dia_semana === filters.dia) &&
      (!filters.materia || horario.materia_id.toString() === filters.materia)
    );
  });

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <FaClock className="mr-3 text-blue-600" />
            Gestión de Horarios
          </h1>
          <p className="text-gray-600 mt-1">Administra los horarios académicos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <FaPlus className="mr-2" />
          Nuevo Horario
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grado
            </label>
            <select
              value={filters.grado}
              onChange={(e) => {
                setFilters({ ...filters, grado: e.target.value, seccion: '' });
                if (e.target.value) {
                  fetchSeccionesByGrado(e.target.value);
                }
              }}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los grados</option>
              {grados.map(grado => (
                <option key={grado.id} value={grado.id}>
                  {grado.nombre_grado}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sección
            </label>
            <select
              value={filters.seccion}
              onChange={(e) => setFilters({ ...filters, seccion: e.target.value })}
              disabled={!filters.grado}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">Todas las secciones</option>
              {secciones.map(seccion => (
                <option key={seccion.id} value={seccion.id}>
                  {seccion.nombre_seccion}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Día
            </label>
            <select
              value={filters.dia}
              onChange={(e) => setFilters({ ...filters, dia: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los días</option>
              {diasSemana.map(dia => (
                <option key={dia.value} value={dia.value}>
                  {dia.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Materia
            </label>
            <select
              value={filters.materia}
              onChange={(e) => setFilters({ ...filters, materia: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas las materias</option>
              {materias.map(materia => (
                <option key={materia.id} value={materia.id}>
                  {materia.asignatura}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de horarios */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grado/Sección
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Materia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profesor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Día
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aula
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHorarios.map((horario) => (
                <tr key={horario.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaUsers className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {horario.grado?.nombre_grado}
                        </div>
                        <div className="text-sm text-gray-500">
                          Sección {horario.seccion?.nombre_seccion}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaBook className="w-4 h-4 text-blue-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {horario.materia?.asignatura}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaChalkboardTeacher className="w-4 h-4 text-green-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {horario.profesor?.nombre} {horario.profesor?.apellido}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 capitalize">
                      {horario.dia_semana}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaClock className="w-4 h-4 text-orange-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {formatTime(horario.hora_inicio)} - {formatTime(horario.hora_fin)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {horario.aula || 'No asignada'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      horario.activo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {horario.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => descargarHorarioPDF(horario.grado_id, horario.seccion_id)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Descargar PDF"
                      >
                        <FaDownload className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(horario)}
                        className="text-indigo-600 hover:text-indigo-900 p-1"
                        title="Editar"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(horario.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Eliminar"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredHorarios.length === 0 && (
          <div className="text-center py-12">
            <FaClock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay horarios registrados
            </h3>
            <p className="text-gray-500">
              Comienza creando un nuevo horario para tus clases.
            </p>
          </div>
        )}
      </div>

      {/* Modal para crear/editar horario */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  {editingHorario ? 'Editar Horario' : 'Nuevo Horario'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Grado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grado *
                    </label>
                    <select
                      value={formData.grado_id}
                      onChange={(e) => {
                        setFormData({ ...formData, grado_id: e.target.value, seccion_id: '' });
                        if (e.target.value) {
                          fetchSeccionesByGrado(e.target.value);
                        }
                      }}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecciona un grado</option>
                      {grados.map(grado => (
                        <option key={grado.id} value={grado.id}>
                          {grado.nombre_grado}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sección */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sección *
                    </label>
                    <select
                      value={formData.seccion_id}
                      onChange={(e) => setFormData({ ...formData, seccion_id: e.target.value })}
                      required
                      disabled={!formData.grado_id}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    >
                      <option value="">Selecciona una sección</option>
                      {secciones.map(seccion => (
                        <option key={seccion.id} value={seccion.id}>
                          {seccion.nombre_seccion}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Materia */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Materia *
                    </label>
                    <select
                      value={formData.materia_id}
                      onChange={(e) => setFormData({ ...formData, materia_id: e.target.value })}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecciona una materia</option>
                      {materias.map(materia => (
                        <option key={materia.id} value={materia.id}>
                          {materia.asignatura}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Profesor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profesor *
                    </label>
                    <select
                      value={formData.profesor_id}
                      onChange={(e) => setFormData({ ...formData, profesor_id: e.target.value })}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecciona un profesor</option>
                      {profesores.map(profesor => (
                        <option key={profesor.id} value={profesor.id}>
                          {profesor.nombre} {profesor.apellido}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Día de la semana */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Día de la semana *
                    </label>
                    <select
                      value={formData.dia_semana}
                      onChange={(e) => setFormData({ ...formData, dia_semana: e.target.value })}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecciona un día</option>
                      {diasSemana.map(dia => (
                        <option key={dia.value} value={dia.value}>
                          {dia.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Aula */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aula
                    </label>
                    <input
                      type="text"
                      value={formData.aula}
                      onChange={(e) => setFormData({ ...formData, aula: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: Aula 101"
                    />
                  </div>

                  {/* Hora inicio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hora de inicio *
                    </label>
                    <input
                      type="time"
                      value={formData.hora_inicio}
                      onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Hora fin */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hora de fin *
                    </label>
                    <input
                      type="time"
                      value={formData.hora_fin}
                      onChange={(e) => setFormData({ ...formData, hora_fin: e.target.value })}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Estado activo */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="activo"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="activo" className="ml-2 block text-sm text-gray-900">
                    Horario activo
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingHorario ? 'Actualizar' : 'Crear'} Horario
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HorariosManagement;