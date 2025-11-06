import React, { useState } from 'react';
import {
  FaKey,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaSpinner
} from 'react-icons/fa';

const ModalRestablecerPassword = ({
  isOpen,
  usuario,
  loading,
  onClose,
  onGeneratePassword,
  onSubmit
}) => {
  const [passwordNueva, setPasswordNueva] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const handleGenerarPassword = () => {
    const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-2).toUpperCase();
    setPasswordNueva(password);
    onGeneratePassword?.(password);
  };

  const handleSubmit = async () => {
    await onSubmit(passwordNueva);
    setPasswordNueva('');
    setMostrarPassword(false);
  };

  const handleClose = () => {
    setPasswordNueva('');
    setMostrarPassword(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-50 rounded-xl">
            <FaKey className="w-6 h-6 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Restablecer Contraseña</h2>
        </div>

        {usuario && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Usuario:</p>
            <p className="font-semibold text-gray-900">
              {usuario.persona?.nombre} {usuario.persona?.apellido}
            </p>
            <p className="text-sm text-gray-600">{usuario.email}</p>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nueva Contraseña
          </label>
          <div className="relative">
            <input
              type={mostrarPassword ? 'text' : 'password'}
              value={passwordNueva}
              onChange={(e) => setPasswordNueva(e.target.value)}
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
              placeholder="Ingresa la nueva contraseña"
            />
            <button
              onClick={() => setMostrarPassword(!mostrarPassword)}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              {mostrarPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <button
          onClick={handleGenerarPassword}
          className="w-full mb-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors duration-200"
        >
          Generar Contraseña Temporal
        </button>

        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !passwordNueva.trim()}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg hover:from-amber-700 hover:to-amber-800 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <FaSpinner className="w-4 h-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <FaCheck className="w-4 h-4" />
                Restablecer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalRestablecerPassword;