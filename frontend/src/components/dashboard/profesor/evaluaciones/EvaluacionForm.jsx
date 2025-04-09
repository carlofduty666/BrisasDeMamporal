import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FaSave, FaArrowLeft, FaUpload, FaTrash } from 'react-icons/fa';
import ProfesorLayout from '../layout/ProfesorLayout';

const EvaluacionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState({
    nombreEvaluacion: '',
    tipoEvaluacion: '',
    porcentaje: '',
    lapso: '',
    materiaID: '',
    gradoID: '',
    seccionID: '',
    descripcion: '',
    fechaEvaluacion: '',
    requiereEntrega: false,
    fechaLimiteEntrega: ''
  });
  
  const [archivo, setArchivo] = useState(null);
  const [archivoPreview, setArchivoPreview] = useState('');
  const [archivoExistente, setArchivoExistente] = useState(null);
  const [materias, setMaterias] = useState([]);
  const [grados, setGrados] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [porcentajeDisponible, setPorcentajeDisponible] = useState(100);
  
  // Cargar datos del profesor y año escolar actual
  const [profesorID, setProfesorID] = useState(null);
  const [annoEscolarID, setAnnoEscolarID] = useState(null);
  
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/login');
          return;
        }
        
        // Decodificar el token para obtener el ID del profesor
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        setProfesorID(tokenData.personaID);
        
        // Obtener año escolar actual
        const annoResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/anno-escolar/actual`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        setAnnoEscolarID(annoResponse.data.id);
        
        // Cargar materias asignadas al profesor
        const materiasResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/materias/profesor/${tokenData.personaID}`,
          { 
            headers: { 'Authorization': `Bearer ${token}` },
            params: { annoEscolarID: annoResponse.data.id }
          }
        );
        
        setMaterias(materiasResponse.data);
        
        // Si estamos editando, cargar datos de la evaluación
        if (isEditing) {
          const evaluacionResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/evaluaciones/${id}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          
          const evaluacion = evaluacionResponse.data;
          
          // Formatear fechas para el formulario
          const fechaEvaluacion = evaluacion.fechaEvaluacion ? new Date(evaluacion.fechaEvaluacion).toISOString().split('T')[0] : '';
          const fechaLimiteEntrega = evaluacion.fechaLimiteEntrega ? new Date(evaluacion.fechaLimiteEntrega).toISOString().split('T')[0] : '';
          
          setFormData({
            nombreEvaluacion: evaluacion.nombreEvaluacion,
            tipoEvaluacion: evaluacion.tipoEvaluacion,
            porcentaje: evaluacion.porcentaje.toString(),
            lapso: evaluacion.lapso,
            materiaID: evaluacion.materiaID.toString(),
            gradoID: evaluacion.gradoID.toString(),
            seccionID: evaluacion.seccionID.toString(),
            descripcion: evaluacion.descripcion || '',
            fechaEvaluacion,
            requiereEntrega: evaluacion.requiereEntrega,
            fechaLimiteEntrega
          });
          
          // Si tiene archivo, guardar la información
          if (evaluacion.archivoURL) {
            setArchivoExistente({
              url: evaluacion.archivoURL,
              nombre: evaluacion.nombreArchivo,
              tipo: evaluacion.tipoArchivo
            });
          }
          
          // Cargar grados y secciones relacionados
          await loadGradosYSecciones(evaluacion.materiaID);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
        setError('Error al cargar datos. Por favor, intente nuevamente.');
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [id, navigate]);
  
  // Cargar grados y secciones cuando se selecciona una materia
  const loadGradosYSecciones = async (materiaID) => {
    try {
      const token = localStorage.getItem('token');
      
      // Obtener grados asociados a la materia
      const gradosResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/materias/${materiaID}/grados`,
        { 
          headers: { 'Authorization': `Bearer ${token}` },
          params: { annoEscolarID }
        }
      );
      
      setGrados(gradosResponse.data);
      
      // Limpiar selección de grado y sección si no estamos editando
      if (!isEditing) {
        setFormData(prev => ({
          ...prev,
          gradoID: '',
          seccionID: ''
        }));
        setSecciones([]);
      }
    } catch (error) {
      console.error('Error al cargar grados:', error);
      setError('Error al cargar grados asociados a la materia.');
    }
  };
  
  // Cargar secciones cuando se selecciona un grado
  const loadSecciones = async (gradoID) => {
    try {
      const token = localStorage.getItem('token');
      
      // Obtener secciones asociadas al grado
      const seccionesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/grados/${gradoID}/secciones`,
        { 
          headers: { 'Authorization': `Bearer ${token}` },
          params: { annoEscolarID }
        }
      );
      
      setSecciones(seccionesResponse.data);
      
      // Limpiar selección de sección si no estamos editando
      if (!isEditing) {
        setFormData(prev => ({
          ...prev,
          seccionID: ''
        }));
      }
    } catch (error) {
      console.error('Error al cargar secciones:', error);
      setError('Error al cargar secciones asociadas al grado.');
    }
  };
  
  // Verificar porcentaje disponible cuando se selecciona materia, grado, sección y lapso
  const verificarPorcentajeDisponible = async () => {
    try {
      const { materiaID, gradoID, seccionID, lapso } = formData;
      
      if (!materiaID || !gradoID || !seccionID || !lapso || !annoEscolarID) {
        return;
      }
      
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/evaluaciones/verificar-porcentajes`,
        { 
          headers: { 'Authorization': `Bearer ${token}` },
          params: { 
            materiaID, 
            gradoID, 
            seccionID, 
            annoEscolarID, 
            lapso 
          }
        }
      );
      
      // Si estamos editando, ajustar el porcentaje disponible para incluir el porcentaje actual
      if (isEditing && formData.lapso === lapso) {
        const porcentajeActual = parseFloat(formData.porcentaje);
        setPorcentajeDisponible(response.data.porcentajeFaltante + porcentajeActual);
      } else {
        setPorcentajeDisponible(response.data.porcentajeFaltante);
      }
    } catch (error) {
      console.error('Error al verificar porcentaje disponible:', error);
      setError('Error al verificar porcentaje disponible.');
    }
  };
  
  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Para campos tipo checkbox, usar el valor de checked
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Si cambia la materia, cargar grados asociados
    if (name === 'materiaID' && value) {
      loadGradosYSecciones(value);
    }
    
    // Si cambia el grado, cargar secciones asociadas
    if (name === 'gradoID' && value) {
      loadSecciones(value);
    }
    
    // Verificar porcentaje disponible cuando cambian ciertos campos
    if (['materiaID', 'gradoID', 'seccionID', 'lapso'].includes(name)) {
      setTimeout(() => {
        verificarPorcentajeDisponible();
      }, 300);
    }
  };
  
  // Manejar cambio de archivo
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setArchivo(file);
      
      // Crear URL para previsualización
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setArchivoPreview(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    }
  };
  
  // Eliminar archivo seleccionado
  const handleRemoveFile = () => {
    setArchivo(null);
    setArchivoPreview('');
  };
  
  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      
      // Validar que el porcentaje no exceda el disponible
      if (parseFloat(formData.porcentaje) > porcentajeDisponible) {
        setError(`El porcentaje excede el disponible (${porcentajeDisponible}%)`);
        setLoading(false);
        return;
      }
      
      // Crear FormData para enviar datos y archivo
      const formDataToSend = new FormData();
      
      // Añadir todos los campos del formulario
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      // Añadir IDs del profesor y año escolar
      formDataToSend.append('profesorID', profesorID);
      formDataToSend.append('annoEscolarID', annoEscolarID);
      
      // Añadir archivo si existe
      if (archivo) {
        formDataToSend.append('archivo', archivo);
      }
      
      let response;
      
      if (isEditing) {
        // Actualizar evaluación existente
        response = await axios.put(
          `${import.meta.env.VITE_API_URL}/evaluaciones/${id}`,
          formDataToSend,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        setSuccess('Evaluación actualizada correctamente');
      } else {
        // Crear nueva evaluación
        response = await axios.post(
          `${import.meta.env.VITE_API_URL}/evaluaciones`,
          formDataToSend,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        setSuccess('Evaluación creada correctamente');
      }
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/profesor/evaluaciones');
      }, 2000);
      
    } catch (error) {
      console.error('Error al guardar evaluación:', error);
      setError(error.response?.data?.message || 'Error al guardar la evaluación. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ProfesorLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/profesor/evaluaciones')}
            className="flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <FaArrowLeft className="mr-2" /> Volver a evaluaciones
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar Evaluación' : 'Nueva Evaluación'}
          </h1>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {/* Nombre de la evaluación */}
              <div className="sm:col-span-3">
                <label htmlFor="nombreEvaluacion" className="block text-sm font-medium text-gray-700">
                  Nombre de la Evaluación <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="nombreEvaluacion"
                    name="nombreEvaluacion"
                    value={formData.nombreEvaluacion}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>
              
              {/* Tipo de evaluación */}
              <div className="sm:col-span-3">
                <label htmlFor="tipoEvaluacion" className="block text-sm font-medium text-gray-700">
                  Tipo de Evaluación <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    id="tipoEvaluacion"
                    name="tipoEvaluacion"
                    value={formData.tipoEvaluacion}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Seleccione un tipo</option>
                    <option value="Examen">Examen</option>
                    <option value="Tarea">Tarea</option>
                    <option value="Proyecto">Proyecto</option>
                    <option value="Exposición">Exposición</option>
                    <option value="Participación">Participación</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>
              
              {/* Materia */}
              <div className="sm:col-span-2">
                <label htmlFor="materiaID" className="block text-sm font-medium text-gray-700">
                  Materia <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    id="materiaID"
                    name="materiaID"
                    value={formData.materiaID}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                    disabled={isEditing}
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
              
              {/* Grado */}
              <div className="sm:col-span-2">
                <label htmlFor="gradoID" className="block text-sm font-medium text-gray-700">
                  Grado <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    id="gradoID"
                    name="gradoID"
                    value={formData.gradoID}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                    disabled={!formData.materiaID || isEditing}
                  >
                    <option value="">Seleccione un grado</option>
                    {grados.map((grado) => (
                      <option key={grado.id} value={grado.id}>
                        {grado.nombre_grado}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Sección */}
              <div className="sm:col-span-2">
                <label htmlFor="seccionID" className="block text-sm font-medium text-gray-700">
                  Sección <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    id="seccionID"
                    name="seccionID"
                    value={formData.seccionID}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                    disabled={!formData.gradoID || isEditing}
                  >
                    <option value="">Seleccione una sección</option>
                    {secciones.map((seccion) => (
                      <option key={seccion.id} value={seccion.id}>
                        {seccion.nombre_seccion}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Lapso */}
              <div className="sm:col-span-2">
                <label htmlFor="lapso" className="block text-sm font-medium text-gray-700">
                  Lapso <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    id="lapso"
                    name="lapso"
                    value={formData.lapso}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Seleccione un lapso</option>
                    <option value="1">Primer Lapso</option>
                    <option value="2">Segundo Lapso</option>
                    <option value="3">Tercer Lapso</option>
                  </select>
                </div>
              </div>
              
              {/* Porcentaje */}
              <div className="sm:col-span-2">
                <label htmlFor="porcentaje" className="block text-sm font-medium text-gray-700">
                  Porcentaje <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <input
                    type="number"
                    id="porcentaje"
                    name="porcentaje"
                    min="1"
                    max="100"
                    step="0.01"
                    value={formData.porcentaje}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">%</span>
                  </div>
                </div>
                {porcentajeDisponible < 100 && (
                  <p className="mt-1 text-sm text-gray-500">
                    Porcentaje disponible: {porcentajeDisponible.toFixed(2)}%
                  </p>
                )}
              </div>
              
              {/* Fecha de evaluación */}
              <div className="sm:col-span-2">
                <label htmlFor="fechaEvaluacion" className="block text-sm font-medium text-gray-700">
                  Fecha de Evaluación <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    id="fechaEvaluacion"
                    name="fechaEvaluacion"
                    value={formData.fechaEvaluacion}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>
              
              {/* Requiere entrega */}
              <div className="sm:col-span-3">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="requiereEntrega"
                      name="requiereEntrega"
                      type="checkbox"
                      checked={formData.requiereEntrega}
                      onChange={handleChange}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="requiereEntrega" className="font-medium text-gray-700">
                      Requiere entrega de trabajo
                    </label>
                    <p className="text-gray-500">Marque esta opción si los estudiantes deben entregar un trabajo.</p>
                  </div>
                </div>
              </div>
              
              {/* Fecha límite de entrega (solo si requiere entrega) */}
              {formData.requiereEntrega && (
                <div className="sm:col-span-3">
                  <label htmlFor="fechaLimiteEntrega" className="block text-sm font-medium text-gray-700">
                    Fecha Límite de Entrega <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      id="fechaLimiteEntrega"
                      name="fechaLimiteEntrega"
                      value={formData.fechaLimiteEntrega}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required={formData.requiereEntrega}
                    />
                  </div>
                </div>
              )}
              
              {/* Descripción */}
              <div className="sm:col-span-6">
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <div className="mt-1">
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    rows="3"
                    value={formData.descripcion}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  ></textarea>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Describa brevemente la evaluación, instrucciones o detalles importantes.
                </p>
              </div>
              
              {/* Archivo adjunto */}
              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-gray-700">
                  Archivo Adjunto
                </label>
                
                {/* Mostrar archivo existente si lo hay */}
                {archivoExistente && !archivo && (
                  <div className="mt-2 flex items-center p-2 border border-gray-300 rounded-md">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{archivoExistente.nombre}</p>
                      <p className="text-xs text-gray-500">
                        {archivoExistente.tipo.includes('pdf') ? 'Documento PDF' : 
                         archivoExistente.tipo.includes('image') ? 'Imagen' : 
                         archivoExistente.tipo.includes('word') ? 'Documento Word' : 
                         archivoExistente.tipo.includes('excel') ? 'Hoja de cálculo Excel' : 
                         'Archivo'}
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => setArchivoExistente(null)}
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        Cambiar
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Selector de archivo nuevo */}
                {(!archivoExistente || archivo) && (
                  <div className="mt-2">
                    <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        {archivoPreview ? (
                          <div className="flex flex-col items-center">
                            {archivo.type.includes('image') ? (
                              <img src={archivoPreview} alt="Preview" className="h-32 object-contain mb-2" />
                            ) : (
                              <div className="h-32 w-32 flex items-center justify-center bg-gray-100 rounded mb-2">
                                <span className="text-gray-500 text-lg">
                                  {archivo.type.includes('pdf') ? 'PDF' : 
                                   archivo.type.includes('word') ? 'DOC' : 
                                   archivo.type.includes('excel') ? 'XLS' : 
                                   'Archivo'}
                                </span>
                              </div>
                            )}
                            <p className="text-sm text-gray-500">{archivo.name}</p>
                            <button
                              type="button"
                              onClick={handleRemoveFile}
                              className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <FaTrash className="mr-1" /> Eliminar
                            </button>
                          </div>
                        ) : (
                          <>
                            <svg
                              className="mx-auto h-12 w-12 text-gray-400"
                              stroke="currentColor"
                              fill="none"
                              viewBox="0 0 48 48"
                              aria-hidden="true"
                            >
                              <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <div className="flex text-sm text-gray-600">
                              <label
                                htmlFor="file-upload"
                                className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                              >
                                <span>Subir un archivo</span>
                                <input
                                  id="file-upload"
                                  name="file-upload"
                                  type="file"
                                  className="sr-only"
                                  onChange={handleFileChange}
                                />
                              </label>
                              <p className="pl-1">o arrastre y suelte</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              PDF, DOC, XLS, PNG, JPG hasta 10MB
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/profesor/evaluaciones')}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" /> {isEditing ? 'Actualizar' : 'Guardar'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProfesorLayout>
  );
};

export default EvaluacionForm;