
import { createContext, useEffect, useState } from 'react';

export const ThemeContext = createContext();

export default function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('qrbox-dark-mode');
    return stored ? stored === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const toggleDarkMode = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    localStorage.setItem('qrbox-dark-mode', newValue);
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
