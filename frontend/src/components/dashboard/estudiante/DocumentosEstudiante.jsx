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

      const documentoExistente = documentos.find(
        (doc) => doc.tipoDocumento === documentoSeleccionado.tipo
      );

      if (documentoExistente) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/documentos/${documentoExistente.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      } else {
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
      }

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-6xl text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Cargando información de documentos...</p>
        </div>
      </div>
    );
  }

  if (error && !estudiante) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-6 max-w-md">
          <p className="text-red-500 text-center">{error}</p>
          <Link
            to="/dashboard"
            className="mt-4 block text-center text-white hover:text-blue-400 transition-colors"
          >
            Volver al Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors mb-4"
        >
          <FaArrowLeft />
          <span>Volver al Dashboard</span>
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <FaFileAlt className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Mis Documentos</h1>
              <p className="text-slate-400">
                {estudiante?.nombre} {estudiante?.apellido}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="space-y-6">
        {/* Mensajes de éxito y error */}
        {successMessage && (
          <div className="bg-green-500/10 border border-green-500 text-green-400 px-4 py-3 rounded-lg flex items-center animate-fade-in">
            <FaCheckCircle className="mr-2" />
            {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg flex items-center animate-fade-in">
            <FaExclamationCircle className="mr-2" />
            {error}
          </div>
        )}

        {/* Documentos Requeridos */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 shadow-xl rounded-2xl border border-slate-700 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <FaFileAlt className="mr-3 text-3xl" />
              Documentos Requeridos
            </h2>
          </div>
          <div className="p-6">
            {loadingDocumentos ? (
              <div className="text-center py-8">
                <FaSpinner className="text-5xl text-blue-400 mx-auto mb-4 animate-spin" />
                <p className="text-slate-300">Cargando documentos...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documentosRequeridos.map((doc, index) => (
                  <div
                    key={index}
                    className={`p-5 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                      doc.subido
                        ? 'bg-emerald-500/10 border-emerald-500'
                        : doc.obligatorio
                        ? 'bg-amber-500/10 border-amber-500'
                        : 'bg-slate-700/30 border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-sm mb-2">
                          {tipoDocumentoFormateado[doc.tipo] || doc.tipo}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            doc.subido
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500'
                              : doc.obligatorio
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500'
                              : 'bg-slate-600/50 text-slate-300 border border-slate-500'
                          }`}
                        >
                          {doc.subido ? (
                            <>
                              <FaCheckCircle className="mr-1" />
                              Subido
                            </>
                          ) : doc.obligatorio ? (
                            <>
                              <FaExclamationCircle className="mr-1" />
                              Requerido
                            </>
                          ) : (
                            'Opcional'
                          )}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenUploadModal(doc)}
                      className={`w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                        doc.subido
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                      }`}
                    >
                      <FaUpload />
                      <span>{doc.subido ? 'Actualizar' : 'Subir'}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Documentos Subidos */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 shadow-xl rounded-2xl border border-slate-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <FaFileAlt className="mr-3 text-3xl" />
              Documentos Subidos
            </h2>
          </div>
          <div className="p-6">
            {documentos.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-6 bg-slate-700/30 rounded-xl border-2 border-dashed border-slate-600">
                  <FaFileAlt className="text-6xl text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-300 text-lg font-medium">No hay documentos registrados</p>
                  <p className="text-slate-400 mt-2">Los documentos aparecerán aquí cuando se suban</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documentos.map((documento, index) => (
                  <div
                    key={documento.id}
                    className="bg-slate-700/30 rounded-xl shadow-lg border border-slate-600 hover:border-blue-500 hover:shadow-2xl transition-all duration-300 overflow-hidden"
                  >
                    {/* Preview del documento */}
                    <div className="bg-slate-800 h-40 flex items-center justify-center border-b border-slate-600">
                      {documento.urlDocumento && documento.urlDocumento.toLowerCase().includes('.pdf') ? (
                        <div className="text-center">
                          <FaFileAlt className="text-6xl text-slate-500 mx-auto mb-2" />
                          <div className="text-xs text-slate-400 font-medium">PDF</div>
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
                          <FaFileAlt className="text-6xl text-slate-500 mx-auto mb-2" />
                          <div className="text-xs text-slate-400 font-medium">ARCHIVO</div>
                        </div>
                      )}
                      <div className="text-center" style={{ display: 'none' }}>
                        <FaFileAlt className="text-6xl text-slate-500 mx-auto mb-2" />
                        <div className="text-xs text-slate-400 font-medium">ARCHIVO</div>
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="text-lg font-bold text-white mb-3 truncate">
                        {documento.tipoDocumento
                          ? tipoDocumentoFormateado[documento.tipoDocumento] || documento.tipoDocumento
                          : 'Documento sin tipo'}
                      </h3>

                      <div className="space-y-2 mb-4">
                        <div className="bg-slate-700/50 rounded-lg p-2.5 border border-slate-600">
                          <div className="text-xs font-medium text-slate-400 mb-1">Fecha de subida</div>
                          <div className="text-sm font-semibold text-white">{formatearFecha(documento.createdAt)}</div>
                        </div>

                        <div className="bg-slate-700/50 rounded-lg p-2.5 border border-slate-600">
                          <div className="text-xs font-medium text-slate-400 mb-1">Estado</div>
                          <div
                            className={`text-sm font-bold ${
                              documento.verificado ? 'text-green-400' : 'text-yellow-400'
                            }`}
                          >
                            {documento.verificado ? 'Verificado' : 'Pendiente de verificación'}
                          </div>
                        </div>

                        {documento.observaciones && (
                          <div className="bg-yellow-500/10 rounded-lg p-2.5 border border-yellow-500/30">
                            <div className="text-xs font-medium text-yellow-400 mb-1">Observaciones</div>
                            <div className="text-sm text-yellow-300">{documento.observaciones}</div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <a
                          href={`${import.meta.env.VITE_API_URL}${documento.urlDocumento}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-slate-600 hover:bg-slate-500 text-white py-2 px-3 rounded-lg text-center text-sm font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                        >
                          <FaEye />
                          Ver
                        </a>
                        <a
                          href={`${import.meta.env.VITE_API_URL}/documentos/${documento.id}/download`}
                          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 px-3 rounded-lg text-center text-sm font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700 max-w-md w-full">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 rounded-t-2xl">
              <h3 className="text-xl font-bold text-white flex items-center">
                <FaUpload className="mr-2" />
                {documentoSeleccionado?.subido ? 'Actualizar Documento' : 'Subir Documento'}
              </h3>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">Tipo de Documento</label>
                <div className="p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/30">
                  <p className="font-semibold text-white">
                    {tipoDocumentoFormateado[documentoSeleccionado?.tipo] || documentoSeleccionado?.tipo}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">Seleccionar Archivo</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {archivoSeleccionado && (
                  <p className="mt-2 text-sm text-green-400 flex items-center">
                    <FaCheckCircle className="mr-2" />
                    {archivoSeleccionado.name}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleUploadDocument}
                  disabled={subiendoDocumento || !archivoSeleccionado}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {subiendoDocumento ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>Subiendo...</span>
                    </>
                  ) : (
                    <>
                      <FaUpload />
                      <span>{documentoSeleccionado?.subido ? 'Actualizar' : 'Subir'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleCloseUploadModal}
                  disabled={subiendoDocumento}
                  className="flex-1 bg-slate-600 hover:bg-slate-500 text-white py-3 px-6 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
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
