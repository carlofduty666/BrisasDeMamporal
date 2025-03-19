import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  header: {
    marginBottom: 20,
    padding: 10,
    borderBottom: 1,
    borderBottomColor: '#112246',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#112246',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  section: {
    margin: 10,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 5,
    paddingTop: 5,
  },
  column: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    color: '#666666',
  },
  value: {
    fontSize: 12,
  },
  footer: {
    marginTop: 30,
    padding: 10,
    borderTop: 1,
    borderTopColor: '#112246',
  },
  footerText: {
    fontSize: 10,
    textAlign: 'center',
  },
  signature: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureLine: {
    width: 150,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    marginHorizontal: 'auto',
  },
  signatureText: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 5,
  },
});

// Componente PDF para el comprobante
const ComprobantePDF = ({ inscripcion, estudiante, representante }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Image
          style={styles.logo}
          src="/logo.png" // Asegúrate de tener este archivo en tu carpeta public
        />
        <View>
          <Text style={styles.title}>Brisas De Mamporal</Text>
          <Text style={styles.subtitle}>Comprobante de Inscripción</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información de la Inscripción</Text>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Número de Inscripción</Text>
            <Text style={styles.value}>{inscripcion.id}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Fecha de Inscripción</Text>
            <Text style={styles.value}>{new Date(inscripcion.fechaInscripcion).toLocaleDateString()}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Estado</Text>
            <Text style={styles.value}>{inscripcion.estado}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Datos del Estudiante</Text>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Cédula</Text>
            <Text style={styles.value}>{estudiante.cedula}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Nombres</Text>
            <Text style={styles.value}>{estudiante.nombres}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Apellidos</Text>
            <Text style={styles.value}>{estudiante.apellidos}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Fecha de Nacimiento</Text>
            <Text style={styles.value}>{new Date(estudiante.fechaNacimiento).toLocaleDateString()}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Género</Text>
            <Text style={styles.value}>{estudiante.genero}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Grado a Cursar</Text>
            <Text style={styles.value}>{inscripcion.grado}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Datos del Representante</Text>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Cédula</Text>
            <Text style={styles.value}>{representante.cedula}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Nombres</Text>
            <Text style={styles.value}>{representante.nombres}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Apellidos</Text>
            <Text style={styles.value}>{representante.apellidos}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Correo Electrónico</Text>
            <Text style={styles.value}>{representante.email}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Teléfono</Text>
            <Text style={styles.value}>{representante.telefono}</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Este comprobante debe ser presentado en la institución para su firma y validación.
          La inscripción está sujeta a revisión y aprobación por parte de la administración.
        </Text>
      </View>

      <View style={styles.signature}>
        <View>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureText}>Firma del Representante</Text>
        </View>
        <View>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureText}>Firma y Sello de la Institución</Text>
        </View>
      </View>
    </Page>
  </Document>
);

