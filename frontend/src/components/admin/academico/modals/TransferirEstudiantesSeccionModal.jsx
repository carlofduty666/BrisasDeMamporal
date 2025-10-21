import { useState, useMemo } from 'react';
import { FaArrowRight, FaTimes, FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import axios from 'axios';

const TransferirEstudiantesSeccionModal = ({
  isOpen,
  onClose,
  estudiantes,
  secciones,
  gradoID,
  annoEscolarID,
  onTransferComplete,
  token
}) => {
  const [seccionDestinoID, setSeccionDestinoID] = useState('');
  const [selectedEstudiantes, setSelectedEstudiantes] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectAll, setSelectAll] = useState(false);

  const estudiantesPorSeccion = useMemo(() => {
    const grupos = {};
    secciones.forEach(seccion => {
      grupos[seccion.id] = {
        seccion,
        estudiantes: estudiantes.filter(e => e.seccionID === seccion.id)
      };
    });
    return grupos;
  }, [estudiantes, secciones]);

  const seccionesDestino = secciones.filter(s => s.id !== (selectedEstudiantes.size > 0 ? estudiantes.find(e => selectedEstudiantes.has(e.id))?.seccionID : null));

  const handleSelectEstudiante = (estudianteID) => {
    const newSet = new Set(selectedEstudiantes);
    if (newSet.has(estudianteID)) {
      newSet.delete(estudianteID);
    } else {
      newSet.add(estudianteID);
    }
    setSelectedEstudiantes(newSet);
    setSelectAll(false);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEstudiantes(new Set());
      setSelectAll(false);
    } else {
      const allIDs = new Set(estudiantes.map(e => e.id));
      setSelectedEstudiantes(allIDs);
      setSelectAll(true);
    }
  };

  const handleSelectBySeccion = (seccionID) => {
    const estudiantesEnSeccion = estudiantesPorSeccion[seccionID]?.estudiantes || [];
    const newSet = new Set(selectedEstudiantes);
    
    let allSelected = true;
    estudiantesEnSeccion.forEach(e => {
      if (!newSet.has(e.id)) {
        allSelected = false;
      }
    });
    
    if (allSelected) {
      estudiantesEnSeccion.forEach(e => newSet.delete(e.id));
    } else {
      estudiantesEnSeccion.forEach(e => newSet.add(e.id));
    }
    
    setSelectedEstudiantes(newSet);
  };

  const handleTransfer = async () => {
    if (selectedEstudiantes.size === 0) {
      setErrorMessage('Por favor selecciona al menos un estudiante');
      return;
    }

    if (!seccionDestinoID) {
      setErrorMessage('Por favor selecciona una sección de destino');
      return;
    }

    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/secciones/transferir-estudiantes-masivo`,
        {
          estudiantesIDs: Array.from(selectedEstudiantes),
          seccionDestinoID: parseInt(seccionDestinoID),
          annoEscolarID
        },
        config
      );

      setSuccessMessage(`✓ ${response.data.estudiantesTransferidos?.length || selectedEstudiantes.size} estudiante(s) transferido(s) correctamente`);
      setSelectedEstudiantes(new Set());
      setSelectAll(false);

      setTimeout(() => {
        onTransferComplete();
        onClose();
      }, 1500);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error al transferir estudiantes';
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <FaArrowRight className="w-5 h-5 text-indigo-200" />
            <h2 className="text-xl font-bold text-white">Transferir Estudiantes de Sección</h2>
          </div>
          <button
            onClick={onClose}
            className="text-indigo-200 hover:text-white transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Sección de destino */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Sección de Destino
            </label>
            <select
              value={seccionDestinoID}
              onChange={(e) => setSeccionDestinoID(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="">Selecciona una sección...</option>
              {seccionesDestino.map(seccion => {
                const ocupados = estudiantesPorSeccion[seccion.id]?.estudiantes?.length || 0;
                const disponibles = seccion.capacidad - ocupados;
                return (
                  <option key={seccion.id} value={seccion.id}>
                    {seccion.nombre_seccion} ({ocupados}/{seccion.capacidad}) - {disponibles} disponibles
                  </option>
                );
              })}
            </select>
          </div>

          {/* Selección de estudiantes */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-semibold text-gray-700">
                Estudiantes a Transferir ({selectedEstudiantes.size})
              </label>
              <button
                onClick={handleSelectAll}
                className="text-xs px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors font-medium"
              >
                {selectAll ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {Object.entries(estudiantesPorSeccion).map(([seccionId, grupo]) => {
                if (grupo.estudiantes.length === 0) return null;

                const allSelectedInSeccion = grupo.estudiantes.every(e => selectedEstudiantes.has(e.id));
                const someSelectedInSeccion = grupo.estudiantes.some(e => selectedEstudiantes.has(e.id));

                return (
                  <div key={seccionId} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900 flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={allSelectedInSeccion}
                          onChange={() => handleSelectBySeccion(seccionId)}
                          className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                        />
                        <span>{grupo.seccion.nombre_seccion}</span>
                        <span className="text-sm text-gray-500">({grupo.estudiantes.length})</span>
                      </h3>
                      {someSelectedInSeccion && (
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
                          {grupo.estudiantes.filter(e => selectedEstudiantes.has(e.id)).length} seleccionados
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 pl-6">
                      {grupo.estudiantes.map(estudiante => (
                        <label
                          key={estudiante.id}
                          className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded transition-colors cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedEstudiantes.has(estudiante.id)}
                            onChange={() => handleSelectEstudiante(estudiante.id)}
                            className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                          />
                          <span className="text-sm text-gray-700">
                            {estudiante.nombre} {estudiante.apellido}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mensajes */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-gap-3 gap-3">
              <FaCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-700 text-sm font-medium">{successMessage}</p>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-gap-3 gap-3">
              <FaExclamationTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm font-medium">{errorMessage}</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleTransfer}
              disabled={loading || selectedEstudiantes.size === 0 || !seccionDestinoID}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  Transferiendo...
                </>
              ) : (
                <>
                  <FaArrowRight className="w-4 h-4" />
                  Transferir ({selectedEstudiantes.size})
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferirEstudiantesSeccionModal;