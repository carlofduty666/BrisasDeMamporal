import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaMoneyBillWave, FaSpinner } from 'react-icons/fa';
import GestionPagos from '../../pagos/GestionPagos';

const PagosEstudiante = () => {
  const [estudiante, setEstudiante] = useState(null);
  const [annoEscolar, setAnnoEscolar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

        const annoResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/anno-escolar/actual`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setAnnoEscolar(annoResponse.data);

        setLoading(false);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar información. Por favor, intente nuevamente.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-6xl text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Cargando información de pagos...</p>
        </div>
      </div>
    );
  }

  if (error) {
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
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
              <FaMoneyBillWave className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Gestión de Pagos</h1>
              <p className="text-slate-400">
                {estudiante?.nombre} {estudiante?.apellido}
              </p>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg px-4 py-2">
            <p className="text-slate-400 text-sm">Año Escolar</p>
            <p className="text-white font-semibold">{annoEscolar?.periodo}</p>
          </div>
        </div>
      </div>

      {/* Contenedor de GestionPagos */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-xl border border-slate-700 overflow-hidden">
        <GestionPagos
          userType="estudiante"
          personaID={estudiante?.id}
          estudiantes={[]}
          annoEscolar={annoEscolar}
          onSuccess={() => {
            console.log('Pago registrado exitosamente');
          }}
        />
      </div>

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

export default PagosEstudiante;