const ComprobanteInscripcion = () => {
  const { inscripcionId } = useParams();
  const navigate = useNavigate();
  const [inscripcion, setInscripcion] = useState(null);
  const [estudiante, setEstudiante] = useState(null);
  const [representante, setRepresentante] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const comprobanteRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        const response = await axios.get(`/api/inscripcion/comprobante/${inscripcionId}`, config);
        
        setInscripcion(response.data.inscripcion);
        setEstudiante(response.data.estudiante);
        setRepresentante(response.data.representante);
      } catch (err) {
        setError('Error al cargar el comprobante. Por favor, inténtelo de nuevo.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [inscripcionId]);

  const handleDownloadPDF = () => {
    const input = comprobanteRef.current;
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`comprobante_inscripcion_${inscripcionId}.pdf`);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Cargando...</span>
          </div>
          <p className="mt-2">Generando comprobante...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
          <button
            onClick={() => navigate('/dashboard/representante')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!inscripcion || !estudiante || !representante) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">No se encontró la información del comprobante.</span>
          </div>
          <button
            onClick={() => navigate('/dashboard/representante')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h2 className="text-lg leading-6 font-medium text-gray-900">
                Comprobante de Inscripción
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Inscripción #{inscripcionId} - {new Date(inscripcion.fechaInscripcion).toLocaleDateString()}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleDownloadPDF}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Descargar PDF
              </button>
              <PDFDownloadLink
                document={<ComprobantePDF inscripcion={inscripcion} estudiante={estudiante} representante={representante} />}
                fileName={`comprobante_inscripcion_${inscripcionId}.pdf`}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {({ loading }) => (loading ? 'Generando documento...' : 'Descargar Comprobante Oficial')}
              </PDFDownloadLink>
            </div>
          </div>

          <div ref={comprobanteRef} className="border-t border-gray-200">
            <div className="px-4 py-5 sm:px-6 text-center border-b border-gray-200">
              <h1 className="text-2xl font-bold text-indigo-600">Brisas De Mamporal</h1>
              <p className="text-lg font-medium">Comprobante de Inscripción</p>
            </div>

            <div className="px-4 py-5 sm:p-6">
              <div className="mb-8">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Información de la Inscripción
                </h3>
                <div className="bg-gray-50 p-4 rounded-md grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Número de Inscripción</p>
                    <p className="mt-1 text-sm text-gray-900">{inscripcion.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Fecha de Inscripción</p>
                    <p className="mt-1 text-sm text-gray-900">{new Date(inscripcion.fechaInscripcion).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Estado</p>
                    <p className="mt-1 text-sm text-gray-900">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        inscripcion.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                        inscripcion.estado === 'Aprobado' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {inscripcion.estado}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Datos del Estudiante
                </h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Cédula</dt>
                      <dd className="mt-1 text-sm text-gray-900">{estudiante.cedula}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Nombres</dt>
                      <dd className="mt-1 text-sm text-gray-900">{estudiante.nombres}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Apellidos</dt>
                      <dd className="mt-1 text-sm text-gray-900">{estudiante.apellidos}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Fecha de Nacimiento</dt>
                      <dd className="mt-1 text-sm text-gray-900">{new Date(estudiante.fechaNacimiento).toLocaleDateString()}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Género</dt>
                      <dd className="mt-1 text-sm text-gray-900">{estudiante.genero}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Grado a Cursar</dt>
                      <dd className="mt-1 text-sm text-gray-900">{inscripcion.grado}</dd>
                    </div>
                    <div className="sm:col-span-3">
                      <dt className="text-sm font-medium text-gray-500">Dirección</dt>
                      <dd className="mt-1 text-sm text-gray-900">{estudiante.direccion}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Datos del Representante
                </h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Cédula</dt>
                      <dd className="mt-1 text-sm text-gray-900">{representante.cedula}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Nombres</dt>
                      <dd className="mt-1 text-sm text-gray-900">{representante.nombres}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Apellidos</dt>
                      <dd className="mt-1 text-sm text-gray-900">{representante.apellidos}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Correo Electrónico</dt>
                      <dd className="mt-1 text-sm text-gray-900">{representante.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
                      <dd className="mt-1 text-sm text-gray-900">{representante.telefono}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="mt-10 pt-10 border-t border-gray-200">
                <p className="text-sm text-gray-500 text-center">
                  Este comprobante debe ser presentado en la institución para su firma y validación.
                  La inscripción está sujeta a revisión y aprobación por parte de la administración.
                </p>

                <div className="mt-10 grid grid-cols-2 gap-x-10">
                  <div className="text-center">
                    <div className="mt-2 pt-10 border-t border-gray-300">
                      <p className="text-sm font-medium">Firma del Representante</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="mt-2 pt-10 border-t border-gray-300">
                      <p className="text-sm font-medium">Firma y Sello de la Institución</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <button
              onClick={() => navigate('/dashboard/representante')}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComprobanteInscripcion;
