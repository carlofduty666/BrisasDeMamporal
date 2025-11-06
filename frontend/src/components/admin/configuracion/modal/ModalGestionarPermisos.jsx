import React, { useState } from 'react';
import {
  FaSpinner,
  FaCheck,
  FaPencilRuler,
  FaRegEye
} from 'react-icons/fa';
import { FaShield } from "react-icons/fa6";
import { MdManageSearch } from "react-icons/md";
import { VscServerProcess } from "react-icons/vsc";
import { GiArchiveRegister } from "react-icons/gi";
import { LiaExchangeAltSolid } from "react-icons/lia";
import { formatearNombrePermiso, obtenerTipoPermiso } from '../../../../utils/formatters';

const ModalGestionarPermisos = ({
  isOpen,
  usuario,
  permisos,
  permisosSeleccionados,
  loading,
  onClose,
  onTogglePermiso,
  onSubmit
}) => {
  if (!isOpen) return null;

  // Función para obtener el icono según el tipo de permiso
  const getIconoPermiso = (nombrePermiso) => {
    const tipo = obtenerTipoPermiso(nombrePermiso);
    const className = "w-5 h-5";
    
    switch (tipo) {
      case 'editar':
        return <FaPencilRuler className={className} />;
      case 'ver':
        return <FaRegEye className={className} />;
      case 'gestionar':
        return <MdManageSearch className={className} />;
      case 'procesar':
        return <VscServerProcess className={className} />;
      case 'crear':
        return <GiArchiveRegister className={className} />;
      case 'cambiar':
        return <LiaExchangeAltSolid className={className} />;
      default:
        return <FaShield className={className} />;
    }
  };

  // Obtener color según el tipo de permiso
  const getColorPermiso = (nombrePermiso) => {
    const tipo = obtenerTipoPermiso(nombrePermiso);
    
    switch (tipo) {
      case 'editar':
        return { icon: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', hover: 'hover:bg-amber-100' };
      case 'ver':
        return { icon: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', hover: 'hover:bg-blue-100' };
      case 'gestionar':
        return { icon: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', hover: 'hover:bg-purple-100' };
      case 'procesar':
        return { icon: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', hover: 'hover:bg-green-100' };
      case 'crear':
        return { icon: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', hover: 'hover:bg-indigo-100' };
      case 'cambiar':
        return { icon: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', hover: 'hover:bg-rose-100' };
      default:
        return { icon: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', hover: 'hover:bg-gray-100' };
    }
  };

  // Agrupar permisos por categoría
  const permisosAgrupados = {};
  permisos.forEach(permiso => {
    const categoria = permiso.categoria || 'General';
    if (!permisosAgrupados[categoria]) {
      permisosAgrupados[categoria] = [];
    }
    permisosAgrupados[categoria].push(permiso);
  });

  const categorias = Object.keys(permisosAgrupados).sort();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 animate-slideUp">
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
          .animate-slideUp {
            animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          .permiso-item {
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          .permiso-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          .permiso-item input:checked + div {
            opacity: 1;
          }
          .permiso-item input:not(:checked) + div {
            opacity: 0.7;
          }
        `}</style>
        
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-100 rounded-xl transform transition-transform duration-300 hover:scale-110">
              <FaShield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Gestionar Permisos</h2>
              <p className="text-sm text-gray-600 mt-1">
                {usuario?.persona?.nombre} {usuario?.persona?.apellido}
              </p>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {categorias.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No hay permisos disponibles</p>
            </div>
          ) : (
            <div className="space-y-6">
              {categorias.map((categoria, catIdx) => (
                <div 
                  key={categoria} 
                  className="border border-gray-200 rounded-xl p-4 bg-gradient-to-br from-gray-50 to-white transition-all duration-300 hover:shadow-md"
                  style={{
                    animation: `slideUp 0.5s ease-out ${catIdx * 0.1}s both`
                  }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-3 h-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full animate-pulse"></span>
                    {categoria}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {permisosAgrupados[categoria].map(permiso => {
                      const colors = getColorPermiso(permiso.nombre);
                      const isChecked = permisosSeleccionados.has(permiso.id);
                      
                      return (
                        <label
                          key={permiso.id}
                          className={`permiso-item flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${colors.bg} ${colors.border} ${colors.hover} ${isChecked ? 'ring-2 ring-offset-1 ring-' + colors.icon.split('-')[1] + '-400' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => onTogglePermiso(permiso.id)}
                            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer flex-shrink-0 mt-1 transition-all duration-200"
                          />
                          <div className={`flex-1 transition-opacity duration-300 ${isChecked ? 'opacity-100' : 'opacity-80'}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`${colors.icon} transition-transform duration-300 transform ${isChecked ? 'scale-110' : 'scale-100'}`}>
                                {getIconoPermiso(permiso.nombre)}
                              </span>
                              <p className="font-semibold text-gray-900 text-sm">
                                {formatearNombrePermiso(permiso.nombre)}
                              </p>
                            </div>
                            <p className="text-xs text-gray-600 pl-7">{permiso.descripcion}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent border-t border-gray-200 px-6 py-4 flex gap-3 backdrop-blur-sm">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 hover:border-gray-400 font-medium transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            Cancelar
          </button>
          <button
            onClick={onSubmit}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <>
                <FaSpinner className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <FaCheck className="w-4 h-4" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalGestionarPermisos;