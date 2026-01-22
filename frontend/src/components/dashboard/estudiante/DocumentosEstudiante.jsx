import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  FaArrowLeft,
  FaFileAlt,
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle,
  FaUpload,
  FaTimes,
  FaEye,
  FaDownload
} from 'react-icons/fa';
import { tipoDocumentoFormateado, formatearFecha } from '../../../utils/formatters';

const DocumentosEstudiante = () => {
  const [estudiante, setEstudiante] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [documentosRequeridos, setDocumentosRequeridos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDocumentos, setLoadingDocumentos] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [subiendoDocumento, setSubiendoDocumento] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const userData = JSON.parse(atob(token.split('.')[1]));
        const estudianteID = userData.personaID;

        const estudianteResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/personas/${estudianteID}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setEstudiante(estudianteResponse.data);

        const documentosResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/documentos/persona/${estudianteID}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setDocumentos(documentosResponse.data);

        await cargarDocumentosRequeridos(estudianteID, token);

        setLoading(false);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar información. Por favor, intente nuevamente.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const cargarDocumentosRequeridos = async (estudianteID, token) => {
    try {
      setLoadingDocumentos(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/documentos/verificar/${estudianteID}/estudiante`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setDocumentosRequeridos(response.data.documentosRequeridos || []);
      setLoadingDocumentos(false);
    } catch (err) {
      console.error('Error al cargar documentos requeridos:', err);
      setLoadingDocumentos(false);
    }
  };

  const handleOpenUploadModal = (documento) => {
    setDocumentoSeleccionado(documento);
    setShowUploadModal(true);
    setArchivoSeleccionado(null);
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setDocumentoSeleccionado(null);
    setArchivoSeleccionado(null);
    setError('');
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivoSeleccionado(file);
    }
  };

  const handleUploadDocument = async () => {
    if (!archivoSeleccionado) {
      setError('Por favor, seleccione un archivo');
      return;
    }

    try {
      setSubiendoDocumento(true);
      setError('');

      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('documento', archivoSeleccionado);
      formData.append('tipoDocumento', documentoSeleccionado.tipo);
      formData.append('personaID', estudiante.id);

      await axios.post(
        `${import.meta.env.VITE_API_URL}/documentos`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const documentosResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/documentos/persona/${estudiante.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDocumentos(documentosResponse.data);

      await cargarDocumentosRequeridos(estudiante.id, token);

      setSubiendoDocumento(false);
      handleCloseUploadModal();
      setSuccessMessage('Documento subido correctamente');

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error al subir documento:', err);
      setError('Error al subir el documento. Por favor, intente nuevamente.');
      setSubiendoDocumento(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-6xl text-slate-800 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 text-lg">Cargando información de documentos...</p>
        </div>
      </div>
    );
  }

  if (error && !estudiante) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md shadow-sm">
          <p className="text-red-600 text-center">{error}</p>
          <Link
            to="/estudiante/dashboard"
            className="mt-4 block text-center text-slate-700 hover:text-blue-600 transition-colors font-medium"
          >
            Volver al Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <Link
          to="/estudiante/dashboard"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-4"
        >
          <FaArrowLeft />
          <span>Volver al Dashboard</span>
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-200">
              <FaFileAlt className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Mis Documentos</h1>
              <p className="text-slate-500 font-medium">
                {estudiante?.nombre} {estudiante?.apellido}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Mensajes de éxito y error */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center animate-fade-in shadow-sm">
            <FaCheckCircle className="mr-2" />
            {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center animate-fade-in shadow-sm">
            <FaExclamationCircle className="mr-2" />
            {error}
          </div>
        )}

        {/* Documentos Requeridos */}
        <div className="bg-white shadow-md rounded-2xl border border-slate-200 overflow-hidden">
          <div className="bg-white px-6 py-5 border-b border-slate-200 flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <FaFileAlt className="text-amber-500 text-xl" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              Documentos Faltantes
            </h2>
          </div>
          <div className="p-6">
            {loadingDocumentos ? (
              <div className="text-center py-8">
                <FaSpinner className="text-5xl text-blue-500 mx-auto mb-4 animate-spin" />
                <p className="text-slate-500">Cargando documentos...</p>
              </div>
            ) : documentosRequeridos.filter(d => !d.subido).length === 0 ? (
              <div className="text-center py-8 bg-green-50 rounded-xl border border-green-100">
                <FaCheckCircle className="text-5xl text-green-500 mx-auto mb-3" />
                <p className="text-green-700 font-bold text-lg">¡Todos los documentos al día!</p>
                <p className="text-green-600 mt-1">No tienes documentos pendientes por subir.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {documentosRequeridos
                  .filter(doc => !doc.subido)
                  .map((doc, index) => (
                  <div
                    key={index}
                    className="p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-800 text-base mb-2">
                          {tipoDocumentoFormateado[doc.tipo] || doc.tipo}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            doc.obligatorio
                              ? 'bg-amber-100 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {doc.obligatorio ? (
                            <>
                              <FaExclamationCircle className="mr-1.5" />
                              Obligatorio
                            </>
                          ) : (
                            'Opcional'
                          )}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenUploadModal(doc)}
                      className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-sm shadow-blue-200"
                    >
                      <FaUpload />
                      <span>Subir Documento</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Documentos Subidos */}
        <div className="bg-white shadow-md rounded-2xl border border-slate-200 overflow-hidden">
          <div className="bg-white px-6 py-5 border-b border-slate-200 flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FaFileAlt className="text-blue-500 text-xl" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              Documentos Registrados
            </h2>
          </div>
          <div className="p-6">
            {documentos.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                <FaFileAlt className="text-6xl text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg font-medium">No hay documentos registrados</p>
                <p className="text-slate-400 mt-1">Los documentos aparecerán aquí cuando se suban</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documentos.map((documento, index) => (
                  <div
                    key={documento.id}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col"
                  >
                    {/* Preview del documento */}
                    <div className="bg-slate-100 h-40 flex items-center justify-center border-b border-slate-200">
                      {documento.urlDocumento && documento.urlDocumento.toLowerCase().includes('.pdf') ? (
                        <div className="text-center">
                          <FaFileAlt className="text-6xl text-red-400 mx-auto mb-2" />
                          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">PDF</div>
                        </div>
                      ) : documento.urlDocumento &&
                        (documento.urlDocumento.toLowerCase().includes('.jpg') ||
                          documento.urlDocumento.toLowerCase().includes('.jpeg') ||
                          documento.urlDocumento.toLowerCase().includes('.png')) ? (
                        <img
                          src={`${import.meta.env.VITE_API_URL}${documento.urlDocumento}`}
                          alt="Preview del documento"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                      ) : (
                        <div className="text-center">
                          <FaFileAlt className="text-6xl text-slate-300 mx-auto mb-2" />
                          <div className="text-xs text-slate-500 font-bold uppercase">ARCHIVO</div>
                        </div>
                      )}
                      <div className="text-center" style={{ display: 'none' }}>
                        <FaFileAlt className="text-6xl text-slate-300 mx-auto mb-2" />
                        <div className="text-xs text-slate-500 font-bold">ARCHIVO</div>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold text-slate-800 mb-3 truncate">
                        {documento.tipoDocumento
                          ? tipoDocumentoFormateado[documento.tipoDocumento] || documento.tipoDocumento
                          : 'Documento sin tipo'}
                      </h3>

                      <div className="space-y-3 mb-5 flex-1">
                        <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-tight mb-1">Fecha de subida</div>
                          <div className="text-sm font-semibold text-slate-700">{formatearFecha(documento.createdAt)}</div>
                        </div>

                        {/* <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-tight mb-1">Estado</div>
                          <div
                            className={`text-sm font-bold flex items-center gap-1.5 ${
                              documento.verificado ? 'text-green-600' : 'text-amber-600'
                            }`}
                          >
                            {documento.verificado ? (
                              <>
                                <FaCheckCircle />
                                Verificado
                              </>
                            ) : (
                              <>
                                <FaSpinner className="animate-spin text-xs" />
                                Pendiente de verificación
                              </>
                            )}
                          </div>
                        </div> */}

                        {documento.observaciones && (
                          <div className="bg-amber-50 rounded-lg p-2.5 border border-amber-200">
                            <div className="text-xs font-bold text-amber-600 uppercase tracking-tight mb-1">Observaciones</div>
                            <div className="text-sm text-amber-700">{documento.observaciones}</div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-auto">
                        <a
                          href={`${import.meta.env.VITE_API_URL}${documento.urlDocumento}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-3 rounded-lg text-center text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 border border-slate-200"
                        >
                          <FaEye />
                          Ver
                        </a>
                        <a
                          href={`${import.meta.env.VITE_API_URL}/documentos/${documento.id}/download`}
                          className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-3 rounded-lg text-center text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 border border-blue-200"
                        >
                          <FaDownload />
                          Descargar
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Subida de Documentos */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-fade-in">
            <div className="bg-blue-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center">
                <FaUpload className="mr-2" />
                Subir Documento
              </h3>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Tipo de Documento</label>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="font-bold text-blue-800 text-lg">
                    {tipoDocumentoFormateado[documentoSeleccionado?.tipo] || documentoSeleccionado?.tipo}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Seleccionar Archivo</label>
                <div 
                  className="relative group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-full px-4 py-8 bg-slate-50 border-2 border-dashed border-slate-300 text-slate-500 rounded-xl hover:bg-blue-50 hover:border-blue-400 transition-all duration-300 flex flex-col items-center justify-center gap-3">
                    <FaUpload className="text-3xl text-slate-400 group-hover:text-blue-500" />
                    <span className="font-medium text-center">
                      {archivoSeleccionado ? archivoSeleccionado.name : 'Haz clic para seleccionar un archivo'}
                    </span>
                    <span className="text-xs text-slate-400">PDF, JPG o PNG</span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleUploadDocument}
                  disabled={subiendoDocumento || !archivoSeleccionado}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
                >
                  {subiendoDocumento ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>Subiendo...</span>
                    </>
                  ) : (
                    <>
                      <FaUpload />
                      <span>Subir Documento</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleCloseUploadModal}
                  disabled={subiendoDocumento}
                  className="w-full bg-white hover:bg-slate-50 text-slate-600 py-3 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 border border-slate-200"
                >
                  <FaTimes />
                  <span>Cancelar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS para animaciones */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DocumentosEstudiante;
