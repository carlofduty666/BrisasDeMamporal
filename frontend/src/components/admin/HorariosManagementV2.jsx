import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  FaClock,
  FaPlus,
  FaEdit,
  FaTrash,
  FaDownload,
  FaFilter,
  FaCalendarAlt,
  FaChalkboardTeacher,
  FaBook,
  FaUsers,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes,
  FaSave,
  FaSpinner,
  FaCopy,
  FaMapMarkerAlt,
  FaEye,
  FaChevronDown,
  FaChevronUp,
  FaSearch
} from 'react-icons/fa';
import HorariosCalendar from './HorariosCalendar';
import {
  obtenerTodosLosConflictos,
  generarMensajeConflictos,
  obtenerDisponibilidadProfesor
} from '../../utils/conflictDetection';
import { formatearNombreGrado } from '../../utils/formatters'

const HorariosManagementV2 = () => {
  // Estados principales
  const [horarios, setHorarios] = useState([]);
  const [grados, setGrados] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [aulas, setAulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [annoEscolarActual, setAnnoEscolarActual] = useState(null);

  // Modales
  const [showModal, setShowModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showDuplicarModal, setShowDuplicarModal] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);

  // Filtros y búsqueda
  const [filters, setFilters] = useState({
    grado: '',
    seccion: '',
    dia: '',
    materia: '',
    profesor: '',
    aula: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('tabla'); // 'tabla' o 'calendario'

  // Edición
  const [editingHorario, setEditingHorario] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Conflictos detectados
  const [conflictosDetectados, setConflictosDetectados] = useState(null);
  const [mostrarAdvertencia, setMostrarAdvertencia] = useState(false);

  // Disponibilidad
  const [disponibilidadProfesor, setDisponibilidadProfesor] = useState([]);
  const [mostrarDisponibilidad, setMostrarDisponibilidad] = useState(false);

  // Duplicación
  const [dataDuplicar, setDataDuplicar] = useState({
    sourceGrado: '',
    sourceSeccion: '',
    targetGrado: '',
    targetSeccion: ''
  });
  const [loadingDuplicar, setLoadingDuplicar] = useState(false);

  // Datos del formulario
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

  // Cargar datos iniciales
  useEffect(() => {
    fetchAllData();
  }, []);

  // Cargar secciones cuando cambia el grado
  useEffect(() => {
    if (formData.grado_id) {
      fetchSeccionesByGrado(formData.grado_id);
    }
  }, [formData.grado_id]);

  // Cargar materias cuando cambia la sección
  useEffect(() => {
    if (formData.seccion_id) {
      fetchMateriasBySeccion(formData.seccion_id);
    }
  }, [formData.seccion_id]);

  // Cargar profesores cuando cambia la materia
  useEffect(() => {
    if (formData.materia_id && formData.grado_id) {
      fetchProfesoresByMateria(formData.materia_id, formData.grado_id);
    }
  }, [formData.materia_id, formData.grado_id]);

  // Calcular disponibilidad del profesor
  useEffect(() => {
    if (formData.profesor_id && formData.dia_semana && mostrarDisponibilidad) {
      const disponibilidad = obtenerDisponibilidadProfesor(
        formData.profesor_id,
        formData.dia_semana,
        horarios
      );
      setDisponibilidadProfesor(disponibilidad);
    }
  }, [formData.profesor_id, formData.dia_semana, mostrarDisponibilidad]);

  // Detectar conflictos cuando cambian los datos relevantes
  useEffect(() => {
    if (
      formData.profesor_id &&
      formData.dia_semana &&
      formData.hora_inicio &&
      formData.hora_fin
    ) {
      const conflictos = obtenerTodosLosConflictos(
        editingHorario ? { ...formData, id: editingHorario.id } : formData,
        horarios
      );

      const tieneConflictos = Object.values(conflictos).some(arr => arr.length > 0);
      if (tieneConflictos) {
        setConflictosDetectados(conflictos);
        setMostrarAdvertencia(true);
      } else {
        setConflictosDetectados(null);
        setMostrarAdvertencia(false);
      }
    }
  }, [formData.profesor_id, formData.dia_semana, formData.hora_inicio, formData.hora_fin]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [horariosRes, gradosRes, annoRes, seccionesRes, materiasRes, profesoresRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/horarios`, config),
        axios.get(`${import.meta.env.VITE_API_URL}/grados`, config),
        axios.get(`${import.meta.env.VITE_API_URL}/anno-escolar/actual`, config),
        axios.get(`${import.meta.env.VITE_API_URL}/secciones`, config),
        axios.get(`${import.meta.env.VITE_API_URL}/materias`, config),
        axios.get(`${import.meta.env.VITE_API_URL}/personas/tipo/profesor`, config)
      ]);

      setHorarios(horariosRes.data);
      setGrados(gradosRes.data);
      setSecciones(seccionesRes.data);
      setMaterias(materiasRes.data);
      setProfesores(profesoresRes.data);
      
      // Obtener el año escolar activo
      if (annoRes.data) {
        setAnnoEscolarActual(annoRes.data);
      }

      // Extraer aulas únicas
      const aulasUnicas = [...new Set(horariosRes.data.map(h => h.aula).filter(Boolean))];
      setAulas(aulasUnicas);

      setLoading(false);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar los datos');
      setLoading(false);
    }
  };

  const fetchSeccionesByGrado = async (gradoId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/secciones/grado/${gradoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSecciones(response.data);
      // Limpiar materias y profesores cuando cambia el grado
      setMaterias([]);
      setProfesores([]);
    } catch (error) {
      console.error('Error al obtener secciones:', error);
      setSecciones([]);
    }
  };

  const fetchMateriasBySeccion = async (seccionId) => {
    try {
      if (!annoEscolarActual?.id) return;
      
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/materias/seccion/${seccionId}?annoEscolarID=${annoEscolarActual.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMaterias(response.data);
      setProfesores([]);
    } catch (error) {
      console.error('Error al obtener materias:', error);
      setMaterias([]);
    }
  };

  const fetchProfesoresByMateria = async (materiaId, gradoId) => {
    try {
      if (!annoEscolarActual?.id) return;
      
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/materias/${materiaId}/profesores?annoEscolarID=${annoEscolarActual.id}&gradoID=${gradoId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfesores(response.data);
    } catch (error) {
      console.error('Error al obtener profesores:', error);
      setProfesores([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.grado_id || !formData.seccion_id || !formData.materia_id || 
        !formData.profesor_id || !formData.dia_semana || !formData.hora_inicio || !formData.hora_fin) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    if (formData.hora_inicio >= formData.hora_fin) {
      toast.error('La hora de inicio debe ser menor que la hora de fin');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (editingHorario) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/horarios/${editingHorario.id}`,
          formData,
          config
        );
        toast.success('Horario actualizado exitosamente');
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/horarios`,
          formData,
          config
        );
        toast.success('Horario creado exitosamente');
      }

      await fetchAllData();
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Error al guardar horario:', error);
      toast.error(error.response?.data?.message || 'Error al guardar el horario');
    }
  };

  const handleEdit = (horario) => {
    setEditingHorario(horario);
    setIsEditMode(true);
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
        await fetchAllData();
      } catch (error) {
        console.error('Error al eliminar horario:', error);
        toast.error('Error al eliminar el horario');
      }
    }
  };

  const handleDuplicar = async () => {
    if (!dataDuplicar.sourceGrado || !dataDuplicar.sourceSeccion || 
        !dataDuplicar.targetGrado || !dataDuplicar.targetSeccion) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      setLoadingDuplicar(true);
      const token = localStorage.getItem('token');
      
      await axios.post(
        `${import.meta.env.VITE_API_URL}/horarios/duplicar`,
        {
          sourceGradoId: parseInt(dataDuplicar.sourceGrado),
          sourceSeccionId: parseInt(dataDuplicar.sourceSeccion),
          targetGradoId: parseInt(dataDuplicar.targetGrado),
          targetSeccionId: parseInt(dataDuplicar.targetSeccion)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Horarios duplicados exitosamente');
      await fetchAllData();
      setShowDuplicarModal(false);
      setDataDuplicar({ sourceGrado: '', sourceSeccion: '', targetGrado: '', targetSeccion: '' });
    } catch (error) {
      console.error('Error al duplicar horarios:', error);
      toast.error('Error al duplicar los horarios');
    } finally {
      setLoadingDuplicar(false);
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
    setIsEditMode(false);
    setSecciones([]);
    setMaterias([]);
    setProfesores([]);
    setConflictosDetectados(null);
    setMostrarAdvertencia(false);
    setDisponibilidadProfesor([]);
    setMostrarDisponibilidad(false);
  };

  // Filtrar horarios
  const filteredHorarios = horarios.filter(horario => {
    const matchGrado = !filters.grado || horario.grado_id.toString() === filters.grado;
    const matchSeccion = !filters.seccion || horario.seccion_id.toString() === filters.seccion;
    const matchDia = !filters.dia || horario.dia_semana === filters.dia;
    const matchMateria = !filters.materia || horario.materia_id.toString() === filters.materia;
    const matchProfesor = !filters.profesor || horario.profesor_id.toString() === filters.profesor;
    const matchAula = !filters.aula || horario.aula === filters.aula;

    return matchGrado && matchSeccion && matchDia && matchMateria && matchProfesor && matchAula;
  });

  const formatTime = (time) => {
    const [h, m] = time.split(':');
    return `${h}:${m}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-rose-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Cargando horarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-rose-50 via-white to-rose-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-rose-700 to-rose-800 rounded-2xl shadow-2xl p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30">
                  <FaClock className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">Gestión de Horarios</h1>
                  <p className="text-rose-200 text-lg mt-2">
                    Administra los horarios académicos de tu institución
                  </p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                  <p className="text-rose-200 text-sm">Total de Horarios</p>
                  <p className="text-2xl font-bold text-white">{horarios.length}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                  <p className="text-rose-200 text-sm">Grados</p>
                  <p className="text-2xl font-bold text-white">{grados.length}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                  <p className="text-rose-200 text-sm">Profesores</p>
                  <p className="text-2xl font-bold text-white">{profesores.length}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                  <p className="text-rose-200 text-sm">Aulas</p>
                  <p className="text-2xl font-bold text-white">{aulas.length}</p>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { resetForm(); setShowModal(true); }}
                className="bg-white text-rose-700 hover:bg-rose-50 px-6 py-3 rounded-xl font-bold flex items-center justify-center transition-all shadow-lg hover:shadow-xl"
              >
                <FaPlus className="mr-2" />
                Nuevo Horario
              </button>
              <button
                onClick={() => setShowDuplicarModal(true)}
                className="bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center transition-all shadow-lg hover:shadow-xl"
              >
                <FaCopy className="mr-2" />
                Duplicar
              </button>
            </div>
          </div>
        </div>

        {/* Vista selector */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setViewMode('tabla')}
            className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
              viewMode === 'tabla'
                ? 'bg-rose-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-rose-300'
            }`}
          >
            <FaUsers />
            Vista Tabla
          </button>
          <button
            onClick={() => setViewMode('calendario')}
            className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
              viewMode === 'calendario'
                ? 'bg-rose-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-rose-300'
            }`}
          >
            <FaCalendarAlt />
            Vista Calendario
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FaFilter className="text-rose-600" />
            <h3 className="text-lg font-bold text-gray-800">Filtros avanzados</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Grado</label>
              <select
                value={filters.grado}
                onChange={(e) => {
                  setFilters({ ...filters, grado: e.target.value, seccion: '' });
                  if (e.target.value) fetchSeccionesByGrado(e.target.value);
                }}
                className="w-full p-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
              >
                <option value="">Todos</option>
                {grados.map(grado => (
                  <option key={grado.id} value={grado.id}>{formatearNombreGrado(grado.nombre_grado)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sección</label>
              <select
                value={filters.seccion}
                onChange={(e) => setFilters({ ...filters, seccion: e.target.value })}
                disabled={!filters.grado}
                className="w-full p-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:bg-gray-100 transition-all"
              >
                <option value="">Todos</option>
                {secciones.map(seccion => (
                  <option key={seccion.id} value={seccion.id}>{seccion.nombre_seccion}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Día</label>
              <select
                value={filters.dia}
                onChange={(e) => setFilters({ ...filters, dia: e.target.value })}
                className="w-full p-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
              >
                <option value="">Todos</option>
                {diasSemana.map(dia => (
                  <option key={dia.value} value={dia.value}>{dia.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profesor</label>
              <select
                value={filters.profesor}
                onChange={(e) => setFilters({ ...filters, profesor: e.target.value })}
                className="w-full p-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
              >
                <option value="">Todos</option>
                {profesores.map(profesor => (
                  <option key={profesor.id} value={profesor.id}>
                    {profesor.nombre} {profesor.apellido}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Aula</label>
              <select
                value={filters.aula}
                onChange={(e) => setFilters({ ...filters, aula: e.target.value })}
                className="w-full p-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
              >
                <option value="">Todas</option>
                {aulas.map(aula => (
                  <option key={aula} value={aula}>Aula {aula}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Búsqueda</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 p-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Vista de contenido */}
        {viewMode === 'calendario' ? (
          <HorariosCalendar
            horarios={horarios}
            profesores={profesores}
            grados={grados}
            secciones={secciones}
            materias={materias}
            onHorarioChange={fetchAllData}
          />
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {filteredHorarios.length === 0 ? (
              <div className="p-12 text-center">
                <FaClock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No hay horarios con los filtros seleccionados</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-rose-700 to-rose-800 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold">Grado/Sección</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">Materia</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">Profesor</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">Día</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">Horario</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">Aula</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">Estado</th>
                      <th className="px-6 py-4 text-center text-sm font-bold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredHorarios.map((horario, idx) => (
                        <tr key={horario.id} className="hover:bg-rose-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {formatearNombreGrado(horario.grado?.nombre_grado)} {horario.seccion?.nombre_seccion}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {horario.materia?.asignatura}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {horario.profesor?.nombre} {horario.profesor?.apellido}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold">
                              {horario.dia_semana}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {formatTime(horario.hora_inicio)} - {formatTime(horario.hora_fin)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {horario.aula ? `Aula ${horario.aula}` : '-'}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              horario.activo
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {horario.activo ? '✓ Activo' : '✗ Inactivo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-center space-x-2">
                            <button
                              onClick={() => handleEdit(horario)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="Editar"
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(horario.id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Eliminar"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL DE FORMULARIO */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header del modal */}
            <div className="sticky top-0 bg-gradient-to-r from-rose-700 to-rose-800 text-white p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <FaClock className="w-6 h-6" />
                <h2 className="text-2xl font-bold">
                  {isEditMode ? 'Editar Horario' : 'Nuevo Horario'}
                </h2>
              </div>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Advertencia de conflictos */}
              {mostrarAdvertencia && conflictosDetectados && (
                <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl flex gap-3">
                  <FaExclamationTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-yellow-900 mb-2">⚠️ Conflictos detectados:</h4>
                    <p className="text-sm text-yellow-800">
                      {generarMensajeConflictos(
                        conflictosDetectados,
                        profesores,
                        grados,
                        secciones
                      )}
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Fila 1: Grado y Sección */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Grado *
                    </label>
                    <select
                      value={formData.grado_id}
                      onChange={(e) => setFormData({ ...formData, grado_id: e.target.value })}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                      required
                    >
                      <option value="">Selecciona un grado</option>
                      {grados.map(grado => (
                        <option key={grado.id} value={grado.id}>{formatearNombreGrado(grado.nombre_grado)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Sección *
                    </label>
                    <select
                      value={formData.seccion_id}
                      onChange={(e) => {
                        setFormData({ ...formData, seccion_id: e.target.value });
                        if (e.target.value) {
                          fetchMateriasBySeccion(e.target.value);
                        } else {
                          setMaterias([]);
                          setProfesores([]);
                        }
                      }}
                      disabled={!formData.grado_id}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:bg-gray-100 transition-all"
                      required
                    >
                      <option value="">Selecciona una sección</option>
                      {secciones.map(seccion => (
                        <option key={seccion.id} value={seccion.id}>{seccion.nombre_seccion}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Fila 2: Materia y Profesor */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Materia *
                    </label>
                    <select
                      value={formData.materia_id}
                      onChange={(e) => {
                        setFormData({ ...formData, materia_id: e.target.value });
                        if (e.target.value && formData.grado_id) {
                          fetchProfesoresByMateria(e.target.value, formData.grado_id);
                        } else {
                          setProfesores([]);
                        }
                      }}
                      disabled={!formData.seccion_id}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:bg-gray-100 transition-all"
                      required
                    >
                      <option value="">Selecciona una materia</option>
                      {materias.map(materia => (
                        <option key={materia.id} value={materia.id}>{materia.asignatura}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Profesor *
                    </label>
                    <select
                      value={formData.profesor_id}
                      onChange={(e) => {
                        setFormData({ ...formData, profesor_id: e.target.value });
                        if (mostrarDisponibilidad) {
                          setMostrarDisponibilidad(true);
                        }
                      }}
                      disabled={!formData.materia_id || profesores.length === 0}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:bg-gray-100 transition-all"
                      required
                    >
                      <option value="">
                        {profesores.length === 0 && formData.materia_id 
                          ? 'No hay profesores para esta materia en este grado' 
                          : 'Selecciona un profesor'}
                      </option>
                      {profesores.map(profesor => (
                        <option key={profesor.id} value={profesor.id}>
                          {profesor.nombre} {profesor.apellido}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Fila 3: Día y Horario */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Día *
                    </label>
                    <select
                      value={formData.dia_semana}
                      onChange={(e) => {
                        setFormData({ ...formData, dia_semana: e.target.value });
                        if (mostrarDisponibilidad) {
                          setMostrarDisponibilidad(true);
                        }
                      }}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                      required
                    >
                      <option value="">Selecciona un día</option>
                      {diasSemana.map(dia => (
                        <option key={dia.value} value={dia.value}>{dia.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Hora Inicio *
                    </label>
                    <input
                      type="time"
                      value={formData.hora_inicio}
                      onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Hora Fin *
                    </label>
                    <input
                      type="time"
                      value={formData.hora_fin}
                      onChange={(e) => setFormData({ ...formData, hora_fin: e.target.value })}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Disponibilidad del profesor */}
                {formData.profesor_id && formData.dia_semana && (
                  <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setMostrarDisponibilidad(!mostrarDisponibilidad)}
                      className="flex items-center gap-2 text-blue-700 font-bold hover:text-blue-800 transition-colors"
                    >
                      {mostrarDisponibilidad ? <FaChevronUp /> : <FaChevronDown />}
                      Ver disponibilidad del profesor
                    </button>

                    {mostrarDisponibilidad && disponibilidadProfesor.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs text-blue-600 font-medium">Franjas libres disponibles:</p>
                        <div className="flex flex-wrap gap-2">
                          {disponibilidadProfesor.map((franja, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  hora_inicio: franja.inicio,
                                  hora_fin: franja.fin
                                });
                              }}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors font-medium"
                            >
                              {franja.inicio} - {franja.fin}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Fila 4: Aula y Estado */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Aula (Opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.aula}
                      onChange={(e) => setFormData({ ...formData, aula: e.target.value })}
                      placeholder="Ej: A1, A2, Lab 1"
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Estado
                    </label>
                    <select
                      value={formData.activo}
                      onChange={(e) => setFormData({ ...formData, activo: e.target.value === 'true' })}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                    >
                      <option value="true">Activo</option>
                      <option value="false">Inactivo</option>
                    </select>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={mostrarAdvertencia}
                    className="flex-1 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <FaSave className="w-5 h-5" />
                    {isEditMode ? 'Actualizar' : 'Crear'} Horario
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE DUPLICAR */}
      {showDuplicarModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-rose-700 to-rose-800 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaCopy className="w-6 h-6" />
                <h2 className="text-2xl font-bold">Duplicar Horarios</h2>
              </div>
              <button
                onClick={() => setShowDuplicarModal(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-600 text-sm">
                Copia todos los horarios de un grado/sección a otro
              </p>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Grado Origen *
                </label>
                <select
                  value={dataDuplicar.sourceGrado}
                  onChange={(e) => {
                    setDataDuplicar({ ...dataDuplicar, sourceGrado: e.target.value });
                    if (e.target.value) fetchSeccionesByGrado(e.target.value);
                  }}
                  className="w-full p-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                >
                  <option value="">Selecciona...</option>
                  {grados.map(grado => (
                    <option key={grado.id} value={grado.id}>{formatearNombreGrado(grado.nombre_grado)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Sección Origen *
                </label>
                <select
                  value={dataDuplicar.sourceSeccion}
                  onChange={(e) => setDataDuplicar({ ...dataDuplicar, sourceSeccion: e.target.value })}
                  disabled={!dataDuplicar.sourceGrado}
                  className="w-full p-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:bg-gray-100 transition-all"
                >
                  <option value="">Selecciona...</option>
                  {secciones.map(seccion => (
                    <option key={seccion.id} value={seccion.id}>{seccion.nombre_seccion}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Grado Destino *
                </label>
                <select
                  value={dataDuplicar.targetGrado}
                  onChange={(e) => {
                    setDataDuplicar({ ...dataDuplicar, targetGrado: e.target.value });
                    if (e.target.value) fetchSeccionesByGrado(e.target.value);
                  }}
                  className="w-full p-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                >
                  <option value="">Selecciona...</option>
                  {grados.map(grado => (
                    <option key={grado.id} value={grado.id}>{formatearNombreGrado(grado.nombre_grado)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Sección Destino *
                </label>
                <select
                  value={dataDuplicar.targetSeccion}
                  onChange={(e) => setDataDuplicar({ ...dataDuplicar, targetSeccion: e.target.value })}
                  disabled={!dataDuplicar.targetGrado}
                  className="w-full p-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:bg-gray-100 transition-all"
                >
                  <option value="">Selecciona...</option>
                  {secciones.map(seccion => (
                    <option key={seccion.id} value={seccion.id}>{seccion.nombre_seccion}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleDuplicar}
                  disabled={loadingDuplicar}
                  className="flex-1 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2 disabled:from-gray-400 disabled:to-gray-400"
                >
                  {loadingDuplicar ? <FaSpinner className="animate-spin" /> : <FaCopy />}
                  {loadingDuplicar ? 'Duplicando...' : 'Duplicar'}
                </button>
                <button
                  onClick={() => setShowDuplicarModal(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HorariosManagementV2;