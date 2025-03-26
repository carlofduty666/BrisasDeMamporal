import { useState, useRef } from 'react';
import axios from 'axios';

const TestUpload = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Por favor selecciona un archivo');
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    const formData = new FormData();
    formData.append('testFile', file);
    
    try {
      const response = await axios.post(
        'http://localhost:5000/test/upload-test',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      setResult(response.data);
      console.log('Respuesta del servidor:', response.data);
    } catch (err) {
      console.error('Error al subir archivo:', err);
      setError(err.response?.data?.message || 'Error al subir el archivo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Prueba de Subida de Archivos</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecciona un archivo
          </label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 
              file:mr-4 file:py-2 file:px-4 
              file:rounded-full file:border-0 
              file:text-sm file:font-semibold 
              file:bg-indigo-50 file:text-indigo-700 
              hover:file:bg-indigo-100"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading || !file}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Subiendo...' : 'Subir Archivo'}
        </button>
      </form>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {result && (
        <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md">
          <h3 className="font-medium">Archivo subido correctamente</h3>
          <ul className="mt-2 text-sm">
            <li><strong>Nombre:</strong> {result.file?.name}</li>
            <li><strong>Tamaño:</strong> {Math.round((result.file?.size || 0) / 1024)} KB</li>
            <li><strong>Tipo:</strong> {result.file?.mimetype}</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default TestUpload;
