import React, { createContext, useContext, useState } from 'react';

// Definimos los temas disponibles con sus variantes de color
const colorThemes = {
  blue: {
    50: 'bg-blue-50',
    100: 'bg-blue-100',
    500: 'bg-blue-500',
    600: 'bg-blue-600',
    700: 'bg-blue-700',
    text50: 'text-blue-50',
    text100: 'text-blue-100',
    text500: 'text-blue-500',
    text600: 'text-blue-600',
    text700: 'text-blue-700',
    text800: 'text-blue-800',
    border300: 'border-blue-300',
    hover50: 'hover:bg-blue-50',
    hover700: 'hover:bg-blue-700',
    hoverText500: 'hover:text-blue-500',
    hoverText800: 'hover:text-blue-800',
    focusRing: 'focus:ring-blue-500',
    focusBorder: 'focus:border-blue-500',
  },
  red: {
    50: 'bg-red-50',
    100: 'bg-red-100',
    500: 'bg-red-500',
    600: 'bg-red-600',
    700: 'bg-red-700',
    text50: 'text-red-50',
    text100: 'text-red-100',
    text500: 'text-red-500',
    text600: 'text-red-600',
    text700: 'text-red-700',
    text800: 'text-red-800',
    border300: 'border-red-300',
    hover50: 'hover:bg-red-50',
    hover700: 'hover:bg-red-700',
    hoverText500: 'hover:text-red-500',
    hoverText800: 'hover:text-red-800',
    focusRing: 'focus:ring-red-500',
    focusBorder: 'focus:border-red-500',
  },
  green: {
    50: 'bg-green-50',
    100: 'bg-green-100',
    500: 'bg-green-500',
    600: 'bg-green-600',
    700: 'bg-green-700',
    text50: 'text-green-50',
    text100: 'text-green-100',
    text500: 'text-green-500',
    text600: 'text-green-600',
    text700: 'text-green-700',
    text800: 'text-green-800',
    border300: 'border-green-300',
    hover50: 'hover:bg-green-50',
    hover700: 'hover:bg-green-700',
    hoverText500: 'hover:text-green-500',
    hoverText800: 'hover:text-green-800',
    focusRing: 'focus:ring-green-500',
    focusBorder: 'focus:border-green-500',
  },
  // Puedes agregar más colores según sea necesario
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('blue');

  const theme = colorThemes[currentTheme];

  const setTheme = (color) => {
    if (colorThemes[color]) {
      setCurrentTheme(color);
    } else {
      console.warn(`Theme color "${color}" not found. Using default.`);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, currentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
