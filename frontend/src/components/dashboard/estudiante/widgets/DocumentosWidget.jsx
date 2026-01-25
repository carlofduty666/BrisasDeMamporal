import { FaFileAlt, FaCheckCircle, FaTimesCircle, FaDownload, FaEye, FaExclamationTriangle } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DocumentosWidget = ({ documentos, estudianteID }) => {
  const navigate = useNavigate();
  const [documentosRequeridos, setDocumentosRequeridos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocumentosRequeridos = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/documentos/verificar/${estudianteID}/estudiante`
        );
        setDocumentosRequeridos(response.data.documentosRequeridos || []);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar documentos requeridos:', error);
        setLoading(false);
      }
    };

    if (estudianteID) {
      fetchDocumentosRequeridos();
    }
  }, [estudianteID]);

  const handlePreview = (docId) => {
    window.open(`${import.meta.env.VITE_API_URL}/documentos/${docId}/preview`, '_blank');
  };

  const handleDownload = (docId, nombreArchivo) => {
    window.open(`${import.meta.env.VITE_API_URL}/documentos/${docId}/download`, '_blank');
  };

  const documentosSubidos = documentos.length;
  const documentosFaltantes = documentosRequeridos.filter(doc => !doc.subido && doc.obligatorio).length;
  const porcentajeCompletado = documentosRequeridos.length > 0 
    ? ((documentosRequeridos.filter(doc => doc.subido).length / documentosRequeridos.length) * 100).toFixed(0)
    : 0;

  const getTipoIcono = (tipo) => {
    return <FaFileAlt className="text-blue-400" />;
  };

  const formatFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-VE', { 
      day: '2-digit', 
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTamano = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
      {/* Header */}
      <div className="bg-slate-800 px-6 py-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <FaFileAlt className="text-2xl text-white" />
          <h2 className="text-xl font-bold text-white">Documentos</h2>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Estadísticas de Documentos */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <FaCheckCircle className="text-green-500 text-sm" />
              <p className="text-slate-600 text-xs">Subidos</p>
            </div>
            <p className="text-2xl font-bold text-green-600">{documentosSubidos}</p>
          </div>

          <div className="bg-red-50 rounded-lg p-3 border border-red-200">
            <div className="flex items-center gap-2 mb-1">
              <FaTimesCircle className="text-red-500 text-sm" />
              <p className="text-slate-600 text-xs">Faltantes</p>
            </div>
            <p className="text-2xl font-bold text-red-600">{documentosFaltantes}</p>
          </div>
        </div>

        {/* Barra de Progreso */}
        <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-600 text-sm">Progreso de Documentación</p>
            <span className="text-slate-800 font-semibold text-sm">{porcentajeCompletado}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ease-out ${
                porcentajeCompletado >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                porcentajeCompletado >= 50 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                'bg-gradient-to-r from-red-500 to-red-600'
              }`}
              style={{ width: `${porcentajeCompletado}%` }}
            />
          </div>
        </div>

        {/* Alerta de Documentos Faltantes */}
        {documentosFaltantes > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
            <FaExclamationTriangle className="text-yellow-500 text-lg flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-700 text-sm font-semibold">
                Documentos Pendientes
              </p>
              <p className="text-yellow-600 text-xs mt-1">
                Tienes {documentosFaltantes} documento{documentosFaltantes !== 1 ? 's' : ''} obligatorio{documentosFaltantes !== 1 ? 's' : ''} pendiente{documentosFaltantes !== 1 ? 's' : ''}. Contacta a tu representante.
              </p>
            </div>
          </div>
        )}

        {/* Lista de Documentos Subidos */}
        {documentos && documentos.length > 0 ? (
          <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
            <p className="text-slate-600 text-xs font-semibold mb-2">Documentos Subidos:</p>
            {documentos.map((doc, index) => (
              <div
                key={index}
                className="bg-slate-50 rounded-lg p-3 border border-slate-200 transition-all duration-300 hover:bg-white hover:border-indigo-500 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    {getTipoIcono(doc.tipoDocumento)}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-slate-800 text-xs font-semibold truncate">
                        {doc.tipoDocumento || 'Documento'}
                      </h4>
                      <p className="text-slate-500 text-xs truncate" title={doc.nombre_archivo}>
                        {doc.nombre_archivo}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-slate-400 text-xs">
                          {formatTamano(doc.tamano)}
                        </span>
                        <span className="text-slate-400 text-xs">•</span>
                        <span className="text-slate-400 text-xs">
                          {formatFecha(doc.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => handlePreview(doc.id)}
                      className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded transition-colors"
                      title="Ver documento"
                    >
                      <FaEye className="text-xs" />
                    </button>
                    <button
                      onClick={() => handleDownload(doc.id, doc.nombre_archivo)}
                      className="p-2 bg-green-50 hover:bg-green-100 text-green-600 rounded transition-colors"
                      title="Descargar"
                    >
                      <FaDownload className="text-xs" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-slate-50 rounded-lg border border-slate-200">
            <FaFileAlt className="text-4xl text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">No hay documentos subidos</p>
          </div>
        )}

        {/* Lista de Documentos Requeridos */}
        {!loading && documentosRequeridos.length > 0 && (
          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-slate-600 text-xs font-semibold mb-2">Estado de Documentos Requeridos:</p>
            <div className="space-y-1">
              {documentosRequeridos.map((doc, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className={doc.subido ? 'text-slate-400 line-through' : 'text-slate-600'}>
                    {doc.nombre}
                  </span>
                  {doc.subido ? (
                    <FaCheckCircle className="text-green-500 text-xs" />
                  ) : (
                    <FaTimesCircle className={doc.obligatorio ? 'text-red-500 text-xs' : 'text-slate-400 text-xs'} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Estilo para scrollbar */}
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

      {/* Botón Ir a Documentos */}
      <div className="px-6 pb-6">
        <button
          onClick={() => navigate(`/estudiante/${estudianteID}`)}
          className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 border border-slate-600"
        >
          <FaEye className="text-lg" />
          Ver Todos los Documentos
        </button>
      </div>
    </div>
  );
};

export default DocumentosWidget;
