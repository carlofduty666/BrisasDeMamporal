import { useState } from 'react';
import { FaBook, FaClipboardList, FaUsers } from 'react-icons/fa';

const MateriasList = ({ materias, annoEscolarID, onMateriaSelect }) => {
  const [expandedMateria, setExpandedMateria] = useState(null);

  const handleMateriaClick = (materia) => {
    if (expandedMateria === materia.id) {
      setExpandedMateria(null);
    } else {
      setExpandedMateria(materia.id);
      onMateriaSelect(materia);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Mis Materias</h2>
      
      {materias.length === 0 ? (
        <div className="bg-yellow-50 p-4 rounded-md">
          <p className="text-yellow-700">No tiene materias asignadas para este año escolar.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {materias.map((materia) => (
            <div key={materia.id} className="border rounded-lg overflow-hidden">
              <div 
                className={`p-4 cursor-pointer flex justify-between items-center ${
                  expandedMateria === materia.id ? 'bg-indigo-50' : 'bg-gray-50'
                }`}
                onClick={() => handleMateriaClick(materia)}
              >
                <div className="flex items-center">
                  <FaBook className="text-indigo-600 mr-3" />
                  <h3 className="text-lg font-medium text-gray-900">{materia.asignatura}</h3>
                </div>
                <div className="flex items-center">
                  <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium mr-2">
                    {materia.grados?.length || 0} grados
                  </span>
                  <span className="text-gray-500 text-sm">
                    {expandedMateria === materia.id ? '▼' : '▶'}
                  </span>
                </div>
              </div>
              
              {expandedMateria === materia.id && (
                <div className="p-4 bg-white">
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Descripción</h4>
                    <p className="text-sm text-gray-600">{materia.descripcion || 'Sin descripción'}</p>
                  </div>
                  
                  {materia.grados && materia.grados.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Grados donde imparte esta materia</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {materia.grados.map((grado) => (
                          <div key={grado.id} className="p-3 bg-gray-50 rounded-md">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <FaChalkboardTeacher className="text-indigo-500 mr-2" />
                                <span className="text-gray-900">{grado.nombre_grado}</span>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  className="text-indigo-600 hover:text-indigo-900 focus:outline-none flex items-center"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Navegar a evaluaciones de esta materia para este grado
                                  }}
                                >
                                  <FaClipboardList className="mr-1" />
                                  <span className="text-xs">Evaluaciones</span>
                                </button>
                                <button
                                  className="text-green-600 hover:text-green-900 focus:outline-none flex items-center"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Navegar a estudiantes de este grado para esta materia
                                  }}
                                >
                                  <FaUsers className="mr-1" />
                                  <span className="text-xs">Estudiantes</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MateriasList;
