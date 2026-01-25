import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTimes, FaSave, FaSpinner } from 'react-icons/fa';

const ModalNuevaEvaluacion = ({
  isOpen,
  onClose,
  profesor,
  annoEscolar,
  grados,
  isEditMode,
  evaluacionToEdit,
  onSuccess
}) => {
  const [evaluacionForm, setEvaluacionForm] = useState({
    nombreEvaluacion: '',
    descripcion: '',
    tipoEvaluacion: 'Examen',
    fechaEvaluacion: '',
    materiaID: '',
    gradoID: '',
    seccionID: '',
    porcentaje: '',
    lapso: '1',
    requiereEntrega: true,
    fechaLimiteEntrega: ''
  });

  const [materiasModal, setMateriasModal] = useState([]);
  const [seccionesModal, setSeccionesModal] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [savingEvaluacion, setSavingEvaluacion] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode && evaluacionToEdit) {
      cargarDatosEdicion();
    } else {
      resetForm();
    }
  }, [isEditMode, evaluacionToEdit]);

  const cargarDatosEdicion = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      const materiasResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/materias/profesor/${profesor.id}/grado/${evaluacionToEdit.gradoID}?annoEscolarID=${annoEscolar.id}`,
        config
      );
      setMateriasModal(materiasResponse.data);
      
      const seccionesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/secciones/grado/${evaluacionToEdit.gradoID}`,
        config
      );
      setSeccionesModal(seccionesResponse.data);
      
      setEvaluacionForm({
        nombreEvaluacion: evaluacionToEdit.nombreEvaluacion,
        descripcion: evaluacionToEdit.descripcion || '',
        tipoEvaluacion: evaluacionToEdit.tipoEvaluacion,
        fechaEvaluacion: evaluacionToEdit.fechaEvaluacion ? evaluacionToEdit.fechaEvaluacion.split('T')[0] : '',
        materiaID: evaluacionToEdit.materiaID,
        gradoID: evaluacionToEdit.gradoID,
        seccionID: evaluacionToEdit.seccionID,
        porcentaje: evaluacionToEdit.porcentaje,
        lapso: evaluacionToEdit.lapso,
        requiereEntrega: evaluacionToEdit.requiereEntrega,
        fechaLimiteEntrega: evaluacionToEdit.fechaLimiteEntrega ? evaluacionToEdit.fechaLimiteEntrega.split('T')[0] : ''
      });
    } catch (err) {
      console.error('Error al cargar datos para editar:', err);
      setError('Error al cargar datos para editar');
    }
  };

  const resetForm = () => {
    setEvaluacionForm({
      nombreEvaluacion: '',
      descripcion: '',
      tipoEvaluacion: 'Examen',
      fechaEvaluacion: '',
      materiaID: '',
      gradoID: '',
      seccionID: '',
      porcentaje: '',
      lapso: '1',
      requiereEntrega: true,
      fechaLimiteEntrega: ''
    });
    setMateriasModal([]);
    setSeccionesModal([]);
    setSelectedFile(null);
  };

  const handleGradoChange = async (e) => {
    const gradoID = e.target.value;
    setEvaluacionForm({ ...evaluacionForm, gradoID, materiaID: '', seccionID: '' });
    
    if (gradoID) {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { 'Authorization': `Bearer ${token}` } };
        
        const materiasResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/materias/profesor/${profesor.id}/grado/${gradoID}?annoEscolarID=${annoEscolar.id}`,
          config
        );
        setMateriasModal(materiasResponse.data);
        
        const seccionesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/secciones/grado/${gradoID}`,
          config
        );
        setSeccionesModal(seccionesResponse.data);
      } catch (err) {
        console.error('Error al cargar materias/secciones:', err);
        setError('Error al cargar las opciones disponibles');
      }
    } else {
      setMateriasModal([]);
      setSeccionesModal([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSavingEvaluacion(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      
      Object.keys(evaluacionForm).forEach(key => {
        if (evaluacionForm[key] !== null && evaluacionForm[key] !== '') {
          formData.append(key, evaluacionForm[key]);
        }
      });
      
      formData.append('profesorID', profesor.id);
      formData.append('annoEscolarID', annoEscolar.id);
      
      if (selectedFile) {
        formData.append('archivo', selectedFile);
      }
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };
      
      if (isEditMode && evaluacionToEdit) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/evaluaciones/${evaluacionToEdit.id}`,
          formData,
          config
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/evaluaciones`,
          formData,
          config
        );
      }
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error al guardar evaluación:', err);
      setError(err.response?.data?.message || 'Error al guardar la evaluación');
      setTimeout(() => setError(''), 3000);
    }
    
    setSavingEvaluacion(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto animate-scaleIn transition-all duration-300 ease-in-out">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditMode ? 'Editar Evaluación' : 'Nueva Evaluación'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {error && (
          <div className="mx-6 mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la Evaluación *
              </label>
              <input
                type="text"
                required
                value={evaluacionForm.nombreEvaluacion}
                onChange={(e) => setEvaluacionForm({...evaluacionForm, nombreEvaluacion: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ease-in-out hover:border-slate-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Evaluación *
              </label>
              <select
                required
                value={evaluacionForm.tipoEvaluacion}
                onChange={(e) => setEvaluacionForm({...evaluacionForm, tipoEvaluacion: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ease-in-out hover:border-slate-400"
              >
                <option value="Examen">Examen</option>
                <option value="Prueba">Prueba</option>
                <option value="Tarea">Tarea</option>
                <option value="Proyecto">Proyecto</option>
                <option value="Participación">Participación</option>
                <option value="Quiz">Quiz</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grado *
              </label>
              <select
                required
                value={evaluacionForm.gradoID}
                onChange={handleGradoChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ease-in-out hover:border-slate-400"
              >
                <option value="">Seleccionar grado</option>
                {grados.map(grado => (
                  <option key={grado.id} value={grado.id}>
                    {grado.nombre_grado}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Materia *
              </label>
              <select
                required
                value={evaluacionForm.materiaID}
                onChange={(e) => setEvaluacionForm({...evaluacionForm, materiaID: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ease-in-out hover:border-slate-400"
                disabled={!evaluacionForm.gradoID}
              >
                <option value="">Seleccionar materia</option>
                {materiasModal.map(materia => (
                  <option key={materia.id} value={materia.id}>
                    {materia.asignatura}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sección *
              </label>
              <select
                required
                value={evaluacionForm.seccionID}
                onChange={(e) => setEvaluacionForm({...evaluacionForm, seccionID: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ease-in-out hover:border-slate-400"
                disabled={!evaluacionForm.gradoID}
              >
                <option value="">Seleccionar sección</option>
                {seccionesModal.map(seccion => (
                  <option key={seccion.id} value={seccion.id}>
                    {seccion.nombre_seccion || seccion.nombre}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Evaluación *
              </label>
              <input
                type="date"
                required
                value={evaluacionForm.fechaEvaluacion}
                onChange={(e) => setEvaluacionForm({...evaluacionForm, fechaEvaluacion: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ease-in-out hover:border-slate-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Porcentaje *
              </label>
              <input
                type="number"
                required
                min="1"
                max="100"
                value={evaluacionForm.porcentaje}
                onChange={(e) => setEvaluacionForm({...evaluacionForm, porcentaje: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ease-in-out hover:border-slate-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lapso *
              </label>
              <select
                required
                value={evaluacionForm.lapso}
                onChange={(e) => setEvaluacionForm({...evaluacionForm, lapso: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ease-in-out hover:border-slate-400"
              >
                <option value="1">Primer Lapso</option>
                <option value="2">Segundo Lapso</option>
                <option value="3">Tercer Lapso</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={evaluacionForm.descripcion}
              onChange={(e) => setEvaluacionForm({...evaluacionForm, descripcion: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ease-in-out hover:border-slate-400"
              rows="3"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="requiereEntrega"
              checked={evaluacionForm.requiereEntrega}
              onChange={(e) => setEvaluacionForm({...evaluacionForm, requiereEntrega: e.target.checked})}
              className="h-4 w-4 text-slate-600 focus:ring-slate-500 border-gray-300 rounded"
            />
            <label htmlFor="requiereEntrega" className="ml-2 text-sm font-medium text-gray-700">
              Esta evaluación requiere entrega
            </label>
          </div>

          {evaluacionForm.requiereEntrega && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Límite de Entrega *
              </label>
              <input
                type="date"
                required={evaluacionForm.requiereEntrega}
                value={evaluacionForm.fechaLimiteEntrega}
                onChange={(e) => setEvaluacionForm({...evaluacionForm, fechaLimiteEntrega: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ease-in-out hover:border-slate-400"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Archivo adjunto (opcional)
            </label>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ease-in-out hover:border-slate-400"
            />
            {selectedFile && (
              <p className="text-sm text-green-600 mt-1">
                📎 {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
            {isEditMode && evaluacionToEdit?.archivoURL && !selectedFile && (
              <p className="text-sm text-blue-600 mt-1">
                📎 Archivo actual: {evaluacionToEdit.nombreArchivo}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Formatos admitidos: PDF, Word, PowerPoint, Excel, Imágenes (máx. 10MB)
            </p>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 ease-in-out hover:shadow-md hover:-translate-y-0.5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={savingEvaluacion}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-all duration-200 ease-in-out disabled:opacity-50 flex items-center hover:shadow-md hover:-translate-y-0.5"
            >
              {savingEvaluacion ? (
                <>
                  <FaSpinner className="animate-spin h-4 w-4 mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <FaSave className="h-4 w-4 mr-2" />
                  {isEditMode ? 'Actualizar Evaluación' : 'Crear Evaluación'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalNuevaEvaluacion;
