import { useTheme } from '../context/ThemeContext';

export const useThemedClasses = () => {
  const { theme } = useTheme();

  // Esta función toma una clase base (por ejemplo, 'bg-indigo-500') y devuelve la clase equivalente en el tema actual
  const getThemedClass = (baseClass) => {
    // Extraer el tipo y la intensidad de la clase
    if (baseClass.includes(`-${currentTheme}-`)) {
        return baseClass;
      }
      
      // Busca cualquier clase de color y reemplázala
      const colorMatch = baseClass.match(/(bg|text|border|hover:bg|hover:text|focus:ring|focus:border)-(indigo|red|blue|green)-(\d+)/);
      
      if (!colorMatch) return baseClass;
      
      const [, type, , intensity] = colorMatch;
    
    // Mapear el tipo de clase a la propiedad correspondiente en el tema
    let themeProperty;
    switch (type) {
      case 'bg':
        themeProperty = intensity;
        break;
      case 'text':
        themeProperty = `text${intensity}`;
        break;
      case 'border':
        themeProperty = `border${intensity}`;
        break;
      case 'hover:bg':
        themeProperty = `hover${intensity}`;
        break;
      case 'hover:text':
        themeProperty = `hoverText${intensity}`;
        break;
      case 'focus:ring':
        themeProperty = 'focusRing';
        break;
      case 'focus:border':
        themeProperty = 'focusBorder';
        break;
      default:
        return baseClass;
    }
    
    // Devolver la clase del tema si existe, o la clase original si no
    return theme[themeProperty] || baseClass;
  };

  // Esta función toma un string de clases y reemplaza todas las clases de color indigo
  const themedClasses = (classString) => {
    if (!classString) return '';
    
    return classString.split(' ')
      .map(cls => getThemedClass(cls))
      .join(' ');
  };

  return { themedClasses };
};
