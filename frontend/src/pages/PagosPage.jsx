import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaMoneyBillWave } from 'react-icons/fa';
import GestionPagos from '../components/pagos/GestionPagos';
import { jwtDecode } from 'jwt-decode';

const PagosPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userType, setUserType] = useState('');
  const [personaID, setPersonaID] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [annoEscolar, setAnnoEscolar] = useState(null);
  
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/login');
          return;
        }
        
        // Decodificar token de forma robusta
        const userData = jwtDecode(token);
        setPersonaID(userData.personaID ?? null);
        
        // Determinar tipo de usuario (acepta 'rol' o 'tipo')
        const rolToken = userData.rol || userData.tipo;
        if (rolToken === 'representante') {
          setUserType('representante');
          
          // Obtener estudiantes del representante
          const estudiantesResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/personas/representante/${userData.personaID}/estudiantes`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          
          setEstudiantes(estudiantesResponse.data || []);
        } else if (rolToken === 'estudiante') {
          setUserType('estudiante');
        } else {
          setUserType('');
        }
        
        // Obtener año escolar actual
        const annoResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/anno-escolar/actual`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        if (annoResponse.data && annoResponse.data.id) {
          setAnnoEscolar(annoResponse.data);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar datos. Por favor, intente nuevamente.');
        setLoading(false);
      }
    };
    
    cargarDatos();
  }, [navigate]);
  
  const handleSuccess = async () => {
    // Recargar datos si es necesario
    try {
      const token = localStorage.getItem('token');
      
      if (userType === 'representante') {
        // Actualizar lista de estudiantes
        const estudiantesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/personas/representante/${personaID}/estudiantes`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        setEstudiantes(estudiantesResponse.data || []);
      }
    } catch (err) {
      console.error('Error al recargar datos:', err);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-2xl font-bold flex items-center">
          <FaMoneyBillWave className="mr-2 text-blue-600" />
          Gestión de Pagos
        </h1>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="spinner"></div>
          <p className="mt-2 text-gray-600">Cargando información...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {error}
        </div>
      ) : (
        <GestionPagos
          userType={userType}
          personaID={personaID}
          estudiantes={estudiantes}
          annoEscolar={annoEscolar}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default PagosPage;