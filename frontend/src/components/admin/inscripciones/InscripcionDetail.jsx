import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaEdit, FaCheck, FaTimes, FaFileDownload, FaMoneyBillWave, FaUserGraduate } from 'react-icons/fa';
import { formatearFecha } from '../../../utils/formatters';
import AdminLayout from '../layout/AdminLayout'

const InscripcionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [inscripcion, setInscripcion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estados para edición
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    gradoID: '',
    seccionID: '',
    observaciones: '',
    estado: ''
  });
  
  // Estados para datos adicionales
  const [grados, setGrados] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [seccionesFiltradas, setSeccionesFiltradas] = useState([]);
  const [documentosEstudiante, setDocumentosEstudiante] = useState([]);
  
  // Cargar datos de la inscripción
  useEffect(() => {
    const fetchInscripcion = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/login');
          return;
        }
        
        const config = {
          headers: { 'Authorization': `Bearer ${token}` }
        };
        
        // Obtener detalles de la inscripción
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/inscripciones/${id}`,
          config
        );
        
        setInscripcion(response.data);
        
        // Inicializar datos de edición
        setEditData({
          gradoID: response.data.gradoID,
          seccionID: response.data.seccionID,
          observaciones: response.data.observaciones || '',
          estado: response.data.estado
        });
        
        // Obtener grados
        const gradosResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados`,
          config
        );
        setGrados(gradosResponse.data);
        
        // Obtener secciones
        const seccionesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/secciones`,
          config
        );
        setSecciones(seccionesResponse.data);
        
        // Filtrar secciones por grado seleccionado
        const seccionesPorGrado = seccionesResponse.data.filter(
          seccion => seccion.gradoID === response.data.gradoID
        );
        setSeccionesFiltradas(seccionesPorGrado);
        
        // Obtener documentos del estudiante
        if (response.data.estudiante) {
          const documentosResponse = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/persona/${response.data.estudiante.id}`,
            config
          );
          setDocumentosEstudiante(documentosResponse.data);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar inscripción:', err);
        setError('Error al cargar los datos de la inscripción. Por favor, intente nuevamente.');
        setLoading(false);
        
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };
    
    fetchInscripcion();
  }, [id, navigate]);
  
  // Filtrar secciones cuando cambia el grado
  useEffect(() => {
    if (isEditing && editData.gradoID) {
      const seccionesPorGrado = secciones.filter(
        seccion => seccion.gradoID === parseInt(editData.gradoID)
      );
      setSeccionesFiltradas(seccionesPorGrado);
      
      // Si la sección actual no pertenece al grado seleccionado, resetear
      if (!seccionesPorGrado.some(seccion => seccion.id === parseInt(editData.seccionID))) {
        setEditData(prev => ({ ...prev, seccionID: '' }));
      }
    }
  }, [editData.gradoID, isEditing, secciones]);
  
  // Manejar cambios en el formulario de edición
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };
  
  // Guardar cambios
  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      
      // Actualizar inscripción
      await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/inscripciones/${id}/estado`,
        editData,
        config
      );
      
      // Actualizar estado de inscripción si cambió
      if (editData.estado !== inscripcion.estado) {
        await axios.put(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/inscripciones/${id}/estado`,
          { estado: editData.estado, observaciones: editData.observaciones },
          config
        );
      }
      
      // Recargar datos
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/inscripciones/${id}`,
        config
      );
      
      setInscripcion(response.data);
      setIsEditing(false);
      setSuccess('Inscripción actualizada correctamente');
      
      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
      setLoading(false);
    } catch (err) {
      console.error('Error al guardar cambios:', err);
      setError('Error al guardar los cambios. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };
  
  // Cancelar edición
  const handleCancelEdit = () => {
    setEditData({
      gradoID: inscripcion.gradoID,
      seccionID: inscripcion.seccionID,
      observaciones: inscripcion.observaciones || '',
      estado: inscripcion.estado
    });
    setIsEditing(false);
  };
  
  // Aprobar inscripción
  const handleAprobarInscripcion = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      
      // Actualizar estado de inscripción
      await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/inscripciones/${id}/estado`,
        { estado: 'aprobado', observaciones: 'Inscripción aprobada por administrador' },
        config
      );
      
      // Recargar datos
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/inscripciones/${id}`,
        config
      );
      
      setInscripcion(response.data);
      setSuccess('Inscripción aprobada correctamente');
      
      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
      setLoading(false);
    } catch (err) {
      console.error('Error al aprobar inscripción:', err);
      setError('Error al aprobar la inscripción. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };
  
  // Rechazar inscripción
  const handleRechazarInscripcion = async () => {
    const motivo = prompt('Ingrese el motivo del rechazo:');
    if (!motivo) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      
      // Actualizar estado de inscripción
      await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/inscripciones/${id}/estado`,
        { estado: 'rechazado', observaciones: `Rechazado: ${motivo}` },
        config
      );
      
      // Recargar datos
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/inscripciones/${id}`,
        config
      );
      
      setInscripcion(response.data);
      setSuccess('Inscripción rechazada');
      
      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
      setLoading(false);
    } catch (err) {
      console.error('Error al rechazar inscripción:', err);
      setError('Error al rechazar la inscripción. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };
  
  // Descargar documento
  const handleDownloadDocument = async (documentoId) => {
    try {
      const token = localStorage.getItem('token');
      
      // Realizar solicitud para descargar el documento
      window.open(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/download/${documentoId}?token=${token}`,
        '_blank'
      );
    } catch (err) {
      console.error('Error al descargar documento:', err);
      setError('Error al descargar el documento. Por favor, intente nuevamente.');
    }
  };
  
  // Registrar pago
  const handleRegistrarPago = () => {
    navigate(`/admin/pagos/nuevo?inscripcionID=${id}`);
  };
  
  // Obtener color según estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'inscrito':
        return 'bg-green-100 text-green-800';
      case 'aprobado':
        return 'bg-green-100 text-green-800';
      case 'rechazado':
        return 'bg-red-100 text-red-800';
      case 'retirado':
        return 'bg-gray-100 text-gray-800';
      case 'graduado':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Obtener el nombre del grado
  const getNombreGrado = (gradoID) => {
    const grado = grados.find(g => g.id === gradoID);
    return grado ? grado.nombre_grado.replace(/_/g, ' ') : 'No asignado';
  };
  
  // Obtener el nombre de la sección
  const getNombreSeccion = (seccionID) => {
    const seccion = secciones.find(s => s.id === seccionID);
    return seccion ? seccion.nombre_seccion : 'No asignada';
  };
  
  if (loading && !inscripcion) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (error && !inscripcion) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaTimes className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate('/admin/inscripciones')}
          className="flex items-center text-indigo-600 hover:text-indigo-900"
        >
          <FaArrowLeft className="mr-2" /> Volver a la lista
        </button>
      </div>
    );
  }
  
  return (
    <AdminLayout>
    <div className="container mx-auto px-4 py-8">
      {/* Botón de volver y título */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/admin/inscripciones')}
            className="mr-4 flex items-center text-indigo-600 hover:text-indigo-900"
          >
            <FaArrowLeft className="mr-2" /> Volver
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            Detalles de Inscripción #{inscripcion?.id}
          </h1>
        </div>
        
        {/* Botones de acción */}
        <div className="flex space-x-2">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FaEdit className="mr-2" /> Editar
              </button>
              
              {inscripcion?.estado === 'pendiente' && (
                <>
                  <button
                    onClick={handleAprobarInscripcion}
                    className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    disabled={loading}
                  >
                    <FaCheck className="mr-2" /> Aprobar
                  </button>
                  
                  <button
                    onClick={handleRechazarInscripcion}
                    className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    disabled={loading}
                  >
                    <FaTimes className="mr-2" /> Rechazar
                  </button>
                </>
              )}
              
              {!inscripcion?.pagoInscripcionCompletado && (
                <button
                  onClick={handleRegistrarPago}
                  className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FaMoneyBillWave className="mr-2" /> Registrar Pago
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={handleSaveChanges}
                className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={loading}
              >
                <FaCheck className="mr-2" /> Guardar
              </button>
              
              <button
                onClick={handleCancelEdit}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={loading}
              >
                <FaTimes className="mr-2" /> Cancelar
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Mensajes de éxito o error */}
      {success && (
        <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaCheck className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaTimes className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Información de la inscripción */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Información de la Inscripción
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Detalles y estado actual de la inscripción.
          </p>
        </div>
        
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Código de Inscripción</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                #{inscripcion?.id}
              </dd>
            </div>
            
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Fecha de Inscripción</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatearFecha(inscripcion?.fechaInscripcion)}
              </dd>
            </div>
            
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Estado</dt>
              <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <select
                    name="estado"
                    value={editData.estado}
                    onChange={handleEditChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="pendiente">Pendiente</option>
                    {/* <option value="inscrito">Inscrito</option> */}
                    <option value="aprobado">Aprobado</option>
                    <option value="rechazado">Rechazado</option>
                    <option value="retirado">Retirado</option>
                    <option value="graduado">Graduado</option>
                  </select>
                ) : (
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(inscripcion?.estado)}`}>
                    {inscripcion?.estado.charAt(0).toUpperCase() + inscripcion?.estado.slice(1)}
                  </span>
                )}
              </dd>
            </div>
            
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Grado</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <select
                    name="gradoID"
                    value={editData.gradoID}
                    onChange={handleEditChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Seleccione un grado</option>
                    {grados.map(grado => (
                      <option key={grado.id} value={grado.id}>
                        {grado.nombre_grado.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                ) : (
                  getNombreGrado(inscripcion?.gradoID)
                )}
              </dd>
            </div>
            
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Sección</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <select
                    name="seccionID"
                    value={editData.seccionID}
                    onChange={handleEditChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    disabled={!editData.gradoID}
                  >
                    <option value="">Seleccione una sección</option>
                    {seccionesFiltradas.map(seccion => (
                      <option key={seccion.id} value={seccion.id}>
                        {seccion.nombre_seccion}
                      </option>
                    ))}
                  </select>
                ) : (
                  getNombreSeccion(inscripcion?.seccionID)
                )}
              </dd>
            </div>
            
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Documentos Completos</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {inscripcion?.documentosCompletos ? (
                  <span className="text-green-600 flex items-center">
                    <FaCheck className="mr-1" /> Completos
                  </span>
                ) : (
                  <span className="text-yellow-600 flex items-center">
                    <FaTimes className="mr-1" /> Pendientes
                  </span>
                )}
              </dd>
            </div>
            
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Pago de Inscripción</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {inscripcion?.pagoInscripcionCompletado ? (
                  <span className="text-green-600 flex items-center">
                    <FaCheck className="mr-1" /> Pagado
                  </span>
                ) : (
                  <span className="text-yellow-600 flex items-center">
                    <FaTimes className="mr-1" /> Pendiente
                  </span>
                )}
              </dd>
            </div>
            
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Observaciones</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <textarea
                    name="observaciones"
                    value={editData.observaciones}
                    onChange={handleEditChange}
                    rows="3"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  ></textarea>
                ) : (
                  inscripcion?.observaciones || 'Sin observaciones'
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      
      {/* Información del estudiante */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Información del Estudiante
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Datos personales del estudiante.
          </p>
        </div>
        
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Nombre Completo</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {inscripcion?.estudiante?.nombre} {inscripcion?.estudiante?.apellido}
              </dd>
            </div>
            
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Cédula/Documento</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {inscripcion?.estudiante?.cedula}
              </dd>
            </div>
            
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Fecha de Nacimiento</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatearFecha(inscripcion?.estudiante?.fechaNacimiento)}
              </dd>
            </div>
            
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Género</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {inscripcion?.estudiante?.genero === 'M' ? 'Masculino' : 'Femenino'}
              </dd>
            </div>
            
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Dirección</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {inscripcion?.estudiante?.direccion}
              </dd>
            </div>
            
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Acciones</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <Link
                  to={`/admin/estudiantes/${inscripcion?.estudiante?.id}`}
                  className="text-indigo-600 hover:text-indigo-900 flex items-center"
                >
                  <FaUserGraduate className="mr-1" /> Ver perfil completo
                </Link>
              </dd>
            </div>
          </dl>
        </div>
      </div>
      
      {/* Información del representante */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Información del Representante
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Datos personales del representante.
          </p>
        </div>
        
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Nombre Completo</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {inscripcion?.representante?.nombre} {inscripcion?.representante?.apellido}
              </dd>
            </div>
            
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Cédula/Documento</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {inscripcion?.representante?.cedula}
              </dd>
            </div>
            
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {inscripcion?.representante?.telefono}
              </dd>
            </div>
            
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {inscripcion?.representante?.email}
              </dd>
            </div>
            
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Dirección</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {inscripcion?.representante?.direccion}
              </dd>
            </div>
            
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Acciones</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <Link
                  to={`/admin/representantes/${inscripcion?.representante?.id}`}
                  className="text-indigo-600 hover:text-indigo-900 flex items-center"
                >
                  <FaUserGraduate className="mr-1" /> Ver perfil completo
                </Link>
              </dd>
            </div>
          </dl>
        </div>
      </div>
      
      {/* Documentos del estudiante */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Documentos del Estudiante
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Documentos cargados por el estudiante.
          </p>
        </div>
        
        <div className="border-t border-gray-200">
          {documentosEstudiante.length === 0 ? (
            <div className="px-4 py-5 text-sm text-gray-500">
              No hay documentos cargados.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {documentosEstudiante.map(documento => (
                <li key={documento.id} className="px-4 py-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {documento.nombre_archivo}
                    </p>
                    <p className="text-sm text-gray-500">
                      {documento.descripcion || 'Sin descripción'}
                    </p>
                    <p className="text-xs text-gray-400">
                      Subido el {formatearFecha(documento.createdAt)}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <button
                      onClick={() => handleDownloadDocument(documento.id)}
                      className="font-medium text-indigo-600 hover:text-indigo-500 flex items-center"
                    >
                      <FaFileDownload className="mr-1" /> Descargar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      {/* Pagos realizados */}
      {inscripcion?.pagos && inscripcion.pagos.length > 0 && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Pagos Realizados
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Historial de pagos asociados a esta inscripción.
            </p>
          </div>
          
          <div className="border-t border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Concepto
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Método de Pago
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referencia
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inscripcion.pagos.map(pago => (
                  <tr key={pago.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatearFecha(pago.fecha)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {pago.arancel?.nombre || 'Pago de inscripción'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pago.metodoPago?.nombre || 'No especificado'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pago.referencia || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      ${pago.monto.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        pago.estado === 'procesado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {pago.estado.charAt(0).toUpperCase() + pago.estado.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
    </AdminLayout>
  );
};

export default InscripcionDetail;
