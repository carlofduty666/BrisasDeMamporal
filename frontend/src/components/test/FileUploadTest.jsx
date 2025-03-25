import React, { useState, useRef } from 'react';
import axios from 'axios';

const FileUploadTest = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);
  
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setMessage('Por favor selecciona un archivo');
      return;
    }
    
    const formData = new FormData();
    formData.append('testFile', file);
    formData.append('testField', 'Valor de prueba');
    
    try {
      setLoading(true);
      setMessage('');
      
      const response = await axios.post(
        'http://localhost:5000/api/test/upload-test',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      setMessage(`Archivo subido correctamente: ${response.data.file.filename}`);
    } catch (error) {
      console.error('Error al subir archivo:', error);
      setMessage(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Prueba de Subida de Archivos</h1>
      
      <form ref={formRef} onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Selecciona un archivo:
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading || !file}
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-300"
        >
          {loading ? 'Subiendo...' : 'Subir Archivo'}
        </button>
      </form>
      
      {message && (
        <div className={`mt-4 p-3 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default FileUploadTest;
