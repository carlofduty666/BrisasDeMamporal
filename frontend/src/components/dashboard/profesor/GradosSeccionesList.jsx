import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaChalkboardTeacher, FaUsers, FaEye } from 'react-icons/fa';

const GradosSeccionesList = ({ grados, annoEscolarID, onGradoSelect, onSeccionSelect }) => {
  const [expandedGrado, setExpandedGrado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGradoClick = (grado) => {
    if (expandedGrado === grado.id) {
      setExpandedGrado(null);
    } else {
      setExpandedGrado(grado.id);
      onGradoSelect(grado);
    }
  };

  const handleSeccionClick = (seccion) => {
    onSeccionSelect(seccion);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Mis Grados y Secciones</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : grados.length === 0 ? (
        <div className="bg-yellow-50 p-4 rounded-md">
          <p className="text-yellow-700">No tiene grados asignados para este año escolar.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {grados.map((grado) => (
            <div key={grado.id} className="border rounded-lg overflow-hidden">
              <div 
                className={`p-4 cursor-pointer flex justify-between items-center ${
                  expandedGrado === grado.id ? 'bg-indigo-50' : 'bg-gray-50'
                }`}
                onClick={() => handleGradoClick(grado)}
              >
                <div className="flex items-center">
                  <FaChalkboardTeacher className="text-indigo-600 mr-3" />
                  <h3 className="text-lg font-medium text-gray-900">{grado.nombre_grado}</h3>
                </div>
                <div className="flex items-center">
                  <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium mr-2">
                    {grado.secciones?.length || 0} secciones
                  </span>
                  <span className="text-gray-500 text-sm">
                    {expandedGrado === grado.id ? '▼' : '▶'}
                  </span>
                </div>
              </div>
              
              {expandedGrado === grado.id && grado.secciones && (
                <div className="p-4 bg-white">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Secciones</h4>
                  <div className="space-y-2">
                    {grado.secciones.map((seccion) => (
                      <div 
                        key={seccion.id}
                        className="p-3 bg-gray-50 rounded-md flex justify-between items-center cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSeccionClick(seccion)}
                      >
                        <div className="flex items-center">
                          <FaUsers className="text-indigo-500 mr-2" />
                          <span className="text-gray-900">{seccion.nombre_seccion}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium mr-2">
                            {seccion.estudiantes_count || 0} estudiantes
                          </span>
                          <button
                            className="text-indigo-600 hover:text-indigo-900 focus:outline-none"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSeccionClick(seccion);
                            }}
                          >
                            <FaEye />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GradosSeccionesList;
