import { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';

export default function DashboardShell({ children }) {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

  return (
    <div className={darkMode ? 'bg-[#151a23] text-gray-100 min-h-screen' : 'bg-gray-50 text-gray-900 min-h-screen'}>
      <header className={`${darkMode ? 'bg-[#1f2937] text-white' : 'bg-white text-gray-900'} 
        shadow-md flex items-center justify-between px-6 py-4 border-b border-gray-700 sticky top-0 z-50`}>
        <div className="flex items-center gap-3">
          <img src="/favicon.ico" className="h-8 w-8" alt="QR Box" />
          <div className="flex flex-col">
            <span className="text-2xl font-bold tracking-wide">
              QR Box <span className="text-blue-400">v2.1</span>
            </span>
            <span className="text-xs text-gray-400">Reflex Market Summary — {new Date().toLocaleDateString()}</span>
          </div>
        </div>
        <button
          onClick={toggleDarkMode}
          className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          {darkMode ? '☀ Light Mode' : '🌙 Dark Mode'}
        </button>
      </header>

      <main className="px-4 py-6">
        {children}
      </main>

      <footer className="text-center text-xs text-gray-500 py-6 border-t border-gray-800">
        QR Box — ReflexBox Systems {new Date().getFullYear()}
      </footer>
    </div>
  );
}
