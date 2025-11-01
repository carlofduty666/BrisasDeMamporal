import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaTimes, FaSpinner, FaExclamationTriangle, FaBook, FaChalkboardTeacher, FaClock, FaDoorOpen, FaGraduationCap, FaCalendar } from 'react-icons/fa';
import { FaChalkboardUser } from "react-icons/fa6";
import { formatearNombreGrado } from '../../utils/formatters';

const HorariosFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  selectedDia = null,
  selectedGrado = null,
  selectedSeccion = null,
  grados,
  materias,
  profesores,
  secciones,
  horarios,
  editingHorario = null
}) => {
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [seccionesOptions, setSeccionesOptions] = useState([]);
  const [materiasOptions, setMateriasOptions] = useState([]);
  const [profesoresOptions, setProfesoresOptions] = useState([]);
  const [conflictErrors, setConflictErrors] = useState([]);
  const [annoEscolarID, setAnnoEscolarID] = useState(null);

  // Detectar si se abre desde el calendario (cuando hay grado, sección y día preseleccionados)
  const isCreatingFromCalendar = !editingHorario && selectedGrado && selectedSeccion && selectedDia;
  
  const [formData, setFormData] = useState({
    grado_id: selectedGrado || '',
    seccion_id: '',
    materia_id: '',
    profesor_id: '',
    dia_semana: selectedDia || '',
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

  // Obtener año escolar actual cuando se abre el modal
  useEffect(() => {
    if (isOpen && !annoEscolarID) {
      const fetchAnnoEscolar = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/anno-escolar/actual`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setAnnoEscolarID(response.data.id);
        } catch (error) {
          console.error('Error al obtener año escolar:', error);
          toast.error('Error al cargar el año escolar');
        }
      };
      fetchAnnoEscolar();
    }
  }, [isOpen]);

  // Cuando se abre el modal, cargar datos si es edición
  useEffect(() => {
    if (editingHorario) {
      setFormData({
        grado_id: editingHorario.grado_id,
        seccion_id: editingHorario.seccion_id,
        materia_id: editingHorario.materia_id,
        profesor_id: editingHorario.profesor_id,
        dia_semana: editingHorario.dia_semana,
        hora_inicio: editingHorario.hora_inicio,
        hora_fin: editingHorario.hora_fin,
        aula: editingHorario.aula || '',
        activo: editingHorario.activo
      });
      // Cargar opciones de sección, materia y profesor
      if (editingHorario.grado_id && annoEscolarID) {
        handleGradoChange({ target: { value: editingHorario.grado_id } }, true);
      }
    } else if (isCreatingFromCalendar && annoEscolarID) {
      // Si se abre desde el calendario, precargar todo
      setFormData({
        grado_id: selectedGrado,
        seccion_id: selectedSeccion,
        materia_id: '',
        profesor_id: '',
        dia_semana: selectedDia,
        hora_inicio: '',
        hora_fin: '',
        aula: '',
        activo: true
      });
      // Cargar opciones de materias y profesores
      handleSeccionChange({ target: { value: selectedSeccion } });
    } else {
      setFormData({
        grado_id: selectedGrado || '',
        seccion_id: selectedSeccion || '',
        materia_id: '',
        profesor_id: '',
        dia_semana: selectedDia || '',
        hora_inicio: '',
        hora_fin: '',
        aula: '',
        activo: true
      });
    }
  }, [editingHorario, isOpen, annoEscolarID, isCreatingFromCalendar]);

  // Cargar secciones cuando se selecciona grado
  const handleGradoChange = async (e, isInit = false) => {
    const gradoId = isInit ? e : e.target.value;
    setFormData(prev => ({
      ...prev,
      grado_id: gradoId,
      seccion_id: '',
      materia_id: '',
      profesor_id: ''
    }));

    if (!gradoId) {
      setSeccionesOptions([]);
      setMateriasOptions([]);
      setProfesoresOptions([]);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/secciones/grado/${gradoId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSeccionesOptions(response.data);
    } catch (error) {
      console.error('Error al obtener secciones:', error);
      toast.error('Error al cargar secciones');
    }
  };

  // Cargar materias cuando se selecciona sección
  const handleSeccionChange = async (e) => {
    const seccionId = e.target.value;
    setFormData(prev => ({
      ...prev,
      seccion_id: seccionId,
      materia_id: '',
      profesor_id: ''
    }));

    if (!seccionId) {
      setMateriasOptions([]);
      setProfesoresOptions([]);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/materias/seccion/${seccionId}?annoEscolarID=${annoEscolarID}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMateriasOptions(response.data);
    } catch (error) {
      console.error('Error al obtener materias:', error);
      toast.error('Error al cargar materias');
    }
  };

  // Cargar profesores cuando se selecciona materia
  const handleMateriaChange = async (e) => {
    const materiaId = e.target.value;
    setFormData(prev => ({
      ...prev,
      materia_id: materiaId,
      profesor_id: ''
    }));

    if (!materiaId) {
      setProfesoresOptions([]);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/materias/${materiaId}/profesores?annoEscolarID=${annoEscolarID}&gradoID=${formData.grado_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfesoresOptions(response.data);
    } catch (error) {
      console.error('Error al obtener profesores:', error);
      toast.error('Error al cargar profesores');
    }
  };

  // Validar conflictos en tiempo real
  const handleTimeChange = async (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value
    };
    setFormData(newFormData);

    // Validar solo si tenemos hora_inicio, hora_fin, día y profesor
    if (newFormData.hora_inicio && newFormData.hora_fin && newFormData.dia_semana && newFormData.profesor_id) {
      await validateConflicts(newFormData);
    }
  };

  const validateConflicts = async (data) => {
    setValidating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/horarios/validar-conflictos`,
        {
          grado_id: data.grado_id,
          seccion_id: data.seccion_id,
          profesor_id: data.profesor_id,
          dia_semana: data.dia_semana,
          hora_inicio: data.hora_inicio,
          hora_fin: data.hora_fin,
          ...(editingHorario && { horario_id: editingHorario.id })
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.conflicts && response.data.conflicts.length > 0) {
        setConflictErrors(response.data.conflicts);
      } else {
        setConflictErrors([]);
      }
    } catch (error) {
      console.error('Error validando conflictos:', error);
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (conflictErrors.length > 0) {
      toast.error('No puedes guardar con conflictos de horario');
      return;
    }

    if (!formData.grado_id || !formData.seccion_id || !formData.materia_id || 
        !formData.profesor_id || !formData.dia_semana || !formData.hora_inicio || !formData.hora_fin) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
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

      await onSubmit();
      onClose();
    } catch (error) {
      console.error('Error al guardar horario:', error);
      toast.error(error.response?.data?.message || 'Error al guardar el horario');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-50 p-4 !m-0" style={{ margin: 0 }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-rose-600 to-rose-700 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {editingHorario ? 'Editar Horario' : 'Crear Nuevo Horario'}
          </h2>
          <button
            onClick={onClose}
            className="hover:bg-rose-800 p-2 rounded-full transition-colors"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información de contexto cuando se abre desde el calendario */}
          {isCreatingFromCalendar && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                <FaCalendar className="text-blue-600" />
                Contexto de la Clase
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Grado Badge */}
                <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-blue-200">
                  <FaGraduationCap className="text-indigo-600 text-lg" />
                  <div>
                    <p className="text-xs text-gray-600">Grado</p>
                    <p className="font-semibold text-gray-800">{formatearNombreGrado(grados.find(g => g.id === selectedGrado)?.nombre_grado) || 'N/A'}</p>
                  </div>
                </div>
                
                {/* Sección Badge */}
                <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-blue-200">
                  <FaDoorOpen className="text-green-600 text-lg" />
                  <div>
                    <p className="text-xs text-gray-600">Sección</p>
                    <p className="font-semibold text-gray-800">{secciones.find(s => s.id === selectedSeccion)?.nombre_seccion || 'N/A'}</p>
                  </div>
                </div>
                
                {/* Día Badge */}
                <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-blue-200">
                  <FaClock className="text-rose-600 text-lg" />
                  <div>
                    <p className="text-xs text-gray-600">Día</p>
                    <p className="font-semibold text-gray-800 capitalize">{selectedDia || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Secciones y Grados - Solo si NO es desde calendario o si es edición */}
          {!isCreatingFromCalendar && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FaGraduationCap className="text-indigo-600" />
                  Grado <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.grado_id}
                  onChange={handleGradoChange}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-rose-500 focus:outline-none transition-colors"
                >
                  <option value="">Selecciona un grado</option>
                  {grados.map(grado => (
                    <option key={grado.id} value={grado.id}>
                      {formatearNombreGrado(grado.nombre_grado)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FaDoorOpen className="text-green-600" />
                  Sección <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.seccion_id}
                  onChange={handleSeccionChange}
                  disabled={!formData.grado_id}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-rose-500 focus:outline-none transition-colors disabled:bg-gray-100"
                >
                  <option value="">Selecciona una sección</option>
                  {seccionesOptions.map(seccion => (
                    <option key={seccion.id} value={seccion.id}>
                      {seccion.nombre_seccion}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Row: Materia y Profesor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaBook className="text-amber-600" />
                Materia <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.materia_id}
                onChange={handleMateriaChange}
                disabled={!formData.seccion_id}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-rose-500 focus:outline-none transition-colors disabled:bg-gray-100"
              >
                <option value="">Selecciona una materia</option>
                {materiasOptions.map(materia => (
                  <option key={materia.id} value={materia.id}>
                    {materia.asignatura}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaChalkboardTeacher className="text-purple-600" />
                Profesor <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.profesor_id}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, profesor_id: e.target.value }));
                  if (formData.hora_inicio && formData.hora_fin) {
                    validateConflicts({
                      ...formData,
                      profesor_id: e.target.value
                    });
                  }
                }}
                disabled={!formData.materia_id}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-rose-500 focus:outline-none transition-colors disabled:bg-gray-100"
              >
                <option value="">Selecciona un profesor</option>
                {profesoresOptions.map(profesor => (
                  <option key={profesor.id} value={profesor.id}>
                    {profesor.nombre} {profesor.apellido}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row: Día y Horarios - Día solo si NO es desde calendario */}
          <div className={`grid gap-4 ${isCreatingFromCalendar ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'}`}>
            {!isCreatingFromCalendar && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FaCalendar className="text-rose-600" />
                  Día <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.dia_semana}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, dia_semana: e.target.value }));
                    if (formData.hora_inicio && formData.hora_fin && formData.profesor_id) {
                      validateConflicts({
                        ...formData,
                        dia_semana: e.target.value
                      });
                    }
                  }}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-rose-500 focus:outline-none transition-colors"
                >
                  <option value="">Selecciona un día</option>
                  {diasSemana.map(dia => (
                    <option key={dia.value} value={dia.value}>
                      {dia.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaClock className="text-cyan-600" />
                Hora Inicio <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="hora_inicio"
                value={formData.hora_inicio}
                onChange={handleTimeChange}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-rose-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaClock className="text-cyan-600" />
                Hora Fin <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="hora_fin"
                value={formData.hora_fin}
                onChange={handleTimeChange}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-rose-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Row: Aula */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FaDoorOpen className="text-green-600" />
              Aula
            </label>
            <input
              type="text"
              value={formData.aula}
              onChange={(e) => setFormData(prev => ({ ...prev, aula: e.target.value }))}
              placeholder="Ej: Aula 101, Laboratorio, etc."
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-rose-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Conflictos */}
          {conflictErrors.length > 0 && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FaExclamationTriangle className="text-red-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 mb-2">Conflictos Detectados:</h3>
                  <ul className="space-y-2">
                    {conflictErrors.map((conflict, idx) => (
                      <li key={idx} className="text-red-800 text-sm">
                        • {conflict.type === 'profesor' ? (
                          <>
                            Profesor {conflict.profesor} ya tiene <span className="font-bold">{conflict.materia}</span> de <span className="font-bold">{conflict.horaInicio}</span> a <span className="font-bold">{conflict.horaFin}</span>
                          </>
                        ) : (
                          <>
                            Ya <span className="font-bold">{conflict.materia}</span> se imparte de <span className="font-bold">{conflict.horaInicio}</span> a <span className="font-bold">{conflict.horaFin}</span>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Loading indicator para validación */}
          {validating && (
            <div className="flex items-center gap-2 text-rose-600 text-sm">
              <FaSpinner className="animate-spin" />
              Validando conflictos...
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || conflictErrors.length > 0}
              className="px-6 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && <FaSpinner className="animate-spin" />}
              {editingHorario ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HorariosFormModal;