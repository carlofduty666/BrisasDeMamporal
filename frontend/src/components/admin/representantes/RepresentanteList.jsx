import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaEye,
  FaTrash,
  FaUserPlus,
  FaSearch,
  FaFilter,
  FaDownload,
  FaUsers,
  FaList,
  FaTh,
  FaCheckCircle,
  FaExclamationCircle,
} from 'react-icons/fa';
import { formatearCedula } from '../../../utils/formatters';

const RepresentanteList = () => {
  const [representantes, setRepresentantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRepresentantes, setFilteredRepresentantes] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'cards'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [filters, setFilters] = useState({
    conEstudiantes: false,
    sinEstudiantes: false,
    pagosAlDia: false,
    pagosPendientes: false,
  });

  const navigate = useNavigate();

  // Estado para confirmación de eliminación
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, name: '' });
  const askDelete = (id, name) => setConfirmDelete({ open: true, id, name });

  // Cargar representantes con información adicional
  useEffect(() => {
    const fetchRepresentantes = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { tipo: 'representante' },
          }
        );

        let representantesData = [];
        if (Array.isArray(response.data)) {
          representantesData = response.data.filter((p) => p.tipo === 'representante');
        } else if (response.data && response.data.id) {
          if (response.data.tipo === 'representante') {
            representantesData = [response.data];
          }
        }

        // Enriquecer con estudiantes y estado de pagos
        const representantesConInfo = await Promise.all(
          representantesData.map(async (representante) => {
            try {
              const estudiantesResponse = await axios.get(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas/representante/${representante.id}/estudiantes`,
                { headers: { Authorization: `Bearer ${token}` } }
              );

              let pagosAlDia = true;
              if (estudiantesResponse.data.length > 0) {
                for (const estudiante of estudiantesResponse.data) {
                  const pagosResponse = await axios.get(
                    `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/pagos/estudiante/${estudiante.id}/estado`,
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  if (!pagosResponse.data.alDia) {
                    pagosAlDia = false;
                    break;
                  }
                }
              }

              return {
                ...representante,
                estudiantes: estudiantesResponse.data,
                cantidadEstudiantes: estudiantesResponse.data.length,
                pagosAlDia,
                nombreCompleto: `${representante.nombre} ${representante.apellido}`,
              };
            } catch (err) {
              console.error(
                `Error al obtener información adicional para representante ${representante.id}:`,
                err
              );
              return {
                ...representante,
                estudiantes: [],
                cantidadEstudiantes: 0,
                pagosAlDia: true,
                nombreCompleto: `${representante.nombre} ${representante.apellido}`,
              };
            }
          })
        );

        setRepresentantes(representantesConInfo);
        setFilteredRepresentantes(representantesConInfo);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar representantes:', err);
        setError('Error al cargar la lista de representantes. Por favor, intente nuevamente.');
        setRepresentantes([]);
        setFilteredRepresentantes([]);
        setLoading(false);
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    fetchRepresentantes();
  }, [navigate]);

  // Búsqueda y filtros
  useEffect(() => {
    let result = representantes;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (rep) =>
          rep.nombre?.toLowerCase().includes(q) ||
          rep.apellido?.toLowerCase().includes(q) ||
          rep.cedula?.toLowerCase().includes(q) ||
          rep.email?.toLowerCase().includes(q) ||
          rep.telefono?.includes(searchTerm) ||
          rep.nombreCompleto?.toLowerCase().includes(q)
      );
    }

    if (filters.conEstudiantes) {
      result = result.filter((rep) => rep.cantidadEstudiantes > 0);
    }
    if (filters.sinEstudiantes) {
      result = result.filter((rep) => rep.cantidadEstudiantes === 0);
    }
    if (filters.pagosAlDia) {
      result = result.filter((rep) => rep.pagosAlDia);
    }
    if (filters.pagosPendientes) {
      result = result.filter((rep) => !rep.pagosAlDia);
    }

    setCurrentPage(1); // reset paginación al filtrar/buscar
    setFilteredRepresentantes(result);
  }, [searchTerm, filters, representantes]);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleFilterChange = (e) => {
    const { name, checked } = e.target;
    setFilters((prev) => ({ ...prev, [name]: checked }));
  };

  const handleDeleteRepresentante = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRepresentantes((prev) => prev.filter((rep) => rep.id !== id));
      setFilteredRepresentantes((prev) => prev.filter((rep) => rep.id !== id));
      setSuccessMessage('Representante eliminado correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error al eliminar representante:', err);
      setError(
        err.response?.data?.message || 'Error al eliminar el representante. Por favor, intente nuevamente.'
      );
    } finally {
      setConfirmDelete({ open: false, id: null, name: '' });
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Cédula',
      'Nombre',
      'Apellido',
      'Email',
      'Teléfono',
      'Dirección',
      'Profesión',
      'Estudiantes',
      'Pagos al día',
    ];
    const csvData = [
      headers.join(','),
      ...filteredRepresentantes.map((rep) =>
        [
          rep.cedula || '',
          rep.nombre || '',
          rep.apellido || '',
          rep.email || '',
          rep.telefono || '',
          (rep.direccion || '').replace(/,/g, ' '),
          (rep.profesion || '').replace(/,/g, ' '),
          rep.cantidadEstudiantes ?? 0,
          rep.pagosAlDia ? 'Sí' : 'No',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'representantes.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRepresentantes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRepresentantes.length / itemsPerPage) || 1;

  // Stats
  const totalRepresentantes = filteredRepresentantes.length;
  const totalConEstudiantes = filteredRepresentantes.filter((p) => p.cantidadEstudiantes > 0).length;
  const totalAlDia = filteredRepresentantes.filter((p) => p.pagosAlDia).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-slate-50 to-violet-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-violet-200 border-top border-t-violet-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-violet-500/10 animate-pulse"></div>
          </div>
          <p className="mt-4 text-violet-600 font-medium">Cargando representantes...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-800 to-violet-900 shadow-2xl rounded-2xl mb-8">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/30 to-transparent"></div>

        {/* Decorativos */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-violet-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-violet-300/10 rounded-full blur-2xl"></div>

        <div className="relative px-6 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-violet-500/20 rounded-xl backdrop-blur-sm border border-violet-400/30">
                  <FaUsers className="w-8 h-8 text-violet-200" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">Gestión de Representantes</h1>
                  <p className="text-violet-200 text-lg">Administra los representantes de estudiantes</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-violet-200 text-sm font-medium">Total Representantes</p>
                      <p className="text-2xl font-bold text-white">{totalRepresentantes}</p>
                    </div>
                    <FaUsers className="w-8 h-8 text-violet-300" />
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-violet-200 text-sm font-medium">Con Estudiantes</p>
                      <p className="text-2xl font-bold text-white">{totalConEstudiantes}</p>
                    </div>
                    <FaTh className="w-8 h-8 text-violet-300" />
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-violet-200 text-sm font-medium">Pagos al día</p>
                      <p className="text-2xl font-bold text-white">{totalAlDia}</p>
                    </div>
                    <FaCheckCircle className="w-8 h-8 text-violet-300" />
                  </div>
                </div>
              </div>
            </div>

            {/* Botón acción */}
            <div className="mt-8 lg:mt-0 lg:ml-8">
              <Link
                to="/inscripcion/nuevo-estudiante?from=representantes"
                className="inline-flex items-center px-8 py-4 bg-white/20 backdrop-blur-md text-white font-semibold rounded-2xl border border-white/30 hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <FaUserPlus className="w-5 h-5 mr-3" />
                Nuevo Representante
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mensajes */}
      {successMessage && (
        <div className="bg-violet-50 border-l-4 border-violet-500 text-violet-700 p-4 mb-6 rounded-r-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-violet-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Controles */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Buscar por nombre, cédula, email o teléfono..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <FaFilter className="mr-2" /> Filtros
            </button>

            <button
              onClick={() => setViewMode('list')}
              className={`inline-flex items-center px-3 py-2 rounded-lg border text-sm ${
                viewMode === 'list'
                  ? 'bg-violet-700/90 text-white border-violet-700/90 backdrop-blur-md'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
              title="Ver como lista"
            >
              <FaList className="mr-2" /> Lista
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`inline-flex items-center px-3 py-2 rounded-lg border text-sm ${
                viewMode === 'cards'
                  ? 'bg-violet-700/90 text-white border-violet-700/90 backdrop-blur-md'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
              title="Ver como tarjetas"
            >
              <FaTh className="mr-2" /> Tarjetas
            </button>

            <button
              onClick={exportToCSV}
              className="inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <FaDownload className="mr-2" /> Exportar CSV
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Filtrar por:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <label className="flex items-center gap-2">
                <input
                  id="conEstudiantes"
                  name="conEstudiantes"
                  type="checkbox"
                  checked={filters.conEstudiantes}
                  onChange={handleFilterChange}
                  className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Con estudiantes</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  id="sinEstudiantes"
                  name="sinEstudiantes"
                  type="checkbox"
                  checked={filters.sinEstudiantes}
                  onChange={handleFilterChange}
                  className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Sin estudiantes</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  id="pagosAlDia"
                  name="pagosAlDia"
                  type="checkbox"
                  checked={filters.pagosAlDia}
                  onChange={handleFilterChange}
                  className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Pagos al día</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  id="pagosPendientes"
                  name="pagosPendientes"
                  type="checkbox"
                  checked={filters.pagosPendientes}
                  onChange={handleFilterChange}
                  className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Pagos pendientes</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Listado */}
      {filteredRepresentantes.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-500">No se encontraron representantes con los criterios de búsqueda.</p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white shadow overflow-hidden rounded-2xl border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-violet-600 to-violet-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Cédula</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Contacto</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Estudiantes</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Pagos</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((representante) => (
                  <tr key={representante.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">V - {formatearCedula(representante.cedula)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {representante.nombre} {representante.apellido}
                      </div>
                      <div className="text-sm text-gray-500">{representante.profesion || 'Profesión: no especificada'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{representante.email || '—'}</div>
                      <div className="text-sm text-gray-500">{representante.telefono || '—'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {representante.cantidadEstudiantes} estudiante(s)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          representante.pagosAlDia ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {representante.pagosAlDia ? 'Al día' : 'Pendientes'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/representantes/${representante.id}`}
                          className="inline-flex items-center px-3 py-2 border border-violet-300 rounded-lg text-sm font-medium text-violet-700 bg-violet-50 hover:bg-violet-100 transition-colors duration-200"
                          title="Ver detalles"
                        >
                          <FaEye className="w-4 h-4" />
                        </Link>
                        {representante.cantidadEstudiantes === 0 && (
                          <button
                            onClick={() => askDelete(representante.id, `${representante.nombre} ${representante.apellido}`)}
                            className="inline-flex items-center px-3 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors duration-200"
                            title="Eliminar"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Cards view
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentItems.map((rep) => (
            <div key={rep.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {rep.nombre} {rep.apellido}
                  </h3>
                  <p className="text-sm text-gray-500">C.I.: V - {formatearCedula(rep.cedula)}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                    rep.pagosAlDia ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {rep.pagosAlDia ? (
                    <><FaCheckCircle /> Al día</>
                  ) : (
                    <><FaExclamationCircle /> Pendiente</>
                  )}
                </span>
              </div>

              <div className="mt-3 text-sm text-gray-600 space-y-1">
                <p>Email: {rep.email || '—'}</p>
                <p>Teléfono: {rep.telefono || '—'}</p>
                <p>Profesión: {rep.profesion || '—'}</p>
              </div>

              <div className="mt-3 flex items-center gap-2 text-sm">
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-violet-50 text-violet-700 border border-violet-100">
                  {rep.cantidadEstudiantes} estudiante(s)
                </span>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Link
                  to={`/admin/representantes/${rep.id}`}
                  className="inline-flex items-center px-3 py-2 border border-violet-300 rounded-lg text-sm font-medium text-violet-700 bg-violet-50 hover:bg-violet-100 transition-colors duration-200"
                >
                  <FaEye className="mr-2" /> Ver
                </Link>
                {rep.cantidadEstudiantes === 0 && (
                  <button
                    onClick={() => askDelete(rep.id, `${rep.nombre} ${rep.apellido}`)}
                    className="inline-flex items-center px-3 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors duration-200"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {filteredRepresentantes.length > itemsPerPage && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{currentItems.length}</span> de{' '}
            <span className="font-medium">{filteredRepresentantes.length}</span> representantes
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 rounded-md border bg-white hover:bg-gray-50 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            <span className="text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </span>
            <button
              className="px-3 py-1 rounded-md border bg-white hover:bg-gray-50 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
      {/* Toast flotante de éxito */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="flex items-start gap-3 bg-white shadow-xl border border-green-200 rounded-xl px-4 py-3 min-w-[280px]">
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{successMessage}</p>
              <p className="text-xs text-gray-500 mt-0.5">Se ha eliminado correctamente.</p>
            </div>
            <button
              onClick={() => setSuccessMessage('')}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {confirmDelete.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setConfirmDelete({ open: false, id: null, name: '' })}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md mx-4 animate-fadeIn">
            <div className="px-6 py-5">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="h-6 w-6 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M5.455 19h13.09A2.455 2.455 0 0021 16.545V7.455A2.455 2.455 0 0018.545 5H5.455A2.455 2.455 0 003 7.455v9.09A2.455 2.455 0 005.455 19z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Confirmar eliminación</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    ¿Seguro que deseas eliminar al representante <span className="font-medium">{confirmDelete.name}</span>? Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => setConfirmDelete({ open: false, id: null, name: '' })}
                  className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDeleteRepresentante(confirmDelete.id)}
                  className="inline-flex items-center px-4 py-2 rounded-lg border border-red-300 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepresentanteList;