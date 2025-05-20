import { useState } from 'react';

export default function MobileNav({ darkMode, toggleDarkMode }) {
  const [open, setOpen] = useState(false);

  return (
    <header className={`${darkMode ? 'bg-[#1f2937] text-white' : 'bg-white text-gray-900'} 
      shadow-md px-6 py-4 border-b border-gray-700 sticky top-0 z-50`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/favicon.ico" className="h-8 w-8" alt="QR Box" />
          <div>
            <span className="text-xl font-bold">QR Box <span className="text-blue-400">v2.1</span></span>
            <div className="text-xs text-gray-400">Reflex Market Summary — {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <div className="md:hidden">
          <button onClick={() => setOpen(!open)} className="text-sm text-blue-300 border px-2 py-1 rounded">
            ☰ Menu
          </button>
        </div>

        <div className="hidden md:block">
          <button onClick={toggleDarkMode} className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 transition">
            {darkMode ? '☀ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-4 md:hidden space-y-2">
          <button onClick={toggleDarkMode} className="w-full bg-blue-500 text-white py-2 rounded">
            {darkMode ? '☀ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      )}
    </header>
  );
}
