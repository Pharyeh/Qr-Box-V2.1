import { useContext } from 'react';
import ThemeProvider, { ThemeContext } from './context/ThemeContext';
import Dashboard from './components/panels/Dashboard';

function InnerApp() {
  const { darkMode } = useContext(ThemeContext);

  return (
    <div className={darkMode ? 'bg-[#111827] text-white min-h-screen' : 'bg-gray-100 text-black min-h-screen'}>
      <Dashboard activePanel="dashboard" />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <InnerApp />
    </ThemeProvider>
  );
}
