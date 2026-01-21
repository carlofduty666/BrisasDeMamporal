import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  FaUser,
  FaGraduationCap,
  FaChartLine,
  FaTasks,
  FaChalkboardTeacher,
  FaFileAlt,
  FaMoneyBillWave,
  FaSpinner,
  FaSignOutAlt
} from 'react-icons/fa';
import InfoAcademica from './estudiante/InfoAcademica';
import CalificacionesResumen from './estudiante/CalificacionesResumen';
import EvaluacionesWidget from './estudiante/EvaluacionesWidget';
import ProgresoAcademico from './estudiante/ProgresoAcademico';
import ProfesoresWidget from './estudiante/ProfesoresWidget';
import DocumentosWidget from './estudiante/DocumentosWidget';
import PagosWidget from './estudiante/PagosWidget';
import CalificacionesDetalleModal from './estudiante/CalificacionesDetalleModal';
import EvaluacionesDetalleModal from './estudiante/EvaluacionesDetalleModal';
import ProgresoAcademicoDetalleModal from './estudiante/ProgresoAcademicoDetalleModal';
import ProfesoresDetalleModal from './estudiante/ProfesoresDetalleModal';

const EstudianteDashboard = () => {
  const navigate = useNavigate();
  const [estudiante, setEstudiante] = useState(null);
  const [inscripcion, setInscripcion] = useState(null);
  const [grado, setGrado] = useState(null);
  const [seccion, setSeccion] = useState(null);
  const [annoEscolar, setAnnoEscolar] = useState(null);
  const [calificaciones, setCalificaciones] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [mensualidades, setMensualidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showCalificacionesModal, setShowCalificacionesModal] = useState(false);
  const [showEvaluacionesModal, setShowEvaluacionesModal] = useState(false);
  const [showProgresoModal, setShowProgresoModal] = useState(false);
  const [showProfesoresModal, setShowProfesoresModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const userData = JSON.parse(atob(token.split('.')[1]));
        const estudianteID = userData.personaID;

        // Obtener año escolar actual
        const annoResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/anno-escolar/actual`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        if (!annoResponse.data || !annoResponse.data.id) {
          console.error('No se pudo obtener el año escolar actual');
          setError('Error al cargar datos. No se pudo obtener el año escolar actual.');
          setLoading(false);
          return;
        }
        
        const annoEscolarID = annoResponse.data.id;
        setAnnoEscolar(annoResponse.data);

        // Obtener datos del estudiante
        const estudianteResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/personas/${estudianteID}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setEstudiante(estudianteResponse.data);

        // Obtener inscripción actual
        try {
          const inscripcionResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/inscripciones/estudiante/${estudianteID}/actual`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          setInscripcion(inscripcionResponse.data);
        } catch (err) {
          console.log('No se encontró inscripción actual para el estudiante');
        }

        // Obtener grado del estudiante
        try {
          const gradoResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/grados/estudiante/${estudianteID}?annoEscolarID=${annoEscolarID}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          if (gradoResponse.data && gradoResponse.data.length > 0) {
            setGrado(gradoResponse.data[0]);
          }
        } catch (err) {
          console.log('Error al obtener grado del estudiante');
        }

        // Obtener sección del estudiante
        try {
          const seccionResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/secciones/estudiante/${estudianteID}?annoEscolarID=${annoEscolarID}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          if (seccionResponse.data && seccionResponse.data.length > 0) {
            setSeccion(seccionResponse.data[0]);
          }
        } catch (err) {
          console.log('Error al obtener sección del estudiante');
        }

        // Obtener calificaciones del estudiante
        try {
          const calificacionesResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/calificaciones/estudiante/${estudianteID}?annoEscolarID=${annoEscolarID}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          setCalificaciones(calificacionesResponse.data);
        } catch (err) {
          console.log('Error al cargar calificaciones');
        }

        // Obtener evaluaciones del estudiante
        try {
          const evaluacionesResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/evaluaciones/estudiante/${estudianteID}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          setEvaluaciones(evaluacionesResponse.data);
        } catch (err) {
          console.log('Error al cargar evaluaciones');
        }

        // Obtener profesores del estudiante
        try {
          const profesoresResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/personas/estudiante/${estudianteID}/profesores?annoEscolarID=${annoEscolarID}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          setProfesores(profesoresResponse.data);
        } catch (err) {
          console.log('Error al cargar profesores');
        }

        // Obtener documentos del estudiante
        try {
          const documentosResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/documentos/persona/${estudianteID}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          setDocumentos(documentosResponse.data);
        } catch (err) {
          console.log('Error al cargar documentos');
        }

        // Obtener mensualidades del estudiante
        try {
          const mensualidadesResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/mensualidades/estudiante/${estudianteID}?annoEscolarID=${annoEscolarID}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          setMensualidades(mensualidadesResponse.data);
        } catch (err) {
          console.log('Error al cargar mensualidades');
        }

        setLoading(false);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar datos. Por favor, intente nuevamente.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-6xl text-slate-800 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 text-lg">Cargando información...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-600 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-8 animate-fade-in bg-slate-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
              <FaUser className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {estudiante?.nombre} {estudiante?.apellido}
              </h1>
              <p className="text-slate-300">
                Cédula: {estudiante?.cedula}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 text-right">
              <p className="text-slate-300 text-xs uppercase tracking-wider">Año Escolar</p>
              <p className="text-white font-bold text-lg">{annoEscolar?.periodo}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 p-3 rounded-lg transition-colors"
              title="Cerrar Sesión"
            >
              <FaSignOutAlt className="text-xl" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda - Información Académica */}
        <div className="space-y-6 animate-slide-in-left">
          <InfoAcademica 
            grado={grado} 
            seccion={seccion} 
            annoEscolar={annoEscolar}
            inscripcion={inscripcion}
          />
          <DocumentosWidget documentos={documentos} estudianteID={estudiante?.id} />
        </div>

        {/* Columna Central - Calificaciones y Evaluaciones */}
        <div className="space-y-6 animate-fade-in">
          <CalificacionesResumen 
            calificaciones={calificaciones} 
            onVerDetalle={() => setShowCalificacionesModal(true)}
          />
          <ProgresoAcademico 
            calificaciones={calificaciones} 
            onVerDetalle={() => setShowProgresoModal(true)}
          />
          <EvaluacionesWidget 
            evaluaciones={evaluaciones} 
            onVerDetalle={() => setShowEvaluacionesModal(true)}
          />
        </div>

        {/* Columna Derecha - Profesores y Pagos */}
        <div className="space-y-6 animate-slide-in-right">
          <ProfesoresWidget 
            profesores={profesores} 
            onVerDetalle={() => setShowProfesoresModal(true)}
          />
          <PagosWidget mensualidades={mensualidades} />
        </div>
      </div>

      {/* Modales */}
      <CalificacionesDetalleModal
        isOpen={showCalificacionesModal}
        onClose={() => setShowCalificacionesModal(false)}
        calificaciones={calificaciones}
      />

      <EvaluacionesDetalleModal
        isOpen={showEvaluacionesModal}
        onClose={() => setShowEvaluacionesModal(false)}
        evaluaciones={evaluaciones}
      />

      <ProgresoAcademicoDetalleModal
        isOpen={showProgresoModal}
        onClose={() => setShowProgresoModal(false)}
        calificaciones={calificaciones}
      />

      <ProfesoresDetalleModal
        isOpen={showProfesoresModal}
        onClose={() => setShowProfesoresModal(false)}
        profesores={profesores}
      />

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

        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.6s ease-out;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default EstudianteDashboard;
