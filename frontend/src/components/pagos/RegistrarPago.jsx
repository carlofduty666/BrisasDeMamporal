import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const RegistrarPago = () => {
  const { inscripcionId } = useParams();
  const navigate = useNavigate();
  
  const [inscripcion, setInscripcion] = useState(null);
  const [estudiante, setEstudiante] = useState(null);
  const [metodosPago, setMetodosPago] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    metodoPagoID: '',
    referencia: '',
    monto: '',
    fecha: new Date().toISOString().split('T')[0],
    observaciones: ''
  });
  
  const [comprobante, setComprobante] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener datos de la inscripción
        const inscripcionRes = await axios.get(`http://localhost:5000/inscripciones/${inscripcionId}`);
        setInscripcion(inscripcionRes.data);
        
        // Establecer el monto automáticamente
        setFormData(prev => ({
          ...prev,
          monto: inscripcionRes.data.montoInscripcion
        }));
        
        // Obtener datos del estudiante
        const estudianteRes = await axios.get(`http://localhost:5000/personas/${inscripcionRes.data.estudianteID}`);
        setEstudiante(estudianteRes.data);
        
        // Obtener métodos de pago activos
        const metodosPagoRes = await axios.get('http://localhost:5000/metodos-pago/activos');
        setMetodosPago(metodosPagoRes.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos necesarios');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [inscripcionId]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleFileChange = (e) => {
    setComprobante(e.target.files[0]);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!comprobante) {
      setError('Debe adjuntar un comprobante de pago');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('inscripcionID', inscripcionId);
      formDataToSend.append('estudianteID', estudiante.id);
      formDataToSend.append('metodoPagoID', formData.metodoPagoID);
      formDataToSend.append('referencia', formData.referencia);
      formDataToSend.append('monto', formData.monto);
      formDataToSend.append('fecha', formData.fecha);
      formDataToSend.append('observaciones', formData.observaciones);
      formDataToSend.append('comprobante', comprobante);
      formDataToSend.append('arancelID', inscripcion.arancelID || 1); // ID del arancel de inscripción
      
      const response = await axios.post(
        'http://localhost:5000/pagos-estudiantes/registrar',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      setSuccess('Pago registrado correctamente. Será revisado por la administración.');
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate(`/inscripcion/comprobante/${inscripcionId}`);
      }, 2000);
      
    } catch (err) {
      console.error('Error al registrar pago:', err);
      setError(err.response?.data?.message || 'Error al registrar el pago');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Registrar Pago de Inscripción</h1>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="mb-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-lg font-medium text-gray-900">Información del Estudiante</h2>
              <p className="mt-1 text-sm text-gray-600">
                {estudiante?.nombre} {estudiante?.apellido} - C.I.: {estudiante?.cedula}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                Monto a pagar: ${aranceles.find(a => a.id === parseInt(formData.arancelID))?.monto || 'No seleccionado'}
              </p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="arancelID" className="block text-sm font-medium text-gray-700">
                  Arancel
                </label>
                <select
                  id="arancelID"
                  name="arancelID"
                  value={formData.arancelID}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  required
                >
                  <option value="">Seleccione un arancel</option>
                  {aranceles.map(arancel => (
                    <option key={arancel.id} value={arancel.id}>
                      {arancel.nombre} - ${arancel.monto}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="metodoPagoID" className="block text-sm font-medium text-gray-700">
                  Método de Pago
                </label>
                <select
                  id="metodoPagoID"
                  name="metodoPagoID"
                  value={formData.metodoPagoID}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  required
                >
                  <option value="">Seleccione un método de pago</option>
                  {metodosPago.map(metodo => (
                    <option key={metodo.id} value={metodo.id}>
                      {metodo.nombre}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="referencia" className="block text-sm font-medium text-gray-700">
                  Referencia / Nº de Transacción
                </label>
                <input
                  type="text"
                  name="referencia"
                  id="referencia"
                  value={formData.referencia}
                  onChange={handleChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="comprobante" className="block text-sm font-medium text-gray-700">
                  Comprobante de Pago
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
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
                    <p className="text-xs text-gray-500">PNG, JPG, PDF hasta 10MB</p>
                    {comprobante && (
                      <p className="text-sm text-indigo-600 mt-2">
                        Archivo seleccionado: {comprobante.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700">
                  Observaciones
                </label>
                <textarea
                  id="observaciones"
                  name="observaciones"
                  rows={3}
                  value={formData.observaciones}
                  onChange={handleChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              <div className="flex justify-between pt-5">
                <Link
                  to={`/inscripcion/comprobante/${inscripcionId}`}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    submitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {submitting ? 'Registrando...' : 'Registrar Pago'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrarPago;
