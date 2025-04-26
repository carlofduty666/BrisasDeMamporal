import { 
    FaBook, FaComments, FaGlobe, FaCalculator, FaPalette, 
    FaRunning, FaLanguage, FaLaptop, FaFlask, FaAtom, 
    FaPencilRuler, FaBrain, FaProjectDiagram, FaMoneyBillWave,
  } from 'react-icons/fa';
  import { FaEarthAmericas } from "react-icons/fa6";
  import { GiChemicalDrop } from 'react-icons/gi';
  
  /**
   * Obtiene los estilos visuales para una materia basados en su nombre
   * @param {string} nombreMateria - Nombre de la materia
   * @param {string} variant - Variante de estilo ('card', 'tag', 'icon', 'full')
   * @returns {Object} Objeto con clases CSS y componente de icono
   */
  export const getMateriaStyles = (nombreMateria, variant = 'full') => {
    // Convertir a minúsculas y asegurar que sea string
    const nombre = (nombreMateria || "").toLowerCase();
    
    // Valores por defecto
    let styles = {
      bgColor: "bg-blue-50",
      bgColorDark: "bg-blue-100",
      textColor: "text-blue-700",
      textColorDark: "text-blue-800",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200",
      Icon: FaBook
    };
    
    // Asignar estilos según el nombre de la materia
    if (nombre.includes("comunicacion") || nombre.includes("lengua") || nombre.includes("literatura") || nombre.includes("castellano")) {
      styles = {
        bgColor: "bg-purple-50",
        bgColorDark: "bg-purple-100",
        textColor: "text-purple-700",
        textColorDark: "text-purple-800",
        iconColor: "text-purple-600",
        borderColor: "border-purple-200",
        Icon: FaComments
      };
    } else if (nombre.includes("social") || nombre.includes("ghc") || nombre.includes("historia")) {
      styles = {
        bgColor: "bg-yellow-50",
        bgColorDark: "bg-yellow-100",
        textColor: "text-yellow-700",
        textColorDark: "text-yellow-800",
        iconColor: "text-yellow-600",
        borderColor: "border-yellow-200",
        Icon: FaGlobe
      };
    } else if (nombre.includes("matematica")) {
      styles = {
        bgColor: "bg-blue-50",
        bgColorDark: "bg-blue-100",
        textColor: "text-blue-700",
        textColorDark: "text-blue-800",
        iconColor: "text-blue-600",
        borderColor: "border-blue-200",
        Icon: FaCalculator
      };
    } else if (nombre.includes("arte")) {
      styles = {
        bgColor: "bg-pink-50",
        bgColorDark: "bg-pink-100",
        textColor: "text-pink-700",
        textColorDark: "text-pink-800",
        iconColor: "text-pink-600",
        borderColor: "border-pink-200",
        Icon: FaPalette
      };
    } else if (nombre.includes("educacion fisica")) {
      styles = {
        bgColor: "bg-red-50",
        bgColorDark: "bg-red-100",
        textColor: "text-red-700",
        textColorDark: "text-red-800",
        iconColor: "text-red-600",
        borderColor: "border-red-200",
        Icon: FaRunning
      };
    } else if (nombre.includes("fisica")) {
      styles = {
        bgColor: "bg-cyan-50",
        bgColorDark: "bg-cyan-100",
        textColor: "text-cyan-700",
        textColorDark: "text-cyan-800",
        iconColor: "text-cyan-600",
        borderColor: "border-cyan-200",
        Icon: FaAtom
      };
    } else if (nombre.includes("ingles") || nombre.includes("idioma")) {
      styles = {
        bgColor: "bg-indigo-50",
        bgColorDark: "bg-indigo-100",
        textColor: "text-indigo-700",
        textColorDark: "text-indigo-800",
        iconColor: "text-indigo-600",
        borderColor: "border-indigo-200",
        Icon: FaLanguage
      };
    } else if (nombre.includes("informatica") || nombre.includes("computacion")) {
      styles = {
        bgColor: "bg-lime-50",
        bgColorDark: "bg-lime-100",
        textColor: "text-lime-700",
        textColorDark: "text-lime-800",
        iconColor: "text-lime-600",
        borderColor: "border-lime-200",
        Icon: FaLaptop
      };
    } else if (nombre.includes("ciencia") || nombre.includes("natural") || nombre.includes("biologia")) {
      styles = {
        bgColor: "bg-green-50",
        bgColorDark: "bg-green-100",
        textColor: "text-green-700",
        textColorDark: "text-green-800",
        iconColor: "text-green-600",
        borderColor: "border-green-200",
        Icon: FaEarthAmericas
      };
    } else if (nombre.includes("quimica")) {
      styles = {
        bgColor: "bg-teal-50",
        bgColorDark: "bg-teal-100",
        textColor: "text-teal-700",
        textColorDark: "text-teal-800",
        iconColor: "text-teal-600",
        borderColor: "border-teal-200",
        Icon: GiChemicalDrop
      };
    } else if (nombre.includes("dibujo") || nombre.includes("tecnico")) {
      styles = {
        bgColor: "bg-gray-50",
        bgColorDark: "bg-gray-100",
        textColor: "text-gray-700",
        textColorDark: "text-gray-800",
        iconColor: "text-gray-600",
        borderColor: "border-gray-200",
        Icon: FaPencilRuler
      };
    } else if (nombre.includes("orientacion") || nombre.includes("vocacional") || nombre.includes("psicologia")) {
      styles = {
        bgColor: "bg-orange-50",
        bgColorDark: "bg-orange-100",
        textColor: "text-orange-700",
        textColorDark: "text-orange-800",
        iconColor: "text-orange-600",
        borderColor: "border-orange-200",
        Icon: FaBrain
      };
    } else if (nombre.includes("proyecto")) {
      styles = {
        bgColor: "bg-cyan-50",
        bgColorDark: "bg-cyan-100",
        textColor: "text-cyan-700",
        textColorDark: "text-cyan-800",
        iconColor: "text-cyan-600",
        borderColor: "border-cyan-200",
        Icon: FaProjectDiagram
      };
    } else if (nombre.includes("contabilidad")) {
      styles = {
        bgColor: "bg-emerald-50",
        bgColorDark: "bg-emerald-100",
        textColor: "text-emerald-700",
        textColorDark: "text-emerald-800",
        iconColor: "text-emerald-600",
        borderColor: "border-emerald-200",
        Icon: FaMoneyBillWave
      };
    }
    
    // Retornar solo las propiedades necesarias según la variante solicitada
    switch (variant) {
      case 'card':
        return {
          bgColor: styles.bgColor,
          textColor: styles.textColor,
          iconColor: styles.iconColor,
          bgIconColor: styles.bgColorDark,
          Icon: styles.Icon
        };
      case 'tag':
        return {
          bgColor: styles.bgColorDark,
          textColor: styles.textColorDark,
          Icon: styles.Icon
        };
      case 'icon':
        return {
          iconColor: styles.iconColor,
          Icon: styles.Icon
        };
      case 'full':
      default:
        return styles;
    }
  };
  
  /**
   * Componente para renderizar un icono de materia
   * @param {string} nombreMateria - Nombre de la materia
   * @param {Object} props - Propiedades adicionales para el icono
   * @returns {JSX.Element} Componente de icono
   */
  export const MateriaIcon = ({ nombreMateria, className = "", size = "1em", ...props }) => {
    const { Icon, iconColor } = getMateriaStyles(nombreMateria, 'icon');
    return <Icon className={`${iconColor} ${className}`} size={size} {...props} />;
  };
  
  /**
   * Componente para renderizar una etiqueta de materia
   * @param {string} nombreMateria - Nombre de la materia
   * @param {string} label - Texto a mostrar (si es diferente del nombre)
   * @param {Object} props - Propiedades adicionales
   * @returns {JSX.Element} Componente de etiqueta
   */
  export const MateriaTag = ({ nombreMateria, label, showIcon = true, className = "", ...props }) => {
    const { bgColor, textColor, Icon } = getMateriaStyles(nombreMateria, 'tag');
    return (
      <span 
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor} ${className}`}
        {...props}
      >
        {showIcon && <Icon className="mr-1 h-3 w-3" />}
        {label || nombreMateria}
      </span>
    );
  };
  
  /**
   * Componente para renderizar una tarjeta de materia
   * @param {Object} materia - Objeto con datos de la materia
   * @param {Function} onDetails - Función para mostrar detalles
   * @param {string} detailsUrl - URL para ver detalles
   * @returns {JSX.Element} Componente de tarjeta
   */
  export const MateriaCard = ({ materia, onDetails, detailsUrl }) => {
    const nombreMateria = materia.nombre || materia.asignatura || "";
    const { bgColor, textColor, iconColor, bgIconColor, Icon } = getMateriaStyles(nombreMateria, 'card');
    
    return (
      <div className={`${bgColor} p-3 rounded-md shadow-sm hover:shadow-md transition-shadow duration-200`}>
        <div className="flex items-center">
          <div className={`p-2 rounded-full ${bgIconColor} mr-3`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${textColor} truncate`}>
              {nombreMateria}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {materia.codigo || `Código: ${materia.id}`}
            </p>
          </div>
        </div>
        
        <div className="mt-3 flex justify-between items-center">
          {onDetails && (
            <button
              onClick={() => onDetails(materia)}
              className={`text-xs font-medium ${textColor} hover:underline flex items-center`}
            >
              <FaChartBar className="mr-1" /> Estadísticas
            </button>
          )}
          {detailsUrl && (
            <a
              href={detailsUrl}
              className={`text-xs font-medium ${textColor} hover:underline flex items-center`}
            >
              <FaEye className="mr-1" /> Detalles
            </a>
          )}
        </div>
      </div>
    );
  };
  