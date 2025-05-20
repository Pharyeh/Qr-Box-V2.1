import { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';

export default function SettingsPanel() {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

  return (
    <div className="p-4 bg-gray-800 rounded-xl shadow-md text-white">
      <h2 className="text-lg font-semibold mb-4">Settings</h2>
      <div className="flex items-center justify-between">
        <span>Dark Mode</span>
        <button
          onClick={toggleDarkMode}
          className={`px-3 py-1 rounded font-medium ${darkMode ? 'bg-green-500' : 'bg-gray-500'}`}
        >
          {darkMode ? 'ON' : 'OFF'}
        </button>
      </div>
    </div>
  );
}
