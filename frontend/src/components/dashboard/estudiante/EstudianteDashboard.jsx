import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSpinner } from 'react-icons/fa';
import InfoAcademica from './InfoAcademica';
import HorariosEstudiante from './HorariosEstudiante';
import ProgresoAcademico from './ProgresoAcademico';
import PagosWidget from './widgets/PagosWidget';

const EstudianteDashboard = () => {
  const [estudiante, setEstudiante] = useState(null);
  const [representante, setRepresentante] = useState(null);
  const [inscripcion, setInscripcion] = useState(null);
  const [grado, setGrado] = useState(null);
  const [seccion, setSeccion] = useState(null);
  const [annoEscolar, setAnnoEscolar] = useState(null);
  const [calificaciones, setCalificaciones] = useState([]);
  const [mensualidades, setMensualidades] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const userData = JSON.parse(atob(token.split('.')[1]));
        const estudianteID = userData.personaID;

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

        const estudianteResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/personas/${estudianteID}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setEstudiante(estudianteResponse.data);

        try {
          const representanteResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/personas/estudiante/${estudianteID}/representante?annoEscolarID=${annoEscolarID}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          setRepresentante(representanteResponse.data);
        } catch (err) {
          console.log('Error al obtener representante del estudiante');
        }

        try {
          const inscripcionResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/inscripciones/estudiante/${estudianteID}/actual`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          setInscripcion(inscripcionResponse.data);
        } catch (err) {
          console.log('No se encontró inscripción actual para el estudiante');
        }

        let gradoData = null;
        let seccionData = null;

        try {
          const gradoResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/grados/estudiante/${estudianteID}?annoEscolarID=${annoEscolarID}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          if (gradoResponse.data && gradoResponse.data.length > 0) {
            gradoData = gradoResponse.data[0];
            setGrado(gradoData);
          }
        } catch (err) {
          console.log('Error al obtener grado del estudiante');
        }

        try {
          const seccionResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/secciones/estudiante/${estudianteID}?annoEscolarID=${annoEscolarID}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          if (seccionResponse.data && seccionResponse.data.length > 0) {
            seccionData = seccionResponse.data[0];
            setSeccion(seccionData);
          }
        } catch (err) {
          console.log('Error al obtener sección del estudiante');
        }

        try {
          const calificacionesResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/calificaciones/estudiante/${estudianteID}?annoEscolarID=${annoEscolarID}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          setCalificaciones(calificacionesResponse.data);
        } catch (err) {
          console.log('Error al cargar calificaciones');
        }

        try {
          const materiasResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/materias`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          setMaterias(materiasResponse.data);
        } catch (err) {
          console.log('Error al cargar materias');
        }

        try {
          const profesoresResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/personas/estudiante/${estudianteID}/profesores?annoEscolarID=${annoEscolarID}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          setProfesores(profesoresResponse.data);
        } catch (err) {
          console.log('Error al cargar profesores');
        }

        if (gradoData && seccionData) {
          try {
            const horariosResponse = await axios.get(
              `${import.meta.env.VITE_API_URL}/horarios/grado/${gradoData.id}/seccion/${seccionData.id}`,
              { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setHorarios(horariosResponse.data.horarios || horariosResponse.data);
          } catch (err) {
            console.log('Error al cargar horarios');
          }
        }

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
      <div className="max-w-7xl mx-auto space-y-6">
        <InfoAcademica 
          grado={grado} 
          seccion={seccion} 
          annoEscolar={annoEscolar}
          inscripcion={inscripcion}
          estudiante={estudiante}
          representante={representante}
        />

        <HorariosEstudiante 
          horarios={horarios} 
          profesores={profesores} 
          materias={materias}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProgresoAcademico 
            calificaciones={calificaciones}
          />
          
          <PagosWidget 
            mensualidades={mensualidades} 
          />
        </div>
      </div>
    </div>
  );
};

export default EstudianteDashboard;
